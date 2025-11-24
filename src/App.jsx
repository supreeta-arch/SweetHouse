// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminProducts from "./admin/AdminProducts";

/* ---------- Admin guard + helper ---------- */
// (unchanged) ...
function isAdminAvailable() {
  try {
    const enabledByEnv = process.env.REACT_APP_ENABLE_ADMIN === "true";
    const unlocked = localStorage.getItem("sweethouse_admin_unlocked") === "1";
    const isLocal =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");
    return isLocal || enabledByEnv || unlocked;
  } catch (e) {
    return false;
  }
}

function AdminGuard({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem("sweethouse_admin_unlocked") === "1"
  );
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const ADMIN_PASSWORD =
    (typeof process !== "undefined" && process.env && process.env.REACT_APP_ADMIN_PASSWORD) ||
    "admin123";

  function tryUnlock(e) {
    e?.preventDefault();
    setErr("");
    if (pw === ADMIN_PASSWORD) {
      localStorage.setItem("sweethouse_admin_unlocked", "1");
      setUnlocked(true);
    } else {
      setErr("Incorrect password");
    }
  }

  function clearUnlock() {
    localStorage.removeItem("sweethouse_admin_unlocked");
    setUnlocked(false);
    setPw("");
    setErr("");
  }

  if (unlocked) return children;

  return (
    <div className="p-6 max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-3">Admin access</h2>
      <form onSubmit={tryUnlock} className="space-y-2">
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Enter admin password"
          className="p-2 border rounded w-full"
        />
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
            Unlock
          </button>
          <button
            type="button"
            onClick={clearUnlock}
            className="px-3 py-2 border rounded"
          >
            Clear
          </button>
        </div>
        {err && <div className="text-red-600 text-sm mt-2">{err}</div>}
        <div className="text-xs text-gray-500 mt-2">
          Tip: set ADMIN password in environment variable REACT_APP_ADMIN_PASSWORD
        </div>
      </form>
    </div>
  );
}

/* ---------- product data (fallback seed) ---------- */
// (unchanged) ...
const CATEGORIES = [
  {
    id: "dry-fruits",
    title: "Dry Fruits",
    items: [
      "Badam",
      "Pista",
      "Cashew",
      "Pista Salts",
      "Black Dry Grapes",
      "Fig Fruit",
      "Pumpkin Seeds",
    ],
  },
  {
    id: "kovil-patti",
    title: "Kovil Patti Special (Chikki)",
    items: ["Chikki", "Chikki Round", "Black Thill Ball", "White Thill Ball", "Roasted Gram Round"],
  },
  { id: "sweets", title: "Sweets", items: ["Mysore Pak", "Milk Cova", "Lava Lattu", "Thirunelveli Alva", "Kamarkattu Lattu", "Adhirasam"] },
  { id: "mixture", title: "Mixture Items", items: ["Special Mixture", "Madras Mixture", "Garlic Mixture", "Kara Boondi", "Millets Mixture"] },
  { id: "dhall", title: "Dhall Items", items: ["Masala Peanut", "Peanut Salt", "Roasted Peanut", "Moong Dhall Plain", "Moong Dhall Salt"] },
  { id: "murukk", title: "Murukk Items", items: ["Udupi Pudhina Murukku", "Kara Murukku", "Kara Sev", "Butter Murukku", "Rose Cookies"] },
  { id: "chips", title: "Chips Items", items: ["Banana Chips Plain", "Banana Chips Salt", "Banana Chips Pepper", "Potato Pudhina", "Jack Fruit", "Bitter Gourd Chips"] },
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
        weightLabel: "200g",
      });
    });
  });
  return products;
}
const PRODUCTS = buildProducts();
const STORAGE_KEY = "sweethouse_products";

