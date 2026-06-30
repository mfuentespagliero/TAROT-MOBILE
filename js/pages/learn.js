import { cards } from "../data/cards.js";
import { lessons,getLessonById } from "../data/lessons.js";
import { getLearningProgress,saveLearningProgress } from "../services/storage-service.js";
import { showToast } from "../components/toast.js";

export function renderLearningPage() {
  const curriculum=document.querySelector("[data-learning-curriculum]"); if(!curriculum)return;
  renderCurriculum(); renderPractice(); renderStudyDashboard();
  window.addEventListener("hashchange",()=>{const id=location.hash.replace("#leccion-","");if(getLessonById(id))paintLesson(id);});
  document.addEventListener("arcana:study-updated",renderStudyDashboard);
}

function renderCurriculum(){
  const index=document.querySelector("[data-lesson-index]"),initial=getLessonById(location.hash.replace("#leccion-",""))?.id??lessons[0].id;
  index.innerHTML=lessons.map((item,position)=>`<button class="lesson-card" type="button" data-lesson-id="${item.id}"><span>${String(position+1).padStart(2,"0")}</span><div><h3>${item.title}</h3><p>${item.summary}</p><small>${item.duration} min</small></div><b data-lesson-check="${item.id}" aria-label="Estado"></b></button>`).join("");
  index.addEventListener("click",event=>{const button=event.target.closest("[data-lesson-id]");if(button)openLesson(button.dataset.lessonId);});
  document.querySelector("[data-lesson-view]").addEventListener("click",event=>{const nav=event.target.closest("[data-lesson-nav]");if(nav)openLesson(nav.dataset.lessonNav);const complete=event.target.closest("[data-complete-lesson]");if(complete)toggleLesson(complete.dataset.completeLesson);});
  paintLesson(initial);updateLessonProgress();
}

function openLesson(id){history.replaceState(null,"",`#leccion-${id}`);paintLesson(id);document.querySelector("[data-lesson-view]").scrollIntoView({behavior:reducedMotion()?"auto":"smooth",block:"start"});}
function paintLesson(id){
  const item=getLessonById(id)??lessons[0],index=lessons.findIndex(lesson=>lesson.id===item.id),progress=getLearningProgress(),completed=progress.lessons.includes(item.id);
  document.querySelectorAll("[data-lesson-id]").forEach(button=>button.setAttribute("aria-current",String(button.dataset.lessonId===item.id)));
  document.querySelector("[data-lesson-view]").innerHTML=`<article class="lesson-view"><header><p class="eyebrow">Lección ${index+1} de ${lessons.length} · ${item.duration} min</p><h2>${item.title}</h2><p>${item.summary}</p></header><div class="lesson-view__body">${item.sections.map(section=>`<section><h3>${section.title}</h3><p>${section.text}</p></section>`).join("")}<aside><h3>Ideas para recordar</h3><ul>${item.keyPoints.map(point=>`<li>${point}</li>`).join("")}</ul></aside><div class="responsible-note"><span aria-hidden="true">◇</span><p>Las tradiciones difieren y el contexto transforma el significado. Conserva la autonomía, la privacidad y los límites profesionales.</p></div></div><footer><button class="button button--ghost" type="button" data-lesson-nav="${lessons[index-1]?.id??lessons.at(-1).id}">← Anterior</button><button class="button ${completed?"button--secondary":"button--primary"}" type="button" data-complete-lesson="${item.id}" aria-pressed="${completed}">${completed?"Completada ✓":"Marcar como completada"}</button><button class="button button--ghost" type="button" data-lesson-nav="${lessons[index+1]?.id??lessons[0].id}">Siguiente →</button></footer></article>`;
}
function toggleLesson(id){const progress=getLearningProgress(),completed=progress.lessons.includes(id),lessonsDone=completed?progress.lessons.filter(item=>item!==id):[...progress.lessons,id];saveLearningProgress({lessons:lessonsDone});paintLesson(id);updateLessonProgress();showToast(completed?"Lección marcada como pendiente":"Lección completada");}
function updateLessonProgress(){const progress=getLearningProgress(),percent=Math.round(progress.lessons.length/lessons.length*100);document.querySelector("[data-learning-progress]").innerHTML=`<span><b>${progress.lessons.length}</b> de ${lessons.length} lecciones</span><div aria-label="${percent}% completado"><i style="--progress:${percent}%"></i></div>`;document.querySelectorAll("[data-lesson-check]").forEach(check=>{check.textContent=progress.lessons.includes(check.dataset.lessonCheck)?"✓":"";});}

