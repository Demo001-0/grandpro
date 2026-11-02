/* js/core/bootstrap.js — Boot sequence (runs layout, wires UI, loads animations) */
document.addEventListener("DOMContentLoaded", () => {
  layout();
  translateDOM(document.querySelector("main"));
  document.querySelectorAll("[data-lang-toggle]").forEach(el => el.onclick = toggleLang);
  document.getElementById("openCart").onclick = openCart;
  document.getElementById("closeCart").onclick = closeAll;
  document.getElementById("closeNav").onclick = closeAll;
  document.getElementById("openMenu").onclick = () => {document.getElementById("nav").classList.add("open");document.getElementById("overlay").classList.add("open")};
  document.getElementById("overlay").onclick = closeAll;
  document.addEventListener("keydown", e => e.key==="Escape" && closeAll());
  document.getElementById("newsletter").onsubmit = e => {e.preventDefault(); e.target.reset(); toast(t("Thanks for subscribing!"))};
  initSearch(); renderCart();
  if (window.pageInit) window.pageInit();
  const anim = document.createElement("script"); anim.src = "js/features/animations.js"; document.body.appendChild(anim); // animations
  const n3 = document.createElement("script"); n3.src = "js/features/nav3d.js"; document.body.appendChild(n3); // 3D lens nav
  const alive = document.createElement("script"); alive.src = "js/features/alive.js"; document.body.appendChild(alive); // extra liveliness
  if (document.querySelector(".hero2")) { const hp = document.createElement("script"); hp.src = "js/features/hero-pro.js"; document.body.appendChild(hp); } // advanced hero
  if (document.querySelector(".hero2")) { const dv = document.createElement("script"); dv.src = "js/features/dive.js"; document.body.appendChild(dv); } // dive-into-logo experience
});
