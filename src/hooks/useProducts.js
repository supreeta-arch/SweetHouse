// src/hooks/useProducts.js
import { useEffect, useState, useCallback } from 'react';

export function createLocalAdapter(storageKey = 'sweethouse_products') {
  return {
    list: async () => {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    },
    saveAll: async (products) => {
      localStorage.setItem(storageKey, JSON.stringify(products));
      return products;
    },
    // optional helpers if component uses them directly
    exportJSON: async () => {
      return JSON.stringify(await (await createLocalAdapter(storageKey).list()), null, 2);
    },
  };
}

export function createHttpAdapter({ baseUrl = '/api' } = {}) {
  return {
    list: async () => {
      const res = await fetch(`${baseUrl}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
    saveAll: async (products) => {
      const res = await fetch(`${baseUrl}/products/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products),
      });
      if (!res.ok) throw new Error('Failed to save products');
      return res.json();
    }
  };
}

// useProducts hook to abstract persistence
export default function useProducts(adapter) {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await adapter.list();
        if (mounted) setProducts(list);
      } catch (err) {
        console.error('useProducts list error', err);
      }
    })();
    return () => { mounted = false; };
  }, [adapter]);

  const save = useCallback(async (newProducts) => {
    await adapter.saveAll(newProducts);
    setProducts(newProducts);
  }, [adapter]);

  return { products, setProducts: save };
}