import { fieldDefinitions, selectionMethods } from "../data/fields.js";

export function renderDynamicForm(spread, session) {
  const fieldIds = [...new Set([...spread.requiredFields, ...spread.optionalFields])];
  const fields = fieldIds.map(id => renderField(fieldDefinitions[id], spread, session, spread.requiredFields.includes(id))).join("");
  return `<form class="consultation-form" data-consultation-form novalidate>
    <div class="form-error-summary" data-error-summary role="alert" tabindex="-1" hidden><h3>Revisa estos campos</h3><ul></ul></div>
    <div class="dynamic-fields">${fields}</div>
    <aside class="privacy-note"><span aria-hidden="true">◇</span><p><strong>Tu consulta permanece contigo.</strong> Durante el MVP los datos se procesan localmente, no se envían a servidores y la lectura solo se guardará si tú lo solicitas.</p></aside>
    <div class="flow-actions"><button class="button button--ghost" type="button" data-flow-back>← Volver</button><button class="button button--primary" type="submit">Revisar mi consulta →</button></div>
  </form>`;
}

export function bindDynamicForm(form, spread, session, onValid, onBack, onDraft) {
  form.addEventListener("click", event => { if (event.target.closest("[data-flow-back]")) onBack(readFormValues(form, spread, session)); });
  const amount = form.elements.cardAmount;
  amount?.addEventListener("input", () => updatePositionInputs(form, spread, session, Number(amount.value)));
  const saveDraft = () => onDraft?.(readFormValues(form, spread, session));
  form.addEventListener("input", saveDraft);
  form.addEventListener("change", saveDraft);
  form.addEventListener("submit", event => {
    event.preventDefault();
    clearErrors(form);
    const values = readFormValues(form, spread, session);
    const errors = validateForm(form, spread, values);
    if (errors.length) { showErrors(form, errors); return; }
    onValid(values);
  });
}

function renderField(field, spread, session, required) {
  if (!field) return "";
  const value = getSessionValue(session, field.id);
  const requiredText = required ? `<span aria-hidden="true">*</span><span class="sr-only"> obligatorio</span>` : `<span class="field__optional">Opcional</span>`;
  const describedBy = `error-${field.id}`;
  let control = "";
  if (field.type === "textarea") control = `<textarea id="${field.id}" name="${field.id}" rows="4" maxlength="${field.maxLength}" placeholder="${field.placeholder ?? ""}" aria-describedby="${describedBy}">${escapeHtml(value)}</textarea>`;
  if (field.type === "text") control = `<input id="${field.id}" name="${field.id}" type="text" value="${escapeHtml(value)}" maxlength="${field.maxLength}" placeholder="${field.placeholder ?? ""}" aria-describedby="${describedBy}">`;
  if (field.type === "number") control = `<input id="${field.id}" name="${field.id}" type="number" value="${value || spread.cardCount}" min="1" max="10" inputmode="numeric" aria-describedby="${describedBy}">`;
  if (field.type === "select") control = `<select id="${field.id}" name="${field.id}" aria-describedby="${describedBy}"><option value="">Selecciona una opción</option>${field.options.map(option => `<option value="${option}" ${value === option ? "selected" : ""}>${option}</option>`).join("")}</select>`;
  if (field.type === "switch") control = `<label class="switch-control"><input id="${field.id}" name="${field.id}" type="checkbox" ${value ? "checked" : ""} ${spread.allowsReversed ? "" : "disabled"}><span aria-hidden="true"></span><b>${spread.allowsReversed ? "Activar cartas invertidas" : "Esta tirada no usa invertidas"}</b></label>`;
  if (field.type === "radio") control = `<div class="choice-grid" id="${field.id}" role="radiogroup" aria-describedby="${describedBy}">${selectionMethods.filter(method => spread.selectionMethods.includes(method.id)).map(method => `<label class="choice-card"><input type="radio" name="${field.id}" value="${method.id}" ${value === method.id ? "checked" : ""}><span><strong>${method.name}</strong><small>${method.description}</small></span></label>`).join("")}</div>`;
  if (field.type === "list") control = `<div class="position-inputs" id="${field.id}" data-position-inputs>${renderPositionInputs(spread, session, Number(session.cardAmount || spread.cardCount))}</div>`;
  return `<div class="field field--${field.type}" data-field="${field.id}"><label for="${field.id}">${field.label} ${requiredText}</label>${control}<p class="field-error" id="${describedBy}" data-field-error="${field.id}"></p></div>`;
}

