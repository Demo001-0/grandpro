const FREE_SHIPPING = 2000;
/* The currency sign is drawn by css/refinements/riyal.css (.riyal) — it works in innerHTML only */
const RIYAL = '<span class="riyal" role="img" aria-label="SAR"></span>';
/* 1,100.00 ⃁  /  ١٬١٠٠٫٠٠ ⃁  (Saudi riyal sign) */
const fmt = n => isAR()
  ? Number(n).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + RIYAL
  : Number(n).toLocaleString("en-US", { minimumFractionDigits: 2 }) + RIYAL;
/* 2,000 ⃁ (no decimals) — for messages */
const money0 = n => (isAR() ? Number(n).toLocaleString("ar-SA") : Number(n).toLocaleString("en-US")) + RIYAL;
const num = n => isAR() ? Number(n).toLocaleString("ar-SA") : String(n);
