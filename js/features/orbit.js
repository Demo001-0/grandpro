/* js/features/orbit.js — "3D product orbit" (home). A ring of the real product photos in pure CSS 3D (no WebGL → works from file://).
   Drag / swipe to spin with snap, click a side product to bring it forward, arrows + keyboard, mouse-tilt, idle auto-advance,
   glass info panel with price + "Add to cart". Uses only products that have a photo (p.img) and are in stock.
   Tune: EVERY (auto-advance), DEG_PER_PX (drag feel), sizes in size(). Remove: delete this file, css/refinements/orbit.css, its @import, the <section id="orbit"> and the <script> in home.html. */
(() => {
  const root = document.getElementById("orbit"), mount = document.getElementById("obMount");
  if (!root || !mount || typeof PRODUCTS === "undefined") return;
  Object.assign(AR, {
    "Explore in 3D": "استكشف منتجاتنا بالـ 3D", "Drag to spin the ring. Tap any product to bring it forward.": "اسحب عشان تلفّ الدايرة. اضغط على أي منتج يجي قدامك.",
    "View product": "شوف المنتج", "Drag to explore": "اسحب للاستكشاف", "Previous product": "المنتج السابق", "Next product": "المنتج التالي", "Product": "منتج"
  });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover:none) and (pointer:coarse)").matches;   // phones / tablets: swipe + depth, no arrows
  const EVERY = 4500, DEG_PER_PX = touch ? 0.42 : 0.34, clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  /* photo products in stock, interleaved by category so neighbours look different */
  const groups = {}; PRODUCTS.filter(p => p.img && p.available).forEach(p => (groups[p.cat] = groups[p.cat] || []).push(p));
  const items = []; for (let k = 0; Object.values(groups).some(g => g[k]); k++) Object.values(groups).forEach(g => g[k] && items.push(g[k]));
  const n = items.length; if (n < 3) { root.hidden = true; return; }
  const step = 360 / n;

  const chev = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  mount.innerHTML = `
    <div class="ob-card3d">
      <div class="ob-stage" id="obStage" tabindex="0" role="group" aria-roledescription="carousel" aria-label="${t("Explore in 3D")}">
        <div class="ob-bgnum" id="obBg" aria-hidden="true"></div>
        <div class="ob-floor" aria-hidden="true"></div><div class="ob-floor f2" aria-hidden="true"></div>
        <div class="ob-tilt" id="obTilt"><div class="ob-ring" id="obRing">
          ${items.map(p => `<a class="ob-item" href="product.html?id=${p.id}" aria-label="${pName(p).replace(/"/g, "&quot;")}" draggable="false"><span class="ob-face"><img src="${p.img}" alt="" draggable="false"></span></a>`).join("")}
        </div></div>
        <div class="ob-nav"><button type="button" class="ob-arrow" id="obPrev" aria-label="${t("Previous product")}">${chev("M15 5l-7 7 7 7")}</button><button type="button" class="ob-arrow" id="obNext" aria-label="${t("Next product")}">${chev("M9 5l7 7-7 7")}</button></div>
        <div class="ob-hint" id="obHint" aria-hidden="true"><i></i><span>${t("Drag to explore")}</span></div>
      </div>
      <div class="ob-panel">
        <div class="ob-count"><div class="ob-n"><b id="obNum"></b><span>/ ${num(n)}</span></div></div>
        <div class="ob-info" id="obInfo"><span class="ob-chip" id="obCat"></span><h3 id="obName"></h3><div class="ob-price" id="obPrice"></div></div>
        <div class="ob-acts"><a class="ob-a ob-view" id="obView" href="#">${t("View product")}</a><button class="ob-a ob-add" id="obAdd" type="button">${t("Add to cart")}</button></div>
      </div>
    </div>`;
  const $ = id => document.getElementById(id);
  const stage = $("obStage"), ring = $("obRing"), tilt = $("obTilt"), els = [...ring.children];

  let R = 400, ang = reduce ? 0 : -230, target = reduce ? 0 : -230, dragging = false, moved = 0, idle = Date.now(), vis = false, hover = false, raf = 0, last = 0, shown = -1, gyroAt = 0, gyx = 0, gyy = 0, tx = 0, ty = 0, stx = 0, sty = 0;
  const norm = a => ((a % 360) + 540) % 360 - 180;
  const size = () => {
    const W = stage.clientWidth, w = W < 520 ? 150 : W < 900 ? 180 : 232, gap = W < 520 ? 22 : 30;
    R = Math.round(((w + gap) / 2) / Math.tan(Math.PI / n));
    stage.style.setProperty("--w", w + "px"); stage.style.setProperty("--h", Math.round(w * 1.25) + "px");
    els.forEach((el, i) => { el.style.transform = `rotateY(${i * step}deg) translateZ(${R}px)`; });
  };
  const goTo = i => { target += norm(-i * step - target); idle = Date.now(); };
  const bump = d => { target += d * step; idle = Date.now(); };

  const show = i => {
    if (i === shown) return; shown = i; const p = items[i];
    $("obNum").textContent = (i + 1 < 10 ? (isAR() ? "٠" : "0") : "") + num(i + 1); $("obBg").textContent = $("obNum").textContent;
    $("obCat").textContent = catName(p.cat); $("obName").textContent = pName(p);
    $("obPrice").innerHTML = (p.compare ? `<s>${fmt(p.compare)}</s>` : "") + fmt(p.price);
    $("obView").href = "product.html?id=" + p.id; $("obAdd").onclick = () => addToCart(p.id, 1);
    const info = $("obInfo"); info.classList.remove("swap"); void info.offsetWidth; info.classList.add("swap");
  };

  const frame = now => {
    const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
    if (!dragging) ang += (target - ang) * (reduce ? 1 : 1 - Math.exp(-dt * 5.2));
    if (touch && !reduce) {
      // depth on touch screens: gyro when the phone sends it, otherwise lean with the finger / swipe speed, otherwise a slow sway
      if (now - gyroAt < 400) { tx = gyx; ty = gyy; }
      else if (dragging) { tx = clamp(tx * .9 + v * 6, -1.4, 1.4); }
      else { tx = Math.sin(now / 1300) * .7; ty = Math.cos(now / 1700) * .55; }
    }
    stx += (tx - stx) * (1 - Math.exp(-dt * 6)); sty += (ty - sty) * (1 - Math.exp(-dt * 6));
    ring.style.transform = `translateZ(${-R}px) rotateY(${ang.toFixed(2)}deg)`;
    tilt.style.transform = touch ? `rotateX(${(-9 + sty * -7).toFixed(2)}deg) rotateY(${(stx * 9).toFixed(2)}deg)` : `rotateX(${(-5 + sty * -5).toFixed(2)}deg) rotateY(${(stx * 4).toFixed(2)}deg)`;
    els.forEach((el, i) => {
      const a = norm(i * step + ang), c = (Math.cos(a * Math.PI / 180) + 1) / 2;
      el.style.opacity = (.32 + .68 * Math.pow(c, 1.3)).toFixed(3);
      el.classList.toggle("on", Math.abs(a) < step / 2);
    });
    show(((Math.round(-target / step) % n) + n) % n);
    raf = vis ? requestAnimationFrame(frame) : 0;
  };

  /* drag / swipe (window listeners, so clicks still reach the product links) */
  let sx = 0, a0 = 0, lx = 0, lt = 0, v = 0;
  stage.addEventListener("pointerdown", e => {
    if (e.button > 0 || e.target.closest(".ob-arrow")) return;
    dragging = true; moved = 0; sx = lx = e.clientX; a0 = ang; lt = performance.now(); v = 0; idle = Date.now(); stage.classList.add("drag"); $("obHint").classList.add("gone");
  });
  addEventListener("pointermove", e => {
    if (dragging) {
      if (touch) { const r = stage.getBoundingClientRect(); ty = clamp(((e.clientY - r.top) / r.height - .5) * 2, -1, 1); }
      const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); ang = a0 + dx * DEG_PER_PX; target = ang;
      const now = performance.now(), dtm = now - lt; if (dtm > 0) v = v * .6 + ((e.clientX - lx) * DEG_PER_PX / dtm) * .4; lx = e.clientX; lt = now; idle = Date.now();
    } else if (e.pointerType === "mouse") {
      const r = stage.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - .5) * 2; ty = ((e.clientY - r.top) / r.height - .5) * 2;
    }
  }, { passive: true });
  const up = () => { if (!dragging) return; dragging = false; stage.classList.remove("drag"); target = Math.round((ang + v * 240) / step) * step; idle = Date.now(); };
  addEventListener("pointerup", up); addEventListener("pointercancel", up);
  if (touch && !reduce) addEventListener("deviceorientation", e => {
    if (e.gamma == null || e.beta == null) return;
    gyroAt = performance.now(); gyx = clamp(e.gamma / 22, -1.2, 1.2); gyy = clamp((e.beta - 50) / 22, -1.2, 1.2);
  }, { passive: true });
  stage.addEventListener("mouseenter", () => { hover = true; }); stage.addEventListener("mouseleave", () => { hover = false; tx = ty = 0; });
  stage.addEventListener("dragstart", e => e.preventDefault());
  els.forEach((el, i) => el.addEventListener("click", e => { if (moved > 6) { e.preventDefault(); return; } if (!el.classList.contains("on")) { e.preventDefault(); goTo(i); } }));
  $("obPrev").onclick = () => bump(1); $("obNext").onclick = () => bump(-1);
  stage.addEventListener("keydown", e => { if (e.key === "ArrowLeft") { e.preventDefault(); bump(1); } else if (e.key === "ArrowRight") { e.preventDefault(); bump(-1); } });

  size(); setTimeout(size, 400); addEventListener("resize", size); show(0);
  new IntersectionObserver(es => {
    const was = vis; vis = es[0].isIntersecting;
    if (vis && !was) { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } if (target !== 0 && !reduce && shown === 0 && Math.abs(ang + 230) < 1) target = 0; idle = Date.now(); }
  }, { threshold: .2 }).observe(stage);
  if (!reduce) setInterval(() => { if (vis && !hover && !dragging && !document.hidden && Date.now() - idle > EVERY) bump(-1); }, 600);
})();
