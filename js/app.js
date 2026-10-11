// Krishi Market — base front-end logic
const PRODUCTS = [
  { id:1, name:"Desi Tomato", category:"Vegetables", price:28, unit:"/ kg", avail:"120 kg", harvest:"2026-10-10", location:"Mandya", method:"Organic", farmer:"Ramesh Gowda", emoji:"🍅" },
  { id:2, name:"Spinach (Palak)", category:"Vegetables", price:20, unit:"/ bunch", avail:"200 bunches", harvest:"2026-10-11", location:"Mysuru", method:"Organic", farmer:"Lakshmi Devi", emoji:"🥬" },
  { id:3, name:"Alphonso Mango", category:"Fruits", price:180, unit:"/ kg", avail:"80 kg", harvest:"2026-10-09", location:"Bengaluru Rural", method:"Conventional", farmer:"Anand K.", emoji:"🥭" },
  { id:4, name:"A2 Desi Cow Milk", category:"Dairy", price:65, unit:"/ L", avail:"60 L/day", harvest:"Daily 5 AM", location:"Mandya", method:"Organic", farmer:"Ramesh Gowda", emoji:"🥛" },
  { id:5, name:"Ragi (Finger Millet)", category:"Grains", price:52, unit:"/ kg", avail:"500 kg", harvest:"2026-09-28", location:"Tumakuru", method:"Organic", farmer:"Shobha R.", emoji:"🌾" },
  { id:6, name:"Banana (Yelakki)", category:"Fruits", price:45, unit:"/ dozen", avail:"150 dozen", harvest:"2026-10-10", location:"Mysuru", method:"Conventional", farmer:"Fatima S.", emoji:"🍌" },
  { id:7, name:"Country Eggs", category:"Dairy", price:90, unit:"/ dozen", avail:"90 dozen", harvest:"Daily", location:"Bengaluru Rural", method:"Organic", farmer:"Joseph D.", emoji:"🥚" },
  { id:8, name:"Sona Masoori Rice", category:"Grains", price:68, unit:"/ kg", avail:"1 ton", harvest:"2026-09-15", location:"Mandya", method:"Conventional", farmer:"Ramesh Gowda", emoji:"🍚" },
];
const FARMERS = [
  { name:"Ramesh Gowda", location:"Mandya", crops:"Tomato, Ragi, Paddy + Dairy", method:"Organic", status:"Verified ✅", rating:"4.8★ (320)" },
  { name:"Lakshmi Devi", location:"Mysuru", crops:"Spinach, Carrot, Beans", method:"Organic", status:"Verified ✅", rating:"4.9★ (210)" },
  { name:"Shobha R.", location:"Hassan", crops:"Ragi, Coffee intercrop", method:"Organic", status:"Pending ⏳", rating:"New" },
  { name:"Anand K.", location:"Kolar", crops:"Mango, Banana", method:"Conventional", status:"Verified ✅", rating:"4.6★ (150)" },
  { name:"Fatima S.", location:"Mysuru", crops:"Banana, Papaya", method:"Organic", status:"Pending ⏳", rating:"New" },
  { name:"Joseph D.", location:"Bengaluru Rural", crops:"Dairy + Poultry", method:"Organic", status:"Verified ✅", rating:"4.7★ (180)" },
];
let cart = [];
function renderProducts(){
  const c = document.getElementById('filterCategory').value;
  const l = document.getElementById('filterLocation').value;
  const m = document.getElementById('filterMethod').value;
  const q = (document.getElementById('heroSearch')?.value || '').toLowerCase();
  const grid = document.getElementById('productGrid');
  const list = PRODUCTS.filter(p =>
    (!c || p.category===c) && (!l || p.location===l) &&
    (!m || p.method===m) &&
    (!q || p.name.toLowerCase().includes(q) || p.farmer.toLowerCase().includes(q))
  );
  grid.innerHTML = list.length ? list.map(p=>`
    <div class="product">
      <div class="emoji">${p.emoji}</div>
      <span class="tag ${p.method==='Organic'?'':'conv'}">${p.method} • ${p.category}</span>
      <h3>${p.name}</h3>
      <small>👨‍🌾 ${p.farmer} • 📍 ${p.location}</small>
      <small>📦 ${p.avail} • 🌱 Harvest: ${p.harvest}</small>
      <div class="price-row"><span class="price">₹${p.price}${p.unit}</span><small>Fair • traceable</small></div>
      <button class="btn btn-primary add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
    </div>`).join('')
    : `<p class="muted">No products match. Try clearing filters (seasonal availability constraint).</p>`;
}
function renderFarmers(){
  document.getElementById('farmerGrid').innerHTML = FARMERS.map(f=>`
    <div class="farmer">
      <h3>👨‍🌾 ${f.name}</h3>
      <small class="muted">📍 ${f.location} • ${f.rating}</small>
      <p><b>Crops:</b> ${f.crops}<br/><b>Method:</b> ${f.method}<br/><b>Status:</b> ${f.status}</p>
      <button class="btn btn-outline" onclick="alert('Demo profile: ${f.name} — farm photos, practices & reviews come from /api/farmers/:id')">View Profile</button>
    </div>`).join('');
}
function addToCart(id){
  const p = PRODUCTS.find(x=>x.id===id);
  cart.push(p); updateCart();
}
function updateCart(){
  const total = cart.reduce((s,p)=>s+p.price,0);
  document.getElementById('cartCount').textContent = cart.length;
  document.getElementById('cartCount2').textContent = cart.length;
  document.getElementById('cartTotal').textContent = '₹'+total;
  document.getElementById('cartTotalMini').textContent = '₹'+total;
  document.getElementById('cartItems').innerHTML = cart.length
    ? cart.map((p,i)=>`<li><b>${p.name}</b> — ₹${p.price}${p.unit} <small>(${p.farmer})</small></li>`).join('')
    : `<li class="muted">Cart is empty. Add fresh produce above.</li>`;
  try{ localStorage.setItem('km_cart', JSON.stringify(cart)); }catch(e){}
}
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById(t.dataset.tab).classList.add('active');
  });
});
function updateOrder(btn){
  const li = btn.closest('li');
  li.querySelector('.badge').className='badge green';
  li.querySelector('.badge').textContent='Confirmed';
  btn.remove();
  alert('Order confirmed. Delivery partner notified (demo).');
}
function approveFarmer(btn){
  const li = btn.closest('li');
  li.innerHTML += ' — <span class="badge green">Verified ✅</span>';
  btn.remove();
}
document.getElementById('productForm')?.addEventListener('submit', e=>{
  e.preventDefault(); alert('Listing published (demo). POST /api/products in Node+Express backend.'); e.target.reset();
});
document.getElementById('farmerForm')?.addEventListener('submit', e=>{
  e.preventDefault(); alert('Farmer registration submitted for admin verification (demo). POST /api/farmers/register'); e.target.reset();
});
document.getElementById('consumerForm')?.addEventListener('submit', e=>{
  e.preventDefault();
  if(!cart.length){ alert('Cart is empty — add produce first.'); return; }
  const slot = document.getElementById('orderSlot').value;
  alert(`Order placed! ${cart.length} items, slot: ${slot}. Farmer will confirm. (Demo — POST /api/orders)`);
  cart=[]; updateCart(); e.target.reset();
});
document.getElementById('clearCart')?.addEventListener('click', ()=>{ cart=[]; updateCart(); });
document.getElementById('quickAdd')?.addEventListener('click', ()=>{ addToCart(1); addToCart(2); addToCart(4); alert('Farm Box added to cart!'); });
['filterCategory','filterLocation','filterMethod'].forEach(id=>{
  document.getElementById(id)?.addEventListener('change', renderProducts);
});
document.getElementById('heroSearch')?.addEventListener('input', renderProducts);
document.getElementById('heroLocation')?.addEventListener('change', e=>{
  document.getElementById('filterLocation').value = e.target.value; renderProducts();
});
document.getElementById('menuBtn')?.addEventListener('click', ()=>{
  document.getElementById('mainNav').classList.toggle('open');
});
document.getElementById('cartBtn')?.addEventListener('click', ()=>{
  document.getElementById('join').scrollIntoView({behavior:'smooth'});
});
try{ cart = JSON.parse(localStorage.getItem('km_cart')||'[]'); }catch(e){ cart=[]; }
renderProducts(); renderFarmers(); updateCart();
