# Krishi Market — Detailed Project Report

**Project:** Farmer-to-Consumer Agri Marketplace  
**Type:** Front-end static web application (college / portfolio demonstration)  
**Repository:** https://github.com/nandanandugula8999-ops/Farmer-to-Consumer-Agri-Marketplace  
**Live demo (Netlify):** https://krishimarket.netlify.app/  
**Live demo (GitHub Pages):** https://nandanandugula8999-ops.github.io/Farmer-to-Consumer-Agri-Marketplace/  
**Report date:** 8 November 2026  

---

## 1. Executive summary

Krishi Market is a browser-only marketplace that demonstrates a direct farmer-to-consumer supply chain. Customers can browse produce, search and filter listings, inspect farms and products, manage a cart, and complete a simulated checkout. Farmers can register a farm, manage product listings and stock, and process simulated orders through a dashboard.

The application is built with **HTML5, plain CSS, and vanilla JavaScript** only. It has no backend, database, build step, framework, or runtime dependency. All persistent state is kept in the browser using `localStorage`, with an in-memory fallback when storage is unavailable or full.

The project has been audited and improved for:

- cart and checkout correctness,
- corrupted/unavailable storage resilience,
- stock handling,
- form validation,
- responsive layout,
- keyboard and screen-reader accessibility,
- SEO metadata,
- clear labelling of all simulated functionality.

The current build is deployed on both **Netlify** and **GitHub Pages**, and the complete browser test suite passes against both the local and live Netlify versions.

---

## 2. Project objectives

1. Demonstrate a complete marketplace user journey using only front-end technology.
2. Preserve a simple static-hosting model with no server-side dependency.
3. Provide a realistic farmer portal covering registration, products, stock, and orders.
4. Store all demo data locally and reliably across page refreshes.
5. Make simulated features visually and textually unambiguous.
6. Meet modern accessibility, responsive-design, and SEO fundamentals.
7. Remain suitable for a college project demonstration, portfolio, or static showcase.

---

## 3. Technology stack

| Layer | Technology |
| --- | --- |
| Markup | HTML5 |
| Styling | Plain CSS with custom properties, Flexbox, CSS Grid, media queries |
| Application logic | Vanilla JavaScript (ES6), hash-based client-side router |
| Persistence | `localStorage` with in-memory fallback |
| Images | Local JPG assets + client-side canvas compression for farmer uploads |
| Fonts | Google Fonts (Inter, Manrope) |
| Hosting | Netlify and GitHub Pages |
| Build process | None |
| Runtime dependencies | None |

### Design system

- **Forest:** `#263B30`
- **Moss:** `#52764A`
- **Ivory:** `#F2EFE6`
- **Gold:** `#B68C5A` (strong text variant `#825F34`)
- Typography: Manrope for headings, Inter for body text
- Rounded cards, soft shadows, farm-inspired imagery, and a green/ivory palette

---

## 4. Repository structure

```text
krishi-market/
├── index.html                  Single-page shell (header, main, footer, live regions)
├── favicon.svg                 Site icon
├── netlify.toml                Netlify static deployment configuration
├── README.md                   Project overview and quick-start guide
├── PROJECT_REPORT.md           This report
├── css/
│   └── style.css               Complete design system and responsive styles
├── js/
│   ├── data.js                 Seeded categories, farms, products, reviews, query helpers
│   ├── store.js                Farmer account, product and order persistence layer
│   └── app.js                  Router, page renderers, cart, forms and event handling
├── images/                     Product, farm, category and decorative photography
└── .github/
    └── workflows/
        └── deploy.yml          GitHub Pages deployment workflow
```

### Source size

| File | Approximate size |
| --- | --- |
| `js/app.js` | 108 KB, ~1,850 lines |
| `js/store.js` | 22 KB, ~550 lines |
| `js/data.js` | 15 KB, ~215 lines |
| `css/style.css` | 36 KB, ~630 lines |
| `index.html` | 6 KB |

---

## 5. Application architecture

The application uses a lightweight layered structure:

