// Krishi Market — real-time front-end
// LIVE: Karnataka mandi rates (Mandi Price API ← data.gov.in Agmarknet, keyless)
//      Farm weather (Open-Meteo, keyless, CORS, CC-BY 4.0)
// Photos: Unsplash CDN (direct images.unsplash.com, with emoji fallback)

// Real product photos (Unsplash, free to use)
const PRODUCTS = [
  { id:1, name:"Desi Tomato", cimg:"https://thumb.wikimedia.org/wikipedia/commons/thumb/9/96/Tomato_pile.jpg/960px-Tomato_pile.jpg", category:"Vegetables", price:28, unit:"/ kg", avail:"120 kg", harvest:"2026-10-10", location:"Mandya", method:"Organic", farmer:"Ramesh Gowda", emoji:"🍅", img:"https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80&auto=format&fit=crop" },
  { id:2, name:"Spinach (Palak)", cimg:"https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fe/Spinach_leaves.jpg/960px-Spinach_leaves.jpg", category:"Vegetables", price:20, unit:"/ bunch", avail:"200 bunches", harvest:"2026-10-11", location:"Mysuru", method:"Organic", farmer:"Lakshmi Devi", emoji:"🥬", img:"https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80&auto=format&fit=crop" },
  { id:3, name:"Alphonso Mango", category:"Fruits", price:180, unit:"/ kg", avail:"80 kg", harvest:"2026-10-09", location:"Bengaluru Rural", method:"Conventional", farmer:"Anand K.", emoji:"🥭", img:"https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&q=80&auto=format&fit=crop" },
  { id:4, name:"A2 Desi Cow Milk", category:"Dairy", price:65, unit:"/ L", avail:"60 L/day", harvest:"Daily 5 AM", location:"Mandya", method:"Organic", farmer:"Ramesh Gowda", emoji:"🥛", img:"https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80&auto=format&fit=crop" },
  { id:5, name:"Ragi (Finger Millet)", category:"Grains", price:52, unit:"/ kg", avail:"500 kg", harvest:"2026-09-28", location:"Tumakuru", method:"Organic", farmer:"Shobha R.", emoji:"🌾", img:"https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80&auto=format&fit=crop" },
  { id:6, name:"Banana (Yelakki)", category:"Fruits", price:45, unit:"/ dozen", avail:"150 dozen", harvest:"2026-10-10", location:"Mysuru", method:"Conventional", farmer:"Fatima S.", emoji:"🍌", img:"https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80&auto=format&fit=crop" },
  { id:7, name:"Country Eggs", category:"Dairy", price:90, unit:"/ dozen", avail:"90 dozen", harvest:"Daily", location:"Bengaluru Rural", method:"Organic", farmer:"Joseph D.", emoji:"🥚", img:"https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&q=80&auto=format&fit=crop" },
  { id:8, name:"Sona Masoori Rice", category:"Grains", price:68, unit:"/ kg", avail:"1 ton", harvest:"2026-09-15", location:"Mandya", method:"Conventional", farmer:"Ramesh Gowda", emoji:"🍚", img:"https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600&q=80&auto=format&fit=crop" },
  { id:9, name:"Red Onion (Rose)", cimg:"https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/Pile_of_Onions_at_Barkin_Dogo_Market%2C_Kaduna_North_01.jpg/960px-Pile_of_Onions_at_Barkin_Dogo_Market%2C_Kaduna_North_01.jpg", category:"Vegetables", price:32, unit:"/ kg", avail:"300 kg", harvest:"2026-10-08", location:"Mysuru", method:"Conventional", farmer:"Lakshmi Devi", emoji:"🧅", img:"https://images.unsplash.com/photo-1741517480859-cc010cff7e6a?w=600&q=80&auto=format&fit=crop" },
  { id:10, name:"Potato (Jyoti)", cimg:"https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Irish_potatoes_01.jpg/960px-Irish_potatoes_01.jpg", category:"Vegetables", price:26, unit:"/ kg", avail:"400 kg", harvest:"2026-10-05", location:"Hassan", method:"Conventional", farmer:"Shobha R.", emoji:"🥔", img:"https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80&auto=format&fit=crop" },
  { id:11, name:"Ooty Carrot", cimg:"https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/Carrots_at_the_vegetable_market_place.jpg/960px-Carrots_at_the_vegetable_market_place.jpg", category:"Vegetables", price:48, unit:"/ kg", avail:"150 kg", harvest:"2026-10-10", location:"Mysuru", method:"Organic", farmer:"Fatima S.", emoji:"🥕", img:"https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&q=80&auto=format&fit=crop" },
  { id:12, name:"Green Beans", cimg:"https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/26-04-2017%2C_French_beans_grown_in_Albufeira.JPG/960px-26-04-2017%2C_French_beans_grown_in_Albufeira.JPG", category:"Vegetables", price:56, unit:"/ kg", avail:"100 kg", harvest:"2026-10-11", location:"Bengaluru Rural", method:"Organic", farmer:"Joseph D.", emoji:"🫛", img:"https://images.unsplash.com/photo-1768734837711-1fcab086d826?w=600&q=80&auto=format&fit=crop" },
  { id:13, name:"Brinjal (Violet Long)", cimg:"https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Eggplant_Brinjal.jpg/960px-Eggplant_Brinjal.jpg", category:"Vegetables", price:38, unit:"/ kg", avail:"180 kg", harvest:"2026-10-09", location:"Mandya", method:"Organic", farmer:"Ramesh Gowda", emoji:"🍆", img:"https://images.unsplash.com/photo-1528826007177-f38517ce9a8a?w=600&q=80&auto=format&fit=crop" },
];

