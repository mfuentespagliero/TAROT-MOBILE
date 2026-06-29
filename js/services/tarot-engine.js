import { cards } from "../data/cards.js";

export const DEFAULT_REVERSED_PROBABILITY = 0.3;

export function getCleanDeck(source = cards) {
  return source.map(card => ({ ...card, uprightKeywords:[...card.uprightKeywords], reversedKeywords:[...card.reversedKeywords] }));
}

export function secureRandom() {
  if (globalThis.crypto?.getRandomValues) {
    const value = new Uint32Array(1);
    globalThis.crypto.getRandomValues(value);
    return value[0] / 4294967296;
  }
  return Math.random();
}

export function shuffleDeck(deck = getCleanDeck()) {
  const shuffled = [...deck];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(secureRandom() * (index + 1));
    [shuffled[index],shuffled[randomIndex]] = [shuffled[randomIndex],shuffled[index]];
  }
  return shuffled;
}

export function determineOrientation({ allowReversed = true, reversedProbability = DEFAULT_REVERSED_PROBABILITY } = {}) {
  const probability = Math.min(1,Math.max(0,Number(reversedProbability)));
  return allowReversed && secureRandom() < probability ? "reversed" : "upright";
}

export function createSelectionRecord(card,options = {}) {
  const orientation = determineOrientation(options);
  return { cardId:card.id,slug:card.slug,name:card.name,symbol:card.symbol,visualId:card.visualId,orientation,isReversed:orientation === "reversed" };
}

export function selectCardsAutomatically({ deck = getCleanDeck(), count, allowReversed = true, reversedProbability = DEFAULT_REVERSED_PROBABILITY } = {}) {
  const safeCount = Math.min(deck.length,Math.max(0,Number(count) || 0));
  return shuffleDeck(deck).slice(0,safeCount).map(card => createSelectionRecord(card,{allowReversed,reversedProbability}));
}

export function registerManualSelection(selection,card,{ maxCards, allowReversed = true, reversedProbability = DEFAULT_REVERSED_PROBABILITY } = {}) {
  if (!card || selection.some(item => item.cardId === card.id) || selection.length >= maxCards) return [...selection];
  return [...selection,createSelectionRecord(card,{allowReversed,reversedProbability})];
}

export function undoManualSelection(selection) { return selection.slice(0,-1); }
export function resetSelection() { return []; }

export function associateCardsWithPositions(selection,positions = []) {
  return selection.map((card,index) => ({ ...card, drawIndex:index, position:{ index, name:positions[index] ?? `Posición ${index + 1}` } }));
}

export function hasDuplicateCards(selection) {
  return new Set(selection.map(card => card.cardId)).size !== selection.length;
}
