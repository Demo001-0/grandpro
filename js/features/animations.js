/* GrandPro animations: scroll reveals, headline reveal, emblem rotation, parallax, progress, page transitions */
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const $ = (s, r = document) => [...r.querySelectorAll(s)];

  // nav stagger + progress bar
  $(".nav a").forEach((a, i) => a.style.setProperty("--i", i));
  const prog = document.body.appendChild(Object.assign(document.createElement("div"), { id: "prog" }));

  // signature: a little sun that turns as you scroll, its ring fills with progress, tap to rise back to the top
  const sunBtn = document.body.appendChild(Object.assign(document.createElement("button"), {
    id: "sunTop", type: "button",
    innerHTML: `<svg class="ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="trk" cx="24" cy="24" r="21"/><circle class="bar" cx="24" cy="24" r="21"/></svg><span class="sn">${sunLogo}</span>`
  }));
  sunBtn.setAttribute("aria-label", t("Back to top"));
  sunBtn.onclick = () => scrollTo({ top: 0, behavior: "smooth" });

  // hero headline, word by word
  const h1 = document.querySelector(".hero h1");
  if (h1) h1.innerHTML = h1.textContent.trim().split(/\s+/).map((w, i) => `<span class="w"><span style="--i:${i}">${w}</span></span>`).join(" ");

  // scroll reveals
  const MAP = {
    up: ".section-title,.lk-sub,.features>div,.banner>*,.sale-copy>*,.info-page>*,.crumbs,.toolbar,.hero p,.hero .btn,.footer .cols>div",
    zoom: ".cat,.card,.ccard",
    wipe: ".lk-tile",
    pop: ".features .fi",
    fade: ".sale-art",
    left: ".product .gallery",
    right: ".product>div:last-child"
  };
  const io = new IntersectionObserver(es => {
    let n = 0;
    es.filter(e => e.isIntersecting).forEach(e => {
      e.target.style.transitionDelay = Math.min(n++, 8) * 90 + "ms";
      e.target.classList.add("in");
      io.unobserve(e.target);
      setTimeout(() => (e.target.style.transitionDelay = ""), 1500);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  const scan = () => Object.entries(MAP).forEach(([k, sel]) =>
    $(sel).forEach(el => { if (!el.dataset.r) { el.dataset.r = k; io.observe(el); } }));
  scan();

  // sale number counts up when it scrolls into view
  const num = document.querySelector(".sale-art b");
  if (num && num.firstChild && num.firstChild.nodeType === 3) {
    const node = num.firstChild, target = parseInt(node.textContent, 10) || 0;
    node.textContent = "0";
    new IntersectionObserver((es, o) => {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      const t0 = performance.now(), dur = 1400;
      const step = t => { const k = Math.min(1, (t - t0) / dur); node.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, { threshold: 0.4 }).observe(num);
  }

  // creative typewriter: headings "ink in" letter by letter with a glowing caret (random rhythm, longer beats on punctuation)
  const TW_SEL = ".section-title,.sale h2,.banner h2,.info-page h1,.product h1";
  const esc = c => c.replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const twType = el => {
    el.dataset.twDone = "1";
    const cs = [...el.querySelectorAll(".c")];
    if (!cs.length) return;
    const base = Math.max(40, Math.min(75, 3000 / cs.length));
    let i = 0, prev = null;
    const step = () => {
      if (prev) prev.classList.remove("last");
      if (i >= cs.length) return;
      const c = cs[i++];
      c.classList.add("on", "last");
      prev = c;
      if (i >= cs.length) {
        el.classList.add("tw-done");
        setTimeout(() => c.classList.remove("last"), 2400);
        return;
      }
      const ch = c.textContent, endOfWord = c.parentNode !== cs[i].parentNode;
      let d = base * (0.6 + Math.random() * 0.9);
      if (endOfWord) d += 65;
      if (/[,.:;!?\u2013\u2014-]/.test(ch)) d += 220;
      setTimeout(step, d);
    };
    setTimeout(step, 350);
  };
  const twIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    if (!el.querySelector(".c")) return;
    twIO.unobserve(el);
    twType(el);
  }), { threshold: 0.45 });
  const twScan = () => $(TW_SEL).forEach(el => {
    if (el.dataset.twDone || el.children.length) return;
    const text = el.textContent.trim();
    if (!text) return;
    const ar = /[\u0600-\u06FF]/.test(text);   // Arabic: letters must stay joined, so they stay inline (opacity/blur only, no transform)
    el.setAttribute("aria-label", text);
    el.innerHTML = `<span class="tw${ar ? " tw-ar" : ""}" aria-hidden="true">${text.split(/\s+/).map(w => `<span class="tww">${[...w].map(ch => `<span class="c">${esc(ch)}</span>`).join("")}</span>`).join(" ")}</span>`;
    twIO.observe(el);
  });
  twScan();

  // scroll-linked effects: p runs 0 (entering) -> 1 (leaving) for each element
  const FX = [
    [".card .img svg,.card .img img", (el, p) => el.style.setProperty("--cy", (p - .5) * -28 + "px")],
    [".section-title", (el, p) => (el.style.translate = innerWidth > 820 ? `${(p - .5) * -70}px 0` : "none")],
    // images drift inside their frames
    [".lk-tile img", (el, p) => (el.style.translate = `0 ${(p - .5) * -46}px`)],
    // hero copy and photo glide at different speeds as you leave the top
    [".hero2 .hero-copy", () => (document.body.classList.contains("home-splash") ? 0 : (document.querySelector(".hero2 .hero-copy").style.translate = `0 ${Math.min(scrollY, 600) * -0.1}px`))],
    [".hero2 .hero-stage", () => (document.querySelector(".hero2 .hero-stage").style.translate = `0 ${Math.min(scrollY, 600) * 0.07}px`)],
    // sale card grows into place; the big number floats a touch faster
    [".sale", (el, p) => { const k = Math.min(1, p * 2.4); el.style.scale = (0.955 + 0.045 * k).toFixed(4); }],
    [".sale-art b", (el, p) => (el.style.translate = `0 ${(p - .5) * -34}px`)],
    // category tiles and feature strip: soft lift while crossing the screen
    [".banner", (el, p) => el.style.setProperty("--bp", (p * 100).toFixed(1) + "%")]
  ];
  let items = [];
  const collect = () => { items = []; FX.forEach(([sel, fn]) => $(sel).forEach((el, i) => items.push([el, fn, i]))); };

  // compact bar that slides in when you scroll back up
  const mini = document.createElement("div");
  mini.id = "mini";
  mini.innerHTML = `<button class="icon-btn mburger" id="mMenu" type="button" aria-label="${t("Menu")}">${icons.menu}</button>
    <a class="mlogo" href="home.html" aria-label="${BRAND}"><span class="msun">${sunLogo}</span><span class="mword">GRANDPRO</span></a>
    <nav>${navLinks.map(([h, l]) => `<a href="${h}">${t(l)}</a>`).join("")}</nav>
    <div class="macts"><button class="icon-btn lang-btn" id="mLang" type="button" aria-label="${t("Switch language")}">${icons.globe}<span class="lang-code">${isAR() ? "EN" : "ع"}</span></button><button class="icon-btn" id="mSearch" aria-label="${t("Search")}">${icons.search}</button>
    <button class="icon-btn" id="mCart" aria-label="${t("Cart")}">${icons.bag}<span class="cart-count" id="mCount">0</span></button></div>`;
  document.body.appendChild(mini);
  document.getElementById("mLang").onclick = toggleLang;
  document.getElementById("mMenu").onclick = () => document.getElementById("openMenu").click();
  document.getElementById("mSearch").onclick = () => document.getElementById("openSearch").click();
  document.getElementById("mCart").onclick = () => document.getElementById("openCart").click();
  const mCount = document.getElementById("mCount"), badge = document.getElementById("cartCount");

  // eased scroll motion: every parallax value glides toward its target instead of jumping with each scroll event
  const moving = new Set(); let easeRaf = 0;
  const ease = () => {
    easeRaf = 0;
    moving.forEach(el => {
      const d = el._t - el._p;
      if (Math.abs(d) < 0.0006) { el._p = el._t; el._fn(el, el._p, el._i); moving.delete(el); return; }
      el._p += d * 0.12;
      el._fn(el, el._p, el._i);
    });
    if (moving.size) easeRaf = requestAnimationFrame(ease);
  };

  let last = 0, tick = false;
  const update = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight, vh = innerHeight;
    const pg = max > 0 ? Math.min(1, y / max) : 0;
    prog.style.transform = `scaleX(${pg})`;
    sunBtn.style.setProperty("--pg", pg.toFixed(4));
    sunBtn.style.setProperty("--turn", (y * 0.35) + "deg");
    sunBtn.classList.toggle("show", y > 420);
    const root = document.documentElement.style;
    root.setProperty("--rot", y * 0.2 + "deg");
    root.setProperty("--py", Math.min(y, 250) * 0.07 + "px");
    items.forEach(([el, fn, i]) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -150 || r.top > vh + 150) { el._off = true; return; }
      const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
      if (el._p === undefined || el._off) { el._p = p; el._off = false; fn(el, p, i); }   // first time in view: no catch-up swoosh
      el._t = p; el._fn = fn; el._i = i; moving.add(el);
    });
    if (moving.size && !easeRaf) easeRaf = requestAnimationFrame(ease);
    const hdr = document.querySelector(".header");
    const past = y > (hdr ? hdr.offsetTop + hdr.offsetHeight : 300);
    if (document.body.classList.contains("home-splash") && hdr) {
      // splash screen: logo shrinks/fades/drifts as you scroll, then settles into the compact bar
      const h = hdr.offsetHeight, p = Math.max(0, Math.min(1, y / h));
      root.setProperty("--sp", p.toFixed(4));
      root.setProperty("--sy", Math.min(y, h) + "px");
      mini.classList.toggle("show", p > 0.82);
    } else
    mini.classList.toggle("show", past && y < last - 2 || (past && mini.classList.contains("show") && y <= last + 2));
    if (mCount.textContent !== badge.textContent) {
      mCount.textContent = badge.textContent; mCount.classList.remove("pop"); void mCount.offsetWidth; mCount.classList.add("pop");
    }
    last = y; tick = false;
  };
  const onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(update); } };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  // dynamic content (filters, related products, search) gets the same treatment
  collect(); update();
  let q = 0;
  new MutationObserver(() => { cancelAnimationFrame(q); q = requestAnimationFrame(() => { scan(); twScan(); collect(); onScroll(); }); })
    .observe(document.body, { childList: true, subtree: true });

  // cart badge pop
  if (badge) {
    let lastTxt = badge.textContent;
    new MutationObserver(() => {
      if (badge.textContent === lastTxt) return;
      lastTxt = badge.textContent;
      badge.classList.remove("pop"); void badge.offsetWidth; badge.classList.add("pop");
    }).observe(badge, { childList: true, characterData: true, subtree: true });
  }

  // page transitions
  document.addEventListener("click", e => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target || !/\.html/.test(a.getAttribute("href"))) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => (location.href = a.href), 230);
  });
  addEventListener("pageshow", e => e.persisted && document.body.classList.remove("leaving"));
})();
