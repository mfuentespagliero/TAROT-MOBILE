import{renderLayout,initNavigation}from"./components/layout.js";import{setActiveNavigation}from"./router.js";import{APP_CONFIG}from"./config.js";

async function start(){
  configureMetadata();renderLayout();initNavigation();setActiveNavigation();if(!new URLSearchParams(location.search).has("no-sw"))registerServiceWorker();const{migrateStorage}=await import("./services/storage-service.js");migrateStorage();
  const page=document.body.dataset.page;
  if(page==="home"){const{initSpreadDetails,renderCatalog,renderPopular}=await import("./components/readings.js");renderPopular();renderCatalog();initSpreadDetails();lazyDailyCard();}
  if(page==="reading"){const{renderReadingPage}=await import("./pages/reading.js");renderReadingPage();}
  if(page==="learn"){const[{initCardDetails,renderArcanaExplorer},{renderLearningPage}]=await Promise.all([import("./components/cards.js"),import("./pages/learn.js")]);renderArcanaExplorer();initCardDetails();renderLearningPage();}
  if(page==="history"){const{renderHistoryPage}=await import("./pages/history.js");renderHistoryPage();}
  if(page==="privacy"){const{renderPrivacyPage}=await import("./pages/privacy.js");renderPrivacyPage();}
  if(new URLSearchParams(location.search).has("debug")){const[{cards},{validateCardsInDevelopment}]=await Promise.all([import("./data/cards.js"),import("./data/cards-validator.js")]);validateCardsInDevelopment(cards);}
  setupReveal();setupConnectionNotice();
}

function configureMetadata(){
  document.title=document.title.replace("Arcana",APP_CONFIG.name);const description=document.querySelector('meta[name="description"]')?.content??`${APP_CONFIG.name}: ${APP_CONFIG.tagline}.`;const canonical=document.querySelector('link[rel="canonical"]');const current=new URL(location.href);current.hash="";if(document.body.dataset.page!=="reading")current.search="";if(canonical)canonical.href=current.href;
  document.querySelector('meta[property="og:title"]')?.setAttribute("content",document.title);document.querySelector('meta[property="og:description"]')?.setAttribute("content",description);document.querySelector('meta[property="og:url"]')?.setAttribute("content",current.href);document.querySelector('meta[name="twitter:title"]')?.setAttribute("content",document.title);document.querySelector('meta[name="twitter:description"]')?.setAttribute("content",description);
  const data={"@context":"https://schema.org","@type":document.body.dataset.page==="learn"?"Course":"WebSite",name:document.body.dataset.page==="learn"?"Aprender tarot con Arcana":APP_CONFIG.name,description,url:current.href,inLanguage:"es"};const script=document.createElement("script");script.type="application/ld+json";script.textContent=JSON.stringify(data);document.head.append(script);
}
function setupReveal(){const elements=document.querySelectorAll(".reveal");if(matchMedia("(prefers-reduced-motion: reduce)").matches||!("IntersectionObserver"in window)){elements.forEach(element=>element.classList.add("is-visible"));return;}const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}}),{rootMargin:"120px 0px",threshold:.04});elements.forEach(element=>observer.observe(element));}
function lazyDailyCard(){const target=document.querySelector("[data-daily-card]");if(!target)return;const load=()=>import("./components/daily-card.js").then(module=>module.renderDailyCard()).catch(()=>{target.innerHTML='<div class="friendly-inline" role="status"><p>No pudimos preparar la Carta del Día.</p><button class="button button--ghost" type="button">Reintentar</button></div>';target.querySelector("button").addEventListener("click",()=>{target.innerHTML='<div class="loader" role="status"><span></span><span></span><span></span><b class="sr-only">Preparando Carta del Día</b></div>';load();});});if(!("IntersectionObserver"in window)){load();return;}const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();load();}},{rootMargin:"600px 0px"});observer.observe(target);}
function registerServiceWorker(){if("serviceWorker"in navigator&&location.protocol!=="file:")window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js",{updateViaCache:"none"}).then(registration=>registration.update()).catch(error=>console.warn("[Arcana] El modo offline no está disponible.",error)),{once:true});}
function setupConnectionNotice(){window.addEventListener("offline",()=>notify("Estás sin conexión. Arcana seguirá usando los recursos disponibles."));window.addEventListener("online",()=>notify("Conexión recuperada."));}
function notify(message){const region=document.querySelector("[data-toast-region]");if(!region)return;const toast=document.createElement("div");toast.className="toast";toast.setAttribute("role","status");toast.textContent=message;region.append(toast);setTimeout(()=>toast.remove(),3500);}

start().catch(error=>{console.warn("[Arcana] No fue posible iniciar esta vista.",error);window.ArcanaErrors?.showFriendlyError("No pudimos preparar esta sección. Revisa tu conexión y vuelve a intentarlo.");});
