import { getCardById } from "../data/cards.js";
import { getOracleCard } from "../data/oracle-cards.js";
import { getReadingStrategy } from "../data/reading-strategies.js";

const toneProfiles = Object.freeze({
  marseille:{name:"tradicional",openers:["En su lenguaje esencial","Desde una lectura directa","El símbolo central señala"],connectors:["dialoga con","refuerza","pone a prueba"],synthesis:"La estructura de la tirada concentra la atención en",closing:"Los símbolos orientan; tu criterio da el siguiente paso."},
  "rider-waite-smith":{name:"narrativo",openers:["La escena sugiere","La imagen abre una secuencia donde","Al observar la carta"],connectors:["continúa la historia de","cambia el tono de","crea una escena conjunta con"],synthesis:"La historia que forman las imágenes conduce hacia",closing:"Observa la historia, pero recuerda que tú sigues escribiendo el desenlace."},
  celtic:{name:"cíclico",openers:["Como una señal en el sendero","Dentro de este ciclo","La carta aparece como una raíz que"],connectors:["entrelaza sus raíces con","marca un cambio de estación respecto a","alimenta el ciclo iniciado por"],synthesis:"El ciclo de la tirada invita a cuidar",closing:"Cada estación tiene su tarea; escucha cuál corresponde ahora."},
  lunar:{name:"intuitivo",openers:["Bajo esta fase simbólica","En la marea emocional de la consulta","La intuición ilumina"],connectors:["refleja la marea de","deja en sombra un matiz de","completa una fase iniciada por"],synthesis:"La marea predominante pide atender",closing:"No toda claridad llega de golpe; algunas respuestas crecen por fases."},
  predictive:{name:"prospectivo",openers:["Como tendencia actual","En el escenario que se perfila","Si las condiciones continúan"],connectors:["acelera la tendencia de","modifica el escenario abierto por","introduce una variable frente a"],synthesis:"El movimiento más probable parece orientarse hacia",closing:"La tendencia describe un rumbo posible, no un resultado fijo."},
  introspective:{name:"introspectivo",openers:["Como espejo interior","La carta invita a reconocer","En el patrón que se hace visible"],connectors:["profundiza el patrón de","contrasta con la necesidad mostrada por","devuelve hacia dentro el mensaje de"],synthesis:"El patrón central ofrece una oportunidad de observar",closing:"La comprensión se vuelve cambio cuando puedes tratarte con honestidad y cuidado."},
  "spiritual-oracle":{name:"oracular",openers:["El mensaje es","La guía simbólica recuerda","Como afirmación para este momento"],connectors:["resuena con","bendice el aprendizaje de","equilibra el mensaje de"],synthesis:"La guía principal puede resumirse en",closing:"Recibe lo que resuene y deja ir lo que no acompañe tu experiencia."}
});

const oppositionPairs = [["comienzo","cierre"],["claridad","confusión"],["unión","aislamiento"],["avance","pausa"],["libertad","control"],["estabilidad","cambio"]];

