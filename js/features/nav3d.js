/* js/features/nav3d.js — 3D "lens" navigation (desktop). Applies to the top nav (.nav) and the sticky bar (#mini nav).
   - the nav becomes a glass capsule that tilts toward the pointer, with a light that follows the cursor
   - a lime lens glides (with a little squash) to the hovered link and rests on the current page
   - every link text is a 3D cube: hover rolls it over on the X axis
   - links drop in with a staggered 3D flip when the page loads
   Phones keep the normal slide-in menu (all the 3D CSS is inside @media(min-width:821px)).
   Remove: delete this file, css/refinements/nav3d.css, its @import and the loader line in bootstrap.js. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;
  const wide = () => matchMedia("(min-width:821px)").matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const here = (typeof page !== "undefined" && page) || (location.pathname.split("/").pop() || "home.html");
  const norm = h => (h === "index.html" ? "home.html" : h);

  const setup = nav => {
    if (!nav || nav.dataset.n3d) return;
    nav.dataset.n3d = "1"; nav.classList.add("n3d");
    const links = [...nav.querySelectorAll("a")];
    links.forEach((a, i) => {
      const txt = a.textContent.trim();
      a.innerHTML = `<span class="nv"><span class="s">${esc(txt)}</span><span class="nv-in"><span class="a" aria-hidden="true">${esc(txt)}</span><span class="b" aria-hidden="true">${esc(txt)}</span></span></span>`;
      a.style.setProperty("--i", i);
      if (norm(a.getAttribute("href")) === norm(here)) a.classList.add("is-cur");
    });
    const lens = document.createElement("i"); lens.className = "nv-lens"; lens.setAttribute("aria-hidden", "true"); nav.prepend(lens);
    const cur = () => links.find(a => a.classList.contains("is-cur") || a.classList.contains("active"));
    let shown = null;
    const place = (a, instant) => {
      if (!a) { lens.style.opacity = "0"; shown = null; return; }
      lens.style.opacity = "1";
      if (instant) lens.style.transition = "none";
      lens.style.width = a.offsetWidth + "px"; lens.style.transform = `translateX(${a.offsetLeft}px)`;
      if (instant) { void lens.offsetWidth; lens.style.transition = ""; }
      if (shown !== a && !instant && !reduce) { lens.classList.remove("go"); void lens.offsetWidth; lens.classList.add("go"); }
      shown = a;
    };
    const rest = instant => place(cur(), instant);
    links.forEach(a => {
      a.addEventListener("pointerenter", () => { if (wide()) place(a); });
      a.addEventListener("focus", () => { if (wide()) place(a); });
      a.addEventListener("blur", () => rest());
    });
    nav.addEventListener("pointerleave", () => { rest(); nav.style.transform = ""; });
    /* tilt + cursor light (mouse only) */
    if (fine && !reduce) {
      let raf = 0, ev = null;
      nav.addEventListener("pointermove", e => {
        if (!wide()) return; ev = e;
        if (!raf) raf = requestAnimationFrame(() => {
          raf = 0; const r = nav.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
          nav.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); nav.style.setProperty("--my", (y * 100).toFixed(1) + "%");
          nav.style.transform = `perspective(700px) rotateX(${((.5 - y) * 9).toFixed(2)}deg) rotateY(${((x - .5) * 12).toFixed(2)}deg)`;
        });
      }, { passive: true });
    }
    const again = () => rest(true);
    addEventListener("resize", again);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(again);
    setTimeout(again, 60); setTimeout(again, 700); setTimeout(again, 1600);
  };

  setup(document.getElementById("nav"));
  let tries = 0; const wait = setInterval(() => {                 // the sticky bar is built by animations.js a moment later
    const m = document.querySelector("#mini nav");
    if (m) { setup(m); clearInterval(wait); } else if (++tries > 40) clearInterval(wait);
  }, 150);
})();
