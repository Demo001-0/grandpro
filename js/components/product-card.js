/* js/components/product-card.js — Product card template */
function card(p){
  const sale = p.compare, sold = !p.available;
  return `<a class="card" href="product.html?id=${p.id}">
    <div class="img">${productVisual(p)}${sold?`<span class="badge sold">${t("Sold out")}</span>`:sale?`<span class="badge">${t("Sale")}</span>`:""}</div>
    <div class="info"><h3>${pName(p)}</h3>
      <div class="price">${sale?`<s>${fmt(p.compare)}</s>`:""}${fmt(p.price)}</div></div></a>`;
}