1. **Data layer (`data.js`)** — seeded catalogue and pure query helpers.
2. **Persistence layer (`store.js`)** — farmer account, product overrides/custom products, orders, sanitisation and storage helpers.
3. **Presentation layer (`app.js`)** — hash router, page renderers, cart, forms, validation, event delegation and accessibility announcements.
4. **Shell (`index.html`)** — persistent header, navigation, cart link, live regions, main container and footer.

### Routing

Routing is hash-based, so the site works on any static host without server rewrites:

```text
#/                       Home
#/shop                   Shop (q, category, method, location, availability, priceMin, priceMax, sort, page)
#/product/:id            Product detail
#/categories             Category overview
#/farmers                Farmer directory (q, location, method, page)
#/farmers/:id            Individual farm profile
#/about                  About
#/how-it-works           How it works
#/faq                    Help and FAQs
#/contact                Contact form
#/cart                   Cart and checkout
#/farmer                 Farmer onboarding or dashboard
#/farmer/register        Farm registration and profile editing
#/farmer/products        Product management
#/farmer/products/new    Add product
#/farmer/products/:id/edit  Edit product
#/farmer/orders          Farmer order management (status filter)
```

On every route change the application:

- renders the page into `<main id="app">`,
- updates the document title and meta description,
- updates Open Graph title/description,
- scrolls to the top,
- closes the mobile menu,
- announces the page in a polite live region,
- moves focus to the main container.

---

## 6. Seeded demonstration data

| Entity | Count |
| --- | --- |
| Categories | 6 |
| Farmers | 5 |
| Products | 19 |
| Reviews | 12 (all marked as sample data) |

### Categories

| Category | Products |
| --- | --- |
| Vegetables | 7 |
| Fruits | 3 |
| Dairy Products | 2 |
| Grains & Pulses | 2 |
| Organic Products | 4 |
| Herbs & Other Produce | 1 |

The catalogue includes vegetables, fruits, dairy, grains/pulses, organic products and herbs. Each product has a farmer, category, price, unit, stock level, farming method, origin, harvest date, rating and images.

All seeded reviews, testimonials, demo orders and approval states are explicitly labelled as demonstration content.

---

## 7. Functional modules

### 7.1 Home page

- Hero section with farm-to-table messaging.
- Hero product search that routes to the shop.
- Category cards with live product counts.
- Featured product grid.
- Trust/how-it-works section.
- Demo testimonials, clearly labelled.
- Call-to-action and complete footer navigation.

### 7.2 Shop and catalogue

- Text search across product names, descriptions, farmers, categories and locations.
- Category, farming-method, location and availability filters.
- Price range filtering with invalid-value handling and automatic range correction.
- Sorting by newest, popularity, price ascending, price descending and rating.
- Active-filter chips with individual removal and “Clear all”.
- Clear-search control inside the search field.
- Correct singular/plural product counts.
- Pagination with accessible controls.
- Dedicated empty state with a reset action.
- Out-of-stock products visible but not purchasable.

### 7.3 Product detail

- Main image and thumbnail gallery.
- Product name, farmer link, category, rating, price and unit.
- Stock status, low-stock warning and available quantity.
- Quantity selector clamped to available stock.
- Add-to-cart with stock-aware feedback.
- Origin, harvest date, category and stock facts.
- Certification note and farmer profile strip.
- Related products prioritising in-stock and highly rated items.
- Customer reviews labelled as seeded sample data.

### 7.4 Farmer directory and profiles

- Search by farm name, farmer name, description, village, district, state or crop.
- District/location filtering.
- Farming-method filtering.
- Farm cards with location, crops, rating, method and approval status.
- Individual farm pages with products and recent sample reviews.
- Newly registered farms appear in the directory.
- Pending/rejected approval is clearly labelled as simulated.

### 7.5 Cart

- Persistent cart using `krishi-cart-v1`.
- Duplicate line merging.
- Unknown/deleted products removed automatically.
- Quantities clamped to available stock.
- Zero/negative quantities rejected.
- Quantity increment/decrement and remove controls.
- Live cart count and accessible cart label.
- Subtotal, delivery fee, free-delivery threshold and total.
- Delivery fee: **₹39**; free delivery over **₹499**.
- Cross-tab synchronisation of cart changes.
- In-memory fallback when storage writes fail.

