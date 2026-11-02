/* js/components/cart.js — Cart actions and drawer rendering */
function addToCart(id, qty=1){
  const l = cart.find(i=>i.id===id);
  l ? l.qty += qty : cart.push({id, qty});
  saveCart(); openCart();
}
function changeQty(id, d){
  const l = cart.find(i=>i.id===id); if(!l) return;
  l.qty += d; if(l.qty<=0) cart = cart.filter(i=>i.id!==id);
  saveCart();
}
function removeLine(id){cart = cart.filter(i=>i.id!==id); saveCart()}

function renderCart(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  const total = cart.reduce((s,i)=>s+byId(i.id).price*i.qty,0);
  document.getElementById("cartCount").textContent = count;
  const body = document.getElementById("cartBody"), foot = document.getElementById("cartFoot");
  if(!cart.length){ body.innerHTML = `<p style="text-align:center;padding:50px 0">${t("Your cart is empty")}</p><a class="btn solid full" href="shop.html">${t("Continue shopping")}</a>`; foot.innerHTML=""; return; }
  const left = FREE_SHIPPING - total;
  body.innerHTML = `<div class="progress">${left>0?t("Add <b>{n}</b> more for free shipping",{n:fmt(left)}):t("🎉 You've got free shipping!")}<div class="track"><div class="fill" style="width:${Math.min(100,total/FREE_SHIPPING*100)}%"></div></div></div>` +
    cart.map(i=>{const p=byId(i.id);return `<div class="line">
      <a class="thumb" href="product.html?id=${p.id}">${productVisual(p)}</a>
      <div><h4>${pName(p)}</h4><div class="price" style="font-size:15px">${fmt(p.price)}</div>
        <div class="mini-qty"><button onclick="changeQty('${p.id}',-1)">−</button><span>${i.qty}</span><button onclick="changeQty('${p.id}',1)">+</button></div></div>
      <button class="rm" onclick="removeLine('${p.id}')">${t("Remove")}</button></div>`}).join("");
  foot.innerHTML = `<div class="subtotal"><span>${t("Subtotal")}</span><span>${fmt(total)}</span></div><small>${t("Shipping calculated at checkout.")}</small><button class="btn solid full" id="checkout">${t("Check out")}</button>`;
  document.getElementById("checkout").onclick = () => alert(t("Checkout will be connected in the next phase (payment & orders)."));
}