export function generateInterpretation(input) {
  const normalized = normalizeInput(input);
  const analysis = analyzeCards(normalized.cards);
  const strategy = getReadingStrategy(normalized.spread.id);
  const tone = toneProfiles[normalized.deck.id] ?? toneProfiles["rider-waite-smith"];
  const positions = normalized.cards.map((item,index) => interpretPosition(item,index,normalized,analysis,tone,strategy));
  const connections = buildConnections(normalized.cards,tone);
  const tensions = detectTensions(normalized.cards,analysis);
  const patterns = buildPatterns(analysis,normalized.cards);
  const yesNo = normalized.spread.id === "si-o-no" ? interpretYesNo(normalized.cards) : null;
  const trendCard = findRoleCard(normalized.cards,["futuro","resultado","tendencia","escenario"]) ?? normalized.cards.at(-1);
  const adviceCard = findRoleCard(normalized.cards,["consejo","orientación","clave","acción"]) ?? normalized.cards.at(-1);
  const reflectionCard = analysis.highIntensityCards[0] ?? normalized.cards.at(-1)?.card;
  const relationalNotice = normalized.otherPersonName ? ` Cuando aparece ${normalized.otherPersonName}, hablamos de una representación simbólica del vínculo y no de acceso real a sus pensamientos o emociones.` : "";
  const introName = normalized.querentName ? `${normalized.querentName}, ` : "";
  const introduction = `${introName}${pick(["esta lectura toma tu pregunta como un punto de orientación, no como una sentencia.","las cartas abren una conversación simbólica alrededor de lo que estás explorando.","la tirada organiza distintas perspectivas sobre tu momento actual."],normalized.seed)} La consulta “${normalized.question}” se lee desde el tema de ${normalized.theme}. ${deckIntroduction(tone,normalized.deck)}${normalized.context ? " El contexto que compartiste matiza el significado sin convertirlo en una conclusión cerrada." : ""}${relationalNotice}`;
  const predominantEnergy = describePredominantEnergy(analysis);
  const synthesis = `${tone.synthesis} ${predominantEnergy.toLocaleLowerCase("es")}. ${synthesisFromPatterns(analysis,tensions)}${yesNo ? ` En la pregunta de sí o no, la respuesta orientativa es “${yesNo.answer}”.` : ""}`;
  const tendency = `La tendencia parece orientarse hacia ${lowerFirst(getOrientedMeaning(trendCard.card,trendCard.isReversed,"future"))} Esto no determina un resultado fijo: describe el rumbo que gana fuerza bajo las condiciones actuales${normalized.predictionPeriod ? ` durante ${normalized.predictionPeriod.toLocaleLowerCase("es")}` : ""}.`;
  const advice = `La energía actual invita a ${lowerFirst(adviceCard.card.adviceMeaning)} ${normalized.options.a && normalized.options.b ? `Antes de elegir entre “${normalized.options.a}” y “${normalized.options.b}”, compara cuál opción puede sostener mejor ese criterio.` : ""}`.trim();
  const warning = buildWarning(normalized,tensions,analysis,strategy);
  const clarity = calculateClarity(normalized.cards,tensions,analysis);
  const specialized = buildSpecializedResult(strategy,normalized,{positions,connections,tensions,patterns,yesNo,predominantEnergy,synthesis,tendency,advice,clarity});

  return Object.freeze({
    introduction,
    positionInterpretations:positions,
    connections,
    detectedPatterns:patterns,
    tensions,
    predominantEnergy,
    generalSynthesis:synthesis,
    tendency,
    advice,
    reflectiveWarning:warning,
    reflectionQuestion:reflectionCard?.reflectionQuestion ?? "¿Qué parte de esta lectura puedes convertir en una acción consciente?",
    finalPhrase:`${tone.closing} ${adviceCard.card.affirmation}`,
    clarity,
    yesNo,
    strategy:Object.freeze({id:strategy?.id ?? normalized.spread.id,family:strategy?.family ?? "general",layout:strategy?.layout ?? "standard",intent:strategy?.intent ?? "Interpretar la consulta"}),
    specialized
  });
}

export function interpretYesNo(items) {
  const scored = items.map(item => {
    const label = normalizeText(item.card.yesNoOrientation);
    let value = label.startsWith("si") ? 2 : label.startsWith("probablemente si") ? 1 : label.startsWith("no") ? -2 : label.startsWith("probablemente no") ? -1 : 0;
    const certainty = {"muy alta":1.35,"alta":1.15,"media":1,"baja":.7}[normalizeText(item.card.yesNoCertainty)] ?? 1;
    const intensity = ["Alta","Transformadora"].includes(item.card.intensity) ? 1.15 : 1;
    if (item.isReversed) value *= -.65;
    return { value:value * certainty * intensity, card:item.card.name, orientation:item.isReversed ? "invertida" : "derecha" };
  });
  const positives = scored.filter(item => item.value > .2).length;
  const negatives = scored.filter(item => item.value < -.2).length;
  const neutrals = scored.length - positives - negatives;
  const average = scored.reduce((sum,item) => sum + item.value,0) / Math.max(1,scored.length);
  const contradictory = positives > 0 && negatives > 0;
  let answer = average >= 1.15 ? "Sí" : average >= .35 ? "Probablemente sí" : average <= -1.15 ? "No" : average <= -.35 ? "Probablemente no" : "Aún no está definido";
  if (contradictory && Math.abs(average) < .85) answer = "Aún no está definido";
  const clarity = contradictory ? "Media" : Math.abs(average) >= 1.15 ? "Alta" : Math.abs(average) >= .35 ? "Media" : "Baja";
  return Object.freeze({ answer,clarity,score:Number(average.toFixed(2)),positiveCards:positives,negativeCards:negatives,neutralCards:neutrals,explanation:`La combinación reúne ${positives} ${positives === 1 ? "señal favorable" : "señales favorables"}, ${negatives} ${negatives === 1 ? "señal desafiante" : "señales desafiantes"} y ${neutrals} ${neutrals === 1 ? "señal neutral" : "señales neutrales"}. ${contradictory ? "Las orientaciones se contradicen y reducen la claridad de una respuesta cerrada." : "Las cartas mantienen una dirección relativamente coherente."} La respuesta es orientativa y no reemplaza tu decisión.` });
}