### 7.6 Checkout

- Validates full name, phone, address, city and PIN code.
- Inline error messages connected to inputs via `aria-describedby`.
- `aria-invalid` on failed fields and focus on the first error.
- Phone format: 10-digit Indian mobile beginning with 6–9.
- PIN format: exactly 6 digits.
- Re-validates product availability and quantities immediately before ordering.
- Supports demo Cash on Delivery and demo UPI labels.
- Simulated delivery-availability checker using a fixed demo PIN list.
- Creates a persistent local order and clears the cart.
- Reduces product stock after successful checkout.
- Marks zero-stock products as out of stock.
- Shows an explicit demo confirmation: no payment, notification, or delivery occurs.
- If storage is full, the order is kept for the session and the user is informed.

### 7.7 Farmer registration and profile

Fields:

- Farmer name
- Farm name
- Phone
- Email
- Village/town
- District
- State
- Farm description
- Product categories
- Farming method
- Approval status (demo control)

Validation:

- Name and farm name minimum length.
- Valid Indian mobile number.
- Valid email address.
- Required location fields.
- Description between 10 and 600 characters.
- At least one product category.

Registered profiles are stored in `krishi-farmer-account-v1` and synchronised into the farmer directory.

### 7.8 Farmer dashboard

- Farm name, farmer name, location and approval badge.
- Demo-approval notice and “Simulate approval” action.
- Statistics:
  - total products,
  - available products,
  - total demo orders,
  - demo earnings excluding cancelled orders.
- Recent orders table.
- Product management table.
- Navigation to add products, edit profile and manage orders.
- Demo sign-out and reset-demo-data controls.
- Clear notice that authentication, approval and earnings are simulated.

### 7.9 Product management

- Add, edit and delete own products.
- Product fields: name, description, price, unit, category, farming method, stock, availability and images.
- Validates name, description, positive price, whole-number stock and maximum values.
- Zero stock forces “out of stock”.
- Availability cannot be toggled to “in stock” while stock is zero.
- Stock availability toggle with immediate persistence.
- Up to three product photos.
- Accepted uploads: JPG, PNG, WebP, GIF.
- Images resized to a maximum dimension of 700 px and compressed to JPEG at 72% quality before storage.
- Category image fallback when no upload is provided.
- Image previews with removal controls.
- Farmer products and edits persist across refreshes.
- Deleted seeded products remain deleted after refresh.

### 7.10 Order management

- Orders containing the logged-in farmer’s products.
- Filtering by all, active, status-specific, delivered and cancelled.
- Customer name, phone, address, city, PIN and payment label.
- Item table with quantity, unit price and line total.
- Farmer-specific earnings calculation.
- Status values validated against a fixed list:
  - `placed`
  - `packed`
  - `shipped` (displayed as “Out for delivery”)
  - `delivered`
  - `cancelled`
- Status history timeline.
- Cancellation confirmation.
- Explicit note that customers are not notified.
- Demo order generation for demonstration purposes.

### 7.11 Contact

- Validates name, email and message.
- Minimum message length of 10 characters.
- Inline errors and first-invalid-field focus.
- Loading state and duplicate-submission prevention.
- Focus and live-region announcement after success.
- Clear statement that the message is validated locally and **not sent anywhere**.

### 7.12 Other pages

- **Categories:** overview cards with product counts.
- **About:** project purpose and marketplace values.
- **How it works:** four-step farm-to-kitchen explanation.
- **FAQ:** accessible accordions with `aria-expanded`, `aria-controls` and labelled regions.
- **404:** friendly not-found state for unknown hash routes.

---

## 8. Data model

### Product

```js
{
  _id, name, description,
  categoryId, categorySlug, categoryName,
  images: [],
  price, unit,
  stockQuantity,
  availabilityStatus: "in_stock" | "out_of_stock",
  farmingMethod: "Organic" | "Natural / ZBNF" | "Conventional",
  certificationDetails, origin, harvestDate,
  farmerId, farmerProfileId, farmerName,
  createdAt, updatedAt,
  soldCount, ratingAvg, ratingCount
}
```