const FARMERS = [
  { name:"Ramesh Gowda", location:"Mandya", crops:"Tomato, Ragi, Paddy + Dairy", method:"Organic", status:"Verified ✅", rating:"4.8★ (320)", img:"https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80&auto=format&fit=crop" },
  { name:"Lakshmi Devi", location:"Mysuru", crops:"Spinach, Carrot, Beans", method:"Organic", status:"Verified ✅", rating:"4.9★ (210)", img:"https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80&auto=format&fit=crop" },
  { name:"Shobha R.", location:"Hassan", crops:"Ragi, Coffee intercrop", method:"Organic", status:"Pending ⏳", rating:"New", img:"https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&q=80&auto=format&fit=crop" },
  { name:"Anand K.", location:"Kolar", crops:"Mango, Banana", method:"Conventional", status:"Verified ✅", rating:"4.6★ (150)", img:"https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&q=80&auto=format&fit=crop" },
  { name:"Fatima S.", location:"Mysuru", crops:"Banana, Papaya", method:"Organic", status:"Pending ⏳", rating:"New", img:"https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&q=80&auto=format&fit=crop" },
  { name:"Joseph D.", location:"Bengaluru Rural", crops:"Dairy + Poultry", method:"Organic", status:"Verified ✅", rating:"4.7★ (180)", img:"https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&q=80&auto=format&fit=crop" },
];

// ---------- Shop + farmers (now with real photos) ----------
// Image fallback chain: Wikimedia close-up -> Unsplash backup -> emoji
function imgErr(el, backup, emoji){
  if(!el.dataset.fb){ el.dataset.fb="1"; el.src=backup; }
  else { el.outerHTML='<div class="emoji">'+emoji+'</div>'; }
}
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
      <img class="product-img" src="${p.cimg||p.img}" alt="${p.name} — fresh from ${p.farmer}, ${p.location} (photo: Wikimedia Commons / Unsplash)" loading="lazy" onerror="imgErr(this,'${p.img}','${p.emoji}')" />
      <span class="tag ${p.method==='Organic'?'':'conv'}">${p.method} • ${p.category}</span>
      <h3>${p.name}</h3>
      <small>👨‍🌾 ${p.farmer} • 📍 ${p.location}</small>
      <small>📦 ${p.avail} • 🌱 Harvest: ${p.harvest}</small>
      <div class="price-row"><span class="price">₹${p.price}${p.unit}</span><small>Fair • traceable</small></div>
      <button class="btn btn-primary add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
    </div>`).join('')
    : `<p class="muted">No products match. Try clearing filters (seasonal availability).</p>`;
}

function renderFarmers(){
  document.getElementById('farmerGrid').innerHTML = FARMERS.map(f=>`
    <div class="farmer">
      <img class="farmer-img" src="${f.img}" alt="Farm of ${f.name}, ${f.location}" loading="lazy" onerror="this.remove()" />
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
    ? cart.map((p)=>`<li><b>${p.name}</b> — ₹${p.price}${p.unit} <small>(${p.farmer})</small></li>`).join('')
    : `<li class="muted">Cart is empty. Add fresh produce above.</li>`;
  try{ localStorage.setItem('km_cart', JSON.stringify(cart)); }catch(e){}
}

