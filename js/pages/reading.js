import { APP_CONFIG } from "../config.js";
import { decks, getDeckById } from "../data/decks.js";
import { getCategoryById, getSpreadById } from "../data/spreads.js";
import { selectionMethods } from "../data/fields.js";
import { getCardById } from "../data/cards.js";
import { renderDynamicForm, bindDynamicForm } from "../components/dynamic-form.js";
import { loadReadingSession, saveReadingSession } from "../services/reading-session.js";
import { associateCardsWithPositions, getCleanDeck, registerManualSelection, resetSelection, selectCardsAutomatically, shuffleDeck, undoManualSelection } from "../services/tarot-engine.js";
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
    if (session.status === "result") stage.addEventListener("click",event => { if (event.target.closest("[data-back-reveal]")) goTo("reveal"); });
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
  return `${stageHeader("Resultado provisional","Tu lectura está lista","Las cartas y sus posiciones quedaron registradas. La interpretación narrativa completa llegará en la siguiente etapa.")}
    <article class="provisional-result"><div class="summary-symbol" aria-hidden="true">${spread.icon}</div><h2>${spread.name}</h2><ol>${session.selectedCards.map(selected => `<li><span>${escapeHtml(selected.position.name)}</span><strong>${escapeHtml(selected.name)}</strong><small>${selected.isReversed ? "Invertida" : "Derecha"}</small></li>`).join("")}</ol></article>
    <div class="flow-actions"><button class="button button--ghost" type="button" data-back-reveal>← Volver a las cartas</button><a class="button button--primary" href="index.html">Finalizar por ahora</a></div>`;
}

function reducedMotion() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function playShuffleSound() {
  try { const AudioContext = window.AudioContext || window.webkitAudioContext; if (!AudioContext) return; const context = new AudioContext(); const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.type = "sine"; oscillator.frequency.setValueAtTime(220,context.currentTime); oscillator.frequency.exponentialRampToValueAtTime(330,context.currentTime + .12); gain.gain.setValueAtTime(.025,context.currentTime); gain.gain.exponentialRampToValueAtTime(.001,context.currentTime + .14); oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + .15); }
  catch (error) { console.warn("[Arcana] El sonido opcional no está disponible.",error); }
}

function persist(session) { return saveReadingSession(session); }
const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g,char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
