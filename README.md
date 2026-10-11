# 🌱 Krishi Market — Farmer-to-Consumer Agri Marketplace (Base Build)

Direct farm-to-home platform: farmers earn more (no middlemen), consumers get fresh, traceable produce.

## 📁 Folder structure
```
krishi-market/
├── index.html
├── images/           # self-hosted real veg photos (Wikimedia Commons, CC BY-SA — see footer)
├── css/style.css
├── js/app.js
└── README.md
```

## ▶️ How to run
Double-click `index.html`, or:
```powershell
Set-Location "C:\Users\Nandan\krishi-market"
python -m http.server 8000
# open http://localhost:8000
```

## ✅ Covered requirements
- Farmer: registration + verification, profile, listings, orders, sales summary
- Consumer: filters (category/location/farmer/organic), cart + slots, tracking, ratings
- Admin: approvals, categories + commission, analytics

## 🔌 Production stack (next)
React/Next + Node/Express + MongoDB/PostgreSQL → AWS/Vercel.
- POST /api/farmers/register, GET /api/farmers/:id, PUT /api/admin/farmers/:id/approve
- GET /api/products, POST /api/products
- POST /api/orders, PUT /api/orders/:id/status
- POST /api/ratings, GET /api/admin/analytics

## 📊 KPIs
Farmers onboarded, active consumers, fulfilment %, income +38%, repeat 68%.
