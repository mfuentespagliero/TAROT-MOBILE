import { APP_CONFIG } from "../config.js";
import { decks, getDeckById } from "../data/decks.js";
import { getCategoryById, getSpreadById } from "../data/spreads.js";
import { selectionMethods } from "../data/fields.js";
import { getCardById } from "../data/cards.js";
import { renderDynamicForm, bindDynamicForm } from "../components/dynamic-form.js";
import { loadReadingSession, saveReadingSession } from "../services/reading-session.js";
import { associateCardsWithPositions, getCleanDeck, registerManualSelection, resetSelection, selectCardsAutomatically, shuffleDeck, undoManualSelection } from "../services/tarot-engine.js";
import { generateInterpretation } from "../services/interpretation-engine.js";
import { getPreferences, openReading, savePreferences, saveReading, setFavorite } from "../services/storage-service.js";
import { copyReading, downloadReading, shareReading } from "../services/share-service.js";
import { showToast } from "../components/toast.js";
import { getReadingId } from "../router.js";

const flowSteps = [
  {number:1,id:"detail",label:"Detalle"},{number:2,id:"deck",label:"Baraja"},{number:3,id:"form",label:"Consulta"},{number:4,id:"summary",label:"Resumen"},{number:5,id:"shuffling",label:"Barajado"}
];

const dailyFallback = {
  id:"carta-del-dia",slug:"carta-del-dia",name:"Carta del día",category:"quick",description:"Una energía simbólica para acompañar tu jornada.",
  extendedDescription:"Una pausa cotidiana para conectar con una imagen y una pregunta de reflexión.",icon:"✦",cardCount:1,durationMinutes:3,
  positions:[{id:"daily-message",name:"Mensaje del día",description:"La energía que puede acompañarte hoy."}],requiredFields:["selectionMethod"],optionalFields:["question","querentName","useReversed"],selectionMethods:["manual","automatic"],allowsReversed:true,responsibleNotice:null
};

