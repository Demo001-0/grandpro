/* RIYADH PRINT — dark mode controller
   - remembers the choice (defaults to light)
   - sun/moon toggle in the header + sticky mini bar
   - circular reveal from the toggle (View Transitions API, graceful fallback)
   - twinkling star canvas with parallax + shooting stars
   - cursor spotlight on the page and on cards/categories                      */
(function () {
  const root = document.documentElement;
  const KEY = "riyadhprint_theme_v2"; // v2: resets old saved choices so the site opens in light mode
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1. apply saved theme immediately (this script sits in <head>, so no flash) ---- */
  let theme = "light";
  try { theme = localStorage.getItem(KEY) || "light"; } catch (e) {}
  root.setAttribute("data-theme", theme);
  const metaTheme = () => {
    let m = document.querySelector('meta[name="theme-color"]');
    if (!m) { m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); }
    m.content = root.dataset.theme === "dark" ? "#0d1210" : "#f4f7f3";
  };

  /* ---- 2. stars ---- */
  let canvas, ctx, W = 0, H = 0, dpr = 1, stars = [], shooters = [], raf = 0, running = false, nextShot = 0;
  let mx = 0, my = 0, sy = 0, glow = null;
  const TINTS = ["255,255,255", "214,236,206", "140,194,123", "236,222,160"];

  function makeStars() {
    const n = Math.min(170, Math.round((W * H) / 12000));
    stars = Array.from({ length: n }, () => {
      const big = Math.random() < 0.08;
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: big ? 1.2 + Math.random() * 0.9 : 0.3 + Math.random() * 0.8,
        d: 0.2 + Math.random() * 0.8,
        ph: Math.random() * 6.28, sp: 0.6 + Math.random() * 1.8,
        c: TINTS[(Math.random() * TINTS.length) | 0], big
      };
    });
  }
  function resize() {
    if (!canvas) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
    if (!running) draw(0);
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const time = t / 1000;
    for (const s of stars) {
      const a = 0.65 * (reduce ? 0.7 : 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(time * s.sp + s.ph)));
      let y = (s.y - sy * s.d * 0.18) % H; if (y < 0) y += H;
      const x = s.x + (mx - W / 2) * s.d * 0.018;
      ctx.fillStyle = `rgba(${s.c},${a})`;
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.283); ctx.fill();
      if (s.big) {                                   // 4-point sparkle on the bright ones
        const L = s.r * 5 * a;
        ctx.strokeStyle = `rgba(${s.c},${a * 0.55})`; ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(x - L, y); ctx.lineTo(x + L, y); ctx.moveTo(x, y - L); ctx.lineTo(x, y + L); ctx.stroke();
      }
    }
    if (!reduce) {
      if (time > nextShot) {                         // a shooting star every few seconds
        nextShot = time + 4 + Math.random() * 6;
        const sx = W * (0.3 + Math.random() * 0.7), sy0 = Math.random() * H * 0.45;
        shooters.push({ x: sx, y: sy0, vx: -(7 + Math.random() * 5), vy: 3 + Math.random() * 2.5, life: 1 });
      }
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s = shooters[i];
        s.x += s.vx; s.y += s.vy; s.life -= 0.016;
        if (s.life <= 0) { shooters.splice(i, 1); continue; }
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 9, s.y - s.vy * 9);
        g.addColorStop(0, `rgba(255,255,255,${s.life})`);
        g.addColorStop(0.3, `rgba(190,225,170,${s.life * 0.6})`);
        g.addColorStop(1, "rgba(140,194,123,0.0)");
        ctx.strokeStyle = g; ctx.lineWidth = 1.8; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 9, s.y - s.vy * 9); ctx.stroke();
      }
    }
  }
  let lastT = 0;
  function loop(t) { raf = requestAnimationFrame(loop); if (t - lastT < 33) return; lastT = t; draw(t); }
  function startStars() {
    if (running || reduce) { if (reduce) draw(0); return; }
    running = true; raf = requestAnimationFrame(loop);
  }
  function stopStars() { running = false; cancelAnimationFrame(raf); }

  /* ---- 3. toggle ---- */
  const toggleHTML = `<button class="theme-toggle" type="button" aria-label="Switch between light and dark mode" aria-pressed="false">
    <span class="tt-stars"><i></i><i></i><i></i></span><span class="tt-cloud"></span>
    <span class="tt-knob"><b></b><b></b><b></b></span></button>`;

  function syncToggles() {
    const dark = root.dataset.theme === "dark";
    document.querySelectorAll(".theme-toggle").forEach(b => b.setAttribute("aria-pressed", dark));
  }
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    metaTheme(); syncToggles();
    t === "dark" ? startStars() : stopStars();
  }
  function switchTheme(btn) {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    const r0 = btn.getBoundingClientRect();
    const x = r0.left + r0.width / 2, y = r0.top + r0.height / 2;
    const msg = () => {};   /* no toast popup when switching theme */
    if (!document.startViewTransition || reduce) { applyTheme(next); msg(); return; }
    const tr = document.startViewTransition(() => applyTheme(next));
    tr.ready.then(() => {
      const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] },
        { duration: 900, easing: "cubic-bezier(.2,.8,.2,1)", pseudoElement: "::view-transition-new(root)" }
      );
    }).catch(() => {});
    tr.finished.then(msg).catch(() => {});
  }

  function inject() {
    const hdr = document.querySelector(".header-actions:last-child");
    if (hdr && !hdr.querySelector(".theme-toggle")) hdr.insertAdjacentHTML("afterbegin", toggleHTML);
    const mini = document.querySelector("#mini .macts");
    if (mini && !mini.querySelector(".theme-toggle")) mini.insertAdjacentHTML("afterbegin", toggleHTML);
    syncToggles();
  }

  document.addEventListener("click", e => {
    const b = e.target.closest(".theme-toggle");
    if (b) switchTheme(b);
  });

  /* ---- 4. pointer glow ---- */
  let pend = false, px = 0, py = 0;
  document.addEventListener("pointermove", e => {
    if (e.pointerType === "touch") return;
    px = e.clientX; py = e.clientY; mx = px; my = py;
    if (pend) return; pend = true;
    requestAnimationFrame(() => {
      pend = false;
      if (glow) glow.style.transform = `translate3d(${px}px,${py}px,0)`;
    });
  }, { passive: true });
  document.addEventListener("pointermove", e => {
    const t = e.target.closest && e.target.closest(".card,.cat");
    if (!t) return;
    const r = t.getBoundingClientRect();
    t.style.setProperty("--x", e.clientX - r.left + "px");
    t.style.setProperty("--y", e.clientY - r.top + "px");
  }, { passive: true });
  addEventListener("scroll", () => { sy = scrollY; }, { passive: true });

  /* ---- boot ---- */
  document.addEventListener("DOMContentLoaded", () => {
    canvas = document.createElement("canvas"); canvas.id = "stars"; canvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(canvas); ctx = canvas.getContext("2d");
    glow = document.createElement("div"); glow.id = "cursorglow"; glow.setAttribute("aria-hidden", "true"); document.body.appendChild(glow);
    resize(); addEventListener("resize", resize);
    metaTheme();
    if (root.dataset.theme === "dark") startStars();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stopStars(); else if (root.dataset.theme === "dark") startStars();
    });
    // run after app.js has built the header, and again once anim.js adds the mini bar
    setTimeout(inject, 0);
    new MutationObserver(inject).observe(document.body, { childList: true });
    setTimeout(inject, 400);
  });
})();