### Farmer

```js
{
  id, farmerName, farmName, farmDescription,
  village, district, state,
  cropTypes: [],
  farmingMethod, farmImage,
  ratingAvg, ratingCount,
  approvalStatus: "pending" | "approved" | "rejected",
  isRegistered
}
```

### Review

```js
{
  productId, customerName, rating, comment,
  createdAt, verifiedPurchase, demo
}
```

### Cart line

```js
{ id, qty }
```

### Order

```js
{
  id, placedAt,
  customer: { name, phone, address, city, pincode },
  payment: "cod" | "upi",
  status: "placed" | "packed" | "shipped" | "delivered" | "cancelled",
  items: [
    { productId, name, farmerId, farmerName, price, qty, unit }
  ],
  subtotal, delivery, total,
  demo: Boolean,
  statusHistory: [{ status, at }],
  updatedAt
}
```

---

## 9. localStorage schema and resilience

| Key | Contents |
| --- | --- |
| `krishi-cart-v1` | Array of cart lines `{ id, qty }` |
| `krishi-farmer-account-v1` | Registered farmer profile |
| `krishi-farmer-products-v1` | `{ custom: [], overrides: {}, deleted: [] }` |
| `krishi-orders-v1` | Array of orders, including seeded demo orders |

### Resilience measures

- Invalid JSON is caught and the affected data is reset or ignored.
- Non-array cart/order values are rejected.
- Cart quantities are coerced to positive integers and clamped to stock.
- Duplicate cart lines are merged.
- Unknown product IDs are removed.
- Corrupted farmer accounts are sanitised or rejected.
- Malformed custom products, overrides and deleted IDs are filtered.
- Orders are normalised; invalid orders are discarded.
- If the entire stored order list is corrupted, seeded demo orders are restored.
- Storage write failures fall back to an in-memory copy.
- Storage read/write/remove calls are individually guarded against exceptions.
- Cross-tab `storage` events keep the cart badge and cart page in sync.
- A **Reset demo data** action clears farmer account, products and orders.

Data is per-browser and per-device. Clearing site data resets the demo.

---

## 10. Validation and business rules

| Area | Rule |
| --- | --- |
| Cart quantity | Integer ≥ 1 and ≤ available stock |
| Cart line total | Product price × quantity |
| Delivery fee | ₹39 below ₹499; free at ₹499 or above |
| Checkout name | At least 2 characters |
| Checkout phone | `/^[6-9]\d{9}$/` |
| Checkout address | At least 5 characters |
| Checkout city | At least 2 characters |
| Checkout PIN | Exactly 6 digits |
| Farmer name / farm name | At least 2 characters |
| Farmer phone | `/^[6-9]\d{9}$/` |
| Farmer email | Basic email pattern |
| Farm description | 10–600 characters |
| Farmer categories | At least one |
| Product name | At least 2 characters |
| Product description | 10–600 characters |
| Product price | Greater than 0, at most ₹10,00,000 |
| Product stock | Whole number, 0–10,00,000 |
| Product availability | Zero stock always means out of stock |
| Order status | Must be one of the five defined statuses |
| Image uploads | JPG, PNG, WebP or GIF |
| Cart on refresh | Normalised, cleaned and re-persisted |

Checkout totals are always recalculated by the data layer. Client-supplied totals are never trusted.

---

## 11. Accessibility

Implemented features:

- Skip-to-content link.
- Semantic header, navigation, main and footer landmarks.
- One `<h1>` per page and logical heading structure.
- Keyboard-operable navigation, menus, carousels, accordions and quantity controls.
- Visible `:focus-visible` outlines.
- Mobile menu:
  - `aria-expanded` and `aria-controls`,
  - dynamic accessible label,
  - Escape key support,
  - focus returned to the toggle,
  - closes after link selection or outside click.