export function renderReadingPage() {
  const target = document.querySelector("[data-reading-page]");
  if (!target) return;
  const spread = getSpreadById(getReadingId()) ?? dailyFallback;
  let session = loadReadingSession(spread);
  if (new URLSearchParams(location.search).get("ampliar") === "carta-dia" && !session.question) session = persist({...session,question:"¿Qué aspecto del mensaje de mi Carta del Día puedo comprender mejor?"});
  let activeDeck = shuffleDeck(getCleanDeck());
  if (!session.deckId && session.status !== "deck") session = persist({...session,status:"deck"});
  document.title = `${spread.name} · ${APP_CONFIG.name}`;

  const render = () => {
    target.innerHTML = `<div class="reading-flow">${progressTemplate(session.status)}<div class="flow-stage" data-flow-stage>${stageTemplate(spread,session,activeDeck)}</div></div>`;
    bindStage();
  };
  const goTo = status => { session = persist({...session,status}); render(); window.scrollTo({top:0,behavior:"smooth"}); };
  const bindStage = () => {
    const stage = target.querySelector("[data-flow-stage]");
    if (session.status === "deck") {
      stage.addEventListener("click",event => {
        const deckButton = event.target.closest("[data-select-deck]");
        if (deckButton) { session = persist({...session,deckId:deckButton.dataset.selectDeck}); render(); return; }
        if (event.target.closest("[data-next-step]") && session.deckId) goTo("form");
      });
    }
    if (session.status === "form") {
      const form = stage.querySelector("[data-consultation-form]");
      bindDynamicForm(form,spread,session,values => { session = persist({...values,status:"summary"}); render(); },values => { session = persist({...values,status:"deck"}); render(); },values => { session = persist({...values,status:"form"}); });
    }
    if (session.status === "summary") stage.addEventListener("click",event => {
      if (event.target.closest("[data-edit-session]")) goTo("form");
      if (event.target.closest("[data-start-reading]")) { session = persist({...session,selectedCards:resetSelection(),hasShuffled:false,revealedCount:0}); goTo("shuffling"); }
    });
    if (session.status === "shuffling") bindShufflingStage(stage);
    if (session.status === "selection") bindSelectionStage(stage);
    if (session.status === "reveal") bindRevealStage(stage);
    if (session.status === "result") bindResultStage(stage);
  };

  const bindShufflingStage = stage => {
    const sound = stage.querySelector("[data-sound-toggle]");
    sound?.addEventListener("change",() => { session = persist({...session,soundEnabled:sound.checked}); });
    stage.addEventListener("click",event => {
      if (event.target.closest("[data-back-summary]")) { goTo("summary"); return; }
      if (event.target.closest("[data-shuffle]")) {
        const visual = stage.querySelector("[data-shuffle-visual]");
        const button = stage.querySelector("[data-shuffle]");
        const ready = stage.querySelector("[data-ready]");
        visual?.classList.remove("is-shuffling"); void visual?.offsetWidth; visual?.classList.add("is-shuffling");
        button.disabled = true; if (session.soundEnabled) playShuffleSound(); navigator.vibrate?.(25); activeDeck = shuffleDeck(getCleanDeck());
        window.setTimeout(() => { session = persist({...session,hasShuffled:true}); button.disabled = false; ready.disabled = false; const status = stage.querySelector("[data-shuffle-status]"); if (status) status.textContent = "El mazo está listo"; },reducedMotion() ? 50 : 1050);
      }
      if (event.target.closest("[data-ready]") && session.hasShuffled) goTo("selection");
    });
  };

  const bindSelectionStage = stage => {
    if (session.selectionMethod === "automatic") {
      if (session.selectedCards.length) { goTo("reveal"); return; }
      window.setTimeout(() => {
        const selected = selectCardsAutomatically({deck:activeDeck,count:session.cardAmount,allowReversed:session.useReversed,reversedProbability:session.reversedProbability});
        session = persist({...session,selectedCards:associateCardsWithPositions(selected,session.positions),revealedCount:0,status:"reveal"}); render();
      },reducedMotion() ? 50 : 900);
      return;
    }
    stage.addEventListener("click",event => {
      const cardButton = event.target.closest("[data-manual-card]");
      if (cardButton) {
        const card = getCardById(cardButton.dataset.manualCard);
        const selected = registerManualSelection(session.selectedCards,card,{maxCards:session.cardAmount,allowReversed:session.useReversed,reversedProbability:session.reversedProbability});
        if (selected.length !== session.selectedCards.length) { navigator.vibrate?.(15); session = persist({...session,selectedCards:selected}); render(); }
      }
      if (event.target.closest("[data-undo-card]") && session.selectedCards.length) { session = persist({...session,selectedCards:undoManualSelection(session.selectedCards)}); render(); }
      if (event.target.closest("[data-confirm-cards]") && session.selectedCards.length === session.cardAmount) { session = persist({...session,selectedCards:associateCardsWithPositions(session.selectedCards,session.positions),revealedCount:0,status:"reveal"}); render(); }
      if (event.target.closest("[data-restart-shuffle]")) { session = persist({...session,selectedCards:resetSelection(),hasShuffled:false,status:"shuffling"}); render(); }
    });
  };

  const bindRevealStage = stage => {
    stage.addEventListener("click",event => {
      if (event.target.closest("[data-reveal-next]") && session.revealedCount < session.selectedCards.length) { session = persist({...session,revealedCount:session.revealedCount + 1}); navigator.vibrate?.(18); render(); }
      if (event.target.closest("[data-continue-result]") && session.revealedCount === session.selectedCards.length) goTo("result");
    });
  };
  const bindResultStage = stage => {
    stage.addEventListener("click",async event => {
      if (event.target.closest("[data-back-reveal]")) { goTo("reveal"); return; }
      const record=buildReadingRecord(spread,session);
      if (event.target.closest("[data-save-reading]")) { const result=saveReading(record); showToast(result.ok?"Lectura guardada en este dispositivo":storageErrorMessage(result.error),result.ok?"success":"error"); render(); return; }
      if (event.target.closest("[data-favorite-reading]")) {
        let saved=openReading(session.id); if(!saved){const result=saveReading(record);if(!result.ok){showToast(storageErrorMessage(result.error),"error");return;}saved=result.reading;}
        const result=setFavorite(session.id,!saved.favorite); showToast(result.ok?(result.reading.favorite?"Lectura marcada como favorita":"Lectura quitada de favoritas"):"No se pudo actualizar la lectura",result.ok?"success":"error"); render(); return;
      }
      const shareTrigger=event.target.closest("[data-open-share]");
      if(shareTrigger){const dialog=stage.querySelector("[data-share-dialog]");dialog.dataset.shareAction=shareTrigger.dataset.openShare;dialog.showModal();return;}
      if(event.target.closest("[data-close-share]")){stage.querySelector("[data-share-dialog]")?.close();return;}
      const shareAction=event.target.closest("[data-share-action]");
      if(shareAction){
        const dialog=stage.querySelector("[data-share-dialog]"),options=readShareOptions(dialog);savePreferences({sharePrivacy:options});
        const action=shareAction.dataset.shareAction; const result=action==="share"?await shareReading(record,options):action==="copy"?await copyReading(record,options):downloadReading(record,options);
        if(result.ok){dialog.close();showToast(result.method==="download"?"Archivo preparado":"Lectura copiada o compartida","success");}else if(result.error!=="cancelled")showToast("No fue posible completar la acción","error");
        return;
      }
      if(event.target.closest("[data-repeat-question]")){session=persist({...session,id:newSessionId(),createdAt:new Date().toISOString(),selectedCards:[],revealedCount:0,hasShuffled:false,status:"shuffling"});activeDeck=shuffleDeck(getCleanDeck());render();window.scrollTo({top:0,behavior:"smooth"});}
    });
  };
  render();
}