function normalizeInput(input) {
  const selected = (input.cards ?? []).map((selected,index) => ({...selected,isReversed:selected.isReversed ?? selected.orientation === "reversed",position:selected.position ?? {index,name:input.positions?.[index] ?? `Posición ${index + 1}`},card:getCardById(selected.cardId ?? selected.id)})).filter(item => item.card);
  const base = {...input,question:input.question?.trim() || "Consulta abierta",querentName:input.querentName?.trim() || "",otherPersonName:input.otherPersonName?.trim() || "",options:{a:"",b:"",...input.options},cards:selected,seed:`${input.sessionId ?? "arcana"}-${input.spread.id}-${selected.map(item => item.card.id).join("-")}`};
  return {...base,theme:inferTheme(base)};
}

function analyzeCards(items) {
  const countBy = getter => items.reduce((map,item) => { const key = getter(item); if (key) map[key] = (map[key] ?? 0) + 1; return map; },{});
  const suitCounts = countBy(item => item.card.suit);
  const elementCounts = countBy(item => item.card.element);
  const numberCounts = countBy(item => item.card.number);
  const dominantSuit = maxEntry(suitCounts);
  const dominantElement = maxEntry(elementCounts);
  const majorCount = items.filter(item => item.card.arcanaType === "major").length;
  const courtCards = items.filter(item => ["Sota","Caballero","Reina","Rey"].includes(item.card.rank)).map(item => item.card);
  const highIntensityCards = items.filter(item => ["Alta","Transformadora"].includes(item.card.intensity)).map(item => item.card);
  const repeatedNumbers = Object.entries(numberCounts).filter(([,count]) => count > 1).map(([number,count]) => ({number,count}));
  const reversedCount = items.filter(item => item.isReversed).length;
  return {total:items.length,suitCounts,elementCounts,numberCounts,dominantSuit,dominantElement,majorCount,courtCards,highIntensityCards,repeatedNumbers,reversedCount,elementBalance:Object.keys(elementCounts).length};
}

function interpretPosition(item,index,input,analysis,tone,strategy) {
  const previous = input.cards[index - 1];
  const next = input.cards[index + 1];
  const position = item.position.name;
  const role = positionRole(position);
  const base = getOrientedMeaning(item.card,item.isReversed,role);
  const contextual = getContextMeaning(item.card,input);
  const opener = pick(tone.openers,`${input.seed}-${index}`);
  let relation = "";
  if (previous) relation = ` ${item.card.name} ${pick(tone.connectors,`${input.seed}-connection-${index}`)} ${previous.card.name}; ${orientationRelation(previous,item)}.`;
  if (next && index === 0) relation += ` La carta siguiente, ${next.card.name}, ${next.isReversed === item.isReversed ? "mantiene" : "matiza"} esa dirección.`;
  const optionNote = normalizeText(position).includes("opcion a") && input.options.a ? ` Esta posición representa “${input.options.a}”.` : normalizeText(position).includes("opcion b") && input.options.b ? ` Esta posición representa “${input.options.b}”.` : "";
  const relational = input.otherPersonName ? " La lectura describe la dinámica que percibes y compartes, no una certeza sobre la vida interior de la otra persona." : "";
  const strategyGuide = strategy?.positionGuidance?.[index] ? ` Dentro de esta tirada, la posición se lee como ${strategy.positionGuidance[index]}.` : strategy?.dynamicPositions ? ` El nombre “${position}” define la función específica elegida para esta carta.` : "";
  return Object.freeze({position,index,cardId:item.card.id,cardName:item.card.name,orientation:item.isReversed ? "reversed" : "upright",orientationLabel:item.isReversed ? "Invertida" : "Derecha",keywords:item.isReversed ? item.card.reversedKeywords : item.card.uprightKeywords,text:`${opener}, ${position.toLocaleLowerCase("es")} muestra que ${lowerFirst(base)} ${contextual}${relation}${optionNote}${relational}${strategyGuide}`.replace(/\s+/g," ").trim()});
}

