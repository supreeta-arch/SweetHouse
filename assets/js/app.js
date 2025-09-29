// Sweethouse - Frontend JS
(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const state = {
    products: [],
    filtered: [],
    cart: JSON.parse(localStorage.getItem('sweethouse_cart')||'[]'),
    filter: 'all',
    sort: 'featured',
    query: ''
  };

  const fmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  function saveCart(){
    localStorage.setItem('sweethouse_cart', JSON.stringify(state.cart));
    updateCartCount();
    renderCart();
  }

  function addToCart(prod){
    const found = state.cart.find(i=>i.id===prod.id);
    if(found) found.qty += 1; else state.cart.push({id:prod.id,title:prod.title,price:prod.price,image:prod.image,qty:1});
    saveCart();
  }
  function changeQty(id, delta){
    const idx = state.cart.findIndex(i=>i.id===id);
    if(idx>-1){
      state.cart[idx].qty += delta;
      if(state.cart[idx].qty<=0) state.cart.splice(idx,1);
      saveCart();
    }
  }
  function removeLine(id){
    state.cart = state.cart.filter(i=>i.id!==id);
    saveCart();
  }
  function cartSubtotal(){
    return state.cart.reduce((s,i)=>s + i.price*i.qty, 0);
  }

  function applyFilters(){
    let items = [...state.products];
    if(state.filter!=='all') items = items.filter(p=>p.category===state.filter);
    if(state.query) items = items.filter(p=> (p.title + ' ' + p.tags.join(' ')).toLowerCase().includes(state.query.toLowerCase()));
    if(state.sort==='price-asc') items.sort((a,b)=>a.price-b.price);
    if(state.sort==='price-desc') items.sort((a,b)=>b.price-a.price);
    state.filtered = items;
    updateCount();
    renderGrid();
  }

  function updateCount(){
    const el = document.getElementById('productCount');
    if(el) el.textContent = String(state.filtered.length || 0);
  }

  function renderFilters(){
    const host = document.getElementById('filterChips');
    if(!host) return;
    const categories = Array.from(new Set(state.products.map(p=>p.category))).sort();
    const chips = ['all', ...categories];
    host.innerHTML = chips.map(cat=>`<button class="chip${cat===state.filter?' active':''}" data-filter="${cat}">${cat[0].toUpperCase()+cat.slice(1)}</button>`).join('');
    // Bind events
    host.querySelectorAll('.chip').forEach(c=>{
      c.addEventListener('click', ()=>{
        host.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
        c.classList.add('active');
        state.filter = c.getAttribute('data-filter');
        applyFilters();
      })
    });
  }

  function renderGrid(){
    const grid = $('#productGrid');
    if(!grid) return;
    grid.innerHTML = state.filtered.map(p=>`
      <article class="product-card">
        <div style="position:relative">
          ${p.badge?`<span class="badge">${p.badge}</span>`:''}
          <img class="product-thumb" src="${p.image}" alt="${p.title}">
        </div>
        <div class="product-body">
          <div class="product-title">${p.title}</div>
          <div class="product-meta">
            <div class="price">${fmt.format(p.price)} <span class="muted" style="font-weight:600;font-size:.9em">/ 200g</span></div>
          </div>
          <button class="btn btn-primary add-btn" data-id="${p.id}">Add to Cart</button>
        </div>
      </article>
    `).join('');

    $$('.add-btn', grid).forEach(btn=>{
      btn.addEventListener('click', e=>{
        const id = e.currentTarget.getAttribute('data-id');
        const prod = state.products.find(p=>p.id===id);
        addToCart(prod);
        openCart();
      })
    })
  }

  function renderCart(){
    const wrap = $('#cartItems');
    if(!wrap) return;
    if(!state.cart.length){
      wrap.innerHTML = '<p>Your cart is empty. Explore our sweets and add your favorites!</p>';
    } else {
      wrap.innerHTML = state.cart.map(i=>`
        <div class="cart-item">
          <img src="${i.image}" alt="${i.title}">
          <div>
            <div class="line-title">${i.title}</div>
            <div class="muted">${fmt.format(i.price)} per 200g pack</div>
            <div class="qty">
              <button aria-label="Decrease quantity" data-act="dec" data-id="${i.id}">−</button>
              <span>${i.qty} pack(s)</span>
              <button aria-label="Increase quantity" data-act="inc" data-id="${i.id}">+</button>
              <button aria-label="Remove item" data-act="rem" data-id="${i.id}" title="Remove">✕</button>
            </div>
          </div>
          <div><strong>${fmt.format(i.price*i.qty)}</strong><div class="muted" style="font-size:.85em;text-align:right">${i.qty*200}g</div></div>
        </div>
      `).join('');
      $$('#cartItems button').forEach(b=>{
        b.addEventListener('click', e=>{
          const id = e.currentTarget.getAttribute('data-id');
          const act = e.currentTarget.getAttribute('data-act');
          if(act==='inc') changeQty(id,1);
          if(act==='dec') changeQty(id,-1);
          if(act==='rem') removeLine(id);
          $('#cartSubtotal').textContent = fmt.format(cartSubtotal());
        })
      })
    }
    $('#cartSubtotal').textContent = fmt.format(cartSubtotal());
  }

  function updateCartCount(){
    const count = state.cart.reduce((s,i)=>s+i.qty,0);
    const el = $('#cartCount');
    if(el) el.textContent = String(count);
  }

  function openCart(){
    const drawer = $('#cartDrawer');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
  }
  function closeCart(){
    const drawer = $('#cartDrawer');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
  }

  function bindUI(){
    $('#cartButton')?.addEventListener('click', openCart);
    $('#closeCart')?.addEventListener('click', closeCart);

    // Filter chips rendered dynamically in renderFilters()

    $('#sortSelect')?.addEventListener('change', e=>{
      state.sort = e.currentTarget.value;
      applyFilters();
    });

    $('#searchInput')?.addEventListener('input', e=>{
      state.query = e.currentTarget.value;
      applyFilters();
    });

    $('#themeToggle')?.addEventListener('click', ()=>{
      const isLight = document.documentElement.classList.toggle('light');
      localStorage.setItem('sh_theme', isLight ? 'light':'dark');
    });

    // Footer year
    const y = new Date().getFullYear();
    $('#year') && ($('#year').textContent = y);
  }

  async function loadProducts(){
    try{
      const res = await fetch('data/products.json');
      const data = await res.json();
      state.products = data.products;
      state.filtered = [...state.products];
      renderFilters();
      applyFilters();
    }catch(err){
      console.error('Failed to load products', err);
      $('#productGrid').innerHTML = '<p>Unable to load products right now. Please refresh.</p>'
    }
  }

  function hydrateTheme(){
    const pref = localStorage.getItem('sh_theme');
    if(pref==='light') document.documentElement.classList.add('light');
  }

  function init(){
    hydrateTheme();
    bindUI();
    updateCartCount();
    renderCart();
    loadProducts();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