- Route-change focus management and polite live announcement.
- ARIA live regions for cart quantity, route changes, toasts, form status and delivery check.
- Form errors linked with `aria-describedby`.
- `aria-invalid` on failed fields.
- `role="alert"` on validation messages.
- FAQ accordion state and region labelling.
- Descriptive labels for icon-only and quantity controls.
- Descriptive alt text for meaningful images; decorative images handled separately.
- Screen-reader text for star ratings.
- WCAG AA contrast for body text, muted text, buttons, badges, links, footer text and toasts.
- Reduced-motion support.
- No reliance on colour alone for status.
- Verified with axe-core: **zero WCAG 2.0 A/AA violations** on audited routes.

---

## 12. Responsive design

Breakpoints:

- Desktop: above 900 px
- Tablet: up to 899 px
- Small mobile: up to 479 px
- Very small mobile: up to 359 px

Responsive behaviour:

- Multi-column product/farm grids collapse to two columns and then one.
- Mobile navigation becomes a scrollable dropdown.
- Header brand, cart and menu button adapt to narrow widths.
- Hero search wraps on small screens.
- Cart lines wrap and thumbnails resize.
- Cart summary stops sticking on mobile.
- Detail gallery and image heights adapt.
- Forms become single-column.
- Data tables scroll horizontally inside focusable regions.
- Buttons retain at least a 44 px touch target for primary controls.
- No horizontal page overflow at 360 px, 768 px or 1280 px on audited routes.

---

## 13. SEO and metadata

- Unique document title per route.
- Dynamic meta description per route.
- Product and farm pages use their own names and descriptions.
- Canonical URL declared.
- Open Graph `type`, `site_name`, `url`, `title`, `description`, `image` and `image:alt`.
- Twitter large-image card.
- `robots` and `author` metadata.
- JSON-LD `WebSite` structured data.
- Semantic HTML and correct heading hierarchy.
- Descriptive image alt text.
- `lang="en"` on the document.
- Noscript fallback message.
- Theme colour metadata.
- SVG favicon.

**Current note:** the canonical and Open Graph URLs still reference the GitHub Pages deployment. If Netlify is the primary public URL, these should be updated to `https://krishimarket.netlify.app/`.

---

## 14. Performance

- No framework, bundler or runtime dependencies.
- Single CSS file and three JavaScript files.
- Native lazy loading on product, farm, cart and gallery images.
- Explicit image width/height to reduce layout shift.
- CSS `object-fit` and aspect ratios for stable media boxes.
- Client-side image compression before storage.
- Event delegation for cart and product actions instead of per-element listeners.
- Route-based rendering avoids re-rendering unrelated pages.
- Local assets, with only Google Fonts loaded externally.
- `preconnect` hints for Google Fonts.
- Reduced-motion support disables non-essential transitions.
- Toast and dynamic UI avoid heavy animation.

---

## 15. Security considerations

This is a front-end demo, not a production system. Still, the following safeguards are in place:

