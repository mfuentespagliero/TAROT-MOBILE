export const REQUIRED_CARD_FIELDS = Object.freeze([
  "id","slug","name","number","arcanaType","symbol","element","energy","intensity",
  "uprightKeywords","reversedKeywords","uprightMeaning","reversedMeaning","loveMeaning","workMeaning",
  "moneyMeaning","emotionalMeaning","adviceMeaning","obstacleMeaning","opportunityMeaning","pastMeaning",
  "presentMeaning","futureMeaning","yesNoOrientation","yesNoCertainty","reflectionQuestion","shortMessage",
  "visualDescription","visualId"
]);

export function validateCards(cards) {
  const errors = [];
  const counts = {
    total: cards.length,
    major: cards.filter(card => card.arcanaType === "major").length,
    minor: cards.filter(card => card.arcanaType === "minor").length,
    Bastos: cards.filter(card => card.suit === "Bastos").length,
    Copas: cards.filter(card => card.suit === "Copas").length,
    Espadas: cards.filter(card => card.suit === "Espadas").length,
    Oros: cards.filter(card => card.suit === "Oros").length
  };

  const expected = { total:78, major:22, minor:56, Bastos:14, Copas:14, Espadas:14, Oros:14 };
  Object.entries(expected).forEach(([key,value]) => {
    if (counts[key] !== value) errors.push(`Conteo inválido para ${key}: ${counts[key]} (esperado ${value}).`);
  });

  const ids = new Set();
  const slugs = new Set();
  cards.forEach((card,index) => {
    if (ids.has(card.id)) errors.push(`ID repetido: ${card.id}.`);
    if (slugs.has(card.slug)) errors.push(`Slug repetido: ${card.slug}.`);
    ids.add(card.id);
    slugs.add(card.slug);
    REQUIRED_CARD_FIELDS.forEach(field => {
      const value = card[field];
      const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
      if (empty) errors.push(`Carta ${card.id || index}: campo obligatorio vacío (${field}).`);
    });
    if (card.arcanaType === "minor" && !card.suit) errors.push(`Carta menor ${card.id}: falta el palo.`);
  });

  return Object.freeze({ valid: errors.length === 0, counts: Object.freeze(counts), errors: Object.freeze(errors) });
}

export function validateCardsInDevelopment(cards) {
  const report = validateCards(cards);
  if (!report.valid) console.error("[Arcana] La validación del mazo encontró errores:", report.errors);
  return report;
}