/* seed initial products into localStorage if empty */
// (unchanged) ...
(function seedProductsToLocalStorage() {
  try {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const normalized = PRODUCTS.map((p) => ({
        id: p.id || Math.random().toString(36).slice(2, 9),
        title: p.name || p.title || "Untitled",
        price: p.price || 0,
        description: p.weightLabel ? `${p.weightLabel}` : "",
        category: p.category || "",
        image: p.img || "",
        createdAt: new Date().toISOString(),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      console.log("Seeded", normalized.length, "products to localStorage key", STORAGE_KEY);
    }
  } catch (err) {
    console.warn("Seed failed", err);
  }
})();

/* ---------- Header component ---------- */
function Header({ cartCount, query, setQuery }) {
  // use import.meta.env.BASE_URL so assets resolve on GH Pages under a subpath
  const logoUrl = `${import.meta.env.BASE_URL || '/'}logo.svg`;

  return (
    <header
      className="site-header-fixed header-animate header-gradient-animate"
      style={{
        background: "linear-gradient(90deg, #7c3aed 0%, #6d28d9 50%, #8b5cf6 100%)",
        color: "white",
        height: "var(--header-height-desktop)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 header-inner">
        <div className="header-brand">
          <div className="logo-capsule" aria-hidden>
            <img
              src={logoUrl}
              alt="Sweet House"
              className="logo-img"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <div className="hidden sm:block">
            <div className="text-2xl md:text-3xl font-extrabold">Sweet House</div>
            <div className="text-xs opacity-90">Finest sweets & snacks — 200g units</div>
          </div>
        </div>

        <nav className="header-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          {isAdminAvailable() && (
            <Link to="/admin/products" className="ml-2 px-2 py-1 rounded bg-white/10">
              Admin
            </Link>
          )}
        </nav>

        <div className="header-controls">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="header-search px-4 py-2 rounded-2xl text-gray-900"
          />
          <a
            href="https://wa.me/919739314380"
            target="_blank"
            rel="noreferrer"
            className="header-btn inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 transition"
            title="Chat on WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.52 3.48A11.92 11.92 0 0012.06.75C6.18.75 1.44 5.5 1.44 11.36c0 2.01.57 3.87 1.56 5.46L.12 23.25l6.7-1.76c1.52.84 3.24 1.27 5.15 1.27 5.88 0 10.62-4.75 10.62-10.62 0-2.85-1.11-5.49-3.02-7.66z" />
            </svg>
            <span className="hidden md:inline">Chat</span>
          </a>

          <Link
            to="/checkout"
            className="header-btn inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition"
            title="Cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
            </svg>
            <span className="ml-1">Cart ({cartCount})</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ---------- Home component with +/- controls and Remove ---------- */
// ... the Home, About, Contact, Checkout components remain unchanged from your uploaded file
// (omitted here for brevity; use the same content you already have in your src/App.jsx)
// in your file they remain exactly as in the uploaded version
// -------------------------------------------------------------------------

/* ---------- App root ---------- */
export default function App() {
  // cart tracking
  const [cart, setCart] = useState({});
  const [query, setQuery] = useState("");

  // products state...
  const [products, setProducts] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return PRODUCTS.map(p => ({ id: p.id, title: p.name, price: p.price, category: p.category, image: p.img, createdAt: p.createdAt }));
      const parsed = JSON.parse(raw);
      return parsed.map(p => ({ id: p.id, title: p.title, price: p.price, category: p.category, image: p.image, createdAt: p.createdAt }));
    } catch (err) {
      console.warn("Failed to read products from storage", err);
      return PRODUCTS.map(p => ({ id: p.id, title: p.name, price: p.price, category: p.category, image: p.img, createdAt: p.createdAt }));
    }
  });

  // read cart persistence (optional)
  useEffect(() => {}, []);

  // keep products in sync...
  useEffect(() => {
    function onCustom(e) {
      try {
        const detail = e?.detail;
        if (Array.isArray(detail)) {
          setProducts(detail.map(p => ({ id: p.id, title: p.title, price: p.price, category: p.category, image: p.image, createdAt: p.createdAt })));
          return;
        }
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        setProducts(parsed.map(p => ({ id: p.id, title: p.title, price: p.price, category: p.category, image: p.image, createdAt: p.createdAt })));
      } catch (err) {
        console.warn("onCustom error", err);
      }
    }
    function onStorage(e) {
      if (e.key !== STORAGE_KEY) return;
      try {
        const parsed = JSON.parse(e.newValue || "[]");
        setProducts(parsed.map(p => ({ id: p.id, title: p.title, price: p.price, category: p.category, image: p.image, createdAt: p.createdAt })));
      } catch (err) {
        console.warn("storage parse err", err);
      }
    }
    window.addEventListener("sweethouse_products_updated", onCustom);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("sweethouse_products_updated", onCustom);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const cartCount = Object.values(cart).reduce((a, b) => a + (Number(b) || 0), 0);

  return (
    <Router>
      {/* Add top padding so the fixed header doesn't overlap page content.
          var(--header-height-desktop) should be defined in your CSS; if not,
          change to a fixed pixel value like '96px'. */}
      <div className="min-h-screen bg-gray-50 site-main-offset" style={{ paddingTop: 'var(--header-height-desktop, 96px)' }}>
        <Header cartCount={cartCount} query={query} setQuery={setQuery} />
        <Routes>
          <Route path="/" element={<Home query={query} setQuery={setQuery} setCart={setCart} products={products} cart={cart} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} products={products} setCart={setCart} />} />
          <Route path="/admin/products" element={<AdminGuard><AdminProducts /></AdminGuard>} />
        </Routes>

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