/* js/components/cart-state.js — Cart state and persistence */
/* cart state */
let cart = [];
try { cart = JSON.parse(localStorage.getItem("riyadhprint_cart")) || []; } catch(e){}
const saveCart = () => { try { localStorage.setItem("riyadhprint_cart", JSON.stringify(cart)); } catch(e){} renderCart(); };
const byId = id => PRODUCTS.find(p => p.id === id);
