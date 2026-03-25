/* ============================================================
   Smooth.IT — Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  initActiveNavLink();
  initScrollEffects();
  initScrollTop();
  initCart();
  if (document.getElementById('product-root'))   initProductPage();
  if (document.getElementById('shop-root'))       initShopPage();
  if (document.getElementById('favorites-root'))  initFavoritesPage();
  if (document.getElementById('home-bestsellers')) initHomePage();
  if (document.getElementById('contact-form'))    initContactForm();
  if (document.getElementById('cat-grid'))        initCategoriesPage();
});

/* ── NAVIGATION ──────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    lastY = y;
  }, { passive: true });
}

function initMobileMenu() {
  const nav = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  if (!nav || !toggle) return;
  toggle.addEventListener('click', () => nav.classList.toggle('nav-open'));
  // Close on link click
  nav.querySelectorAll('.navbar-links a').forEach(a => {
    a.addEventListener('click', () => nav.classList.remove('nav-open'));
  });
  // Close on outside click
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) nav.classList.remove('nav-open');
  });
}

function initActiveNavLink() {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    a.classList.toggle('active', href === path || (path === '' && href === 'index.html'));
  });
}

/* ── SCROLL EFFECTS ──────────────────────────────────────── */
function initScrollEffects() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
  }, { threshold: 0.10 });
  document.querySelectorAll('.fi').forEach(el => obs.observe(el));
}

function reObserve() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); });
  }, { threshold: 0.10 });
  document.querySelectorAll('.fi:not(.on)').forEach(el => obs.observe(el));
}

/* ── SCROLL TO TOP ───────────────────────────────────────── */
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ── CART SYSTEM ─────────────────────────────────────────── */
const CART_KEY = 'smoothit_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
function addToCart(productId, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === productId);
  if (idx > -1) cart[idx].qty += qty;
  else cart.push({ id: productId, qty });
  saveCart(cart);
  updateCartBadge();
  renderCartDrawer();
  showToast('Added to bag ✓');
}
function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
  updateCartBadge(); renderCartDrawer();
}
function updateQty(productId, qty) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === productId);
  if (idx > -1) { if (qty < 1) removeFromCart(productId); else { cart[idx].qty = qty; saveCart(cart); renderCartDrawer(); } }
  updateCartBadge();
}
function getCartCount()  { return getCart().reduce((s, i) => s + i.qty, 0); }
function getCartTotal()  { return getCart().reduce((s, i) => { const p = SMOOTHIT_PRODUCTS.find(x => x.id === i.id); return s + (p ? p.price * i.qty : 0); }, 0); }

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = count;
    b.classList.toggle('visible', count > 0);
  });
}

