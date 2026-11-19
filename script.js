
// ==================================
// MARKETPRO - JAVASCRIPT
// ==================================

const ADMIN_EMAIL = "admin@marketpro.com";
const ADMIN_PASSWORD = "admin123";

let authMode = "login";
let currentUser = null;

// Penyimpanan lokal
function getData(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

let users = getData("mp_users", []);
let products = getData("mp_products", null);
let cart = getData("mp_cart", []);
let orders = getData("mp_orders", []);

// Produk awal
if (!products) {
  products = [
    {
      id: 1,
      name: "Sepatu Sport",
      price: 150000,
      image: ""
    },
    {
      id: 2,
      name: "Tas Fashion",
      price: 120000,
      image: ""
    },
    {
      id: 3,
      name: "Jam Tangan",
      price: 200000,
      image: ""
    },
    {
      id: 4,
      name: "Headphone",
      price: 175000,
      image: ""
    }
  ];

  saveData("mp_products", products);
}

// Format rupiah
function rupiah(number) {
  return "Rp" + Number(number).toLocaleString("id-ID");
}

// Keamanan tampilan teks
function aman(teks) {
  return String(teks).replace(/[&<>"']/g, function(c) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c];
  });
}

// ==================================
// LOGIN DAN REGISTER
// ==================================

document.getElementById("authForm")
.addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("email")
    .value.trim().toLowerCase();

  const password = document.getElementById("password")
    .value;

  const nama = document.getElementById("nama")
    .value.trim();

  const message = document.getElementById("authMessage");

  if (authMode === "login") {

    if (
      email === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD
    ) {
      login({
        name: "Administrator",
        email: email,
        role: "admin"
      });
      return;
    }

    const user = users.find(u =>
      u.email === email && u.password === password
    );

    if (!user) {
      message.textContent = "Email atau password salah!";
      return;
    }

    login({
      name: user.name,
      email: user.email,
      role: "user"
    });

  } else {

    if (!nama) {
      message.textContent = "Nama harus diisi!";
      return;
    }

    if (password.length < 6) {
      message.textContent = "Password minimal 6 karakter!";
      return;
    }

    if (email === ADMIN_EMAIL ||
        users.some(u => u.email === email)) {
      message.textContent = "Email sudah digunakan!";
      return;
    }

    users.push({
      name: nama,
      email: email,
      password: password
    });

    saveData("mp_users", users);

    message.style.color = "green";
    message.textContent = "Pendaftaran berhasil! Silakan login.";

    authMode = "login";
    updateAuth();
  }
});

// Ganti login dan daftar
function gantiAuth() {
  authMode = authMode === "login" ? "register" : "login";
  updateAuth();
}

function updateAuth() {
  const register = authMode === "register";

  document.getElementById("authTitle").textContent =
    register ? "Daftar Akun" : "Login MarketPro";

  document.getElementById("authButton").textContent =
    register ? "Daftar Sekarang" : "Login";

  document.getElementById("nama").hidden = !register;

  document.getElementById("switchAuth").textContent =
    register ? "Sudah punya akun? Login" :
    "Belum punya akun? Daftar";

  document.getElementById("authMessage").textContent = "";
  document.getElementById("authMessage").style.color = "#d32f2f";
}

// ==================================
// MASUK APLIKASI
// ==================================

function login(user) {
  currentUser = user;

  document.getElementById("auth").hidden = true;
  document.getElementById("app").hidden = false;

  document.getElementById("userName").textContent =
    "Halo, " + user.name;

  document.getElementById("adminNav").hidden =
    user.role !== "admin";

  renderProducts();
  renderCart();
  updateCount();

  showPage("home");
}

function logout() {
  currentUser = null;

  document.getElementById("auth").hidden = false;
  document.getElementById("app").hidden = true;

  document.getElementById("authForm").reset();

  authMode = "login";
  updateAuth();
}

// ==================================
// NAVIGASI HALAMAN
// ==================================

function showPage(page) {
  if (page === "admin" &&
      (!currentUser || currentUser.role !== "admin")) {
    alert("Khusus administrator!");
    return;
  }

  document.getElementById("homePage").hidden =
    page !== "home";

  document.getElementById("cartPage").hidden =
    page !== "cart";

  document.getElementById("adminPage").hidden =
    page !== "admin";

  if (page === "cart") renderCart();
  if (page === "admin") renderAdmin();
}

// ==================================
// PRODUK
// ==================================

function renderProducts() {
  const container = document.getElementById("products");

  const search = document.getElementById("search")
    .value.toLowerCase();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search)
  );

  container.innerHTML = "";

  if (filtered.length === 0) {
    container.textContent = "Produk tidak ditemukan.";
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";

    const image = p.image || "";

    card.innerHTML = `
      ${image ? `<img src="${aman(image)}" alt="${aman(p.name)}">` : ""}
      <h3>${aman(p.name)}</h3>
      <p>${rupiah(p.price)}</p>
      <button onclick="addCart(${p.id})">
        + Keranjang
      </button>
    `;

    container.appendChild(card);
  });
}

// ==================================
// KERANJANG BELANJA
// ==================================

function addCart(id) {
  const item = cart.find(c => c.id === id);

  if (item) {
    item.qty++;
  } else {
    cart.push({
      id: id,
      qty: 1
    });
  }

  saveData("mp_cart", cart);

  renderCart();
  updateCount();

  alert("Produk berhasil masuk keranjang!");
}

