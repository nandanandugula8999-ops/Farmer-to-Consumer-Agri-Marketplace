// Krishi Market — demo data (all in-browser, no backend)

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const CATEGORIES = [
  { _id: 'c1', name: 'Vegetables', slug: 'vegetables', description: 'Farm-fresh seasonal vegetables', image: 'images/tomato-pile.jpg' },
  { _id: 'c2', name: 'Fruits', slug: 'fruits', description: 'Naturally ripened local fruits', image: 'images/brinjal.jpg' },
  { _id: 'c3', name: 'Dairy Products', slug: 'dairy-products', description: 'Milk, curd, ghee and more', image: 'images/green-beans.jpg' },
  { _id: 'c4', name: 'Grains & Pulses', slug: 'grains-pulses', description: 'Rice, ragi, wheat and dals', image: '' },
  { _id: 'c5', name: 'Organic Products', slug: 'organic-products', description: 'Certified organic produce', image: 'images/spinach-leaves.jpg' },
  { _id: 'c6', name: 'Herbs & Other Produce', slug: 'herbs-other-produce', description: 'Fresh herbs and other farm goods', image: '' },
];

const FARMERS = [
  {
    id: 'f1', farmerName: 'Ramesh Gowda', farmName: 'Gowda Family Farm',
    farmDescription: 'Third-generation family farm growing tomatoes, ragi and paddy with organic practices.',
    village: 'Srirangapatna', district: 'Mandya', state: 'Karnataka',
    cropTypes: ['Tomato', 'Ragi', 'Paddy'], farmingMethod: 'Organic', farmImage: 'images/tomato-pile.jpg',
    ratingAvg: 4.8, ratingCount: 24,
  },
  {
    id: 'f2', farmerName: 'Lakshmi Devi', farmName: 'Devi Green Fields',
    farmDescription: 'Women-led farm specialising in leafy greens and root vegetables.',
    village: 'Hunsur', district: 'Mysuru', state: 'Karnataka',
    cropTypes: ['Spinach', 'Carrot', 'Beans', 'Onion'], farmingMethod: 'Organic', farmImage: 'images/spinach-leaves.jpg',
    ratingAvg: 4.7, ratingCount: 18,
  },
  {
    id: 'f3', farmerName: 'Anand K.', farmName: 'Anand Orchards',
    farmDescription: 'Orchard farm growing Alphonso mangoes and Yelakki bananas.',
    village: 'Mulbagal', district: 'Kolar', state: 'Karnataka',
    cropTypes: ['Mango', 'Banana'], farmingMethod: 'Conventional', farmImage: 'images/brinjal.jpg',
    ratingAvg: 4.5, ratingCount: 12,
  },
  {
    id: 'f4', farmerName: 'Fatima S.', farmName: 'Fatima Agro',
    farmDescription: 'Mixed produce farm focused on banana and carrots.',
    village: 'Nanjangud', district: 'Mysuru', state: 'Karnataka',
    cropTypes: ['Banana', 'Carrot', 'Papaya'], farmingMethod: 'Organic', farmImage: 'images/carrots-market.jpg',
    ratingAvg: 4.6, ratingCount: 15,
  },
  {
    id: 'f5', farmerName: 'Joseph D.', farmName: 'Joseph Dairy & Poultry',
    farmDescription: 'Dairy and poultry farm supplying fresh milk and country eggs.',
    village: 'Devanahalli', district: 'Bengaluru Rural', state: 'Karnataka',
    cropTypes: ['Dairy', 'Poultry', 'Beans'], farmingMethod: 'Organic', farmImage: 'images/green-beans.jpg',
    ratingAvg: 4.9, ratingCount: 31,
  },
];

function makeProduct(id, farmerIdx, name, catId, catSlug, catName, price, unit, stock, method, image, harvestDaysAgo, soldCount, ratingAvg, ratingCount) {
  const f = FARMERS[farmerIdx];
  return {
    _id: id,
    farmerId: f.id,
    farmerName: f.farmerName,
    farmerProfileId: f.id,
    name,
    description: 'Fresh ' + name + ' sourced directly from ' + f.farmName + ', ' + f.district + '.',
    categoryId: catId,
    categorySlug: catSlug,
    categoryName: catName,
    images: image ? [image] : [],
    price,
    unit,
    stockQuantity: stock,
    availabilityStatus: stock > 0 ? 'in_stock' : 'out_of_stock',
    farmingMethod: method,
    harvestDate: daysAgo(harvestDaysAgo),
    origin: f.village + ', ' + f.district,
    certificationDetails: method === 'Organic' ? 'Grown without synthetic pesticides or fertilisers.' : '',
    ratingAvg,
    ratingCount,
    soldCount,
    createdAt: daysAgo(harvestDaysAgo),
  };
}

