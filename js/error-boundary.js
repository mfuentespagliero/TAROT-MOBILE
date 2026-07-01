(function(){
  function mount(message){
    const render=()=>{if(document.querySelector("[data-app-error]"))return;const main=document.querySelector("main")||document.body;const section=document.createElement("section");section.className="friendly-error section-shell";section.dataset.appError="";section.setAttribute("role","alert");section.innerHTML='<span aria-hidden="true">☾</span><p class="eyebrow">Algo no cargó como esperábamos</p><h1>Arcana necesita volver a intentarlo</h1><p></p><button class="button button--primary" type="button">Recargar la página</button>';section.querySelector("p:last-of-type").textContent=message;section.querySelector("button").addEventListener("click",()=>location.reload());main.replaceChildren(section);};
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();
  }
  window.ArcanaErrors={showFriendlyError:mount};
  window.addEventListener("error",event=>{if(event.target instanceof HTMLScriptElement)mount("No pudimos cargar una parte esencial. Revisa tu conexión o inténtalo de nuevo.");},true);
  window.addEventListener("unhandledrejection",()=>mount("Ocurrió un problema inesperado al preparar esta vista. Tus datos locales no se han enviado a ningún lugar."));
})();
