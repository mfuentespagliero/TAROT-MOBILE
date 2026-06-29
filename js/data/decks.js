export const decks = Object.freeze([
  {
    id: "marseille", name: "Tarot de Marsella", description: "Una lectura clásica basada en estructura, numerología y contraste simbólico.",
    interpretationStyle: "Arquetípico y tradicional", tone: "Sobrio, directo y atemporal", focus: "Patrones, decisiones y fuerzas esenciales",
    suggestedVocabulary: ["arquetipo", "impulso", "estructura", "aprendizaje", "equilibrio"], mainThemes: ["Destino", "Voluntad", "Ciclos", "Decisiones"],
    visual: { type: "css", className: "deck--marseille", colors: ["#b2403b", "#d6b85f", "#24385d"] }, system: "tarot"
  },
  {
    id: "rider-waite-smith", name: "Rider-Waite-Smith", description: "Imágenes narrativas accesibles para conectar escenas, emociones y acciones.",
    interpretationStyle: "Narrativo y simbólico", tone: "Claro, cercano y evocador", focus: "Situaciones cotidianas y evolución personal",
    suggestedVocabulary: ["escena", "energía", "oportunidad", "reto", "camino"], mainThemes: ["Relaciones", "Acción", "Emociones", "Crecimiento"],
    visual: { type: "css", className: "deck--rws", colors: ["#3e64a3", "#e3bc63", "#7b394d"] }, system: "tarot"
  },
  {
    id: "celtic", name: "Tarot celta", description: "Una voz conectada con ciclos naturales, memoria ancestral y transformación.",
    interpretationStyle: "Mítico y elemental", tone: "Profundo, poético y sereno", focus: "Ciclos, raíces y sabiduría de la naturaleza",
    suggestedVocabulary: ["ciclo", "raíz", "umbral", "memoria", "transformación"], mainThemes: ["Naturaleza", "Linaje", "Cambio", "Propósito"],
    visual: { type: "css", className: "deck--celtic", colors: ["#244c43", "#a9945d", "#59426e"] }, system: "tarot"
  },
  {
    id: "lunar", name: "Tarot lunar", description: "Una interpretación sensible a ritmos internos, intuición y mundo emocional.",
    interpretationStyle: "Intuitivo y cíclico", tone: "Íntimo, suave y contemplativo", focus: "Emociones, intuición y procesos internos",
    suggestedVocabulary: ["fase", "intuición", "marea", "sombra", "revelación"], mainThemes: ["Ciclos", "Emociones", "Descanso", "Intuición"],
    visual: { type: "css", className: "deck--lunar", colors: ["#342d6f", "#a9b7eb", "#d8c888"] }, system: "tarot"
  },
  {
    id: "predictive", name: "Tarot predictivo", description: "Observa tendencias y escenarios posibles con lenguaje prudente y no determinista.",
    interpretationStyle: "Prospectivo y estratégico", tone: "Concreto, prudente y orientativo", focus: "Tendencias, probabilidades y puntos de decisión",
    suggestedVocabulary: ["tendencia", "posibilidad", "escenario", "señal", "margen de acción"], mainThemes: ["Tiempo", "Cambio", "Oportunidades", "Prevención"],
    visual: { type: "css", className: "deck--predictive", colors: ["#174b66", "#79b6c9", "#d0ad62"] }, system: "tarot"
  },
  {
    id: "introspective", name: "Tarot introspectivo", description: "Prioriza la reflexión personal y convierte cada símbolo en una pregunta útil.",
    interpretationStyle: "Psicológico y reflexivo", tone: "Compasivo, curioso y no prescriptivo", focus: "Autoconocimiento, emociones y patrones internos",
    suggestedVocabulary: ["observa", "pregúntate", "necesidad", "patrón", "recurso interno"], mainThemes: ["Identidad", "Sombra", "Recursos", "Integración"],
    visual: { type: "css", className: "deck--introspective", colors: ["#60437a", "#c39ccf", "#d5b76f"] }, system: "tarot"
  },
  {
    id: "spiritual-oracle", name: "Oráculo espiritual", description: "Mensajes temáticos libres para acompañar rituales y pausas contemplativas.",
    interpretationStyle: "Oracular y meditativo", tone: "Luminoso, inspirador y simbólico", focus: "Intención, presencia y conexión espiritual",
    suggestedVocabulary: ["mensaje", "presencia", "apertura", "guía", "conexión"], mainThemes: ["Espiritualidad", "Ritual", "Intención", "Armonía"],
    visual: { type: "css", className: "deck--oracle", colors: ["#5a477f", "#d8c9ed", "#e1c46f"] }, system: "oracle"
  }
]);

export function getDeckById(id) {
  return decks.find(deck => deck.id === id) ?? null;
}