const PRODUCTS = [
  makeProduct('p1', 0, 'Desi Tomato', 'c1', 'vegetables', 'Vegetables', 28, 'kg', 120, 'Organic', 'images/tomato-pile.jpg', 2, 210, 4.7, 32),
  makeProduct('p2', 1, 'Spinach (Palak)', 'c1', 'vegetables', 'Vegetables', 18, 'bunch', 200, 'Organic', 'images/spinach-leaves.jpg', 1, 180, 4.6, 25),
  makeProduct('p3', 2, 'Alphonso Mango', 'c2', 'fruits', 'Fruits', 180, 'kg', 80, 'Conventional', 'images/tomato-pile.jpg', 3, 95, 4.8, 40),
  makeProduct('p4', 4, 'A2 Desi Cow Milk', 'c3', 'dairy-products', 'Dairy Products', 65, 'litre', 60, 'Organic', 'images/spinach-leaves.jpg', 0, 320, 4.9, 55),
  makeProduct('p5', 0, 'Ragi (Finger Millet)', 'c4', 'grains-pulses', 'Grains & Pulses', 52, 'kg', 500, 'Natural / ZBNF', '', 12, 140, 4.5, 18),
  makeProduct('p6', 3, 'Banana (Yelakki)', 'c2', 'fruits', 'Fruits', 45, 'dozen', 150, 'Organic', 'images/green-beans.jpg', 2, 160, 4.4, 20),
  makeProduct('p7', 4, 'Country Eggs', 'c3', 'dairy-products', 'Dairy Products', 90, 'dozen', 90, 'Organic', '', 0, 275, 4.8, 44),
  makeProduct('p8', 0, 'Sona Masoori Rice', 'c4', 'grains-pulses', 'Grains & Pulses', 68, 'kg', 400, 'Organic', '', 20, 190, 4.6, 22),
  makeProduct('p9', 1, 'Red Onion (Rose)', 'c1', 'vegetables', 'Vegetables', 32, 'kg', 300, 'Organic', 'images/onions-pile.jpg', 4, 240, 4.5, 28),
  makeProduct('p10', 1, 'Potato (Jyoti)', 'c1', 'vegetables', 'Vegetables', 26, 'kg', 4, 'Natural / ZBNF', 'images/potatoes-closeup.jpg', 6, 85, 4.3, 11),
  makeProduct('p11', 3, 'Ooty Carrot', 'c1', 'vegetables', 'Vegetables', 48, 'kg', 150, 'Organic', 'images/carrots-market.jpg', 1, 175, 4.7, 30),
  makeProduct('p12', 4, 'Green Beans', 'c1', 'vegetables', 'Vegetables', 56, 'kg', 100, 'Organic', 'images/green-beans.jpg', 1, 130, 4.6, 19),
  makeProduct('p13', 0, 'Brinjal (Violet Long)', 'c1', 'vegetables', 'Vegetables', 38, 'kg', 180, 'Organic', 'images/brinjal.jpg', 2, 110, 4.4, 16),
  makeProduct('p14', 1, 'Curry Leaves', 'c6', 'herbs-other-produce', 'Herbs & Other Produce', 10, 'bunch', 300, 'Organic', 'images/spinach-leaves.jpg', 1, 95, 4.5, 9),
  makeProduct('p15', 2, 'Papaya (Red)', 'c2', 'fruits', 'Fruits', 40, 'kg', 0, 'Conventional', 'images/brinjal.jpg', 3, 60, 4.2, 8),
  makeProduct('p16', 0, 'Organic Ragi Flour', 'c5', 'organic-products', 'Organic Products', 78, 'kg', 200, 'Organic', 'images/potatoes-closeup.jpg', 15, 120, 4.7, 16),
  makeProduct('p17', 1, 'Organic Spinach Seeds Pack', 'c5', 'organic-products', 'Organic Products', 95, 'pack', 150, 'Organic', 'images/spinach-leaves.jpg', 30, 80, 4.8, 12),
  makeProduct('p18', 4, 'Organic A2 Ghee', 'c5', 'organic-products', 'Organic Products', 850, '500ml', 50, 'Organic', 'images/spinach-leaves.jpg', 5, 165, 4.9, 28),
  makeProduct('p19', 3, 'Organic Mango Jam', 'c5', 'organic-products', 'Organic Products', 145, 'jar', 80, 'Organic', 'images/tomato-pile.jpg', 10, 90, 4.6, 14),
];