function stageTemplate(spread,session,activeDeck) {
  if (session.status === "form") return formStage(spread,session);
  if (session.status === "summary") return summaryStage(spread,session);
  if (session.status === "shuffling") return shufflingStage(spread,session);
  if (session.status === "selection") return selectionStage(spread,session,activeDeck);
  if (session.status === "reveal") return revealStage(spread,session);
  if (session.status === "result") return resultStage(spread,session);
  return deckStage(spread,session);
}

function progressTemplate(status) {
  const current = ["selection","reveal","result"].includes(status) ? 5 : flowSteps.find(step => step.id === status)?.number ?? 2;
  return `<nav class="flow-progress" aria-label="Progreso de preparación"><ol>${flowSteps.map(step => `<li class="${step.number < current ? "is-complete" : step.number === current ? "is-current" : ""}" ${step.number === current ? 'aria-current="step"' : ""}><span>${step.number < current ? "✓" : step.number}</span><b>${step.label}</b></li>`).join("")}</ol></nav>`;
}

function stageHeader(eyebrow,title,copy) { return `<header class="flow-heading"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1><p>${copy}</p></header>`; }

function deckStage(spread,session) {
  return `${stageHeader(`Paso 2 · ${spread.name}`,"Elige la voz de tu lectura","Las cartas comparten una base simbólica, pero cada baraja cambia el tono, el vocabulario y el enfoque de la interpretación.")}
    <div class="deck-grid">${decks.map(deck => deckTemplate(deck,session.deckId === deck.id)).join("")}</div>
    <div class="flow-actions"><a class="button button--ghost" href="index.html#lecturas">← Volver al catálogo</a><button class="button button--primary" type="button" data-next-step ${session.deckId ? "" : "disabled"}>Continuar con esta baraja →</button></div>`;
}

function deckTemplate(deck,selected) {
  const colors = deck.visual.colors;
  return `<article class="deck-option ${selected ? "is-selected" : ""}" style="--deck-a:${colors[0]};--deck-b:${colors[1]};--deck-c:${colors[2]}">
    <div class="deck-option__visual" aria-hidden="true"><div class="deck-mini-card"><span>☾</span><i>✦</i></div></div>
    <div class="deck-option__content"><div class="deck-option__title"><h2>${deck.name}</h2>${selected ? '<span class="selected-badge">Seleccionada</span>' : ""}</div><p>${deck.description}</p><dl><div><dt>Estilo</dt><dd>${deck.interpretationStyle}</dd></div><div><dt>Enfoque</dt><dd>${deck.focus}</dd></div></dl>
      <button class="button ${selected ? "button--secondary" : "button--ghost"}" type="button" data-select-deck="${deck.id}" aria-pressed="${selected}">${selected ? "Baraja seleccionada ✓" : "Seleccionar baraja"}</button>
    </div></article>`;
}

function formStage(spread,session) {
  return `${stageHeader(`Paso 3 · ${spread.name}`,"Prepara tu consulta","Completa solo la información que esta tirada necesita. Puedes volver atrás sin perder lo escrito.")}${renderDynamicForm(spread,session)}`;
}