function buildConnections(items,tone) {
  return items.slice(0,-1).map((item,index) => { const next = items[index + 1]; const sameElement = item.card.element === next.card.element; const orientationShift = item.isReversed !== next.isReversed; return {from:item.card.name,to:next.card.name,text:`${item.card.name} ${pick(tone.connectors,`${item.card.id}-${next.card.id}`)} ${next.card.name}. ${sameElement ? `Comparten el elemento ${item.card.element}, por lo que su mensaje gana continuidad.` : `El paso de ${item.card.element} a ${next.card.element} cambia el modo de abordar la situación.`} ${orientationShift ? "El cambio de orientación introduce un matiz o una resistencia entre ambas posiciones." : "Sus orientaciones sostienen una dirección compatible."}`}; });
}

function buildPatterns(analysis,items) {
  const patterns = [];
  if (analysis.majorCount) patterns.push({type:"major",title:"Arcanos mayores",detail:`${analysis.majorCount} de ${analysis.total} cartas son arcanos mayores; la consulta toca ${analysis.majorCount > analysis.total / 2 ? "un aprendizaje estructural y significativo" : "un aprendizaje de fondo dentro de circunstancias cotidianas"}.`});
  if (analysis.dominantSuit) patterns.push({type:"suit",title:`Predominio de ${analysis.dominantSuit[0]}`,detail:`Aparece ${analysis.dominantSuit[1]} ${analysis.dominantSuit[1] === 1 ? "carta" : "cartas"} de este palo, concentrando la lectura en ${suitDomain(analysis.dominantSuit[0])}.`});
  if (analysis.repeatedNumbers.length) patterns.push({type:"number",title:"Números repetidos",detail:analysis.repeatedNumbers.map(item => `El ${item.number} se repite ${item.count} veces`).join("; ") + ", lo que refuerza una misma etapa del proceso."});
  if (analysis.courtCards.length) patterns.push({type:"court",title:"Figuras de corte",detail:`${analysis.courtCards.map(card => card.name).join(", ")} señalan modos de actuar, madurar o relacionarse con el poder personal.`});
  if (analysis.highIntensityCards.length) patterns.push({type:"intensity",title:"Alta intensidad",detail:`${analysis.highIntensityCards.length} ${analysis.highIntensityCards.length === 1 ? "carta concentra" : "cartas concentran"} energía alta o transformadora; conviene avanzar sin forzar conclusiones.`});
  if (analysis.elementBalance >= 4) patterns.push({type:"elements",title:"Equilibrio elemental",detail:"Los cuatro elementos están representados, ofreciendo recursos emocionales, mentales, prácticos y creativos."});
  return patterns;
}

function detectTensions(items,analysis) {
  const tensions = [];
  if (analysis.reversedCount && analysis.reversedCount < analysis.total) tensions.push(`La convivencia de ${analysis.reversedCount} ${analysis.reversedCount === 1 ? "carta invertida" : "cartas invertidas"} con cartas derechas sugiere que avance y revisión ocurren al mismo tiempo.`);
  const words = items.flatMap(item => item.isReversed ? item.card.reversedKeywords : item.card.uprightKeywords).map(normalizeText);
  oppositionPairs.forEach(([left,right]) => { if (words.some(word => word.includes(left)) && words.some(word => word.includes(right))) tensions.push(`Aparecen a la vez “${left}” y “${right}”: la lectura no pide escoger un extremo de inmediato, sino reconocer cómo se condicionan.`); });
  const yesValues = items.map(item => normalizeText(item.card.yesNoOrientation));
  if (yesValues.some(value => value.startsWith("si")) && yesValues.some(value => value.startsWith("no"))) tensions.push("Las orientaciones de sí y no no son uniformes; distintos aspectos de la consulta podrían avanzar a ritmos diferentes.");
  return [...new Set(tensions)];
}

