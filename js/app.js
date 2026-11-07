// Krishi Market — hash router + page renderers (no framework, no build)

const app = document.getElementById('app');

// ---- cart (localStorage, demo only) ----

const CART_KEY = 'krishi-cart-v1';
const DELIVERY_FEE = 39;
const FREE_DELIVERY_OVER = 499;
// Demo serviceable PIN codes (illustrative only — no real logistics partner).
const DELIVERY_PINS = ['560001', '560041', '560102', '560066', '570011', '570023', '571401', '571402', '560034', '560076'];

// Fallback for browsers/file contexts where localStorage is unavailable.
let cartFallback = null;

function cartStorageGet() {
  try { return localStorage.getItem(CART_KEY); } catch (e) { return null; }
}

function cartStorageSet(json) {
  try { localStorage.setItem(CART_KEY, json); return true; } catch (e) { return false; }
}

function cartStorageRemove() {
  try { localStorage.removeItem(CART_KEY); } catch (e) { /* storage unavailable */ }
}

// Accept only real products, clamp quantities to stock and merge duplicates.
function normalizeCart(raw) {
  if (!Array.isArray(raw)) return [];
  const merged = Object.create(null);
  raw.forEach(function (line) {
    if (!line || typeof line !== 'object') return;
    const id = String(line.id || line.productId || '');
    if (!id) return;
    const p = findProduct(id);
    if (!p) return;
    const max = Math.max(0, Math.floor(Number(p.stockQuantity) || 0));
    if (!max || p.availabilityStatus === 'out_of_stock') return;
    const qty = Math.floor(Number(line.qty));
    if (!isFinite(qty) || qty <= 0) return;
    merged[id] = Math.min((merged[id] || 0) + qty, max);
  });
  return Object.keys(merged).map(function (id) { return { id: id, qty: merged[id] }; });
}

function readCart() {
  if (cartFallback !== null) return normalizeCart(cartFallback);
  const raw = cartStorageGet();
  if (!raw) return [];
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch (e) { cartStorageRemove(); return []; }
  const lines = normalizeCart(parsed);
  // Persist a cleaned copy when the stored data had invalid or over-stock lines.
  try {
    if (JSON.stringify(lines) !== JSON.stringify(parsed)) cartStorageSet(JSON.stringify(lines));
  } catch (e) { /* ignore */ }
  return lines;
}

function writeCart(lines) {
  const clean = normalizeCart(lines);
  cartFallback = null;
  if (!cartStorageSet(JSON.stringify(clean))) {
    cartFallback = clean.map(function (line) { return { id: line.id, qty: line.qty }; });
  }
  updateCartBadge();
}

function cartLines() {
  return readCart().map(function (line) {
    const product = findProduct(line.id);
    if (!product) return null;
    return { product: product, qty: line.qty, lineTotal: (Number(product.price) || 0) * line.qty };
  }).filter(Boolean);
}

function cartCount() {
  return readCart().reduce(function (n, line) { return n + line.qty; }, 0);
}

function cartSubtotal() {
  return cartLines().reduce(function (n, line) { return n + line.lineTotal; }, 0);
}

// Returns { ok, added, capped, max, product } so callers can explain stock limits.
function addToCart(id, qty) {
  const p = findProduct(id);
  const max = p ? Math.max(0, Math.floor(Number(p.stockQuantity) || 0)) : 0;
  if (!p || max <= 0 || p.availabilityStatus === 'out_of_stock') {
    return { ok: false, reason: 'out', product: p };
  }
  const lines = readCart();
  const found = lines.find(function (line) { return line.id === id; });
  const inCart = found ? found.qty : 0;
  const available = max - inCart;
  if (available <= 0) return { ok: false, reason: 'max', product: p, max: max };
  const wanted = Math.max(1, Math.floor(Number(qty) || 1));
  const added = Math.min(wanted, available);
  if (found) found.qty = inCart + added;
  else lines.push({ id: id, qty: added });
  writeCart(lines);
  return { ok: true, added: added, capped: added < wanted, max: max, product: p };
}

function setCartQty(id, qty) {
  const p = findProduct(id);
  if (!p) return;
  const lines = readCart();
  const index = lines.findIndex(function (line) { return line.id === id; });
  if (index < 0) return;
  const next = Math.floor(Number(qty) || 0);
  if (next <= 0) lines.splice(index, 1);
  else lines[index].qty = Math.min(next, Math.max(1, Math.floor(Number(p.stockQuantity) || 1)));
  writeCart(lines);
}

function removeFromCart(id) {
  writeCart(readCart().filter(function (line) { return line.id !== id; }));
}

function updateCartBadge() {
  const badge = document.getElementById('cartCount');
  const link = document.getElementById('cartLink');
  if (!badge) return;
  const n = cartCount();
  badge.textContent = n > 99 ? '99+' : String(n);
  badge.hidden = n === 0;
  if (link) link.setAttribute('aria-label', n ? 'Cart, ' + n + ' item' + (n === 1 ? '' : 's') : 'Cart, empty');
}

let toastTimer = null;
function toast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2600);
}

// ---- page titles ----

const PAGE_TITLES = {
  '': 'Krishi Market — Farmer-to-Consumer Agri Marketplace',
  shop: 'Shop fresh produce — Krishi Market',
  categories: 'Categories — Krishi Market',
  farmers: 'Our farmers — Krishi Market',
  about: 'About — Krishi Market',
  'how-it-works': 'How it works — Krishi Market',
  faq: 'Help & FAQs — Krishi Market',
  contact: 'Contact — Krishi Market',
  cart: 'Your cart — Krishi Market',
  farmer: 'Farmer dashboard — Krishi Market',
};

const PAGE_DESCRIPTIONS = {
  '': 'Browse fresh, traceable produce from local Karnataka farmers — a front-end demonstration marketplace.',
  shop: 'Search and filter fresh vegetables, fruits, dairy and grains from local Karnataka farms.',
  categories: 'Explore Krishi Market produce categories — vegetables, fruits, dairy, grains, organic and herbs.',
  farmers: 'Meet the local farms behind Krishi Market produce and browse their listings.',
  about: 'Learn how Krishi Market connects Karnataka farmers directly with customers.',
  'how-it-works': 'See how Krishi Market takes produce from farm to kitchen in four simple steps.',
  faq: 'Answers to common questions about the Krishi Market demonstration marketplace.',
  contact: 'Contact the Krishi Market demo project — messages are simulated and not sent.',
  cart: 'Review your cart, check demo delivery availability and place a simulated order.',
  farmer: 'Demo farmer dashboard: register a farm, list products, manage stock and track orders.',
};

function setPageTitle(root, segments) {
  let title = PAGE_TITLES[root];
  let description = PAGE_DESCRIPTIONS[root];
  if (root === 'product') {
    const p = findProduct(segments[1]);
    title = (p ? p.name : 'Product not found') + ' — Krishi Market';
    description = p ? p.description : 'Product not found in the Krishi Market demo.';
  } else if (root === 'farmers' && segments[1]) {
    const f = findFarmer(segments[1]);
    title = (f ? f.farmName : 'Farmer not found') + ' — Krishi Market';
    description = f ? f.farmDescription : 'Farmer not found in the Krishi Market demo.';
  } else if (root === 'farmer') {
    if (segments[1] === 'register') {
      title = 'Farmer registration — Krishi Market';
      description = 'Demo farm registration form — details are stored only in this browser.';
    } else if (segments[1] === 'products') {
      title = 'Product management — Krishi Market';
      description = 'Demo product management for your farm listing.';
    } else if (segments[1] === 'orders') {
      title = 'Farmer orders — Krishi Market';
      description = 'Simulated demo orders and status updates for your farm.';
    } else {
      title = 'Farmer dashboard — Krishi Market';
    }
  }

  document.title = title || 'Krishi Market';
  const meta = document.getElementById('metaDescription');
  if (meta && description) meta.setAttribute('content', description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogTitle) ogTitle.setAttribute('content', title || 'Krishi Market');
  if (ogDesc && description) ogDesc.setAttribute('content', description);
  return title || 'Krishi Market';
}

let lastOrder = null;


// ---- utils ----

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function money(n) {
  const value = Number(n);
  return '₹' + (isFinite(value) ? value : 0).toLocaleString('en-IN');
}

function starsHTML(avg, count) {
  const value = Math.min(5, Math.max(0, Number(avg) || 0));
  const full = Math.round(value);
  const row = '★'.repeat(full) + '☆'.repeat(5 - full);
  return '<span class="stars"><span class="row" aria-hidden="true">' + row + '</span> ' +
    '<span class="sr-only">Rated ' + value.toFixed(1) + ' out of 5</span>' +
    esc(value.toFixed(1)) + (count != null ? ' (' + Number(count || 0) + ')' : '') + '</span>';
}

function methodBadge(method) {
  if (method === 'Organic') return '<span class="badge badge-green">Organic</span>';
  if (method === 'Natural / ZBNF') return '<span class="badge badge-blue">Natural / ZBNF</span>';
  return '<span class="badge badge-gray">Conventional</span>';
}

// Used when a product/farm photo fails to load or uses an unsupported format.
const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">' +
  '<rect width="640" height="480" fill="#f2efe6"/>' +
  '<text x="320" y="248" font-family="Inter, sans-serif" font-size="26" fill="#6b726a" text-anchor="middle">Image unavailable</text>' +
  '</svg>'
);

// Build a shop URL with one filter removed (used by chips and the clear-search button).
function shopFilterHref(q, omitKey) {
  const params = new URLSearchParams();
  Object.keys(q).forEach(function (key) {
    if (key !== omitKey && key !== 'page' && q[key]) params.set(key, q[key]);
  });
  const s = params.toString();
  return '#/shop' + (s ? '?' + s : '');
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
  const out = p.stockQuantity === 0 || p.availabilityStatus === 'out_of_stock';
  const lowStock = !out && p.stockQuantity <= 10;
  const alt = p.name + (p.farmerName ? ' from ' + p.farmerName : '');
  const badges = methodBadge(p.farmingMethod) +
    (out ? '<span class="badge badge-red">Out of stock</span>' : '') +
    (lowStock ? '<span class="badge badge-gold">Only ' + p.stockQuantity + ' left</span>' : '');
  const media = p.images && p.images[0]
    ? '<div class="product-media"><a href="#/product/' + esc(p._id) + '" aria-label="View ' + esc(p.name) + '"><img src="' + esc(p.images[0]) + '" alt="' + esc(alt) + '" width="640" height="480" loading="lazy" /></a>' +
      '<div class="product-badges">' + badges + '</div></div>'
    : '<div class="product-media"><a href="#/product/' + esc(p._id) + '" aria-label="View ' + esc(p.name) + '"><div class="product-fallback" role="img" aria-label="' + esc(alt) + '">🥬</div></a>' +
      '<div class="product-badges">' + badges + '</div></div>';

  return '<div class="card product-card">' + media +
    '<div class="product-body">' +
    '<a class="product-title" href="#/product/' + esc(p._id) + '">' + esc(p.name) + '</a>' +
    '<div class="product-meta">Farmer: <a class="link" href="#/farmers/' + esc(p.farmerProfileId) + '">' + esc(p.farmerName) + '</a> · ' + esc(p.categoryName) + '</div>' +
    '<div class="product-meta" style="margin-top:.15rem">' + starsHTML(p.ratingAvg, p.ratingCount) + '</div>' +
    '<div class="product-price">' + money(p.price) + ' <span>/ ' + esc(p.unit) + '</span></div>' +
    '<div class="product-actions">' +
    (out
      ? '<button class="btn btn-outline btn-sm btn-block" type="button" disabled>Out of stock</button>'
      : '<button class="btn btn-primary btn-sm btn-block" type="button" data-add="' + esc(p._id) + '" aria-label="Add ' + esc(p.name) + ' to cart">Add to cart</button>') +
    '</div>' +
    '</div></div>';
}

