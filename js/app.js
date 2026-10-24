// Krishi Market — hash router + page renderers (no framework, no build)

const app = document.getElementById('app');

// ---- utils ----

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function money(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

function starsHTML(avg, count) {
  const full = Math.round(avg || 0);
  const row = '★'.repeat(full) + '☆'.repeat(5 - full);
  return '<span class="stars"><span class="row">' + row + '</span> ' + esc((avg || 0).toFixed(1)) +
    (count != null ? ' (' + count + ')' : '') + '</span>';
}

function methodBadge(method) {
  if (method === 'Organic') return '<span class="badge badge-green">Organic</span>';
  if (method === 'Natural / ZBNF') return '<span class="badge badge-blue">Natural / ZBNF</span>';
  return '<span class="badge badge-gray">Conventional</span>';
}

function productImage(p, cls) {
  const src = p.images && p.images[0];
  if (src) return '<img src="' + esc(src) + '" alt="' + esc(p.name) + '" class="' + (cls || '') + '" loading="lazy" />';
  return '';
}

function parseHash() {
  const raw = location.hash.slice(1) || '/';
  const [path, queryStr] = raw.split('?');
  const q = {};
  new URLSearchParams(queryStr || '').forEach((v, k) => { q[k] = v; });
  return { path: path.replace(/\/+$/, '') || '/', segments: path.split('/').filter(Boolean), q };
}

// ---- components ----

function productCard(p) {
  const img = p.images && p.images[0]
    ? '<div class="product-media"><a href="#/product/' + p._id + '"><img src="' + esc(p.images[0]) + '" alt="' + esc(p.name) + '" loading="lazy" /></a>' +
      '<div class="product-badges">' + methodBadge(p.farmingMethod) +
      (p.stockQuantity === 0 ? '<span class="badge badge-red">Out of stock</span>' : '') + '</div></div>'
    : '<div class="product-media"><a href="#/product/' + p._id + '"><div class="product-fallback">🥬</div></a>' +
      '<div class="product-badges">' + methodBadge(p.farmingMethod) +
      (p.stockQuantity === 0 ? '<span class="badge badge-red">Out of stock</span>' : '') + '</div></div>';

  return '<div class="card">' + img +
    '<div class="product-body">' +
    '<a class="product-title" href="#/product/' + p._id + '">' + esc(p.name) + '</a>' +
    '<div class="product-meta">Farmer: <a class="link" href="#/farmers/' + esc(p.farmerProfileId) + '">' + esc(p.farmerName) + '</a> · ' + esc(p.categoryName) + '</div>' +
    '<div class="product-meta" style="margin-top:.15rem">' + starsHTML(p.ratingAvg, p.ratingCount) + '</div>' +
    '<div class="product-price">' + money(p.price) + ' <span>/ ' + esc(p.unit) + '</span></div>' +
    '</div></div>';
}

function farmerCard(f) {
  const img = f.farmImage
    ? '<img src="' + esc(f.farmImage) + '" alt="' + esc(f.farmName) + '" loading="lazy" />'
    : '<div class="farmer-fallback">🚜</div>';
  return '<div class="card farmer-card">' + img +
    '<div class="farmer-card-body">' +
    '<h3><a href="#/farmers/' + esc(f.id) + '">' + esc(f.farmName) + '</a></h3>' +
    '<p class="product-meta">' + esc(f.village) + ', ' + esc(f.district) + '</p>' +
    '<p style="font-size:.8rem;color:var(--muted);margin-top:.4rem">' + esc(f.farmDescription) + '</p>' +
    '<div class="farmer-row">' + starsHTML(f.ratingAvg, f.ratingCount) + methodBadge(f.farmingMethod) + '</div>' +
    '</div></div>';
}

function categoryCard(c) {
  const count = PRODUCTS.filter((p) => p.categoryId === c._id).length;
  const media = c.image
    ? '<img src="' + esc(c.image) + '" alt="' + esc(c.name) + '" loading="lazy" />'
    : '<div class="cat-emoji">📦</div>';
  return '<a href="#/shop?category=' + esc(c.slug) + '"><div class="card cat-card">' + media +
    '<span class="name">' + esc(c.name) + '</span><span class="count">' + count + ' items</span></div></a>';
}

function reviewCard(r) {
  return '<div class="card review-card">' +
    '<div class="review-top">' + starsHTML(r.rating) +
    (r.verifiedPurchase ? '<span class="badge badge-green">Verified</span>' : '') + '</div>' +
    '<p class="review-text">“' + esc(r.comment) + '”</p>' +
    '<div class="review-meta">' + esc(r.customerName) + ' · ' + new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + '</div>' +
    '</div>';
}

function paginationHTML(page, pages) {
  if (pages <= 1) return '';
  let html = '<div class="pagination">';
  html += '<button data-goto="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>‹ Prev</button>';
  for (let i = 1; i <= pages; i++) {
    html += '<button data-goto="' + i + '"' + (i === page ? ' class="current"' : '') + '>' + i + '</button>';
  }
  html += '<button data-goto="' + (page + 1) + '"' + (page >= pages ? ' disabled' : '') + '>Next ›</button></div>';
  return html;
}

function emptyHTML(title, body, cta) {
  return '<div class="empty"><h3>' + esc(title) + '</h3><p>' + esc(body) + '</p>' +
    (cta ? '<a class="btn btn-outline" href="' + esc(cta.href) + '">' + esc(cta.label) + '</a>' : '') + '</div>';
}

// ---- pages ----

function pageHome() {
  const q = queryProducts({}, 8);
  const testis = [
    { t: 'The tomatoes and greens arrive so fresh. My family can taste the difference.', who: 'Priya S., Bengaluru' },
    { t: 'Fair prices for farmers and quality produce for us — exactly what a marketplace should be.', who: 'Arun K., Mysuru' },
    { t: 'I love being able to see which farm my milk comes from.', who: 'Kavitha N., Mandya' },
  ];

  return (
    '<section class="hero"><div class="container hero-inner">' +
    '<div>' +
    '<span class="hero-badge">🧑‍🌾 Farm-to-table, the Indian way</span>' +
    '<h1>Fresh from the farm, straight to your kitchen</h1>' +
    '<p>Krishi Market connects local farmers directly with customers. Fair prices for growers, fresh and traceable produce for you.</p>' +
    '<form class="hero-search" id="heroSearch">' +
    '<input type="text" name="q" placeholder="Search tomatoes, spinach, mango…" aria-label="Search products" />' +
    '<button class="btn btn-gold" type="submit">Search</button>' +
    '</form>' +
    '<div class="hero-actions">' +
    '<a class="btn btn-light" href="#/shop">Browse produce</a>' +
    '<a class="btn btn-outline btn-light" href="#/how-it-works">How it works</a>' +
    '</div>' +
    '</div>' +
    '<img class="hero-img" src="images/tomato-pile.jpg" alt="Fresh produce at a farmers market" />' +
    '</div></section>' +

    '<section class="section"><div class="container">' +
    '<div class="section-head"><div><h2>Shop by category</h2><p>Fresh produce across six farm categories</p></div>' +
    '<a class="link" href="#/categories">View all →</a></div>' +
    '<div class="grid grid-6">' + CATEGORIES.map(categoryCard).join('') + '</div>' +
    '</div></section>' +

    '<section class="section section-alt"><div class="container">' +
    '<div class="section-head"><div><h2>Latest harvests</h2><p>Recently listed by our farmers</p></div>' +
    '<a class="link" href="#/shop">View all →</a></div>' +
    '<div class="grid grid-4 grid-3-mobile">' + q.items.map(productCard).join('') + '</div>' +
    '</div></section>' +

    '<section class="section"><div class="container">' +
    '<div class="section-head"><div><h2>Meet our farmers</h2><p>The people behind your food</p></div>' +
    '<a class="link" href="#/farmers">All farmers →</a></div>' +
    '<div class="grid grid-4 grid-3-mobile">' + FARMERS.slice(0, 4).map(farmerCard).join('') + '</div>' +
    '</div></section>' +

    '<section class="section section-alt"><div class="container">' +
    '<div class="section-head"><div><h2>Why Krishi Market?</h2></div></div>' +
    '<div class="grid grid-4 grid-3-mobile">' +
    [['🌱', 'Farm-fresh', 'Produce harvested and shipped within days, not weeks.'],
     ['🤝', 'Fair prices', 'Farmers set their prices — no middlemen taking the cut.'],
     ['📍', 'Traceable', 'Every product shows its farmer, farm and harvest date.'],
     ['🧾', 'Verified reviews', 'Only customers who bought can review.']].map(function (x) {
      return '<div class="card step-card"><div class="step-icon">' + x[0] + '</div><h3>' + x[1] + '</h3><p>' + x[2] + '</p></div>';
    }).join('') +
    '</div></div></section>' +

    '<section class="section"><div class="container">' +
    '<div class="section-head"><div><h2>What customers say</h2></div></div>' +
    '<div class="grid grid-3">' + testis.map(function (t) {
      return '<div class="card testimonial">' + starsHTML(5) + '<p>“' + t.t + '”</p><div class="who">' + t.who + '</div></div>';
    }).join('') + '</div>' +
    '</div></section>' +

    '<section class="cta"><div class="container">' +
    '<h2>Ready to eat fresh?</h2>' +
    '<p>Browse this season’s harvest and support local farming communities across Karnataka.</p>' +
    '<a class="btn btn-gold" href="#/shop">Shop now</a>' +
    '</div></section>'
  );
}

function pageShop(q) {
  const result = queryProducts(q, 9);
  const catOptions = ['<option value="">All categories</option>'].concat(
    CATEGORIES.map((c) => '<option value="' + esc(c.slug) + '"' + (q.category === c.slug ? ' selected' : '') + '>' + esc(c.name) + '</option>')
  ).join('');
  const methodOptions = ['<option value="">All methods</option>'].concat(
    ['Organic', 'Natural / ZBNF', 'Conventional'].map((m) => '<option value="' + esc(m) + '"' + (q.method === m ? ' selected' : '') + '>' + esc(m) + '</option>')
  ).join('');

  const body = result.total
    ? '<div class="grid grid-3 grid-3-mobile">' + result.items.map(productCard).join('') + '</div>' + paginationHTML(result.page, result.pages)
    : emptyHTML('No products found', 'Try changing your filters or search terms.', { href: '#/shop', label: 'Clear filters' });

  return '<div class="container page">' +
    '<h1 class="page-title">Shop fresh produce</h1>' +
    '<p class="page-sub">Browse ' + PRODUCTS.length + ' products from ' + FARMERS.length + ' local farms</p>' +
    '<form class="shop-layout" id="shopFilters">' +
    '<aside class="card card-pad filter-panel">' +
    '<div class="field"><label class="field-label">Search</label><input class="input" name="q" value="' + esc(q.q || '') + '" placeholder="Product, farmer…" /></div>' +
    '<div class="field"><label class="field-label">Category</label><select class="input" name="category">' + catOptions + '</select></div>' +
    '<div class="field"><label class="field-label">Farming method</label><select class="input" name="method">' + methodOptions + '</select></div>' +
    '<div class="field"><label class="field-label">Location</label><input class="input" name="location" value="' + esc(q.location || '') + '" placeholder="e.g. Mandya" /></div>' +
    '<div class="field"><label class="field-label">Price (₹)</label><div style="display:flex;gap:.5rem"><input class="input" name="priceMin" type="number" min="0" value="' + esc(q.priceMin || '') + '" placeholder="Min" /><input class="input" name="priceMax" type="number" min="0" value="' + esc(q.priceMax || '') + '" placeholder="Max" /></div></div>' +
    '<div class="field"><label class="field-label">Sort by</label><select class="input" name="sort">' +
    [['', 'Newest'], ['popular', 'Popularity'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low'], ['rating', 'Top rated']].map(function (o) {
      return '<option value="' + o[0] + '"' + ((q.sort || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('') + '</select></div>' +
    '<button class="btn btn-primary btn-block btn-sm" type="submit">Apply filters</button>' +
    '</aside>' +
    '<div>' +
    '<div class="shop-toolbar"><span class="count">' + result.total + ' product' + (result.total === 1 ? '' : 's') + ' found</span>' +
    '<a class="link" href="#/shop">Reset</a></div>' +
    body +
    '</div></form></div>';
}

function pageProduct(id) {
  const p = findProduct(id);
  if (!p) return notFound();
  const f = findFarmer(p.farmerProfileId);
  const revs = reviewsFor(id);
  const related = relatedProducts(id, 4);

  const media = p.images && p.images[0]
    ? '<img class="detail-img" src="' + esc(p.images[0]) + '" alt="' + esc(p.name) + '" />'
    : '<div class="detail-img-fallback">🥬</div>';

  return '<div class="container page">' +
    '<div class="crumbs"><a href="#/">Home</a> / <a href="#/shop">Shop</a> / <a href="#/shop?category=' + esc(p.categorySlug) + '">' + esc(p.categoryName) + '</a> / ' + esc(p.name) + '</div>' +
    '<div class="detail-grid">' +
    '<div class="card" style="padding:1rem">' + media + '</div>' +
    '<div>' +
    '<div class="detail-badges">' + methodBadge(p.farmingMethod) +
    '<span class="badge ' + (p.stockQuantity > 0 ? 'badge-green' : 'badge-red') + '">' + (p.stockQuantity > 0 ? 'In stock' : 'Out of stock') + '</span>' +
    '</div>' +
    '<h1>' + esc(p.name) + '</h1>' +
    starsHTML(p.ratingAvg, p.ratingCount) +
    '<div class="detail-price">' + money(p.price) + ' <span>/ ' + esc(p.unit) + '</span></div>' +
    '<p class="detail-desc">' + esc(p.description) + '</p>' +
    '<div class="detail-facts">' +
    '<div>Origin: ' + esc(p.origin) + '</div>' +
    '<div>Harvested: ' + new Date(p.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + '</div>' +
    '<div>Available stock: ' + p.stockQuantity + ' ' + esc(p.unit) + '</div>' +
    '<div>Category: ' + esc(p.categoryName) + '</div>' +
    '</div>' +
    (p.certificationDetails ? '<div class="cert-note">📜 ' + esc(p.certificationDetails) + '</div>' : '') +
    (f ? '<div class="farmer-strip">' +
      (f.farmImage ? '<img src="' + esc(f.farmImage) + '" alt="" />' : '<div class="ph">🚜</div>') +
      '<div class="info"><strong>' + esc(f.farmName) + '</strong><small>' + esc(f.farmerName) + ' · ' + esc(f.village) + ', ' + esc(f.district) + '</small></div>' +
      '<a class="btn btn-outline btn-sm" href="#/farmers/' + esc(f.id) + '">View farm</a></div>' : '') +
    '</div></div>' +

    '<section class="section" style="padding-bottom:0"><div class="section-head"><div><h2>Customer reviews</h2></div></div>' +
    (revs.length
      ? '<div class="grid grid-3 grid-3-mobile">' + revs.map(reviewCard).join('') + '</div>'
      : emptyHTML('No reviews yet', 'Be the first to review this product.')) +
    '</section>' +

    (related.length ? '<section class="section"><div class="section-head"><div><h2>You may also like</h2></div></div>' +
      '<div class="grid grid-4 grid-3-mobile">' + related.map(productCard).join('') + '</div></section>' : '') +
    '</div>';
}

function pageCategories() {
  return '<div class="container page">' +
    '<h1 class="page-title">Categories</h1>' +
    '<p class="page-sub">Browse produce by farm category</p>' +
    '<div class="grid grid-6">' + CATEGORIES.map(categoryCard).join('') + '</div>' +
    '<section class="section"><div class="section-head"><div><h2>All products</h2></div><a class="link" href="#/shop">Shop →</a></div>' +
    '<div class="grid grid-4 grid-3-mobile">' + PRODUCTS.slice(0, 8).map(productCard).join('') + '</div>' +
    '</section></div>';
}

function pageFarmers(q) {
  const result = queryFarmers(q, 9);
  const methodOptions = ['<option value="">All methods</option>'].concat(
    ['Organic', 'Natural / ZBNF', 'Conventional'].map((m) => '<option value="' + esc(m) + '"' + (q.method === m ? ' selected' : '') + '>' + esc(m) + '</option>')
  ).join('');

  return '<div class="container page">' +
    '<h1 class="page-title">Our farmers</h1>' +
    '<p class="page-sub">Local growers you can trust</p>' +
    '<form id="farmerFilters" class="shop-toolbar" style="margin-bottom:1.5rem">' +
    '<input class="input" name="q" value="' + esc(q.q || '') + '" placeholder="Search farms, crops…" style="max-width:280px" />' +
    '<input class="input" name="location" value="' + esc(q.location || '') + '" placeholder="District (e.g. Mandya)" style="max-width:200px" />' +
    '<select class="input" name="method" style="max-width:180px">' + methodOptions + '</select>' +
    '<button class="btn btn-primary btn-sm" type="submit">Search</button>' +
    '</form>' +
    (result.total
      ? '<div class="grid grid-3 grid-3-mobile">' + result.items.map(farmerCard).join('') + '</div>' + paginationHTML(result.page, result.pages)
      : emptyHTML('No farmers found', 'Try different search terms.', { href: '#/farmers', label: 'Clear filters' })) +
    '</div>';
}

function pageFarmer(id) {
  const f = findFarmer(id);
  if (!f) return notFound();
  const prods = farmerProducts(id);
  const revs = REVIEWS.filter((r) => prods.some((p) => p._id === r.productId)).slice(0, 3);

  return '<div class="container page">' +
    '<div class="crumbs"><a href="#/">Home</a> / <a href="#/farmers">Farmers</a> / ' + esc(f.farmName) + '</div>' +
    '<div class="card" style="display:grid;gap:0">' +
    (f.farmImage ? '<img src="' + esc(f.farmImage) + '" alt="' + esc(f.farmName) + '" style="width:100%;height:240px;object-fit:cover" />' : '') +
    '<div class="card-pad">' +
    '<h1 class="page-title">' + esc(f.farmName) + '</h1>' +
    '<p class="page-sub">' + esc(f.farmerName) + ' · ' + esc(f.village) + ', ' + esc(f.district) + ', ' + esc(f.state) + '</p>' +
    '<div style="display:flex;gap:.5rem;margin:.5rem 0 1rem">' + methodBadge(f.farmingMethod) +
    starsHTML(f.ratingAvg, f.ratingCount) + '</div>' +
    '<p style="font-size:.9rem">' + esc(f.farmDescription) + '</p>' +
    '<p style="margin-top:.75rem;font-size:.85rem;color:var(--muted)"><strong>Crops:</strong> ' + esc(f.cropTypes.join(', ')) + '</p>' +
    '</div></div>' +
    '<section class="section"><div class="section-head"><div><h2>Products from this farm</h2></div></div>' +
    (prods.length
      ? '<div class="grid grid-4 grid-3-mobile">' + prods.map(productCard).join('') + '</div>'
      : emptyHTML('No products listed yet', 'Check back soon.')) +
    '</section>' +
    (revs.length ? '<section class="section" style="padding-top:0"><div class="section-head"><div><h2>Recent reviews</h2></div></div>' +
      '<div class="grid grid-3">' + revs.map(reviewCard).join('') + '</div></section>' : '') +
    '</div>';
}

function pageAbout() {
  return '<div class="container page prose">' +
    '<h1>About Krishi Market</h1>' +
    '<p>Krishi Market is a farmer-to-consumer agricultural marketplace. Its purpose is simple: let farmers sell their harvest directly to the people who eat it, at fair prices on both sides.</p>' +
    '<h2>Why we exist</h2>' +
    '<p>Traditional supply chains pass a product through many hands before it reaches a kitchen. Each hand adds cost and loses freshness. By connecting farms and customers directly, we keep more value with the grower and more freshness with the buyer.</p>' +
    '<h2>What you’ll find here</h2>' +
    '<p>Seasonal vegetables, fruits, dairy, grains and pulses from small and mid-size farms across Karnataka — each listing showing its farmer, farm location, farming method and harvest date.</p>' +
    '<h2>Our promise</h2>' +
    '<p>Transparent sourcing, fair pricing, and honest reviews from real customers. This is a demonstration project; all content is illustrative.</p>' +
    '</div>';
}

function pageHowItWorks() {
  const steps = [
    ['🔍', 'Browse & discover', 'Explore products by category, farm, or farming method. Every listing shows who grew it and where.'],
    ['🛒', 'Place your order', 'Pick fresh produce and order directly — no brokers between you and the farm.'],
    ['🚜', 'Farm prepares & ships', 'The farmer harvests, packs and dispatches your order, often within a day.'],
    ['📦', 'Delivered fresh', 'Produce reaches you in days, not weeks — with the flavour still intact.'],
  ];
  return '<div class="container page">' +
    '<h1 class="page-title">How it works</h1>' +
    '<p class="page-sub">From farm to kitchen in four simple steps</p>' +
    '<div class="grid grid-4 grid-3-mobile">' + steps.map(function (s) {
      return '<div class="card step-card"><div class="step-icon">' + s[0] + '</div><h3>' + s[1] + '</h3><p>' + s[2] + '</p></div>';
    }).join('') + '</div>' +
    '<section class="section"><div class="grid grid-3">' +
    '<div class="feature"><span class="icon">✓</span><div><h3>Fair for farmers</h3><p>Farmers set their own prices and keep the majority of what you pay.</p></div></div>' +
    '<div class="feature"><span class="icon">✓</span><div><h3>Traceable produce</h3><p>Every product page shows its farm, origin and harvest date.</p></div></div>' +
    '<div class="feature"><span class="icon">✓</span><div><h3>Honest reviews</h3><p>Only verified customers can leave a review.</p></div></div>' +
    '</div></section>' +
    '<div style="text-align:center"><a class="btn btn-primary" href="#/shop">Start shopping</a></div>' +
    '</div>';
}

function pageFaq() {
  const faqs = [
    ['How does Krishi Market work?', 'Farmers list their produce with price, stock and harvest details. Customers browse, order, and the farmer prepares and ships the order directly.'],
    ['Is the produce really farm-fresh?', 'Yes — listings show the harvest date, and most orders ship within a day or two of harvest.'],
    ['What does “Organic” mean on a listing?', 'The farmer certifies that the crop was grown without synthetic pesticides or fertilisers. Look for the green badge on product pages.'],
    ['How are farmers paid?', 'Farmers set their own prices and receive the majority of the sale value directly.'],
    ['Can I trust the reviews?', 'Reviews can only come from verified customers who purchased that product.'],
    ['Which regions do you serve?', 'This demo currently focuses on farms across Karnataka — Mandya, Mysuru, Kolar and Bengaluru Rural.'],
  ];
  return '<div class="container page" style="max-width:48rem">' +
    '<h1 class="page-title">Help & FAQs</h1>' +
    '<p class="page-sub">Answers to common questions</p>' +
    faqs.map(function (f) {
      return '<div class="faq-item"><button class="faq-q">' + esc(f[0]) + '<span class="chev">▾</span></button><div class="faq-a">' + esc(f[1]) + '</div></div>';
    }).join('') +
    '<div style="margin-top:2rem"><a class="btn btn-outline" href="#/contact">Contact us</a></div>' +
    '</div>';
}

function pageContact() {
  return '<div class="container page">' +
    '<h1 class="page-title">Contact us</h1>' +
    '<p class="page-sub">Questions, feedback or partnership ideas — we’d love to hear from you</p>' +
    '<div class="contact-grid">' +
    '<div>' +
    '<ul class="contact-info">' +
    '<li><span class="ic">✉️</span> support@krishimarket.example</li>' +
    '<li><span class="ic">📍</span> Bengaluru, Karnataka, India</li>' +
    '<li><span class="ic">📞</span> +91 98765 43210 (Mon–Sat, 9am–6pm)</li>' +
    '</ul>' +
    '<p style="font-size:.85rem;color:var(--muted)">This is a demonstration site — messages are not actually sent anywhere.</p>' +
    '</div>' +
    '<form class="card form-card" id="contactForm" novalidate>' +
    '<div id="formSuccess"></div>' +
    '<div class="field"><label class="field-label" for="cfName">Name</label><input class="input" id="cfName" name="name" required /><div class="error-text" data-err="name"></div></div>' +
    '<div class="field"><label class="field-label" for="cfEmail">Email</label><input class="input" id="cfEmail" name="email" type="email" required /><div class="error-text" data-err="email"></div></div>' +
    '<div class="field"><label class="field-label" for="cfMsg">Message</label><textarea class="input" id="cfMsg" name="message" required></textarea><div class="error-text" data-err="message"></div></div>' +
    '<button class="btn btn-primary btn-block" type="submit">Send message</button>' +
    '</form></div></div>';
}

function notFound() {
  return '<div class="container page">' +
    emptyHTML('Page not found', 'The page you’re looking for doesn’t exist.', { href: '#/', label: 'Back home' }) +
    '</div>';
}

// ---- router ----

function setActiveNav(name) {
  document.querySelectorAll('.main-nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === name);
  });
}

function render() {
  const { path, segments, q } = parseHash();
  const root = segments[0] || '';
  let html = '';

  switch (root) {
    case '':
      html = pageHome(); setActiveNav('home'); break;
    case 'shop':
      html = pageShop(q); setActiveNav('shop'); break;
    case 'product':
      html = pageProduct(segments[1]); setActiveNav('shop'); break;
    case 'categories':
      html = pageCategories(); setActiveNav('categories'); break;
    case 'farmers':
      html = segments[1] ? pageFarmer(segments[1]) : pageFarmers(q);
      setActiveNav('farmers'); break;
    case 'about':
      html = pageAbout(); setActiveNav('about'); break;
    case 'how-it-works':
      html = pageHowItWorks(); setActiveNav('how'); break;
    case 'faq':
      html = pageFaq(); setActiveNav(''); break;
    case 'contact':
      html = pageContact(); setActiveNav('contact'); break;
    default:
      html = notFound(); setActiveNav('');
  }

  app.innerHTML = html;
  window.scrollTo(0, 0);
  document.getElementById('mainNav').classList.remove('open');
  bindPageEvents(q, segments);
}

// ---- page-level event binding ----

function bindPageEvents(q, segments) {
  const hero = document.getElementById('heroSearch');
  if (hero) {
    hero.addEventListener('submit', function (e) {
      e.preventDefault();
      const v = new FormData(hero).get('q');
      location.hash = '#/shop' + (v ? '?q=' + encodeURIComponent(v) : '');
    });
  }

  const shop = document.getElementById('shopFilters');
  if (shop) {
    shop.addEventListener('submit', function (e) {
      e.preventDefault();
      const params = new URLSearchParams();
      new FormData(shop).forEach(function (v, k) { if (v) params.set(k, v); });
      const s = params.toString();
      location.hash = '#/shop' + (s ? '?' + s : '');
    });
    shop.querySelectorAll('button[data-goto]').forEach(function (b) {
      b.addEventListener('click', function () {
        const params = new URLSearchParams(location.hash.split('?')[1] || '');
        params.set('page', b.dataset.goto);
        location.hash = '#/shop?' + params.toString();
      });
    });
  }

  const farmers = document.getElementById('farmerFilters');
  if (farmers) {
    farmers.addEventListener('submit', function (e) {
      e.preventDefault();
      const params = new URLSearchParams();
      new FormData(farmers).forEach(function (v, k) { if (v) params.set(k, v); });
      const s = params.toString();
      location.hash = '#/farmers' + (s ? '?' + s : '');
    });
  }

  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.parentElement.classList.toggle('open');
    });
  });

  const contact = document.getElementById('contactForm');
  if (contact) {
    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(contact));
      let ok = true;
      contact.querySelectorAll('[data-err]').forEach(function (el) { el.textContent = ''; });
      if (!data.name || !data.name.trim()) { contact.querySelector('[data-err="name"]').textContent = 'Name is required'; ok = false; }
      if (!data.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) { contact.querySelector('[data-err="email"]').textContent = 'A valid email is required'; ok = false; }
      if (!data.message || !data.message.trim()) { contact.querySelector('[data-err="message"]').textContent = 'Message is required'; ok = false; }
      if (!ok) return;
      contact.reset();
      document.getElementById('formSuccess').innerHTML = '<div class="success-box">✅ Thanks! Your message has been received (demo only — nothing was sent).</div>';
    });
  }
}

// ---- init ----

document.getElementById('navToggle').addEventListener('click', function () {
  document.getElementById('mainNav').classList.toggle('open');
});

document.getElementById('year').textContent = new Date().getFullYear();

window.addEventListener('hashchange', render);
render();
