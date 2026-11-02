/* js/features/testimonials.js — renders the customer reviews slider on the home page (data: js/data/testimonials.js).
   Arrows + auto-advance (no swipe) while the section is on screen. */
(() => {
  const track = document.getElementById("tmTrack");
  if (!track || typeof TESTIMONIALS === "undefined") return;
  const AR_ = isAR();
  const star = on => `<svg viewBox="0 0 24 24" aria-hidden="true"${on ? "" : ' class="off"'}><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2 6.3 20.3l1.2-6.4L2.8 9.5l6.4-.8z"/></svg>`;
  const initial = n => (n.trim()[0] || "").toUpperCase();
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  track.innerHTML = TESTIMONIALS.map(r => {
    const name = AR_ ? r.nameAr : r.name;
    return `<figure class="tm-card">
      <svg class="tm-quote" viewBox="0 0 32 24" aria-hidden="true"><path d="M0 24V13.6C0 5.4 4.2 1 12 0l1.2 3.4C8.8 4.6 7 7 6.8 10.4H13V24zM18 24V13.6C18 5.4 22.2 1 30 0l1.2 3.4c-4.4 1.2-6.2 3.6-6.4 7H31V24z"/></svg>
      <div class="tm-stars" role="img" aria-label="${r.stars} / 5">${[1, 2, 3, 4, 5].map(i => star(i <= r.stars)).join("")}</div>
      <blockquote>${esc(AR_ ? r.textAr : r.text)}</blockquote>
      <figcaption>
        <span class="tm-av" aria-hidden="true">${esc(initial(name))}</span>
        <span class="tm-who"><b>${esc(name)}</b><small>${esc(AR_ ? r.roleAr : r.role)}</small></span>
        <span class="tm-prod">${esc(AR_ ? r.productAr : r.product)}</span>
      </figcaption>
    </figure>`;
  }).join("");

  /* arrows (the left/right arrow flips automatically in Arabic: "previous" is always on the reading-start side) */
  const chev = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  const prev = document.getElementById("tmPrev"), next = document.getElementById("tmNext");
  if (prev && next) {
    prev.innerHTML = chev("M15 5l-7 7 7 7"); next.innerHTML = chev("M9 5l7 7-7 7");
    prev.setAttribute("aria-label", t("Previous review")); next.setAttribute("aria-label", t("Next review"));
  }

  const dir = AR_ ? -1 : 1;                                       // scroll direction of "next"
  const step = () => { const c = track.querySelector(".tm-card"); return c ? c.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0) : track.clientWidth; };
  const maxScroll = () => track.scrollWidth - track.clientWidth;
  const pos = () => Math.abs(track.scrollLeft);
  const go = d => {                                               // d = +1 next, -1 previous (wraps around)
    if (d > 0 && pos() >= maxScroll() - 4) track.scrollTo({ left: 0, behavior: "smooth" });
    else if (d < 0 && pos() <= 4) track.scrollTo({ left: dir * maxScroll(), behavior: "smooth" });
    else track.scrollBy({ left: dir * d * step(), behavior: "smooth" });
  };
  if (prev) prev.addEventListener("click", () => { last = Date.now(); go(-1); });
  if (next) next.addEventListener("click", () => { last = Date.now(); go(1); });

  /* dots (one per slide position) + swipe / drag */
  const dots = document.getElementById("tmDots");
  const idx = () => Math.round(pos() / step());
  const goTo = i => { last = Date.now(); track.scrollTo({ left: dir * Math.min(i * step(), maxScroll()), behavior: "smooth" }); };
  const buildDots = () => {
    if (!dots) return;
    const n = Math.max(1, Math.round(maxScroll() / step()) + 1);
    dots.innerHTML = Array.from({ length: n }, (_, i) => `<button type="button" class="tm-dot" aria-label="${i + 1}"></button>`).join("");
    [...dots.children].forEach((d, i) => d.addEventListener("click", () => goTo(i)));
    markDot();
  };
  const markDot = () => dots && [...dots.children].forEach((d, i) => d.classList.toggle("on", i === idx()));
  let dt = 0; track.addEventListener("scroll", () => { cancelAnimationFrame(dt); dt = requestAnimationFrame(markDot); }, { passive: true });
  addEventListener("resize", buildDots);
  setTimeout(buildDots, 0); setTimeout(buildDots, 600);
  let sx = null;
  track.addEventListener("pointerdown", e => { sx = e.clientX; });
  addEventListener("pointerup", e => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 45) go(dx * dir < 0 ? 1 : -1);
  });
  addEventListener("pointercancel", () => { sx = null; });
  track.addEventListener("dragstart", e => e.preventDefault());

  /* auto-advance: flips to the next review every 10 s while the section is on screen.
     The 10 s count restarts whenever the visitor touches / clicks / scrolls it, and waits while the mouse is over it. */
  const EVERY = 10000;                                            // ← time between flips (ms)
  let visible = false, hover = false, last = Date.now();
  const touch = () => { last = Date.now(); };
  ["pointerdown", "touchstart", "wheel", "keydown"].forEach(ev => track.addEventListener(ev, touch, { passive: true }));
  track.addEventListener("mouseenter", () => { hover = true; touch(); });
  track.addEventListener("mouseleave", () => { hover = false; touch(); });
  new IntersectionObserver(es => {
    const was = visible; visible = es[0].isIntersecting;
    if (visible) { track.parentElement.classList.add("in"); if (!was) touch(); }   // count 10 s from when it comes into view
  }, { threshold: 0.3 }).observe(track);
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
    setInterval(() => { if (visible && !hover && !document.hidden && Date.now() - last >= EVERY) { last = Date.now(); go(1); } }, 500);
})();
