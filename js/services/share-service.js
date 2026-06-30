const safe = value => String(value ?? "").trim();

export function buildShareText(reading,options = {}) {
  const settings = { hideName:true, hideQuestion:true, hideThirdParties:true, content:"cards", ...options };
  const lines = [`Arcana · ${safe(reading.type?.name ?? reading.type)}`,safe(reading.deck?.name ?? reading.deck),""];
  if (!settings.hideName && reading.optionalData?.querentName) lines.push(`Consultante: ${safe(reading.optionalData.querentName)}`);
  if (!settings.hideQuestion && reading.question) lines.push(`Pregunta: ${safe(reading.question)}`);
  if (!settings.hideThirdParties && reading.optionalData?.otherPersonName) lines.push(`Otra persona: ${safe(reading.optionalData.otherPersonName)}`);
  lines.push("Cartas:");
  (reading.cards ?? []).forEach((card,index) => lines.push(`${index + 1}. ${safe(card.position?.name ?? card.position)} — ${safe(card.name)} (${card.isReversed || card.orientation === "reversed" ? "Invertida" : "Derecha"})`));
  if (settings.content === "full" && reading.interpretation) {
    lines.push("",`Síntesis: ${safe(reading.interpretation.generalSynthesis)}`,`Tendencia: ${safe(reading.interpretation.tendency)}`,`Consejo: ${safe(reading.interpretation.advice)}`,`Reflexión: ${safe(reading.interpretation.reflectionQuestion)}`);
  }
  lines.push("","Lectura simbólica para entretenimiento, reflexión y autoconocimiento.");
  return lines.filter((line,index,array) => line || array[index - 1]).join("\n");
}

export async function shareReading(reading,options) {
  const text = buildShareText(reading,options);
  if (navigator.share) {
    try { await navigator.share({ title:`Arcana · ${safe(reading.type?.name ?? reading.type)}`, text }); return { ok:true, method:"share" }; }
    catch (error) { if (error?.name === "AbortError") return { ok:false, error:"cancelled" }; }
  }
  return copyReading(reading,options);
}

export async function copyReading(reading,options) {
  const text = buildShareText(reading,options);
  try {
    if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
    else fallbackCopy(text);
    return { ok:true, method:"clipboard" };
  } catch (error) {
    console.warn("[Arcana] No fue posible copiar la lectura.",error);
    return { ok:false, error:"clipboard-unavailable" };
  }
}

export function downloadReading(reading,options) {
  try {
    const blob = new Blob([buildShareText(reading,options)],{type:"text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href=url; link.download=`arcana-${safe(reading.type?.id ?? reading.type ?? "lectura")}-${safe(reading.id)}.txt`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url),0);
    return { ok:true, method:"download" };
  } catch (error) { console.warn("[Arcana] No fue posible descargar la lectura.",error); return { ok:false, error:"download-unavailable" }; }
}

function fallbackCopy(text) {
  const textarea=document.createElement("textarea"); textarea.value=text; textarea.setAttribute("readonly",""); textarea.style.position="fixed"; textarea.style.opacity="0"; document.body.append(textarea); textarea.select();
  const copied=document.execCommand("copy"); textarea.remove(); if (!copied) throw new Error("copy-command-failed");
}

