/* js/core/navigation.js — Current page and navigation links (English keys; translated with t() when rendered) */
const page = location.pathname.split("/").pop() || "index.html";
const navLinks = [["home.html","Home"],["shop.html","Shop"],["info.html?p=contact","Contact"],["info.html?p=about","About Us"],["info.html?p=policy","Our Policy"],["shop.html?sort=new","The Archive"]];