function renderPractice(){
  const target=document.querySelector("[data-practice-area]");if(!target)return;
  target.innerHTML=`<div class="practice-selector"><button class="practice-card" type="button" data-practice="keyword"><span>01</span><h3>Adivina una palabra clave</h3></button><button class="practice-card" type="button" data-practice="meaning"><span>02</span><h3>Elige la interpretación</h3></button><button class="practice-card" type="button" data-practice="single"><span>03</span><h3>Lectura de una carta</h3></button><button class="practice-card" type="button" data-practice="timeline"><span>04</span><h3>Pasado, presente y futuro</h3></button><button class="practice-card" type="button" data-practice="orientation"><span>05</span><h3>Derecha e invertida</h3></button></div><div class="practice-stage" data-practice-stage><p>Elige un ejercicio para comenzar. No hay notas ni respuestas enviadas a ningún servidor.</p></div>`;
  const stage=target.querySelector("[data-practice-stage]");let active="keyword";
  const paint=()=>{stage.innerHTML=practiceTemplate(active);};
  target.addEventListener("click",event=>{
    const type=event.target.closest("[data-practice]");if(type){active=type.dataset.practice;paint();return;}
    const answer=event.target.closest("[data-practice-answer]");if(answer){stage.querySelectorAll("[data-practice-answer]").forEach(button=>button.disabled=true);answer.classList.add(answer.dataset.correct==="true"?"is-correct":"is-wrong");const feedback=stage.querySelector("[data-practice-feedback]");feedback.hidden=false;feedback.textContent=answer.dataset.correct==="true"?"Buena lectura: esa opción se apoya en los datos de la carta.":"Esa opción añade una idea que la carta no sostiene con claridad. Revisa palabras clave y contexto.";completePractice(active);}
    if(event.target.closest("[data-reveal-practice]")){stage.querySelector("[data-practice-feedback]").hidden=false;completePractice(active);}
    if(event.target.closest("[data-next-practice]"))paint();
  });
  paint();
}