- All user-provided values rendered into HTML pass through an `esc()` helper for `&`, `<`, `>`, `"` and `'`.
- Attribute values are escaped before interpolation.
- URLs are produced from known routes and encoded parameters.
- Uploaded images are restricted by MIME type, drawn to a canvas, and re-encoded as JPEG.
- Persisted data is sanitised before use.
- Order statuses and approval states are validated against fixed lists.
- Storage errors are caught and do not expose stack traces to users.
- Netlify security headers:
  - `X-Frame-Options: SAMEORIGIN`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`

No credentials, API keys, payment data or personal data are transmitted anywhere.

---

## 16. Quality assurance and testing

### Test environment

- Google Chrome (headless)
- Puppeteer end-to-end automation
- axe-core WCAG 2.0 A/AA audits
- Local static server and live Netlify deployment
- Viewports: 1280 × 900, 768 px, 360 px

### End-to-end suite

| # | Test | Result |
| --- | --- | --- |
| 1 | Home renders with metadata, products and categories | Pass |
| 2 | Shop search filters products | Pass |
| 3 | Empty search state | Pass |
| 4 | Reversed price range handled | Pass |
| 5 | Clear-search button exists | Pass |
| 6 | Clear search removes query | Pass |
| 7 | Add to cart updates badge | Pass |
| 8 | Cart renders line and total | Pass |
| 9 | Cart persists after refresh | Pass |
| 10 | Checkout inline validation | Pass |
| 11 | Demo delivery PIN checker | Pass |
| 12 | Checkout success, cart clears, order saved | Pass |
| 13 | Contact validation | Pass |
| 14 | Contact email validation | Pass |
| 15 | Contact success and demo label | Pass |
| 16 | Demo farmer sign-in | Pass |
| 17 | Add product appears in dashboard | Pass |
| 18 | Product form rejects invalid values | Pass |
| 19 | Generate demo orders | Pass |
| 20 | Order timeline renders | Pass |
| 21 | Farmer registration validation | Pass |
| 22 | Site survives corrupted localStorage | Pass |
| 23 | No horizontal overflow at 360 px | Pass |
| 24 | axe WCAG A/AA audit | Pass |

**Result: 24/24 passed.**

### Edge-case suite

| # | Test | Result |
| --- | --- | --- |
| 1 | Over-stock cart clamped and duplicates merged | Pass |
| 2 | Invalid quantities removed | Pass |
| 3 | Out-of-stock filter | Pass |
| 4 | Price ascending sort | Pass |
| 5 | Cart increment/decrement and remove | Pass |
| 6 | Invalid checkout blocked and cart kept | Pass |
| 7 | Farmer product persists after reload | Pass |
| 8 | Order status persists after reload | Pass |
| 9 | Escape closes mobile menu and returns focus | Pass |
| 10 | Mobile nav closes after link selection | Pass |
| 11 | Route change focuses main content | Pass |
| 12 | Unavailable localStorage falls back in memory | Pass |
| 13 | Detail quantity stepper clamps to stock | Pass |

**Result: 13/13 passed.**

### Live Netlify verification

- End-to-end suite: **24/24 passed**
- Console/page errors: **none**
- axe audits on home, shop, product, cart and farmer routes: **0 violations**
- 19 routes × 3 viewports: **0 horizontal overflow, 0 accessibility violations**
- Assets (`index.html`, CSS, JS): HTTP 200
- Security headers present
- Stock decrement and persistence verified (120 → 118, preserved after reload)

---

## 17. Defects found and fixed during the audit

### Cart and checkout

- Corrupted cart JSON could leave the cart stuck or inconsistent.
- Negative quantities could become `1`; zero/negative lines were not rejected.
- Duplicate cart lines were not merged.
- Cart lines could reference deleted or out-of-stock products.
- Quantity caps were silent and offered no user feedback.
- Checkout accepted too-short names, addresses and cities.
- Order totals were trusted from the client instead of recalculated.
- Checkout did not reduce stock, allowing overselling.
- Confirmation implied a real order and delivery window.

### Farmer portal

- Corrupted accounts and malformed product state could crash pages.
- Registration lacked minimum-length, state and description checks.
- Products accepted blank names, invalid prices and fractional/negative stock.
- “In stock” could be set with zero stock.
- Approval wording implied real verification.
- Dashboard order rendering assumed complete customer data.

### Catalogue and search

- Reversed price ranges produced incorrect results.
- Invalid price values were not handled.
- Out-of-stock filtering was unavailable.
- No clear-search control or useful empty state.
- Farmer search omitted farmer name, village and state.
- Farm count included farms without products.
- Category count grammar was incorrect.
- Sorting was unstable for ties.
- Related products ignored stock and rating.

### Images and layout

- Product image heights were inconsistent.
- Broken images had no fallback.
- Meaningful images lacked alt text.
- An unreferenced unsupported JXL file was present.
- Intrinsic dimensions were missing, increasing layout shift.

### Navigation and accessibility

- Mobile menu did not return focus on Escape.
- Toggle label/icon did not reflect state.
- Insufficient mobile dropdown styling and touch target.
- Low-contrast muted text, gold accents, red links, footer text and toasts.
- Form errors were not associated with inputs.
- Route changes did not move focus or announce pages.
- FAQ accordions lacked ARIA state.
- Several icon-only controls lacked labels.
- Missing/empty alt text on several images.

### SEO and demo labelling

- No per-route titles or descriptions.
- Missing canonical URL, absolute OG image URL and OG URL.
- Heading level skip in the footer.
- No structured data.
- Seeded reviews were labelled “Verified”.
- Testimonials, orders, approval and dashboard earnings were not clearly labelled as demo.
- Contact success implied a message was sent.

### Code quality

- Empty unused `fix4.js`.
- Unsupported unreferenced `.jxl` image.
- Unused renderer function.
- Duplicated CSS rules for errors and hints.
- Inconsistent numeric coercion in order calculations.

---

## 18. Deployment

### GitHub Pages

- Workflow: `.github/workflows/deploy.yml`
- Trigger: push to `main`
- Source: GitHub Actions
- URL: `https://nandanandugula8999-ops.github.io/Farmer-to-Consumer-Agri-Marketplace/`
- Latest verified deployment: success