function describePredominantEnergy(analysis) {
  if (analysis.dominantSuit && analysis.dominantSuit[1] >= Math.ceil(analysis.total / 2)) return `${analysis.dominantSuit[0]} predomina y dirige la atención hacia ${suitDomain(analysis.dominantSuit[0])}`;
  if (analysis.majorCount > analysis.total / 2) return "Los arcanos mayores predominan y señalan un momento de aprendizaje estructural";
  if (analysis.dominantElement) return `El elemento ${analysis.dominantElement[0]} es el más presente, con énfasis en ${elementDomain(analysis.dominantElement[0])}`;
  return "La energía está distribuida entre varias dimensiones y pide una mirada integradora";
}

function calculateClarity(items,tensions,analysis) {
  const certainty = items.reduce((sum,item) => sum + ({"muy alta":4,"alta":3,"media":2,"baja":1}[normalizeText(item.card.yesNoCertainty)] ?? 2),0) / Math.max(1,items.length);
  const orientationCoherence = analysis.reversedCount === 0 || analysis.reversedCount === analysis.total ? 1 : .65;
  const score = Math.max(1,Math.min(100,Math.round(certainty * 20 + orientationCoherence * 20 - tensions.length * 7)));
  return {level:score >= 72 ? "Alta" : score >= 48 ? "Media" : "Baja",score,explanation:score >= 72 ? "Las cartas mantienen una dirección relativamente coherente." : score >= 48 ? "El mensaje es legible, aunque contiene matices que necesitan tiempo o información adicional." : "La combinación presenta señales contrapuestas; conviene tratarla como una exploración abierta."};
}

function buildSpecializedResult(strategy,input,base) {
  const layout = strategy?.layout ?? "standard";
  const result = {layout,title:strategy?.intent ?? input.spread.name,phase:null,variant:null,response:null,explanation:null,changeFactor:null,sections:[],timeline:null,paths:null,groups:null,oracleCard:null,practicalQuestions:[]};
  const first = base.positions[0];
  const last = base.positions.at(-1);
  if (layout === "single") result.sections = [
    {title:"Respuesta central",content:first.text},{title:"Energía",content:base.predominantEnergy},{title:"Consejo",content:base.advice},
    {title:"Aspecto a considerar",content:base.tensions[0] ?? first.keywords.join(", ")},{title:"Frase final",content:input.cards[0].card.shortMessage}
  ];
  if (layout === "duo") { result.variant=input.twoCardLayout || `${base.positions[0]?.position} y ${base.positions[1]?.position}`; result.paths=base.positions.map(position => ({name:position.position,text:position.text})); }
  if (layout === "yes-no") {
    result.response=base.yesNo?.answer;
    result.explanation=base.yesNo?.explanation;
    result.changeFactor=base.tensions[0] ?? last?.text;
    result.sections=[{title:"Respuesta graduada",content:result.response},{title:"Explicación",content:result.explanation},{title:"Factor que puede cambiar el resultado",content:result.changeFactor}];
  }
  if (["timeline","forecast"].includes(layout)) { result.timeline=base.positions.map(position => ({name:position.position,text:position.text})); result.phase=input.predictionPeriod || (layout === "timeline" ? "Secuencia abierta" : "Periodo no definido"); result.sections=[{title:"Lectura temporal responsable",content:"Estas posiciones describen tendencias y movimientos posibles; no anuncian hechos inevitables."}]; }
  if (["relationship","essence"].includes(layout)) result.sections=[{title:"Marco del vínculo",content:"La lectura explora símbolos, percepciones y dinámicas relacionales. No accede a pensamientos privados ni confirma secretos."},{title:"Clave de cuidado",content:base.advice}];
  if (["mirror","counsel","hidden-truth"].includes(layout)) result.sections=[{title:"Lectura introspectiva",content:`${strategy.intent}. ${base.synthesis}`},{title:"Movimiento interior",content:base.advice}];
  if (["decision","crossroads"].includes(layout)) {
    const a = base.positions.find(position => normalizeText(position.position).includes("opcion a") || normalizeText(position.position).includes("camino a")) ?? base.positions[1];
    const b = base.positions.find(position => normalizeText(position.position).includes("opcion b") || normalizeText(position.position).includes("camino b")) ?? base.positions[2];
    result.paths=[{name:input.options.a || "Opción A",benefit:a?.text,risk:a?.keywords?.join(", "),condition:"Revisa si este camino puede sostenerse con tus recursos y valores actuales."},{name:input.options.b || "Opción B",benefit:b?.text,risk:b?.keywords?.join(", "),condition:"Considera qué necesitaría cambiar para que esta vía fuera viable."}];
    result.practicalQuestions=["¿Qué opción preserva mejor tus prioridades no negociables?","¿Qué riesgo puedes gestionar y cuál excede tus límites?","¿Qué información concreta falta antes de decidir?"];
  }
  if (layout === "balance") result.paths=base.positions.slice(0,2).map(position => ({name:position.position,benefit:position.text,risk:position.keywords.join(", "),condition:"Pondera este factor junto con la síntesis, no de forma aislada."}));
  if (layout === "work") result.sections=[{title:"Aplicación profesional",content:base.advice},{title:"Límite responsable",content:"Esta lectura no sustituye orientación laboral, contractual o profesional."}];
  if (layout === "money") result.sections=[{title:"Aplicación material",content:base.advice},{title:"Límite responsable",content:"Esta lectura no constituye asesoría financiera ni promete ganancias."}];
  if (["celtic-cross","emotional-celtic"].includes(layout)) result.groups=(strategy.groups ?? []).map(group => ({name:group.name,items:group.indices.map(index => base.positions[index]).filter(Boolean),summary:group.indices.map(index => base.positions[index]?.keywords?.[0]).filter(Boolean).join(" · ")}));
  if (layout === "lunar") { result.phase=input.moonPhase || "General"; result.sections=[{title:`Clave de ${result.phase}`,content:lunarPhaseMessage(result.phase)},{title:"Ritmo sugerido",content:base.advice}]; }
  if (layout === "oracle-pair") { const oracle=getOracleCard(input.seed); result.oracleCard=oracle; result.sections=[{title:"Mensaje combinado",content:`${first.cardName} aporta ${first.keywords.join(", ")}. ${oracle.name} responde con ${oracle.centralWord.toLocaleLowerCase("es")}: ${oracle.message}`},{title:"Guía",content:oracle.advice},{title:"Sombra",content:oracle.shadow},{title:"Afirmación",content:oracle.affirmation}]; }
  if (layout === "free" || layout === "custom") result.sections=base.positions.map(position => ({title:position.position,content:position.text}));
  if (!result.sections.length && !result.paths && !result.groups && !result.timeline) result.sections=[{title:input.spread.name,content:`${strategy?.intent ?? "La estrategia"}. ${base.synthesis}`}];
  return Object.freeze(result);
}

