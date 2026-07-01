import {
  categories,
  difficultyLevels,
  getCategoryById,
  getSpreadById,
  popularSpreadIds,
  spreads
} from "../data/spreads.js";

const normalize = value => value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const cardTemplate = spread => {
  const difficulty = difficultyLevels[spread.difficulty];
  const category = getCategoryById(spread.category);
  return `<article class="reading-card reveal" data-category="${spread.category}" style="--card-accent:${spread.visualStyle.accent}">
    <div class="reading-card__top"><span class="reading-card__icon" aria-hidden="true">${spread.icon}</span><span class="reading-card__category">${category.name}</span></div>
    <h3>${spread.name}</h3><p>${spread.description}</p>
    <div class="reading-card__meta" aria-label="Características de la lectura"><span title="Cantidad de cartas">${spread.cardCount} ${spread.cardCount === 1 ? "carta" : "cartas"}</span><span title="Duración aproximada">${spread.durationMinutes} min</span><span class="level-badge">${difficulty.name}</span></div>
    <button class="reading-card__select" type="button" data-open-spread="${spread.id}">Seleccionar lectura <span aria-hidden="true">→</span></button>
  </article>`;
};

export function renderPopular() {
  const target = document.querySelector("[data-popular-readings]");
  if (target) target.innerHTML = popularSpreadIds.map(getSpreadById).filter(Boolean).map(cardTemplate).join("");
}

export function renderCatalog() {
  const target = document.querySelector("[data-reading-catalog]");
  const filters = document.querySelector("[data-category-filters]");
  const search = document.querySelector("[data-reading-search]");
  const count = document.querySelector("[data-catalog-count]");
  const showAll = document.querySelector("[data-show-all]");
  if (!target || !filters || !search) return;

  let activeCategory = "all";
  let query = "";
  let expanded = false;

  filters.innerHTML = categories.map((category, index) => `<button class="chip" type="button" aria-pressed="${index === 0}" data-filter="${category.id}">${category.name}</button>`).join("");

  const paint = () => {
    const normalizedQuery = normalize(query.trim());
    const matches = spreads.filter(spread => {
      const category = getCategoryById(spread.category);
      const matchesCategory = activeCategory === "all" || spread.category === activeCategory;
      const searchText = normalize(`${spread.name} ${spread.shortName} ${spread.description} ${spread.extendedDescription} ${category.name}`);
      return matchesCategory && (!normalizedQuery || searchText.includes(normalizedQuery));
    });
    const shouldLimit = !expanded && activeCategory === "all" && !normalizedQuery;
    const visible = shouldLimit ? matches.slice(0, 9) : matches;
    target.innerHTML = visible.length ? visible.map(cardTemplate).join("") : `<div class="empty-state catalog-empty"><span class="empty-state__symbol" aria-hidden="true">☾</span><h3>No encontramos esa lectura</h3><p>Prueba con otra palabra o cambia la categoría.</p><button class="button button--ghost" type="button" data-clear-search>Limpiar búsqueda</button></div>`;
    if (count) count.textContent = `${matches.length} ${matches.length === 1 ? "lectura encontrada" : "lecturas encontradas"}`;
    if (showAll) showAll.hidden = !shouldLimit;
    requestAnimationFrame(() => target.querySelectorAll(".reveal").forEach(element => element.classList.add("is-visible")));
  };

  filters.addEventListener("click", event => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    activeCategory = button.dataset.filter;
    expanded = false;
    filters.querySelectorAll(".chip").forEach(chip => chip.setAttribute("aria-pressed", String(chip === button)));
    paint();
  });
  search.addEventListener("input", () => { query = search.value; expanded = true; paint(); });
  showAll?.addEventListener("click", () => { expanded = true; paint(); });
  target.addEventListener("click", event => {
    if (!event.target.closest("[data-clear-search]")) return;
    search.value = ""; query = ""; search.focus(); paint();
  });
  paint();
}

export function initSpreadDetails() {
  const dialog = document.querySelector("[data-spread-dialog]");
  const content = document.querySelector("[data-spread-detail]");
  if (!dialog || !content) return;
  let trigger = null;
  document.addEventListener("click", event => {
    const openButton = event.target.closest("[data-open-spread]");
    if (openButton) {
      const spread = getSpreadById(openButton.dataset.openSpread);
      if (!spread) return;
      trigger = openButton;
      content.innerHTML = detailTemplate(spread);
      dialog.showModal();
      content.querySelector("[data-close-dialog]")?.focus();
    } else if (event.target.closest("[data-close-dialog]")) { dialog.close(); window.setTimeout(()=>trigger?.focus(),0); }
  });
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => window.setTimeout(()=>trigger?.focus(),0));
}

function detailTemplate(spread) {
  const category = getCategoryById(spread.category);
  const difficulty = difficultyLevels[spread.difficulty];
  const notice = spread.responsibleNotice ? `<div class="spread-detail__notice"><span aria-hidden="true">✦</span><p>${spread.responsibleNotice}</p></div>` : "";
  return `<div class="spread-detail__header" style="--detail-accent:${spread.visualStyle.accent}">
      <button class="modal-close" type="button" data-close-dialog aria-label="Cerrar detalle">×</button><span class="spread-detail__icon" aria-hidden="true">${spread.icon}</span><p class="eyebrow">${category.name}</p><h2 id="spread-detail-title">${spread.name}</h2><p>${spread.extendedDescription}</p>
      <div class="spread-detail__meta"><span>${spread.cardCount} ${spread.cardCount === 1 ? "carta" : "cartas"}</span><span>${spread.durationMinutes} minutos</span><span>Nivel ${difficulty.name.toLocaleLowerCase("es")}</span></div>
    </div><div class="spread-detail__body"><blockquote>“${spread.introText}”</blockquote><h3>Posiciones de la tirada</h3>
      <ol class="position-list">${spread.positions.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><div><strong>${item.name}</strong><p>${item.description}</p></div></li>`).join("")}</ol>${notice}
      <div class="spread-detail__actions"><button class="button button--ghost" type="button" data-close-dialog>Seguir explorando</button><a class="button button--primary" href="lectura.html?tipo=${spread.slug}">Comenzar esta lectura</a></div>
    </div>`;
}