function farmerCard(f) {
  const img = f.farmImage
    ? '<img src="' + esc(f.farmImage) + '" alt="Farm photo of ' + esc(f.farmName) + '" width="640" height="360" loading="lazy" />'
    : '<div class="farmer-fallback" role="img" aria-label="Illustration for ' + esc(f.farmName) + '">🚜</div>';
  const approval = (f.approvalStatus && f.approvalStatus !== 'approved')
    ? ' <span class="badge badge-gold">' + esc(APPROVAL_LABELS[f.approvalStatus] || 'Pending') + ' (demo)</span>'
    : '';
  const crops = Array.isArray(f.cropTypes) ? f.cropTypes.join(', ') : '';
  return '<div class="card farmer-card">' + img +
    '<div class="farmer-card-body">' +
    '<h3><a href="#/farmers/' + esc(f.id) + '">' + esc(f.farmName) + '</a></h3>' +
    '<p class="product-meta">' + esc(f.village) + ', ' + esc(f.district) + '</p>' +
    (crops ? '<p class="product-meta">Crops: ' + esc(crops) + '</p>' : '') +
    '<p style="font-size:.8rem;color:var(--muted);margin-top:.4rem">' + esc(f.farmDescription) + '</p>' +
    '<div class="farmer-row">' + starsHTML(f.ratingAvg, f.ratingCount) + methodBadge(f.farmingMethod) + '</div>' +
    (approval ? '<div style="margin-top:.4rem">' + approval + '</div>' : '') +
    '</div></div>';
}

function categoryCard(c) {
  const count = PRODUCTS.filter((p) => p.categoryId === c._id).length;
  const media = c.image
    ? '<img src="' + esc(c.image) + '" alt="' + esc(c.name) + ' category" width="112" height="112" loading="lazy" />'
    : '<div class="cat-emoji" role="img" aria-label="' + esc(c.name) + '">📦</div>';
  return '<a href="#/shop?category=' + esc(c.slug) + '"><div class="card cat-card">' + media +
    '<span class="name">' + esc(c.name) + '</span><span class="count">' + count + ' item' + (count === 1 ? '' : 's') + '</span></div></a>';
}

function reviewCard(r) {
  const d = new Date(r.createdAt);
  const date = isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return '<div class="card review-card">' +
    '<div class="review-top">' + starsHTML(r.rating) +
    (r.verifiedPurchase ? '<span class="badge badge-green">Verified (demo)</span>' : '') + '</div>' +
    '<p class="review-text">“' + esc(r.comment) + '”</p>' +
    '<div class="review-meta">' + esc(r.customerName) + ' · ' + esc(date) +
    (r.demo ? ' · <span class="badge badge-gray">Sample review</span>' : '') + '</div>' +
    '</div>';
}

function paginationHTML(page, pages) {
  if (pages <= 1) return '';
  let html = '<nav class="pagination" aria-label="Pagination">';
  html += '<button type="button" data-goto="' + (page - 1) + '" aria-label="Previous page"' + (page <= 1 ? ' disabled' : '') + '>‹ Prev</button>';
  for (let i = 1; i <= pages; i++) {
    html += '<button type="button" data-goto="' + i + '"' +
      (i === page ? ' class="current" aria-current="page"' : ' aria-label="Page ' + i + '"') + '>' + i + '</button>';
  }
  html += '<button type="button" data-goto="' + (page + 1) + '" aria-label="Next page"' + (page >= pages ? ' disabled' : '') + '>Next ›</button></nav>';
  return html;
}

function emptyHTML(title, body, cta) {
  return '<div class="empty"><h3>' + esc(title) + '</h3><p>' + esc(body) + '</p>' +
    (cta ? '<a class="btn btn-outline" href="' + esc(cta.href) + '">' + esc(cta.label) + '</a>' : '') + '</div>';
}

// ---- farmer portal components ----

function approvalBadge(status) {
  const map = { approved: 'badge-green', pending: 'badge-gold', rejected: 'badge-red' };
  return '<span class="badge ' + (map[status] || 'badge-gray') + '">' + esc(APPROVAL_LABELS[status] || status) + '</span>';
}

function orderStatusBadge(status) {
  const map = { placed: 'badge-blue', packed: 'badge-gold', shipped: 'badge-blue', delivered: 'badge-green', cancelled: 'badge-red' };
  return '<span class="badge ' + (map[status] || 'badge-gray') + '">' + esc(ORDER_STATUS_LABELS[status] || status) + '</span>';
}

function paymentLabel(payment) {
  return payment === 'upi' ? 'UPI (demo)' : 'Cash on delivery';
}

