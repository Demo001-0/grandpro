/* js/features/card-tilt.js — light 3D tilt + moving glare on product cards. No WebGL, just CSS transforms.
   Desktop: follows the mouse.  Phone: follows the gyroscope (tilt the phone).  Respects "reduce motion".
   Cards are found by delegation, so cards drawn later (shop filters, search, related products) work too. */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const MAX = 7;                                   // max tilt in degrees
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const glareOf = c => c.querySelector(":scope > .tilt-glare") || c.appendChild(Object.assign(document.createElement("span"), { className: "tilt-glare", ariaHidden: "true" }));

  const apply = (c, nx, ny) => {                   // nx, ny in -1..1 (left→right, top→bottom)
    if (c.hasAttribute("data-r") && !c.classList.contains("in")) return;      // wait for the scroll-reveal to finish
    glareOf(c);
    c.classList.add("tilt-on");
    c.style.setProperty("--rx", (-ny * MAX).toFixed(2) + "deg");
    c.style.setProperty("--ry", (nx * MAX).toFixed(2) + "deg");
    c.style.setProperty("--gx", ((nx + 1) * 50).toFixed(1) + "%");
    c.style.setProperty("--gy", ((ny + 1) * 50).toFixed(1) + "%");
  };
  const reset = c => { c.classList.remove("tilt-on"); c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); };

  /* ---------- desktop: mouse ---------- */
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    let cur = null, raf = 0, ev = null;
    const tick = () => {
      raf = 0; if (!cur || !ev) return;
      const r = cur.getBoundingClientRect();
      apply(cur, clamp(((ev.clientX - r.left) / r.width) * 2 - 1, -1, 1), clamp(((ev.clientY - r.top) / r.height) * 2 - 1, -1, 1));
    };
    addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      const c = e.target.closest && e.target.closest(".card");
      if (c !== cur) { if (cur) reset(cur); cur = c; }
      if (!cur) return;
      ev = e; if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    document.addEventListener("pointerleave", () => { if (cur) { reset(cur); cur = null; } }, true);
  }

  /* ---------- phone: gyroscope ---------- */
  else if ("DeviceOrientationEvent" in window) {
    let bB = null, bG = null, nB = 0, nG = 0, live = false, visible = [], lastScan = 0;
    const scan = now => {
      if (now - lastScan < 300) return; lastScan = now;
      visible = [...document.querySelectorAll(".card")].filter(c => { const r = c.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
    };
    const loop = now => {
      requestAnimationFrame(loop);
      if (!live || document.hidden) return;
      scan(now);
      for (const c of visible) apply(c, nG, nB);
    };
    const onOri = e => {
      if (e.beta == null || e.gamma == null) return;
      if (bB == null) { bB = e.beta; bG = e.gamma; }
      bB += (e.beta - bB) * 0.02; bG += (e.gamma - bG) * 0.02;                   // neutral pose slowly follows how the phone is held
      nB += (clamp((e.beta - bB) / 18, -1, 1) - nB) * 0.15;
      nG += (clamp((e.gamma - bG) / 18, -1, 1) - nG) * 0.15;
      if (!live) { live = true; requestAnimationFrame(loop); }
    };
    const start = () => addEventListener("deviceorientation", onOri, { passive: true });
    if (typeof DeviceOrientationEvent.requestPermission === "function") {        // iOS: needs one tap to allow motion access
      const ask = () => { removeEventListener("touchend", ask, true); DeviceOrientationEvent.requestPermission().then(s => { if (s === "granted") start(); }).catch(() => {}); };
      addEventListener("touchend", ask, true);
    } else start();
  }
})();
