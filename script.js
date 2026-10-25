/* ============================================
   DATA PRODUK
   ============================================ */
let PRODUCTS = [];

/* ============================================
   STATE
   ============================================ */
let currentUser = JSON.parse(localStorage.getItem('campus_user') || 'null');
let cart = JSON.parse(localStorage.getItem('campus_cart') || '[]');
let wishlist = JSON.parse(localStorage.getItem('campus_wishlist') || '[]');
let orders = JSON.parse(localStorage.getItem('campus_orders') || '[]');
let activeProductId = null;
let loginMode = 'nim';

const rupiah = n => 'Rp ' + n.toLocaleString('id-ID');

/* ============================================
   INIT
   ============================================ */
window.addEventListener('DOMContentLoaded', () => {
  if (currentUser) {
    document.getElementById('page-login').classList.remove('active');
    document.getElementById('navbar').classList.remove('hidden');
    navigateTo('home');
  } else {
    document.getElementById('page-login').classList.add('active');
    document.getElementById('navbar').classList.add('hidden');
  }

  fetchProducts();
  initLoginForm();
  updateAuthUI();
  renderFeatured();
  renderCart();
  updateBadges();
  
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
  
  document.addEventListener('click', (e) => {
    const wrap = document.getElementById('accountMenuWrap');
    if (wrap && !wrap.contains(e.target)) closeAccountMenu();
  });

  // BACK TO TOP LOGIC
  window.onscroll = function() {
    const btn = document.getElementById('backToTop');
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  };
  document.getElementById('backToTop')?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

/* ============================================
   NAVIGATION
   ============================================ */
function navigateTo(page, category) {
  closeAccountMenu();
  const protectedPages = ['orders', 'cart', 'wishlist', 'checkout'];
  if (protectedPages.includes(page) && !currentUser) {
    toast('Silakan masuk terlebih dahulu'); page = 'login';
  }
  
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  if (page === 'login') document.getElementById('navbar').classList.add('hidden');
  else document.getElementById('navbar').classList.remove('hidden');

  if (page === 'products') { applyFilter('all', category || 'all'); }
  if (page === 'orders') renderOrders('Menunggu Pembayaran');
  if (page === 'cart') renderCart();
  if (page === 'checkout') renderCheckout();
  if (page === 'wishlist') renderWishlist();
  if (page === 'contact') prefillContactForm();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================
   FUNGSI UI UMUM
   ============================================ */
function toggleAccountMenu(e) {
  if (e) e.stopPropagation();
  document.getElementById('accountMenu')?.classList.toggle('hidden');
}
function closeAccountMenu() { document.getElementById('accountMenu')?.classList.add('hidden'); }

function submitContact(e) {
  e.preventDefault();
  toast(`Terima kasih ${document.getElementById('contactName').value}, pesan terkirim!`);
  e.target.reset();
}
function prefillContactForm() {
  if (currentUser) {
    document.getElementById('contactName').value = currentUser.nama || '';
    document.getElementById('contactEmail').value = currentUser.email || '';
  }
}

/* ============================================
   AUTH — LOGIN
   ============================================ */
function switchLoginTab(mode) {
  loginMode = mode;
  const tabNim = document.getElementById('tabNim');
  const tabEmail = document.getElementById('tabEmail');
  const fieldNim = document.getElementById('fieldNim');
  const fieldEmail = document.getElementById('fieldEmail');
  
  if (mode === 'nim') {
    tabNim.className = 'flex-1 py-2 text-sm font-semibold rounded-md transition bg-white text-campus-primary shadow-sm';
    tabEmail.className = 'flex-1 py-2 text-sm font-semibold rounded-md transition text-gray-500';
    fieldNim.classList.remove('hidden'); fieldEmail.classList.add('hidden');
  } else {
    tabEmail.className = 'flex-1 py-2 text-sm font-semibold rounded-md transition bg-white text-campus-primary shadow-sm';
    tabNim.className = 'flex-1 py-2 text-sm font-semibold rounded-md transition text-gray-500';
    fieldEmail.classList.remove('hidden'); fieldNim.classList.add('hidden');
  }
  document.getElementById('loginCta').disabled = true;
  document.getElementById('loginCta').className = 'w-full py-3.5 text-sm font-semibold rounded-lg transition-all duration-300 bg-gray-300 text-gray-500 cursor-not-allowed';
}

function togglePasswordVisibility() {
  const input = document.getElementById('loginPassword');
  const icon = document.getElementById('eyeIcon');
  if (input.type === 'password') {
    input.type = 'text';
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>';
  } else {
    input.type = 'password';
    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>';
  }
}

function initLoginForm() {
  const nameInput  = document.getElementById('loginName');
  const nimInput   = document.getElementById('loginNim');
  const nimPass    = document.getElementById('loginPasswordNim');
  const emailInput = document.getElementById('loginEmail');
  const passInput  = document.getElementById('loginPassword');
  const cta        = document.getElementById('loginCta');
  const form       = document.getElementById('loginForm');
  if (!nameInput || !cta) return;

  const validate = () => {
    const nameOk = nameInput.value.trim().length >= 3;
    let credentialOk = false;
    if (loginMode === 'nim') {
      credentialOk = /^\d{5,}$/.test(nimInput.value.trim()) && nimPass.value.length >= 6;
    } else {
      const emailVal = emailInput.value.trim().toLowerCase();
      const emailOk = /^[^\s@]+@perbanas\.id$/.test(emailVal);
      const passOk = passInput.value.length >= 6;
      credentialOk = emailOk && passOk;
    }
    if (nameOk && credentialOk) {
      cta.disabled = false;
      cta.className = 'w-full py-3.5 text-sm font-semibold rounded-lg transition-all duration-300 bg-campus-primary text-white hover:bg-campus-primaryLight cursor-pointer shadow-lg shadow-campus-primary/30';
    } else {
      cta.disabled = true;
      cta.className = 'w-full py-3.5 text-sm font-semibold rounded-lg transition-all duration-300 bg-gray-300 text-gray-500 cursor-not-allowed';
    }
  };

  nameInput.addEventListener('input', validate);
  nimInput.addEventListener('input', validate);
  nimPass.addEventListener('input', validate);
  emailInput.addEventListener('input', validate);
  passInput.addEventListener('input', validate);
  validate();
 
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nama = nameInput.value.trim();
    const nim = loginMode === 'nim' ? nimInput.value.trim() : "";
    const email = loginMode === 'email' ? emailInput.value.trim().toLowerCase() : "";
    const password = loginMode === 'nim' ? nimPass.value : passInput.value;

    cta.disabled = true; 
    cta.textContent = 'Memverifikasi...';

    try {
      // Kirim data ke backend
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, nim, email, password, loginMode })
      });

      const result = await response.json();

      if (response.ok) {
        // SIMPAN KE LOCALSTORAGE SEBAGAI STATUS LOGIN DI BROWSER
        currentUser = { nama, nim, email, loginMode };
        localStorage.setItem('campus_user', JSON.stringify(currentUser));
        
        updateAuthUI();
        toast('Berhasil masuk!');

        setTimeout(() => {
          document.getElementById('page-login').classList.remove('active');
          document.getElementById('navbar').classList.remove('hidden');
          navigateTo('home');
        }, 800);
      } else {
        toast(result.message || 'Gagal login');
      }
    } catch (error) {
      console.error(error);
      toast('Gagal terhubung ke server. Pastikan backend menyala.');
    } finally {
      cta.textContent = 'Masuk'; 
      validate();
    }
  });
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('campus_user');
  updateAuthUI(); closeAccountMenu();
  document.getElementById('loginForm')?.reset();
  toast('Anda telah keluar');
  document.getElementById('navbar').classList.add('hidden');
  navigateTo('login');
}

