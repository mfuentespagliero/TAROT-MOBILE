/**
 * Catálogo central de campos configurables.
 * Las tiradas guardan únicamente sus ids para evitar duplicar labels y opciones.
 */
export const fieldDefinitions = Object.freeze({
  querentName: { id: "querentName", name: "Nombre del consultante", type: "text", label: "Tu nombre", placeholder: "¿Cómo quieres que te llamemos?", maxLength: 60 },
  question: { id: "question", name: "Pregunta", type: "textarea", label: "Tu pregunta", placeholder: "Formula una pregunta abierta y concreta…", maxLength: 280 },
  otherPersonName: { id: "otherPersonName", name: "Nombre de otra persona", type: "text", label: "Nombre de la otra persona", placeholder: "Nombre o iniciales", maxLength: 60 },
  relationship: { id: "relationship", name: "Relación", type: "select", label: "Relación con esa persona", options: ["Pareja", "Interés romántico", "Expareja", "Familiar", "Amistad", "Laboral", "Otra"] },
  context: { id: "context", name: "Contexto", type: "textarea", label: "Contexto", placeholder: "Añade solo lo necesario para situar tu consulta…", maxLength: 500 },
  topic: { id: "topic", name: "Tema", type: "select", label: "Tema principal", options: ["Amor", "Trabajo", "Dinero", "Decisión", "Bienestar", "Crecimiento personal", "Otro"] },
  optionA: { id: "optionA", name: "Opción A", type: "text", label: "Primera opción", placeholder: "Describe la opción A", maxLength: 120 },
  optionB: { id: "optionB", name: "Opción B", type: "text", label: "Segunda opción", placeholder: "Describe la opción B", maxLength: 120 },
  predictionPeriod: { id: "predictionPeriod", name: "Periodo de predicción", type: "select", label: "Periodo a explorar", options: ["Próximos 7 días", "Próximo mes", "Próximos 3 meses", "Próximos 6 meses", "Próximo año"] },
  moonPhase: { id: "moonPhase", name: "Fase lunar", type: "select", label: "Fase lunar", options: ["Luna nueva", "Creciente", "Luna llena", "Menguante", "Fase actual"] },
  cardAmount: { id: "cardAmount", name: "Cantidad de cartas", type: "number", label: "Cantidad de cartas", min: 1, max: 10, defaultValue: 5 },
  customPositionNames: { id: "customPositionNames", name: "Posiciones personalizadas", type: "list", label: "Nombre de cada posición", minItems: 1, maxItems: 10 },
  useReversed: { id: "useReversed", name: "Cartas invertidas", type: "switch", label: "Permitir cartas invertidas", defaultValue: true },
  selectionMethod: { id: "selectionMethod", name: "Método de selección", type: "radio", label: "Cómo elegir las cartas", options: ["manual", "automatic"] }
});

export const selectionMethods = Object.freeze([
  { id: "manual", name: "Manual", description: "El consultante elige cada carta de forma consciente." },
  { id: "automatic", name: "Automática", description: "La aplicación selecciona las cartas de manera aleatoria." }
]);

export const consultationFormats = Object.freeze([
  { id: "focused-question", name: "Pregunta concreta", description: "Parte de una pregunta abierta y específica." },
  { id: "open-reflection", name: "Reflexión abierta", description: "Explora el momento presente sin una pregunta obligatoria." },
  { id: "relational", name: "Vínculo", description: "Observa dinámicas entre el consultante y otra persona." },
  { id: "comparison", name: "Comparación", description: "Contrasta dos posibilidades antes de decidir." },
  { id: "predictive-window", name: "Ventana temporal", description: "Examina tendencias dentro de un periodo definido, sin afirmar certezas." },
  { id: "custom", name: "Personalizada", description: "Permite adaptar cantidad y nombres de posiciones." }
]);

export function getFieldDefinition(id) {
  return fieldDefinitions[id] ?? null;
}