function updateCount() {
  const total = cart.reduce((sum, item) =>
    sum + item.qty, 0
  );

  document.getElementById("cartCount").textContent = total;
}

function renderCart() {
  const container = document.getElementById("cartItems");

  container.innerHTML = "";

  let total = 0;

  cart = cart.filter(item =>
    products.some(p => p.id === item.id)
  );

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);

    if (!product) return;

    total += product.price * item.qty;

    const div = document.createElement("div");
    div.className = "cartItem";

    div.innerHTML = `
      <h3>${aman(product.name)}</h3>
      <p>${rupiah(product.price)}</p>
      <p>Jumlah: ${item.qty}</p>

      <button onclick="changeQty(${item.id},-1)">-</button>
      <button onclick="changeQty(${item.id},1)">+</button>
      <button onclick="removeCart(${item.id})">Hapus</button>
    `;

    container.appendChild(div);
  });

  saveData("mp_cart", cart);

  document.getElementById("cartTotal").textContent =
    "Total: " + rupiah(total);

  updateCount();
}

function changeQty(id, amount) {
  const item = cart.find(c => c.id === id);

  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(c => c.id !== id);
  }

  saveData("mp_cart", cart);
  renderCart();
}

function removeCart(id) {
  cart = cart.filter(c => c.id !== id);

  saveData("mp_cart", cart);
  renderCart();
}

// ==================================
// CHECKOUT / PESANAN
// ==================================

function checkout() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    return;
  }

  const total = cart.reduce((sum, item) => {
    const p = products.find(x => x.id === item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);

  const order = {
    id: Date.now(),
    customer: currentUser.name,
    email: currentUser.email,
    items: cart.map(item => {
      const p = products.find(x => x.id === item.id);

      return {
        name: p.name,
        price: p.price,
        qty: item.qty
      };
    }),
    total: total,
    date: new Date().toLocaleString("id-ID")
  };

  orders.push(order);
  saveData("mp_orders", orders);

  cart = [];
  saveData("mp_cart", cart);

  renderCart();

  alert("Pesanan berhasil dibuat!");

  if (currentUser.role === "admin") {
    renderAdmin();
  }
}

// ==================================
// DASHBOARD ADMIN
// ==================================

function renderAdmin() {
  document.getElementById("totalProducts").textContent =
    products.length;

  document.getElementById("totalOrders").textContent =
    orders.length;

  const sales = orders.reduce((sum, o) =>
    sum + o.total, 0
  );

  document.getElementById("totalSales").textContent =
    rupiah(sales);

  renderAdminProducts();
  renderOrders();
}

// Tambah produk
document.getElementById("productForm")
.addEventListener("submit", function(e) {
  e.preventDefault();

  if (!currentUser || currentUser.role !== "admin") return;

  const name = document.getElementById("productName")
    .value.trim();

  const price = Number(document.getElementById("productPrice")
    .value);

  const image = document.getElementById("productImage")
    .value.trim();

  if (!name || !Number.isSafeInteger(price) || price <= 0) {
    alert("Masukkan nama dan harga produk yang benar!");
    return;
  }

  if (image && !/^https?:\/\//i.test(image)) {
    alert("URL gambar harus diawali http:// atau https://");
    return;
  }

  products.push({
    id: Date.now(),
    name: name,
    price: price,
    image: image
  });

  saveData("mp_products", products);

  this.reset();

  renderProducts();
  renderAdmin();

  alert("Produk berhasil ditambahkan!");
});

// Daftar produk admin
function renderAdminProducts() {
  const container = document.getElementById("adminProducts");

  container.innerHTML = "";

  products.forEach(p => {
    const div = document.createElement("div");
    div.className = "orderItem";

    div.innerHTML = `
      <strong>${aman(p.name)}</strong>
      <p>${rupiah(p.price)}</p>
      <button onclick="deleteProduct(${p.id})">
        Hapus Produk
      </button>
    `;

    container.appendChild(div);
  });
}

// Hapus produk
function deleteProduct(id) {
  if (!confirm("Yakin ingin menghapus produk?")) return;

  products = products.filter(p => p.id !== id);
  cart = cart.filter(c => c.id !== id);

  saveData("mp_products", products);
  saveData("mp_cart", cart);

  renderProducts();
  renderCart();
  renderAdmin();
}

// Daftar pesanan admin
function renderOrders() {
  const container = document.getElementById("adminOrders");

  container.innerHTML = "";

  if (orders.length === 0) {
    container.textContent = "Belum ada pesanan.";
    return;
  }

  orders.slice().reverse().forEach(o => {
    const div = document.createElement("div");
    div.className = "orderItem";

    div.innerHTML = `
      <strong>Pesanan #${o.id}</strong>
      <p>Pelanggan: ${aman(o.customer)}</p>
      <p>Email: ${aman(o.email)}</p>
      <p>Total: ${rupiah(o.total)}</p>
      <p>Tanggal: ${aman(o.date)}</p>
      <p>Produk: ${o.items.map(i =>
        aman(i.name) + " x " + i.qty
      ).join(", ")}</p>
    `;

    container.appendChild(div);
  });
}

// ==================================
// SELESAI
// ==================================

updateAuth();

console.log("MarketPro siap digunakan!");
