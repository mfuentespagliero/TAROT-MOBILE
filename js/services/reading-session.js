import { APP_CONFIG } from "../config.js";

const STORAGE_KEY = `${APP_CONFIG.storagePrefix}:readingSession`;
export let readingSession = null;

export function createReadingSession(spread) {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `reading-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    createdAt: new Date().toISOString(),
    spreadId: spread.id,
    category: spread.category,
    deckId: "",
    question: "",
    querentName: "",
    otherPersonName: "",
    relationship: "",
    context: "",
    topic: "",
    options: { a: "", b: "" },
    predictionPeriod: "",
    moonPhase: "",
    cardAmount: spread.cardCount,
    positions: spread.positions.map(position => position.name),
    useReversed: spread.allowsReversed,
    reversedProbability: 0.3,
    soundEnabled: false,
    hasShuffled: false,
    revealedCount: 0,
    selectionMethod: "",
    selectedCards: [],
    status: "deck"
  };
}

export function loadReadingSession(spread) {
  try {
    const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    if (stored?.spreadId === spread.id) { readingSession = { ...createReadingSession(spread), ...stored, options: { a:"", b:"", ...stored.options } }; return readingSession; }
  } catch (error) {
    console.warn("[Arcana] No fue posible recuperar la sesión local.", error);
  }
  readingSession = createReadingSession(spread);
  return readingSession;
}

export function saveReadingSession(session) {
  readingSession = session;
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session)); }
  catch (error) { console.warn("[Arcana] No fue posible guardar la sesión local.", error); }
  return session;
}

export function clearReadingSession() {
  readingSession = null;
  try { sessionStorage.removeItem(STORAGE_KEY); }
  catch (error) { console.warn("[Arcana] No fue posible limpiar la sesión local.", error); }
}