// ---------- LIVE: Karnataka mandi rates ----------
const MANDI_API = "https://mandi-api.onrender.com/v1/prices?state=Karnataka";
const PRIORITY = ["Tomato","Onion","Potato","Banana","Mango","Ragi","Paddy","Maize"];

function pickRecords(arr){
  if(!Array.isArray(arr) || !arr.length) return [];
  const norm = (r)=>String(r.commodity||r.crop||r.item||"").toLowerCase();
  const scored = arr.map((r,i)=>({r,i,s:PRIORITY.findIndex(p=>norm(r).includes(p.toLowerCase()))}));
  scored.sort((a,b)=>(a.s===-1?99:a.s)-(b.s===-1?99:b.s) || a.i-b.i);
  return scored.slice(0,8).map(x=>x.r);
}
function num(v){ const n=parseFloat(String(v??"").replace(/[^0-9.]/g,"")); return isFinite(n)?n:null; }
function fmtQtl(r){
  const modal = num(r.modal_price ?? r.modal ?? r.modalPrice ?? r.price);
  const min = num(r.min_price ?? r.min ?? r.minPrice);
  const max = num(r.max_price ?? r.max ?? r.maxPrice);
  if(modal==null) return {q:"—",kg:"—",range:"—"};
  return { q:"₹"+modal.toLocaleString("en-IN")+"/qtl", kg:"≈₹"+(modal/100).toFixed(1)+"/kg", range:(min!=null&&max!=null)?("₹"+min+"–₹"+max):"—" };
}

