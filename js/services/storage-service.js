import { APP_CONFIG } from "../config.js";

export const STORAGE_DATA_VERSION = 1;
const STORAGE_KEY = `${APP_CONFIG.storagePrefix}:localData`;
const LEGACY_HISTORY_KEY = `${APP_CONFIG.storagePrefix}:history`;
const emptyState = () => ({ version:STORAGE_DATA_VERSION, readings:[], preferences:{}, dailyCard:null });

function migrateState(value) {
  if (Array.isArray(value)) return { ...emptyState(), readings:value.map(migrateReading) };
  if (!value || typeof value !== "object") return emptyState();
  const version = Number(value.version || 0);
  if (version <= 1) return {
    version:STORAGE_DATA_VERSION,
    readings:Array.isArray(value.readings) ? value.readings.map(migrateReading).filter(Boolean) : [],
    preferences:value.preferences && typeof value.preferences === "object" ? value.preferences : {},
    dailyCard:value.dailyCard && typeof value.dailyCard === "object" ? value.dailyCard : null
  };
  return emptyState();
}

function migrateReading(reading) {
  if (!reading?.id) return null;
  return { favorite:false, dataVersion:STORAGE_DATA_VERSION, ...reading, favorite:Boolean(reading.favorite), dataVersion:STORAGE_DATA_VERSION };
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateState(JSON.parse(raw));
    const legacy = localStorage.getItem(LEGACY_HISTORY_KEY);
    return legacy ? migrateState(JSON.parse(legacy)) : emptyState();
  } catch (error) {
    console.warn("[Arcana] Los datos locales no pudieron leerse y se usarán valores seguros.",error);
    return emptyState();
  }
}

function writeState(state) {
  try {
    localStorage.setItem(STORAGE_KEY,JSON.stringify({ ...state, version:STORAGE_DATA_VERSION }));
    return { ok:true, error:null };
  } catch (error) {
    const full = error?.name === "QuotaExceededError";
    console.warn(full ? "[Arcana] El almacenamiento local está lleno." : "[Arcana] No fue posible guardar los datos locales.",error);
    return { ok:false, error:full ? "storage-full" : "storage-unavailable" };
  }
}

export function saveReading(reading) {
  const state = readState();
  const current = state.readings.find(item => item.id === reading?.id);
  const normalized = migrateReading({ ...reading, favorite:reading?.favorite ?? current?.favorite ?? false });
  if (!normalized) return { ok:false, error:"invalid-reading", reading:null };
  const readings = [normalized,...state.readings.filter(item => item.id !== normalized.id)];
  const result = writeState({ ...state, readings });
  return { ...result, reading:result.ok ? normalized : null };
}

export function getHistory() { return readState().readings.slice().sort((a,b) => new Date(b.date ?? b.createdAt) - new Date(a.date ?? a.createdAt)); }
export function openReading(id) { return getHistory().find(reading => reading.id === id) ?? null; }

export function deleteReading(id) {
  const state = readState();
  if (!state.readings.some(reading => reading.id === id)) return { ok:true, removed:false };
  const result = writeState({ ...state, readings:state.readings.filter(reading => reading.id !== id) });
  return { ...result, removed:result.ok };
}

export function clearHistory() {
  const state = readState();
  const result = writeState({ ...state, readings:[] });
  return { ...result, removed:result.ok ? state.readings.length : 0 };
}

export function setFavorite(id,favorite = true) {
  const state = readState();
  const target = state.readings.find(reading => reading.id === id);
  if (!target) return { ok:false, error:"not-found", reading:null };
  const updated = { ...target, favorite:Boolean(favorite) };
  const result = writeState({ ...state, readings:state.readings.map(reading => reading.id === id ? updated : reading) });
  return { ...result, reading:result.ok ? updated : null };
}

export function removeFavorite(id) { return setFavorite(id,false); }
export function getPreferences() { return { ...readState().preferences }; }
export function savePreferences(preferences) {
  const state = readState();
  const value = { ...state.preferences, ...preferences };
  const result = writeState({ ...state, preferences:value });
  return { ...result, preferences:result.ok ? value : state.preferences };
}

export function getLearningProgress() {
  const learning=getPreferences().learning??{};
  return { lessons:[...new Set(learning.lessons??[])], studied:[...new Set(learning.studied??[])], difficult:[...new Set(learning.difficult??[])], practices:[...new Set(learning.practices??[])] };
}
export function saveLearningProgress(patch) {
  const current=getLearningProgress();
  const learning={...current,...patch};
  Object.keys(learning).forEach(key=>{if(Array.isArray(learning[key]))learning[key]=[...new Set(learning[key])];});
  const result=savePreferences({learning});
  return {...result,learning:result.ok?learning:current};
}

export function getDailyCard() { const dailyCard=readState().dailyCard; return dailyCard ? { ...dailyCard } : null; }
export function saveDailyCard(dailyCard) {
  const state = readState();
  const value = dailyCard && typeof dailyCard === "object" ? { ...dailyCard, dataVersion:STORAGE_DATA_VERSION } : null;
  const result = writeState({ ...state, dailyCard:value });
  return { ...result, dailyCard:result.ok ? value : state.dailyCard };
}

export function migrateStorage() {
  try{const raw=localStorage.getItem(STORAGE_KEY);if(raw&&Number(JSON.parse(raw)?.version)===STORAGE_DATA_VERSION&&!localStorage.getItem(LEGACY_HISTORY_KEY))return{ok:true,error:null,migrated:false};}catch{}
  const state = readState();
  const result = writeState(state);
  if (result.ok) { try { localStorage.removeItem(LEGACY_HISTORY_KEY); } catch {} }
  return {...result,migrated:result.ok};
}

export function clearAllLocalData(){
  try{for(let index=localStorage.length-1;index>=0;index--){const key=localStorage.key(index);if(key?.startsWith(`${APP_CONFIG.storagePrefix}:`))localStorage.removeItem(key);}for(let index=sessionStorage.length-1;index>=0;index--){const key=sessionStorage.key(index);if(key?.startsWith(`${APP_CONFIG.storagePrefix}:`))sessionStorage.removeItem(key);}return{ok:true};}
  catch(error){console.warn("[Arcana] No fue posible borrar todos los datos locales.",error);return{ok:false,error:"storage-unavailable"};}
}
