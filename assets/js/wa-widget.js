// Sweethouse - WhatsApp connect widget
(function(){
  const PHONE = '919900770011'; // Business WhatsApp number
  const BRAND = 'Sweethouse';

  function fmtINR(n){
    try{ return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n) }catch{ return `₹${n}` }
  }
  function buildCartSummary(){
    try{
      const cart = JSON.parse(localStorage.getItem('sweethouse_cart')||'[]');
      if(!cart.length) return '';
      const lines = cart.map(i=>`• ${i.title} — ${i.qty} pack(s) (${i.qty*200}g) = ${fmtINR(i.price*i.qty)}`).join('%0A');
      const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
      const weight = cart.reduce((s,i)=>s+i.qty*200,0);
      return `%0A%0AOrder summary:%0A${lines}%0ATotal weight: ${weight}g%0ASubtotal: ${fmtINR(total)}`;
    }catch{ return ''}
  }
  function buildMessage(){
    const base = encodeURIComponent(`Hello ${BRAND} team, I need help with placing an order / bulk order / order status.`);
    return `${base}${buildCartSummary()}`;
  }
  function openWhatsApp(){
    const msg = buildMessage();
    window.open(`https://wa.me/${PHONE}?text=${msg}`, '_blank');
  }

  function createEl(tag, attrs={}, html=''){
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=> el.setAttribute(k,v));
    if(html) el.innerHTML = html;
    return el;
  }

  function mountWidget(){
    // Floating button
    const btn = createEl('button', { class: 'wa-fab', ariaLabel: 'Chat on WhatsApp' }, '💬');

    // Panel
    const panel = createEl('div', { class: 'wa-panel', role: 'dialog', 'aria-hidden':'true' }, `
      <div class="wa-panel-head">
        <div>
          <div class="wa-title">Namskara from ${BRAND} 🙏</div>
          <div class="wa-sub">We will help you place orders, bulk orders, and find order status.</div>
        </div>
        <button class="wa-close" aria-label="Close">✕</button>
      </div>
      <div class="wa-icons">
        <a href="https://instagram.com" target="_blank" aria-label="Instagram">📸</a>
        <a href="https://facebook.com" target="_blank" aria-label="Facebook">👍</a>
        <a href="https://wa.me/${PHONE}" target="_blank" aria-label="WhatsApp">💬</a>
      </div>
      <div class="wa-card">
        <div class="wa-card-title">Contact Us</div>
        <button class="btn btn-primary wa-chat-btn">WhatsApp Chat - Click here!</button>
      </div>
    `);

    btn.addEventListener('click', ()=>{
      panel.classList.toggle('open');
      panel.setAttribute('aria-hidden', panel.classList.contains('open') ? 'false':'true');
    });
    panel.querySelector('.wa-close').addEventListener('click', ()=>{
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden','true');
    });
    panel.querySelector('.wa-chat-btn').addEventListener('click', openWhatsApp);

    document.body.appendChild(panel);
    document.body.appendChild(btn);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mountWidget);
  } else {
    mountWidget();
  }
})();
