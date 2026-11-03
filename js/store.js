// Krishi Market — farmer portal data layer (localStorage only, demo)
// Loaded after data.js so it can extend the seeded products/farmers in place.

/* ---------------- small persistence helpers ---------------- */

const FARMER_ACCOUNT_KEY = 'krishi-farmer-account-v1';
const FARMER_PRODUCTS_KEY = 'krishi-farmer-products-v1';
const FARMER_ORDERS_KEY = 'krishi-orders-v1';
const STORE_KEYS = [FARMER_ACCOUNT_KEY, FARMER_PRODUCTS_KEY, FARMER_ORDERS_KEY];

const ORDER_STATUSES = ['placed', 'packed', 'shipped', 'delivered', 'cancelled'];
const ORDER_STATUS_LABELS = {
  placed: 'Order placed',
  packed: 'Packed',
  shipped: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
const APPROVAL_LABELS = { pending: 'Pending review', approved: 'Approved', rejected: 'Rejected' };

// In-memory mirror so the demo keeps working where localStorage is blocked.
const storeMemory = {};

function cloneData(value) { return JSON.parse(JSON.stringify(value)); }

function storeRead(key, fallback) {
  if (Object.prototype.hasOwnProperty.call(storeMemory, key)) return storeMemory[key];
  try {
    const raw = localStorage.getItem(key);
    if (raw != null) return JSON.parse(raw);
  } catch (e) { /* blocked or corrupt — fall through */ }
  return typeof fallback === 'function' ? fallback() : fallback;
}

function storeWrite(key, value) {
  storeMemory[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

/* ---------------- product persistence ---------------- */

const SEED_PRODUCT_IDS = PRODUCTS.map(function (p) { return p._id; });
const SEEDED_FARMER_IDS = FARMERS.map(function (f) { return f.id; });

function emptyProductState() { return { custom: [], overrides: {}, deleted: [] }; }

function readProductState() {
  const state = storeRead(FARMER_PRODUCTS_KEY, null);
  if (!state || typeof state !== 'object') return emptyProductState();
  return {
    custom: Array.isArray(state.custom) ? state.custom : [],
    overrides: state.overrides && typeof state.overrides === 'object' ? state.overrides : {},
    deleted: Array.isArray(state.deleted) ? state.deleted : [],
  };
}

let farmerProductState = readProductState();

function persistFarmerProductState() {
  return storeWrite(FARMER_PRODUCTS_KEY, farmerProductState);
}

// Re-apply saved edits/deletions/custom products onto the seeded catalogue.
function applyFarmerProductState() {
  farmerProductState.deleted.forEach(function (id) {
    const index = PRODUCTS.findIndex(function (p) { return p._id === id; });
    if (index >= 0) PRODUCTS.splice(index, 1);
  });
  Object.keys(farmerProductState.overrides).forEach(function (id) {
    const product = findProduct(id);
    if (product) Object.assign(product, cloneData(farmerProductState.overrides[id]));
  });
  farmerProductState.custom.forEach(function (product) {
    if (!product || !product._id || findProduct(product._id)) return;
    PRODUCTS.push(cloneData(product));
  });
}

function persistProductRecord(product) {
  const stored = cloneData(product);
  const customIndex = farmerProductState.custom.findIndex(function (p) { return p._id === product._id; });
  if (customIndex >= 0) {
    farmerProductState.custom[customIndex] = stored;
  } else if (SEED_PRODUCT_IDS.indexOf(product._id) >= 0) {
    farmerProductState.overrides[product._id] = stored;
  } else {
    farmerProductState.custom.push(stored);
  }
  farmerProductState.deleted = farmerProductState.deleted.filter(function (id) { return id !== product._id; });
  return persistFarmerProductState();
}

/* ---------------- farmer account ---------------- */

let farmerAccount = storeRead(FARMER_ACCOUNT_KEY, null);
if (farmerAccount && !farmerAccount.id) farmerAccount = null;

function currentFarmer() { return farmerAccount; }

function categoryImageFor(names) {
  const list = names || [];
  for (let i = 0; i < CATEGORIES.length; i++) {
    if (list.indexOf(CATEGORIES[i].name) >= 0) return CATEGORIES[i].image;
  }
  return '';
}

// Mirror the account into the public farmer directory so products/links work.
function farmerProfileFromAccount(account) {
  return {
    id: account.id,
    farmerName: account.farmerName,
    farmName: account.farmName,
    farmDescription: account.farmDescription,
    village: account.village || '',
    district: account.district || '',
    state: account.state || 'Karnataka',
    cropTypes: account.categories || [],
    farmingMethod: account.farmingMethod || 'Organic',
    farmImage: account.farmImage || categoryImageFor(account.categories),
    ratingAvg: 0,
    ratingCount: 0,
    approvalStatus: account.approvalStatus || 'pending',
    isRegistered: true,
  };
}

function syncFarmerDirectory() {
  if (!farmerAccount) return;
  const profile = farmerProfileFromAccount(farmerAccount);
  const existing = FARMERS.find(function (f) { return f.id === profile.id; });
  if (existing) {
    const ratingAvg = existing.ratingAvg;
    const ratingCount = existing.ratingCount;
    const farmImage = existing.farmImage;
    Object.assign(existing, profile);
    existing.ratingAvg = ratingAvg;
    existing.ratingCount = ratingCount;
    if (!profile.farmImage) existing.farmImage = farmImage;
  } else {
    FARMERS.push(profile);
  }
}

function syncFarmerProductsFromAccount(account) {
  const origin = [account.village, account.district].filter(Boolean).join(', ');
  farmerProducts(account.id).forEach(function (product) {
    product.farmerName = account.farmerName;
    product.origin = origin;
    const customIndex = farmerProductState.custom.findIndex(function (p) { return p._id === product._id; });
    if (customIndex >= 0) farmerProductState.custom[customIndex] = cloneData(product);
  });
  persistFarmerProductState();
}

function saveFarmerAccount(account) {
  farmerAccount = account;
  storeWrite(FARMER_ACCOUNT_KEY, account);
  syncFarmerDirectory();
  syncFarmerProductsFromAccount(account);
  return account;
}

function clearFarmerAccount() {
  farmerAccount = null;
  storeWrite(FARMER_ACCOUNT_KEY, null);
}

function registerFarmer(data) {
  const existing = farmerAccount;
  const account = {
    id: existing ? existing.id : 'farm-' + Date.now().toString(36),
    farmerName: data.farmerName,
    phone: data.phone,
    email: data.email,
    farmName: data.farmName,
    village: data.village,
    district: data.district,
    state: data.state || 'Karnataka',
    farmDescription: data.farmDescription,
    categories: data.categories || [],
    farmingMethod: data.farmingMethod || 'Organic',
    approvalStatus: data.approvalStatus || 'pending',
    farmImage: (existing && existing.farmImage) || categoryImageFor(data.categories),
    registeredAt: existing ? existing.registeredAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return saveFarmerAccount(account);
}

function setFarmerApproval(status) {
  if (!farmerAccount) return null;
  farmerAccount.approvalStatus = APPROVAL_LABELS[status] ? status : 'pending';
  return saveFarmerAccount(farmerAccount);
}

/* ---------------- products ---------------- */

function nextProductId() {
  let id;
  do {
    id = 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  } while (findProduct(id));
  return id;
}

function saveFarmerProduct(data, existingId) {
  if (!farmerAccount) return null;

  let product = null;
  if (existingId) {
    product = findProduct(existingId);
    if (!product || product.farmerProfileId !== farmerAccount.id) return null;
  }

  const category = CATEGORIES.find(function (c) { return c._id === data.categoryId; }) || CATEGORIES[0];
  const now = new Date().toISOString();
  const images = (data.images && data.images.length)
    ? data.images.slice(0, 3)
    : (category.image ? [category.image] : []);
  const stockQuantity = Math.max(0, Math.floor(Number(data.stockQuantity) || 0));
  const availabilityStatus = stockQuantity === 0
    ? 'out_of_stock'
    : (data.availabilityStatus === 'out_of_stock' ? 'out_of_stock' : 'in_stock');

  const fields = {
    name: String(data.name || '').trim(),
    description: String(data.description || '').trim(),
    categoryId: category._id,
    categorySlug: category.slug,
    categoryName: category.name,
    images: images,
    price: Math.max(0, Number(data.price) || 0),
    unit: data.unit || 'kg',
    stockQuantity: stockQuantity,
    availabilityStatus: availabilityStatus,
    farmingMethod: data.farmingMethod || 'Organic',
    certificationDetails: (data.farmingMethod || 'Organic') === 'Organic'
      ? 'Grown without synthetic pesticides or fertilisers.' : '',
    origin: [farmerAccount.village, farmerAccount.district].filter(Boolean).join(', '),
    updatedAt: now,
  };

  const isNew = !product;
  if (product) {
    Object.assign(product, fields);
  } else {
    product = Object.assign({
      _id: nextProductId(),
      farmerId: farmerAccount.id,
      farmerProfileId: farmerAccount.id,
      farmerName: farmerAccount.farmerName,
      harvestDate: now,
      createdAt: now,
      soldCount: 0,
      ratingAvg: 0,
      ratingCount: 0,
    }, fields);
    PRODUCTS.push(product);
  }

  const persisted = persistProductRecord(product);
  return { product: product, persisted: persisted, isNew: isNew };
}

function setProductAvailability(id, status) {
  if (!farmerAccount) return null;
  const product = findProduct(id);
  if (!product || product.farmerProfileId !== farmerAccount.id) return null;
  product.availabilityStatus = status === 'out_of_stock' ? 'out_of_stock' : 'in_stock';
  persistProductRecord(product);
  return product;
}

function deleteFarmerProduct(id) {
  if (!farmerAccount) return false;
  const product = findProduct(id);
  if (!product || product.farmerProfileId !== farmerAccount.id) return false;

  const index = PRODUCTS.findIndex(function (p) { return p._id === id; });
  if (index >= 0) PRODUCTS.splice(index, 1);

  const customIndex = farmerProductState.custom.findIndex(function (p) { return p._id === id; });
  if (customIndex >= 0) {
    farmerProductState.custom.splice(customIndex, 1);
  } else {
    if (SEED_PRODUCT_IDS.indexOf(id) >= 0 && farmerProductState.deleted.indexOf(id) < 0) {
      farmerProductState.deleted.push(id);
    }
    delete farmerProductState.overrides[id];
  }
  persistFarmerProductState();
  return true;
}

/* ---------------- orders ---------------- */

const DEMO_CUSTOMERS = [
  { name: 'Priya Sharma', phone: '9845012345', address: '12, 4th Cross, Jayanagar', city: 'Bengaluru', pincode: '560041' },
  { name: 'Arun Kumar', phone: '9900456721', address: '45, Lake View Layout', city: 'Mysuru', pincode: '570011' },
  { name: 'Meena Rao', phone: '9741288900', address: '8, Temple Street, Kuvempunagar', city: 'Mysuru', pincode: '570023' },
  { name: 'Suresh Babu', phone: '9611223344', address: '201, Sai Residency, HSR Layout', city: 'Bengaluru', pincode: '560102' },
  { name: 'Kavitha Nair', phone: '9535447788', address: '17, Rose Garden, Vijayanagar', city: 'Mandya', pincode: '571401' },
  { name: 'Rahul Thomas', phone: '9008877665', address: '3B, Palm Grove Apartments, Whitefield', city: 'Bengaluru', pincode: '560066' },
];

let farmOrders = [];

function buildDemoOrder(id, customer, items, status, placedAt) {
  const subtotal = items.reduce(function (n, i) { return n + i.price * i.qty; }, 0);
  const delivery = subtotal >= 499 ? 0 : 39;
  return {
    id: id,
    placedAt: placedAt,
    customer: cloneData(customer),
    payment: subtotal % 2 ? 'upi' : 'cod',
    status: status,
    items: items,
    subtotal: subtotal,
    delivery: delivery,
    total: subtotal + delivery,
    demo: true,
    statusHistory: [{ status: status, at: placedAt }],
  };
}

function demoOrderItems(productList, farmer, seed) {
  const items = [];
  const count = productList.length > 1 ? 2 : 1;
  for (let j = 0; j < count; j++) {
    const product = productList[(seed + j * 2) % productList.length];
    if (items.some(function (i) { return i.productId === product._id; })) continue;
    items.push({
      productId: product._id,
      name: product.name,
      farmerId: farmer.id,
      farmerName: farmer.farmerName,
      price: product.price,
      qty: 1 + ((seed + j) % 3),
      unit: product.unit,
    });
  }
  return items;
}

function seedDemoOrders() {
  const seeded = [];
  let seq = 1;
  FARMERS.filter(function (f) { return SEEDED_FARMER_IDS.indexOf(f.id) >= 0; }).forEach(function (farmer, fi) {
    const productList = farmerProducts(farmer.id);
    if (!productList.length) return;
    for (let k = 0; k < 3; k++) {
      const customer = DEMO_CUSTOMERS[(fi * 2 + k) % DEMO_CUSTOMERS.length];
      const items = demoOrderItems(productList, farmer, fi + k);
      const status = ['delivered', 'shipped', 'placed', 'packed'][(fi + k) % 4];
      const placedAt = daysAgo(1 + (fi * 3 + k) * 2 + (status === 'delivered' ? 4 : 0));
      seeded.push(buildDemoOrder('KM' + (900000 + seq++), customer, items, status, placedAt));
    }
  });
  return seeded;
}

function initOrders() {
  const stored = storeRead(FARMER_ORDERS_KEY, null);
  if (Array.isArray(stored)) {
    farmOrders = stored;
    return;
  }
  farmOrders = seedDemoOrders();
  storeWrite(FARMER_ORDERS_KEY, farmOrders);
}

function farmerOrdersFor(farmerId) {
  return farmOrders.filter(function (order) {
    return order.items && order.items.some(function (item) { return item.farmerId === farmerId; });
  }).sort(function (a, b) { return new Date(b.placedAt) - new Date(a.placedAt); });
}

function orderItemsFor(order, farmerId) {
  return (order.items || []).filter(function (item) { return item.farmerId === farmerId; });
}

function orderTotalFor(order, farmerId) {
  return orderItemsFor(order, farmerId).reduce(function (n, i) { return n + i.price * i.qty; }, 0);
}

function farmerDashboardStats(farmerId) {
  const productList = farmerProducts(farmerId);
  const orders = farmerOrdersFor(farmerId);
  let earnings = 0;
  let activeOrders = 0;
  orders.forEach(function (order) {
    if (order.status === 'cancelled') return;
    activeOrders++;
    orderItemsFor(order, farmerId).forEach(function (item) { earnings += item.price * item.qty; });
  });
  return {
    totalProducts: productList.length,
    availableProducts: productList.filter(function (p) {
      return p.stockQuantity > 0 && p.availabilityStatus !== 'out_of_stock';
    }).length,
    totalOrders: orders.length,
    activeOrders: activeOrders,
    earnings: earnings,
  };
}

function createOrder(payload) {
  const subtotal = Number(payload.subtotal) || 0;
  const delivery = Number(payload.delivery) || 0;
  const order = {
    id: payload.id,
    placedAt: new Date().toISOString(),
    customer: cloneData(payload.customer || {}),
    payment: payload.payment || 'cod',
    status: 'placed',
    items: cloneData(payload.items || []),
    subtotal: subtotal,
    delivery: delivery,
    total: Number(payload.total) || subtotal + delivery,
    demo: false,
    statusHistory: [{ status: 'placed', at: new Date().toISOString() }],
  };
  farmOrders.push(order);
  storeWrite(FARMER_ORDERS_KEY, farmOrders);
  return order;
}

function updateOrderStatus(orderId, status) {
  if (ORDER_STATUSES.indexOf(status) < 0) return false;
  const order = farmOrders.find(function (o) { return o.id === orderId; });
  if (!order) return false;
  const at = new Date().toISOString();
  order.status = status;
  order.updatedAt = at;
  order.statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : [];
  order.statusHistory.push({ status: status, at: at });
  storeWrite(FARMER_ORDERS_KEY, farmOrders);
  return true;
}

function generateDemoOrders(farmerId, count) {
  const productList = farmerProducts(farmerId);
  const farmer = findFarmer(farmerId);
  if (!productList.length || !farmer) return [];
  const created = [];
  const total = count || 3;
  const plan = ['placed', 'packed', 'shipped', 'delivered'];
  for (let k = 0; k < total; k++) {
    const customer = DEMO_CUSTOMERS[(farmOrders.length + k) % DEMO_CUSTOMERS.length];
    const items = demoOrderItems(productList, farmer, k);
    const status = plan[k % plan.length];
    const order = buildDemoOrder('KM' + (900000 + farmOrders.length + k + 1), customer, items, status, daysAgo(1 + k * 2));
    created.push(order);
    farmOrders.push(order);
  }
  storeWrite(FARMER_ORDERS_KEY, farmOrders);
  return created;
}

function resetFarmerDemoData() {
  STORE_KEYS.forEach(function (key) {
    delete storeMemory[key];
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  });
}

/* ---------------- init ---------------- */

applyFarmerProductState();
syncFarmerDirectory();
initOrders();