function summaryStage(spread,session) {
  const deck = getDeckById(session.deckId);
  const method = selectionMethods.find(item => item.id === session.selectionMethod)?.name ?? "Sin seleccionar";
  const rows = [
    ["Tipo de lectura",spread.name],["Baraja",deck?.name ?? "—"],["Pregunta",session.question || "Consulta abierta"],
    ["Cantidad",`${session.cardAmount} ${session.cardAmount === 1 ? "carta" : "cartas"}`],["Cartas invertidas",session.useReversed ? "Sí" : "No"],["Selección",method]
  ];
  if (session.querentName) rows.push(["Consultante",session.querentName]);
  if (session.otherPersonName) rows.push(["Otra persona",session.otherPersonName]);
  if (session.options.a || session.options.b) rows.push(["Opciones",`${session.options.a} / ${session.options.b}`]);
  if (session.twoCardLayout) rows.push(["Configuración",session.twoCardLayout]);
  if (session.yesNoCardCount) rows.push(["Formato sí o no",session.yesNoCardCount]);
  if (session.predictionPeriod) rows.push(["Periodo",session.predictionPeriod]);
  if (session.moonPhase) rows.push(["Fase lunar",session.moonPhase]);
  return `${stageHeader("Paso 4 · Revisa antes de comenzar","Tu consulta está preparada","Comprueba que la intención y las opciones representan lo que deseas explorar.")}
    <article class="session-summary"><div class="summary-symbol" aria-hidden="true">${spread.icon}</div><dl>${rows.map(([label,value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>
      <div class="summary-positions"><h2>Posiciones</h2><ol>${session.positions.map((position,index) => `<li><span>${index + 1}</span>${escapeHtml(position)}</li>`).join("")}</ol></div>
    </article><aside class="privacy-note privacy-note--summary"><span aria-hidden="true">◇</span><p>Esta sesión permanece en este navegador y todavía no se incorpora al historial.</p></aside>
    <div class="flow-actions"><button class="button button--ghost" type="button" data-edit-session>← Editar consulta</button><button class="button button--primary" type="button" data-start-reading>Comenzar y barajar →</button></div>`;
}

function shufflingStage(spread,session) {
  const deck = getDeckById(session.deckId);
  return `<section class="shuffle-stage" aria-labelledby="shuffle-title"><div class="shuffle-visual" data-shuffle-visual aria-hidden="true"><div class="shuffle-card shuffle-card--one"></div><div class="shuffle-card shuffle-card--two"></div><div class="shuffle-card shuffle-card--three"><span>☾</span><i>✦</i></div></div><p class="eyebrow">Paso 5 · Baraja con intención</p><h1 id="shuffle-title">Concentra tu pregunta</h1><p>Respira mientras mezclas <strong>${deck?.name}</strong>. No necesitas vaciar la mente: basta con volver suavemente a aquello que deseas explorar.</p>
    <label class="sound-option"><input type="checkbox" data-sound-toggle ${session.soundEnabled ? "checked" : ""}><span aria-hidden="true">♪</span><b>Sonido suave al barajar</b><small>Desactivado por defecto</small></label>
    <div class="shuffle-status" role="status"><span></span><b data-shuffle-status>${session.hasShuffled ? "El mazo está listo" : "Esperando para barajar"}</b></div>
    <div class="shuffle-actions"><button class="button button--ghost" type="button" data-back-summary>← Volver</button><button class="button button--secondary" type="button" data-shuffle>Barajar</button><button class="button button--primary" type="button" data-ready ${session.hasShuffled ? "" : "disabled"}>Estoy listo/a →</button></div>
  </section>`;
}

