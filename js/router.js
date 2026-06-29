export function getReadingId(){return new URLSearchParams(window.location.search).get("tipo")||"una-carta"}
export function setActiveNavigation(){const page=document.body.dataset.page;document.querySelectorAll("[data-nav]").forEach(link=>{if(link.dataset.nav===page)link.setAttribute("aria-current","page")})}
