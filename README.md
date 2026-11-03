# Riyadh Print

Static storefront (no build step) — open `home.html` directly or serve the folder with any static server.

## Structure

```
grandpro/
├── index.html · home.html · shop.html · product.html · info.html   ← pages (entry points)
├── assets/images/                 ← logo and static images
├── css/
│   ├── main.css                   ← manifest: @imports every layer, IN CASCADE ORDER
│   ├── base/                      ← tokens (colours, fonts), reset, container
│   ├── components/                ← header, hero, buttons, grid, cart drawer, search, footer, sale banner …
│   ├── responsive/                ← base mobile / tablet breakpoints
│   ├── motion/                    ← animations, scroll reveals, scroll sun, typewriter
│   ├── refinements/               ← later design passes that refine components; type-system.css (LAST) holds the font-size scale + text colours
│   └── theme/                     ← dark theme + sun/moon toggle styles
└── js/
    ├── data/products.js           ← product catalogue (edit here to add products)
    ├── core/                      ← config, icons, navigation, ui helpers, bootstrap
    ├── components/                ← layout, cart, product card, product visual, search
    ├── features/                  ← animations.js, theme.js (dark mode), hero3d.js, sections3d.js, card-tilt.js, logo3d.js (not loaded — experimental)
    └── pages/                     ← one file per page (home, shop, product, info), defines window.pageInit
```

## Rules

- **CSS order matters.** Many rules in `refinements/` and `theme/` intentionally override earlier ones.
  Add new rules by creating a file and appending an `@import` at the end of `css/main.css`.
- **Script order matters.** Plain scripts (no modules) so the site works from `file://`.
  Every page loads: `theme.js` (in `<head>`, avoids a theme flash) → data → core → components → `bootstrap.js` → `pages/<page>.js`.
  ``animations.js` is loaded by `bootstrap.js` after the page is built.
- To add a product: edit `js/data/products.js`. To add a page: copy an existing page, add `js/pages/<name>.js`.
- Google Fonts are linked from each page's `<head>`.

## 3D hero (home page)

- `js/features/hero3d.js` + `css/components/hero3d.css`. Loaded with `defer` at the end of `home.html`; it downloads Three.js only on the home page.
- The emblem is rebuilt as an extruded 3D object from the same SVG path as the flat logo (`sunLogo` in `icons.js`), and four real product photos float around it
  (paper bags, gable box, window box, cup carrier) as flat unlit textured planes. Photos are transparent WebP cut-outs inlined as data URIs in `js/features/hero-photos.js` (WebGL can't use `file://` images, so they must be inlined).
- To change what floats, where, and how big: edit `LAYOUT_DESKTOP` / `LAYOUT_PHONE` in `hero3d.js` (`fx` = fraction of width from the emblem, `fy` = emblem diameters below it).
- To swap a product: replace its data URI in `hero-photos.js` (keep the aspect ratio, or update `a` in `PRODUCTS`). A photo that fails to load is simply skipped.
- No WebGL, "reduce motion", or any error → the original flat hero stays untouched.

## 3D sections (home page)

- `js/features/sections3d.js` + `css/motion/sections3d.css` (last `@import` in `main.css`). Loaded with `defer` on `home.html` only. Pure CSS 3D, no WebGL, no extra download.
- Lookbook tiles + category cards: lean with scroll, tilt and glare follow the mouse on desktop (phones: scroll lean only). Category cards also tip up when they scroll in.
- Sale banner: a turning 3D box behind the big number (spins, tumbles with scroll, leans toward the mouse). The banner itself stays flat on purpose (tilting a big dark card gives jagged edges).
- Testimonials: coverflow — side cards turn toward the centre. Feature icons flip like a coin on hover.
- Tune: `KINDS` (tilt / lean degrees) and `coverflow()` in the JS; box size `--s` in the CSS. Everything is scoped to `html.s3d`, which the script adds; "reduce motion" → nothing runs.

## Extra liveliness

- `css/motion/alive.css` (last `@import`) + `js/features/alive.js` (loaded by `bootstrap.js`): scroll progress bar, dark-mode-only drifting green glows, badge pulse, button light sweep, hero card bobbing, card hover glow, and a fly-to-cart + sparkle effect on every Add to cart. All disabled by "reduce motion". To remove: delete the two files, the `@import` and the loader line in `bootstrap.js`.

## Advanced hero

- `css/motion/hero-pro.css` (last `@import`) + `js/features/hero-pro.js` (loaded by `bootstrap.js` when a `.hero2` exists): pointer-driven 3D tilt, glare and green spotlight, depth parallax (card, chips, emblem), floating info chips, magnetic buttons, a "Drag" cursor over the arch, and an autoplay progress fill on the active dot. Pointer effects are mouse-only (`html.hp`); chips and the dot progress also work on touch. Everything is off with "reduce motion".

