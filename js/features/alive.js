/* js/features/alive.js — extra liveliness: scroll progress, ambient glow, fly-to-cart + sparkles, cart bump.
   Does nothing under "reduce motion". Safe to delete (and its @import) without affecting the shop. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  // scroll progress bar
  const bar = document.createElement("div"); bar.className = "alive-progress"; document.body.appendChild(bar);
  let tick = false;
  const upd = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.setProperty("--p", h > 0 ? Math.min(1, scrollY / h) : 0); tick = false; };
  addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();

  // ambient glows
  const blobs = document.createElement("div"); blobs.className = "alive-blobs"; blobs.innerHTML = "<i></i><i></i><i></i>"; document.body.prepend(blobs);

  // helpers
  const cartBtn = () => document.getElementById("openCart");
  const sparkles = (x, y) => {
    for (let i = 0; i < 12; i++) {
      const s = document.createElement("span"); s.className = "alive-spark";
      const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 44;
      s.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
      document.body.appendChild(s); setTimeout(() => s.remove(), 750);
    }
  };
  const fly = (srcEl, x, y) => {
    const target = cartBtn(); if (!target) return;
    const tr = target.getBoundingClientRect();
    const f = document.createElement("div"); f.className = "alive-fly";
    const sr = srcEl && srcEl.getBoundingClientRect();
    const w = sr && sr.width ? Math.min(sr.width, 150) : 64, h = w * 1.2;
    if (srcEl) f.appendChild(srcEl.cloneNode(true));
    f.style.cssText = `width:${w}px;height:${h}px;left:${x - w / 2}px;top:${y - h / 2}px`;
    document.body.appendChild(f);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const dx = tr.left + tr.width / 2 - x, dy = tr.top + tr.height / 2 - y;
      f.style.transform = `translate(${dx}px,${dy}px) scale(.15)`; f.style.opacity = ".35";
    }));
    setTimeout(() => { f.remove(); const c = document.getElementById("cartCount"); if (c) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); } }, 780);
  };

  // wrap addToCart (a global function used by every page)
  if (typeof window.addToCart === "function") {
    const orig = window.addToCart;
    window.addToCart = function (id, qty) {
      try {
        const ev = window.event, btn = ev && ev.target && ev.target.closest && ev.target.closest("button");
        const r = btn ? btn.getBoundingClientRect() : null;
        const x = r ? r.left + r.width / 2 : innerWidth / 2, y = r ? r.top + r.height / 2 : innerHeight / 2;
        const scope = btn && btn.closest(".product, .hero2, .card");
        const img = scope && scope.querySelector(".gallery img, .gallery svg, .arch-slide.active img, .arch-slide.active svg, .img img, .img svg");
        sparkles(x, y); fly(img, x, y);
      } catch (e) {}
      return orig.apply(this, arguments);
    };
  }
})();
