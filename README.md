# Sweethouse.co.in - Static E‑commerce Frontend

A modern, responsive e‑commerce storefront for a sweets and bakery brand. Built with plain HTML/CSS/JS so it can be hosted anywhere (GitHub Pages, Netlify, Vercel, etc.).

## Features
- Product catalog loaded from `data/products.json`
- Search, category filters, and sorting
- Cart drawer with add/remove/quantity and subtotal
- Checkout page that sends order via WhatsApp or Email
- Theme toggle (dark/light), responsive layout

## Structure
- `index.html` — Home, hero, product grid, cart drawer
- `assets/css/styles.css` — Styles
- `assets/js/app.js` — Logic for catalog and cart
- `data/products.json` — Sample products
- `checkout.html`, `about.html`, `contact.html`, `privacy.html`

## Customization
- Update contact numbers and email in `index.html`, `checkout.html`, and `contact.html`:
  - WhatsApp: `https://wa.me/919999999999`
  - Phone link: `tel:+919999999999`
  - Orders email: `orders@sweethouse.co.in`
- Replace product images/entries in `data/products.json`
- Add your logo at `assets/img/logo.svg` and favicon at `assets/img/favicon.png`

## Run locally
Just open `index.html` in a browser. For fetch to work for `products.json`, use a local server:
- Python: `python -m http.server 8000`
- Node: `npx serve .`

Then visit `http://localhost:8000/sweethouse/`

## Deploy
- Netlify: drag-and-drop the `sweethouse/` folder or connect your repo
- Vercel: `vercel` with `sweethouse/` as the project root
- GitHub Pages: push to `main` and enable Pages with root `/sweethouse`

## License
MIT