## Hero cut-out products in the shop

- The four floating hero photos (paper gift bags, gable box, window pastry box, double cup carrier) are now regular products in `js/data/products.js`
  (`luxury-gift-bags`, `gable-gift-box`, `window-pastry-box`, `double-cup-carrier`, category Packaging). Image files: `assets/images/products/hero-*.webp` (extracted from `hero-photos.js`).
- `hero-photos.js` is untouched, so the hero still shows them. `css/refinements/cutout-products.css` makes these transparent photos fit whole inside the card (`object-fit:contain`) instead of being cropped.
- Prices are placeholders — edit them in `products.js`.

## Dive into the logo (home hero)

- `js/features/dive.js` + `css/motion/dive.css` (last `@import`), loaded by `bootstrap.js` when a `.hero2` exists.
- Click the big logo in the hero background (it glows + shows "Enter the experience" on hover) or the pill at the bottom of the hero → the logo grows until it fills the screen, the camera dives in,
  and a full-screen 3D space opens with one "page" per category (Cards, Posters, Stickers, Packaging).
- Every wheel step / swipe / ↓ ↑ ← → key / number key flies the camera to the next page (3D turn + zoom + a tunnel of rings behind). Esc or ✕ closes. Dots / numbers jump to a page.
- Tune: `CATS` (which pages, in order), `draw()` (the camera move: x/y offset, z depth, rotation per page), the easing speed in `frame()` (`dt * 5`), the lock between steps in `step()` (900 ms).
- Pointer sways the camera slightly; "reduce motion" → plain cross-fade; weak devices (low fps) automatically drop the decorations (`.lite`). Remove: delete the two files, the `@import` and the loader line in `bootstrap.js`.

## Dive intro on site open

- `dive.js` now opens by itself ~1.4 s after the home page loads, growing out of the big splash logo — **once per browser session** (`sessionStorage` key `rp_intro_seen`; clear it or open a new tab/session to see it again). Not shown with "reduce motion".
- No close/skip button, no Esc, and no page dots / counter / progress bar. The way out is to keep scrolling (wheel, swipe, ↓ / → keys): scrolling past the last page pulls the camera back and lands on the home page. The "Shop now" / "All products" buttons on each page also leave to the shop.
- Clicking the splash logo or the "Enter the experience" pill still replays it (same exit by scrolling).
- To turn the auto-open off: delete the block at the end of `dive.js` under "opens by itself".

## "Dive with me" pop-up

- `dive.js` (section "Dive with me" pop-up) + the end of `css/motion/dive.css`. A floating pill (spinning emblem with a 15-second countdown ring, ripples, shimmering text) appears bottom-left ~1 s after the intro dive ends — or 2.2 s after load when the intro was already seen this session — stays 15 s, then leaves. Once per page load. Click = runs the dive (growing out of the pill's emblem); the small ✕ dismisses it early.
- Tune: `POP_MS` (duration) and the delays in `schedulePop(...)`.

## Intro timing (update)

- The intro dive now opens **immediately** on every load of the home page (no delay, no once-per-session limit). Remove the `if (!reduce) {...}` block at the end of `dive.js` to turn it off.

- Pop-up update: the "Dive with me" title was removed; it now shows only the short line "A quick trip through Riyadh Print", in a smaller pill.

- Hero update: the "Enter the experience" pill was removed from the hero (click the big logo instead); the hero product card is a single flat colour (`css/refinements/solid-hero-card.css`, last `@import`).

- Desktop hero: the info card now sits under the product (overlapping only its bottom edge by 34px, like on mobile) instead of covering it; see the `@media(min-width:821px)` block in `css/refinements/solid-hero-card.css`.

- Intro update: the dive opens by itself only the first time the site is opened in a browser session (`sessionStorage` key `rp_intro_seen`) — a refresh does not replay it; a new tab/session does. On refresh the \"quick trip\" pop-up shows after 2.2 s instead. Clicking the big logo or the pop-up still runs it any time.

## 3D lens navigation (desktop)

- `js/features/nav3d.js` + `css/refinements/nav3d.css` (loaded by `bootstrap.js`). The top nav and the sticky bar become a glass capsule that tilts toward the pointer (with a light that follows the cursor); a green lens glides and squashes to the hovered link and rests on the current page; link text is a 3D cube that rolls over on hover; links drop in with a staggered flip on load. Phones keep the slide-in menu (all 3D CSS is inside `@media(min-width:821px)`). Remove: delete the two files, the `@import` and the loader line in `bootstrap.js`.