function lunarPhaseMessage(phase) { return ({"Luna nueva":"Sembrar una intención sin exigir resultados inmediatos.",Creciente:"Dar forma, práctica y alimento a lo que está creciendo.","Luna llena":"Mirar con claridad lo que alcanzó visibilidad y plenitud.",Menguante:"Liberar, simplificar y devolver energía al descanso.",General:"Recorrer el ciclo completo: intención, crecimiento, revelación y liberación."})[phase] ?? "Escuchar el ritmo emocional antes de intervenir."; }

function getContextMeaning(card,input) {
  const category = input.spread.category;
  const meaning = category === "love" ? card.loveMeaning : category === "work" ? card.workMeaning : category === "money" ? card.moneyMeaning : ["self-knowledge","deep"].includes(category) ? card.emotionalMeaning : category === "decisions" ? card.adviceMeaning : card.opportunityMeaning;
  return `En el tema de ${input.theme}, ${lowerFirst(meaning)}`;
}

function getOrientedMeaning(card,isReversed,role = "general") {
  if (isReversed) return card.reversedMeaning;
  if (role === "past") return card.pastMeaning;
  if (role === "present") return card.presentMeaning;
  if (role === "future") return card.futureMeaning;
  if (role === "advice") return card.adviceMeaning;
  if (role === "obstacle") return card.obstacleMeaning;
  if (role === "opportunity") return card.opportunityMeaning;
  return card.uprightMeaning;
}

