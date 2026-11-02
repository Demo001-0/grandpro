/* js/core/i18n.js — English / Arabic switch (loaded first, in <head>, so the page never flashes the wrong direction)
   - The visitor's choice is saved in localStorage ("grandpro_lang"); ?lang=ar or ?lang=en also works.
   - t("English text") returns the Arabic text from AR below when the site is in Arabic, otherwise the same text.
   - translateDOM() translates the static HTML (anything whose text matches a key of AR).
   - To change the default language of the shop, edit DEFAULT_LANG. */
const DEFAULT_LANG = "ar";
const LANG_KEY = "grandpro_lang";
let LANG = DEFAULT_LANG;
try {
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "ar" || q === "en") localStorage.setItem(LANG_KEY, q);
  LANG = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
} catch (e) {
  const q = (location.search.match(/[?&]lang=(ar|en)/) || [])[1];
  LANG = q || DEFAULT_LANG;
}
const isAR = () => LANG === "ar";
document.documentElement.lang = LANG;
document.documentElement.dir = isAR() ? "rtl" : "ltr";
document.documentElement.classList.add(isAR() ? "is-ar" : "is-en");

const AR = {
  /* testimonials */
  "What our customers say": "رأي عملائنا", "Real words from people who print with us.": "كلمات حقيقية من عملاء بيطبعوا معانا.", "Previous review": "التقييم السابق", "Next review": "التقييم التالي", "Verified order": "طلب موثّق",
  /* nav + header */
  "Home": "الرئيسية", "Shop": "المتجر", "Contact": "تواصل معنا", "About Us": "من نحن", "Our Policy": "سياستنا", "The Archive": "الأرشيف",
  "Menu": "القائمة", "Search": "بحث", "Account": "حسابي", "Cart": "السلة", "Close menu": "إغلاق القائمة", "Close": "إغلاق",
  "Print Shop": "للطباعة", "Search products...": "ابحث عن منتج...", "Back to top": "للأعلى",
  "Switch language": "تغيير اللغة", "Announcements": "إعلانات",
  "Free shipping on orders over {n}": "شحن مجاني للطلبات فوق {n}",
  "Printed-to-order items are non-returnable": "المنتجات المطبوعة حسب الطلب غير قابلة للاسترجاع",
  "Print that makes people look twice.": "طباعة تخلّي الناس تبص مرتين.",
  "Business cards, flyers, posters, stickers and packaging — printed sharp and delivered fast.": "كروت وفلايرز وبوسترات وستيكرز وعلب — بطباعة حادة وتسليم سريع.",
  /* footer */
  "GrandPro": "GrandPro", "Email address": "البريد الإلكتروني", "Join": "اشترك", "Help": "مساعدة",
  "All products": "كل المنتجات", "All rights reserved.": "جميع الحقوق محفوظة.", "Thanks for subscribing!": "شكراً لاشتراكك!",
  /* home */
  "Sharp prints, fast.": "طباعة حادة وسريعة.", "Ink, paper and a little sunshine in every order.": "حبر وورق وشوية شمس في كل طلب.",
  "Print that pops": "طباعة بتلفت النظر", "Business Cards": "كروت شخصية", "Stickers & Labels": "ستيكرز وليبلز",
  "Posters & Banners": "بوسترات وبانرات", "Packaging": "علب وتغليف",
  "Shop by category": "تسوّق حسب القسم", "Best sellers": "الأكثر مبيعاً", "View all": "عرض الكل",
  "Limited time": "لفترة محدودة", "Sale – up to 30% off": "تخفيضات – حتى ٣٠٪", "Discounted items are non-returnable.": "المنتجات المخفّضة غير قابلة للاسترجاع.", "Shop sale": "تسوّق التخفيضات",
  "Free shipping": "شحن مجاني", "On all orders over {n}.": "على كل الطلبات فوق {n}.",
  "Premium materials": "خامات فاخرة", "Quality paper, vivid inks and a careful finish on every job.": "ورق عالي الجودة وأحبار زاهية وتشطيب متقن في كل شغلانة.",
  "Fast turnaround": "تسليم سريع", "Most orders are printed and shipped within 2–3 working days.": "أغلب الطلبات بتتطبع وتتشحن خلال ٢–٣ أيام عمل.",
  "Cash on delivery": "الدفع عند الاستلام", "Pay when your order arrives.": "ادفع لما طلبك يوصلك.",
  "Cards": "كروت وبطاقات", "Flyers": "فلايرز وبروشورات", "Posters": "بوسترات وبانرات", "Stickers": "ستيكرز وليبلز",
  "product": "منتج", "products": "منتجات",
  /* hero */
  "Best seller": "الأكثر مبيعاً", "Cards that get kept": "كروت بتتحفظ", "Drag": "اسحب", "Double-sided thank-you cards that bring customers back. Make every order a little more personal.": "كروت شكر وجهين بترجّع العميل تاني. خلّي كل طلب أقرب وأكثر لمسة شخصية.", "Premium matte business cards with a soft-touch finish. Make the first impression the one that stays.": "كروت شخصية مات فاخرة بملمس ناعم. خلّي الانطباع الأول هو اللي يفضل.",
  "Shop now": "تسوّق الآن", "View product": "شوف المنتج",
  "Sale · up to 30% off": "تخفيضات · حتى ٣٠٪", "Be seen from across the street": "اتشاف من آخر الشارع", "Roll-ups, banners and posters in big, bold colour — now at special prices for a limited time.": "رول أب وبانرات وبوسترات بألوان كبيرة وجريئة — بأسعار خاصة لفترة محدودة.",
  "New in": "جديد", "Packaging with presence": "تغليف له حضور", "Custom mailer boxes and paper bags printed with your brand, inside and out.": "علب شحن وشنط ورق مطبوعة بهويتك من جوه ومن برا.",
  "Shop packaging": "تسوّق التغليف", "Add to cart": "أضف للسلة", "Sold out": "نفدت الكمية", "Sale": "تخفيض", "Slide": "شريحة",
  /* shop */
  "All Products": "كل المنتجات", "Discover business cards, flyers, posters, stickers and packaging.": "اكتشف الكروت والفلايرز والبوسترات والستيكرز والتغليف.",
  "Filter:": "تصفية:", "Availability": "التوفر", "In stock": "متوفر", "Out of stock": "غير متوفر", "Price": "السعر", "Category": "القسم", "From": "من", "To": "إلى",
  "Sort by:": "ترتيب حسب:", "Date, new to old": "التاريخ: الأحدث أولاً", "Date, old to new": "التاريخ: الأقدم أولاً", "Alphabetically, A-Z": "أبجدياً",
  "Price, low to high": "السعر: الأقل أولاً", "Price, high to low": "السعر: الأعلى أولاً",
  "No products match your filters.": "مفيش منتجات مطابقة للفلاتر.", "{n} product": "{n} منتج", "{n} products": "{n} منتجات",
  /* product */
  "You may also like": "ممكن يعجبك كمان", "Discounted item – non-returnable.": "منتج مخفّض – غير قابل للاسترجاع.",
  "Free shipping on orders over {n}": "شحن مجاني للطلبات فوق {n}", "Cash on delivery available": "الدفع عند الاستلام متاح", "Artwork check before every print": "مراجعة التصميم قبل كل طباعة",
  /* cart */
  "Your cart": "سلتك", "Your cart is empty": "سلتك فاضية", "Continue shopping": "كمّل تسوّق", "Remove": "حذف", "Subtotal": "الإجمالي الفرعي",
  "Shipping calculated at checkout.": "الشحن بيتحسب عند إتمام الطلب.", "Check out": "إتمام الطلب",
  "Add <b>{n}</b> more for free shipping": "أضف <b>{n}</b> كمان عشان تاخد شحن مجاني", "🎉 You've got free shipping!": "🎉 طلبك عليه شحن مجاني!",
  "Checkout will be connected in the next phase (payment & orders).": "إتمام الطلب هيتوصّل في المرحلة الجاية (الدفع والطلبات).",
  /* search */
  "No results for \"{q}\"": "مفيش نتائج لـ \"{q}\"",
  /* info pages */
  "About": "من نحن", "Contact us": "تواصل معنا",
  "GrandPro is a print shop built on one idea: sharp prints, delivered fast. We print business cards, flyers, brochures, posters, banners, stickers and packaging for brands of every size.": "GrandPro مطبعة قايمة على فكرة واحدة: طباعة حادة وتسليم سريع. بنطبع كروت شخصية وفلايرز وبروشورات وبوسترات وبانرات وستيكرز وعلب لبراندات من كل الأحجام.",
  "Every job gets an artwork check, quality paper and a careful finish — so what lands in your hands looks like what you imagined.": "كل شغلانة بتعدّي على مراجعة تصميم وورق جيد وتشطيب متقن — عشان اللي يوصلك يبقى زي اللي تخيلته.",
  "Shipping": "الشحن", "Free shipping on orders over {n}. Orders are delivered within 2–5 working days after the print is approved.": "شحن مجاني للطلبات فوق {n}. بيتم التسليم خلال ٢–٥ أيام عمل بعد اعتماد البروفة.",
  "Returns": "الاسترجاع", "Printed-to-order items can only be returned or reprinted if there is a printing defect, reported within 3 days of delivery.": "المنتجات المطبوعة حسب الطلب بتتبدّل أو بتتعاد طباعتها فقط لو فيها عيب طباعة، وبشرط الإبلاغ خلال ٣ أيام من الاستلام.",
  "All discounted items are non-returnable.": "كل المنتجات المخفّضة غير قابلة للاسترجاع.", "Payment": "الدفع", "Cash on delivery is available.": "الدفع عند الاستلام متاح.",
  "Questions about an order or a print job? Send us a message.": "عندك سؤال عن طلب أو شغلانة طباعة؟ ابعتلنا رسالة.",
  "Name": "الاسم", "Email": "البريد الإلكتروني", "Phone": "التليفون", "Message": "الرسالة", "Send": "إرسال", "Message sent!": "تم إرسال الرسالة!"
};

/* t("text", {n: 5}) → translated + filled in */
function t(s, vars) {
  let out = (isAR() && AR[s]) || s;
  if (vars) for (const k in vars) out = out.split("{" + k + "}").join(vars[k]);
  return out;
}
/* product / category helpers */
const pName = p => (isAR() && p.ar) || p.name;
const pDesc = p => (isAR() && p.descAr) || p.desc;
const catName = c => (isAR() && CATEGORIES[c] && CATEGORIES[c].ar) || c;

/* translate static HTML: text nodes + placeholder/aria-label/alt that exactly match a key of AR */
function translateDOM(root) {
  if (!isAR()) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n => {
    const raw = n.nodeValue, key = raw.trim();
    if (key && AR[key]) n.nodeValue = raw.replace(key, AR[key]);
  });
  root.querySelectorAll("[placeholder],[aria-label],[alt],[title]").forEach(el => {
    ["placeholder", "aria-label", "alt", "title"].forEach(a => { const v = el.getAttribute(a); if (v && AR[v]) el.setAttribute(a, AR[v]); });
  });
}
function setLang(l) {
  try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
  const u = new URL(location.href); u.searchParams.delete("lang");
  location.href = u.toString();
}
const toggleLang = () => setLang(isAR() ? "en" : "ar");
