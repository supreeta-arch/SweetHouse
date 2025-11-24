import React, { useEffect, useState, useRef } from "react";

/*
  AdminProducts.jsx — PATCHED
  - emits a custom event 'sweethouse_products_updated' after each update so Home updates immediately
  - prevents saving overly large base64 images into localStorage (checks file.size)
  - keeps the same UI/UX as before
*/

const STORAGE_KEY = "sweethouse_products";
const IMAGE_SIZE_THRESHOLD = 300 * 1024; // 300 KB

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function safeParse(raw) {
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readProducts() {
  try {
    return safeParse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return [];
  }
}

function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/* Emit an in-page event so other components (Home) can update immediately.
   Note: the `storage` event doesn't fire in same window/tab, so we use this.
*/
function emitProductsUpdated(products) {
  try {
    window.dispatchEvent(
      new CustomEvent("sweethouse_products_updated", { detail: products })
    );
  } catch (e) {
    // non-fatal
    console.warn("emitProductsUpdated failed", e);
  }
}

export default function AdminProducts() {
  const [products, setProducts] = useState(() => readProducts());
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "",
    image: "",
  });

  const fileRef = useRef(null);

  // Sync localStorage when products change; also emit event in effect as a fallback
  useEffect(() => {
    const ok = saveProducts(products);
    if (!ok) {
      setError("LocalStorage write failed. Storage quota may be full.");
    } else {
      setError("");
    }
    // Also emit the update so same-window listeners get it (defensive)
    emitProductsUpdated(products);
  }, [products]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prevent saving very large images to localStorage (base64). Warn user instead.
    if (file.size > IMAGE_SIZE_THRESHOLD) {
      setError(
        `Image too large (${Math.round(file.size / 1024)} KB). Please use an image <= ${Math.round(
          IMAGE_SIZE_THRESHOLD / 1024
        )} KB or use small thumbnails.`
      );
      // keep the previous image (don't replace), clear file input visually
      if (fileRef.current) try { fileRef.current.value = null; } catch (e) {}
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => setError("Failed to read image file.");
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: reader.result }));
      setError("");
    };
    reader.readAsDataURL(file);
  }

  function resetForm() {
    setForm({
      title: "",
      price: "",
      description: "",
      category: "",
      image: "",
    });
    setEditing(null);
    setError("");
    if (fileRef.current) try { fileRef.current.value = null; } catch (e) {}
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Title is required");
    if (!form.price || isNaN(Number(form.price))) return setError("Valid price is required");

    try {
      if (editing) {
        setProducts((prev) => {
          const next = prev.map((p) =>
            p.id === editing ? { ...p, ...form, price: Number(form.price) } : p
          );
          // emit for same-window listeners
          emitProductsUpdated(next);
          return next;
        });
      } else {
        const newP = {
          id: uid(),
          ...form,
          price: Number(form.price),
          createdAt: new Date().toISOString(),
        };
        setProducts((prev) => {
          const next = [newP, ...prev];
          emitProductsUpdated(next);
          return next;
        });
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Unexpected error while adding product.");
    }
  }

  function handleEdit(p) {
    setEditing(p.id);
    setForm({
      title: p.title || "",
      price: String(p.price || ""),
      description: p.description || "",
      category: p.category || "",
      image: p.image || "",
    });
    setError("");
    if (fileRef.current) try { fileRef.current.value = null; } catch (e) {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      emitProductsUpdated(next);
      return next;
    });
    if (editing === id) resetForm();
  }

  function move(idx, dir) {
    setProducts((prev) => {
      const arr = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return prev;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      const next = arr;
      emitProductsUpdated(next);
      return next;
    });
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(products, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sweethouse_products.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJson(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onerror = () => setError("Failed to read import file.");
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error("Invalid file");
        const normalized = imported.map((p) => ({ id: p.id || uid(), ...p }));
        setProducts(normalized);
        emitProductsUpdated(normalized);
        alert("Imported " + normalized.length + " products");
      } catch (err) {
        setError("Import failed: " + (err.message || err));
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  }

  return (
    <div
      className="p-6 max-w-5xl mx-auto site-main-offset"
      // using site-main-offset helps avoid header overlap (global CSS)
    >
      <h1 className="text-2xl font-semibold mb-4">Admin — Products (Local Storage)</h1>

      {error && (
        <div className="p-3 mb-3 bg-red-100 text-red-700 rounded border">{error}</div>
      )}

      {/* Form */}
      <section className="mb-6 bg-white rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <div className="flex gap-2">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Product title"
                className="flex-1 p-2 border rounded"
              />
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                className="w-28 p-2 border rounded"
              />
            </div>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Category"
              className="p-2 border rounded w-full"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description"
              rows={3}
              className="p-2 border rounded w-full"
            />
            <div className="flex items-center gap-3">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} />
              {form.image && (
                <img src={form.image} alt="preview" className="h-16 w-16 object-cover rounded" />
              )}
            </div>
          </div>

          <div className="space-y-2 flex flex-col justify-between">
            <div>
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded mr-2">
                {editing ? "Update" : "Add"} Product
              </button>
              <button type="button" onClick={resetForm} className="px-3 py-2 border rounded">
                Reset
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <button type="button" onClick={exportJson} className="px-3 py-2 border rounded">
                  Export JSON
                </button>
                <label className="px-3 py-2 border rounded cursor-pointer">
                  Import
                  <input type="file" accept="application/json" onChange={importJson} className="hidden" />
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(JSON.stringify(products));
                    alert("Copied to clipboard");
                  }}
                  className="px-3 py-2 border rounded"
                >
                  Copy JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Clear ALL products?")) {
                      setProducts([]);
                      emitProductsUpdated([]);
                    }
                  }}
                  className="px-3 py-2 border rounded text-red-600"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Products List */}
      <section>
        <h2 className="text-lg font-medium mb-3">Products ({products.length})</h2>

        <div className="space-y-3">
          {products.length === 0 && (
            <div className="p-6 bg-gray-50 rounded">No products yet. Add one above.</div>
          )}

          {products.map((p, idx) => (
            <div key={p.id} className="bg-white p-3 rounded-lg shadow-sm flex gap-4 items-start">
              <div className="w-28 h-28 flex-shrink-0 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {p.image ? (
                  <img src={p.image} alt={p.title} className="object-cover w-full h-full" />
                ) : (
                  <div className="text-sm text-gray-500">No image</div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-sm text-gray-500">{p.category} • ₹{String(p.price)}</div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => move(idx, -1)} className="px-2 py-1 border rounded">↑</button>
                    <button onClick={() => move(idx, 1)} className="px-2 py-1 border rounded">↓</button>
                    <button onClick={() => handleEdit(p)} className="px-3 py-1 border rounded">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="px-3 py-1 border rounded text-red-600">Delete</button>
                  </div>
                </div>

                {p.description && <p className="mt-2 text-sm text-gray-700">{p.description}</p>}

                <div className="mt-2 text-xs text-gray-400">ID: {p.id} • Created: {p.createdAt ? new Date(p.createdAt).toLocaleString() : "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}