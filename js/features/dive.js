/* js/features/dive.js — "Dive into the logo" experience (home hero).
   Click the big logo in the hero background (or the "enter" pill) → the camera dives into it, then every scroll / swipe / arrow key
   flies the camera to the next category "page" with a light 3D turn + zoom (After-Effects style camera move).
   How it works:
     - cur   = where the camera is right now (a fractional scene number, smoothed every frame)
     - target = the scene we want to reach (a whole number, changed by wheel / swipe / keys)
     - draw(cur) places every scene in 3D according to d = sceneIndex - cur  (0 = in front of the camera, 1 = far ahead, -1 = passed behind us)
   Remove: delete this file + css/motion/dive.css (+ its @import) + the loader line in bootstrap.js. */
(() => {
  const hero = document.querySelector(".hero2"), sun = document.getElementById("heroSun");
  if (!hero || !sun || typeof PRODUCTS === "undefined" || typeof sunLogo === "undefined") return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* the dive shows ONLY products that have a real photo (p.img). A category with no photo product has no page. */
  const real = p => !!p.img;
  const CATS = ["Cards", "Flyers", "Stickers", "Packaging", "Posters"].filter(c => PRODUCTS.some(p => p.cat === c && real(p)));   // the "pages", in order
  const N = CATS.length;
  const clamp01 = x => Math.max(0, Math.min(1, x));
  const RINGS = 7;

  /* texts (English key → Arabic) — added to the site dictionary */
  Object.assign(AR, {
    "Enter the experience": "ادخل التجربة", "Dive into Riyadh Print": "رحلة داخل مطابع الرياض", "Scroll to continue": "اسكرول للتالي",
    "Scroll to enter the store": "اسكرول للدخول للموقع", "Dive with me": "اغطس معايا", "A quick trip through Riyadh Print": "جولة سريعة جوه عالم مطابع الرياض", "Dismiss": "إخفاء",
    "Business cards, thank-you cards and loyalty cards that people keep.": "كروت شخصية وكروت شكر وولاء بيحتفظ بيها الناس.",
    "Roll-ups, banners and posters you can see from across the street.": "رول أب وبانرات وبوسترات تتشاف من آخر الشارع.",
    "Table cards, door hangers and receipt books that work hard for your business.": "كروت طاولة وتاقات أبواب ودفاتر سندات بتشتغل لصالح شغلك.",
    "Seal stickers, die-cut stickers and roll labels for every pack.": "ستيكرات إغلاق وستيكرات مقصوصة وليبلز رول لكل عبوة.",
    "Boxes, bags and carriers printed with your brand, inside and out.": "علب وأكياس وحاملات مطبوعة بهويتك من جوه ومن برة."
  });
  const DESC = {
    Cards: "Business cards, thank-you cards and loyalty cards that people keep.",
    Flyers: "Table cards, door hangers and receipt books that work hard for your business.",
    Posters: "Roll-ups, banners and posters you can see from across the street.",
    Stickers: "Seal stickers, die-cut stickers and roll labels for every pack.",
    Packaging: "Boxes, bags and carriers printed with your brand, inside and out."
  };
  const pad = n => (isAR() ? "٠" : "0") + num(n);
  const arrow = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${isAR() ? "M19 12H5M11 6l-6 6 6 6" : "M5 12h14M13 6l6 6-6 6"}"/></svg>`;

  /* ---------- entry pill (also the keyboard / touch way in) ---------- */
  const pill = document.createElement("button");
  pill.type = "button"; pill.className = "dv-enter"; pill.hidden = true; pill.tabIndex = -1;   // never shown: the "Enter the experience" pill was removed
  pill.innerHTML = `<i><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></i><span>${t("Enter the experience")}</span>`;
  // (the "Enter the experience" pill is no longer shown in the hero — the logo itself is the button; the element stays only as a focus target)

  /* ---------- build the overlay (once, lazily) ---------- */
  let dv, world, scenes = [], ringsCv, ringsCtx, RW = 0, RH = 0, DPR = 1, logoEl, hintEl, built = false;
  const build = () => {
    built = true;
    dv = document.createElement("div");
    dv.className = "dv"; dv.setAttribute("role", "dialog"); dv.tabIndex = -1; dv.setAttribute("aria-modal", "true"); dv.setAttribute("aria-label", t("Dive into Riyadh Print"));
    dv.innerHTML = `
      <div class="dv-bg" aria-hidden="true">
        <div class="dv-logo">${sunLogo}</div>
        <canvas class="dv-rings"></canvas>
      </div>
      <div class="dv-world"></div>
      <div class="dv-hint" aria-hidden="true"><span>${t("Scroll to continue")}</span><i></i></div>`;
    document.body.appendChild(dv);
    world = dv.querySelector(".dv-world");
    ringsCv = dv.querySelector(".dv-rings"); ringsCtx = ringsCv.getContext("2d");
    logoEl = dv.querySelector(".dv-logo");
    hintEl = dv.querySelector(".dv-hint");

    CATS.forEach((cat, i) => {
      const items = PRODUCTS.filter(p => p.cat === cat && real(p));
      const el = document.createElement("section");
      el.className = "dv-scene";
      el.setAttribute("aria-label", catName(cat));
      el.innerHTML = `
        <div class="dv-big" aria-hidden="true">${pad(i + 1)}</div>
        <div class="dv-text">
          <span class="dv-kicker">${num(items.length)} ${t(items.length === 1 ? "product" : "products")}</span>
          <h2>${catName(cat)}</h2>
          <p>${t(DESC[cat])}</p>
          <div class="dv-btns">
            <a class="dv-cta" href="shop.html?cat=${cat}">${t("Shop now")}${arrow}</a>
            <a class="dv-ghost" href="shop.html">${t("All products")}</a>
          </div>
        </div>
        <div class="dv-cards n${Math.min(items.length, 3)}">
          ${items.slice(0, 3).map((p, k) => `<a class="dv-card c${k + 1}" href="product.html?id=${p.id}">${productVisual(p)}<span>${pName(p)}</span></a>`).join("")}
        </div>`;
      world.appendChild(el);
      scenes.push({ el, hidden: false });
    });


    /* input: wheel, touch, keyboard, pointer (camera sway) */
    dv.addEventListener("wheel", onWheel, { passive: false });
    dv.addEventListener("touchstart", e => { ty0 = e.touches[0].clientY; }, { passive: true });
    dv.addEventListener("touchend", e => {
      const dy = ty0 - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 46) step(dy > 0 ? 1 : -1);
    }, { passive: true });
    addEventListener("resize", sizeRings);
    dv.addEventListener("pointermove", e => { px = (e.clientX / innerWidth - .5) * 2; py = (e.clientY / innerHeight - .5) * 2; });
  };

  /* ---------- camera state ---------- */
  let frames = 0, slow = 0, isOpen = false, closing = false, cur = 0, target = 0, idx = 0, raf = 0, last = 0;
  let px = 0, py = 0, mx = 0, my = 0, ty0 = 0, lockUntil = 0, lastW = 0, lastA = 0, inertEls = [];

  const setIdx = i => {
    idx = i;
    hintEl.querySelector("span").textContent = t(i === N - 1 ? "Scroll to enter the store" : "Scroll to continue");
  };
  const step = d => {
    if (!isOpen || closing) return;
    if (d > 0 && idx === N - 1) { close(); return; }      // scrolling past the last page leaves the experience and enters the store
    const n = Math.max(0, Math.min(N - 1, idx + d));
    lockUntil = performance.now() + 900;
    if (n === idx) { cur += d * .12; return; }       // at the first / last page: a small camera bump
    target = n; setIdx(n);
  };
  const goTo = i => { if (i === idx) return; lockUntil = performance.now() + 700; target = i; setIdx(i); };

  const onWheel = e => {
    e.preventDefault();
    const now = performance.now(), a = Math.abs(e.deltaY);
    const fresh = now - lastW > 140 || a > lastA * 1.25;     // a new gesture, not the inertia tail of the last one
    lastW = now; lastA = a;
    if (now < lockUntil || !fresh || a < 4) return;
    step(e.deltaY > 0 ? 1 : -1);
  };
  const onKey = e => {
    if (!isOpen) return;
    const k = e.key, nextLR = isAR() ? "ArrowLeft" : "ArrowRight", prevLR = isAR() ? "ArrowRight" : "ArrowLeft";
    if (k === "ArrowDown" || k === "PageDown" || k === " " || k === nextLR) { e.preventDefault(); step(1); }
    else if (k === "ArrowUp" || k === "PageUp" || k === prevLR) { e.preventDefault(); step(-1); }
  };

  /* ---------- the camera: place every scene in 3D ---------- */
  const draw = p => {
    world.style.transform = reduce ? "" : `rotateY(${(mx * -4.5).toFixed(2)}deg) rotateX(${(my * 3.5).toFixed(2)}deg)`;
    scenes.forEach((s, i) => {
      const d = i - p, a = Math.abs(d);
      if (d < -1.3 || d > 2.2) { if (!s.hidden) { s.el.style.visibility = "hidden"; s.hidden = true; } return; }
      if (s.hidden) { s.el.style.visibility = "visible"; s.hidden = false; }
      // ahead of the camera (d>0): far away + turned; behind (d<0): flew past us, big and fading fast
      const o = reduce ? (a < .5 ? 1 : 0) : (d < 0 ? clamp01(1 + d * 1.7) : clamp01(1 - d * 1.3));
      if (reduce) s.el.style.transform = "";
      else {
        const z = d > 0 ? -d * 1000 : -d * 850;
        s.el.style.transform = `translate3d(${(d * 240).toFixed(1)}px,${(d * -70).toFixed(1)}px,${z.toFixed(1)}px) rotateY(${(d * -26).toFixed(2)}deg) rotateX(${(d * 7).toFixed(2)}deg) rotateZ(${(d * 4).toFixed(2)}deg)`;
      }
      s.el.style.setProperty("--o", o.toFixed(3));
      s.el.classList.toggle("on", a < .5);
    });
    // background tunnel: rings (drawn on one canvas — cheap) rush toward the camera as we move
    if (RW) {
      const c = ringsCtx, base = Math.min(RW, RH) * .45;
      c.clearRect(0, 0, RW, RH); c.strokeStyle = "#8cc27b"; c.lineWidth = 1.5 * DPR;
      for (let k = 0; k < RINGS; k++) {
        const f = (((k / RINGS) + p * .4) % 1 + 1) % 1;
        c.globalAlpha = Math.sin(Math.PI * f) * .4;
        c.beginPath(); c.arc(RW / 2, RH * .46, base * (.08 + f * f * 3.6), 0, 6.2832); c.stroke();
      }
    }
    logoEl.style.transform = `translate(-50%,-50%) rotate(${(p * 55).toFixed(2)}deg) scale(${(1 + p * .14).toFixed(3)})`;
  };

  const frame = now => {
    const raw = (now - last) / 1000, dt = Math.min(.1, raw); last = now;
    if (frames < 60) { frames++; if (raw > .045) slow++; if (frames === 60 && slow > 35) dv.classList.add("lite"); }   // weak device → drop the decorations
    const k = reduce ? 1 : 1 - Math.exp(-dt * 5);             // frame-rate independent easing
    cur += (target - cur) * k;
    mx += (px - mx) * (1 - Math.exp(-dt * 6)); my += (py - my) * (1 - Math.exp(-dt * 6));
    draw(cur);
    raf = isOpen ? requestAnimationFrame(frame) : 0;
  };
  const sizeRings = () => {
    if (!ringsCv) return;
    DPR = Math.min(devicePixelRatio || 1, 1.5);
    RW = ringsCv.width = Math.round(innerWidth * DPR); RH = ringsCv.height = Math.round(innerHeight * DPR);
  };
  const startLoop = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  /* ---------- open / close ---------- */
  const setInert = on => [...document.body.children].forEach(el => {
    if (el === dv || el.tagName === "SCRIPT" || el.classList.contains("dv-fly")) return;
    if (on) { if (!el.inert) { el.inert = true; inertEls.push(el); } }
  });
  const open = src => {
    if (isOpen) return;
    const from = (src && src.getBoundingClientRect && src.nodeType === 1) ? src : sun;   // which logo the dive grows out of
    if (!built) build();
    isOpen = true; closing = false; hidePop();
    document.documentElement.classList.add("dv-open");
    hero.classList.remove("dv-hot"); tip.classList.remove("on");
    dv.classList.remove("out"); dv.classList.add("show");
    setInert(true);
    setIdx(0); sizeRings();
    if (reduce) { cur = target = 0; dv.classList.add("vis"); startLoop(); dv.focus(); return; }

    // 1) a copy of the logo grows from where it sits until it fills the screen
    const r = from.getBoundingClientRect();
    const fly = document.createElement("div");
    fly.className = "dv-fly"; fly.innerHTML = sunLogo; fly.setAttribute("aria-hidden", "true");
    Object.assign(fly.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
    document.body.appendChild(fly);
    const sc = Math.max(innerWidth, innerHeight) * 2.4 / r.width;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      fly.style.transform = `translate(${innerWidth / 2 - (r.left + r.width / 2)}px,${innerHeight / 2 - (r.top + r.height / 2)}px) scale(${sc.toFixed(2)}) rotate(40deg)`;
      fly.classList.add("go");
    }));
    // 2) the dark world fades in, 3) the first page flies in from far away
    cur = -1.25; target = 0;
    setTimeout(() => { dv.classList.add("vis"); startLoop(); }, 380);
    setTimeout(() => { fly.remove(); if (isOpen) dv.focus(); }, 1250);
  };
  const close = () => {
    if (!isOpen || closing) return;
    closing = true;
    target = -1.1;                                           // camera pulls back out
    dv.classList.add("out"); dv.classList.remove("vis");
    setTimeout(() => {
      isOpen = false; closing = false;
      dv.classList.remove("show", "out");
      document.documentElement.classList.remove("dv-open");
      inertEls.forEach(el => { el.inert = false; }); inertEls = [];
      cancelAnimationFrame(raf); raf = 0;
      pill.focus({ preventScroll: true });
      schedulePop(900);
    }, reduce ? 0 : 560);
  };

  /* ---------- the logo in the hero background is the button ---------- */
  const tip = document.createElement("div");
  tip.className = "dv-tip"; tip.textContent = t("Enter the experience"); document.body.appendChild(tip);
  const overSun = e => {
    if (e.target.closest("a,button,.arch,.float-card,.hp-chip,.dots,.hero-actions")) return false;
    const r = sun.getBoundingClientRect(), R = Math.min(r.width, r.height) / 2;
    return Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)) < R * .97;
  };
  let tx = 0, ty = 0, downX = 0, downY = 0;
  hero.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse" || isOpen) return;
    const hot = overSun(e);
    hero.classList.toggle("dv-hot", hot); tip.classList.toggle("on", hot);
    tx = e.clientX; ty = e.clientY; tip.style.transform = `translate3d(${tx}px,${ty}px,0)`;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { hero.classList.remove("dv-hot"); tip.classList.remove("on"); });
  hero.addEventListener("pointerdown", e => { downX = e.clientX; downY = e.clientY; });
  hero.addEventListener("click", e => {
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return;      // that was a slider drag, not a click
    if (overSun(e)) open();
  });
  pill.addEventListener("click", () => open());

  /* ---------- the big splash logo at the very top of the home page is a button too ---------- */
  const splashEmblem = e => (e.target.closest && !isOpen && document.body.classList.contains("home-splash")) ? e.target.closest(".home-splash .header .logo svg") : null;
  document.addEventListener("click", e => {
    const em = splashEmblem(e);
    if (!em) return;
    e.preventDefault(); e.stopPropagation();     // it sits inside a link to home.html — don't reload the page
    open(em);
  }, true);
  document.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse" || isOpen) return;
    const em = splashEmblem(e);
    if (!em) return;                              // (the hero-section tip is handled above)
    tip.classList.add("on"); tx = e.clientX; ty = e.clientY; tip.style.transform = `translate3d(${tx}px,${ty}px,0)`;
  }, { passive: true });
  document.addEventListener("pointerout", e => { if (e.target.closest && e.target.closest(".home-splash .header .logo svg")) tip.classList.remove("on"); });
  addEventListener("keydown", onKey);

  /* ---------- "Dive with me" pop-up: shows for 15 s, once per page load; click = run the dive ---------- */
  const POP_MS = 15000;
  let pop, popTimer = 0, popWait = 0, popDone = false;
  const hidePop = () => {
    clearTimeout(popTimer); clearTimeout(popWait);
    if (pop) { pop.classList.remove("show"); pop.classList.add("bye"); }
  };
  const showPop = () => {
    if (popDone || isOpen) return;
    popDone = true;
    pop = document.createElement("aside");
    pop.className = "dv-pop"; pop.setAttribute("aria-label", t("A quick trip through Riyadh Print"));
    pop.style.setProperty("--ms", POP_MS + "ms");
    pop.innerHTML = `
      <button type="button" class="dv-pop-go">
        <span class="dv-pop-orb">
          <i class="r1"></i><i class="r2"></i>
          <svg class="dv-pop-ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29"/></svg>
          <span class="dv-pop-logo">${sunLogo}</span>
        </span>
        <span class="dv-pop-txt"><small>${t("A quick trip through Riyadh Print")}</small></span>
        <span class="dv-pop-go-arrow" aria-hidden="true">${arrow}</span>
      </button>
      <button type="button" class="dv-pop-x" aria-label="${t("Dismiss")}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>`;
    document.body.appendChild(pop);
    /* phone: the pop-up starts collapsed (just the orb). 1st tap = expand and show the description, 2nd tap = run the dive */
    const phoneMQ = matchMedia("(max-width:700px)");
    const go = pop.querySelector(".dv-pop-go");
    go.setAttribute("aria-expanded", phoneMQ.matches ? "false" : "true");
    go.onclick = () => {
      if (phoneMQ.matches && !pop.classList.contains("ex")) {
        pop.classList.add("ex"); go.setAttribute("aria-expanded", "true");
        clearTimeout(popTimer); popTimer = setTimeout(hidePop, POP_MS);          // give them time to read it
        return;
      }
      const o = pop.querySelector(".dv-pop-orb"); hidePop(); open(o);
    };
    pop.querySelector(".dv-pop-x").onclick = hidePop;
    requestAnimationFrame(() => requestAnimationFrame(() => pop.classList.add("show")));
    popTimer = setTimeout(hidePop, POP_MS);
  };
  const schedulePop = ms => { if (popDone) return; clearTimeout(popWait); popWait = setTimeout(showPop, ms); };

  /* ---------- opens by itself only when the site is first opened (once per browser session — NOT on refresh) ----------
     A new tab / new browser session plays it again. The pop-up and the big logo still replay it any time. */
  let seen = false;
  try { seen = sessionStorage.getItem("rp_intro_seen") === "1"; } catch (e) {}
  if (!reduce && !seen) {
    try { sessionStorage.setItem("rp_intro_seen", "1"); } catch (e) {}
    scrollTo(0, 0);
    requestAnimationFrame(() => {                     // one frame, so the logo has its final position — no artificial delay
      if (isOpen) return;
      open(document.querySelector(".home-splash .header .logo svg") || sun);
    });
  } else {
    schedulePop(2200);                                // already seen (refresh) or reduced motion: just offer the pop-up
  }
})();
