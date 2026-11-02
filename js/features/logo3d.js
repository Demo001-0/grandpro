/* GrandPro 3D logo — Three.js + the real Cormorant Garamond outlines (via opentype.js).
   Replaces the flat header logo with a lit, extruded 3D version that follows the cursor.
   If WebGL or the CDN is unavailable, the original flat logo stays as is. */
(function () {
  const CDN = {
    three: "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
    opentype: "https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js",
    f400: "https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond@5/files/cormorant-garamond-latin-400-normal.woff",
    f300: "https://cdn.jsdelivr.net/npm/@fontsource/cormorant-garamond@5/files/cormorant-garamond-latin-300-normal.woff"
  };
  const BRAND = "#dc92a8";

  /* ---------- text -> extruded geometry ---------- */
  // Converts font outlines into THREE shapes. Width is returned in font units.
  function buildText(THREE, font, text, o) {
    o = o || {};
    const size = 100, spacing = (o.spacing || 0) * size, sc = size / font.unitsPerEm;
    const glyphs = font.stringToGlyphs(text);
    const shapes = [];
    let x = 0;
    glyphs.forEach((g, i) => {
      if (i > 0 && !spacing) x += font.getKerningValue(glyphs[i - 1], g) * sc;
      const sp = new THREE.ShapePath();
      g.getPath(x, 0, size).commands.forEach(c => {
        if (c.type === "M") sp.moveTo(c.x, -c.y);
        else if (c.type === "L") sp.lineTo(c.x, -c.y);
        else if (c.type === "C") sp.bezierCurveTo(c.x1, -c.y1, c.x2, -c.y2, c.x, -c.y);
        else if (c.type === "Q") sp.quadraticCurveTo(c.x1, -c.y1, c.x, -c.y);
        else if (c.type === "Z" && sp.currentPath) sp.currentPath.closePath();
      });
      if (sp.subPaths.length) {
        // pick winding from the largest contour so it works for TrueType and CFF outlines
        let big = 0;
        sp.subPaths.forEach(s => { const a = THREE.ShapeUtils.area(s.getPoints(8)); if (Math.abs(a) > Math.abs(big)) big = a; });
        shapes.push.apply(shapes, sp.toShapes(big > 0));
      }
      x += g.advanceWidth * sc + (i < glyphs.length - 1 ? spacing : 0);
    });
    return { shapes, width: x };
  }

  // Scales text to `targetWidth` world units and extrudes it to `depth` world units.
  function extrude(THREE, built, targetWidth, depth, bevel) {
    const s = targetWidth / built.width;
    const geo = new THREE.ExtrudeGeometry(built.shapes, {
      depth: depth / s, bevelEnabled: true, bevelThickness: bevel / s, bevelSize: bevel / s,
      bevelSegments: 2, curveSegments: 8
    });
    geo.computeBoundingBox();
    const b = geo.boundingBox;
    geo.translate(-(b.min.x + b.max.x) / 2, 0, -(depth / s) / 2);
    geo.computeVertexNormals();
    return { geo, scale: s };
  }

  window.__grandproLogo = { buildText, extrude };
  if (typeof document === "undefined" || !document.querySelector || !document.querySelector(".logo")) return;

  /* ---------- helpers ---------- */
  const load = src => new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = src; s.onload = res; s.onerror = () => rej(new Error("failed " + src));
    document.head.appendChild(s);
  });
  const loadFont = url => new Promise((res, rej) => opentype.load(url, (e, f) => (e ? rej(e) : res(f))));

  function makeEnv(THREE, renderer, col) {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ color: col("#cfc8b8"), side: THREE.BackSide })));
    const panel = (x, y, z, w, h, k) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m);
    };
    panel(22, 18, 22, 26, 20, 5); panel(-28, 8, 14, 12, 28, 3); panel(0, 35, -5, 30, 14, 3); panel(-10, -5, -30, 40, 10, 1.5);
    const pm = new THREE.PMREMGenerator(renderer);
    const tex = pm.fromScene(s).texture; pm.dispose();
    return tex;
  }

  /* ---------- main ---------- */
  async function init() {
    const logo = document.querySelector(".logo");
    try {
      if (!window.WebGLRenderingContext) throw new Error("no WebGL");
      await load(CDN.three); await load(CDN.opentype);
      const fonts = await Promise.all([loadFont(CDN.f400), loadFont(CDN.f300)]);
      const T = window.THREE;
      const col = h => new T.Color(h).convertSRGBToLinear();

      const canvas = document.createElement("canvas"); canvas.className = "logo3d";
      const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputEncoding = T.sRGBEncoding;
      renderer.toneMapping = T.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      const scene = new T.Scene();
      scene.environment = makeEnv(T, renderer, col);
      const key = new T.DirectionalLight(0xffffff, 0.5); key.position.set(3, 5, 8); scene.add(key);
      const camera = new T.PerspectiveCamera(22, 1.7, 0.1, 100); camera.position.set(0, 0, 10.8);

      const mat = new T.MeshBasicMaterial({ color: col(BRAND), toneMapped: false }); // flat brand colour, no metallic shading
      const pivot = new T.Group(); scene.add(pivot);
      const content = new T.Group(); content.position.y = 3.15; pivot.add(content);

      // the sun stays the original flat SVG; only the wordmark + subtitle are 3D (real font outlines)
      const w = extrude(T, buildText(T, fonts[0], "GrandPro"), 5.7, 0.32, 0.012);
      const word = new T.Mesh(w.geo, mat); word.scale.setScalar(w.scale); word.position.y = -3.32; content.add(word);
      const s = extrude(T, buildText(T, fonts[1], "PRINT SHOP", { spacing: 0.35 }), 5.8, 0.12, 0.006);
      const sub = new T.Mesh(s.geo, mat); sub.scale.setScalar(s.scale); sub.position.y = -4.62; content.add(sub);

      // show the 3D logo, hide the flat one
      logo.classList.add("is3d"); logo.setAttribute("aria-label", "GrandPro"); logo.appendChild(canvas);

      const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tgt = { x: 0, y: 0 }, cur = { x: 0, y: 0 }; let lastMove = -1e9, visible = true;
      window.addEventListener("pointermove", e => {
        tgt.y = (e.clientX / innerWidth * 2 - 1) * 0.3; tgt.x = (e.clientY / innerHeight * 2 - 1) * 0.12; lastMove = performance.now();
      }, { passive: true });

      const resize = () => {
        const cw = canvas.clientWidth, ch = canvas.clientHeight;
        if (!cw || !ch) return;
        renderer.setSize(cw, ch, false); camera.aspect = cw / ch; camera.updateProjectionMatrix();
      };
      new ResizeObserver(resize).observe(canvas); resize();
      new IntersectionObserver(es => (visible = es[0].isIntersecting)).observe(canvas);

      const t0 = performance.now();
      (function tick(now) {
        requestAnimationFrame(tick);
        if (!visible) return;
        const t = (now - t0) / 1000, k = Math.min(1, t / 1.4), e = 1 - Math.pow(1 - k, 3);
        let ty = tgt.y, tx = tgt.x;
        if (reduce) { ty = tx = 0; } else if (now - lastMove > 3000) { ty = Math.sin(t * 0.6) * 0.16; tx = Math.sin(t * 0.45) * 0.05; }
        cur.x += (tx - cur.x) * 0.06; cur.y += (ty - cur.y) * 0.06;
        pivot.rotation.y = cur.y + (reduce ? 0 : (1 - e) * Math.PI * 0.9);
        pivot.rotation.x = cur.x;
        renderer.render(scene, camera);
      })(performance.now());
    } catch (err) {
      console.warn("3D logo unavailable, keeping flat logo:", err);
    }
  }

  const st = document.createElement("style");
  st.textContent = ".logo.is3d .word,.logo.is3d .sub{display:none}.logo.is3d{margin:0 0 6px}.logo3d{display:block;width:min(430px,88vw);aspect-ratio:1.7;margin-top:-14px;cursor:pointer}@media(max-width:560px){.logo3d{width:min(290px,76vw)}}";
  document.head.appendChild(st);
  init();
})();
