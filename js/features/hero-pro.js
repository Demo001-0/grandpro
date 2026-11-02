/* js/features/hero-pro.js — advanced interactions for the home hero (.hero2). Mouse devices only for the pointer effects.
   Adds: 3D tilt + glare + spotlight following the pointer, depth parallax, floating info chips, magnetic buttons, a "drag" cursor.
   Slider logic in pages/home.js is untouched. Delete this file + css/motion/hero-pro.css (+ loader line in bootstrap.js) to remove. */
(() => {
  const hero = document.querySelector(".hero2");
  if (!hero) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stage = hero.querySelector(".hero-stage"), arch = hero.querySelector(".arch");
  if (!stage || !arch) return;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const svg = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;

  /* floating chips (copy comes from strings that already exist in the dictionary) */
  const chips = [
    [svg("M5 12.5l4.5 4.5L19 7.5"), t("Artwork check before every print")],
    [svg("M3 7h12v9H3zM15 10h4l2 3v3h-6M7 19.5a1.5 1.5 0 100-.01M17 19.5a1.5 1.5 0 100-.01"), t("Free shipping on orders over {n}", { n: money0(FREE_SHIPPING) })],
    [svg("M3 7h18v10H3zM12 9.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5"), t("Cash on delivery available")]
  ];
  chips.forEach(([ic, tx], i) => { const c = document.createElement("div"); c.className = "hp-chip hpc" + (i + 1);   /* hpc1..3 = position slot */ c.innerHTML = ic + "<span>" + tx + "</span>"; stage.appendChild(c); });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { hero.classList.add("hp-in"); io.disconnect(); } }, { threshold: 0.25 });
    io.observe(hero);
  } else hero.classList.add("hp-in");

  if (reduce || !fine) return;                     // pointer effects: desktop mouse only
  document.documentElement.classList.add("hp");

  const spot = document.createElement("div"); spot.className = "hp-spot"; hero.prepend(spot);
  const glare = document.createElement("div"); glare.className = "hp-glare"; arch.appendChild(glare);
  const cur = document.createElement("div"); cur.className = "hp-cursor";
  cur.innerHTML = `<span>${svg("M8 6l-5 6 5 6")}${t("Drag")}${svg("M16 6l5 6-5 6")}</span>`; document.body.appendChild(cur);

  /* smoothed pointer state */
  let tx = 0, ty = 0, gx = 0, gy = 0, px = -999, py = -999, cx = 0, cy = 0, raf = 0, active = false, curOn = false;
  const loop = () => {
    const sr = stage.getBoundingClientRect(), hr = hero.getBoundingClientRect();
    const nx = active ? Math.max(-1, Math.min(1, (px - (sr.left + sr.width / 2)) / 520)) : 0;
    const ny = active ? Math.max(-1, Math.min(1, (py - (sr.top + sr.height / 2)) / 420)) : 0;
    tx += (nx - tx) * .12; ty += (ny - ty) * .12;
    cx += (px - cx) * .22; cy += (py - cy) * .22;
    hero.style.setProperty("--tx", tx.toFixed(4)); hero.style.setProperty("--ty", ty.toFixed(4));
    hero.style.setProperty("--sx", (px - hr.left) + "px"); hero.style.setProperty("--sy", (py - hr.top) + "px");
    const ar = arch.getBoundingClientRect();
    glare.style.setProperty("--gx", (px - ar.left) + "px"); glare.style.setProperty("--gy", (py - ar.top) + "px");
    cur.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    if (active || Math.abs(tx) > .002 || Math.abs(ty) > .002) raf = requestAnimationFrame(loop); else raf = 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };
  hero.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    px = e.clientX; py = e.clientY; if (!active) { cx = px; cy = py; }
    active = true; hero.classList.add("hp-on");
    const over = !!e.target.closest(".arch") && !e.target.closest("a,button");
    if (over !== curOn) { curOn = over; cur.classList.toggle("on", over); }
    kick();
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { active = false; curOn = false; hero.classList.remove("hp-on"); cur.classList.remove("on", "down"); kick(); });
  hero.addEventListener("pointerdown", () => cur.classList.add("down"));
  addEventListener("pointerup", () => cur.classList.remove("down"));

  /* magnetic buttons */
  hero.querySelectorAll(".btn").forEach(b => {
    b.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      const r = b.getBoundingClientRect();
      b.style.translate = `${((e.clientX - r.left) / r.width - .5) * 14}px ${((e.clientY - r.top) / r.height - .5) * 12}px`;
    });
    b.addEventListener("pointerleave", () => { b.style.translate = ""; });
  });
})();
