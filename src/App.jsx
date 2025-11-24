// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminProducts from "./admin/AdminProducts";

/* ---------- Admin guard + helper ---------- */
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
              src="/logo.svg"
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
function Home({ query, setQuery, setCart, products, cart }) {
  const [activeCategory, setActiveCategory] = useState(null);

  // qty input map stores string while user types; initialize from cart
  const [qtyMap, setQtyMap] = useState(() => {
    const map = {};
    Object.entries(cart || {}).forEach(([id, qty]) => {
      map[id] = String(Number(qty) || 0);
    });
    return map;
  });

  // sync input values when cart changes (from other actions)
  useEffect(() => {
    setQtyMap((prev) => {
      const next = { ...prev };
      Object.entries(cart || {}).forEach(([id, qty]) => {
        next[id] = String(Number(qty) || 0);
      });
      return next;
    });
  }, [cart]);

  const categoryOptions = useMemo(() => {
    const setCats = new Set((products || []).map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(setCats)];
  }, [products]);

  const visible = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return (products || []).filter((p) => {
      const name = (p.title || p.name || "").toString();
      const cat = (p.category || "").toString();
      const matchesQ = !q || name.toLowerCase().includes(q) || cat.toLowerCase().includes(q);
      const matchesCat = !activeCategory || activeCategory === "All" ? true : p.category === activeCategory;
      return matchesQ && matchesCat;
    });
  }, [query, activeCategory, products]);

  // helper: set exact cart quantity (>=0)
  const setCartQty = (productId, qty) => {
    const clean = Math.max(0, Number(qty) || 0);
    setCart((prev) => {
      const copy = { ...prev };
      if (clean <= 0) {
        delete copy[productId];
      } else {
        copy[productId] = clean;
      }
      return copy;
    });
    setQtyMap((m) => ({ ...m, [productId]: String(clean) }));
  };

  // increment/decrement by delta (positive or negative)
  const changeCartBy = (productId, delta) => {
    setCart((prev) => {
      const copy = { ...prev };
      const current = Number(copy[productId] || 0);
      const next = Math.max(0, current + delta);
      if (next <= 0) {
        delete copy[productId];
      } else {
        copy[productId] = next;
      }
      // update qtyMap after state updates
      setQtyMap((m) => ({ ...m, [productId]: String(next) }));
      return copy;
    });
  };

  // remove entirely
  const removeFromCart = (productId) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
    setQtyMap((m) => ({ ...m, [productId]: "0" }));
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl md:text-5xl font-extrabold text-purple-600">Explore Our Delicious Range</h2>
        <p className="mt-3 text-gray-600">All items sold as 200g units — order multiples for larger quantities.</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <label htmlFor="category-select" className="text-sm text-gray-600 hidden md:inline">Category:</label>
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
              {categoryOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.04 1.08l-4.23 3.97a.75.75 0 01-1.04 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" /></svg>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">{activeCategory ? `Filtering: ${activeCategory}` : "Showing: All categories"}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 bg-white p-6 rounded-xl shadow-sm hidden md:block">
          <h4 className="text-purple-600 font-semibold mb-4">Categories</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <button onClick={() => setActiveCategory(null)} className={`w-full text-left ${!activeCategory ? 'font-semibold text-purple-600' : ''}`}>All</button>
            </li>
            {categoryOptions.filter(o => o !== 'All').map(o => (
              <li key={o}>
                <button onClick={() => setActiveCategory(o)} className={`w-full text-left ${activeCategory === o ? 'font-semibold text-purple-600' : ''}`}>{o}</button>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-xs text-gray-500">Each item sold in 200g units.</div>
        </aside>

        <section className="md:col-span-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.length === 0 && <div className="col-span-full text-gray-500">No products found.</div>}

            {visible.map((p, i) => {
              const cartQty = Number(cart[p.id] || 0);
              const inputVal = qtyMap[p.id] ?? (cartQty > 0 ? String(cartQty) : "1");
              return (
                <article key={p.id} className="bg-white rounded-xl overflow-hidden shadow-sm card-entrance" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="h-44 bg-gray-100 overflow-hidden">
                    <img src={p.image || p.img || placeholderImage(p.title || p.name || "Item")} alt={p.title || p.name} className="object-cover w-full h-full product-img" />
                  </div>

                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{p.title || p.name}</h3>
                        <div className="text-xs text-gray-500">{p.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">per 200g</div>
                        <div className="font-semibold text-purple-600">₹{p.price}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <button
                        aria-label={`Decrease ${p.title || p.name}`}
                        onClick={() => changeCartBy(p.id, -1)}
                        className="px-3 py-2 border rounded disabled:opacity-50"
                      >
                        −
                      </button>

                      <input
                        id={`qty-${p.id}`}
                        value={inputVal}
                        onChange={(e) => {
                          const v = e.target.value;
                          // allow empty while typing
                          if (v === "") {
                            setQtyMap((m) => ({ ...m, [p.id]: "" }));
                          } else {
                            const cleaned = v.replace(/[^\d]/g, "");
                            setQtyMap((m) => ({ ...m, [p.id]: cleaned }));
                          }
                        }}
                        onBlur={() => {
                          const raw = qtyMap[p.id] ?? inputVal;
                          const parsed = Math.max(0, parseInt(String(raw || "0").replace(/[^\d]/g, ""), 10) || 0);
                          setCartQty(p.id, parsed);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.currentTarget.blur();
                          }
                        }}
                        inputMode="numeric"
                        type="text"
                        className="w-20 px-2 py-1 border rounded text-center"
                      />

                      <button
                        aria-label={`Increase ${p.title || p.name}`}
                        onClick={() => changeCartBy(p.id, +1)}
                        className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded"
                      >
                        +
                      </button>

                      <div className="ml-auto">
                        {cartQty > 0 ? (
                          <button onClick={() => removeFromCart(p.id)} className="px-3 py-2 border rounded text-red-600">Remove</button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

/* ---------- About / Contact / Checkout ---------- */
function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-purple-600 mb-4">About Sweet House</h2>
      <p className="text-gray-700">Traditional sweets and snacks made with care. All orders are prepared fresh and packed safely.</p>
    </main>
  );
}

function ContactPage() {
  const [status, setStatus] = useState(null);
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-3xl font-bold text-purple-600 mb-4">Contact Us</h2>
      <p className="text-gray-700 mb-6">Use the form or chat via WhatsApp for quick replies.</p>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <form onSubmit={(e) => { e.preventDefault(); setStatus("ok"); }}>
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
          {status === "ok" && <div className="mt-3 text-green-600">Message sent (demo)</div>}
        </form>
      </div>
    </main>
  );
}

function CheckoutPage({ cart, products, setCart }) {
  // Build items from cart and products (products array contains admin-synced list)
  const items = Object.entries(cart).map(([id, qty]) => {
    const p = (products || []).find((x) => x.id === id);
    return { id, qty: Number(qty || 0), price: p ? Number(p.price || 0) : 0, name: p ? (p.title || p.name) : id };
  });
  const total = items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);

  // increment/decrement handler in checkout
  const changeQty = (productId, delta) => {
    setCart((prev) => {
      const copy = { ...prev };
      const current = Number(copy[productId] || 0);
      const next = Math.max(0, current + delta);
      if (next <= 0) delete copy[productId];
      else copy[productId] = next;
      return copy;
    });
  };

  const setQty = (productId, qty) => {
    const clean = Math.max(0, Number(qty) || 0);
    setCart((prev) => {
      const copy = { ...prev };
      if (clean <= 0) delete copy[productId];
      else copy[productId] = clean;
      return copy;
    });
  };

  const removeItem = (productId) => {
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h2 className="text-2xl font-bold text-purple-600 mb-4">Checkout</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm">
        {items.length === 0 ? (
          <div>Your cart is empty.</div>
        ) : (
          <>
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between py-3 border-b">
                <div>
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-sm text-gray-500">₹{it.price} × {it.qty} = ₹{(it.price * it.qty).toLocaleString()}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button onClick={() => changeQty(it.id, -1)} className="px-3 py-1 border rounded">−</button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={String(it.qty)}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d]/g, "");
                      setQty(it.id, cleaned === "" ? 0 : Number(cleaned));
                    }}
                    className="w-16 text-center px-2 py-1 border rounded"
                  />
                  <button onClick={() => changeQty(it.id, +1)} className="px-3 py-1 bg-purple-600 text-white rounded">+</button>
                  <button onClick={() => removeItem(it.id)} className="px-3 py-1 border rounded text-red-600">Remove</button>
                </div>
              </div>
            ))}

            <div className="mt-4 flex justify-between font-semibold">
              <div>Subtotal</div>
              <div>₹{Number(total).toLocaleString()}</div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* ---------- App root ---------- */
export default function App() {
  // cart tracking
  const [cart, setCart] = useState({});
  const [query, setQuery] = useState("");

  // products state at App root (source-of-truth for UI). Initialize from localStorage
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

  // read cart from sessionStorage/localStorage if you want persistence — currently ephemeral
  useEffect(() => {
    // optional: load persisted cart from localStorage (uncomment if you want)
    // try { const raw = localStorage.getItem('sweethouse_cart'); if(raw) setCart(JSON.parse(raw)); } catch(e) {}
  }, []);

  // keep products in sync with AdminProducts (custom event) and cross-tab storage events
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
      <div className="min-h-screen bg-gray-50 site-main-offset">
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
