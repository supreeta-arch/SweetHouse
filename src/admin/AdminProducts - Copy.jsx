import React, { useEffect, useState, useRef } from "react";

/*
  AdminProducts.jsx — FIXED VERSION
  ✔ Prevents header overlap (adds safe top padding)
  ✔ Prevents blank screen (safe localStorage read/write)
  ✔ Shows error messages
  ✔ Add / Edit / Delete / Image Upload
  ✔ Import / Export / Reorder
*/

const STORAGE_KEY = "sweethouse_products";

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

  // Sync localStorage
  useEffect(() => {
    const ok = saveProducts(products);
    if (!ok) setError("LocalStorage write failed. Storage quota may be full.");
  }, [products]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setForm((f) => ({
        ...f,
        image: reader.result,
      }));
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
    if (fileRef.current) fileRef.current.value = null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) return setError("Title is required");
    if (!form.price || isNaN(Number(form.price)))
      return setError("Valid price is required");

    try {
      if (editing) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editing ? { ...p, ...form, price: Number(form.price) } : p
          )
        );
      } else {
        const newP = {
          id: uid(),
          ...form,
          price: Number(form.price),
          createdAt: new Date().toISOString(),
        };
        setProducts((prev) => [newP, ...prev]);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id) {
    if (!confirm("Delete this product?")) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editing === id) resetForm();
  }

  function move(idx, dir) {
    setProducts((prev) => {
      const arr = [...prev];
      const to = idx + dir;
      if (to < 0 || to >= arr.length) return prev;
      [arr[idx], arr[to]] = [arr[to], arr[idx]];
      return arr;
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
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error("Invalid file");
        const normalized = imported.map((p) => ({
          id: p.id || uid(),
          ...p,
        }));
        setProducts(normalized);
        alert("Imported " + normalized.length + " products");
      } catch (err) {
        setError("Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div
      className="p-6 max-w-5xl mx-auto"
      style={{ paddingTop: "6rem" }} // prevents overlap with fixed header
    >
      <h1 className="text-2xl font-semibold mb-4">
        Admin — Products (Local Storage)
      </h1>

      {error && (
        <div className="p-3 mb-3 bg-red-100 text-red-700 rounded border">
          {error}
        </div>
      )}

      {/* Form */}
      <section className="mb-6 bg-white rounded-2xl p-4 shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
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
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImage}
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="preview"
                  className="h-16 w-16 object-cover rounded"
                />
              )}
            </div>
          </div>

          <div className="space-y-2 flex flex-col justify-between">
            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded mr-2"
              >
                {editing ? "Update" : "Add"} Product
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-2 border rounded"
              >
                Reset
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportJson}
                  className="px-3 py-2 border rounded"
                >
                  Export JSON
                </button>
                <label className="px-3 py-2 border rounded cursor-pointer">
                  Import
                  <input
                    type="file"
                    accept="application/json"
                    onChange={importJson}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard.writeText(JSON.stringify(products))
                  }
                  className="px-3 py-2 border rounded"
                >
                  Copy JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Clear ALL products?")) setProducts([]);
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
        <h2 className="text-lg font-medium mb-3">
          Products ({products.length})
        </h2>

        <div className="space-y-3">
          {products.length === 0 && (
            <div className="p-6 bg-gray-50 rounded">
              No products yet. Add one above.
            </div>
          )}

          {products.map((p, idx) => (
            <div
              key={p.id}
              className="bg-white p-3 rounded-lg shadow-sm flex gap-4 items-start"
            >
              <div className="w-28 h-28 flex-shrink-0 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="text-sm text-gray-500">No image</div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-sm text-gray-500">
                      {p.category} • ₹{String(p.price)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => move(idx, -1)}
                      className="px-2 py-1 border rounded"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => move(idx, 1)}
                      className="px-2 py-1 border rounded"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleEdit(p)}
                      className="px-3 py-1 border rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 border rounded text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {p.description && (
                  <p className="mt-2 text-sm text-gray-700">{p.description}</p>
                )}

                <div className="mt-2 text-xs text-gray-400">
                  ID: {p.id} • Created:{" "}
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleString()
                    : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}