### Netlify

- Configuration: `netlify.toml`
- Build command: none
- Publish directory: repository root (`.`)
- Continuous deployment: connected to the GitHub repository, `main` branch
- URL: `https://krishimarket.netlify.app/`
- Security headers configured in `netlify.toml`
- Live verification completed successfully

### Local development

```bash
git clone https://github.com/nandanandugula8999-ops/Farmer-to-Consumer-Agri-Marketplace.git
cd Farmer-to-Consumer-Agri-Marketplace
python -m http.server 8000
```

Then open `http://localhost:8000`.

Alternatively, open `index.html` directly in a browser.

---

## 19. Known limitations

1. **No backend or database.** All data is local to one browser.
2. **No real authentication.** Farmer sign-in and demo-farmer access are simulated.
3. **No admin portal.** Approval status is a local demo field and can be changed by the user.
4. **No real payments.** Cash on Delivery and UPI are labels only.
5. **No real logistics.** The PIN checker uses a fixed demo list.
6. **No real notifications.** Orders, contact messages and status changes send nothing.
7. **No server-side validation.** A determined user can modify local data.
8. **Storage limits.** Large images or many products can exhaust localStorage; the app then falls back to session-only memory.
9. **Per-device data.** Cart, products and orders do not sync across devices.
10. **Limited cross-tab sync.** Only the cart listens for storage changes.
11. **Static stock.** Checkout reduces stock only in the current browser.
12. **Hash routing and client-side metadata.** Route-specific content is not fully indexable by all crawlers.
13. **Canonical metadata.** Currently references GitHub Pages; should be changed if Netlify is primary.
14. **No automated tests in the repository.** The QA suites were run externally; only the application is committed.

---

## 20. Future enhancements

- Replace localStorage with a real backend API and database.
- Add real authentication with customer and farmer roles.
- Add an admin approval and moderation portal.
- Integrate a payment gateway in test mode.
- Add real delivery-service PIN validation.
- Add order emails/SMS notifications.
- Add customer accounts, saved addresses and order history.
- Add wishlists and persistent favourites.
- Add demo coupon codes and promotional pricing.
- Add multi-image drag-and-drop upload with server storage.
- Add product reviews restricted to real purchases.
- Add farmer payout and commission reporting.
- Add inventory reservations and concurrency-safe stock updates.
- Add automated accessibility and end-to-end tests to CI.
- Add a proper 404/redirect strategy for non-hash routing.
- Add a Content Security Policy once external font dependencies are finalised.

---

## 21. Conclusion

Krishi Market demonstrates a complete, coherent farmer-to-consumer marketplace using only front-end technology. The application covers the full customer journey and a realistic farmer portal while remaining honest about its simulated nature.

The audit and remediation work significantly improved reliability, input validation, stock handling, accessibility, responsive behaviour and SEO. The final build:

- passes all 24 end-to-end tests,
- passes all 13 edge-case tests,
- has zero axe WCAG A/AA violations on audited routes,
- has no console errors,
- has no horizontal overflow across tested mobile, tablet and desktop widths,
- is deployed and verified on Netlify.

The project is suitable for a college demonstration, portfolio presentation, or as a foundation for a future full-stack marketplace.