const REVIEWS = [
  { _id: 'r1', productId: 'p1', rating: 5, comment: 'Tomatoes tasted like the ones from my grandmother’s garden. Will order again!', customerName: 'Priya S.', verifiedPurchase: true, createdAt: daysAgo(5) },
  { _id: 'r2', productId: 'p1', rating: 4, comment: 'Very fresh and firm. Slightly smaller than expected but flavour was excellent.', customerName: 'Arun K.', verifiedPurchase: true, createdAt: daysAgo(9) },
  { _id: 'r3', productId: 'p2', rating: 5, comment: 'Clean, fresh bunches with no yellowing. Delivered the next morning.', customerName: 'Meena R.', verifiedPurchase: true, createdAt: daysAgo(3) },
  { _id: 'r4', productId: 'p3', rating: 5, comment: 'Real Alphonso taste — sweet and aromatic. Worth the price.', customerName: 'Suresh B.', verifiedPurchase: true, createdAt: daysAgo(7) },
  { _id: 'r5', productId: 'p4', rating: 5, comment: 'Milk boils into a thick layer of cream. Tastes like our village milk.', customerName: 'Kavitha N.', verifiedPurchase: true, createdAt: daysAgo(2) },
  { _id: 'r6', productId: 'p5', rating: 4, comment: 'Good quality ragi, well cleaned and packaged.', customerName: 'Manjunath P.', verifiedPurchase: true, createdAt: daysAgo(14) },
  { _id: 'r7', productId: 'p6', rating: 5, comment: 'Naturally ripened bananas — sweet without any chemicals.', customerName: 'Divya M.', verifiedPurchase: true, createdAt: daysAgo(6) },
  { _id: 'r8', productId: 'p7', rating: 5, comment: 'Fresh farm eggs with bright orange yolks. Excellent quality.', customerName: 'Rahul T.', verifiedPurchase: true, createdAt: daysAgo(4) },
  { _id: 'r9', productId: 'p8', rating: 4, comment: 'Aromatic rice, cooks well. Delivery was on time.', customerName: 'Shanti G.', verifiedPurchase: true, createdAt: daysAgo(11) },
  { _id: 'r10', productId: 'p9', rating: 5, comment: 'Crisp, juicy onions with a deep red colour. Great for daily cooking.', customerName: 'Vijay L.', verifiedPurchase: true, createdAt: daysAgo(8) },
  { _id: 'r11', productId: 'p11', rating: 4, comment: 'Fresh carrots, nice crunch. A few were small but overall good.', customerName: 'Anita D.', verifiedPurchase: true, createdAt: daysAgo(5) },
  { _id: 'r12', productId: 'p12', rating: 5, comment: 'Tender beans, perfect for palya. Delivered the same day they were harvested.', customerName: 'Geetha S.', verifiedPurchase: true, createdAt: daysAgo(3) },
];

// ---- helpers ----

function findProduct(id) { return PRODUCTS.find((p) => p._id === id); }
function findFarmer(id) { return FARMERS.find((f) => f.id === id); }
function reviewsFor(id) { return REVIEWS.filter((r) => r.productId === id); }
function farmerProducts(id) { return PRODUCTS.filter((p) => p.farmerProfileId === id); }

function relatedProducts(id, limit) {
  limit = limit || 4;
  const p = findProduct(id);
  if (!p) return [];
  const same = PRODUCTS.filter((x) => x._id !== id && x.categoryId === p.categoryId);
  const others = PRODUCTS.filter((x) => x._id !== id && x.categoryId !== p.categoryId);
  return same.concat(others).slice(0, limit);
}

function queryProducts(q, pageSize) {
  pageSize = pageSize || 9;
  let items = PRODUCTS.slice();

  if (q.q && String(q.q).trim()) {
    const s = String(q.q).trim().toLowerCase();
    items = items.filter((p) =>
      (p.name && p.name.toLowerCase().includes(s)) ||
      (p.description && p.description.toLowerCase().includes(s)) ||
      (p.farmerName && p.farmerName.toLowerCase().includes(s)) ||
      (p.origin && p.origin.toLowerCase().includes(s)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(s))
    );
  }
  if (q.category) items = items.filter((p) => p.categorySlug === q.category);
  if (q.location && String(q.location).trim()) {
    const s = String(q.location).trim().toLowerCase();
    items = items.filter((p) => p.origin && p.origin.toLowerCase().includes(s));
  }
  if (q.method && String(q.method).trim()) items = items.filter((p) => p.farmingMethod === q.method);
  if (q.availability === 'in_stock') items = items.filter((p) => p.availabilityStatus === 'in_stock');
  if (q.priceMin !== '' && q.priceMin != null) {
    const v = Number(q.priceMin);
    if (!isNaN(v)) items = items.filter((p) => p.price >= v);
  }
  if (q.priceMax !== '' && q.priceMax != null) {
    const v = Number(q.priceMax);
    if (!isNaN(v)) items = items.filter((p) => p.price <= v);
  }

  switch (q.sort) {
    case 'price_asc': items.sort((a, b) => a.price - b.price); break;
    case 'price_desc': items.sort((a, b) => b.price - a.price); break;
    case 'popular': items.sort((a, b) => b.soldCount - a.soldCount); break;
    case 'rating': items.sort((a, b) => b.ratingAvg - a.ratingAvg); break;
    default: items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Number(q.page) || 1), pages);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, pages };
}

function queryFarmers(filters, pageSize) {
  pageSize = pageSize || 9;
  let items = FARMERS.slice();
  if (filters.q) {
    const s = filters.q.toLowerCase();
    items = items.filter((f) =>
      f.farmName.toLowerCase().includes(s) ||
      f.farmDescription.toLowerCase().includes(s) ||
      f.cropTypes.some((c) => c.toLowerCase().includes(s))
    );
  }
  if (filters.location) {
    const s = filters.location.toLowerCase();
    items = items.filter((f) => f.district.toLowerCase().includes(s));
  }
  if (filters.method) items = items.filter((f) => f.farmingMethod === filters.method);

  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, filters.page || 1), pages);
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total, page, pages };
}