function positionRole(name) { const value = normalizeText(name); if (value.includes("pasado") || value.includes("base")) return "past"; if (value.includes("presente") || value.includes("actual")) return "present"; if (value.includes("futuro") || value.includes("resultado") || value.includes("tendencia")) return "future"; if (value.includes("consejo") || value.includes("orientacion") || value.includes("clave") || value.includes("accion")) return "advice"; if (value.includes("bloque") || value.includes("desafio") || value.includes("riesgo") || value.includes("contra")) return "obstacle"; if (value.includes("oportunidad") || value.includes("favor") || value.includes("posibilidad")) return "opportunity"; return "general"; }
function findRoleCard(items,terms) { return items.find(item => terms.some(term => normalizeText(item.position.name).includes(term))); }
function orientationRelation(previous,current) { if (previous.isReversed === current.isReversed) return "ambas sostienen una orientación semejante"; return "una carta impulsa mientras la otra pide revisar o interiorizar"; }
function buildWarning(input,tensions,analysis,strategy) { if (strategy?.financialNotice) return "Esta lectura no constituye asesoría financiera, no promete ingresos y no sustituye la revisión de datos o la orientación de un profesional cualificado."; if (strategy?.professionalNotice) return "Esta lectura no sustituye orientación profesional, contractual o laboral. Contrasta sus símbolos con información verificable de tu contexto."; if (input.otherPersonName || strategy?.responsibleRelationship) return `Esta lectura no confirma lo que ${input.otherPersonName || "otra persona"} piensa, siente o hace. Usa los símbolos para revisar la dinámica, buscar comunicación directa y cuidar los límites.`; if (strategy?.trendOnly || input.spread.category === "future") return "La lectura describe tendencias condicionales, no promete hechos futuros. Cambios de contexto y decisiones posteriores pueden modificar el escenario."; if (tensions.length) return "Las contradicciones no son errores: pueden señalar ambivalencia, información incompleta o áreas que avanzan a ritmos distintos. Evita tomar una sola carta como verdad definitiva."; if (analysis.highIntensityCards.length) return "La intensidad simbólica no equivale a una desgracia ni a un diagnóstico. Tómala como una invitación a observar cambios y recursos con serenidad."; return "El tarot se ofrece como entretenimiento, reflexión y autoconocimiento. No sustituye asesoramiento profesional ni determina tus decisiones."; }
function synthesisFromPatterns(analysis,tensions) { const first = analysis.majorCount > analysis.total / 2 ? "El número de arcanos mayores da peso al aprendizaje general." : "Las cartas cotidianas muestran que pequeños actos pueden modificar el proceso."; return `${first} ${tensions.length ? "Las tensiones detectadas piden integrar perspectivas antes de cerrar una conclusión." : "La combinación mantiene suficiente coherencia para traducir el mensaje en un paso concreto."}`; }
function deckIntroduction(tone,deck) { return `La baraja ${deck.name}, con enfoque ${tone.name}, orienta el lenguaje hacia ${deck.focus.toLocaleLowerCase("es")}.`; }
function suitDomain(suit) { return ({Bastos:"acción, iniciativa y creatividad",Copas:"emociones, vínculos e intuición",Espadas:"verdad, decisiones y conflicto mental",Oros:"recursos, cuerpo, trabajo y estabilidad"})[suit] ?? "experiencias cotidianas"; }
function elementDomain(element) { return ({Fuego:"acción y voluntad",Agua:"emoción e intuición",Aire:"pensamiento y comunicación",Tierra:"realidad práctica y estabilidad"})[element] ?? "integración"; }
function categoryLabel(category) { return ({love:"amor y vínculos",work:"trabajo",money:"recursos",decisions:"decisiones",future:"tendencias futuras","self-knowledge":"autoconocimiento",deep:"la pregunta profunda",quick:"tu momento actual"})[category] ?? "tu consulta"; }
function inferTheme(input) { if (input.topic) return input.topic.toLocaleLowerCase("es"); const text = normalizeText(`${input.question} ${input.context ?? ""}`); if (/amor|pareja|relacion|siente|vinculo/.test(text)) return "amor y vínculos"; if (/trabajo|empleo|carrera|proyecto/.test(text)) return "trabajo y vocación"; if (/dinero|finanz|recurso|deuda/.test(text)) return "recursos y estabilidad"; if (/decidir|decision|opcion|camino/.test(text)) return "decisiones"; return categoryLabel(input.spread.category); }
function maxEntry(object) { return Object.entries(object).sort((a,b) => b[1] - a[1])[0] ?? null; }
function pick(options,seed) { let hash = 0; for (const char of String(seed)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0; return options[hash % options.length]; }
function normalizeText(value) { return String(value ?? "").toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,""); }
function lowerFirst(value) { const text = String(value ?? "").trim(); return text ? text[0].toLocaleLowerCase("es") + text.slice(1) : text; }