function selectionStage(spread,session,activeDeck) {
  if (session.selectionMethod === "automatic") return `<section class="automatic-stage" aria-live="polite"><div class="auto-deal" aria-hidden="true"><span></span><span></span><span></span></div><p class="eyebrow">Selección automática</p><h1>Las cartas están saliendo</h1><p>El sistema está eligiendo ${session.cardAmount} ${session.cardAmount === 1 ? "carta" : "cartas"} sin repeticiones y conservando su orientación.</p></section>`;
  const chosenIds = new Set(session.selectedCards.map(card => card.cardId));
  const complete = session.selectedCards.length === session.cardAmount;
  return `${stageHeader("Selección manual","Elige tus cartas",`Selecciona exactamente ${session.cardAmount} ${session.cardAmount === 1 ? "carta" : "cartas"}. Puedes recorrer la cuadrícula con Tab y elegir con Enter o espacio.`)}
    <div class="selection-counter" role="status" aria-live="polite">Has elegido <strong>${session.selectedCards.length}</strong> de <strong>${session.cardAmount}</strong> ${session.cardAmount === 1 ? "carta" : "cartas"}</div>
    <div class="manual-deck" role="group" aria-label="Cartas boca abajo para seleccionar">${activeDeck.map((card,index) => {
      const selected = chosenIds.has(card.id); const locked = !selected && complete;
      return `<button class="pick-card ${selected ? "is-selected" : ""}" type="button" data-manual-card="${card.id}" aria-label="Carta boca abajo ${index + 1}${selected ? ", seleccionada" : ""}" aria-pressed="${selected}" ${locked ? "disabled" : ""}><span>${selected ? session.selectedCards.findIndex(item => item.cardId === card.id) + 1 : "☾"}</span><i aria-hidden="true">✦</i></button>`;
    }).join("")}</div>
    <div class="selection-actions"><button class="button button--ghost" type="button" data-restart-shuffle>← Volver a barajar</button><button class="button button--ghost" type="button" data-undo-card ${session.selectedCards.length ? "" : "disabled"}>Deshacer última</button><button class="button button--primary" type="button" data-confirm-cards ${complete ? "" : "disabled"}>Confirmar selección →</button></div>`;
}

function revealStage(spread,session) {
  const allRevealed = session.revealedCount === session.selectedCards.length;
  const layoutClass = spread.id === "cruz-celta" ? "spread-layout--celtic" : session.cardAmount >= 7 ? "spread-layout--complex" : "";
  return `${stageHeader("Revelación",allRevealed ? "Tu tirada está revelada" : "Revela una carta a la vez","Observa primero la posición y la imagen. La interpretación extensa se construirá en una etapa posterior.")}
    <div class="reveal-layout ${layoutClass}" aria-live="polite">${session.selectedCards.map((selected,index) => revealCardTemplate(selected,index < session.revealedCount,index)).join("")}</div>
    <div class="reveal-actions">${allRevealed ? `<button class="button button--primary" type="button" data-continue-result>Continuar al resultado →</button>` : `<button class="button button--primary" type="button" data-reveal-next>Revelar carta ${session.revealedCount + 1} de ${session.selectedCards.length}</button>`}</div>`;
}

function revealCardTemplate(selected,revealed,index) {
  const card = getCardById(selected.cardId);
  const orientation = selected.isReversed ? "Invertida" : "Derecha";
  const keywords = selected.isReversed ? card.reversedKeywords : card.uprightKeywords;
  return `<article class="reading-card-reveal ${revealed ? "is-revealed" : ""}" aria-label="${selected.position.name}: ${revealed ? `${card.name}, ${orientation}` : "carta boca abajo"}">
    <p class="reveal-position"><span>${index + 1}</span>${escapeHtml(selected.position.name)}</p><div class="flip-card"><div class="flip-card__inner"><div class="flip-face flip-face--back" aria-hidden="${revealed}"><span>☾</span><i>✦</i></div><div class="flip-face flip-face--front ${selected.isReversed ? "is-card-reversed" : ""}" aria-hidden="${!revealed}"><span class="revealed-face__number">${card.arcanaType === "major" ? card.number : card.rank}</span><div class="revealed-face__art" aria-hidden="true">${card.symbol}</div><h2>${card.name}</h2><b>${orientation}</b></div></div></div>
    ${revealed ? `<details class="brief-detail"><summary>Ver detalle breve</summary><p>${card.shortMessage}</p><div>${keywords.map(keyword => `<span>${keyword}</span>`).join("")}</div></details>` : `<span class="sr-only">Aún no revelada</span>`}
  </article>`;
}

