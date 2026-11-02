/* js/pages/product.js — page logic for product.html (defines window.pageInit) */
window.pageInit = () => {
  const id = new URLSearchParams(location.search).get("id");
  const p = byId(id) || PRODUCTS[0];
  document.title = pName(p) + " – " + t(BRAND);
  let qty = 1;
  const root = document.getElementById("root");
  root.innerHTML = `
    <div class="crumbs"><a href="home.html">${t("Home")}</a> / <a href="shop.html?cat=${p.cat}">${catName(p.cat)}</a> / ${pName(p)}</div>
    <div class="product">
      <div class="gallery">${productVisual(p)}</div>
      <div>
        <h1>${pName(p)}</h1>
        <div class="price">${p.compare?`<s>${fmt(p.compare)}</s> `:""}${fmt(p.price)}</div>
        ${p.compare?`<p style="margin-bottom:16px;font-size:14px">${t("Discounted item – non-returnable.")}</p>`:""}
        <div class="qty"><button id="minus">−</button><span id="q">${num(1)}</span><button id="plus">+</button></div>
        <button class="btn solid full add" id="add" ${p.available?"":"disabled"}>${p.available?t("Add to cart"):t("Sold out")}</button>
        <p class="desc">${pDesc(p)}</p>
        <ul><li>${t("Free shipping on orders over {n}",{n:money0(FREE_SHIPPING)})}</li><li>${t("Cash on delivery available")}</li><li>${t("Artwork check before every print")}</li></ul>
      </div>
    </div>`;
  const q = document.getElementById("q"), show = () => q.textContent = num(qty);
  document.getElementById("minus").onclick = () => { qty = Math.max(1, qty-1); show(); };
  document.getElementById("plus").onclick = () => { qty++; show(); };
  document.getElementById("add").onclick = () => addToCart(p.id, qty);
  document.getElementById("related").innerHTML = PRODUCTS.filter(x=>x.id!==p.id).slice(0,4).map(card).join("");
};
