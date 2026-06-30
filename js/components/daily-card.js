import { cards, getCardById } from "../data/cards.js";
import { getDailyCard, saveDailyCard } from "../services/storage-service.js";

export function localDateKey(date = new Date()) {
  const year=date.getFullYear(); const month=String(date.getMonth()+1).padStart(2,"0"); const day=String(date.getDate()).padStart(2,"0");
  return `${year}-${month}-${day}`;
}

export function getOrCreateDailyCard(date = new Date()) {
  const dateKey=localDateKey(date); const stored=getDailyCard();
  if (stored?.date === dateKey && getCardById(stored.cardId)) return stored;
  const index=randomInteger(cards.length); const daily={ date:dateKey, cardId:cards[index].id, isReversed:randomInteger(100) < 30 };
  const result=saveDailyCard(daily); return result.ok ? result.dailyCard : daily;
}

export function renderDailyCard(date = new Date()) {
  const target=document.querySelector("[data-daily-card]"); if (!target) return;
  const daily=getOrCreateDailyCard(date); const card=getCardById(daily.cardId); const meaning=daily.isReversed ? card.reversedMeaning : card.uprightMeaning;
  target.innerHTML=`<div class="daily-card__art" aria-label="${escapeHtml(card.name)}, ${daily.isReversed ? "invertida" : "derecha"}"><div class="mini-card ${daily.isReversed ? "is-reversed" : ""}"><span>${card.arcanaType === "major" ? card.number : escapeHtml(card.rank)}</span><b aria-hidden="true">${card.symbol}</b><small>${escapeHtml(card.name)}</small></div></div><div class="daily-card__content"><p class="eyebrow">Tu ritual cotidiano · ${formatDate(date)}</p><h2 id="daily-title">${escapeHtml(card.name)}</h2><p>${escapeHtml(meaning)}</p><div class="daily-card__preview"><span>${daily.isReversed ? "Carta invertida" : "Carta derecha"}</span><p><strong>Consejo:</strong> ${escapeHtml(card.adviceMeaning)}</p><p><strong>Afirmación:</strong> ${escapeHtml(card.affirmation)}</p></div><a class="button button--secondary" href="lectura.html?tipo=una-carta&amp;ampliar=carta-dia">Ampliar esta lectura <span aria-hidden="true">→</span></a></div>`;
}

function randomInteger(max) {
  if (globalThis.crypto?.getRandomValues) { const values=new Uint32Array(1); crypto.getRandomValues(values); return Math.floor(values[0]/(0xFFFFFFFF+1)*max); }
  return Math.floor(Math.random()*max);
}
const formatDate = date => new Intl.DateTimeFormat("es",{day:"numeric",month:"long"}).format(date);
const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g,char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
