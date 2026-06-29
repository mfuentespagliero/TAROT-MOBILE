const RESPONSIBLE_NOTICE = "Esta lectura ofrece símbolos para reflexión y entretenimiento. No afirma hechos sobre terceros ni sustituye asesoramiento profesional.";

export const categories = Object.freeze([
  { id: "all", name: "Todas", description: "Todo el catálogo de Arcana.", icon: "✦" },
  { id: "love", name: "Amor", description: "Vínculos, afectos y apertura emocional.", icon: "♡" },
  { id: "work", name: "Trabajo", description: "Vocación, proyectos y vida profesional.", icon: "△" },
  { id: "money", name: "Dinero", description: "Recursos, hábitos y posibilidades materiales.", icon: "◈" },
  { id: "decisions", name: "Decisiones", description: "Alternativas, criterios y próximos pasos.", icon: "⇌" },
  { id: "future", name: "Futuro", description: "Tendencias y escenarios posibles.", icon: "✺" },
  { id: "self-knowledge", name: "Autoconocimiento", description: "Patrones, identidad e intuición.", icon: "◇" },
  { id: "deep", name: "Profundas", description: "Lecturas amplias para preguntas complejas.", icon: "✣" },
  { id: "quick", name: "Rápidas", description: "Pausas breves y mensajes concretos.", icon: "☼" }
]);

export const difficultyLevels = Object.freeze({
  beginner: { id: "beginner", name: "Inicial" },
  intermediate: { id: "intermediate", name: "Intermedia" },
  advanced: { id: "advanced", name: "Profunda" }
});

const position = (id, name, description) => ({ id, name, description });
const visual = (accent, gradient, motif) => ({ accent, gradient, motif });

function defineSpread(data) {
  return Object.freeze({
    selectionMethods: ["manual", "automatic"],
    allowsReversed: true,
    recommendations: ["Busca un momento tranquilo.", "Formula una intención abierta.", "Toma la lectura como una perspectiva, no como una sentencia."],
    responsibleNotice: RESPONSIBLE_NOTICE,
    ...data
  });
}

