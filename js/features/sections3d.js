/* js/features/sections3d.js — light 3D motion for the home-page sections (CSS 3D only, no WebGL, no extra download).
   - Lookbook tiles and category cards: lean back/forward as they cross the screen (scroll-linked),
     follow the mouse with a tilt + moving glare on desktop. Phones get the scroll lean only (product cards keep their gyro tilt).
   - Sale banner (itself stays flat): a slowly turning 3D box (lime edges, tape strip, glowing core) behind the big number; it tumbles with scroll and leans toward the mouse.
   - Testimonials: coverflow — side cards turn toward the centre and sit a little deeper.
   - Safe fallback: "reduce motion" → nothing runs.  Everything visual is scoped to html.s3d (css/motion/sections3d.css), which this script adds.
   Tune the numbers in KINDS (tilt = max mouse tilt °, lean = max scroll lean °) and in coverflow() below. */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const isSlider = () => matchMedia("(max-width:1000px)").matches;     // category cards become a horizontal slider here → no vertical lean

  /* wait = the element has a scroll-reveal (animations.js); the 3D layer only takes over once that entrance has finished */
  const KINDS = {
    ".lk-tile": { tilt: 6,   lean: 6,   wait: true },
    ".ccard":   { tilt: 8,   lean: 5,   wait: true, lift: true },
    ".sale":    { tilt: 0,   lean: 0,   wait: false, flat: true }   // stays flat (big dark card = jagged edges when tilted); the box inside does the 3D
  };
  const SEL = Object.keys(KINDS).join(",");
  const kindOf = el => KINDS[Object.keys(KINDS).find(s => el.matches(s))];

  const start = () => {
    document.documentElement.classList.add("s3d");

    /* ---------- tag the elements + glare layer ---------- */
    let els = [];
    const tag = () => {
      els = $$(SEL);
      els.forEach(el => {
        if (el._s3d) return;
        el._s3d = kindOf(el);
        el.setAttribute("data-s3d", el._s3d.flat ? "flat" : "");
        const g = document.createElement("span"); g.className = "s3d-glare"; g.setAttribute("aria-hidden", "true"); el.appendChild(g);
      });
    };
    tag();

    /* ---------- sale banner: the 3D box ---------- */
    const art = document.querySelector(".sale-art");
    let scene = null;
    if (art) {
      const faces = ["f", "b", "r", "l", "t", "u"].map(c => `<i class="${c}"></i>`).join("");
      scene = document.createElement("div");
      scene.className = "s3d-scene"; scene.setAttribute("aria-hidden", "true");
      scene.innerHTML = `<div class="s3d-rig"><div class="s3d-cube">${faces}<div class="s3d-core">${faces}</div></div></div>`;
      art.prepend(scene);
      new IntersectionObserver(es => scene.classList.toggle("s3d-idle", !es[0].isIntersecting)).observe(art);   // pause the spin off-screen
    }
    const sale = document.querySelector(".sale");

    /* ---------- scroll-linked lean ---------- */
    let tick = false, retry = 0;
    const ready = (el, now) => {
      if (!el._s3d.wait) return true;
      if (!el.hasAttribute("data-r") || !el.classList.contains("in")) return false;
      if (!el._in) el._in = now;
      return now - el._in > 1300;                                     // let the reveal transition finish first
    };
    const update = () => {
      tick = false;
      const vh = innerHeight, now = performance.now();
      let pending = false;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) return;
        if (!ready(el, now)) { pending = true; return; }
        const lean = (isSlider() && el.matches(".ccard")) ? 0 : el._s3d.lean;
        const p = (r.top + r.height / 2) / vh;                        // 0 = top of screen, 1 = bottom
        el.style.setProperty("--sx", (clamp((p - 0.5) * 2, -1.2, 1.2) * lean).toFixed(2) + "deg");
        el.classList.add("s3d-on");
      });
      if (scene && sale) {                                            // the box tumbles as the banner crosses the screen
        const r = sale.getBoundingClientRect();
        const ps = clamp((vh - r.top) / (vh + r.height), 0, 1);
        scene.style.setProperty("--sy", ((ps - 0.5) * 150).toFixed(1) + "deg");
      }
      if (pending && !retry) retry = setTimeout(() => { retry = 0; onScroll(); }, 1400);
    };
    const onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();

    /* ---------- desktop: mouse tilt + glare ---------- */
    if (fine) {
      let cur = null, ev = null, raf = 0;
      const reset = el => {
        if (!el) return;
        el.classList.remove("s3d-hot");
        ["--rx", "--ry", "--nx", "--ny"].forEach(k => el.style.removeProperty(k));
        if (scene && el === sale) { scene.style.removeProperty("--ox"); scene.style.removeProperty("--oy"); }
      };
      const move = () => {
        raf = 0; if (!cur || !ev) return;
        const r = cur.getBoundingClientRect(), k = cur._s3d.tilt;
        const nx = clamp(((ev.clientX - r.left) / r.width) * 2 - 1, -1, 1), ny = clamp(((ev.clientY - r.top) / r.height) * 2 - 1, -1, 1);
        cur.classList.add("s3d-hot");
        cur.style.setProperty("--ry", (nx * k).toFixed(2) + "deg");
        cur.style.setProperty("--rx", (-ny * k).toFixed(2) + "deg");
        cur.style.setProperty("--gx", ((nx + 1) * 50).toFixed(1) + "%");
        cur.style.setProperty("--gy", ((ny + 1) * 50).toFixed(1) + "%");
        cur.style.setProperty("--nx", nx.toFixed(3));
        cur.style.setProperty("--ny", ny.toFixed(3));
        if (scene && cur === sale) {                                  // the box leans toward the mouse
          scene.style.setProperty("--ox", (-ny * 18).toFixed(1) + "deg");
          scene.style.setProperty("--oy", (nx * 28).toFixed(1) + "deg");
        }
      };
      addEventListener("pointermove", e => {
        if (e.pointerType !== "mouse") return;
        let el = e.target.closest && e.target.closest("[data-s3d]");
        if (el && !el.classList.contains("s3d-on")) el = null;        // still revealing
        if (el !== cur) { reset(cur); cur = el; }
        if (!cur) return;
        ev = e; if (!raf) raf = requestAnimationFrame(move);
      }, { passive: true });
      document.documentElement.addEventListener("pointerleave", () => { reset(cur); cur = null; });
      addEventListener("blur", () => { reset(cur); cur = null; });
    }

    /* ---------- testimonials: coverflow ---------- */
    const track = document.getElementById("tmTrack");
    if (track) {
      let cfTick = false;
      const coverflow = () => {
        cfTick = false;
        const tr = track.getBoundingClientRect(), cx = tr.left + tr.width / 2;
        $$(".tm-card", track).forEach(c => {
          const r = c.getBoundingClientRect();
          const d = ((r.left + r.width / 2) - cx) / (r.width || 1);   // 0 = centred, ±1 = one card away (works in RTL too)
          const a = Math.min(Math.abs(d), 2);
          c.style.setProperty("--cr", clamp(-d * 13, -18, 18).toFixed(2) + "deg");
          c.style.setProperty("--cz", (-a * 34).toFixed(1) + "px");
          c.style.setProperty("--cs", (1 - a * 0.03).toFixed(3));
        });
      };
      const onTrack = () => { if (!cfTick) { cfTick = true; requestAnimationFrame(coverflow); } };
      track.addEventListener("scroll", onTrack, { passive: true });
      addEventListener("resize", onTrack);
      new MutationObserver(onTrack).observe(track, { childList: true });
      coverflow(); setTimeout(coverflow, 600);
    }

    /* cards drawn later (the home page builds some after load) */
    let q = 0;
    new MutationObserver(() => { cancelAnimationFrame(q); q = requestAnimationFrame(() => { tag(); onScroll(); }); })
      .observe(document.querySelector("main") || document.body, { childList: true, subtree: true });
  };

  /* wait for load: pageInit and animations.js have built / tagged the sections by then */
  const go = () => setTimeout(start, 250);
  if (document.readyState === "complete") go(); else addEventListener("load", go);
})();