function resultStage(spread,session) {
  const deck = getDeckById(session.deckId);
  const interpretation = generateInterpretation({sessionId:session.id,question:session.question,querentName:session.querentName,otherPersonName:session.otherPersonName,relationship:session.relationship,context:session.context,topic:session.topic,spread,deck,positions:session.positions,cards:session.selectedCards,predictionPeriod:session.predictionPeriod,moonPhase:session.moonPhase,twoCardLayout:session.twoCardLayout,yesNoCardCount:session.yesNoCardCount,options:session.options});
  const date = new Intl.DateTimeFormat("es",{dateStyle:"long",timeStyle:"short"}).format(new Date(session.createdAt));
  const saved=openReading(session.id); const preferences=getPreferences().sharePrivacy??{};
  return `<section class="reading-result result-layout-${interpretation.strategy.layout}" aria-labelledby="result-title">
    <header class="result-hero"><p class="eyebrow">Lectura completa</p><h1 id="result-title">${escapeHtml(spread.name)}</h1><p>${escapeHtml(interpretation.introduction)}</p><dl><div><dt>Pregunta</dt><dd>${escapeHtml(session.question || "Consulta abierta")}</dd></div><div><dt>Baraja</dt><dd>${escapeHtml(deck.name)}</dd></div><div><dt>Fecha</dt><dd>${escapeHtml(date)}</dd></div></dl></header>
    ${interpretation.yesNo ? yesNoResultTemplate(interpretation.yesNo) : ""}
    ${specializedResultTemplate(interpretation.specialized)}
    <section class="result-cards" aria-labelledby="cards-result-title"><h2 id="cards-result-title">Cartas y posiciones</h2>${interpretation.positionInterpretations.map((position,index) => positionResultTemplate(position,session.selectedCards[index])).join("")}</section>
    <div class="result-columns">
      ${resultDetails("Patrones detectados",interpretation.detectedPatterns.length ? interpretation.detectedPatterns.map(pattern => `<article><h3>${escapeHtml(pattern.title)}</h3><p>${escapeHtml(pattern.detail)}</p></article>`).join("") : "<p>No aparece un patrón dominante; la diversidad de cartas invita a integrar varias perspectivas.</p>",true)}
      ${resultDetails("Conexiones entre cartas",interpretation.connections.length ? interpretation.connections.map(connection => `<p><strong>${escapeHtml(connection.from)} → ${escapeHtml(connection.to)}</strong><br>${escapeHtml(connection.text)}</p>`).join("") : "<p>Al ser una lectura de una carta, su mensaje se concentra en una sola imagen.</p>",true)}
      ${resultDetails("Tensiones y contradicciones",interpretation.tensions.length ? `<ul>${interpretation.tensions.map(tension => `<li>${escapeHtml(tension)}</li>`).join("")}</ul>` : "<p>Las cartas mantienen una dirección compatible, sin contradicciones destacadas.</p>")}
      ${resultDetails("Energía predominante",`<p>${escapeHtml(interpretation.predominantEnergy)}</p><div class="clarity-meter"><span style="--clarity:${interpretation.clarity.score}%"></span></div><small>Claridad ${escapeHtml(interpretation.clarity.level)} · ${escapeHtml(interpretation.clarity.explanation)}</small>`)}
    </div>
    <section class="result-synthesis"><p class="eyebrow">Síntesis general</p><h2>El hilo de la lectura</h2><p>${escapeHtml(interpretation.generalSynthesis)}</p><div class="synthesis-grid"><article><h3>Tendencia</h3><p>${escapeHtml(interpretation.tendency)}</p></article><article><h3>Consejo</h3><p>${escapeHtml(interpretation.advice)}</p></article></div></section>
    <aside class="result-warning"><span aria-hidden="true">◇</span><div><h2>Una guía, no una certeza</h2><p>${escapeHtml(interpretation.reflectiveWarning)}</p></div></aside>
    <blockquote class="result-reflection"><p>${escapeHtml(interpretation.reflectionQuestion)}</p><footer>${escapeHtml(interpretation.finalPhrase)}</footer></blockquote>
    <section class="result-actions" aria-labelledby="result-actions-title"><p class="eyebrow">Tu lectura, tus datos</p><h2 id="result-actions-title">¿Qué deseas hacer ahora?</h2><p>La lectura no se guarda hasta que eliges hacerlo. Todo permanece en este dispositivo.</p><div class="result-actions__grid"><button class="button button--primary" type="button" data-save-reading>${saved?"Lectura guardada ✓":"Guardar lectura"}</button><button class="button button--ghost ${saved?.favorite?"is-favorite":""}" type="button" data-favorite-reading aria-pressed="${Boolean(saved?.favorite)}">★ ${saved?.favorite?"Favorita":"Marcar favorita"}</button><button class="button button--secondary" type="button" data-open-share="share">Compartir</button><button class="button button--ghost" type="button" data-open-share="copy">Copiar</button><button class="button button--ghost" type="button" data-repeat-question>Repetir misma pregunta</button><a class="button button--ghost" href="index.html#lecturas">Nueva lectura</a><a class="button button--ghost" href="index.html">Volver al inicio</a></div></section>
    <button class="text-link result-back-cards" type="button" data-back-reveal>← Volver a las cartas</button>
    ${shareDialogTemplate(preferences)}
  </section>`;
}

