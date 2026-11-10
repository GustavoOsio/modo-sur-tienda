const products = [
  { id: "camiseta-trazo", name: "Camiseta Trazo", category: "ropa", categoryLabel: "ROPA · UNISEX", price: 59000, tag: "FAVORITO", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=82", alt: "Camiseta blanca de corte clásico" },
  { id: "tenis-ritmo", name: "Tenis Ritmo", category: "calzado", categoryLabel: "CALZADO · URBANO", price: 189000, tag: "NUEVO", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=82", alt: "Tenis deportivos rojos" },
  { id: "buzo-fuera", name: "Buzo Fuera de Línea", category: "ropa", categoryLabel: "ROPA · OVERSIZE", price: 129000, tag: "UN CLÁSICO", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=82", alt: "Buzo casual para clima fresco" },
  { id: "gorra-parche", name: "Gorra Parche", category: "accesorios", categoryLabel: "ACCESORIOS", price: 49000, tag: "EDICIÓN SUR", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=82", alt: "Gorra urbana de color neutro" },
  { id: "camisa-pulso", name: "Camisa Pulso", category: "ropa", categoryLabel: "ROPA · RELAXED", price: 89000, tag: "PARA EL PARCHE", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=82", alt: "Camisa casual de manga corta" },
  { id: "tenis-orbita", name: "Tenis Órbita", category: "calzado", categoryLabel: "CALZADO · DIARIO", price: 169000, tag: "MODO ON", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=82", alt: "Tenis urbanos de uso diario" }
];

const money = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const grid = document.querySelector("#product-grid");
const searchInput = document.querySelector("#product-search");
const resultCount = document.querySelector("#results-count");
const emptyState = document.querySelector("#empty-state");
const cartOverlay = document.querySelector("#cart-overlay");
const cartItems = document.querySelector("#cart-items");
const toast = document.querySelector("#toast");
let activeFilter = "todos";
let cart = loadCart();
let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("modo-sur-cart") || "[]");
    return Array.isArray(saved) ? saved.filter((item) => products.some((product) => product.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch { return []; }
}

function saveCart() { localStorage.setItem("modo-sur-cart", JSON.stringify(cart)); }

function renderProducts() {
  const query = searchInput.value.trim().toLocaleLowerCase("es");
  const visible = products.filter((product) => {
    const matchesFilter = activeFilter === "todos" || product.category === activeFilter;
    const matchesSearch = `${product.name} ${product.categoryLabel}`.toLocaleLowerCase("es").includes(query);
    return matchesFilter && matchesSearch;
  });
  grid.innerHTML = visible.map((product, index) => `
    <article class="product-card" style="animation-delay:${index * 45}ms">
      <div class="product-image-wrap"><img class="product-image" src="${product.image}" alt="${product.alt}" loading="lazy" width="800" height="960" /><span class="product-tag">${product.tag}</span><button class="product-add" data-add="${product.id}" aria-label="Añadir ${product.name} a la bolsa">+</button></div>
      <div class="product-meta"><div><h3 class="product-name">${product.name}</h3><p class="product-category">${product.categoryLabel}</p></div><span class="product-price">${money.format(product.price)}</span></div>
    </article>`).join("");
  resultCount.textContent = `${visible.length} ${visible.length === 1 ? "pieza" : "piezas"} para descubrir`;
  emptyState.hidden = visible.length > 0;
}

function cartQuantity() { return cart.reduce((sum, item) => sum + item.quantity, 0); }

function renderCart() {
  const quantity = cartQuantity();
  document.querySelector("#cart-count").textContent = quantity;
  document.querySelector("#open-cart").setAttribute("aria-label", `Abrir carrito, ${quantity} ${quantity === 1 ? "producto" : "productos"}`);
  document.querySelector("#cart-title-count").textContent = `(${quantity})`;
  document.querySelector("#cart-empty").hidden = quantity > 0;
  document.querySelector("#cart-items").hidden = quantity === 0;
  const total = cart.reduce((sum, item) => sum + products.find((product) => product.id === item.id).price * item.quantity, 0);
  document.querySelector("#cart-total").textContent = money.format(total);
  cartItems.innerHTML = cart.map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return `<article class="cart-item"><img src="${product.image}" alt="" width="72" height="83" /><div><h3>${product.name}</h3><p>${product.categoryLabel}</p><strong>${money.format(product.price)}</strong><div class="quantity-controls"><button data-quantity="${product.id}" data-change="-1" aria-label="Quitar una unidad de ${product.name}">−</button><span>${item.quantity}</span><button data-quantity="${product.id}" data-change="1" aria-label="Añadir una unidad de ${product.name}">+</button></div><button class="remove-item" data-remove="${product.id}">Quitar</button></div></article>`;
  }).join("");
}

function announce(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2300);
}

function addToCart(id) {
  const item = cart.find((entry) => entry.id === id);
  if (item) item.quantity += 1; else cart.push({ id, quantity: 1 });
  saveCart(); renderCart(); announce(`${products.find((product) => product.id === id).name} se añadió a tu bolsa.`);
}

document.querySelectorAll(".filter-button").forEach((button) => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll(".filter-button").forEach((filter) => { const active = filter === button; filter.classList.toggle("active", active); filter.setAttribute("aria-pressed", active); });
  renderProducts();
}));
searchInput.addEventListener("input", renderProducts);
grid.addEventListener("click", (event) => { const button = event.target.closest("[data-add]"); if (button) addToCart(button.dataset.add); });
cartItems.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove]");
  const quantityButton = event.target.closest("[data-quantity]");
  if (removeButton) cart = cart.filter((item) => item.id !== removeButton.dataset.remove);
  if (quantityButton) {
    const item = cart.find((entry) => entry.id === quantityButton.dataset.quantity);
    item.quantity += Number(quantityButton.dataset.change);
    if (item.quantity < 1) cart = cart.filter((entry) => entry !== item);
  }
  saveCart(); renderCart();
});

function openCart() { cartOverlay.hidden = false; document.body.style.overflow = "hidden"; document.querySelector("#close-cart").focus(); }
function closeCart() { cartOverlay.hidden = true; document.body.style.overflow = ""; document.querySelector("#open-cart").focus(); }
document.querySelector("#open-cart").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
document.querySelector("#keep-shopping").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", (event) => { if (event.target === cartOverlay) closeCart(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !cartOverlay.hidden) closeCart(); });
document.querySelector("#checkout-button").addEventListener("click", () => announce("La compra es demostrativa para este proyecto escolar."));
document.querySelector(".search-toggle").addEventListener("click", () => { searchInput.focus(); document.querySelector("#coleccion").scrollIntoView({ behavior: "smooth" }); });

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");
menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
  mainNav.classList.toggle("open", !isOpen);
});
mainNav.addEventListener("click", (event) => { if (event.target.closest("a")) { mainNav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); menuToggle.setAttribute("aria-label", "Abrir menú"); } });

document.querySelector("#newsletter-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.querySelector("#newsletter-email");
  const message = document.querySelector("#newsletter-message");
  if (!email.checkValidity()) { email.reportValidity(); return; }
  message.textContent = "¡Listo! Te avisaremos cuando haya novedades. (Demo escolar)";
  message.classList.add("success");
  event.target.reset();
});

renderProducts();
renderCart();
