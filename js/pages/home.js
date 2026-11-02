/* js/pages/home.js — page logic for home.html (defines window.pageInit) */
window.pageInit = () => {
  document.querySelectorAll("[data-free-ship]").forEach(el => el.innerHTML = t("On all orders over {n}.", { n: money0(FREE_SHIPPING) }));
  try { document.getElementById("featured").innerHTML = PRODUCTS.slice(0,4).map(card).join(""); } catch (e) { console.error(e); }

  /* ---- category cards: product-card style (photo + name + count) ---- */
  document.querySelectorAll(".cats .ccard").forEach(a => { try {
    const cat = new URL(a.href, location.href).searchParams.get("cat");
    const items = PRODUCTS.filter(p => p.cat === cat);
    const ci = a.querySelector(".ci") ? a.querySelector(".ci").outerHTML : "";
    a.innerHTML = `<div class="cc-img">${items[0] ? productVisual(items[0]) : ""}${ci}</div>
      <div class="cc-info"><h3>${catName(cat)}</h3><div class="cc-count">${num(items.length)} ${t(items.length === 1 ? "product" : "products")}</div></div>`;
  } catch (e) { console.error(e); } });

  /* ---- category slider: auto-advance every 5s on phones/tablets ---- */
  (() => {
    const cats = document.querySelector(".cats");
    if (!cats) return;
    let visible = false, last = 0;
    const isSlider = () => matchMedia("(max-width:1000px)").matches;
    const touch = () => { last = Date.now(); };
    ["pointerdown", "touchstart", "wheel", "keydown"].forEach(ev => cats.addEventListener(ev, touch, { passive: true }));
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0.35 }).observe(cats);
    const left = el => el.getBoundingClientRect().left - cats.getBoundingClientRect().left + cats.scrollLeft - (parseFloat(getComputedStyle(cats).scrollPaddingLeft) || 0);
    setInterval(() => {
      if (!isSlider() || !visible || document.hidden || Date.now() - last < 6000) return;
      const cards = [...cats.querySelectorAll(".ccard")];
      if (cards.length < 2) return;
      const max = cats.scrollWidth - cats.clientWidth;
      let target;
      if (cats.scrollLeft >= max - 4) target = 0;
      else {
        const pos = cards.map(left);
        const cur = pos.reduce((b, p, i) => Math.abs(p - cats.scrollLeft) < Math.abs(pos[b] - cats.scrollLeft) ? i : b, 0);
        target = pos[Math.min(cur + 1, cards.length - 1)];
      }
      cats.scrollTo({ left: target, behavior: "smooth" });
    }, 5000);
  })();

  /* ---- hero slider ---- */
  const SLIDES = [
    { tag:"Best seller", title:"Cards that get kept", text:"Double-sided thank-you cards that bring customers back. Make every order a little more personal.",
      id:"thankyou-card", cta:["Shop now","shop.html"], cta2:["View product","product.html?id=thankyou-card"] },
    { tag:"Sale · up to 30% off", title:"Be seen from across the street", text:"Roll-ups, banners and posters in big, bold colour — now at special prices for a limited time.",
      id:"rollup-85", cta:["Shop sale","shop.html?sale=1"], cta2:["View product","product.html?id=rollup-85"] },
    { tag:"New in", title:"Packaging with presence", text:"Custom mailer boxes and paper bags printed with your brand, inside and out.",
      id:"bag-kraft-set", cta:["Shop packaging","shop.html?cat=Packaging"], cta2:["View product","product.html?id=bag-kraft-set"] }
  ];
  document.getElementById("heroSun").innerHTML = sunLogo;
  document.getElementById("heroCopy").innerHTML = SLIDES.map(s => `
    <div class="copy">
      <span class="hero-tag">${t(s.tag)}</span>
      <h1>${t(s.title)}</h1>
      <p>${t(s.text)}</p>
      <a class="btn solid" href="${s.cta[1]}">${t(s.cta[0])}</a>
      <a class="btn ghost" href="${s.cta2[1]}">${t(s.cta2[0])}</a>
    </div>`).join("");
  document.getElementById("heroActions").innerHTML = SLIDES.map(s => `
    <div class="act">
      <a class="btn solid" href="${s.cta[1]}">${t(s.cta[0])}</a>
      <a class="btn ghost" href="${s.cta2[1]}">${t(s.cta2[0])}</a>
    </div>`).join("");
  document.getElementById("arch").innerHTML = SLIDES.map(s => `<div class="arch-slide">${productVisual(byId(s.id))}</div>`).join("");
  document.getElementById("floatCard").innerHTML = SLIDES.map(s => {
    const p = byId(s.id);
    return `<div class="fc">
      <a href="product.html?id=${p.id}"><h4>${pName(p)}</h4></a>
      <div class="price">${p.compare?`<s>${fmt(p.compare)}</s> `:""}${fmt(p.price)}</div>
      <button class="btn solid add" onclick="addToCart('${p.id}',1)" ${p.available?"":"disabled"}>${p.available?t("Add to cart"):t("Sold out")}</button>
    </div>`; }).join("");
  document.getElementById("dots").innerHTML = SLIDES.map((s,i) => `<button aria-label="${t("Slide")} ${i+1}"></button>`).join("");

  const copies = [...document.querySelectorAll("#heroCopy .copy")], arches = [...document.querySelectorAll(".arch-slide")],
        cards = [...document.querySelectorAll("#floatCard .fc")], acts = [...document.querySelectorAll("#heroActions .act")], dots = [...document.querySelectorAll("#dots button")];
  const N = SLIDES.length, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const archEl = document.getElementById("arch");
  let pos = 0, cur = 0, timer, raf = null;           // pos = fractional, unbounded slide position
  const wrap = x => x - N * Math.round(x / N);        // shortest signed distance on the loop
  const clamp01 = x => Math.max(0, Math.min(1, x));

  // position every layer according to its distance (rel) from the current position
  const layout = p => {
    pos = p;
    const c = ((Math.round(p) % N) + N) % N;
    if (c !== cur) { cur = c; dots.forEach((d, k) => d.classList.toggle("active", k === cur)); }
    for (let k = 0; k < N; k++) {
      const rel = wrap(k - p), a = Math.abs(rel), vis = a < 1, fade = clamp01(1 - a * 1.5);
      const A = arches[k], C = copies[k], F = cards[k], G = acts[k], inner = A.firstElementChild;
      A.style.visibility = C.style.visibility = F.style.visibility = G.style.visibility = vis ? "visible" : "hidden";
      A.style.transform = `translate3d(${rel * 100}%,0,0)`;
      if (inner) inner.style.transform = `translate3d(${-rel * 8}%,0,0) scale(1.1)`;   // parallax photo
      C.style.opacity = fade; C.style.transform = `translate3d(${rel * 70}px,0,0)`;
      F.style.opacity = fade; F.style.transform = `translate3d(${rel * 46}px,0,0) scale(${1 - a * .06})`;
      G.style.opacity = fade; G.style.transform = `translate3d(${rel * 70}px,0,0)`;
      C.style.pointerEvents = F.style.pointerEvents = G.style.pointerEvents = k === cur ? "auto" : "none";
      [A, C, F].forEach(el => el.classList.toggle("active", k === cur));
    }
  };

  // animate pos -> target with easing
  const animateTo = (target, ms = 650) => {
    cancelAnimationFrame(raf);
    const from = pos, dist = target - from;
    if (reduce || Math.abs(dist) < 0.001) { layout(target); return; }
    const t0 = performance.now(), dur = ms * Math.min(1, Math.abs(dist) + .35);
    const ease = t => 1 - Math.pow(1 - t, 4);
    const step = now => {
      const t = clamp01((now - t0) / dur);
      layout(from + dist * ease(t));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };
  const go = d => animateTo(Math.round(pos) + d);
  const goTo = i => { let d = ((i - cur) % N + N) % N; if (d > N / 2) d -= N; go(d); };
  const play = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(1), 5500); };
  dots.forEach((d, i) => d.onclick = () => { goTo(i); play(); });
  const stage = document.querySelector(".hero2");
  // pause on hover (mouse only, so touch taps don't freeze autoplay)
  stage.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") clearInterval(timer); });
  stage.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") play(); });

  // swipe / drag: slides follow the finger, then settle (touch, pen and mouse)
  let sx = null, sy = 0, startPos = 0, dragging = false, dragged = false, lastX = 0, lastT = 0, vel = 0, pid = null;
  stage.addEventListener("pointerdown", e => {
    if (e.target.closest("button, a")) { sx = e.clientX; sy = e.clientY; dragged = false; dragging = false; startPos = pos; lastX = sx; lastT = e.timeStamp; vel = 0; pid = e.pointerId; cancelAnimationFrame(raf); clearInterval(timer); return; }
    sx = e.clientX; sy = e.clientY; dragged = false; dragging = false; startPos = pos; lastX = sx; lastT = e.timeStamp; vel = 0; pid = e.pointerId;
    cancelAnimationFrame(raf); clearInterval(timer);
  });
  stage.addEventListener("pointermove", e => {
    if (sx === null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!dragging) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.2) { dragging = dragged = true; try { stage.setPointerCapture(pid); } catch (_) {} }
      else return;
    }
    const w = archEl.offsetWidth || 340;
    const dt = e.timeStamp - lastT; if (dt > 0) vel = .8 * vel + .2 * ((e.clientX - lastX) / dt); lastX = e.clientX; lastT = e.timeStamp;
    layout(startPos - dx / w);
  });
  const endDrag = e => {
    if (sx === null) return;
    const wasDragging = dragging; sx = null; dragging = false;
    if (!wasDragging) { animateTo(Math.round(pos)); play(); return; }
    const moved = pos - startPos, flick = Math.abs(vel) > .45;
    let dir = 0;
    if (flick) dir = vel < 0 ? 1 : -1; else if (Math.abs(moved) > .2) dir = moved > 0 ? 1 : -1;
    animateTo(Math.round(startPos) + dir, 520); play();
  };
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("click", e => { if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; } }, true); // a drag isn't a click
  stage.addEventListener("keydown", e => { if (e.key === "ArrowRight") { go(1); play(); } if (e.key === "ArrowLeft") { go(-1); play(); } });
  layout(0); dots[0].classList.add("active"); play();
};
