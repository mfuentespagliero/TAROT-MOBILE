import { cards } from "../data/cards.js";

const romanNumerals = ["0","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI"];
const filters = [
  {id:"all",label:"Todos"},{id:"major",label:"Arcanos mayores"},{id:"Bastos",label:"Bastos"},{id:"Copas",label:"Copas"},
  {id:"Espadas",label:"Espadas"},{id:"Oros",label:"Oros"},{id:"court",label:"Figuras de corte"},{id:"energy",label:"Energía alta"}
];
const courtRanks = ["Sota","Caballero","Reina","Rey"];
const normalize = value => value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function renderArcanaExplorer() {
  const grid = document.querySelector("[data-card-grid]");
  const search = document.querySelector("[data-card-search]");
  const count = document.querySelector("[data-card-count]");
  const filterList = document.querySelector("[data-card-filters]");
  const answerFilter = document.querySelector("[data-answer-filter]");
  if (!grid || !search || !filterList || !answerFilter) return;

  let activeFilter = "all";
  filterList.innerHTML = filters.map((filter,index) => `<button class="chip" type="button" data-card-filter="${filter.id}" aria-pressed="${index === 0}">${filter.label}</button>`).join("");

  const paint = () => {
    const query = normalize(search.value.trim());
    const answer = answerFilter.value;
    const matches = cards.filter(card => {
      const searchable = normalize(`${card.name} ${card.alternativeName ?? ""} ${card.uprightKeywords.join(" ")} ${card.reversedKeywords.join(" ")}`);
      const categoryMatch = activeFilter === "all" ||
        (activeFilter === "major" && card.arcanaType === "major") ||
        card.suit === activeFilter ||
        (activeFilter === "court" && courtRanks.includes(card.rank)) ||
        (activeFilter === "energy" && ["Alta","Transformadora"].includes(card.intensity));
      return (!query || searchable.includes(query)) && categoryMatch && matchesAnswer(card,answer);
    });
    grid.innerHTML = matches.length ? matches.map(cardTemplate).join("") : `<div class="empty-state arcana-empty"><span class="empty-state__symbol" aria-hidden="true">☾</span><h3>No encontramos esa carta</h3><p>Prueba otra búsqueda o cambia los filtros.</p></div>`;
    if (count) count.textContent = `${matches.length} ${matches.length === 1 ? "carta" : "cartas"}`;
    requestAnimationFrame(() => grid.querySelectorAll(".reveal").forEach(element => element.classList.add("is-visible")));
  };

  search.addEventListener("input",paint);
  answerFilter.addEventListener("change",paint);
  filterList.addEventListener("click",event => {
    const button = event.target.closest("[data-card-filter]");
    if (!button) return;
    activeFilter = button.dataset.cardFilter;
    filterList.querySelectorAll("[data-card-filter]").forEach(item => item.setAttribute("aria-pressed",String(item === button)));
    paint();
  });
  paint();
}

export function initCardDetails() {
  const dialog = document.querySelector("[data-card-dialog]");
  const content = document.querySelector("[data-card-detail]");
  if (!dialog || !content) return;
  let currentIndex = 0;
  let orientation = "upright";
  let trigger = null;
  const paint = () => { content.innerHTML = detailTemplate(cards[currentIndex],currentIndex,orientation); };
  const move = direction => { currentIndex = (currentIndex + direction + cards.length) % cards.length; orientation = "upright"; paint(); };

  document.addEventListener("click",event => {
    const openButton = event.target.closest("[data-open-card]");
    if (openButton) {
      currentIndex = cards.findIndex(card => card.id === openButton.dataset.openCard);
      orientation = "upright"; trigger = openButton; paint(); dialog.showModal(); content.querySelector("[data-close-card]")?.focus(); return;
    }
    if (event.target.closest("[data-close-card]")) dialog.close();
    if (event.target.closest("[data-card-prev]")) move(-1);
    if (event.target.closest("[data-card-next]")) move(1);
    const orientationButton = event.target.closest("[data-orientation]");
    if (orientationButton) { orientation = orientationButton.dataset.orientation; paint(); }
  });
  dialog.addEventListener("click",event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close",() => trigger?.focus());
  dialog.addEventListener("keydown",event => { if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); });
}