function shortDate(iso) {
  const d = new Date(iso);
  if (!iso || isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function longDate(iso) {
  const d = new Date(iso);
  if (!iso || isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function statCard(label, value, foot) {
  return '<div class="card stat-card"><span class="stat-label">' + esc(label) + '</span>' +
    '<strong class="stat-value">' + esc(value) + '</strong>' +
    '<span class="stat-foot">' + esc(foot) + '</span></div>';
}

let draftImages = [];

function imagePreviewsHTML() {
  if (!draftImages.length) return '<p class="summary-note">No photos yet — a category photo will be used as a fallback.</p>';
  return '<div class="img-previews">' + draftImages.map(function (src, i) {
    return '<div class="img-preview">' +
      '<img src="' + esc(src) + '" alt="Product photo ' + (i + 1) + '" />' +
      '<button type="button" class="img-remove" data-img-remove="' + i + '" aria-label="Remove photo ' + (i + 1) + '">×</button>' +
      '</div>';
  }).join('') + '</div>';
}

// Read an image file, downscale it and return a compressed data URL.
function compressImage(file, done) {
  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = function () {
      const max = 700;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      try { done(canvas.toDataURL('image/jpeg', 0.72)); }
      catch (e) { done(reader.result); }
    };
    img.onerror = function () { done(null); };
    img.src = reader.result;
  };
  reader.onerror = function () { done(null); };
  reader.readAsDataURL(file);
}

function farmerOnboarding() {
  return '<div class="container page">' +
    '<div class="onboard">' +
    '<div>' +
    '<p class="eyebrow">Farmer portal</p>' +
    '<h1 class="page-title">Sell your harvest directly to customers</h1>' +
    '<p class="page-sub" style="max-width:34rem">Register your farm, list produce with photos and prices, and track orders — everything is stored in this browser for the demo.</p>' +
    '<ul class="onboard-list">' +
    '<li>🌱 Add products with photos, prices and stock</li>' +
    '<li>📦 See every order that includes your produce</li>' +
    '<li>🚚 Update delivery statuses and review demo earnings</li>' +
    '</ul>' +
    '<div class="hero-actions">' +
    '<a class="btn btn-primary" href="#/farmer/register">Register your farm</a>' +
    '<button class="btn btn-outline" type="button" data-demo-farm>Explore demo dashboard</button>' +
    '</div>' +
    '<p class="summary-note" style="margin-top:.75rem">Demo only — no real accounts, payments or deliveries.</p>' +
    '</div>' +
    '<div class="card onboard-preview">' +
    '<p class="eyebrow">Sample dashboard</p>' +
    '<div class="onboard-stats">' +
    '<div><strong>5</strong><span>Products</span></div>' +
    '<div><strong>3</strong><span>Orders</span></div>' +
    '<div><strong>₹4,680</strong><span>Earnings</span></div>' +
    '</div>' +
    '<div class="onboard-row"><span class="badge badge-green">Delivered</span><span class="pm-sub">#KM900012 · Priya S.</span></div>' +
    '<div class="onboard-row"><span class="badge badge-blue">Order placed</span><span class="pm-sub">#KM900013 · Arun K.</span></div>' +
    '<div class="onboard-row"><span class="badge badge-gold">Packed</span><span class="pm-sub">#KM900014 · Meena R.</span></div>' +
    '</div>' +
    '</div></div>';
}

function signInDemoFarmer() {
  const f = findFarmer('f1') || FARMERS[0];
  if (!f) return;
  // The seeded farmers list crop names (Tomato, Ragi) — the edit form needs
  // shop category names, so derive them from the farm's listings.
  const categories = [];
  farmerProducts(f.id).forEach(function (p) {
    if (p.categoryName && categories.indexOf(p.categoryName) < 0) categories.push(p.categoryName);
  });
  if (!categories.length) categories.push('Vegetables');
  const account = {
    id: f.id,
    farmerName: f.farmerName,
    phone: '9845012345',
    email: 'ramesh@krishimarket.example',
    farmName: f.farmName,
    village: f.village,
    district: f.district,
    state: f.state,
    farmDescription: f.farmDescription,
    categories: categories,
    farmingMethod: f.farmingMethod,
    approvalStatus: 'approved',
    farmImage: f.farmImage,
    registeredAt: new Date().toISOString(),
  };
  saveFarmerAccount(account);
  toast('Signed in to the demo farm');
  render();
}

function orderCardHTML(order, farmerId) {
  const items = orderItemsFor(order, farmerId);
  const earnings = orderTotalFor(order, farmerId);
  const c = order.customer || {};
  const statusOptions = ORDER_STATUSES.map(function (s) {
    return '<option value="' + s + '"' + (order.status === s ? ' selected' : '') + '>' + esc(ORDER_STATUS_LABELS[s]) + '</option>';
  }).join('');
  const history = (Array.isArray(order.statusHistory) ? order.statusHistory : [])
    .filter(function (h) { return h && ORDER_STATUS_LABELS[h.status]; });
  const timeline = history.length
    ? '<ul class="timeline" aria-label="Order status history">' + history.map(function (h, i) {
        return '<li class="' + (i === history.length - 1 ? 'current' : 'done') + '">' +
          esc(ORDER_STATUS_LABELS[h.status]) + ' · ' + esc(shortDate(h.at)) + '</li>';
      }).join('') + '</ul>'
    : '';

  return '<article class="card order-card">' +
    '<div class="order-card-head">' +
    '<div><span class="order-id">#' + esc(order.id) + '</span>' +
    '<span class="order-date">' + esc(longDate(order.placedAt)) + '</span>' +
    (order.demo ? ' <span class="badge badge-gray">Demo order</span>' : ' <span class="badge badge-gray">Checkout order</span>') + '</div>' +
    orderStatusBadge(order.status) +
    '</div>' +
    '<div class="order-card-body">' +
    '<div class="order-delivery">' +
    '<h4>Deliver to</h4>' +
    '<p><strong>' + esc(c.name || 'Customer') + '</strong></p>' +
    '<p>📞 ' + esc(c.phone || '—') + '</p>' +
    '<p>' + esc([c.address, c.city].filter(Boolean).join(', ')) + (c.pincode ? ' — ' + esc(c.pincode) : '') + '</p>' +
    '<p class="pm-sub">Payment: ' + esc(paymentLabel(order.payment)) + '</p>' +
    '</div>' +
    '<div class="order-items" tabindex="0" role="region" aria-label="Items in demo order ' + esc(order.id) + '">' +
    '<table class="data-table"><thead><tr><th scope="col">Item</th><th scope="col" class="num">Qty</th><th scope="col" class="num">Price</th><th scope="col" class="num">Total</th></tr></thead><tbody>' +
    items.map(function (i) {
      const price = Number(i.price) || 0;
      const qty = Number(i.qty) || 0;
      return '<tr><td>' + esc(i.name) + '</td><td class="num">' + qty + ' ' + esc(i.unit) + '</td>' +
        '<td class="num">' + money(price) + '</td><td class="num">' + money(price * qty) + '</td></tr>';
    }).join('') +
    '</tbody></table>' +
    '<div class="order-total">Your earnings (items only) <strong>' + money(earnings) + '</strong></div>' +
    '</div>' +
    '</div>' +
    timeline +
    '<div class="order-card-foot">' +
    '<label for="os-' + esc(order.id) + '">Update status' +
    '<select class="status-select" id="os-' + esc(order.id) + '" data-order-status="' + esc(order.id) + '">' + statusOptions + '</select>' +
    '</label>' +
    '<span class="summary-note">Simulated — the customer is not notified.</span>' +
    '</div></article>';
}

// ---- pages ----


function pageHome() {
  const q = queryProducts({}, 8);
  const testimonials = [
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
    '<img class="hero-img" src="images/tomato-pile.jpg" alt="Fresh produce at a farmers market" width="800" height="520" fetchpriority="high" />' +
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
     ['🧾', 'Sample reviews', 'Reviews and ratings are seeded demo data — no real purchase is verified.']].map(function (x) {
      return '<div class="card step-card"><div class="step-icon">' + x[0] + '</div><h3>' + x[1] + '</h3><p>' + x[2] + '</p></div>';
    }).join('') +
    '</div></div></section>' +

    '<section class="section"><div class="container">' +
    '<div class="section-head"><div><h2>What customers say</h2><p>Illustrative demo testimonials, not real customer accounts</p></div></div>' +
    '<div class="grid grid-3">' + testimonials.map(function (t) {
      return '<div class="card testimonial">' + starsHTML(5) + '<p>“' + esc(t.t) + '”</p><div class="who">' + esc(t.who) + ' · <span class="badge badge-gray">Demo</span></div></div>';
    }).join('') + '</div>' +
    '</div></section>' +

    '<section class="cta"><div class="container">' +
    '<h2>Ready to eat fresh?</h2>' +
    '<p>Browse this season’s harvest and support local farming communities across Karnataka.</p>' +
    '<a class="btn btn-gold" href="#/shop">Shop now</a>' +
    '</div></section>'
  );
}

function shopChips(q) {
  const chips = [];
  if (q.q) chips.push(['q', 'Search: ' + q.q]);
  if (q.category) {
    const c = CATEGORIES.find(function (x) { return x.slug === q.category; });
    chips.push(['category', c ? c.name : q.category]);
  }
  if (q.method) chips.push(['method', q.method]);
  if (q.location) chips.push(['location', 'Near ' + q.location]);
  if (q.availability === 'in_stock') chips.push(['availability', 'In stock']);
  if (q.availability === 'out_of_stock') chips.push(['availability', 'Out of stock']);
  if (q.priceMin !== '' && q.priceMin != null) chips.push(['priceMin', 'Min ' + money(q.priceMin)]);
  if (q.priceMax !== '' && q.priceMax != null) chips.push(['priceMax', 'Max ' + money(q.priceMax)]);
  const sortLabels = { popular: 'Popularity', price_asc: 'Price: low to high', price_desc: 'Price: high to low', rating: 'Top rated' };
  if (q.sort && sortLabels[q.sort]) chips.push(['sort', sortLabels[q.sort]]);
  if (!chips.length) return '';

  return '<div class="chips" aria-label="Active filters">' + chips.map(function (pair) {
    return '<a class="chip" href="' + esc(shopFilterHref(q, pair[0])) + '">' + esc(pair[1]) +
      ' <span class="x" aria-hidden="true">×</span><span class="sr-only">Remove filter</span></a>';
  }).join('') + '<a class="chip chip-clear" href="#/shop">Clear all</a></div>';
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
    : emptyHTML(
      q.q ? 'No products match “' + q.q + '”' : 'No products found',
      'Try changing your filters, widening the price range or searching for something else.',
      { href: '#/shop', label: 'Clear all filters' }
    );

  const searchClear = q.q
    ? '<a class="search-clear" href="' + esc(shopFilterHref(q, 'q')) + '" aria-label="Clear search">×</a>'
    : '';

  return '<div class="container page">' +
    '<h1 class="page-title">Shop fresh produce</h1>' +
    '<p class="page-sub">Browse ' + PRODUCTS.length + ' product' + (PRODUCTS.length === 1 ? '' : 's') +
    ' from ' + farmsWithProductsCount() + ' local farm' + (farmsWithProductsCount() === 1 ? '' : 's') + '</p>' +
    '<form class="shop-layout" id="shopFilters">' +
    '<aside class="card card-pad filter-panel" aria-label="Product filters">' +
    '<div class="field"><label class="field-label" for="fq">Search</label>' +
    '<div class="search-field"><input class="input" id="fq" name="q" type="search" value="' + esc(q.q || '') + '" placeholder="Product, farmer…" autocomplete="off" />' + searchClear + '</div></div>' +
    '<div class="field"><label class="field-label" for="fcat">Category</label><select class="input" id="fcat" name="category">' + catOptions + '</select></div>' +
    '<div class="field"><label class="field-label" for="fmethod">Farming method</label><select class="input" id="fmethod" name="method">' + methodOptions + '</select></div>' +
    '<div class="field"><label class="field-label" for="floc">Location</label><input class="input" id="floc" name="location" value="' + esc(q.location || '') + '" placeholder="e.g. Mandya" /></div>' +
    '<div class="field"><label class="field-label" for="favail">Availability</label><select class="input" id="favail" name="availability">' +
    '<option value="">All products</option>' +
    '<option value="in_stock"' + (q.availability === 'in_stock' ? ' selected' : '') + '>In stock only</option>' +
    '<option value="out_of_stock"' + (q.availability === 'out_of_stock' ? ' selected' : '') + '>Out of stock only</option>' +
    '</select></div>' +
    '<div class="field"><label class="field-label">Price (₹)</label><div style="display:flex;gap:.5rem"><input class="input" name="priceMin" type="number" min="0" inputmode="decimal" value="' + esc(q.priceMin || '') + '" placeholder="Min" aria-label="Minimum price" /><input class="input" name="priceMax" type="number" min="0" inputmode="decimal" value="' + esc(q.priceMax || '') + '" placeholder="Max" aria-label="Maximum price" /></div>' +
    '<p class="field-hint">Leave blank for no limit.</p></div>' +
    '<div class="field"><label class="field-label" for="fsort">Sort by</label><select class="input" id="fsort" name="sort">' +
    [['', 'Newest'], ['popular', 'Popularity'], ['price_asc', 'Price: low to high'], ['price_desc', 'Price: high to low'], ['rating', 'Top rated']].map(function (o) {
      return '<option value="' + o[0] + '"' + ((q.sort || '') === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('') + '</select></div>' +
    '<button class="btn btn-primary btn-block btn-sm" type="submit">Apply filters</button>' +
    '<a class="btn btn-outline btn-block btn-sm" href="#/shop" style="margin-top:.5rem">Reset filters</a>' +
    '</aside>' +
    '<div>' +
    '<div class="shop-toolbar"><span class="count" id="shopCount" aria-live="polite">' + result.total + ' product' + (result.total === 1 ? '' : 's') + ' found</span>' +
    '<div class="toolbar-actions">' +
    (q.q ? '<a class="link" href="' + esc(shopFilterHref(q, 'q')) + '">Clear search</a>' : '') +
    '<a class="link" href="#/shop">Reset</a></div></div>' +
    shopChips(q) +
    body +
    '</div></form></div>';
}

function productGallery(p) {
  const imgs = (p.images || []).filter(Boolean);
  if (!imgs.length) return '<div class="detail-img-fallback" role="img" aria-label="No product photo available">🥬</div>';
  const main = '<img class="detail-img" id="galleryMain" src="' + esc(imgs[0]) + '" alt="Photo of ' + esc(p.name) + '" width="800" height="600" />';
  if (imgs.length === 1) return '<div class="gallery">' + main + '</div>';
  return '<div class="gallery">' + main +
    '<div class="gallery-thumbs" role="group" aria-label="Product photos">' +
    imgs.map(function (src, i) {
      return '<button type="button" class="thumb' + (i === 0 ? ' active' : '') + '" data-thumb="' + esc(src) + '"' +
        ' aria-label="Show photo ' + (i + 1) + ' of ' + imgs.length + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' +
        '<img src="' + esc(src) + '" alt="" width="64" height="52" loading="lazy" /></button>';
    }).join('') + '</div></div>';
}

function pageProduct(id) {
  const p = findProduct(id);
  if (!p) return notFound();
  const f = findFarmer(p.farmerProfileId);
  const revs = reviewsFor(id);
  const related = relatedProducts(id, 4);
  const inStock = p.stockQuantity > 0 && p.availabilityStatus !== 'out_of_stock';
  const lowStock = inStock && p.stockQuantity <= 10;

  return '<div class="container page">' +
    '<div class="crumbs"><a href="#/">Home</a> / <a href="#/shop">Shop</a> / <a href="#/shop?category=' + esc(p.categorySlug) + '">' + esc(p.categoryName) + '</a> / ' + esc(p.name) + '</div>' +
    '<div class="detail-grid">' +
    '<div class="card" style="padding:1rem">' + productGallery(p) + '</div>' +
    '<div>' +
    '<div class="detail-badges">' + methodBadge(p.farmingMethod) +
    '<span class="badge ' + (inStock ? 'badge-green' : 'badge-red') + '">' + (inStock ? 'In stock' : 'Out of stock') + '</span>' +
    (lowStock ? '<span class="badge badge-gold">Only ' + p.stockQuantity + ' left</span>' : '') +
    '</div>' +
    '<h1>' + esc(p.name) + '</h1>' +
    starsHTML(p.ratingAvg, p.ratingCount) +
    '<div class="detail-price">' + money(p.price) + ' <span>/ ' + esc(p.unit) + '</span></div>' +
    (inStock
      ? '<div class="detail-buy">' +
        '<div class="qty" role="group" aria-label="Quantity">' +
        '<button type="button" data-detail-step="-1" aria-label="Decrease quantity">−</button>' +
        '<input id="detailQty" class="qty-input" type="number" min="1" max="' + p.stockQuantity + '" value="1" inputmode="numeric" aria-label="Quantity" aria-describedby="stockNote" />' +
        '<button type="button" data-detail-step="1" aria-label="Increase quantity">+</button>' +
        '</div>' +
        '<button class="btn btn-gold" type="button" data-add="' + p._id + '" data-qty-from="detailQty" aria-label="Add ' + esc(p.name) + ' to cart">Add to cart</button>' +
        '</div>' +
        '<p class="stock-note" id="stockNote">' + (lowStock ? 'Only ' + p.stockQuantity + ' ' + esc(p.unit) + ' left — order soon.' : p.stockQuantity + ' ' + esc(p.unit) + ' available.') + '</p>'
      : '<div class="detail-buy"><button class="btn btn-outline" type="button" disabled>Out of stock</button></div>' +
        '<p class="stock-note" id="stockNote">This product is currently unavailable.</p>') +
    '<p class="detail-desc">' + esc(p.description) + '</p>' +
    '<div class="detail-facts">' +
    '<div>Origin: ' + esc(p.origin) + '</div>' +
    '<div>Harvested: ' + esc(longDate(p.harvestDate)) + '</div>' +
    '<div>Available stock: ' + p.stockQuantity + ' ' + esc(p.unit) + '</div>' +
    '<div>Category: ' + esc(p.categoryName) + '</div>' +
    '</div>' +
    (p.certificationDetails ? '<div class="cert-note">📜 ' + esc(p.certificationDetails) + '</div>' : '') +
    (f ? '<div class="farmer-strip">' +
      (f.farmImage ? '<img src="' + esc(f.farmImage) + '" alt="Farm photo of ' + esc(f.farmName) + '" width="56" height="56" />' : '<div class="ph" role="img" aria-label="Farm illustration">🚜</div>') +
      '<div class="info"><strong>' + esc(f.farmName) + '</strong><small>' + esc(f.farmerName) + ' · ' + esc(f.village) + ', ' + esc(f.district) + '</small>' +
      (f.approvalStatus && f.approvalStatus !== 'approved' ? '<small> ' + approvalBadge(f.approvalStatus) + ' (demo)</small>' : '') + '</div>' +
      '<a class="btn btn-outline btn-sm" href="#/farmers/' + esc(f.id) + '">View farm</a></div>' : '') +
    '</div></div>' +

    '<section class="section" style="padding-bottom:0"><div class="section-head"><div><h2>Customer reviews</h2>' +
    (revs.length ? '<p>Seeded sample reviews — they do not represent real verified purchases.</p>' : '') +
    '</div></div>' +
    (revs.length
      ? '<div class="grid grid-3 grid-3-mobile">' + revs.map(reviewCard).join('') + '</div>'
      : emptyHTML('No reviews yet', 'Be the first to review this product.')) +
    '</section>' +

    (related.length ? '<section class="section"><div class="section-head"><div><h2>You may also like</h2></div></div>' +
      '<div class="grid grid-4 grid-3-mobile">' + related.map(productCard).join('') + '</div></section>' : '') +
    '</div>';
}

function pageCategories() {
  const popular = queryProducts({ sort: 'popular' }, 8);
  return '<div class="container page">' +
    '<h1 class="page-title">Categories</h1>' +
    '<p class="page-sub">Browse produce by farm category</p>' +
    '<div class="grid grid-6">' + CATEGORIES.map(categoryCard).join('') + '</div>' +
    '<section class="section"><div class="section-head"><div><h2>Popular right now</h2></div><a class="link" href="#/shop?sort=popular">Shop →</a></div>' +
    '<div class="grid grid-4 grid-3-mobile">' + popular.items.map(productCard).join('') + '</div>' +
    '</section></div>';
}

function pageFarmers(q) {
  const result = queryFarmers(q, 9);
  const methodOptions = ['<option value="">All methods</option>'].concat(
    ['Organic', 'Natural / ZBNF', 'Conventional'].map((m) => '<option value="' + esc(m) + '"' + (q.method === m ? ' selected' : '') + '>' + esc(m) + '</option>')
  ).join('');

  return '<div class="container page">' +
    '<h1 class="page-title">Our farmers</h1>' +
    '<p class="page-sub">Local growers you can trust — sample farms plus your demo registration</p>' +
    '<form id="farmerFilters" class="shop-toolbar" style="margin-bottom:1.5rem">' +
    '<input class="input" name="q" value="' + esc(q.q || '') + '" placeholder="Search farms, crops…" aria-label="Search farms, farmers or crops" style="max-width:280px" />' +
    '<input class="input" name="location" value="' + esc(q.location || '') + '" placeholder="District (e.g. Mandya)" aria-label="Filter by district" style="max-width:200px" />' +
    '<select class="input" name="method" aria-label="Filter by farming method" style="max-width:180px">' + methodOptions + '</select>' +
    '<button class="btn btn-primary btn-sm" type="submit">Search</button>' +
    '</form>' +
    '<p class="count" aria-live="polite" style="margin-bottom:1rem;color:var(--muted);font-size:.875rem">' + result.total + ' farm' + (result.total === 1 ? '' : 's') + ' found</p>' +
    (result.total
      ? '<div class="grid grid-3 grid-3-mobile">' + result.items.map(farmerCard).join('') + '</div>' + paginationHTML(result.page, result.pages)
      : emptyHTML('No farmers found', 'Try a different name, district or farming method.', { href: '#/farmers', label: 'Clear filters' })) +
    '</div>';
}

function pageFarmer(id) {
  const f = findFarmer(id);
  if (!f) return notFound();
  const prods = farmerProducts(id);
  const revs = REVIEWS.filter((r) => prods.some((p) => p._id === r.productId)).slice(0, 3);
  const crops = Array.isArray(f.cropTypes) ? f.cropTypes : [];
  const pending = f.approvalStatus && f.approvalStatus !== 'approved';

  return '<div class="container page">' +
    '<div class="crumbs"><a href="#/">Home</a> / <a href="#/farmers">Farmers</a> / ' + esc(f.farmName) + '</div>' +
    '<div class="card" style="display:grid;gap:0">' +
    (f.farmImage ? '<img src="' + esc(f.farmImage) + '" alt="Farm photo of ' + esc(f.farmName) + '" width="1120" height="240" style="width:100%;height:240px;object-fit:cover" />' : '') +
    '<div class="card-pad">' +
    '<h1 class="page-title">' + esc(f.farmName) + '</h1>' +
    '<p class="page-sub">' + esc(f.farmerName) + ' · ' + esc(f.village) + ', ' + esc(f.district) + ', ' + esc(f.state) + '</p>' +
    '<div style="display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:.5rem 0 1rem">' + methodBadge(f.farmingMethod) +
    starsHTML(f.ratingAvg, f.ratingCount) +
    (pending ? approvalBadge(f.approvalStatus) + ' <span class="summary-note">Approval is simulated in this demo.</span>' : '') + '</div>' +
    (pending ? '<div class="notice"><span class="notice-ic" aria-hidden="true">⏳</span><div class="notice-body"><strong>Not yet approved</strong><p>This farm was registered in this browser and is waiting for demo approval. Its listings are visible for the demonstration only.</p></div></div>' : '') +
    '<p style="font-size:.9rem">' + esc(f.farmDescription) + '</p>' +
    (crops.length ? '<p style="margin-top:.75rem;font-size:.85rem;color:var(--muted)"><strong>Crops:</strong> ' + esc(crops.join(', ')) + '</p>' : '') +
    '</div></div>' +
    '<section class="section"><div class="section-head"><div><h2>Products from this farm</h2><p>' + prods.length + ' listing' + (prods.length === 1 ? '' : 's') + '</p></div></div>' +
    (prods.length
      ? '<div class="grid grid-4 grid-3-mobile">' + prods.map(productCard).join('') + '</div>'
      : emptyHTML('No products listed yet', 'This farm has not added any produce yet. Check back soon.')) +
    '</section>' +
    (revs.length ? '<section class="section" style="padding-top:0"><div class="section-head"><div><h2>Recent reviews</h2><p>Seeded demo reviews</p></div></div>' +
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
    ['🛒', 'Fill your cart', 'Add fresh produce to your cart, adjust quantities, and check out directly — no brokers between you and the farm.'],
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
    '<div class="feature"><span class="icon">✓</span><div><h3>Sample reviews</h3><p>Reviews in this demo are seeded sample data, not real verified purchases.</p></div></div>' +
    '</div></section>' +
    '<div style="text-align:center"><a class="btn btn-primary" href="#/shop">Start shopping</a></div>' +
    '</div>';
}

function pageFaq() {
  const faqs = [
    ['How does Krishi Market work?', 'Farmers list their produce with price, stock and harvest details. Customers browse, add items to their cart, and place an order directly with the farm.'],
    ['Is the produce really farm-fresh?', 'Yes — listings show the harvest date, and most orders ship within a day or two of harvest.'],
    ['How do I place an order?', 'Add products to your cart, open the cart page, enter your delivery details and place the order. This demonstration checkout does not take payment or ship anything.'],
    ['Can I change my cart?', 'Yes — adjust quantities or remove items on the cart page. Your cart is saved in this browser between visits.'],
    ['What does “Organic” mean on a listing?', 'The farmer certifies that the crop was grown without synthetic pesticides or fertilisers. Look for the green badge on product pages.'],
    ['How are farmers paid?', 'Farmers set their own prices and receive the majority of the sale value directly.'],
    ['Can I trust the reviews?', 'The reviews shown in this demo are seeded sample data. They illustrate how reviews would look, but they are not linked to real purchases or customers.'],
    ['Which regions do you serve?', 'This demo currently focuses on farms across Karnataka — Mandya, Mysuru, Kolar and Bengaluru Rural.'],
  ];
  return '<div class="container page" style="max-width:48rem">' +
    '<h1 class="page-title">Help & FAQs</h1>' +
    '<p class="page-sub">Answers to common questions</p>' +
    faqs.map(function (f, i) {
      return '<div class="faq-item"><button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-' + i + '" id="faq-q-' + i + '">' +
        esc(f[0]) + '<span class="chev" aria-hidden="true">▾</span></button>' +
        '<div class="faq-a" id="faq-a-' + i + '" role="region" aria-labelledby="faq-q-' + i + '">' + esc(f[1]) + '</div></div>';
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
    '<li><span class="ic" aria-hidden="true">✉️</span> support@krishimarket.example</li>' +
    '<li><span class="ic" aria-hidden="true">📍</span> Bengaluru, Karnataka, India</li>' +
    '<li><span class="ic" aria-hidden="true">📞</span> +91 98765 43210 (Mon–Sat, 9am–6pm)</li>' +
    '</ul>' +
    '<p style="font-size:.85rem;color:var(--muted)">This is a demonstration site — messages are validated in your browser and are <strong>not sent anywhere</strong>.</p>' +
    '</div>' +
    '<form class="card form-card" id="contactForm" novalidate>' +
    '<div id="formSuccess" role="status" aria-live="polite"></div>' +
    '<div class="field"><label class="field-label" for="cfName">Name <span aria-hidden="true">*</span></label>' +
    '<input class="input" id="cfName" name="name" type="text" autocomplete="name" maxlength="80" aria-describedby="cfNameErr" required />' +
    '<div class="error-text" id="cfNameErr" data-err="name" role="alert"></div></div>' +
    '<div class="field"><label class="field-label" for="cfEmail">Email <span aria-hidden="true">*</span></label>' +
    '<input class="input" id="cfEmail" name="email" type="email" autocomplete="email" maxlength="120" aria-describedby="cfEmailErr" required />' +
    '<div class="error-text" id="cfEmailErr" data-err="email" role="alert"></div></div>' +
    '<div class="field"><label class="field-label" for="cfMsg">Message <span aria-hidden="true">*</span></label>' +
    '<textarea class="input" id="cfMsg" name="message" minlength="10" maxlength="1000" aria-describedby="cfMsgErr" required></textarea>' +
    '<div class="error-text" id="cfMsgErr" data-err="message" role="alert"></div></div>' +
    '<button class="btn btn-primary btn-block" id="contactSubmit" type="submit">Send message</button>' +
    '<p class="summary-note" style="margin-top:.6rem">Demo only — submitting shows a confirmation but does not send an email.</p>' +
    '</form></div></div>';
}

function checkoutField(id, label, name, type, placeholder, autocomplete, opts) {
  opts = opts || {};
  const errId = id + 'Err';
  return '<div class="field">' +
    '<label class="field-label" for="' + id + '">' + esc(label) + ' <span aria-hidden="true">*</span></label>' +
    '<input class="input" id="' + id + '" name="' + name + '" type="' + esc(type) + '" placeholder="' + esc(placeholder) + '" autocomplete="' + esc(autocomplete) + '"' +
    (opts.inputmode ? ' inputmode="' + esc(opts.inputmode) + '"' : '') +
    (opts.maxlength ? ' maxlength="' + Number(opts.maxlength) + '"' : '') +
    ' aria-describedby="' + errId + '" required />' +
    '<div class="error-text" id="' + errId + '" data-err="' + name + '" role="alert"></div>' +
    '</div>';
}

function cartLineHTML(line) {
  const p = line.product;
  const maxQty = Math.max(1, Math.floor(Number(p.stockQuantity) || 1));
  return '<div class="card cart-line">' +
    '<a class="cart-thumb" href="#/product/' + esc(p._id) + '" aria-label="View ' + esc(p.name) + '">' +
    (p.images && p.images[0]
      ? '<img src="' + esc(p.images[0]) + '" alt="Photo of ' + esc(p.name) + '" width="84" height="72" loading="lazy" />'
      : '<span class="ph" role="img" aria-label="No product photo">🥬</span>') +
    '</a>' +
    '<div class="cart-line-info">' +
    '<a class="product-title" href="#/product/' + esc(p._id) + '">' + esc(p.name) + '</a>' +
    '<div class="product-meta">' + esc(p.farmerName) + ' · ' + money(p.price) + ' / ' + esc(p.unit) + '</div>' +
    '<div class="cart-line-actions">' +
    '<div class="qty qty-sm" role="group" aria-label="Quantity for ' + esc(p.name) + '">' +
    '<button type="button" data-cart-qty="' + esc(p._id) + '" data-delta="-1" aria-label="Decrease quantity">−</button>' +
    '<span class="qty-value" aria-live="polite">' + line.qty + '</span>' +
    '<button type="button" data-cart-qty="' + esc(p._id) + '" data-delta="1" aria-label="Increase quantity"' + (line.qty >= maxQty ? ' disabled' : '') + '>+</button>' +
    '</div>' +
    '<button type="button" class="link-btn" data-cart-remove="' + esc(p._id) + '">Remove</button>' +
    '</div></div>' +
    '<div class="cart-line-total">' + money(line.lineTotal) + '</div>' +
    '</div>';
}

function orderSuccess() {
  return '<div class="container page">' +
    '<div class="card card-pad order-success">' +
    '<div class="order-icon" aria-hidden="true">🌾</div>' +
    '<h1 class="page-title">Demo order recorded!</h1>' +
    '<p>Thank you, ' + esc(lastOrder.name) + '. Your demo order <strong>' + esc(lastOrder.id) + '</strong> for <strong>' + money(lastOrder.total) + '</strong> has been saved in this browser and appears in the farmer dashboard.</p>' +
    '<p class="page-sub">This is a front-end demonstration: no payment was taken, no farm or delivery partner was notified, and no order will be shipped.</p>' +
    '<div class="hero-actions" style="justify-content:center">' +
    '<a class="btn btn-primary" href="#/shop">Continue shopping</a>' +
    '<a class="btn btn-outline" href="#/">Back home</a>' +
    '</div>' +
    '<p class="summary-note" style="margin-top:1rem">Demo checkout — data is stored only in this browser via localStorage.</p>' +
    '</div></div>';
}

function pageCart() {
  const lines = cartLines();
  if (lastOrder && !lines.length) return orderSuccess();
  if (!lines.length) {
    return '<div class="container page">' +
      '<div class="crumbs"><a href="#/">Home</a> / Cart</div>' +
      '<h1 class="page-title">Your cart</h1>' +
      emptyHTML('Your cart is empty', 'Browse fresh produce from local farms and add something you like.', { href: '#/shop', label: 'Start shopping' }) +
      '</div>';
  }

  const count = cartCount();
  const farms = new Set(lines.map(function (line) { return line.product.farmerProfileId; })).size;
  const subtotal = cartSubtotal();
  const delivery = subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;

  return '<div class="container page">' +
    '<div class="crumbs"><a href="#/">Home</a> / Cart</div>' +
    '<h1 class="page-title">Your cart</h1>' +
    '<p class="page-sub" aria-live="polite">' + count + ' item' + (count === 1 ? '' : 's') + ' from ' + farms + ' local farm' + (farms === 1 ? '' : 's') + '</p>' +
    '<div class="cart-layout">' +
    '<div class="cart-items">' + lines.map(cartLineHTML).join('') +
    '<a class="link" href="#/shop">← Continue shopping</a></div>' +
    '<aside class="card card-pad cart-summary" aria-label="Order summary">' +
    '<h2>Order summary</h2>' +
    '<div class="summary-row"><span>Subtotal</span><strong>' + money(subtotal) + '</strong></div>' +
    '<div class="summary-row"><span>Delivery</span><strong>' + (delivery ? money(delivery) : 'Free') + '</strong></div>' +
    (delivery ? '<p class="summary-note">Add ' + money(FREE_DELIVERY_OVER - subtotal) + ' more for free delivery.</p>' : '<p class="summary-note">Free delivery applied.</p>') +
    '<div class="summary-row total"><span>Total</span><strong>' + money(total) + '</strong></div>' +
    '<div class="delivery-check">' +
    '<label for="pinCheck">Check demo delivery availability</label>' +
    '<div class="delivery-check-row">' +
    '<input class="input" id="pinCheck" name="pinCheck" type="text" inputmode="numeric" maxlength="6" placeholder="6-digit PIN" aria-describedby="pinCheckResult" />' +
    '<button class="btn btn-outline btn-sm" type="button" data-pin-check>Check</button>' +
    '</div>' +
    '<p class="delivery-result" id="pinCheckResult" role="status" aria-live="polite"></p>' +
    '<p class="summary-note">Demo check against a fixed PIN list — no real logistics partner.</p>' +
    '</div>' +
    '<form id="checkoutForm" class="checkout-form" novalidate>' +
    '<h3>Delivery details</h3>' +
    checkoutField('coName', 'Full name', 'name', 'text', 'Your name', 'name', { maxlength: 80 }) +
    checkoutField('coPhone', 'Phone', 'phone', 'tel', '10-digit mobile number', 'tel', { inputmode: 'tel', maxlength: 10 }) +
    checkoutField('coAddress', 'Address', 'address', 'text', 'House, street, area', 'street-address', { maxlength: 160 }) +
    checkoutField('coCity', 'City / town', 'city', 'text', 'e.g. Bengaluru', 'address-level2', { maxlength: 60 }) +
    checkoutField('coPincode', 'PIN code', 'pincode', 'text', '6-digit PIN code', 'postal-code', { inputmode: 'numeric', maxlength: 6 }) +
    '<div class="field"><label class="field-label" for="coPayment">Payment</label>' +
    '<select class="input" id="coPayment" name="payment">' +
    '<option value="cod">Cash on delivery (demo)</option>' +
    '<option value="upi">UPI (demo)</option>' +
    '</select></div>' +
    '<button class="btn btn-gold btn-block" id="placeOrderBtn" type="submit">Place demo order · ' + money(total) + '</button>' +
    '</form>' +
    '<p class="summary-note">Demo checkout — no payment is taken, nothing is shipped and no customer details leave this browser.</p>' +
    '</aside></div></div>';
}

function farmerFormField(id, label, name, type, value, placeholder, opts) {
  opts = opts || {};
  const errId = id + 'Err';
  return '<div class="field' + (opts.wide ? ' field-wide' : '') + '">' +
    '<label class="field-label" for="' + id + '">' + esc(label) + (opts.required ? ' <span aria-hidden="true">*</span>' : '') + '</label>' +
    '<input class="input" id="' + id + '" name="' + name + '" type="' + esc(type) + '" value="' + esc(value == null ? '' : value) + '"' +
    (placeholder ? ' placeholder="' + esc(placeholder) + '"' : '') +
    (opts.required ? ' required' : '') +
    (opts.maxlength ? ' maxlength="' + Number(opts.maxlength) + '"' : '') +
    (opts.autocomplete ? ' autocomplete="' + esc(opts.autocomplete) + '"' : '') +
    ' aria-describedby="' + errId + '"' +
    (opts.attrs || '') + ' />' +
    '<div class="error-text" id="' + errId + '" data-err="' + name + '" role="alert"></div></div>';
}

function pageFarmerDashboard() {
  const account = currentFarmer();
  if (!account) return farmerOnboarding();

  const stats = farmerDashboardStats(account.id);
  const products = farmerProducts(account.id);
  const recent = farmerOrdersFor(account.id).slice(0, 5);

  const recentHTML = recent.length
    ? '<div class="card table-wrap"><table class="data-table"><thead><tr>' +
      '<th>Order</th><th>Customer</th><th>Items</th><th class="num">Amount</th><th>Status</th><th>Placed</th>' +
      '</tr></thead><tbody>' +
      recent.map(function (order) {
        const items = orderItemsFor(order, account.id);
        const qty = items.reduce(function (n, i) { return n + (Number(i.qty) || 0); }, 0);
        const c = order.customer || {};
        return '<tr>' +
          '<td><a class="link" href="#/farmer/orders">#' + esc(order.id) + '</a></td>' +
          '<td>' + esc(c.name || 'Customer') + '<div class="pm-sub">' + esc(c.city || '') + '</div></td>' +
          '<td>' + qty + ' item' + (qty === 1 ? '' : 's') +
          '<div class="pm-sub">' + esc(items.map(function (i) { return i.name; }).join(', ')) + '</div></td>' +
          '<td class="num">' + money(orderTotalFor(order, account.id)) + '</td>' +
          '<td>' + orderStatusBadge(order.status) + '</td>' +
          '<td>' + esc(shortDate(order.placedAt)) + '</td>' +
          '</tr>';
      }).join('') +
      '</tbody></table></div>'
    : '<div class="empty"><h3>No orders yet</h3><p>When a customer orders your produce it will appear here.</p>' +
      '<button class="btn btn-outline" type="button" data-demo-orders>Generate demo orders</button></div>';

  const productsHTML = products.length
    ? '<div class="card table-wrap"><table class="data-table data-table-pm"><thead><tr>' +
      '<th>Product</th><th>Category</th><th class="num">Price</th><th class="num">Stock</th><th>Availability</th><th>Actions</th>' +
      '</tr></thead><tbody>' +
      products.map(function (p) {
        const out = p.stockQuantity === 0 || p.availabilityStatus === 'out_of_stock';
        const availability = p.stockQuantity === 0
          ? '<span class="badge badge-red" title="Set a stock quantity to make this product available">Out of stock</span>'
          : '<button class="badge ' + (out ? 'badge-red' : 'badge-green') + ' badge-btn" type="button" ' +
            'data-toggle-stock="' + esc(p._id) + '" aria-pressed="' + (out ? 'false' : 'true') + '" ' +
            'title="Click to toggle availability">' + (out ? 'Out of stock' : 'In stock') + '</button>';
        return '<tr>' +
          '<td><div class="pm-product">' +
          '<div class="pm-thumb">' + (p.images && p.images[0]
            ? '<img src="' + esc(p.images[0]) + '" alt="" loading="lazy" />'
            : '🥬') + '</div>' +
          '<div><a class="pm-name" href="#/product/' + esc(p._id) + '">' + esc(p.name) + '</a>' +
          '<span class="pm-sub">' + esc(p.unit) + ' · listed ' + esc(shortDate(p.createdAt)) + '</span></div>' +
          '</div></td>' +
          '<td>' + esc(p.categoryName) + '</td>' +
          '<td class="num">' + money(p.price) + '</td>' +
          '<td class="num">' + p.stockQuantity + '</td>' +
          '<td>' + availability + '</td>' +
          '<td><div class="row-actions">' +
          '<a class="btn btn-outline btn-sm" href="#/farmer/products/' + esc(p._id) + '/edit">Edit</a>' +
          '<button class="link-btn" type="button" data-delete-product="' + esc(p._id) + '">Delete</button>' +
          '</div></td>' +
          '</tr>';
      }).join('') +
      '</tbody></table></div>'
    : '<div class="empty"><h3>No products listed yet</h3><p>Add your first product with a photo, price and stock quantity.</p>' +
      '<a class="btn btn-primary" href="#/farmer/products/new">Add your first product</a></div>';

  return '<div class="container page">' +
    '<div class="dash-head">' +
    '<div>' +
    '<p class="eyebrow">Farmer dashboard</p>' +
    '<h1 class="page-title">' + esc(account.farmName) + '</h1>' +
    '<p class="page-sub" style="margin-bottom:0">' + esc(account.farmerName) + ' · ' +
    esc(account.village) + ', ' + esc(account.district) + ' ' + approvalBadge(account.approvalStatus) + '</p>' +
    '</div>' +
    '<div class="dash-actions">' +
    '<a class="btn btn-primary btn-sm" href="#/farmer/products/new">+ Add product</a>' +
    '<a class="btn btn-outline btn-sm" href="#/farmer/register">Edit farm profile</a>' +
    '</div>' +
    '</div>' +

    (account.approvalStatus !== 'approved'
      ? '<div class="notice"><span class="notice-ic" aria-hidden="true">⏳</span>' +
        '<div class="notice-body"><strong>' + (account.approvalStatus === 'rejected' ? 'Approval rejected (demo)' : 'Approval pending (demo)') + '</strong>' +
        '<p>' + (account.approvalStatus === 'rejected'
          ? 'This farm is marked as rejected. You can still edit the profile and simulate approval for the demo.'
          : 'Your farm profile is waiting for review. You can prepare listings now — approval is simulated in this demo.') + '</p></div>' +
        '<button class="btn btn-outline btn-sm" type="button" data-approve-farmer>Simulate approval</button></div>'
      : '<p class="summary-note" style="margin:-.5rem 0 1.5rem">Approval status is simulated — this demo has no admin review process.</p>') +

    '<div class="stats-grid">' +
    statCard('Total products', stats.totalProducts, 'listings on your farm') +
    statCard('Available products', stats.availableProducts, 'in stock right now') +
    statCard('Total demo orders', stats.totalOrders, 'orders containing your produce') +
    statCard('Demo earnings', money(stats.earnings), 'excluding cancelled orders') +
    '</div>' +
    '<p class="summary-note" style="margin:-1rem 0 2rem">All dashboard figures are simulated from demo orders stored in this browser.</p>' +

    '<section class="dash-section">' +
    '<div class="section-head"><div><h2>Recent orders</h2><p>Latest orders that include your produce</p></div>' +
    '<a class="link" href="#/farmer/orders">View all orders →</a></div>' +
    recentHTML +
    '</section>' +

    '<section class="dash-section">' +
    '<div class="section-head"><div><h2>Product management</h2><p>Add, edit and update stock for your listings</p></div>' +
    '<a class="btn btn-outline btn-sm" href="#/farmer/products/new">Add product</a></div>' +
    productsHTML +
    '</section>' +

    '<div class="dash-foot">' +
    '<button class="link-btn" type="button" data-reset-store>Reset demo data</button>' +
    '<span class="summary-note">Products and orders are saved in this browser only.</span>' +
    '<button class="link-btn" type="button" data-signout>Sign out</button>' +
    '</div>' +
    '</div>';
}

function pageFarmerRegister() {
  const account = currentFarmer();
  const editing = !!account;
  const v = function (key, fallback) {
    if (account && account[key] != null) return account[key];
    return fallback == null ? '' : fallback;
  };
  const cats = (account && account.categories) || [];
  const method = v('farmingMethod', 'Organic');
  const approval = v('approvalStatus', 'pending');

  const catBoxes = CATEGORIES.map(function (c) {
    return '<label class="checkbox-item"><input type="checkbox" name="categories" value="' + esc(c.name) + '"' +
      (cats.indexOf(c.name) >= 0 ? ' checked' : '') + ' /> ' + esc(c.name) + '</label>';
  }).join('');

  const methodOptions = ['Organic', 'Natural / ZBNF', 'Conventional'].map(function (m) {
    return '<option value="' + esc(m) + '"' + (method === m ? ' selected' : '') + '>' + esc(m) + '</option>';
  }).join('');

  return '<div class="container page" style="max-width:52rem">' +
    '<div class="crumbs"><a href="#/farmer">Dashboard</a> / ' + (editing ? 'Farm profile' : 'Registration') + '</div>' +
    '<h1 class="page-title">' + (editing ? 'Edit farm profile' : 'Register your farm') + '</h1>' +
    '<p class="page-sub">' + (editing
      ? 'Update your contact, farm and category details.'
      : 'Tell customers about your farm. You can change these details any time.') + '</p>' +

    '<form class="card form-card" id="farmerForm" novalidate>' +
    '<p class="summary-note" style="margin-bottom:1rem">Demo registration — details are saved only in this browser. No account is created on a server.</p>' +
    '<div class="form-grid">' +
    farmerFormField('frName', 'Your name', 'farmerName', 'text', v('farmerName'), 'e.g. Ramesh Gowda', { required: true, maxlength: 80, autocomplete: 'name' }) +
    farmerFormField('frFarm', 'Farm name', 'farmName', 'text', v('farmName'), 'e.g. Gowda Family Farm', { required: true, maxlength: 80 }) +
    farmerFormField('frPhone', 'Phone', 'phone', 'tel', v('phone'), '10-digit mobile number', { required: true, maxlength: 10, autocomplete: 'tel', attrs: ' inputmode="numeric"' }) +
    farmerFormField('frEmail', 'Email', 'email', 'email', v('email'), 'you@example.com', { required: true, maxlength: 120, autocomplete: 'email' }) +
    farmerFormField('frVillage', 'Village / town', 'village', 'text', v('village'), 'e.g. Srirangapatna', { required: true, maxlength: 60 }) +
    farmerFormField('frDistrict', 'District', 'district', 'text', v('district'), 'e.g. Mandya', { required: true, maxlength: 60 }) +
    farmerFormField('frState', 'State', 'state', 'text', v('state', 'Karnataka'), 'e.g. Karnataka', { required: true, maxlength: 60 }) +
    '<div class="field"><label class="field-label" for="frMethod">Farming method</label>' +
    '<select class="input" id="frMethod" name="farmingMethod">' + methodOptions + '</select></div>' +

    '<div class="field field-wide"><label class="field-label" for="frAbout">Farm description <span aria-hidden="true">*</span></label>' +
    '<textarea class="input" id="frAbout" name="farmDescription" maxlength="600" minlength="10" aria-describedby="frAboutErr" placeholder="What do you grow, how, and what makes your farm special?">' +
    esc(v('farmDescription')) + '</textarea>' +
    '<div class="error-text" id="frAboutErr" data-err="farmDescription" role="alert"></div></div>' +

    '<fieldset class="field field-wide"><legend class="field-label">Product categories <span aria-hidden="true">*</span></legend>' +
    '<div class="checkbox-grid">' + catBoxes + '</div>' +
    '<div class="error-text" id="frCategoriesErr" data-err="categories" role="alert"></div></fieldset>' +

    '<div class="field"><label class="field-label" for="frApproval">Approval status</label>' +
    '<select class="input" id="frApproval" name="approvalStatus">' +
    '<option value="pending"' + (approval === 'pending' ? ' selected' : '') + '>Pending review</option>' +
    '<option value="approved"' + (approval === 'approved' ? ' selected' : '') + '>Approved</option>' +
    '<option value="rejected"' + (approval === 'rejected' ? ' selected' : '') + '>Rejected</option>' +
    '</select><p class="field-hint">Demo field — in a real marketplace this would be set by Krishi Market admins, never by the farmer.</p></div>' +
    '</div>' +

    '<div class="hero-actions" style="margin-top:.5rem">' +
    '<button class="btn btn-primary" type="submit">' + (editing ? 'Save farm profile' : 'Register farm') + '</button>' +
    '<a class="btn btn-outline" href="#/farmer">Cancel</a>' +
    '</div>' +
    '</form></div>';
}

function pageFarmerProductForm(productId) {
  const account = currentFarmer();
  if (!account) return farmerOnboarding();

  let product = null;
  if (productId) {
    product = findProduct(productId);
    if (!product || product.farmerProfileId !== account.id) return notFound();
  }
  draftImages = product && product.images ? product.images.slice(0, 3) : [];

  const catOptions = CATEGORIES.map(function (c) {
    return '<option value="' + esc(c._id) + '"' +
      ((product ? product.categoryId : CATEGORIES[0]._id) === c._id ? ' selected' : '') + '>' + esc(c.name) + '</option>';
  }).join('');

  const units = ['kg', 'g', 'bunch', 'dozen', 'litre', '500ml', 'pack', 'jar', 'piece'];
  if (product && product.unit && units.indexOf(product.unit) < 0) units.push(product.unit);
  const unitOptions = units.map(function (u) {
    return '<option value="' + esc(u) + '"' + (product && product.unit === u ? ' selected' : '') + '>' + esc(u) + '</option>';
  }).join('');

  const method = product ? product.farmingMethod : 'Organic';
  const methodOptions = ['Organic', 'Natural / ZBNF', 'Conventional'].map(function (m) {
    return '<option value="' + esc(m) + '"' + (method === m ? ' selected' : '') + '>' + esc(m) + '</option>';
  }).join('');

  const availability = product
    ? (product.stockQuantity === 0 ? 'out_of_stock' : (product.availabilityStatus || 'in_stock'))
    : 'in_stock';

  return '<div class="container page" style="max-width:48rem">' +
    '<div class="crumbs"><a href="#/farmer">Dashboard</a> / ' + (product ? 'Edit product' : 'Add product') + '</div>' +
    '<h1 class="page-title">' + (product ? 'Edit product' : 'Add a new product') + '</h1>' +
    '<p class="page-sub">Listings appear in the shop immediately and are saved in this browser.</p>' +

    '<form class="card form-card" id="productForm" novalidate data-product-id="' + esc(product ? product._id : '') + '">' +
    '<p class="summary-note" style="margin-bottom:1rem">Demo listing — saved only in this browser and shown immediately in the shop.</p>' +
    '<div class="form-grid">' +
    '<div class="field field-wide"><label class="field-label" for="pfName">Product name <span aria-hidden="true">*</span></label>' +
    '<input class="input" id="pfName" name="name" type="text" value="' + esc(product ? product.name : '') + '" placeholder="e.g. Desi Tomato" maxlength="80" aria-describedby="pfNameErr" required />' +
    '<div class="error-text" id="pfNameErr" data-err="name" role="alert"></div></div>' +

    '<div class="field"><label class="field-label" for="pfCategory">Category</label>' +
    '<select class="input" id="pfCategory" name="categoryId">' + catOptions + '</select>' +
    '<div class="error-text" id="pfCategoryErr" data-err="categoryId" role="alert"></div></div>' +

    '<div class="field"><label class="field-label" for="pfMethod">Farming method</label>' +
    '<select class="input" id="pfMethod" name="farmingMethod">' + methodOptions + '</select></div>' +

    '<div class="field"><label class="field-label" for="pfPrice">Price (₹) <span aria-hidden="true">*</span></label>' +
    '<input class="input" id="pfPrice" name="price" type="number" min="0.01" step="0.01" value="' +
    (product ? product.price : '') + '" placeholder="0" aria-describedby="pfPriceErr" required />' +
    '<div class="error-text" id="pfPriceErr" data-err="price" role="alert"></div></div>' +

    '<div class="field"><label class="field-label" for="pfUnit">Unit</label>' +
    '<select class="input" id="pfUnit" name="unit">' + unitOptions + '</select></div>' +

    '<div class="field"><label class="field-label" for="pfStock">Quantity in stock <span aria-hidden="true">*</span></label>' +
    '<input class="input" id="pfStock" name="stockQuantity" type="number" min="0" step="1" value="' +
    (product ? product.stockQuantity : '') + '" placeholder="0" aria-describedby="pfStockErr" required />' +
    '<div class="error-text" id="pfStockErr" data-err="stockQuantity" role="alert"></div></div>' +

    '<div class="field"><label class="field-label" for="pfAvailability">Stock availability</label>' +
    '<select class="input" id="pfAvailability" name="availabilityStatus">' +
    '<option value="in_stock"' + (availability === 'in_stock' ? ' selected' : '') + '>In stock</option>' +
    '<option value="out_of_stock"' + (availability === 'out_of_stock' ? ' selected' : '') + '>Out of stock</option>' +
    '</select><p class="field-hint">“Out of stock” disables add-to-cart. A quantity of 0 always means out of stock.</p></div>' +

    '<div class="field field-wide"><label class="field-label" for="pfDescription">Description <span aria-hidden="true">*</span></label>' +
    '<textarea class="input" id="pfDescription" name="description" maxlength="600" minlength="10" aria-describedby="pfDescriptionErr" placeholder="How it is grown, taste, harvest details…" required>' +
    esc(product ? product.description : '') + '</textarea>' +
    '<div class="error-text" id="pfDescriptionErr" data-err="description" role="alert"></div></div>' +

    '<div class="field field-wide"><label class="field-label" for="pfImages">Product photos</label>' +
    '<input class="input" id="pfImages" name="images" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple />' +
    '<p class="field-hint">JPG, PNG, WebP or GIF · up to 3 photos · images are compressed and stored in your browser.</p>' +
    '<div id="imagePreviews">' + imagePreviewsHTML() + '</div></div>' +
    '</div>' +

    '<div class="hero-actions" style="margin-top:.5rem">' +
    '<button class="btn btn-primary" type="submit">' + (product ? 'Save changes' : 'Add product') + '</button>' +
    '<a class="btn btn-outline" href="#/farmer">Cancel</a>' +
    '</div>' +
    '</form></div>';
}

function pageFarmerOrders(q) {
  const account = currentFarmer();
  if (!account) return farmerOnboarding();

  const all = farmerOrdersFor(account.id);
  const stats = farmerDashboardStats(account.id);
  const validStatuses = ['all', 'active'].concat(ORDER_STATUSES);
  const filter = validStatuses.indexOf(q.status || 'all') >= 0 ? (q.status || 'all') : 'all';
  const active = all.filter(function (o) { return ['placed', 'packed', 'shipped'].indexOf(o.status) >= 0; });
  const history = all.filter(function (o) { return ['delivered', 'cancelled'].indexOf(o.status) >= 0; });

  const tabs = [
    ['all', 'All'], ['active', 'Active'], ['placed', 'Placed'], ['packed', 'Packed'],
    ['shipped', 'Out for delivery'], ['delivered', 'Delivered'], ['cancelled', 'Cancelled'],
  ];
  const tabsHTML = '<div class="filter-tabs">' + tabs.map(function (t) {
    return '<a href="#/farmer/orders' + (t[0] === 'all' ? '' : '?status=' + t[0]) + '"' +
      (filter === t[0] ? ' class="active" aria-current="page"' : '') + '>' + esc(t[1]) + '</a>';
  }).join('') + '</div>';

  function listSection(title, subtitle, orders) {
    const cards = orders.length
      ? orders.map(function (o) { return orderCardHTML(o, account.id); }).join('')
      : '<div class="empty"><h3>No orders here</h3><p>' + esc(subtitle) + '</p>' +
        '<button class="btn btn-outline" type="button" data-demo-orders>Generate demo orders</button></div>';
    return '<section class="dash-section"><div class="section-head"><div><h2>' + esc(title) + '</h2>' +
      '<p>' + esc(subtitle) + '</p></div><span class="badge badge-gray">' + orders.length + '</span></div>' + cards + '</section>';
  }

  let body = '';
  if (filter === 'all') {
    body = listSection('Active orders', 'Orders being prepared or on the way', active) +
      listSection('Order history', 'Delivered and cancelled orders', history);
  } else if (filter === 'active') {
    body = listSection('Active orders', 'Orders being prepared or on the way', active);
  } else if (filter === 'delivered' || filter === 'cancelled') {
    body = listSection('Order history · ' + (ORDER_STATUS_LABELS[filter] || filter), 'Orders with this status', all.filter(function (o) {
      return o.status === filter;
    }));
  } else {
    body = listSection(ORDER_STATUS_LABELS[filter] || filter, 'Orders with this status', all.filter(function (o) {
      return o.status === filter;
    }));
  }

  return '<div class="container page">' +
    '<div class="dash-head">' +
    '<div>' +
    '<p class="eyebrow">Farmer orders</p>' +
    '<h1 class="page-title">Orders</h1>' +
    '<p class="page-sub" style="margin-bottom:0">' + all.length + ' order' + (all.length === 1 ? '' : 's') + ' · ' +
    stats.activeOrders + ' active · Demo earnings ' + money(stats.earnings) + '</p>' +
    '</div>' +
    '<div class="dash-actions">' +
    '<a class="btn btn-outline btn-sm" href="#/farmer">← Dashboard</a>' +
    '<button class="btn btn-primary btn-sm" type="button" data-demo-orders>Generate demo orders</button>' +
    '</div>' +
    '</div>' +
    '<p class="summary-note" style="margin-bottom:1rem">All orders and status changes are simulated demo data stored in this browser. Customers are never notified.</p>' +
    tabsHTML +
    body +
    '</div>';
}

function notFound() {
  return '<div class="container page">' +
    emptyHTML('Page not found', 'The page you’re looking for doesn’t exist.', { href: '#/', label: 'Back home' }) +
    '</div>';
}

// ---- router ----

function setActiveNav(name) {
  document.querySelectorAll('.main-nav a').forEach((a) => {
    const active = a.dataset.nav === name;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

let lastHash = location.hash || '#/';

function render(opts) {
  opts = opts || {};
  const { path, segments, q } = parseHash();
  const root = segments[0] || '';
  let html = '';

  if (root !== 'cart') lastOrder = null;

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
    case 'farmer': {
      const sub = segments[1];
      if (sub === 'register') html = pageFarmerRegister();
      else if (sub === 'orders') html = pageFarmerOrders(q);
      else if (sub === 'products' && segments[2] === 'new') html = pageFarmerProductForm(null);
      else if (sub === 'products' && segments[3] === 'edit') html = pageFarmerProductForm(segments[2]);
      else if (sub === 'products') html = pageFarmerDashboard();
      else html = pageFarmerDashboard();
      setActiveNav('farmer');
      break;
    }
    case 'cart':
      html = pageCart(); setActiveNav(''); break;
    default:
      html = notFound(); setActiveNav('');
  }

  const title = setPageTitle(root, segments);
  app.innerHTML = html;
  const hash = location.hash || '#/';
  const changed = hash !== lastHash;
  if (changed) {
    window.scrollTo(0, 0);
    lastHash = hash;
  }
  setNavOpen(false);
  bindPageEvents(q, segments);
  updateCartBadge();

  // Move focus and announce the new page only on real route changes or when forced
  // (not on in-page re-renders like changing a cart quantity).
  if (changed || opts.focus) {
    const announcer = document.getElementById('routeAnnouncer');
    if (announcer) announcer.textContent = title;
    try { app.focus({ preventScroll: true }); } catch (e) { app.focus(); }
  }
}

// ---- page-level event binding ----

function bindPageEvents(q, segments) {
  const hero = document.getElementById('heroSearch');
  if (hero) {
    hero.addEventListener('submit', function (e) {
      e.preventDefault();
      const v = new FormData(hero).get('q');
      const s = (v || '').toString().trim();
      location.hash = '#/shop' + (s ? '?q=' + encodeURIComponent(s) : '');
    });
  }

  const shop = document.getElementById('shopFilters');
  if (shop) {
    shop.addEventListener('submit', function (e) {
      e.preventDefault();
      const values = {};
      new FormData(shop).forEach(function (v, k) {
        if (v == null) return;
        const val = String(v).trim();
        if (val) values[k] = val;
      });
      // Validate the price range instead of silently returning nonsense results.
      const min = Number(values.priceMin);
      const max = Number(values.priceMax);
      if (values.priceMin && (!isFinite(min) || min < 0)) { delete values.priceMin; }
      if (values.priceMax && (!isFinite(max) || max < 0)) { delete values.priceMax; }
      if (values.priceMin && values.priceMax && Number(values.priceMin) > Number(values.priceMax)) {
        const swap = values.priceMin;
        values.priceMin = values.priceMax;
        values.priceMax = swap;
        toast('Price range swapped: minimum was higher than maximum');
      }
      const params = new URLSearchParams();
      Object.keys(values).forEach(function (k) { params.set(k, values[k]); });
      const s = params.toString();
      location.hash = '#/shop' + (s ? '?' + s : '');
    });
  }

  const farmers = document.getElementById('farmerFilters');
  if (farmers) {
    farmers.addEventListener('submit', function (e) {
      e.preventDefault();
      const params = new URLSearchParams();
      new FormData(farmers).forEach(function (v, k) {
        if (v == null) return;
        const val = String(v).trim();
        if (val) params.set(k, val);
      });
      const s = params.toString();
      location.hash = '#/farmers' + (s ? '?' + s : '');
    });
  }

  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.setAttribute('aria-expanded', btn.parentElement.classList.contains('open') ? 'true' : 'false');
    btn.addEventListener('click', function () {
      const open = btn.parentElement.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  const contact = document.getElementById('contactForm');
  if (contact) {
    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(contact));
      const submitBtn = document.getElementById('contactSubmit');
      if (submitBtn && submitBtn.disabled) return;
      let firstInvalid = null;
      contact.querySelectorAll('[data-err]').forEach(function (el) { el.textContent = ''; });
      contact.querySelectorAll('.input').forEach(function (el) { el.removeAttribute('aria-invalid'); });

      function fail(field, message) {
        const err = contact.querySelector('[data-err="' + field + '"]');
        const input = contact.querySelector('[name="' + field + '"]');
        if (err) err.textContent = message;
        if (input) input.setAttribute('aria-invalid', 'true');
        if (!firstInvalid && input) firstInvalid = input;
      }

      const name = String(data.name || '').trim();
      const email = String(data.email || '').trim();
      const message = String(data.message || '').trim();
      if (name.length < 2) fail('name', 'Please enter your name (at least 2 characters)');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail('email', 'Enter a valid email address');
      if (message.length < 10) fail('message', 'Please write at least 10 characters');
      if (firstInvalid) { firstInvalid.focus(); return; }

      // Simulate a short send so duplicate clicks are prevented and feedback is clear.
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
      setTimeout(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
        contact.reset();
        const box = document.getElementById('formSuccess');
        if (box) {
          box.innerHTML = '<div class="success-box" role="status">✅ Thanks! Your message passed validation. <strong>Nothing was actually sent</strong> — this is a front-end demo.</div>';
        }
        // Move focus to the confirmation so screen-reader users hear it.
        if (box) { box.setAttribute('tabindex', '-1'); box.focus(); }
      }, 650);
    });
  }

  const farmerForm = document.getElementById('farmerForm');
  if (farmerForm) {
    farmerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      farmerForm.querySelectorAll('[data-err]').forEach(function (el) { el.textContent = ''; });
      farmerForm.querySelectorAll('.input').forEach(function (el) { el.removeAttribute('aria-invalid'); });

      let firstInvalid = null;
      function fail(field, message) {
        const err = farmerForm.querySelector('[data-err="' + field + '"]');
        const input = farmerForm.querySelector('[name="' + field + '"]');
        if (err) err.textContent = message;
        if (input) input.setAttribute('aria-invalid', 'true');
        if (!firstInvalid && input) firstInvalid = input;
      }

      const data = Object.fromEntries(new FormData(farmerForm));
      const name = String(data.farmerName || '').trim();
      const phone = String(data.phone || '').replace(/\s+/g, '');
      const email = String(data.email || '').trim();
      const farmName = String(data.farmName || '').trim();
      const village = String(data.village || '').trim();
      const district = String(data.district || '').trim();
      const state = String(data.state || '').trim();
      const description = String(data.farmDescription || '').trim();
      const categories = Array.from(farmerForm.querySelectorAll('input[name="categories"]:checked')).map(function (i) { return i.value; });

      if (name.length < 2) fail('farmerName', 'Please enter your name (at least 2 characters)');
      if (!/^[6-9]\d{9}$/.test(phone)) fail('phone', 'Enter a valid 10-digit Indian mobile number');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail('email', 'Enter a valid email address');
      if (farmName.length < 2) fail('farmName', 'Please enter your farm name');
      if (!village) fail('village', 'Please enter your village or town');
      if (!district) fail('district', 'Please enter your district');
      if (!state) fail('state', 'Please enter your state');
      if (description.length < 10) fail('farmDescription', 'Please describe your farm in at least 10 characters');
      if (description.length > 600) fail('farmDescription', 'Please keep the description under 600 characters');
      if (!categories.length) fail('categories', 'Select at least one product category');
      if (firstInvalid) { firstInvalid.focus(); return; }

      const editing = !!currentFarmer();
      const saved = registerFarmer({
        farmerName: name,
        phone: phone,
        email: email,
        farmName: farmName,
        village: village,
        district: district,
        state: state || 'Karnataka',
        farmDescription: description,
        categories: categories,
        farmingMethod: data.farmingMethod,
        approvalStatus: data.approvalStatus,
      });
      if (!saved) { toast('Could not save the farm profile. Please check the details.'); return; }
      toast(editing ? 'Farm profile updated' : 'Farm registered — welcome!');
      if (location.hash === '#/farmer') render({ focus: true });
      else location.hash = '#/farmer';
    });
  }

  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', function (e) {
      e.preventDefault();
      productForm.querySelectorAll('[data-err]').forEach(function (el) { el.textContent = ''; });
      productForm.querySelectorAll('.input').forEach(function (el) { el.removeAttribute('aria-invalid'); });

      let firstInvalid = null;
      function fail(field, message) {
        const err = productForm.querySelector('[data-err="' + field + '"]');
        const input = productForm.querySelector('[name="' + field + '"]');
        if (err) err.textContent = message;
        if (input) input.setAttribute('aria-invalid', 'true');
        if (!firstInvalid && input) firstInvalid = input;
      }

      const data = Object.fromEntries(new FormData(productForm));
      const name = String(data.name || '').trim();
      const description = String(data.description || '').trim();
      const price = Number(data.price);
      const stock = Number(data.stockQuantity);

      if (name.length < 2) fail('name', 'Product name is required (at least 2 characters)');
      if (description.length < 10) fail('description', 'Add a short description (at least 10 characters)');
      if (description.length > 600) fail('description', 'Please keep the description under 600 characters');
      if (!isFinite(price) || price <= 0) fail('price', 'Enter a price greater than 0');
      else if (price > 1000000) fail('price', 'Price looks too high — enter a value below ₹10,00,000');
      if (!isFinite(stock) || stock < 0) fail('stockQuantity', 'Enter a stock quantity of 0 or more');
      else if (Math.floor(stock) !== stock) fail('stockQuantity', 'Stock quantity must be a whole number');
      else if (stock > 1000000) fail('stockQuantity', 'Stock quantity is too large for this demo');
      if (firstInvalid) { firstInvalid.focus(); return; }

      const existingId = productForm.getAttribute('data-product-id') || null;
      const result = saveFarmerProduct({
        name: name,
        description: description,
        price: price,
        stockQuantity: stock,
        categoryId: data.categoryId,
        unit: data.unit,
        farmingMethod: data.farmingMethod,
        availabilityStatus: data.availabilityStatus,
        images: draftImages,
      }, existingId);
      if (!result) { toast('Could not save this product. Please check the values.'); return; }
      if (stock === 0 && data.availabilityStatus === 'in_stock') {
        toast('Saved as out of stock because the quantity is 0');
      } else {
        toast(result.persisted
          ? (existingId ? 'Product updated' : 'Product added to your farm')
          : 'Saved for this session only — browser storage is full.');
      }
      if (location.hash === '#/farmer') render({ focus: true });
      else location.hash = '#/farmer';
    });

    const imageInput = document.getElementById('pfImages');
    if (imageInput) {
      imageInput.addEventListener('change', function () {
        const files = Array.prototype.slice.call(imageInput.files || []).filter(function (f) {
          return /^image\/(jpeg|png|webp|gif)$/i.test(f.type);
        });
        imageInput.value = '';
        if (!files.length) { toast('Please choose a JPG, PNG, WebP or GIF image.'); return; }
        const room = 3 - draftImages.length;
        if (room <= 0) { toast('You can add up to 3 photos per product'); return; }
        if (files.length > room) toast('Only the first ' + room + ' photo' + (room === 1 ? '' : 's') + ' added');
        const queue = files.slice(0, room);
        let index = 0;
        function next() {
          if (index >= queue.length) {
            const previews = document.getElementById('imagePreviews');
            if (previews) previews.innerHTML = imagePreviewsHTML();
            return;
          }
          compressImage(queue[index++], function (dataUrl) {
            if (dataUrl) draftImages.push(dataUrl);
            next();
          });
        }
        next();
      });
    }
  }

  const checkout = document.getElementById('checkoutForm');
  if (checkout) {
    checkout.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(checkout));
      let firstInvalid = null;
      checkout.querySelectorAll('[data-err]').forEach(function (el) { el.textContent = ''; });
      checkout.querySelectorAll('.input').forEach(function (el) { el.removeAttribute('aria-invalid'); });

      function fail(field, message) {
        const err = checkout.querySelector('[data-err="' + field + '"]');
        const input = checkout.querySelector('[name="' + field + '"]');
        if (err) err.textContent = message;
        if (input) input.setAttribute('aria-invalid', 'true');
        if (!firstInvalid && input) firstInvalid = input;
      }

      const name = (data.name || '').trim();
      const phone = (data.phone || '').replace(/\s+/g, '');
      const address = (data.address || '').trim();
      const city = (data.city || '').trim();
      const pincode = (data.pincode || '').trim();

      if (name.length < 2) fail('name', 'Please enter your full name (at least 2 characters)');
      if (!/^[6-9]\d{9}$/.test(phone)) fail('phone', 'Enter a valid 10-digit Indian mobile number');
      if (address.length < 5) fail('address', 'Please enter your delivery address');
      if (city.length < 2) fail('city', 'Please enter your city or town');
      if (!/^\d{6}$/.test(pincode)) fail('pincode', 'Enter a valid 6-digit PIN code');
      if (firstInvalid) { firstInvalid.focus(); return; }

      const lines = cartLines();
      if (!lines.length) {
        toast('Your cart is empty or some items are no longer available.');
        render({ focus: true });
        return;
      }
      const stale = lines.find(function (line) {
        return !line.product ||
          line.product.availabilityStatus === 'out_of_stock' ||
          Number(line.product.stockQuantity) <= 0 ||
          line.qty > Number(line.product.stockQuantity);
      });
      if (stale) {
        toast('Some items are no longer available in the requested quantity. Please review your cart.');
        render({ focus: true });
        return;
      }

      const subtotal = cartSubtotal();
      const delivery = subtotal >= FREE_DELIVERY_OVER ? 0 : DELIVERY_FEE;
      const orderId = 'KM' + String(Date.now()).slice(-8);
      const items = lines.map(function (line) {
        return {
          productId: line.product._id,
          name: line.product.name,
          farmerId: line.product.farmerProfileId,
          farmerName: line.product.farmerName,
          price: line.product.price,
          qty: line.qty,
          unit: line.product.unit,
        };
      });
      const created = createOrder({
        id: orderId,
        customer: { name: name, phone: phone, address: address, city: city, pincode: pincode },
        payment: data.payment === 'upi' ? 'upi' : 'cod',
        items: items,
        delivery: delivery,
      });
      if (!created) {
        toast('Could not place the demo order. Please try again.');
        return;
      }
      lastOrder = {
        id: orderId,
        name: name,
        city: city,
        total: created.order.total,
      };
      writeCart([]);
      render({ focus: true });
      if (!created.persisted) toast('Order saved for this session only — browser storage is full.');
    });
  }
}