function positionResultTemplate(position,selected) {
  const card = getCardById(position.cardId);
  return `<details class="result-position" open><summary><span>${position.index + 1}</span><div><small>${escapeHtml(position.position)}</small><strong>${escapeHtml(position.cardName)}</strong></div><b>${escapeHtml(position.orientationLabel)}</b></summary><div class="result-position__body"><div class="result-card-symbol ${selected.isReversed ? "is-reversed" : ""}" aria-hidden="true">${card.symbol}</div><div><div class="keyword-list">${position.keywords.map(keyword => `<span>${escapeHtml(keyword)}</span>`).join("")}</div><p>${escapeHtml(position.text)}</p></div></div></details>`;
}

function yesNoResultTemplate(result) { return `<section class="yes-no-result" aria-labelledby="yes-no-title"><p class="eyebrow">Respuesta orientativa</p><h2 id="yes-no-title">${escapeHtml(result.answer)}</h2><p>${escapeHtml(result.explanation)}</p><div><span>${result.positiveCards} favorables</span><span>${result.negativeCards} desafiantes</span><span>${result.neutralCards} neutrales</span><b>Claridad ${escapeHtml(result.clarity)}</b></div></section>`; }
function resultDetails(title,content,open = false) { return `<details class="result-block" ${open ? "open" : ""}><summary>${title}</summary><div>${content}</div></details>`; }
function specializedResultTemplate(specialized) {
  const phase = specialized.phase ? `<span class="strategy-phase">${escapeHtml(specialized.phase)}</span>` : "";
  const sections = specialized.sections?.length ? `<div class="strategy-sections">${specialized.sections.map(section => `<article><h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.content)}</p></article>`).join("")}</div>` : "";
  const timeline = specialized.timeline ? `<ol class="strategy-timeline">${specialized.timeline.map((item,index) => `<li><span>${index + 1}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.text)}</p></li>`).join("")}</ol>` : "";
  const paths = specialized.paths ? `<div class="strategy-paths">${specialized.paths.map(path => `<article><h3>${escapeHtml(path.name)}</h3><p>${escapeHtml(path.benefit ?? path.text)}</p>${path.risk ? `<dl><div><dt>Aspectos a ponderar</dt><dd>${escapeHtml(path.risk)}</dd></div><div><dt>Condición</dt><dd>${escapeHtml(path.condition)}</dd></div></dl>` : ""}</article>`).join("")}</div>` : "";
  const questions = specialized.practicalQuestions?.length ? `<div class="strategy-questions"><h3>Preguntas para decidir</h3><ul>${specialized.practicalQuestions.map(question => `<li>${escapeHtml(question)}</li>`).join("")}</ul></div>` : "";
  const groups = specialized.groups ? `<div class="strategy-groups">${specialized.groups.map(group => `<article><h3>${escapeHtml(group.name)}</h3><p>${group.items.map(item => `<strong>${escapeHtml(item.position)}:</strong> ${escapeHtml(item.cardName)}`).join(" · ")}</p><small>${escapeHtml(group.summary)}</small></article>`).join("")}</div>` : "";
  const oracle = specialized.oracleCard ? `<article class="oracle-result"><span aria-hidden="true">${specialized.oracleCard.symbol}</span><p class="eyebrow">Carta de oráculo</p><h3>${escapeHtml(specialized.oracleCard.name)}</h3><b>${escapeHtml(specialized.oracleCard.centralWord)}</b><p>${escapeHtml(specialized.oracleCard.message)}</p><blockquote>${escapeHtml(specialized.oracleCard.affirmation)}</blockquote></article>` : "";
  return `<section class="strategy-result" aria-labelledby="strategy-title">${phase}<p class="eyebrow">Estrategia de lectura</p><h2 id="strategy-title">${escapeHtml(specialized.title)}</h2>${specialized.variant ? `<p class="strategy-variant">Configuración: ${escapeHtml(specialized.variant)}</p>` : ""}${timeline}${paths}${questions}${groups}${oracle}${sections}</section>`;
}