function practiceTemplate(type){
  const card=randomCard();
  if(type==="keyword"){const distractors=randomCards(2,[card.id]).map(item=>item.uprightKeywords[0]);const options=shuffle([card.uprightKeywords[0],...distractors]);return quizShell("Adivina una palabra clave",card,`¿Qué palabra encaja mejor con ${card.name} en posición derecha?`,options.map(option=>`<button type="button" data-practice-answer data-correct="${option===card.uprightKeywords[0]}">${option}</button>`).join(""));}
  if(type==="meaning"){const others=randomCards(2,[card.id]);const options=shuffle([{text:card.uprightMeaning,correct:true},...others.map(item=>({text:item.reversedMeaning,correct:false}))]);return quizShell("Elige la interpretación más coherente",card,"Compara el tono y el foco de estas tres posibilidades.",options.map(option=>`<button type="button" data-practice-answer data-correct="${option.correct}">${option.text}</button>`).join(""));}
  if(type==="single")return reflectionExercise("Practica una lectura de una carta",[card],["Respuesta central"],`Escribe una frase que conecte ${card.name} con una pregunta actual.`,card.adviceMeaning);
  if(type==="timeline"){const selected=randomCards(3);return reflectionExercise("Practica pasado, presente y futuro",selected,["Pasado","Presente","Futuro o tendencia"],"Explica cómo cambia la energía entre las tres posiciones.",selected.map((item,index)=>`${["Pasado","Presente","Tendencia"][index]}: ${[item.pastMeaning,item.presentMeaning,item.futureMeaning][index]}`).join(" "));}
  return `<article class="practice-question"><p class="eyebrow">Comparar orientación</p><h3>${card.name}</h3><div class="orientation-compare"><section><h4>Derecha</h4><p>${card.uprightMeaning}</p></section><section><h4>Invertida</h4><p>${card.reversedMeaning}</p></section></div><label>¿Qué cambia entre ambas orientaciones?<textarea rows="4" placeholder="Observa impulso, bloqueo, exceso o interiorización…"></textarea></label><button class="button button--primary" type="button" data-reveal-practice>Registrar comparación</button><p class="practice-feedback" data-practice-feedback hidden>Compara el verbo central de ambas frases: una inversión no es solo el significado contrario.</p>${nextButton()}</article>`;
}
function quizShell(title,card,prompt,options){return `<article class="practice-question"><p class="eyebrow">Ejercicio local</p><h3>${title}</h3><div class="practice-card-focus"><span>${card.symbol}</span><div><small>${card.arcanaType==="major"?"Arcano mayor":card.suit}</small><strong>${card.name}</strong></div></div><p>${prompt}</p><div class="practice-options">${options}</div><p class="practice-feedback" data-practice-feedback hidden></p>${nextButton()}</article>`;}
function reflectionExercise(title,selected,positions,prompt,guide){return `<article class="practice-question"><p class="eyebrow">Ejercicio local</p><h3>${title}</h3><div class="practice-spread">${selected.map((card,index)=>`<section><span>${card.symbol}</span><small>${positions[index]}</small><strong>${card.name}</strong></section>`).join("")}</div><p>${prompt}</p><label>Tu interpretación<textarea rows="5" placeholder="Describe lo que observas antes de concluir…"></textarea></label><button class="button button--primary" type="button" data-reveal-practice>Ver una guía posible</button><p class="practice-feedback" data-practice-feedback hidden>${guide}</p>${nextButton()}</article>`;}
const nextButton=()=>`<button class="text-link" type="button" data-next-practice>Probar otro ejemplo →</button>`;
function completePractice(id){const progress=getLearningProgress();if(!progress.practices.includes(id))saveLearningProgress({practices:[...progress.practices,id]});}

function renderStudyDashboard(){const target=document.querySelector("[data-study-dashboard]");if(!target)return;const progress=getLearningProgress(),pending=cards.length-progress.studied.length;target.innerHTML=`<div class="study-stats"><article><strong>${progress.studied.length}</strong><span>Estudiadas</span></article><article><strong>${progress.difficult.length}</strong><span>Difíciles</span></article><article><strong>${pending}</strong><span>Pendientes</span></article></div><div class="study-actions"><button class="button button--primary" type="button" data-random-study>Carta aleatoria</button><button class="button button--ghost" type="button" data-study-pending>Ver pendientes</button></div>`;target.querySelector("[data-random-study]").addEventListener("click",()=>{const candidates=cards.filter(card=>!progress.studied.includes(card.id));const card=(candidates.length?candidates:cards)[Math.floor(Math.random()*(candidates.length||cards.length))];document.dispatchEvent(new CustomEvent("arcana:open-card",{detail:{cardId:card.id}}));document.querySelector("#explorador").scrollIntoView({behavior:reducedMotion()?"auto":"smooth"});});target.querySelector("[data-study-pending]").addEventListener("click",()=>{document.dispatchEvent(new CustomEvent("arcana:set-card-filter",{detail:{filter:"pending"}}));document.querySelector("#explorador").scrollIntoView({behavior:reducedMotion()?"auto":"smooth"});});}

const randomCard=()=>cards[Math.floor(Math.random()*cards.length)];
function randomCards(count,excluded=[]){const available=shuffle(cards.filter(card=>!excluded.includes(card.id)));return available.slice(0,count);}
function shuffle(items){const copy=[...items];for(let index=copy.length-1;index>0;index--){const next=Math.floor(Math.random()*(index+1));[copy[index],copy[next]]=[copy[next],copy[index]];}return copy;}
const reducedMotion=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