function initCart() {
  updateCartBadge();
  document.querySelectorAll('.cart-icon').forEach(btn => {
    btn.addEventListener('click', openCart);
  });
  const overlay = document.getElementById('cart-overlay');
  const close   = document.getElementById('cart-close');
  if (overlay) overlay.addEventListener('click', closeCart);
  if (close)   close.addEventListener('click', closeCart);
}
function openCart()  {
  renderCartDrawer();
  document.getElementById('cart-drawer')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartDrawer() {
  const el = document.getElementById('cart-items');
  const total = document.getElementById('cart-total-price');
  if (!el) return;
  const cart = getCart();
  if (cart.length === 0) {
    el.innerHTML = `<div class="cart-empty"><div class="empty-icon">🛍️</div><p>Your bag is empty</p><a href="shop.html" onclick="closeCart()" class="btn btn-primary btn-sm" style="margin-top:16px">Shop Now</a></div>`;
  } else {
    el.innerHTML = cart.map(item => {
      const p = SMOOTHIT_PRODUCTS.find(x => x.id === item.id);
      if (!p) return '';
      return `<div class="cart-item">
        <div class="cart-item-visual ${p.visualClass}" style="border-radius:10px"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">$${p.price}</div>
          <div class="cart-qty">
            <button onclick="updateQty(${p.id}, ${item.qty - 1})">−</button>
            <span>${item.qty}</span>
            <button onclick="updateQty(${p.id}, ${item.qty + 1})">+</button>
          </div>
        </div>
        <button class="cart-remove" onclick="removeFromCart(${p.id})" title="Remove">✕</button>
      </div>`;
    }).join('');
  }
  if (total) total.textContent = `$${getCartTotal()}`;
}

/* ── TOAST ───────────────────────────────────────────────── */
function showToast(msg) {
  let t = document.getElementById('site-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'site-toast'; t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ── PRODUCT CARD BUILDER ────────────────────────────────── */
function buildProductCard(p, extraClass = '') {
  const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
  return `<a href="product.html?id=${p.id}" class="product-card fi ${extraClass}" data-cat="${p.category}">
    <div class="product-visual ${p.visualClass}">
      <span class="visual-icon">${p.name.split(' ')[0]}</span>
    </div>
    <div class="product-info">
      <div class="product-cat-tag">${p.category}</div>
      <div class="product-star-row">
        <span class="stars" style="font-size:0.72rem">${stars}</span>
        <span>${p.rating} (${p.reviewCount.toLocaleString()})</span>
      </div>
      <h3>${p.name}</h3>
      <p class="product-short">${p.shortDesc}</p>
      <div class="product-footer">
        <span class="product-price">$${p.price}</span>
        <button class="card-add-btn" onclick="event.preventDefault();addToCart(${p.id})" title="Add to cart">+</button>
      </div>
    </div>
  </a>`;
}

/* ── HOME PAGE ───────────────────────────────────────────── */
function initHomePage() {
  const bestSellers = document.getElementById('home-bestsellers');
  const trending    = document.getElementById('home-trending');
  if (bestSellers) {
    const products = SMOOTHIT_PRODUCTS.filter(p => p.tags.includes('bestseller')).slice(0, 4);
    bestSellers.innerHTML = products.map((p, i) => buildProductCard(p, `stagger-${i + 1}`)).join('');
  }
  if (trending) {
    const products = SMOOTHIT_PRODUCTS.filter(p => p.tags.includes('trending')).slice(0, 4);
    trending.innerHTML = products.map((p, i) => buildProductCard(p, `stagger-${i + 1}`)).join('');
  }
  reObserve();
}

/* ── SHOP PAGE ───────────────────────────────────────────── */
function initShopPage() {
  let activeFilter = new URLSearchParams(location.search).get('cat') || 'all';
  let activeSort = 'featured';
  const grid = document.getElementById('product-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sortSelect = document.getElementById('sort-select');

  function renderProducts() {
    let list = activeFilter === 'all'
      ? [...SMOOTHIT_PRODUCTS]
      : SMOOTHIT_PRODUCTS.filter(p => p.category === activeFilter);
    if (activeSort === 'price-asc')  list.sort((a, b) => a.price - b.price);
    if (activeSort === 'price-desc') list.sort((a, b) => b.price - a.price);
    if (activeSort === 'rating')     list.sort((a, b) => b.rating - a.rating);
    grid.innerHTML = list.length
      ? list.map((p, i) => buildProductCard(p, `stagger-${Math.min(i % 4 + 1, 6)}`)).join('')
      : `<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--muted)">No products found.</div>`;
    reObserve();
  }

  filterBtns.forEach(btn => {
    if (btn.dataset.filter === activeFilter) btn.classList.add('active');
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderProducts();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', () => { activeSort = sortSelect.value; renderProducts(); });
  }
  renderProducts();
}

/* ── FAVORITES PAGE ──────────────────────────────────────── */
function initFavoritesPage() {
  const root = document.getElementById('favorites-root');
  if (!root) return;
  const favs = SMOOTHIT_PRODUCTS.filter(p => p.tags.includes('favorite'));

  root.innerHTML = favs.map((p, i) => {
    const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
    const isEven = i % 2 === 0;
    return `<div class="fav-block fi stagger-${i + 1} ${isEven ? '' : 'fav-block--rev'}">
      <div class="fav-visual">
        <div class="product-visual product-visual--lg ${p.visualClass}">
          <span class="visual-icon">${p.name.split(' ')[0]}</span>
          <div class="sparkle-overlay"></div>
        </div>
      </div>
      <div class="fav-content">
        <div class="fav-tags">
          <span class="tag-pill tag-pink">Favorite</span>
          ${p.tags.includes('bestseller') ? '<span class="tag-pill tag-gold">Best Seller</span>' : ''}
        </div>
        <h2 class="fav-name">${p.name}</h2>
        <p class="fav-desc">${p.longDesc}</p>
        <ul class="fav-benefits">
          ${p.benefits.slice(0, 3).map(b => `<li><span class="benefit-dot">✦</span>${b}</li>`).join('')}
        </ul>
        <div class="fav-meta">
          <div class="fav-price">$${p.price}</div>
          <div class="rating-row"><span class="stars">${stars}</span><span class="rating-count">${p.rating} (${p.reviewCount.toLocaleString()})</span></div>
        </div>
        <div class="fav-actions">
          <a href="product.html?id=${p.id}" class="btn btn-primary">View Product</a>
          <button class="btn btn-secondary" onclick="addToCart(${p.id})">Add to Bag</button>
        </div>
      </div>
    </div>`;
  }).join('');
  reObserve();
}

/* ── PRODUCT PAGE ────────────────────────────────────────── */
function initProductPage() {
  const root = document.getElementById('product-root');
  if (!root) return;
  const id = parseInt(new URLSearchParams(location.search).get('id'));
  const p = SMOOTHIT_PRODUCTS.find(x => x.id === id);

  if (!p) {
    root.innerHTML = `<div class="container" style="padding:80px 0;text-align:center">
      <h2>Product not found</h2>
      <a href="shop.html" class="btn btn-primary" style="margin-top:24px">Browse All Products</a>
    </div>`;
    return;
  }

  document.title = `${p.name} — Smooth.IT`;
  const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
  const related = p.relatedIds.map(rid => SMOOTHIT_PRODUCTS.find(x => x.id === rid)).filter(Boolean);

  root.innerHTML = `
    <div class="container">
      <div class="breadcrumb">
        <a href="index.html">Home</a><span class="sep">›</span>
        <a href="shop.html">Shop</a><span class="sep">›</span>
        <a href="shop.html?cat=${p.category}">${capitalize(p.category)}</a><span class="sep">›</span>
        <span>${p.name}</span>
      </div>
      <div class="pd-grid">
        <div class="pd-visuals fi">
          <div class="product-visual product-visual--lg ${p.visualClass}" id="main-visual">
            <span class="visual-icon" style="font-size:4rem;opacity:0.2">${p.name.split(' ')[0]}</span>
            <div class="sparkle-overlay"></div>
          </div>
          <div class="pd-thumb-row">
            ${[1,2,3].map((_, i) => `
              <div class="pd-thumb ${p.visualClass} ${i===0?'active':''}" onclick="setMainVisual(this, '${p.visualClass}')"></div>
            `).join('')}
          </div>
        </div>
        <div class="pd-info fi stagger-2">
          <div class="pd-tags">
            ${p.tags.includes('favorite') ? '<span class="tag-pill tag-pink">★ Favorite</span>' : ''}
            ${p.tags.includes('bestseller') ? '<span class="tag-pill tag-gold">Best Seller</span>' : ''}
            ${p.tags.includes('trending') ? '<span class="tag-pill tag-nude">Trending</span>' : ''}
          </div>
          <h1 class="pd-name">${p.name}</h1>
          <div class="rating-row" style="margin:8px 0 16px">
            <span class="stars">${stars}</span>
            <span class="rating-count">${p.rating} · ${p.reviewCount.toLocaleString()} reviews</span>
          </div>
          <div class="pd-price">$${p.price}</div>
          <p class="pd-short">${p.shortDesc}</p>

          ${p.shades && p.shades.length > 1 ? `
          <div class="pd-shades">
            <div class="pd-label">Shade: <strong id="shade-name">${p.shades[0].name}</strong></div>
            <div class="shade-swatches">
              ${p.shades.map((s, i) => `
                <button class="swatch ${i === 0 ? 'active' : ''}"
                  style="background:${s.hex}"
                  title="${s.name}"
                  onclick="selectShade(this, '${s.name}')"></button>
              `).join('')}
            </div>
          </div>` : ''}

          <div class="pd-actions">
            <button class="btn btn-primary btn-lg" onclick="addToCart(${p.id})">Add to Bag</button>
            <button class="btn btn-dark btn-lg" onclick="addToCart(${p.id});showToast('Ordering... ✓')">Buy Now</button>
          </div>
          <ul class="pd-benefits">
            ${p.benefits.map(b => `<li><span class="benefit-dot">✦</span>${b}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Tabs -->
      <div class="pd-tabs fi">
        <div class="tab-btns">
          <button class="tab-btn active" onclick="switchTab(this,'tab-desc')">Description</button>
          <button class="tab-btn" onclick="switchTab(this,'tab-reviews')">Reviews (${p.reviews.length})</button>
        </div>
        <div id="tab-desc" class="tab-panel active">
          <p class="pd-long-desc">${p.longDesc}</p>
        </div>
        <div id="tab-reviews" class="tab-panel">
          <div class="reviews-grid">
            ${p.reviews.map(r => `
              <div class="review-card">
                <div class="review-header">
                  <div class="review-avatar">${r.author[0]}</div>
                  <div>
                    <div class="review-author">${r.author}</div>
                    <div class="stars" style="font-size:0.85rem">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
                  </div>
                </div>
                <p class="review-text">${r.text}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Related Products -->
      <div class="related-section fi">
        <div class="sec-head">
          <div class="badge">You May Also Like</div>
          <h2>Related Products</h2>
          <div class="line"></div>
        </div>
        <div class="grid-3 related-grid">
          ${related.map((r, i) => buildProductCard(r, `stagger-${i + 1}`)).join('')}
        </div>
      </div>
    </div>
  `;
  reObserve();
}

function setMainVisual(thumb, cls) {
  const main = document.getElementById('main-visual');
  if (!main) return;
  document.querySelectorAll('.pd-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}
function selectShade(btn, name) {
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('shade-name');
  if (el) el.textContent = name;
}
function switchTab(btn, panelId) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(panelId)?.classList.add('active');
}

/* ── CATEGORIES PAGE ─────────────────────────────────────── */
function initCategoriesPage() {
  const grid = document.getElementById('cat-grid');
  if (!grid) return;
  grid.innerHTML = SMOOTHIT_CATEGORIES.map((cat, i) => {
    const count = SMOOTHIT_PRODUCTS.filter(p => p.category === cat.key).length;
    return `<a href="shop.html?cat=${cat.key}" class="cat-card fi stagger-${Math.min(i+1,6)}">
      <div class="cat-visual ${cat.visualClass}">
        <div class="sparkle-overlay"></div>
      </div>
      <div class="cat-info">
        <h3>${cat.label}</h3>
        <p>${count} product${count !== 1 ? 's' : ''}</p>
        <span class="cat-arrow">Explore →</span>
      </div>
    </a>`;
  }).join('');
  reObserve();
}

/* ── CONTACT FORM ────────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      field.classList.remove('error');
      if (!field.value.trim()) { field.classList.add('error'); valid = false; }
    });
    if (valid) {
      const success = document.getElementById('contact-success');
      form.style.opacity = '0';
      form.style.pointerEvents = 'none';
      setTimeout(() => {
        form.style.display = 'none';
        if (success) { success.style.display = 'flex'; success.style.opacity = '0'; setTimeout(() => success.style.opacity = '1', 50); }
      }, 400);
    }
  });
}

/* ── HELPERS ─────────────────────────────────────────────── */
function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