function buildReadingRecord(spread,session) {
  const deck=getDeckById(session.deckId);
  const interpretation=generateInterpretation({sessionId:session.id,question:session.question,querentName:session.querentName,otherPersonName:session.otherPersonName,relationship:session.relationship,context:session.context,topic:session.topic,spread,deck,positions:session.positions,cards:session.selectedCards,predictionPeriod:session.predictionPeriod,moonPhase:session.moonPhase,twoCardLayout:session.twoCardLayout,yesNoCardCount:session.yesNoCardCount,options:session.options});
  return {id:session.id,date:session.createdAt,type:{id:spread.id,name:spread.name},category:spread.category,question:session.question||"Consulta abierta",deck:{id:deck.id,name:deck.name},optionalData:{querentName:session.querentName,otherPersonName:session.otherPersonName,relationship:session.relationship,context:session.context,topic:session.topic,options:session.options,predictionPeriod:session.predictionPeriod,moonPhase:session.moonPhase,twoCardLayout:session.twoCardLayout,yesNoCardCount:session.yesNoCardCount},positions:[...session.positions],cards:session.selectedCards.map(selected=>{const card=getCardById(selected.cardId);return {id:card.id,name:card.name,symbol:card.symbol,position:{...selected.position},isReversed:Boolean(selected.isReversed),orientation:selected.isReversed?"reversed":"upright"};}),interpretation,favorite:openReading(session.id)?.favorite??false};
}

function shareDialogTemplate(preferences) {
  const checked=value=>value!==false?"checked":""; const full=preferences.content==="full";
  return `<dialog class="modal share-dialog" data-share-dialog aria-labelledby="share-title"><form method="dialog"><button class="modal-close" type="button" data-close-share aria-label="Cerrar opciones">×</button><p class="eyebrow">Privacidad antes de compartir</p><h2 id="share-title">Elige qué incluir</h2><p>Por defecto ocultamos nombres y pregunta. Revisa estas opciones antes de sacar información de este dispositivo.</p><fieldset><legend>Datos privados</legend><label><input type="checkbox" name="hideName" ${checked(preferences.hideName)}> Ocultar mi nombre</label><label><input type="checkbox" name="hideQuestion" ${checked(preferences.hideQuestion)}> Ocultar la pregunta</label><label><input type="checkbox" name="hideThirdParties" ${checked(preferences.hideThirdParties)}> Ocultar nombres de terceras personas</label></fieldset><fieldset><legend>Contenido</legend><label><input type="radio" name="shareContent" value="cards" ${full?"":"checked"}> Compartir solo cartas</label><label><input type="radio" name="shareContent" value="full" ${full?"checked":""}> Incluir interpretación completa</label></fieldset><div class="share-dialog__actions"><button class="button button--primary" type="button" data-share-action="share">Compartir</button><button class="button button--secondary" type="button" data-share-action="copy">Copiar texto</button><button class="button button--ghost" type="button" data-share-action="download">Descargar .txt</button></div></form></dialog>`;
}

function readShareOptions(dialog) { const fields=dialog.querySelector("form").elements; return {hideName:fields.hideName.checked,hideQuestion:fields.hideQuestion.checked,hideThirdParties:fields.hideThirdParties.checked,content:fields.shareContent.value}; }
function storageErrorMessage(error) { return error==="storage-full"?"El almacenamiento local está lleno. Elimina alguna lectura e inténtalo de nuevo.":"No fue posible guardar la lectura en este navegador."; }
function newSessionId() { return globalThis.crypto?.randomUUID?.()??`reading-${Date.now()}-${Math.random().toString(36).slice(2,8)}`; }

function reducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function playShuffleSound() {
  try { const AudioContext = window.AudioContext || window.webkitAudioContext; if (!AudioContext) return; const context = new AudioContext(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.type = "sine"; oscillator.frequency.setValueAtTime(220,context.currentTime); oscillator.frequency.exponentialRampToValueAtTime(330,context.currentTime + .12); gain.gain.setValueAtTime(.025,context.currentTime); gain.gain.exponentialRampToValueAtTime(.001,context.currentTime + .14); oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .15); }
  catch (error) { console.warn("[Arcana] El sonido opcional no está disponible.",error); }
}

function persist(session) { return saveReadingSession(session); }
const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g,char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
