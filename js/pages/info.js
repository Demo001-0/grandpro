/* js/pages/info.js — page logic for info.html (defines window.pageInit) */
const PAGES = {
  about: { t:"About Us", h:() => `<p>${t("Riyadh Print is a print shop built on one idea: sharp prints, delivered fast. We print business cards, flyers, brochures, posters, banners, stickers and packaging for brands of every size.")}</p><p>${t("Every job gets an artwork check, quality paper and a careful finish — so what lands in your hands looks like what you imagined.")}</p>` },
  policy: { t:"Our Policy", h:() => `<h2>${t("Shipping")}</h2><p>${t("Free shipping on orders over {n}. Orders are delivered within 2–5 working days after the print is approved.",{n:money0(FREE_SHIPPING)})}</p><h2>${t("Returns")}</h2><p>${t("Printed-to-order items can only be returned or reprinted if there is a printing defect, reported within 3 days of delivery.")} <b>${t("All discounted items are non-returnable.")}</b></p><h2>${t("Payment")}</h2><p>${t("Cash on delivery is available.")}</p>` },
  contact: { t:"Contact", h:() => `<p>${t("Questions about an order or a print job? Send us a message.")}</p><form class="contact-form" id="cf"><input required placeholder="${t("Name")}"><input type="email" required placeholder="${t("Email")}"><input placeholder="${t("Phone")}"><textarea rows="5" required placeholder="${t("Message")}"></textarea><button class="btn solid">${t("Send")}</button></form>` }
};
window.pageInit = () => {
  const k = new URLSearchParams(location.search).get("p");
  const d = PAGES[k] || PAGES.about;
  document.title = t(d.t) + " – " + t(BRAND);
  document.getElementById("content").innerHTML = `<h1 class="section-title" style="text-align:start">${t(d.t)}</h1>${d.h()}`;
  const cf = document.getElementById("cf");
  if (cf) cf.onsubmit = e => { e.preventDefault(); cf.reset(); toast(t("Message sent!")); };
};