// ---- init ----

const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

function setNavOpen(open) {
  mainNav.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navToggle.textContent = open ? '✕' : '☰';
}

navToggle.addEventListener('click', function () {
  setNavOpen(!mainNav.classList.contains('open'));
});

mainNav.addEventListener('click', function (e) {
  if (e.target.closest('a')) setNavOpen(false);
});

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && mainNav.classList.contains('open')) {
    setNavOpen(false);
    navToggle.focus();
  }
});

document.addEventListener('click', function (e) {
  if (!mainNav.contains(e.target) && !navToggle.contains(e.target)) setNavOpen(false);
});

document.getElementById('skipLink').addEventListener('click', function (e) {
  e.preventDefault();
  app.focus();
  app.scrollIntoView();
});

// Delegated actions shared by every page.
document.addEventListener('click', function (e) {
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) {
    const id = addBtn.getAttribute('data-add');
    const sourceId = addBtn.getAttribute('data-qty-from');
    const source = sourceId ? document.getElementById(sourceId) : null;
    const qty = source ? Math.max(1, Math.floor(Number(source.value) || 1)) : 1;
    const result = addToCart(id, qty);
    if (!result.ok) {
      if (result.reason === 'max') {
        toast('You already have the maximum available quantity in your cart.');
      } else {
        toast('Sorry, this product is out of stock.');
      }
      return;
    }
    if (source) source.value = '1';
    if (result.capped) toast('Only ' + result.max + ' available — added ' + result.added + ' to your cart.');
    else toast(result.product.name + ' added to cart');
    return;
  }

  const stepBtn = e.target.closest('[data-detail-step]');
  if (stepBtn) {
    const input = document.getElementById('detailQty');
    if (!input) return;
    const max = Math.max(1, Number(input.max) || 1);
    const next = Math.min(max, Math.max(1, (Number(input.value) || 1) + Number(stepBtn.getAttribute('data-detail-step'))));
    input.value = String(next);
    return;
  }

  const thumb = e.target.closest('[data-thumb]');
  if (thumb) {
    const main = document.getElementById('galleryMain');
    if (main) main.src = thumb.getAttribute('data-thumb');
    document.querySelectorAll('.gallery-thumbs .thumb').forEach(function (btn) {
      const active = btn === thumb;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    return;
  }

  const cartQtyBtn = e.target.closest('[data-cart-qty]');
  if (cartQtyBtn) {
    const id = cartQtyBtn.getAttribute('data-cart-qty');
    const delta = Number(cartQtyBtn.getAttribute('data-delta')) || 0;
    const line = readCart().find(function (l) { return l.id === id; });
    if (!line) return;
    setCartQty(id, line.qty + delta);
    render();
    return;
  }

  const removeBtn = e.target.closest('[data-cart-remove]');
  if (removeBtn) {
    removeFromCart(removeBtn.getAttribute('data-cart-remove'));
    toast('Removed from cart');
    render();
    return;
  }

  if (e.target.closest('[data-demo-farm]')) {
    signInDemoFarmer();
    return;
  }

  if (e.target.closest('[data-approve-farmer]')) {
    if (setFarmerApproval('approved')) {
      toast('Approval status updated (demo)');
      render();
    }
    return;
  }

  if (e.target.closest('[data-signout]')) {
    clearFarmerAccount();
    toast('Signed out of the farmer demo');
    render();
    return;
  }

  if (e.target.closest('[data-reset-store]')) {
    if (!window.confirm('Reset all farmer demo data? This clears the registered farm, products and orders stored in this browser.')) return;
    resetFarmerDemoData();
    location.reload();
    return;
  }

  const deleteBtn = e.target.closest('[data-delete-product]');
  if (deleteBtn) {
    const product = findProduct(deleteBtn.getAttribute('data-delete-product'));
    if (!product) return;
    if (!window.confirm('Delete “' + product.name + '”? This cannot be undone.')) return;
    if (deleteFarmerProduct(product._id)) {
      writeCart(readCart());
      toast('Product deleted');
      render();
    }
    return;
  }

  const stockBtn = e.target.closest('[data-toggle-stock]');
  if (stockBtn) {
    const product = findProduct(stockBtn.getAttribute('data-toggle-stock'));
    if (!product) return;
    const next = product.availabilityStatus === 'out_of_stock' ? 'in_stock' : 'out_of_stock';
    if (setProductAvailability(product._id, next)) {
      toast(next === 'out_of_stock' ? 'Marked out of stock' : 'Marked in stock');
      render();
    } else {
      toast('Add a stock quantity above 0 before marking this product available.');
    }
    return;
  }

  if (e.target.closest('[data-demo-orders]')) {
    const account = currentFarmer();
    if (!account) return;
    if (!farmerProducts(account.id).length) {
      toast('Add a product first, then generate demo orders.');
      return;
    }
    const created = generateDemoOrders(account.id, 3);
    toast(created.length + ' demo order' + (created.length === 1 ? '' : 's') + ' generated');
    render();
    return;
  }

  const imgRemove = e.target.closest('[data-img-remove]');
  if (imgRemove) {
    const index = Number(imgRemove.getAttribute('data-img-remove'));
    if (index >= 0 && index < draftImages.length) draftImages.splice(index, 1);
    const previews = document.getElementById('imagePreviews');
    if (previews) previews.innerHTML = imagePreviewsHTML();
    return;
  }

  const pinBtn = e.target.closest('[data-pin-check]');
  if (pinBtn) {
    const input = document.getElementById('pinCheck');
    const result = document.getElementById('pinCheckResult');
    if (!input || !result) return;
    const pin = String(input.value || '').trim();
    result.classList.remove('ok', 'no');
    if (!/^\d{6}$/.test(pin)) {
      result.textContent = 'Enter a valid 6-digit PIN code.';
      result.classList.add('no');
      input.focus();
      return;
    }
    if (DELIVERY_PINS.indexOf(pin) >= 0) {
      result.textContent = '✅ Demo delivery available to PIN ' + pin + '. This is a simulated serviceability check.';
      result.classList.add('ok');
    } else {
      result.textContent = '❌ Outside the demo delivery PIN list. In this prototype only selected PINs are shown as serviceable.';
      result.classList.add('no');
    }
    return;
  }

  const pageBtn = e.target.closest('[data-goto]');
  if (pageBtn) {
    e.preventDefault();
    const { path, q } = parseHash();
    const params = new URLSearchParams(q);
    params.set('page', pageBtn.getAttribute('data-goto'));
    location.hash = '#' + path + '?' + params.toString();
  }
});

document.addEventListener('change', function (e) {
  if (e.target && e.target.id === 'detailQty') {
    const input = e.target;
    const max = Math.max(1, Math.floor(Number(input.max) || 1));
    const next = Math.min(max, Math.max(1, Math.floor(Number(input.value) || 1)));
    input.value = String(next);
    return;
  }

  const select = e.target.closest('[data-order-status]');
  if (!select) return;
  const status = select.value;
  if (status === 'cancelled' && !window.confirm('Cancel this demo order? The customer is not notified.')) {
    render();
    return;
  }
  if (updateOrderStatus(select.getAttribute('data-order-status'), status)) {
    toast('Order status updated to “' + (ORDER_STATUS_LABELS[status] || status) + '” (demo)');
    render();
  } else {
    toast('Could not update the order status.');
    render();
  }
});

// Keep the cart badge and cart page in sync when another tab changes storage.
window.addEventListener('storage', function (e) {
  if (e.key !== CART_KEY) return;
  cartFallback = null;
  updateCartBadge();
  if ((parseHash().segments[0] || '') === 'cart') render();
});

// Replace broken/unsupported images with a visible placeholder instead of a broken icon.
document.addEventListener('error', function (e) {
  const img = e.target;
  if (!img || img.tagName !== 'IMG' || img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = '1';
  img.classList.add('img-fallback');
  img.src = FALLBACK_IMAGE;
}, true);

document.getElementById('year').textContent = new Date().getFullYear();

window.addEventListener('hashchange', function () { render({ focus: true }); });
render();
