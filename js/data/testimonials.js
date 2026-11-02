/* js/data/testimonials.js — customer reviews shown on the home page.
   >>> These are SAMPLE reviews. Replace them with real ones (name, role, product, text, stars 1–5).
   Each review has an English and an Arabic version (the page shows the one that matches the site language). */
const TESTIMONIALS = [
  { name: "Sara A.",   nameAr: "سارة أحمد",   role: "Boutique owner",       roleAr: "صاحبة بوتيك",        product: "Business Cards", productAr: "كروت شخصية", stars: 5,
    text: "The matte cards feel luxurious and the colours came out exactly like my design. Customers keep asking where I printed them.",
    textAr: "الكروت المطفية فخمة جداً والألوان طلعت زي التصميم بالظبط. العملاء دايماً بيسألوني طبعتها فين." },
  { name: "Mohamed K.", nameAr: "محمد كمال",  role: "Restaurant manager",   roleAr: "مدير مطعم",           product: "Packaging",      productAr: "علب وتغليف",  stars: 5,
    text: "We ordered branded boxes and bags for our opening. Sharp print, strong material, and it arrived a day early.",
    textAr: "طلبنا علب وشنط بهويتنا للافتتاح. الطباعة حادة والخامة قوية ووصلت قبل الميعاد بيوم." },
  { name: "Nour H.",   nameAr: "نور حسن",     role: "Event planner",        roleAr: "منظمة فعاليات",       product: "Posters",        productAr: "بوسترات",     stars: 5,
    text: "Posters and roll-up banners for our event looked amazing. The team fixed a small file issue for me without any fuss.",
    textAr: "البوسترات والرول أب للفعالية طلعوا ممتازين. والفريق صلّح مشكلة صغيرة في الملف من غير أي تعقيد." },
  { name: "Youssef M.", nameAr: "يوسف مصطفى", role: "Online store owner",   roleAr: "صاحب متجر إلكتروني",  product: "Stickers",       productAr: "ستيكرز",      stars: 5,
    text: "The die-cut stickers are glossy, waterproof and cut perfectly. Customers love finding them inside their orders.",
    textAr: "الاستيكرز المقصوصة لامعة وضد الماء ومقصوصة بدقة. العملاء بيحبوا يلاقوها جوه الأوردر." },
  { name: "Dina R.",   nameAr: "دينا رأفت",   role: "Clinic owner",         roleAr: "صاحبة عيادة",         product: "Brochures",      productAr: "بروشورات",    stars: 4,
    text: "Clean folds and quality paper on the tri-fold brochures. Support answered all my questions before I ordered.",
    textAr: "طيّات نضيفة وورق ممتاز في البروشورات. وخدمة العملاء جاوبت على كل أسئلتي قبل ما أطلب." },
  { name: "Omar S.",   nameAr: "عمر سامي",    role: "Café owner",           roleAr: "صاحب كافيه",          product: "Flyers",         productAr: "فلايرز",      stars: 5,
    text: "Fast turnaround and great value on flyers. We reordered twice already and the quality was the same every time.",
    textAr: "سرعة في التنفيذ وسعر ممتاز في الفلايرز. أعدنا الطلب مرتين والجودة ثابتة في كل مرة." }
];
