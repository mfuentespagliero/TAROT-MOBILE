export const twoCardVariants = Object.freeze({
  "situation-advice":["Situación","Consejo"],
  "self-other":["Tú","La otra persona"],
  "for-against":["A favor","En contra"],
  "problem-solution":["Problema","Solución"],
  "present-evolution":["Presente","Evolución"],
  "visible-hidden":["Visible","Oculto"]
});

const strategy = (id,family,layout,intent,positionGuidance,extra = {}) => Object.freeze({id,family,layout,intent,positionGuidance,...extra});

export const readingStrategies = Object.freeze([
  strategy("lectura-personalizada","custom","custom","Responder a una pregunta construida por el consultante",[],{dynamicPositions:true}),
  strategy("una-carta","quick","single","Concentrar una respuesta central, su energía, consejo y matiz",["mensaje central"],{sections:["Respuesta central","Energía","Consejo","Aspecto a considerar","Frase final"]}),
  strategy("dos-cartas","quick","duo","Interpretar el diálogo entre dos funciones elegidas",[],{variants:twoCardVariants,dynamicPositions:true}),
  strategy("si-o-no","quick","yes-no","Graduar una respuesta y explicar qué podría modificarla",[],{allowedCardCounts:[1,3],dynamicPositions:true}),
  strategy("pasado-presente-futuro","temporal","timeline","Leer continuidad, cambio y tendencia entre tres tiempos",["origen e influencia","condiciones presentes","tendencia modificable"]),
  strategy("que-siente","relationship","relationship","Explorar la dinámica emocional percibida sin atribuir pensamientos privados",["clima compartido","expresión visible","mundo emocional simbólico","bloqueo","evolución del vínculo"],{responsibleRelationship:true}),
  strategy("que-esconde","relationship","relationship","Distinguir percepción, silencio y comunicación pendiente",["apariencia","tema no expresado","motivo simbólico","impacto personal","abordaje respetuoso"],{responsibleRelationship:true}),
  strategy("verdadera-esencia","relationship","essence","Observar rasgos simbólicos sin definir la identidad real de otra persona",["identidad visible","valores","recurso","contradicción","resonancia en ti"],{responsibleRelationship:true}),
  strategy("espejo-alma","self","mirror","Devolver la lectura hacia necesidades, proyecciones y recursos internos",["reflejo","necesidad","sombra","recurso","integración"]),
  strategy("encontrar-amor","relationship","relationship","Centrar la búsqueda amorosa en disponibilidad, patrones y acciones propias",["disponibilidad","patrón","liberación","cultivo","acción","apertura"]),
  strategy("tarot-trabajo","practical","work","Relacionar capacidades, obstáculos y pasos profesionales realistas",["situación laboral","talento","desafío","oportunidad","próximo paso"],{professionalNotice:true}),
  strategy("tarot-dinero","practical","money","Observar hábitos y recursos sin prometer resultados materiales",["relación con recursos","fortaleza","fuga","posibilidad","acción prudente"],{financialNotice:true}),
  strategy("tomar-decision","decision","decision","Comparar dos caminos sin escoger por el consultante",["núcleo del dilema","beneficio y riesgo A","beneficio y riesgo B","criterio","orientación"],{compareOptions:true}),
  strategy("favor-contra","decision","balance","Ponderar impulso, resistencia y síntesis",["beneficio","riesgo","condición de equilibrio"]),
  strategy("encrucijada","decision","crossroads","Comparar rutas, consecuencias y criterio de elección",["dilema","camino A","consecuencia A","camino B","consecuencia B","clave práctica"],{compareOptions:true}),
  strategy("tarot-consejero","self","counsel","Convertir situación y recurso en un consejo aplicable",["esencial","recurso","consejo"]),
  strategy("verdad-oculta","self","hidden-truth","Separar hechos, supuestos y verdad personal",["evidente","supuesto","no reconocido","evidencia","verdad personal"]),
  strategy("emociones-ocultas","relationship","relationship","Dar lenguaje simbólico a emociones sin afirmar certezas ajenas",["clima","expresión","no expresado","proyección","cuidado"],{responsibleRelationship:true}),
  strategy("tarot-predictivo","temporal","forecast","Describir movimientos condicionales dentro de un periodo",["punto de partida","tendencia","oportunidad","riesgo","giro","escenario"],{periods:["Próximos 7 días","Próximo mes","Próximos 3 meses","Próximos 6 meses"],trendOnly:true}),
  strategy("cruz-celta","deep","celtic-cross","Leer la tirada por núcleos y relaciones entre tiempo, desafío, entorno y resultado",["situación","desafío","raíz","pasado","posibilidad","futuro próximo","actitud","entorno","esperanzas y miedos","resultado"],{groups:[{name:"Núcleo",indices:[0,1,2]},{name:"Eje temporal",indices:[3,4,5]},{name:"Respuesta y entorno",indices:[6,7]},{name:"Proyección y síntesis",indices:[8,9]}]}),
  strategy("celta-emocional","self","emotional-celtic","Leer capas emocionales, apoyos e integración por grupos",["emoción","tensión","raíz","herida","anhelo","emergente","respuesta","apoyo","ambivalencia","integración"],{groups:[{name:"Núcleo emocional",indices:[0,1,2]},{name:"Historia y deseo",indices:[3,4,5]},{name:"Respuesta y apoyo",indices:[6,7]},{name:"Integración",indices:[8,9]}]}),
  strategy("tarot-lunar","self","lunar","Interpretar la consulta según una fase lunar elegida",["semilla","crecimiento","revelación","liberación"],{phases:["General","Luna nueva","Creciente","Luna llena","Menguante"]}),
  strategy("tarot-oraculo","oracle","oracle-pair","Combinar una carta de tarot con un mensaje oracular original",["Carta de tarot"],{usesOracle:true}),
  strategy("lectura-libre","custom","free","Interpretar cada carta según el nombre personalizado de su posición",[],{dynamicPositions:true})
]);

export function getReadingStrategy(id) { return readingStrategies.find(item => item.id === id) ?? null; }

export function resolveReadingSettings(spread,session) {
  if (spread.id === "dos-cartas") {
    const variant = ({"Situación y consejo":"situation-advice","Tú y la otra persona":"self-other","A favor y en contra":"for-against","Problema y solución":"problem-solution","Presente y evolución":"present-evolution","Visible y oculto":"visible-hidden"})[session.twoCardLayout] ?? session.twoCardLayout ?? "situation-advice";
    return {cardAmount:2,positions:[...(twoCardVariants[variant] ?? twoCardVariants["situation-advice"])]};
  }
  if (spread.id === "si-o-no") {
    const cardAmount = String(session.yesNoCardCount).startsWith("3") ? 3 : 1;
    return {cardAmount,positions:cardAmount === 1 ? ["Orientación central"] : ["Impulso favorable","Factor desafiante","Síntesis de la respuesta"]};
  }
  if (spread.id === "tarot-oraculo") return {cardAmount:1,positions:["Carta de tarot"]};
  const cardAmount = Math.min(10,Math.max(1,Number(session.cardAmount || spread.cardCount)));
  const positions = (session.positions?.length === cardAmount ? session.positions : Array.from({length:cardAmount},(_,index) => spread.positions[index]?.name ?? `Posición ${index + 1}`));
  return {cardAmount,positions};
}