function updateAuthUI() {
  const loggedIn = !!currentUser;
  ['navOrdersMenu', 'mobileOrdersMenu'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = loggedIn ? 'block' : 'none';
  });

  const navName = document.getElementById('navUserName');
  const navAvatar = document.getElementById('navAvatar');
  if (navName) navName.textContent = loggedIn ? currentUser.nama.split(' ')[0] : 'Masuk';
  if (navAvatar) navAvatar.textContent = loggedIn ? currentUser.nama.charAt(0).toUpperCase() : '?';

  const guestMenu = document.getElementById('accountGuestMenu');
  const userMenu = document.getElementById('accountUserMenu');
  if (loggedIn) {
    guestMenu?.classList.add('hidden'); userMenu?.classList.remove('hidden');
    document.getElementById('accountUserName').textContent = currentUser.nama;
    document.getElementById('accountUserIdent').textContent = currentUser.nim ? `NIM: ${currentUser.nim}` : currentUser.email;
  } else {
    guestMenu?.classList.remove('hidden'); userMenu?.classList.add('hidden');
  }
}

/* ============================================
   RENDER PRODUK
   ============================================ */
function productCard(p) {
  const isWish = wishlist.includes(p.id);
  const badgeColors = { BARU: 'bg-campus-success', HOT: 'bg-campus-danger', PROMO: 'bg-campus-accent', MURAH: 'bg-campus-secondary', BEKAS: 'bg-gray-500' };
  return `
    <div class="product-card bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition cursor-pointer" onclick="openDetail('${p.id}')">
      <div class="relative overflow-hidden aspect-square bg-gray-100">
        <img src="${p.img}" alt="${p.name}" class="product-img w-full h-full object-cover" loading="lazy">
        ${p.badge ? `<span class="absolute top-3 left-3 ${badgeColors[p.badge] || 'bg-gray-700'} text-white text-[10px] font-bold px-2 py-1 rounded">${p.badge}</span>` : ''}
        <button onclick="event.stopPropagation(); toggleWishlist('${p.id}')" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:scale-110 transition">
          <svg class="w-4 h-4 ${isWish ? 'fill-red-500 text-red-500' : 'text-gray-600'}" fill="${isWish ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
        </button>
      </div>
      <div class="p-3.5">
        <p class="text-sm font-semibold text-campus-dark leading-snug line-clamp-2 mb-2" style="min-height:2.5rem;">${p.name}</p>
        <div class="flex items-baseline gap-2 mb-2">
          <span class="text-base font-bold text-campus-primary">${rupiah(p.price)}</span>
          ${p.oldPrice ? `<span class="text-xs text-gray-400 line-through">${rupiah(p.oldPrice)}</span>` : ''}
        </div>
        <div class="flex items-center text-xs text-gray-400 mt-2"><svg class="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>Kampus Perbanas</div>
      </div>
    </div>`;
}

