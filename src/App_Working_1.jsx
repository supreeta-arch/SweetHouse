// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

/* ---------- product data (same as before) ---------- */
const CATEGORIES = [
  { id: "dry-fruits", title: "Dry Fruits", items: ["Badam","Pista","Cashew","Pista Salts","Black Dry Grapes","Fig Fruit","Pumpkin Seeds"] },
  { id: "kovil-patti", title: "Kovil Patti Special (Chikki)", items: ["Chikki","Chikki Round","Black Thill Ball","White Thill Ball","Roasted Gram Round"] },
  { id: "sweets", title: "Sweets", items: ["Mysore Pak","Milk Cova","Lava Lattu","Thirunelveli Alva","Kamarkattu Lattu","Adhirasam"] },
  { id: "mixture", title: "Mixture Items", items: ["Special Mixture","Madras Mixture","Garlic Mixture","Kara Boondi","Millets Mixture"] },
  { id: "dhall", title: "Dhall Items", items: ["Masala Peanut","Peanut Salt","Roasted Peanut","Moong Dhall Plain","Moong Dhall Salt"] },
  { id: "murukk", title: "Murukk Items", items: ["Udupi Pudhina Murukku","Kara Murukku","Kara Sev","Butter Murukku","Rose Cookies"] },
  { id: "chips", title: "Chips Items", items: ["Banana Chips Plain","Banana Chips Salt","Banana Chips Pepper","Potato Pudhina","Jack Fruit","Bitter Gourd Chips"] }
];
const BASE_PRICE = 160;
const placeholderImage = (name) => `https://via.placeholder.com/700x480.png?text=${encodeURIComponent(name)}`;
function buildProducts() {
  const products = [];
  CATEGORIES.forEach((cat, cidx) => {
    cat.items.forEach((name, idx) => {
      products.push({
        id: `${cat.id}-${idx}`,
        name,
        category: cat.title,
        price: BASE_PRICE + ((cidx + idx) % 5) * 10,
        img: placeholderImage(name),
        weightLabel: "200g"
      });
    });
  });
  return products;
}
const PRODUCTS = buildProducts();

/* ---------- Header component with animation & shrink on scroll ---------- */
// replace the Header() component in src/App.jsx with this code

// Replace only the Header(...) component in src/App.jsx with this code

