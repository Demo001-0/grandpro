/* js/core/ui.js — Toast, drawer open/close helpers */
function toast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2000)}
function openCart(){document.getElementById("drawer").classList.add("open");document.getElementById("overlay").classList.add("open")}
function closeAll(){["drawer","overlay","searchPanel","nav"].forEach(i=>document.getElementById(i).classList.remove("open"))}