function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (grid) grid.innerHTML = PRODUCTS.slice(0, 4).map(productCard).join('');
}

function renderProducts(gender = 'all', category = 'all') {
  const grid = document.getElementById('productGrid');
  const empty = document.getElementById('emptyState');
  if (!grid) return;
  let filtered = category === 'all' ? [...PRODUCTS] : PRODUCTS.filter(p => p.category === category);
  
  const sortVal = document.getElementById('sortSelect')?.value || 'default';
  if (sortVal === 'termurah') filtered.sort((a, b) => a.price - b.price);
  if (sortVal === 'termahal') filtered.sort((a, b) => b.price - a.price);
  if (sortVal === 'rating') filtered.sort((a, b) => b.rating - a.rating);

  if (filtered.length === 0) { grid.innerHTML = ''; empty.classList.remove('hidden'); }
  else { empty.classList.add('hidden'); grid.innerHTML = filtered.map(productCard).join(''); }
}

function applyFilter(gender, category) {
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.filter === category);
  });
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-products').classList.add('active');
  renderProducts(gender, category);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================
   DETAIL PRODUK
   ============================================ */
function openDetail(id) {
  const p = PRODUCTS.find(x => String(x.id) === String(id));
  if (!p) return;
  const container = document.getElementById('detailContent');
  
  container.innerHTML = `
    <button onclick="navigateTo('products','all')" class="text-sm text-gray-500 hover:text-campus-primary mb-6 flex items-center gap-1">← Kembali ke katalog</button>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div class="bg-gray-100 rounded-xl overflow-hidden"><img src="${p.img}" alt="${p.name}" class="w-full h-auto object-cover"></div>
      <div>
        ${p.badge ? `<span class="inline-block bg-campus-accent text-white text-xs font-bold px-2.5 py-1 rounded mb-3">${p.badge}</span>` : ''}
        <h1 class="text-2xl lg:text-3xl font-extrabold mb-3">${p.name}</h1>
        <div class="flex items-baseline gap-3 mb-4">
          <span class="text-3xl font-extrabold text-campus-primary">${rupiah(p.price)}</span>
          ${p.oldPrice ? `<span class="text-lg text-gray-400 line-through">${rupiah(p.oldPrice)}</span>` : ''}
        </div>
        <div class="flex items-center gap-4 text-sm mb-6">
          <span class="flex items-center gap-1 text-campus-accent font-semibold">★ ${p.rating}</span>
          <span class="text-gray-400">·</span>
          <span class="text-gray-500">Kondisi: <strong class="text-campus-dark">${p.kondisi}</strong></span>
        </div>
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <p class="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Penjual</p>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-campus-primary text-white flex items-center justify-center font-bold">${p.seller.charAt(0)}</div>
            <div><div class="font-semibold text-sm">${p.seller}</div><div class="text-xs text-gray-500 flex items-center gap-1"><svg class="w-3 h-3 text-campus-success" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>Mahasiswa Terverifikasi</div></div>
          </div>
        </div>
        <div class="mb-6"><h3 class="font-bold text-sm mb-2">Deskripsi</h3><p class="text-sm text-gray-600 leading-relaxed">${p.desc}</p></div>
        
        <div class="flex flex-col gap-3">
          <div class="flex gap-3">
            <button onclick="addToCart('${p.id}')" class="flex-1 bg-white border-2 border-campus-primary text-campus-primary py-3.5 font-semibold rounded-lg hover:bg-campus-primary/5 transition">+ Keranjang</button>
            <button onclick="buyNow('${p.id}')" class="flex-1 bg-campus-primary text-white py-3.5 font-semibold rounded-lg hover:bg-campus-primaryLight transition shadow-lg shadow-campus-primary/30">Beli Sekarang</button>
          </div>
          <button onclick="toast('Fitur chat segera hadir!')" class="w-full bg-green-500 text-white py-3.5 font-semibold rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg> Chat Penjual
          </button>
        </div>
      </div>
    </div>`;
  document.querySelectorAll('.page').forEach(x => x.classList.remove('active'));
  document.getElementById('page-detail').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buyNow(id) {
  if (!currentUser) { toast('Silakan masuk terlebih dahulu'); navigateTo('login'); return; }
  const existing = cart.find(c => c.id === id);
  if (!existing) { cart.push({ id, qty: 1 }); localStorage.setItem('campus_cart', JSON.stringify(cart)); updateBadges(); renderCart(); }
  navigateTo('checkout');
}

/* ============================================
   WISHLIST & CART
   ============================================ */
function toggleWishlist(id) {
  const idx = wishlist.indexOf(id);
  if (idx > -1) { wishlist.splice(idx, 1); toast('Dihapus dari favorit'); }
  else { wishlist.push(id); toast('Ditambahkan ke favorit ❤'); }
  localStorage.setItem('campus_wishlist', JSON.stringify(wishlist));
  updateBadges(); renderFeatured(); renderProducts('all', 'all'); renderWishlist();
}

function renderWishlist() {
  const grid = document.getElementById('wishlistGrid');
  const empty = document.getElementById('wishlistEmpty');
  if (!grid) return;
  const items = PRODUCTS.filter(p => wishlist.includes(p.id));
  if (items.length === 0) { grid.innerHTML = ''; empty.classList.remove('hidden'); }
  else { empty.classList.add('hidden'); grid.innerHTML = items.map(productCard).join(''); }
}

function addToCart(id) {
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  localStorage.setItem('campus_cart', JSON.stringify(cart));
  toast('Ditambahkan ke keranjang'); updateBadges(); renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  localStorage.setItem('campus_cart', JSON.stringify(cart));
  updateBadges(); renderCart();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else { localStorage.setItem('campus_cart', JSON.stringify(cart)); updateBadges(); renderCart(); }
}

function cartTotal() {
  return cart.reduce((sum, c) => {
    const p = PRODUCTS.find(x => x.id === c.id);
    return sum + (p ? p.price * c.qty : 0);
  }, 0);
}

function renderCart() {
  const container = document.getElementById('cartContent');
  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML = `<div class="text-center py-20"><div class="text-6xl mb-4">🛒</div><p class="text-gray-500 mb-6">Keranjang kamu masih kosong.</p><button onclick="navigateTo('products','all')" class="bg-campus-primary text-white px-7 py-3 text-sm font-semibold rounded-lg hover:bg-campus-primaryLight transition">Mulai Belanja</button></div>`;
    return;
  }
  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-3">
        ${cart.map(c => {
          const p = PRODUCTS.find(x => x.id === c.id);
          if (!p) return '';
          return `<div class="bg-white p-4 rounded-xl border border-gray-100 flex gap-4">
            <img src="${p.img}" class="w-20 h-20 object-cover rounded-lg">
            <div class="flex-1"><h3 class="font-semibold text-sm mb-1">${p.name}</h3><p class="text-xs text-gray-500 mb-2">${p.seller}</p><p class="font-bold text-campus-primary">${rupiah(p.price)}</p></div>
            <div class="flex flex-col items-end justify-between">
              <button onclick="removeFromCart('${p.id}')" class="text-gray-400 hover:text-red-500"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>
              <div class="flex items-center gap-2 border border-gray-200 rounded-lg">
                <button onclick="changeQty('${p.id}',-1)" class="px-2 py-1 text-sm hover:bg-gray-100">−</button>
                <span class="text-sm font-semibold w-6 text-center">${c.qty}</span>
                <button onclick="changeQty('${p.id}',1)" class="px-2 py-1 text-sm hover:bg-gray-100">+</button>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="bg-white p-6 rounded-xl border border-gray-100 h-fit sticky top-24">
        <h3 class="font-bold mb-4">Ringkasan</h3>
        <div class="flex justify-between text-sm mb-2"><span class="text-gray-500">Subtotal</span><span class="font-semibold">${rupiah(cartTotal())}</span></div>
        <div class="flex justify-between text-sm mb-4 pb-4 border-b border-gray-200"><span class="text-gray-500">Biaya Layanan</span><span class="font-semibold">Rp 0</span></div>
        <div class="flex justify-between font-bold text-lg mb-5"><span>Total</span><span class="text-campus-primary">${rupiah(cartTotal())}</span></div>
        <button onclick="navigateTo('checkout')" class="w-full bg-campus-primary text-white py-3.5 font-semibold rounded-lg hover:bg-campus-primaryLight transition">Lanjut Checkout →</button>
      </div>
    </div>`;
}

/* ============================================
   CHECKOUT & ORDERS
   ============================================ */
function renderCheckout() {
  const summary = document.getElementById('checkoutSummary');
  const totalEl = document.getElementById('checkoutTotal');
  if (!summary) return;
  summary.innerHTML = cart.map(c => {
    const p = PRODUCTS.find(x => x.id === c.id);
    if (!p) return '';
    return `<div class="flex justify-between"><span class="text-gray-600 truncate pr-2">${p.name} × ${c.qty}</span><span class="font-semibold shrink-0">${rupiah(p.price * c.qty)}</span></div>`;
  }).join('');
  totalEl.textContent = rupiah(cartTotal());
}

function processPayment() {
  if (cart.length === 0) { toast('Keranjang kosong'); return; }
  const name = document.getElementById('checkoutName')?.value.trim();
  const phone = document.getElementById('checkoutPhone')?.value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  
  if (!name || !phone || !address) { toast('Mohon lengkapi data pengiriman'); return; }
  const payment = document.querySelector('input[name="payment"]:checked').value;

  const order = {
    id: 'CM-' + Date.now(),
    items: cart.map(c => ({ ...c, product: PRODUCTS.find(p => p.id === c.id) })),
    total: cartTotal(),
    name, phone, address, payment,
    status: 'Menunggu Pembayaran',
    date: new Date().toISOString(),
  };
  orders.unshift(order);
  localStorage.setItem('campus_orders', JSON.stringify(orders));
  cart = [];
  localStorage.setItem('campus_cart', JSON.stringify(cart));
  updateBadges();
  toast('Pesanan berhasil dibuat! 🎉');
  setTimeout(() => navigateTo('orders'), 800);
}

function renderOrders(status) {
  const container = document.getElementById('ordersContainer');
  if (!container) return;

  document.querySelectorAll('.order-tab').forEach(t => {
    const active = t.dataset.tab === status;
    t.classList.toggle('border-campus-primary', active);
    t.classList.toggle('text-campus-primary', active);
    t.classList.toggle('border-transparent', !active);
    t.classList.toggle('text-gray-500', !active);
  });

  const filtered = orders.filter(o => o.status === status);
  if (filtered.length === 0) {
    container.innerHTML = `<div class="text-center py-16 bg-white rounded-xl border border-gray-100"><div class="text-5xl mb-3">📦</div><p class="text-gray-500">Tidak ada pesanan di tab ini.</p></div>`;
    return;
  }

  const statusColors = { 'Menunggu Pembayaran': 'bg-campus-accent', 'Dikirim': 'bg-campus-secondary', 'Selesai': 'bg-campus-success' };
  container.innerHTML = filtered.map(o => `
    <div class="bg-white p-5 rounded-xl border border-gray-100">
      <div class="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
        <div><p class="font-bold text-sm">${o.id}</p><p class="text-xs text-gray-500">${new Date(o.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>
        <span class="${statusColors[o.status]} text-white text-xs font-bold px-3 py-1 rounded-full">${o.status}</span>
      </div>
      ${o.items.map(i => `<div class="flex justify-between text-sm mb-1"><span class="text-gray-600">${i.product.name} × ${i.qty}</span><span>${rupiah(i.product.price * i.qty)}</span></div>`).join('')}
      <div class="flex justify-between font-bold mt-3 pt-3 border-t border-gray-100"><span>Total (${o.payment})</span><span class="text-campus-primary">${rupiah(o.total)}</span></div>
      
      <!-- TOMBOL AKSI STATUS -->
      ${status === 'Menunggu Pembayaran' ? `<button onclick="updateStatus('${o.id}', 'Dikirim')" class="mt-4 w-full bg-campus-accent text-white py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition">Bayar Sekarang (Simulasi)</button>` : ''}
      ${status === 'Dikirim' ? `<button onclick="updateStatus('${o.id}', 'Selesai')" class="mt-4 w-full bg-campus-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-campus-primaryLight transition">Pesanan Diterima</button>` : ''}
    </div>
  `).join('');
}

function updateStatus(orderId, newStatus) {
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    localStorage.setItem('campus_orders', JSON.stringify(orders));
    renderOrders(newStatus);
    toast(`Status pesanan diubah ke: ${newStatus}`);
  }
}

/* ============================================
   BADGES, SEARCH & TOAST
   ============================================ */
function updateBadges() {
  const cartBadge = document.getElementById('cartBadge');
  const wishlistBadge = document.getElementById('wishlistBadge');
  if (cartBadge) cartBadge.textContent = cart.reduce((s, c) => s + c.qty, 0);
  if (wishlistBadge) wishlistBadge.textContent = wishlist.length;
}

function handleSearch(q) {
  const box = document.getElementById('searchSuggestions');
  if (!box) return;
  if (!q.trim()) { box.classList.add('hidden'); return; }
  const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
  if (results.length === 0) box.innerHTML = '<div class="p-4 text-sm text-gray-500">Tidak ditemukan</div>';
  else {
    box.innerHTML = results.map(p => `
      <a href="#" onclick="event.preventDefault(); openDetail('${p.id}'); document.getElementById('searchSuggestions').classList.add('hidden');" class="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
        <img src="${p.img}" class="w-10 h-10 rounded object-cover">
        <div class="flex-1 min-w-0"><p class="text-sm font-semibold truncate">${p.name}</p><p class="text-xs text-campus-primary font-bold">${rupiah(p.price)}</p></div>
      </a>
    `).join('');
  }
  box.classList.remove('hidden');
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

document.getElementById('menuBtn')?.addEventListener('click', () => {
  document.getElementById('mobileMenu')?.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
  const box = document.getElementById('searchSuggestions');
  const input = document.getElementById('searchInput');
  if (box && input && !box.contains(e.target) && !input.contains(e.target)) {
    box.classList.add('hidden');
  }
});

/* ============================================
   FUNGSI MODAL (FAQ, S&K, PRIVASI)
   ============================================ */
const modalData = {
  faq: {
    title: 'Pertanyaan Umum (FAQ)',
    content: `
      <div class="space-y-4">
        <div>
          <h4 class="font-bold text-campus-dark mb-1">1. Apakah saya bisa berjualan di sini?</h4>
          <p>Ya! Perbanas Market dikhususkan untuk mahasiswa aktif Perbanas Institute. Anda bisa menjual buku, alat tulis, atau barang elektronik layak pakai.</p>
        </div>
        <div>
          <h4 class="font-bold text-campus-dark mb-1">2. Bagaimana cara pembayarannya?</h4>
          <p>Kami menyediakan metode pembayaran via QRIS (GoPay, OVO, Dana), Transfer Bank (BRI/BCA), dan COD (Ketemuan di Kampus).</p>
        </div>
        <div>
          <h4 class="font-bold text-campus-dark mb-1">3. Apakah transaksi dijamin aman?</h4>
          <p>Aman. Kami menyarankan pembayaran melalui sistem Rekber (Rekening Bersama) atau COD di area kampus yang ramai (seperti Lobi atau Kantin) untuk menghindari penipuan.</p>
        </div>
        <div>
          <h4 class="font-bold text-campus-dark mb-1">4. Bagaimana jika barang rusak saat pengiriman?</h4>
          <p>Silakan hubungi tim Support kami melalui halaman Kontak Kami maksimal 1x24 jam setelah barang diterima.</p>
        </div>
      </div>
    `
  },
  tnc: {
    title: 'Syarat & Ketentuan',
    content: `
      <div class="space-y-4">
        <p class="font-semibold text-campus-dark">Dengan menggunakan layanan Perbanas Market, Anda menyetujui syarat dan ketentuan berikut:</p>
        <ul class="list-decimal pl-5 space-y-2">
          <li><strong>Kelayakan Pengguna:</strong> Pengguna wajib merupakan mahasiswa aktif Perbanas Institute yang terverifikasi melalui NIM atau Email Kampus.</li>
          <li><strong>Larangan Barang:</strong> Dilarang keras memperjualbelikan barang ilegal, obat-obatan terlarang, senjata tajam, atau barang yang melanggar hukum dan norma kesusilaan.</li>
          <li><strong>Transaksi:</strong> Segala bentuk transaksi dan kesepakatan harga merupakan tanggung jawab penjual dan pembeli. Platform hanya memfasilitasi pertemuan.</li>
          <li><strong>Penipuan:</strong> Segala bentuk penipuan akan berujung pada pemblokiran akun secara permanen dan pelaporan ke pihak berwenang kampus.</li>
        </ul>
      </div>
    `
  },
  privacy: {
    title: 'Kebijakan Privasi',
    content: `
      <div class="space-y-4">
        <p class="font-semibold text-campus-dark">Kami menghargai privasi Anda. Berikut adalah data yang kami kumpulkan:</p>
        <ul class="list-disc pl-5 space-y-2">
          <li><strong>Data Identitas:</strong> Nama, NIM, dan Email Kampus yang digunakan saat login.</li>
          <li><strong>Data Transaksi:</strong> Riwayat pesanan, alamat pengiriman (jika ada), dan nomor telepon (WhatsApp).</li>
          <li><strong>Penggunaan Data:</strong> Data Anda hanya digunakan untuk keperluan verifikasi, komunikasi transaksi, dan pengiriman barang. Kami tidak akan menjual data Anda kepada pihak ketiga.</li>
          <li><strong>Keamanan:</strong> Kami berkomitmen menjaga keamanan data Anda dengan enkripsi standar pada sistem kami.</li>
        </ul>
      </div>
    `
  }
};

function openModal(type) {
  const modal = document.getElementById('infoModal');
  const title = document.getElementById('modalTitle');
  const content = document.getElementById('modalContent');
  
  if (modalData[type]) {
    title.textContent = modalData[type].title;
    content.innerHTML = modalData[type].content;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden'; // Mencegah scroll di background
  }
}

function closeModal() {
  const modal = document.getElementById('infoModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = 'auto'; // Mengembalikan scroll
}

// FUNGSI UNTUK MENGAMBIL DATA DARI BACKEND
async function fetchProducts() {
  try {
    console.log("Sedang mengambil data produk...");
    const response = await fetch('http://localhost:3000/api/products');
    
    if (!response.ok) {
      throw new Error("Server merespon dengan error");
    }

    const data = await response.json();
    console.log("Data berhasil diterima:", data);

    // Masukkan data ke variabel global
    PRODUCTS = data;

    // Render ulang tampilan
    renderFeatured();
    renderProducts('all', 'all');

  } catch (error) {
    console.error("ERROR DETAIL:", error);
    toast('Gagal memuat produk dari database.');
  }
}

// Menutup modal jika area luar (backdrop) diklik
document.getElementById('infoModal')?.addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});