export const spreads = Object.freeze([
  defineSpread({
    id: "lectura-personalizada", slug: "lectura-personalizada", name: "Lectura personalizada", shortName: "Personalizada",
    description: "Una tirada flexible guiada por tu propia pregunta.", extendedDescription: "Define el tema, la cantidad de cartas y, si lo deseas, el significado de cada posición para construir una lectura a tu medida.",
    category: "deep", cardCount: 5, difficulty: "intermediate", durationMinutes: 12, consultationFormat: "custom",
    requiredFields: ["question", "cardAmount", "selectionMethod"], optionalFields: ["querentName", "context", "customPositionNames", "useReversed"],
    positions: [position("core", "Núcleo de la pregunta", "La energía central del asunto."), position("influence", "Influencia principal", "Lo que está dando forma a la situación."), position("hidden", "Factor no visible", "Un matiz que conviene reconocer."), position("guidance", "Orientación", "Una actitud o recurso disponible."), position("integration", "Síntesis", "Cómo integrar el mensaje completo.")],
    instructions: ["Escribe una pregunta abierta.", "Elige cuántas cartas deseas usar.", "Personaliza las posiciones solo si lo necesitas."],
    icon: "✧", visualStyle: visual("#b89cff", "linear-gradient(145deg,#332b63,#11152f)", "constellation"),
    recommendations: ["Úsala cuando ninguna tirada temática represente bien tu pregunta.", "Entre 3 y 7 cartas suele ofrecer un buen equilibrio."],
    introText: "Tu pregunta marca el mapa; las cartas ayudan a recorrerlo."
  }),
  defineSpread({
    id: "una-carta", slug: "una-carta", name: "Una carta", shortName: "Una carta",
    description: "Un mensaje central para enfocar tu momento.", extendedDescription: "Una lectura breve para recibir una perspectiva, una intención o una pregunta útil para el día.",
    category: "quick", cardCount: 1, difficulty: "beginner", durationMinutes: 3, consultationFormat: "open-reflection",
    requiredFields: ["selectionMethod"], optionalFields: ["question", "querentName", "useReversed"],
    positions: [position("central-message", "Mensaje central", "La energía, aprendizaje o pregunta principal.")],
    instructions: ["Respira y enfoca tu intención.", "Elige una carta sin buscar una respuesta perfecta."],
    selectionMethods: ["manual", "automatic"], allowsReversed: true, icon: "✦", visualStyle: visual("#d8bd78", "linear-gradient(145deg,#3d356d,#10142c)", "single-star"),
    recommendations: ["Ideal para comenzar el día o cerrar una reflexión."], introText: "A veces una sola imagen basta para abrir una puerta.", responsibleNotice: null
  }),
  defineSpread({
    id: "dos-cartas", slug: "dos-cartas", name: "Dos cartas", shortName: "Dos cartas",
    description: "Situación y consejo en una conversación breve.", extendedDescription: "Dos perspectivas complementarias: una reconoce dónde estás y la otra sugiere cómo relacionarte con ello.",
    category: "quick", cardCount: 2, difficulty: "beginner", durationMinutes: 5, consultationFormat: "focused-question",
    requiredFields: ["question", "selectionMethod"], optionalFields: ["context", "useReversed"],
    positions: [position("situation", "Situación", "La energía presente o el núcleo del asunto."), position("advice", "Consejo", "Una actitud, recurso o dirección posible.")],
    instructions: ["Formula una pregunta concreta.", "Lee ambas cartas como partes de una misma frase."], icon: "☽", visualStyle: visual("#aebaff", "linear-gradient(145deg,#2b315f,#10142c)", "twin-moons"),
    recommendations: ["Útil cuando necesitas claridad sin una tirada extensa."], introText: "Primero observa; después escucha lo que la situación te pide.", responsibleNotice: null
  }),
  defineSpread({
    id: "si-o-no", slug: "si-o-no", name: "Sí o no", shortName: "Sí o no",
    description: "Una orientación directa con espacio para los matices.", extendedDescription: "La carta señala una tendencia favorable, desafiante o incierta y ofrece el matiz que hay detrás de la respuesta.",
    category: "decisions", cardCount: 1, difficulty: "beginner", durationMinutes: 3, consultationFormat: "focused-question",
    requiredFields: ["question", "selectionMethod"], optionalFields: ["context", "useReversed"],
    positions: [position("orientation", "Orientación central", "Tendencia y matiz principal de la consulta.")],
    instructions: ["Formula una pregunta que pueda orientarse hacia sí o no.", "Considera el mensaje como tendencia, no como garantía."],
    allowsReversed: false, icon: "◐", visualStyle: visual("#c8b4ff", "linear-gradient(145deg,#352c61,#12162f)", "half-moon"),
    recommendations: ["Evita usarla para salud, asuntos legales o decisiones financieras de alto riesgo."], introText: "La respuesta más útil suele vivir en el matiz.", responsibleNotice: "Orientación recreativa y reflexiva: no delegues decisiones importantes en una respuesta de tarot."
  }),
  defineSpread({
    id: "pasado-presente-futuro", slug: "pasado-presente-futuro", name: "Pasado, presente y futuro", shortName: "Tres tiempos",
    description: "Observa cómo una historia llega hasta hoy y hacia dónde tiende.", extendedDescription: "Una secuencia temporal clásica para reconocer antecedentes, comprender el presente y explorar una tendencia futura modificable.",
    category: "future", cardCount: 3, difficulty: "beginner", durationMinutes: 7, consultationFormat: "predictive-window",
    requiredFields: ["question", "selectionMethod"], optionalFields: ["context", "predictionPeriod", "useReversed"],
    positions: [position("past", "Pasado", "El antecedente que todavía influye."), position("present", "Presente", "La energía y los recursos actuales."), position("future", "Futuro o tendencia", "El escenario probable si la dinámica continúa.")],
    instructions: ["Define el asunto que quieres observar.", "Lee la secuencia como una historia en movimiento."], icon: "♢", visualStyle: visual("#8fb7dc", "linear-gradient(145deg,#253c5c,#10142d)", "timeline"),
    recommendations: ["El futuro expresa tendencias; tus decisiones siguen importando."], introText: "Cada presente contiene huellas y también posibilidades."
  }),
  defineSpread({
    id: "que-siente", slug: "que-siente-por-mi", name: "Qué siente por mí", shortName: "Qué siente",
    description: "Explora la dinámica emocional de un vínculo.", extendedDescription: "Una lectura relacional que observa señales, emociones posibles y la forma en que el vínculo podría expresarse, sin afirmar conocer la mente de otra persona.",
    category: "love", cardCount: 5, difficulty: "intermediate", durationMinutes: 12, consultationFormat: "relational",
    requiredFields: ["otherPersonName", "relationship", "selectionMethod"], optionalFields: ["querentName", "question", "context", "useReversed"],
    positions: [position("bond", "Energía del vínculo", "El clima actual entre ambas personas."), position("visible", "Lo que expresa", "Señales o emociones que se hacen visibles."), position("inner", "Mundo emocional posible", "Lo que podría estar procesándose internamente."), position("block", "Temor o bloqueo", "Lo que dificulta la expresión."), position("development", "Tendencia del vínculo", "Cómo podría desarrollarse la dinámica.")],
    instructions: ["Piensa en el vínculo, no en controlar a la otra persona.", "Distingue símbolos de hechos verificables."], icon: "♡", visualStyle: visual("#d89abc", "linear-gradient(145deg,#572d52,#17132e)", "heart-orbit"),
    recommendations: ["Contrasta la lectura con comunicación directa y respeto por los límites."], introText: "Un vínculo se comprende mejor cuando también miramos cómo nos hace sentir.", responsibleNotice: "No podemos conocer con certeza pensamientos o emociones ajenas. Usa esta lectura para reflexionar sobre el vínculo, no para afirmar hechos sobre otra persona."
  }),
  defineSpread({
    id: "que-esconde", slug: "que-esconde-una-persona", name: "Qué esconde una persona", shortName: "Qué esconde",
    description: "Mira silencios, límites y dinámicas no expresadas.", extendedDescription: "Explora aquello que parece difícil de comunicar en un vínculo y qué necesita el consultante para relacionarse con la incertidumbre.",
    category: "self-knowledge", cardCount: 5, difficulty: "intermediate", durationMinutes: 12, consultationFormat: "relational",
    requiredFields: ["otherPersonName", "relationship", "selectionMethod"], optionalFields: ["question", "context", "useReversed"],
    positions: [position("appearance", "Lo que muestra", "La expresión visible de la persona."), position("unspoken", "Lo no expresado", "Un tema que podría permanecer en silencio."), position("reason", "Por qué se reserva", "Necesidad, temor o límite relacionado."), position("impact", "Cómo te afecta", "La respuesta interna del consultante."), position("guidance", "Cómo abordarlo", "Una forma respetuosa de buscar claridad.")],
    instructions: ["Describe el vínculo sin asumir culpabilidad.", "Usa el resultado para preparar una conversación, no una acusación."], icon: "◌", visualStyle: visual("#9e91ce", "linear-gradient(145deg,#30294d,#101329)", "veil"),
    recommendations: ["Da prioridad a hechos, consentimiento y comunicación directa."], introText: "Lo oculto también puede ser un límite, un miedo o una palabra aún no encontrada.", responsibleNotice: "Esta lectura no revela secretos ni verifica engaños. Presenta símbolos para reflexionar sobre percepción, confianza y comunicación."
  }),
  defineSpread({
    id: "verdadera-esencia", slug: "verdadera-identidad-esencia", name: "Verdadera identidad o esencia", shortName: "Verdadera esencia",
    description: "Una mirada simbólica a los rasgos profundos de una persona.", extendedDescription: "Observa valores, recursos, contradicciones y la forma en que la presencia de alguien resuena contigo.",
    category: "self-knowledge", cardCount: 5, difficulty: "intermediate", durationMinutes: 12, consultationFormat: "relational",
    requiredFields: ["otherPersonName", "relationship", "selectionMethod"], optionalFields: ["context", "useReversed"],
    positions: [position("outer", "Identidad visible", "Cómo se presenta ante el mundo."), position("values", "Valores centrales", "Lo que parece orientar sus elecciones."), position("strength", "Recurso esencial", "Una cualidad o capacidad destacada."), position("shadow", "Contradicción o sombra", "Una tensión interna posible."), position("resonance", "Lo que despierta en ti", "Cómo esa esencia dialoga con tu experiencia.")],
    instructions: ["Evita reducir a una persona a las cartas.", "Observa especialmente la última posición, que devuelve la mirada hacia ti."], icon: "◎", visualStyle: visual("#bc9ddd", "linear-gradient(145deg,#3c2b56,#12142d)", "inner-circle"),
    recommendations: ["Permite que la experiencia real complemente o contradiga los símbolos."], introText: "Toda persona es más amplia que cualquier descripción.", responsibleNotice: "Las cartas no diagnostican ni definen la identidad real de otra persona; esta lectura es una exploración simbólica."
  }),
  defineSpread({
    id: "espejo-alma", slug: "espejo-del-alma", name: "Espejo del alma", shortName: "Espejo del alma",
    description: "Reconoce lo que un vínculo o situación refleja de ti.", extendedDescription: "Una tirada introspectiva para descubrir proyecciones, necesidades, recursos y aprendizajes que emergen en tu experiencia.",
    category: "self-knowledge", cardCount: 5, difficulty: "intermediate", durationMinutes: 12, consultationFormat: "open-reflection",
    requiredFields: ["selectionMethod"], optionalFields: ["question", "context", "otherPersonName", "useReversed"],
    positions: [position("reflection", "Lo que estás reflejando", "La energía que proyectas o reconoces fuera."), position("need", "Necesidad profunda", "Lo que busca ser atendido."), position("shadow", "Sombra", "Un patrón difícil de mirar."), position("gift", "Recurso interior", "La capacidad que puede sostenerte."), position("integration", "Integración", "Una manera de reunir estas partes.")],
    instructions: ["Piensa en aquello que más te moviliza.", "Lee cada posición como una pregunta hacia dentro."], icon: "◇", visualStyle: visual("#b7a4e8", "linear-gradient(145deg,#3b3465,#11142d)", "mirror"),
    recommendations: ["Escribe una reflexión al finalizar."], introText: "Aquello que te conmueve afuera puede iluminar algo que pide atención dentro.", responsibleNotice: null
  }),
  defineSpread({
    id: "encontrar-amor", slug: "como-encontrar-el-amor", name: "Cómo encontrar el amor", shortName: "Encontrar el amor",
    description: "Explora apertura, patrones y acciones para crear vínculos sanos.", extendedDescription: "Una lectura centrada en tu disponibilidad emocional y en las condiciones que puedes cultivar para relacionarte desde la autenticidad.",
    category: "love", cardCount: 6, difficulty: "intermediate", durationMinutes: 14, consultationFormat: "open-reflection",
    requiredFields: ["selectionMethod"], optionalFields: ["querentName", "context", "useReversed"],
    positions: [position("availability", "Disponibilidad emocional", "Cómo estás llegando hoy al amor."), position("pattern", "Patrón a reconocer", "Una repetición que conviene observar."), position("release", "Lo que puedes soltar", "Una expectativa o protección que limita."), position("cultivate", "Lo que puedes cultivar", "Una cualidad que favorece vínculos sanos."), position("action", "Acción concreta", "Un paso coherente con tu intención."), position("encounter", "Energía del encuentro", "Cómo podría sentirse una nueva apertura.")],
    instructions: ["Enfoca la lectura en tus posibilidades de acción.", "Evita buscar fechas o personas exactas."], icon: "❦", visualStyle: visual("#d99cb9", "linear-gradient(145deg,#552f50,#17132d)", "opening-heart"),
    recommendations: ["El amor también se construye con límites, reciprocidad y tiempo."], introText: "Abrirse al amor empieza por reconocer cómo deseas habitarlo."
  }),
  defineSpread({
    id: "tarot-trabajo", slug: "tarot-del-trabajo", name: "Tarot del trabajo", shortName: "Trabajo",
    description: "Perspectiva para proyectos, carrera y entorno profesional.", extendedDescription: "Observa el escenario laboral actual, tus recursos, las tensiones presentes y una dirección de crecimiento posible.",
    category: "work", cardCount: 5, difficulty: "intermediate", durationMinutes: 12, consultationFormat: "focused-question",
    requiredFields: ["topic", "selectionMethod"], optionalFields: ["question", "context", "predictionPeriod", "useReversed"],
    positions: [position("current", "Situación profesional", "El clima actual de tu vida laboral."), position("strength", "Talento disponible", "Una capacidad que puedes movilizar."), position("challenge", "Desafío", "La tensión que pide atención."), position("opportunity", "Oportunidad", "Un espacio posible de desarrollo."), position("next-step", "Próximo paso", "Una acción práctica para avanzar.")],
    instructions: ["Define el proyecto o área laboral a observar.", "Traduce el consejo final a una acción verificable."], icon: "△", visualStyle: visual("#91b4c9", "linear-gradient(145deg,#254054,#10162b)", "mountain"),
    recommendations: ["Combina la reflexión con información concreta de tu contexto laboral."], introText: "Tu camino profesional también se construye leyendo bien el presente."
  }),
  defineSpread({
    id: "tarot-dinero", slug: "tarot-del-dinero", name: "Tarot del dinero", shortName: "Dinero",
    description: "Reflexiona sobre recursos, hábitos y decisiones materiales.", extendedDescription: "Una lectura para reconocer tu relación actual con el dinero, posibles bloqueos, recursos y una acción responsable.",
    category: "money", cardCount: 5, difficulty: "intermediate", durationMinutes: 12, consultationFormat: "focused-question",
    requiredFields: ["selectionMethod"], optionalFields: ["question", "context", "predictionPeriod", "useReversed"],
    positions: [position("relationship", "Relación con el dinero", "La actitud o emoción dominante."), position("resource", "Recurso disponible", "Una fortaleza material o personal."), position("leak", "Bloqueo o fuga", "Un patrón que reduce estabilidad."), position("opportunity", "Oportunidad", "Una posibilidad que merece evaluación."), position("responsible-action", "Acción responsable", "Un paso prudente y concreto.")],
    instructions: ["Piensa en hábitos y decisiones, no en cifras mágicas.", "Evalúa cualquier oportunidad con datos reales."], icon: "◈", visualStyle: visual("#d2b873", "linear-gradient(145deg,#4c422c,#15162c)", "coin"),
    recommendations: ["No uses esta lectura para apostar, invertir o endeudarte."], introText: "La abundancia también comienza al mirar con claridad cómo cuidas tus recursos.", responsibleNotice: "Contenido de entretenimiento y reflexión. No constituye asesoría financiera ni predice ganancias."
  }),
  defineSpread({
    id: "tomar-decision", slug: "tomar-una-decision", name: "Tomar una decisión", shortName: "Decisión",
    description: "Aclara alternativas, motivaciones y criterios antes de elegir.", extendedDescription: "Compara dos caminos sin decidir por ti: muestra el centro del dilema, el potencial de cada opción y el criterio que puede orientarte.",
    category: "decisions", cardCount: 5, difficulty: "intermediate", durationMinutes: 12, consultationFormat: "comparison",
    requiredFields: ["question", "optionA", "optionB", "selectionMethod"], optionalFields: ["context", "useReversed"],
    positions: [position("dilemma", "Centro de la decisión", "La necesidad real detrás de la elección."), position("option-a", "Potencial de la opción A", "Energía y aprendizaje del primer camino."), position("option-b", "Potencial de la opción B", "Energía y aprendizaje del segundo camino."), position("criterion", "Criterio interior", "El valor que conviene priorizar."), position("guidance", "Orientación", "Cómo acercarte a una elección consciente.")],
    instructions: ["Describe ambas opciones de forma neutral.", "No interpretes una carta difícil como una prohibición automática."], icon: "⇌", visualStyle: visual("#c1a8e4", "linear-gradient(145deg,#3f315d,#12142c)", "fork"),
    recommendations: ["Anota después ventajas, riesgos y datos concretos de cada opción."], introText: "Elegir también es descubrir qué valor quieres honrar."
  }),
  defineSpread({
    id: "favor-contra", slug: "a-favor-y-en-contra", name: "A favor y en contra", shortName: "Pros y contras",
    description: "Contrasta fuerzas favorables, desafíos y una síntesis.", extendedDescription: "Tres cartas ordenan los elementos que impulsan una opción, los que la dificultan y la perspectiva que integra ambos lados.",
    category: "decisions", cardCount: 3, difficulty: "beginner", durationMinutes: 7, consultationFormat: "focused-question",
    requiredFields: ["question", "selectionMethod"], optionalFields: ["context", "useReversed"],
    positions: [position("for", "A favor", "Recursos, ventajas o impulsos favorables."), position("against", "En contra", "Riesgos, costes o resistencias."), position("synthesis", "Síntesis", "La clave para ponderar ambos lados.")],
    instructions: ["Plantea una sola opción o curso de acción.", "Da el mismo peso de observación a ambos lados."], icon: "⚖", visualStyle: visual("#cbb6e5", "linear-gradient(145deg,#403454,#13152c)", "scales"),
    recommendations: ["Complementa la lectura con una lista de consecuencias reales."], introText: "La claridad aparece cuando podemos sostener dos verdades a la vez."
  }),
  defineSpread({
    id: "encrucijada", slug: "la-encrucijada", name: "La encrucijada", shortName: "Encrucijada",
    description: "Explora dos rutas, sus consecuencias y la clave para elegir.", extendedDescription: "Una comparación amplia para decisiones donde cada camino implica aprendizajes, renuncias y posibilidades distintas.",
    category: "decisions", cardCount: 6, difficulty: "advanced", durationMinutes: 16, consultationFormat: "comparison",
    requiredFields: ["question", "optionA", "optionB", "selectionMethod"], optionalFields: ["context", "predictionPeriod", "useReversed"],
    positions: [position("crossroads", "La encrucijada", "El núcleo y la urgencia de la decisión."), position("path-a", "Energía del camino A", "Cómo se presenta la primera ruta."), position("result-a", "Aprendizaje del camino A", "Su consecuencia o lección probable."), position("path-b", "Energía del camino B", "Cómo se presenta la segunda ruta."), position("result-b", "Aprendizaje del camino B", "Su consecuencia o lección probable."), position("key", "Clave de elección", "El criterio que devuelve la decisión a tus manos.")],
    instructions: ["Nombra rutas concretas y comparables.", "Observa qué camino se alinea mejor con tus valores actuales."], icon: "⋔", visualStyle: visual("#b6a0df", "linear-gradient(145deg,#3d3159,#11142b)", "crossroads"),
    recommendations: ["Si la decisión es irreversible o de alto riesgo, busca consejo especializado."], introText: "Cada camino revela algo sobre quién estás eligiendo ser."
  }),
  defineSpread({
    id: "tarot-consejero", slug: "tarot-consejero", name: "Tarot consejero", shortName: "Consejero",
    description: "Una perspectiva práctica para atravesar tu situación.", extendedDescription: "Tres cartas reconocen el asunto, muestran un recurso disponible y proponen una actitud concreta.",
    category: "quick", cardCount: 3, difficulty: "beginner", durationMinutes: 6, consultationFormat: "focused-question",
    requiredFields: ["question", "selectionMethod"], optionalFields: ["context", "useReversed"],
    positions: [position("situation", "Lo esencial", "Qué conviene reconocer primero."), position("resource", "Recurso", "Una capacidad o apoyo disponible."), position("advice", "Consejo", "Una actitud o siguiente paso posible.")],
    instructions: ["Pregunta qué puedes comprender o hacer.", "Convierte el consejo en una acción pequeña."], icon: "☼", visualStyle: visual("#e0c170", "linear-gradient(145deg,#4d422d,#16172d)", "sun"),
    recommendations: ["Vuelve a la lectura después de actuar y observa qué cambió."], introText: "Un buen consejo no decide por ti: te devuelve recursos."
  }),
  defineSpread({
    id: "verdad-oculta", slug: "verdad-oculta", name: "Verdad oculta", shortName: "Verdad oculta",
    description: "Ilumina supuestos, silencios y aspectos no reconocidos.", extendedDescription: "No busca descubrir hechos secretos, sino distinguir percepción, temor, evidencia y la verdad personal que pide ser atendida.",
    category: "deep", cardCount: 5, difficulty: "advanced", durationMinutes: 14, consultationFormat: "focused-question",
    requiredFields: ["question", "selectionMethod"], optionalFields: ["context", "otherPersonName", "useReversed"],
    positions: [position("visible", "Lo evidente", "La lectura actual de la situación."), position("assumption", "Supuesto", "Una idea que quizá estás dando por cierta."), position("unseen", "Aspecto no reconocido", "Algo interno o contextual que falta integrar."), position("evidence", "Lo que sí puedes observar", "Un punto de realidad o discernimiento."), position("personal-truth", "Tu verdad esencial", "Lo que necesitas admitir o expresar.")],
    instructions: ["Separa hechos de interpretaciones.", "No uses la tirada para acusar o vigilar a nadie."], icon: "◑", visualStyle: visual("#9c8cc9", "linear-gradient(145deg,#32294d,#0e1228)", "eclipse"),
    recommendations: ["Busca conversaciones claras cuando necesites confirmar información."], introText: "La verdad más transformadora suele comenzar por lo que podemos reconocer en nosotros.", responsibleNotice: "Esta tirada no descubre secretos ni confirma sospechas. Sus símbolos sirven para examinar percepción, límites y comunicación."
  }),
  defineSpread({
    id: "emociones-ocultas", slug: "emociones-ocultas", name: "Emociones ocultas", shortName: "Emociones ocultas",
    description: "Da lenguaje a sentimientos difíciles de reconocer o expresar.", extendedDescription: "Explora el clima emocional de un vínculo, aquello que percibes, lo que puede estar proyectándose y cómo cuidar tu propia claridad.",
    category: "love", cardCount: 5, difficulty: "intermediate", durationMinutes: 13, consultationFormat: "relational",
    requiredFields: ["otherPersonName", "relationship", "selectionMethod"], optionalFields: ["question", "context", "useReversed"],
    positions: [position("climate", "Clima emocional", "La atmósfera actual del vínculo."), position("expressed", "Emoción expresada", "Lo que se comunica de forma visible."), position("unspoken", "Emoción no expresada", "Un sentimiento posible que cuesta nombrar."), position("projection", "Proyección o eco", "Lo que tu propia historia puede añadir."), position("care", "Cómo cuidar el vínculo", "Una forma respetuosa de buscar claridad.")],
    instructions: ["Observa tus emociones antes de interpretar las ajenas.", "Usa lenguaje de posibilidad, no de certeza."], icon: "❧", visualStyle: visual("#d094b9", "linear-gradient(145deg,#552d50,#17122d)", "water-heart"),
    recommendations: ["La comunicación consentida vale más que cualquier inferencia."], introText: "Lo que no se dice también necesita escucha, paciencia y límites.", responsibleNotice: "No es posible verificar sentimientos ajenos mediante cartas. La lectura propone metáforas para reflexionar sobre el vínculo."
  }),
  defineSpread({
    id: "tarot-predictivo", slug: "tarot-predictivo", name: "Tarot predictivo", shortName: "Predictivo",
    description: "Explora tendencias, puntos de giro y margen de acción.", extendedDescription: "Una ventana temporal que presenta escenarios probables si las condiciones actuales continúan, junto con factores capaces de modificar el rumbo.",
    category: "future", cardCount: 6, difficulty: "advanced", durationMinutes: 16, consultationFormat: "predictive-window",
    requiredFields: ["topic", "predictionPeriod", "selectionMethod"], optionalFields: ["question", "context", "useReversed"],
    positions: [position("present", "Punto de partida", "Las condiciones actuales."), position("momentum", "Tendencia dominante", "La dirección que ya está tomando forma."), position("opportunity", "Oportunidad", "Una apertura posible en el periodo."), position("risk", "Riesgo o interferencia", "Lo que podría desviar el proceso."), position("turning-point", "Punto de giro", "Una decisión o evento significativo."), position("outlook", "Escenario probable", "La tendencia resultante, no un destino fijo.")],
    instructions: ["Define un periodo razonable.", "Lee todos los resultados como escenarios condicionales."], icon: "✺", visualStyle: visual("#84bad0", "linear-gradient(145deg,#21485b,#10152c)", "horizon"),
    recommendations: ["Cuanto más lejano el periodo, mayor la incertidumbre."], introText: "Mirar hacia delante sirve mejor cuando también reconocemos dónde podemos actuar.", responsibleNotice: "El tarot no predice hechos con certeza. Esta lectura presenta tendencias narrativas para entretenimiento y reflexión."
  }),
  defineSpread({
    id: "cruz-celta", slug: "cruz-celta", name: "Cruz celta", shortName: "Cruz celta",
    description: "Una lectura clásica y completa para situaciones complejas.", extendedDescription: "Diez posiciones conectan fuerzas conscientes e inconscientes, antecedentes, entorno, actitud y una tendencia de resolución.",
    category: "deep", cardCount: 10, difficulty: "advanced", durationMinutes: 25, consultationFormat: "focused-question",
    requiredFields: ["question", "selectionMethod"], optionalFields: ["querentName", "context", "predictionPeriod", "useReversed"],
    positions: [position("current", "Situación actual", "El corazón de la consulta."), position("crossing", "Lo que cruza o desafía", "La fuerza que ayuda, bloquea o tensiona."), position("foundation", "Base inconsciente", "La raíz profunda del asunto."), position("recent-past", "Pasado reciente", "Una influencia que empieza a quedar atrás."), position("possibility", "Aspiración o posibilidad", "Lo que se busca o podría desarrollarse."), position("near-future", "Futuro próximo", "El siguiente movimiento probable."), position("attitude", "Actitud del consultante", "Cómo te posicionas ante el asunto."), position("environment", "Entorno", "Personas y condiciones externas."), position("hopes-fears", "Esperanzas y miedos", "Deseos y temores entrelazados."), position("outcome", "Resultado o tendencia", "La síntesis probable si la dinámica continúa.")],
    instructions: ["Reserva tiempo y una pregunta significativa.", "Interpreta primero la cruz central y después conecta la columna final."], icon: "✣", visualStyle: visual("#c0a5df", "linear-gradient(145deg,#3e3159,#10132a)", "celtic-cross"),
    recommendations: ["No repitas esta tirada inmediatamente para la misma pregunta."], introText: "Una pregunta compleja merece espacio para mostrar sus muchas capas."
  }),
  defineSpread({
    id: "celta-emocional", slug: "tarot-celta-emocional", name: "Tarot celta emocional", shortName: "Celta emocional",
    description: "Una cruz celta enfocada en tu paisaje afectivo.", extendedDescription: "Adapta la estructura de diez cartas para reconocer emociones presentes, heridas, necesidades, apoyos y un camino de integración.",
    category: "deep", cardCount: 10, difficulty: "advanced", durationMinutes: 25, consultationFormat: "open-reflection",
    requiredFields: ["selectionMethod"], optionalFields: ["question", "context", "relationship", "useReversed"],
    positions: [position("emotion", "Emoción presente", "Lo que ocupa el centro de tu experiencia."), position("tension", "Tensión emocional", "La emoción que cruza o complica."), position("root", "Raíz afectiva", "La necesidad o memoria profunda."), position("wound", "Herida reciente", "Una experiencia que aún resuena."), position("longing", "Anhelo", "Lo que el corazón busca alcanzar."), position("emergence", "Emoción emergente", "Lo que comienza a tomar forma."), position("response", "Tu forma de responder", "La estrategia emocional actual."), position("support", "Entorno y apoyo", "Lo que el contexto aporta o requiere."), position("hope-fear", "Esperanza y temor", "La ambivalencia principal."), position("integration", "Integración emocional", "Una manera posible de cuidar el proceso.")],
    instructions: ["Nombra la emoción sin juzgarla.", "Haz pausas si alguna posición se siente intensa."], icon: "❧", visualStyle: visual("#a78fc8", "linear-gradient(145deg,#342b4e,#111329)", "celtic-water"),
    recommendations: ["Si atraviesas una crisis emocional, busca apoyo de una persona o profesional de confianza."], introText: "Sentir con claridad también es una forma de sabiduría.", responsibleNotice: "Esta lectura no diagnostica ni sustituye apoyo psicológico o de salud mental."
  }),
  defineSpread({
    id: "tarot-lunar", slug: "tarot-lunar", name: "Tarot lunar", shortName: "Lunar",
    description: "Conecta intención, emoción y acción con el lenguaje de los ciclos.", extendedDescription: "Cuatro cartas inspiradas en las fases lunares muestran qué sembrar, nutrir, iluminar y liberar en tu proceso actual.",
    category: "self-knowledge", cardCount: 4, difficulty: "intermediate", durationMinutes: 10, consultationFormat: "open-reflection",
    requiredFields: ["moonPhase", "selectionMethod"], optionalFields: ["question", "context", "useReversed"],
    positions: [position("seed", "Semilla", "La intención que quiere comenzar."), position("nourish", "Crecimiento", "Lo que necesita atención y constancia."), position("illuminate", "Revelación", "Lo que ya puede verse con claridad."), position("release", "Liberación", "Lo que está listo para transformarse o descansar.")],
    instructions: ["Elige la fase actual o la que quieras usar como símbolo.", "Recorre las posiciones como un ciclo completo."], icon: "☾", visualStyle: visual("#aebcff", "linear-gradient(145deg,#2e326b,#10142e)", "moon-phases"),
    recommendations: ["Puedes volver a tus notas al cambiar de fase lunar."], introText: "No todo crece al mismo tiempo; cada fase tiene su sabiduría.", responsibleNotice: null
  }),
  defineSpread({
    id: "tarot-oraculo", slug: "tarot-del-oraculo", name: "Tarot del oráculo", shortName: "Oráculo",
    description: "Un mensaje simbólico libre para intención y contemplación.", extendedDescription: "Combina estructura de tarot y lenguaje oracular para ofrecer un tema, un desafío, un apoyo, una acción y una frase de integración.",
    category: "future", cardCount: 5, difficulty: "beginner", durationMinutes: 10, consultationFormat: "open-reflection",
    requiredFields: ["selectionMethod"], optionalFields: ["question", "topic", "context"],
    positions: [position("message", "Mensaje", "El tema que pide atención."), position("challenge", "Desafío", "La tensión que acompaña el mensaje."), position("support", "Apoyo", "Una energía o recurso disponible."), position("action", "Ritual o acción", "Una manera sencilla de encarnar el mensaje."), position("integration", "Palabra de integración", "La cualidad que resume la lectura.")],
    instructions: ["Acércate con una intención amplia.", "Permite que las imágenes resuenen antes de buscar conclusiones."],
    selectionMethods: ["manual", "automatic"], allowsReversed: false, icon: "✵", visualStyle: visual("#d2c0ef", "linear-gradient(145deg,#49366b,#15142e)", "oracle-star"),
    recommendations: ["Ideal para acompañar una pausa, escritura o meditación."], introText: "Un símbolo no ordena: invita a escuchar.", responsibleNotice: null
  }),
  defineSpread({
    id: "lectura-libre", slug: "lectura-libre", name: "Lectura libre", shortName: "Libre",
    description: "Deja que la intuición construya su propio recorrido.", extendedDescription: "Una mesa abierta para elegir cantidad, orden y significado de las posiciones sin una estructura temática predeterminada.",
    category: "deep", cardCount: 7, difficulty: "advanced", durationMinutes: 18, consultationFormat: "custom",
    requiredFields: ["cardAmount", "selectionMethod"], optionalFields: ["question", "context", "customPositionNames", "useReversed"],
    positions: [position("free-1", "Posición libre 1", "Significado definido por el consultante."), position("free-2", "Posición libre 2", "Significado definido por el consultante."), position("free-3", "Posición libre 3", "Significado definido por el consultante."), position("free-4", "Posición libre 4", "Significado definido por el consultante."), position("free-5", "Posición libre 5", "Significado definido por el consultante."), position("free-6", "Posición libre 6", "Significado definido por el consultante."), position("free-7", "Posición libre 7", "Significado definido por el consultante.")],
    instructions: ["Decide cuántas cartas necesitas antes de comenzar.", "Asigna nombres a las posiciones o descubre su relación durante la lectura."], icon: "∞", visualStyle: visual("#b7a3e5", "linear-gradient(145deg,#3a315e,#10132b)", "open-constellation"),
    recommendations: ["Recomendada para personas con experiencia leyendo estructuras propias."], introText: "Cuando la estructura se abre, la intuición se convierte en brújula."
  })
]);

export const popularSpreadIds = Object.freeze(["una-carta", "si-o-no", "pasado-presente-futuro", "que-siente"]);

export function getSpreadById(id) {
  return spreads.find(spread => spread.id === id || spread.slug === id) ?? null;
}

export function getCategoryById(id) {
  return categories.find(category => category.id === id) ?? null;
}