function matchesAnswer(card,filter) {
  if (filter === "all") return true;
  const answer = normalize(card.yesNoOrientation);
  if (filter === "yes") return answer.startsWith("si") || answer.startsWith("probablemente si");
  if (filter === "no") return answer.startsWith("no");
  return !answer.startsWith("si") && !answer.startsWith("no") && !answer.startsWith("probablemente si");
}

function displayNumber(card) { return card.arcanaType === "major" ? romanNumerals[card.number] : card.rank; }
function suitClass(card) { return card.suit ? `suit-${normalize(card.suit)}` : "suit-major"; }

function cardTemplate(card) {
  return `<button class="arcana-tile reveal ${suitClass(card)}" type="button" data-open-card="${card.id}" aria-label="Abrir ${card.name}"><span class="arcana-card arcana-card--front"><span class="arcana-card__number">${displayNumber(card)}</span><span class="arcana-card__stars" aria-hidden="true">✦ · ✧ · ✦</span><span class="arcana-card__symbol" aria-hidden="true">${card.symbol}</span><span class="arcana-card__name">${card.name}</span><span class="arcana-card__element">${card.arcanaType === "major" ? card.element : card.suit}</span></span><span class="arcana-tile__hint">Abrir significado <span aria-hidden="true">→</span></span></button>`;
}

function detailTemplate(card,index,orientation) {
  const upright = orientation === "upright";
  const keywords = upright ? card.uprightKeywords : card.reversedKeywords;
  const meaning = upright ? card.uprightMeaning : card.reversedMeaning;
  const typeLabel = card.arcanaType === "major" ? `Arcano mayor · ${displayNumber(card)}` : `Arcano menor · ${card.suit}`;
  return `<div class="card-detail__layout ${suitClass(card)}"><button class="modal-close" type="button" data-close-card aria-label="Cerrar carta">×</button><div class="card-detail__visual"><div class="arcana-card arcana-card--front ${upright ? "" : "is-reversed"}"><span class="arcana-card__number">${displayNumber(card)}</span><span class="arcana-card__stars" aria-hidden="true">✦ · ✧ · ✦</span><span class="arcana-card__symbol" aria-hidden="true">${card.symbol}</span><span class="arcana-card__name">${card.name}</span><span class="arcana-card__element">${card.arcanaType === "major" ? card.element : card.suit}</span></div><small>${index + 1} de ${cards.length}</small></div><div class="card-detail__content"><p class="eyebrow">${typeLabel}</p><h2 id="card-detail-title">${card.name}</h2><p class="card-detail__association">${card.element} · ${card.association} · Energía ${card.energy.toLocaleLowerCase("es")}</p><div class="orientation-tabs" role="tablist" aria-label="Orientación de la carta"><button type="button" role="tab" aria-selected="${upright}" data-orientation="upright">Derecha</button><button type="button" role="tab" aria-selected="${!upright}" data-orientation="reversed">Invertida</button></div><div class="keyword-list">${keywords.map(keyword => `<span>${keyword}</span>`).join("")}</div><p class="card-detail__meaning">${meaning}</p>${upright ? `<div class="meaning-grid"><article><h3>En el amor</h3><p>${card.loveMeaning}</p></article><article><h3>En el trabajo</h3><p>${card.workMeaning}</p></article><article><h3>En el dinero</h3><p>${card.moneyMeaning}</p></article><article><h3>Como consejo</h3><p>${card.adviceMeaning}</p></article></div>` : ""}<blockquote>“${card.shortMessage}”</blockquote><div class="reflection-box"><span aria-hidden="true">?</span><p>${card.reflectionQuestion}</p></div><nav class="card-detail__nav" aria-label="Navegar entre cartas"><button class="button button--ghost" type="button" data-card-prev>← Anterior</button><button class="button button--ghost" type="button" data-card-next>Siguiente →</button></nav></div></div>`;
}
