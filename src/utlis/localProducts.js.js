// src/utils/localProducts.js
const STORAGE_KEY = 'sweethouse_products';

const SEED = [
  {
    id: 'seed-badam',
    name: 'Badam',
    category: 'Dry Fruits',
    price: 160,
    img: '/mnt/data/logo.svg',
    weightLabel: '200g',
    badge: 'Popular',
    description: 'Premium almonds — roasted and lightly salted.',
    createdAt: Date.now()
  }
];

export function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('loadProducts error', e);
    return SEED;
  }
}

export function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function clearProducts() {
  localStorage.removeItem(STORAGE_KEY);
}