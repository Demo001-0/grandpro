/* js/features/hero3d.js — 3D hero for the home splash (Three.js, self-hosted in js/vendor/)
   - The GrandPro emblem is rebuilt as a real extruded 3D object (black disc + raised lime mark) exactly where the flat logo sits.
   - Real product photos (js/features/hero-photos.js — transparent cut-outs inlined as data URIs, ~150 KB) float around it as flat textured
     planes with unlit materials (cheap to render). Each one is loaded in parallel with Three.js; a photo that fails to load is skipped.
   - Motion: slow idle float, pointer parallax (touch-drag on phones), and a light scroll effect (objects drift apart + spin).
   - Safe fallback: no WebGL / "reduce motion" / any error  →  the existing flat hero is left exactly as it was.
   - The page text (name, tagline, buttons) stays normal HTML on top of the canvas, so Arabic, RTL and SEO are untouched. */
(() => {
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* product photos: k = key used in the layouts below, a = width / height of the cut-out */
  const PRODUCTS = [
    { k: "bags",      src: "assets/images/hero/bags.webp",      a: 640 / 412 },
    { k: "gable",     src: "assets/images/hero/gable.webp",     a: 640 / 303 },
    { k: "karamella", src: "assets/images/hero/karamella.webp", a: 640 / 386 },
    { k: "cups",      src: "assets/images/hero/cups.webp",      a: 432 / 445 }
  ];
  const loadImg = p => new Promise(ok => {
    const im = new Image(); im.decoding = "async";
    im.onload = () => ok(Object.assign({ img: im }, p)); im.onerror = () => ok(null); im.src = p.src;
  });

  const loadScript = src => new Promise((ok, no) => {
    const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => no(new Error("load " + src));
    document.head.appendChild(s);
  });

  const start = async () => {
    const header = document.querySelector(".home-splash .header");
    const emblemEl = header && header.querySelector(".logo svg");
    if (!header || !emblemEl || typeof sunLogo !== "string") return;

    /* products — two separate pieces, CSS decides which one shows:
       phone  (<700px): the slow marquee under the logo, exactly as before (.hero-marquee); the announcement ticker stays.
       desktop (>=700px): a strip right under the splash that REPLACES the ticker (.hero-strip), products fly in on first scroll. */
    const buildMarquee = () => {
      const host = header.querySelector(".splash-copy"), bar = document.getElementById("annBar");
      if (header.querySelector(".hero-marquee") || document.querySelector(".hero-strip")) return;
      loadScript("js/features/hero-photos.js").then(() => {
        const keys = PRODUCTS.map(p => p.k).filter(k => window.HERO_PHOTOS && window.HERO_PHOTOS[k]);
        if (!keys.length) return;
        const img = k => `<img src="${window.HERO_PHOTOS[k]}" alt="" draggable="false">`;
        if (host) {                                   // phone marquee (unchanged)
          const group = () => keys.concat(keys).map(img).join("");
          const m = document.createElement("div"); m.className = "hero-marquee"; m.setAttribute("aria-hidden", "true");
          m.innerHTML = `<div class="hm-track"><div class="hm-group">${group()}</div><div class="hm-group">${group()}</div></div>`;
          host.before(m);
        }
        if (bar) {                                    // desktop strip
          const group = () => keys.concat(keys, keys).map((k, i) => `<span class="hm-item" style="--d:${(Math.min(i, 9) * 0.13).toFixed(2)}s">${img(k)}</span>`).join("");
          const st = document.createElement("div"); st.className = "hero-strip"; st.setAttribute("aria-hidden", "true");
          st.innerHTML = `<div class="hm-track"><div class="hm-group">${group()}</div><div class="hm-group">${group()}</div></div>`;
          bar.after(st); document.body.classList.add("has-strip");
          if ("IntersectionObserver" in window) {     // entrance: staggered spin-in the first time the strip scrolls into view
            const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { st.classList.add("in"); io.disconnect(); } }, { threshold: 0.2, rootMargin: "0px 0px -18% 0px" });
            io.observe(st);
          } else st.classList.add("in");
        }
      }).catch(() => {});
    };
    buildMarquee();
    if (reduce) return;   // reduced motion: marquee is shown static, no 3D emblem

    /* WebGL available? (checked before anything is downloaded) */
    try { const c = document.createElement("canvas"); if (!(c.getContext("webgl") || c.getContext("experimental-webgl"))) return; } catch (e) { return; }

    document.documentElement.classList.add("h3d-prep");          // freezes the flat emblem so it can be measured
    try {
      const photos = Promise.resolve([]);   // products now live in the marquee strip, not in the 3D scene
      await loadScript("js/vendor/three.min.js");
      await loadScript("js/vendor/SVGLoader.js");
      build(header, emblemEl, (await photos).filter(Boolean));
    } catch (err) {
      console.warn("[hero3d] disabled:", err);
      document.documentElement.classList.remove("h3d-prep", "has-3d");
    }
  };

  function build(header, emblemEl, photos) {
    const T = window.THREE;
    const isPhone = () => innerWidth < 700;

    /* ---------- emblem geometry (from the same SVG the flat logo uses) ---------- */
    const svgText = sunLogo.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
    const data = new T.SVGLoader().parse(svgText);
    const VB = 1098, HALF = VB / 2;
    const shapesOf = p => data.paths[p].subPaths ? T.SVGLoader.createShapes(data.paths[p]) : [];
    const DISC_DEPTH = 120, MARK_DEPTH = 46;

    const discGeo = new T.ExtrudeGeometry(shapesOf(0), { depth: DISC_DEPTH, curveSegments: 40, bevelEnabled: true, bevelThickness: 10, bevelSize: 8, bevelSegments: 3 });
    discGeo.translate(-HALF, -HALF, -DISC_DEPTH / 2);
    const markGeo = new T.ExtrudeGeometry(shapesOf(1), { depth: MARK_DEPTH, curveSegments: 28, bevelEnabled: true, bevelThickness: 4, bevelSize: 2.5, bevelSegments: 2 });
    markGeo.translate(-HALF, -HALF, 0);

    const discMat = new T.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.32, metalness: 0.35 });
    const markMat = new T.MeshStandardMaterial({ color: 0xb9f832, roughness: 0.38, metalness: 0.05, emissive: 0x1d2b00, emissiveIntensity: 0.25 });

    const emblem = new T.Group();                       // outer: position / tilt
    const emblemInner = new T.Group();                  // inner: flips SVG's y-down into y-up
    emblemInner.scale.set(1, -1, 1);
    const disc = new T.Mesh(discGeo, discMat);
    const mark = new T.Mesh(markGeo, markMat); mark.position.z = DISC_DEPTH / 2 - 4;
    emblemInner.add(disc, mark); emblem.add(emblemInner);

    /* soft lime glow behind the emblem */
    const glowTex = (() => {
      const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
      const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
      g.addColorStop(0, "rgba(185,248,50,.55)"); g.addColorStop(.45, "rgba(185,248,50,.16)"); g.addColorStop(1, "rgba(185,248,50,0)");
      x.fillStyle = g; x.fillRect(0, 0, 256, 256); return new T.CanvasTexture(c);
    })();
    const glow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, opacity: 0.0 }));

    /* ---------- product photos → unlit textured planes (one texture + geometry + material per product, shared) ---------- */
    const makers = {};
    photos.forEach(p => {
      const tex = new T.Texture(p.img); tex.anisotropy = 4; tex.needsUpdate = true;
      const geo = new T.PlaneGeometry(p.a >= 1 ? 1 : p.a, p.a >= 1 ? 1 / p.a : 1);        // longest side = 1
      const mat = new T.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.03, side: T.DoubleSide });
      makers[p.k] = () => new T.Mesh(geo, mat);
      p.half = (p.a >= 1 ? 1 / p.a : 1) / 2;
    });

    /* where each product floats: fx = fraction of canvas width from the emblem centre, fy = emblem-diameters below it */
    const LAYOUT_DESKTOP = [
      { k: "bags",      fx: -.27, fy: -.10, z: 110, size: 1.35, rot: [.06, .32, -.05], spin: .22 },
      { k: "gable",     fx:  .27, fy: -.08, z: -30, size: 1.50, rot: [.05, -.30, .04], spin: .20 },
      { k: "karamella", fx: -.30, fy: 1.20, z: 40,  size: 1.30, rot: [.08, .28, .05],  spin: .18 },
      { k: "cups",      fx:  .31, fy: 1.15, z: 90,  size: 1.00, rot: [.05, -.32, -.04], spin: .22 }
    ];
    const LAYOUT_PHONE = [
      { k: "bags",  fx: -.30, fy:  .06, z: 60,  size: .62, rot: [.06, .32, -.05], spin: .22 },
      { k: "cups",  fx:  .00, fy: -.10, z: 20,  size: .62, rot: [.05, -.20, -.04], spin: .22 },
      { k: "gable", fx:  .30, fy:  .08, z: -20, size: .66, rot: [.05, -.30, .04], spin: .20 }
    ];

    /* ---------- renderer / scene ---------- */
    const canvas = document.createElement("canvas"); canvas.id = "hero3d"; canvas.setAttribute("aria-hidden", "true");
    header.insertBefore(canvas, header.firstChild);
    let renderer;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" }); }
    catch (e) { canvas.remove(); throw e; }
    renderer.setClearColor(0x000000, 0);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(30, 1, 50, 6000);
    scene.add(new T.AmbientLight(0xffffff, 0.62));
    const key = new T.DirectionalLight(0xffffff, 0.62); key.position.set(-300, 500, 900); scene.add(key);
    const fill = new T.DirectionalLight(0xdfffa0, 0.22); fill.position.set(700, -250, 500); scene.add(fill);
    const rim = new T.DirectionalLight(0xffffff, 0.3); rim.position.set(0, 200, -700); scene.add(rim);
    scene.add(glow, emblem);

    let items = [];
    const buildItems = () => {
      items.forEach(it => { scene.remove(it.mesh); });
      items = (isPhone() ? [] : LAYOUT_DESKTOP).filter(d => makers[d.k]).map((d, i) => {
        const mesh = makers[d.k](); scene.add(mesh); return Object.assign({ mesh, i, ph: i * 1.7 }, d);
      });
    };
    buildItems();
    let phoneMode = isPhone();

    /* ---------- layout: map the flat emblem's pixels to the 3D world (1 world unit = 1 css px at z = 0) ---------- */
    let W = 1, H = 1, D = 100, ex = 0, ey = 0, camZ = 1000, topY = 1e4, gapY = 0, phoneK = 1;
    const measure = () => {
      const hr = header.getBoundingClientRect(), er = emblemEl.getBoundingClientRect();
      W = Math.max(1, Math.round(hr.width)); H = Math.max(1, Math.round(hr.height));
      D = er.width || 150;
      const ht = header.querySelector(".header-top");
      topY = ht ? (hr.top + H / 2) - ht.getBoundingClientRect().bottom : 1e4;   // world-y of the nav divider: products stay below it
      ex = er.left + er.width / 2 - (hr.left + W / 2);
      ey = -((er.top + er.height / 2) - (hr.top + H / 2));
      /* phone: world-y of the empty band between the logo block (wordmark + tagline) and the headline below it */
      const subEl = header.querySelector(".logo .sub") || header.querySelector(".logo .word"), copyEl = header.querySelector(".splash-copy, .hero-copy");
      const gTop = subEl ? subEl.getBoundingClientRect().bottom : er.bottom, gBot = copyEl ? copyEl.getBoundingClientRect().top : gTop + 4 * D;
      gapY = (hr.top + H / 2) - (gTop + gBot) / 2;
      phoneK = Math.max(.55, Math.min(1, (gBot - gTop) / (1.9 * D)));   // short screens: shrink the products to fit the band
      const dpr = Math.min(window.devicePixelRatio || 1, isPhone() ? 1.5 : 2);
      renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
      camera.aspect = W / H; camZ = (H / 2) / Math.tan(T.MathUtils.degToRad(camera.fov / 2));
      camera.position.set(0, 0, camZ); camera.updateProjectionMatrix();
      const s = D / VB; emblem.scale.setScalar(s);
      glow.scale.setScalar(D * 2.4);
      if (isPhone() !== phoneMode) { phoneMode = isPhone(); buildItems(); }
    };
    measure();
    new ResizeObserver(measure).observe(header);
    addEventListener("resize", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    setTimeout(measure, 700); setTimeout(measure, 2200);

    /* ---------- input ---------- */
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    addEventListener("pointermove", e => { if (isPhone()) { ptr.tx = 0; ptr.ty = 0; return; } ptr.tx = (e.clientX / innerWidth) * 2 - 1; ptr.ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
    addEventListener("pointerleave", () => { ptr.tx = 0; ptr.ty = 0; }, { passive: true });

    /* ---------- loop ---------- */
    const HALF_H = photos.reduce((o, p) => (o[p.k] = p.half, o), {});   // half-height of each product (× size × D)
    const clamp01 = v => Math.max(0, Math.min(1, v));
    const easeOut = v => 1 - Math.pow(1 - clamp01(v), 3);
    let visible = true, raf = 0, t0 = performance.now(), shown = false;
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(header);

    const frame = now => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const t = (now - t0) / 1000;
      const dark = document.documentElement.dataset.theme === "dark";
      const calm = (dark || isPhone()) ? 0.35 : 1;   /* dark: quieter hero (less tilt / wobble, almost no glow) */
      ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
      const hh = header.offsetHeight || 1;
      const sp = clamp01(scrollY / (hh * 0.9));                 // scroll progress through the splash

      /* emblem */
      const ie = easeOut(t / 1.5);
      emblem.position.set(ex, ey + Math.sin(t * 0.9) * D * 0.012 + sp * D * 0.25, 0);
      emblem.rotation.set((0.10 - ptr.y * 0.28 + Math.sin(t * 0.5) * 0.05) * calm + sp * 0.25, (1 - ie) * -2.6 + (-0.24 + ptr.x * 0.5 + Math.sin(t * 0.6) * 0.16) * calm + sp * 1.4 * (0.4 + 0.6 * calm), ptr.x * -0.05 * calm);
      emblem.scale.setScalar((D / VB) * (0.55 + 0.45 * ie) * (1 - sp * 0.12));
      glow.position.set(ex, ey, -DISC_DEPTH * (D / VB));
      glow.material.opacity = ie * (0.9 - sp * 0.6) * (dark ? 0.15 : 1);

      /* products */
      for (const it of items) {
        const e = easeOut((t - 0.25 - it.i * 0.13) / 1.3);        // staggered fly-in from behind the emblem
        const tx = ex + it.fx * W * (1 + sp * 0.35), ty = (phoneMode ? gapY : ey) - it.fy * D * (1 + sp * 0.1);
        const par = (it.z + 200) / 350;                            // nearer objects move more with the pointer
        const k = phoneMode ? phoneK : 1;
        const half = (HALF_H[it.k] || .55) * it.size * D * k;
        const px = tx + ptr.x * 38 * par * calm, py = Math.min(ty - ptr.y * 24 * par * calm + Math.sin(t * 0.8 + it.ph) * D * 0.035 * calm - sp * (it.z > 0 ? 70 : 20), topY - half - 10);
        it.mesh.position.set(ex + (px - ex) * e, ey + (py - ey) * e, it.z * e);
        it.mesh.scale.setScalar(it.size * D * k * (0.2 + 0.8 * e));
        it.mesh.rotation.set(
          it.rot[0] + (Math.sin(t * 0.55 + it.ph) * 0.12 - ptr.y * 0.2) * calm + sp * 0.5,
          it.rot[1] + (Math.sin(t * 0.4 + it.ph) * 0.2 + ptr.x * 0.35) * calm + sp * it.spin * 1.6 * (0.4 + 0.6 * calm) + (1 - e) * 2.5,
          it.rot[2] + Math.sin(t * 0.7 + it.ph) * 0.06 * calm - sp * it.rot[2] * 1.5
        );
      }

      key.position.set(-300 + ptr.x * 700, 500 - ptr.y * 300, 900);   // the highlight follows the pointer
      renderer.render(scene, camera);

      if (!shown) { shown = true; document.documentElement.classList.add("has-3d"); }   // reveal canvas, hide the flat emblem
    };
    raf = requestAnimationFrame(frame);

    /* context loss → fall back to the flat hero */
    canvas.addEventListener("webglcontextlost", e => { e.preventDefault(); cancelAnimationFrame(raf); document.documentElement.classList.remove("has-3d", "h3d-prep"); canvas.remove(); });
    window.__hero3d = { scene, camera, renderer, items, emblem };
  }

  if (document.readyState === "complete") start(); else addEventListener("load", start);
})();
