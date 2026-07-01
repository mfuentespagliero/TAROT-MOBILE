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
    twoCardLayout: spread.id === "dos-cartas" ? "Situación y consejo" : "",
    yesNoCardCount: spread.id === "si-o-no" ? "1 carta" : "",
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
    if (stored?.spreadId === spread.id) {
      const base=createReadingSession(spread),validStatuses=new Set(["deck","form","summary","shuffling","selection","reveal","result"]);
      readingSession={...base,...stored,options:{a:"",b:"",...stored.options},positions:Array.isArray(stored.positions)?stored.positions:base.positions,selectedCards:Array.isArray(stored.selectedCards)?stored.selectedCards:[]};
      if(!validStatuses.has(readingSession.status))readingSession={...readingSession,status:"deck",recoveryNotice:"La etapa guardada no era válida. Reiniciamos la preparación de forma segura."};
      if(["reveal","result"].includes(readingSession.status)&&readingSession.selectedCards.length!==readingSession.cardAmount)readingSession={...readingSession,status:readingSession.deckId?"summary":"deck",selectedCards:[],revealedCount:0,recoveryNotice:"Faltaban datos de las cartas. Conservamos tu consulta y volvimos al último paso seguro."};
      return readingSession;
    }
  } catch (error) {
    console.warn("[Arcana] No fue posible recuperar la sesión local.", error);
    readingSession={...createReadingSession(spread),recoveryNotice:"La sesión anterior estaba dañada. Empezamos una nueva sin exponer datos técnicos."};return readingSession;
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