async function fetchMandi(){
  const body = document.getElementById('mandiBody');
  const stamp = document.getElementById('mandiStamp');
  try{
    const res = await fetch(MANDI_API, {headers:{Accept:"application/json"}});
    if(!res.ok) throw new Error("HTTP "+res.status);
    const j = await res.json();
    const arr = Array.isArray(j) ? j : (j.prices||j.data||j.records||j.result||j.items||[]);
    const rows = pickRecords(arr);
    if(!rows.length) throw new Error("empty");
    body.innerHTML = rows.map(r=>{
      const com = r.commodity||r.crop||r.item||"—";
      const mandi = r.market||r.mandi||r.market_name||r.apmc||"—";
      const dist = r.district ? ", "+r.district : "";
      const {q,kg,range} = fmtQtl(r);
      const dt = r.arrival_date||r.date||r.updated||(j.meta&&j.meta.date)||j.as_of||j.latest_date||"latest";
      return `<tr><td><b>${com}</b><br/><small class="muted">${kg}</small></td><td>${mandi}${dist}</td><td>${q}</td><td>${range}</td><td>${dt}</td></tr>`;
    }).join('');
    const now = new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"});
    stamp.textContent = `✅ Live • ${arr.length} Karnataka records • fetched ${now} IST • source: data.gov.in via Mandi API`;
  }catch(err){
    body.innerHTML = [
      ["Tomato","Mysuru APMC","₹1,800/qtl","₹1,200–₹2,400"],
      ["Onion","Bengaluru APMC","₹2,200/qtl","₹1,500–₹2,800"],
      ["Potato","Belagavi APMC","₹1,600/qtl","₹1,000–₹2,000"],
      ["Ragi","Tumakuru APMC","₹3,846/qtl (MSP)","—"],
    ].map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>sample</td></tr>`).join('');
    stamp.textContent = "⚠️ Live API unreachable (offline/rate-limit) — showing sample. Check live: enam.gov.in → Agmarknet. Error: "+err.message;
  }
}

// ---------- LIVE: farm weather (Open-Meteo) ----------
const PLACES = [
  {name:"Mandya", lat:12.52, lon:76.65},
  {name:"Mysuru", lat:12.30, lon:76.65},
  {name:"Bengaluru Rural", lat:13.00, lon:77.59},
  {name:"Tumakuru", lat:13.34, lon:77.10},
];
function wmoIcon(code){
  if(code===0) return "☀️ Clear";
  if(code<=3) return "⛅ Partly cloudy";
  if(code<=48) return "🌫️ Fog";
  if(code<=57) return "🌦️ Drizzle";
  if(code<=67) return "🌧️ Rain";
  if(code<=77) return "🌨️ Hail/snow";
  if(code<=82) return "🌧️ Showers";
  return "⛈️ Thunderstorm";
}
function advisory(t, prec, code){
  if((prec??0)>0 || code>=51) return "🌧️ Rain — delay harvest/spray, secure drying produce.";
  if((t??0)>=34) return "🥵 Heat — irrigate early morning/evening, mulch.";
  if((t??0)<=15) return "❄️ Cool — good for ragi harvest, watch dew on grains.";
  return "✅ Good field-work window — harvest & transport safe.";
}
async function fetchWeather(){
  const grid = document.getElementById('weatherGrid');
  const stamp = document.getElementById('weatherStamp');
  const hero = document.getElementById('heroWeather');
  try{
    const url = "https://api.open-meteo.com/v1/forecast?latitude="+PLACES.map(p=>p.lat).join(",")
      +"&longitude="+PLACES.map(p=>p.lon).join(",")
      +"&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FKolkata";
    const res = await fetch(url);
    if(!res.ok) throw new Error("HTTP "+res.status);
    const j = await res.json();
    const list = Array.isArray(j) ? j : [j];
    grid.innerHTML = list.map((w,i)=>{
      const c = w.current||{};
      const t = c.temperature_2m, h = c.relative_humidity_2m, p = c.precipitation, code = c.weather_code??0, wind = c.wind_speed_10m;
      return `<div class="weather-card"><b>📍 ${PLACES[i]?.name||"Farm"}</b>${wmoIcon(code)} • <b>${t}°C</b><br/>💧 ${h}% humidity • 🌧️ ${p} mm • 💨 ${wind} km/h<br/><small>${advisory(t,p,code)}</small></div>`;
    }).join('');
    const now = new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"});
    stamp.textContent = `✅ Live • updated ${now} IST • source: Open-Meteo (CC-BY 4.0)`;
    const first = list[0]?.current||{};
    if(hero) hero.textContent = `📍 Mandya live: ${first.temperature_2m}°C • ${wmoIcon(first.weather_code??0)} • 💧${first.relative_humidity_2m}%`;
  }catch(err){
    grid.innerHTML = `<p class="muted">⚠️ Weather API unreachable — ${err.message}. Try Refresh. (Needs internet; ad-blockers can block api.open-meteo.com.)</p>`;
    stamp.textContent = "⚠️ Offline — showing last advice: harvest mornings, check eNAM for rain-hit price moves.";
    if(hero) hero.textContent = "📍 Mandya: weather offline — check IMD before harvest";
  }
}

function refreshLive(){ fetchMandi(); fetchWeather(); }
document.getElementById('refreshLive')?.addEventListener('click', refreshLive);

// ---------- dashboards / forms / nav (unchanged) ----------
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

// init
try{ cart = JSON.parse(localStorage.getItem('km_cart')||'[]'); }catch(e){ cart=[]; }
renderProducts(); renderFarmers(); updateCart();
refreshLive();
setInterval(refreshLive, 15*60*1000);