function Header({ cartCount, query, setQuery }) {
  return (
    <header
      className="site-header-fixed header-animate header-gradient-animate"
      style={{
        background: "linear-gradient(90deg, #7c3aed 0%, #6d28d9 50%, #8b5cf6 100%)",
        color: "white",
        height: "var(--header-height-desktop)",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div className="max-w-7xl mx-auto px-6 header-inner">
        {/* BRAND / LOGO */}
        <div className="header-brand">
          <div className="logo-capsule" aria-hidden>
            {/* Use the uploaded logo path for local testing */}
            <img
              src="/logo.svg"
              alt="Sweet House"
              className="logo-img"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          <div className="hidden sm:block">
            <div className="text-2xl md:text-3xl font-extrabold">Sweet House</div>
            <div className="text-xs opacity-90">Finest sweets & snacks — 200g units</div>
          </div>
        </div>

        {/* NAV (middle) */}
        <nav className="header-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        {/* controls (right) */}
        <div className="header-controls">
          {/* Search (hidden on small screens via CSS) */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="header-search px-4 py-2 rounded-2xl text-gray-900"
          />

          {/* Chat button */}
          <a
            href="https://wa.me/919739314380"
            target="_blank"
            rel="noreferrer"
            className="header-btn inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 transition"
            title="Chat on WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.92 11.92 0 0012.06.75C6.18.75 1.44 5.5 1.44 11.36c0 2.01.57 3.87 1.56 5.46L.12 23.25l6.7-1.76c1.52.84 3.24 1.27 5.15 1.27 5.88 0 10.62-4.75 10.62-10.62 0-2.85-1.11-5.49-3.02-7.66z"/></svg>
            <span className="hidden md:inline">Chat</span>
          </a>

          {/* Cart */}
          <Link
            to="/checkout"
            className="header-btn inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition"
            title="Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4" /></svg>
            <span className="ml-1">Cart ({cartCount})</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
/* ---------- Page pieces (Home, About, Contact, Checkout) ---------- */
// Replace the Home component in src/App.jsx with this version
//import React, { useMemo, useState } from "react";

function Home({ query, setQuery, setCart }) {
  const [activeCategory, setActiveCategory] = useState(null);

  // build a flat list of category titles for the dropdown
  const categoryOptions = useMemo(() => {
    return ["All", ...CATEGORIES.map(c => c.title)];
  }, []);

  // filtered products
  const visible = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return PRODUCTS.filter(p => {
      const matchesQ = !q || p.name.toLowerCase().includes(q);
      const matchesCat = !activeCategory || activeCategory === "All" ? true : p.category === activeCategory;
      return matchesQ && matchesCat;
    });
  }, [query, activeCategory]);

  // add to cart helper
  const addQty = (productId, qty) => {
    setCart(prev => {
      const copy = { ...prev };
      copy[productId] = (copy[productId] || 0) + Math.max(0, qty);
      if (copy[productId] <= 0) delete copy[productId];
      return copy;
    });
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-purple-600">Explore Our Delicious Range</h2>
        <p className="mt-3 text-gray-600">All items sold as 200g units — order multiples for larger quantities.</p>
      </div>

      {/* Controls row: category dropdown (mobile-first), search is handled globally */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <label htmlFor="category-select" className="text-sm text-gray-600 hidden md:inline">Category:</label>

          {/* Dropdown: visible on all sizes; on md+ the sidebar persists but dropdown is still helpful */}
          <div className="relative">
            <select
              id="category-select"
              value={activeCategory ?? "All"}
              onChange={(e) => {
                const val = e.target.value;
                setActiveCategory(val === "All" ? null : val);
              }}
              className="appearance-none px-4 py-2 pr-8 rounded-xl border bg-white shadow-sm min-w-[200px]"
            >
              {categoryOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            {/* caret icon */}
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.04 1.08l-4.23 3.97a.75.75 0 01-1.04 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* On larger screens, keep a short instruction / filter status */}
        <div className="text-sm text-gray-500">
          {activeCategory ? `Filtering: ${activeCategory}` : "Showing: All categories"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar (md+) */}
        <aside className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm hidden md:block">
          <h4 className="text-purple-600 font-semibold mb-4">Categories</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <button
                onClick={() => setActiveCategory(null)}
                className={`w-full text-left ${!activeCategory ? 'font-semibold text-purple-600' : ''}`}
              >
                All
              </button>
            </li>
            {CATEGORIES.map(c => (
              <li key={c.id}>
                <button
                  onClick={() => setActiveCategory(c.title)}
                  className={`w-full text-left ${activeCategory === c.title ? 'font-semibold text-purple-600' : ''}`}
                >
                  {c.title}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-xs text-gray-500">Each item sold in 200g units.</div>
        </aside>

        {/* Product grid */}
        <section className="md:col-span-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.length === 0 && (
              <div className="col-span-full text-gray-500">No products found for the selected category or search.</div>
            )}

            {visible.map((p, i) => (
              <article key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm card-entrance" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="h-44 bg-gray-100 overflow-hidden">
                  <img src={p.img} alt={p.name} className="object-cover w-full h-full product-img" />
                </div>

                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{p.name}</h3>
                      <div className="text-xs text-gray-500">{p.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">per 200g</div>
                      <div className="font-semibold text-purple-600">₹{p.price}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input id={`qty-${p.id}`} defaultValue={1} min={0} type="number" className="w-20 px-2 py-1 border rounded" />
                    <button
                      onClick={() => {
                        const el = document.getElementById(`qty-${p.id}`);
                        const q = Math.max(0, Number(el.value) || 0);
                        if (q > 0) addQty(p.id, q);
                      }}
                      className="ml-auto bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 rounded-xl font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
function AboutPage(){ return (
  <main className="max-w-4xl mx-auto px-6 py-12">
    <h2 className="text-3xl font-bold text-purple-600 mb-4">About Sweet House</h2>
    <p className="text-gray-700">Traditional sweets and snacks made with care. All orders are prepared fresh and packed safely.</p>
  </main>
); }

function ContactPage(){
  const [status, setStatus] = useState(null);
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-purple-600 mb-4">Contact Us</h2>
      <p className="text-gray-700 mb-6">Use the form or chat via WhatsApp for quick replies.</p>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <form onSubmit={(e)=>{ e.preventDefault(); setStatus("ok"); }}>
          <label className="text-xs">Name</label>
          <input className="w-full px-3 py-2 border rounded mb-2" required />
          <label className="text-xs">Email</label>
          <input type="email" className="w-full px-3 py-2 border rounded mb-2" required />
          <label className="text-xs">Message</label>
          <textarea className="w-full px-3 py-2 border rounded mb-2" required />
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-purple-600 text-white rounded">Send</button>
            <a href="https://wa.me/919739314380" target="_blank" rel="noreferrer" className="px-4 py-2 bg-green-500 text-white rounded">Chat WhatsApp</a>
          </div>
          {status==="ok" && <div className="mt-3 text-green-600">Message sent (demo)</div>}
        </form>
      </div>
    </main>
  );
}

function CheckoutPage({ cart }) {
  const items = Object.entries(cart).map(([id, qty]) => {
    const p = PRODUCTS.find(x=>x.id===id); return { ...p, qty };
  });
  const total = items.reduce((s,it)=>s+it.price*it.qty,0);
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-purple-600 mb-4">Checkout</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm">{items.length===0 ? <div>Your cart is empty.</div> : items.map(it=> <div key={it.id} className="flex justify-between py-2"><div>{it.name} × {it.qty}</div><div>₹{it.price*it.qty}</div></div>)}
        <div className="mt-4 flex justify-between font-semibold">Subtotal <div>₹{total}</div></div>
      </div>
    </main>
  );
}

/* ---------- App root ---------- */
export default function App(){
  const [cart, setCart] = useState({});
  const [query, setQuery] = useState("");
  const cartCount = Object.values(cart).reduce((a,b)=>a+(b||0),0);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header cartCount={cartCount} query={query} setQuery={setQuery} />
        <Routes>
          <Route path="/" element={<Home query={query} setQuery={setQuery} setCart={setCart} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} />} />
        </Routes>

        {/* floating whatsapp FAB */}
        <a href="https://wa.me/919739314380" target="_blank" rel="noreferrer" className="fixed right-4 bottom-4 z-50 shadow-lg rounded-full p-3 bg-gradient-to-br from-green-400 to-green-500 hover:scale-105 transform transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.92 11.92 0 0012.06.75C6.18.75 1.44 5.5 1.44 11.36c0 2.01.57 3.87 1.56 5.46L.12 23.25l6.7-1.76c1.52.84 3.24 1.27 5.15 1.27 5.88 0 10.62-4.75 10.62-10.62 0-2.85-1.11-5.49-3.02-7.66z"/></svg>
        </a>

        <footer className="bg-purple-700 text-white py-6 mt-12">
          <div className="max-w-7xl mx-auto text-center text-sm">© {new Date().getFullYear()} Sweet House — All rights reserved.</div>
        </footer>
      </div>
    </Router>
  );
}
