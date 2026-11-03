/* js/components/product-visual.js — Product image: real photo if p.img is set, otherwise a drawn print-product illustration (SVG).
   Types: card · flyer · brochure · poster · banner · sticker · label · box · bag
   Brand colours: charcoal #26272a + green #375d2e (from the Riyadh Print logo). */
const K = "#26272a", L = "#4c7245", W = "#ffffff", G = "#cfd4c4", INK2 = "#1d3318";

function productSvg(p) {
  const id = String(p.id).replace(/[^a-z0-9]/gi, "");
  const lines = (x, y, w, n, col = G, gap = 10, h = 3.2) => Array.from({ length: n }, (_, i) =>
    `<rect x="${x}" y="${y + i * gap}" width="${i === n - 1 ? w * .6 : w}" height="${h}" rx="${h / 2}" fill="${col}"/>`).join("");
  const diamond = (cx, cy, r, col) => `<path d="M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z" fill="${col}"/>`;
  const sh = `filter="url(#sh${id})"`;
  const spot = p.id.includes("spot")
    ? `<path d="M84 205l22-22" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/><path d="M92 213l16-16" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>` : "";

  const shapes = {
    card: `
      <g transform="rotate(-9 150 165)"><rect x="55" y="105" width="190" height="112" rx="7" fill="${W}" stroke="#e3e6da" ${sh}/>
        ${diamond(88, 140, 14, L)}<path d="M88 126L102 140L88 154L74 140Z" fill="none" stroke="${K}" stroke-width="2"/>
        ${lines(118, 128, 100, 1, K, 0, 5)}${lines(118, 142, 78, 1, G, 0, 3.5)}${lines(76, 176, 120, 3, G, 11)}</g>
      <g transform="rotate(7 150 245)"><rect x="52" y="190" width="196" height="116" rx="7" fill="${p.color}" ${sh}/>
        ${diamond(150, 248, 24, L)}<path d="M150 232L166 248L150 264L134 248Z" fill="${p.color}"/>
        ${lines(70, 205, 40, 1, L, 0, 3)}${lines(70, 288, 70, 1, "#5b6159", 0, 3)}${lines(178, 288, 52, 1, "#5b6159", 0, 3)}${spot}</g>`,
    flyer: `
      <g transform="rotate(7 150 200)"><rect x="82" y="62" width="150" height="212" rx="4" fill="#e9ecdf" ${sh}/></g>
      <g transform="rotate(-4 150 190)"><rect x="72" y="58" width="150" height="214" rx="4" fill="${W}" ${sh}/>
        <rect x="72" y="58" width="150" height="74" rx="4" fill="${L}"/><rect x="72" y="120" width="150" height="12" fill="${L}"/>
        ${lines(88, 76, 92, 1, K, 0, 9)}${lines(88, 94, 70, 1, K, 0, 9)}${lines(88, 112, 36, 1, K, 0, 4)}
        <rect x="88" y="146" width="118" height="58" rx="3" fill="${K}"/>${diamond(147, 175, 20, L)}${diamond(147, 175, 8, K)}
        ${lines(88, 218, 118, 4, G, 10)}</g>`,
    brochure: `
      <rect x="38" y="70" width="74" height="236" fill="${W}" ${sh}/><rect x="112" y="70" width="76" height="236" fill="${p.color}"/><rect x="188" y="70" width="74" height="236" fill="${L}" ${sh}/>
      <rect x="112" y="70" width="6" height="236" fill="#000" opacity=".25"/><rect x="182" y="70" width="6" height="236" fill="#000" opacity=".18"/>
      ${lines(50, 90, 50, 2, K, 14, 6)}${lines(50, 130, 50, 9, G, 11)}
      ${diamond(150, 150, 28, L)}${diamond(150, 150, 12, p.color)}${lines(126, 205, 48, 1, L, 0, 4)}${lines(126, 220, 36, 1, "#5b6159", 0, 3.5)}${lines(126, 232, 44, 1, "#5b6159", 0, 3.5)}
      ${lines(200, 90, 50, 1, K, 0, 6)}${lines(200, 108, 50, 9, "#375d2e", 11, 3.2)}`,
    poster: `
      <g transform="rotate(-3 150 175)"><rect x="66" y="44" width="168" height="260" rx="2" fill="${p.color}" ${sh}/>
        <circle cx="150" cy="128" r="56" fill="${L}"/>${diamond(150, 128, 30, p.color)}${diamond(150, 128, 12, L)}
        ${lines(86, 208, 128, 1, W, 0, 11)}${lines(86, 228, 92, 1, W, 0, 11)}${lines(86, 252, 128, 3, "#5b6159", 10)}
        <rect x="52" y="38" width="42" height="14" rx="2" fill="${L}" opacity=".85" transform="rotate(-24 70 45)"/><rect x="206" y="38" width="42" height="14" rx="2" fill="${L}" opacity=".85" transform="rotate(24 228 45)"/></g>`,
    banner: `
      <rect x="86" y="34" width="128" height="9" rx="4.5" fill="#8d9284"/>
      <rect x="92" y="43" width="116" height="262" fill="${p.color}" ${sh}/>
      <rect x="92" y="150" width="116" height="62" fill="${L}"/>${diamond(150, 181, 22, p.color)}${diamond(150, 181, 9, L)}
      ${lines(106, 66, 88, 1, W, 0, 10)}${lines(106, 84, 64, 1, W, 0, 10)}${lines(106, 108, 88, 3, "#5b6159", 10)}
      ${lines(106, 232, 88, 3, "#5b6159", 10)}${lines(106, 270, 40, 1, L, 0, 6)}
      <rect x="68" y="305" width="164" height="20" rx="10" fill="${INK2}"/><rect x="68" y="305" width="164" height="7" rx="3.5" fill="#fff" opacity=".18"/>`,
    sticker: `
      <rect x="48" y="52" width="204" height="262" rx="12" fill="${W}" ${sh}/>
      <circle cx="108" cy="116" r="42" fill="${L}" stroke="${W}" stroke-width="5"/><circle cx="108" cy="116" r="42" fill="none" stroke="#dfe3d4" stroke-width="1"/>${diamond(108, 116, 22, K)}${diamond(108, 116, 8, L)}
      <rect x="160" y="78" width="74" height="74" rx="18" fill="${K}" stroke="${W}" stroke-width="5"/>${lines(172, 100, 50, 1, L, 0, 7)}${lines(172, 116, 38, 1, W, 0, 5)}${lines(172, 128, 44, 1, "#5b6159", 0, 4)}
      <path d="M92 190l20-26 20 26-20 26z" fill="${K}" stroke="${W}" stroke-width="5" stroke-linejoin="round"/>${diamond(112, 190, 7, L)}
      <rect x="150" y="168" width="84" height="44" rx="22" fill="${L}" stroke="${W}" stroke-width="5"/>${lines(166, 186, 52, 1, K, 0, 8)}
      <circle cx="110" cy="262" r="30" fill="${W}" stroke="${K}" stroke-width="5"/>${diamond(110, 262, 12, K)}
      <rect x="156" y="238" width="78" height="48" rx="10" fill="${K}"/>${lines(168, 252, 54, 1, L, 0, 6)}${lines(168, 266, 38, 1, "#5b6159", 0, 4)}
      <path d="M252 262v38a14 14 0 01-14 14h-38z" fill="#e3e6da"/><path d="M252 262l-52 52 0-30a22 22 0 0122-22z" fill="${W}" stroke="#d6dacb"/>`,
    label: `
      <circle cx="150" cy="170" r="104" fill="#f4f6ee" stroke="#d6dacb" stroke-width="2" ${sh}/>
      ${[92, 80, 68, 56].map(r => `<circle cx="150" cy="170" r="${r}" fill="none" stroke="#dfe3d4" stroke-width="2"/>`).join("")}
      <circle cx="150" cy="170" r="40" fill="${p.bg}" stroke="#cfd4c4" stroke-width="3"/><circle cx="150" cy="170" r="22" fill="${W}" stroke="#d6dacb"/>
      <g transform="rotate(14 190 290)"><rect x="150" y="262" width="150" height="56" rx="6" fill="${W}" ${sh}/>
        <rect x="158" y="270" width="40" height="40" rx="20" fill="${K}"/>${diamond(178, 290, 12, L)}
        <rect x="206" y="270" width="40" height="40" rx="20" fill="${L}"/>${diamond(226, 290, 12, K)}
        <rect x="254" y="270" width="40" height="40" rx="20" fill="${K}"/>${diamond(274, 290, 12, L)}</g>`,
    box: `
      <ellipse cx="150" cy="316" rx="100" ry="12" fill="#000" opacity=".12"/>
      <path d="M150 88L246 136L150 184L54 136Z" fill="${L}"/><path d="M150 88L246 136L150 184L54 136Z" fill="none" stroke="#000" stroke-opacity=".18"/>
      <path d="M96 112l96 48M150 88l-0 0" stroke="#000" stroke-opacity=".12"/><path d="M108 142l46-23 46 23" fill="none" stroke="#000" stroke-opacity=".14"/>
      <g transform="translate(54 136) skewY(26.565)"><rect width="96" height="140" fill="${p.color}"/>
        <path d="M48 36L68 58L48 80L28 58Z" fill="${L}"/><path d="M48 50L58 58L48 66L38 58Z" fill="${p.color}"/>${lines(20, 98, 56, 1, L, 0, 4)}${lines(20, 110, 40, 1, "#5b6159", 0, 3.5)}</g>
      <g transform="translate(150 184) skewY(-26.565)"><rect width="96" height="140" fill="${INK2}"/>${lines(16, 24, 64, 1, L, 0, 5)}${lines(16, 38, 52, 4, "#4b5040", 10, 3.2)}</g>
      <path d="M150 184v140" stroke="#000" stroke-opacity=".35"/>`,
    bag: `
      <ellipse cx="150" cy="322" rx="92" ry="11" fill="#000" opacity=".12"/>
      <path d="M112 112C112 62 122 50 150 50S188 62 188 112" fill="none" stroke="#8d9284" stroke-width="6" stroke-linecap="round"/>
      <path d="M126 112C126 78 134 66 150 66" fill="none" stroke="#8d9284" stroke-width="4" stroke-linecap="round" opacity=".6"/>
      <rect x="70" y="106" width="148" height="206" rx="3" fill="${p.color}" ${sh}/><path d="M218 106l22 14v206l-22-14z" fill="${INK2}"/>
      <path d="M70 106h148l22 14H92z" fill="#2a2d22"/><rect x="70" y="126" width="148" height="3" fill="#fff" opacity=".08"/>
      <path d="M144 176L168 204L144 232L120 204Z" fill="${L}"/><path d="M144 192L156 204L144 216L132 204Z" fill="${p.color}"/>
      ${lines(100, 256, 88, 1, W, 0, 7)}${lines(112, 272, 64, 1, "#5b6159", 0, 4)}`
  };
  const body = shapes[p.type] || shapes.card;
  return `<svg viewBox="0 0 300 375" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${p.name}">
    <defs><radialGradient id="g${id}" cx="50%" cy="30%" r="85%"><stop offset="0" stop-color="#fff" stop-opacity="${p.glow ?? .75}"/><stop offset="1" stop-color="${p.bg}"/></radialGradient>
    <filter id="sh${id}" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="7" stdDeviation="6" flood-color="#0f1a0c" flood-opacity=".22"/></filter></defs>
    <rect width="300" height="375" fill="url(#g${id})"/>
    <g fill="${p.color}" opacity=".05">${Array.from({ length: 6 }, (_, r) => Array.from({ length: 8 }, (_, c) => `<circle cx="${22 + c * 38}" cy="${26 + r * 8}" r="${1 + r * .35}"/>`).join("")).join("")}</g>
    ${body}</svg>`;
}

/* real photo (if p.img is set); falls back to the drawing if the image fails to load */
function productVisual(p) {
  if (!p.img) return productSvg(p);
  return `<img src="${p.img}" alt="${pName(p)}" loading="lazy" decoding="async" onerror="this.onerror=null;this.outerHTML=productSvg(PRODUCTS.find(x=>x.id==='${p.id}'))">`;
}
