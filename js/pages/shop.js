/* js/pages/shop.js — page logic for shop.html (defines window.pageInit) */
window.pageInit = () => {
  const params = new URLSearchParams(location.search);
  const state = { cats: new Set(params.get("cat") ? [params.get("cat")] : []), sale: params.get("sale")==="1" };
  const sortEl = document.getElementById("sort");
  if (params.get("sort")) sortEl.value = params.get("sort");

  const cats = [...new Set(PRODUCTS.map(p => p.cat))];
  document.getElementById("catList").innerHTML = cats.map(c => `<label><input type="checkbox" value="${c}" ${state.cats.has(c)?"checked":""}> ${catName(c)}</label>`).join("");
  document.getElementById("heroImg").innerHTML = productVisual(byId("rollup-85")||PRODUCTS[0]);
  if (state.cats.size) document.getElementById("title").textContent = catName([...state.cats][0]);
  if (state.sale) document.getElementById("title").textContent = t("Sale");

  function render(){
    let list = PRODUCTS.map((p,i)=>({...p, i}));
    const min = parseFloat(pMin.value), max = parseFloat(pMax.value);
    if (state.cats.size) list = list.filter(p => state.cats.has(p.cat));
    if (state.sale) list = list.filter(p => p.compare);
    if (fIn.checked !== fOut.checked) list = list.filter(p => fIn.checked ? p.available : !p.available);
    if (!isNaN(min)) list = list.filter(p => p.price >= min);
    if (!isNaN(max)) list = list.filter(p => p.price <= max);
    const s = sortEl.value;
    list.sort((a,b)=> s==="az"? pName(a).localeCompare(pName(b),LANG) : s==="low"? a.price-b.price : s==="high"? b.price-a.price : s==="old"? b.i-a.i : a.i-b.i);
    document.getElementById("count").textContent = t(list.length===1?"{n} product":"{n} products",{n:num(list.length)});
    document.getElementById("grid").innerHTML = list.length ? list.map(card).join("") : `<p class="empty">${t("No products match your filters.")}</p>`;
  }
  document.querySelectorAll("#fIn,#fOut,#pMin,#pMax,#sort").forEach(el => el.addEventListener("input", render));
  document.getElementById("catList").addEventListener("change", e => {
    e.target.checked ? state.cats.add(e.target.value) : state.cats.delete(e.target.value); render();
  });
  // filters: opening one closes the others; clicking anywhere else (or Esc) closes all
  const filters = [...document.querySelectorAll("details.filter")];
  filters.forEach(d => d.addEventListener("toggle", () => {
    if (d.open) filters.forEach(o => { if (o !== d) o.open = false; });
  }));
  document.addEventListener("click", e => filters.forEach(d => { if (d.open && !d.contains(e.target)) d.open = false; }));
  document.addEventListener("keydown", e => { if (e.key === "Escape") filters.forEach(d => d.open = false); });
  render();
};
