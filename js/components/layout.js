/* js/components/layout.js — Shared header, ticker, drawer, footer */
const BRAND = "Riyadh Print";
function layout() {
  const langBtn = (id, cls = "") => `<button class="icon-btn lang-btn ${cls}" id="${id}" data-lang-toggle type="button" aria-label="${t("Switch language")}" title="${isAR() ? "English" : "العربية"}">${icons.globe}<span class="lang-code">${isAR() ? "EN" : "ع"}</span></button>`;
  const header = `
  <div class="bar one ann" id="annBar" aria-label="${t("Announcements")}"><div class="ann-track" id="annTrack"></div></div>
  <header class="header"><div class="container">
    <div class="header-top">
      <div class="header-actions">
        <button class="icon-btn menu-btn" id="openMenu" aria-label="${t("Menu")}">${icons.menu}</button>
        <button class="icon-btn" id="openSearch" aria-label="${t("Search")}">${icons.search}</button>
      </div>
      <div class="header-actions">
        ${langBtn("langBtn")}
        <a class="icon-btn" href="info.html?p=contact" aria-label="${t("Account")}">${icons.user}</a>
        <button class="icon-btn" id="openCart" aria-label="${t("Cart")}">${icons.bag}<span class="cart-count" id="cartCount">0</span></button>
      </div>
    </div>
    <a class="logo" href="home.html" aria-label="${BRAND}">${sunLogo}${wordAr}${wordEn}</a>
    <nav class="nav" id="nav"><button class="icon-btn nav-close" id="closeNav" aria-label="${t("Close menu")}">×</button>${navLinks.map(([h,l])=>`<a href="${h}" class="${h===page?'active':''}">${t(l)}</a>`).join("")}</nav>
  </div></header>
  <div class="search-panel" id="searchPanel"><div class="container">
    <input id="searchInput" placeholder="${t("Search products...")}" autocomplete="off"><div class="search-results" id="searchResults"></div>
  </div></div>
  <div class="overlay" id="overlay"></div>
  <aside class="drawer" id="drawer" aria-label="${t("Cart")}">
    <div class="drawer-head"><span>${t("Your cart")}</span><button class="icon-btn" id="closeCart" aria-label="${t("Close")}" style="font-size:26px">×</button></div>
    <div class="drawer-body" id="cartBody"></div>
    <div class="drawer-foot" id="cartFoot"></div>
  </aside><div class="toast" id="toast"></div>`;
  document.body.insertAdjacentHTML("afterbegin", header);

  // nav lives in the top row, between the left and right icon groups
  const topRow = document.querySelector(".header-top"), navEl = document.getElementById("nav");
  if (topRow && navEl) topRow.insertBefore(navEl, topRow.children[1]);

  /* ---- announcement ticker (continuous scrolling strip) ---- */
  (() => {
    const svg = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
    const truck = svg('<rect x="2" y="7" width="12" height="9" rx="1.5"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>');
    const tag = svg('<path d="M3 12.5V4h8.5l9 9a1.5 1.5 0 010 2.1l-6.4 6.4a1.5 1.5 0 01-2.1 0z"/><circle cx="7.5" cy="8.5" r="1.3"/>');
    const clock = svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>');
    const msgs = [[truck, t("Free shipping on orders over {n}", { n: money0(FREE_SHIPPING) })], [clock, t("Most orders are printed and shipped within 2–3 working days.")], [tag, t("Printed-to-order items are non-returnable")]];
    const group = msgs.map(([ic, txt]) => `<span class="ann-item"><span class="ann-ico">${ic}</span>${txt}</span><span class="ann-dot" aria-hidden="true"></span>`).join("").repeat(3);
    const track = document.getElementById("annTrack");
    track.innerHTML = `<div class="ann-group">${group}</div><div class="ann-group" aria-hidden="true">${group}</div>`;
    const hero = document.querySelector(".orbit, .lookbook, .hero");           // on pages with a hero, the strip replaces the divider line above it
    if (hero) {
      hero.before(document.getElementById("annBar")); document.body.classList.add("home-splash");
      const hc = document.querySelector(".header > .container");
      if (hc) {
        hc.insertAdjacentHTML("beforeend", `<div class="splash-copy">
          <p class="sp-tag"><span>${t("Sharp prints, fast.")}</span></p>
          <p class="sp-sub">${t("Business cards, flyers, posters, stickers and packaging — printed sharp and delivered fast.")}</p>
        </div>`);
      }
    }
  })();

  document.body.insertAdjacentHTML("beforeend", `
  <footer class="footer"><div class="container">
    <div class="cols">
      <div><h5>${t(BRAND)}</h5><p>${t("Sharp prints, fast.")} ${t("Business cards, flyers, posters, stickers and packaging — printed sharp and delivered fast.")}</p>
        <form id="newsletter"><input type="email" required placeholder="${t("Email address")}"><button>${t("Join")}</button></form></div>
      <div><h5>${t("Shop")}</h5><ul><li><a href="shop.html">${t("All products")}</a></li><li><a href="shop.html?cat=Cards">${catName("Cards")}</a></li><li><a href="shop.html?cat=Flyers">${catName("Flyers")}</a></li><li><a href="shop.html?cat=Stickers">${catName("Stickers")}</a></li></ul></div>
      <div><h5>${t("Help")}</h5><ul><li><a href="info.html?p=about">${t("About Us")}</a></li><li><a href="info.html?p=policy">${t("Our Policy")}</a></li><li><a href="info.html?p=contact">${t("Contact")}</a></li></ul></div>
    </div>
    <p class="copy">© ${new Date().getFullYear()} ${t(BRAND)}. ${t("All rights reserved.")}</p>
  </div></footer>`);
}