function renderPositionInputs(spread, session, amount) {
  const safeAmount = Math.min(10, Math.max(1, amount || spread.cardCount));
  return Array.from({length:safeAmount}, (_,index) => {
    const fallback = spread.positions[index]?.name ?? `Posición ${index + 1}`;
    const value = session.positions[index] ?? fallback;
    return `<label><span>${index + 1}</span><input type="text" name="customPositionNames" value="${escapeHtml(value)}" maxlength="60" aria-label="Nombre de la posición ${index + 1}"></label>`;
  }).join("");
}

function updatePositionInputs(form, spread, session, amount) {
  const target = form.querySelector("[data-position-inputs]");
  if (!target) return;
  const current = [...form.querySelectorAll('[name="customPositionNames"]')].map(input => input.value);
  target.innerHTML = renderPositionInputs(spread, {...session, positions:current}, amount);
}

function readFormValues(form, spread, session) {
  const data = new FormData(form);
  const value = id => String(data.get(id) ?? "").trim();
  const amount = Number(value("cardAmount") || session.cardAmount || spread.cardCount);
  const customPositions = data.getAll("customPositionNames").map(item => String(item).trim());
  return {
    ...session,
    question:value("question"), querentName:value("querentName"), otherPersonName:value("otherPersonName"), relationship:value("relationship"),
    context:value("context"), topic:value("topic"), options:{a:value("optionA"),b:value("optionB")}, predictionPeriod:value("predictionPeriod"), moonPhase:value("moonPhase"),
    cardAmount:amount, positions:customPositions.length ? customPositions : spread.positions.slice(0,amount).map(position => position.name),
    useReversed:spread.allowsReversed && data.get("useReversed") === "on", selectionMethod:value("selectionMethod")
  };
}

function validateForm(form, spread, values) {
  const errors = [];
  spread.requiredFields.forEach(id => {
    const value = id === "optionA" ? values.options.a : id === "optionB" ? values.options.b : values[id];
    if (value === undefined || value === null || String(value).trim() === "") errors.push({field:id,message:`${fieldDefinitions[id]?.label ?? "Este campo"} es obligatorio.`});
  });
  if (values.options.a && values.options.b && normalize(values.options.a) === normalize(values.options.b)) errors.push({field:"optionB",message:"La opción B debe ser diferente de la opción A."});
  if (values.cardAmount < 1 || values.cardAmount > 10) errors.push({field:"cardAmount",message:"La cantidad debe estar entre 1 y 10 cartas."});
  if (form.querySelector('[name="customPositionNames"]') && (values.positions.length !== values.cardAmount || values.positions.some(name => !name.trim()))) errors.push({field:"customPositionNames",message:"Completa el nombre de todas las posiciones."});
  Object.values(fieldDefinitions).filter(field => field.maxLength).forEach(field => {
    const input = form.elements[field.id];
    if (input && String(input.value).trim().length > field.maxLength) errors.push({field:field.id,message:`Usa un máximo de ${field.maxLength} caracteres.`});
  });
  return errors;
}

function showErrors(form, errors) {
  const summary = form.querySelector("[data-error-summary]");
  summary.hidden = false;
  summary.querySelector("ul").innerHTML = errors.map(error => `<li><a href="#${error.field}">${error.message}</a></li>`).join("");
  errors.forEach(error => {
    const holder = form.querySelector(`[data-field="${error.field}"]`);
    const input = holder?.querySelector("input,textarea,select");
    holder?.classList.add("has-error");
    input?.setAttribute("aria-invalid","true");
    const message = form.querySelector(`[data-field-error="${error.field}"]`);
    if (message) message.textContent = error.message;
  });
  summary.focus();
}

function clearErrors(form) {
  const summary = form.querySelector("[data-error-summary]");
  summary.hidden = true; summary.querySelector("ul").replaceChildren();
  form.querySelectorAll(".has-error").forEach(field => field.classList.remove("has-error"));
  form.querySelectorAll("[aria-invalid]").forEach(input => input.removeAttribute("aria-invalid"));
  form.querySelectorAll("[data-field-error]").forEach(message => message.textContent = "");
}

function getSessionValue(session,id) {
  if (id === "optionA") return session.options.a;
  if (id === "optionB") return session.options.b;
  return session[id] ?? "";
}

const normalize = value => value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const escapeHtml = value => String(value ?? "").replace(/[&<>"]/g,char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
