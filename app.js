const CART_KEY = "specialdish_cart";
const mobileNav = document.querySelector("#mobile-nav");
const cartCountNodes = document.querySelectorAll("[data-cart-count]");
const menuGrid = document.querySelector("[data-menu-grid]");
const productBox = document.querySelector("#product-container");
const cartSummary = document.querySelector("#cart-summary");
const paymentForm = document.querySelector("#paymentForm");
const toast = document.querySelector(".added-toast");
const filterButtons = document.querySelectorAll("[data-filter]");
const searchInput = document.querySelector("#menu-search");

function displaybar() {
    if (mobileNav) {
        mobileNav.classList.toggle("active");
    }
}

function getCart() {
    try {
        const stored = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(stored) ? stored : [];
    } catch (error) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountNodes.forEach((node) => {
        node.textContent = total;
    });
}

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = "block";
    if (toast.dataset.timer) {
        clearTimeout(Number(toast.dataset.timer));
    }
    const timeout = setTimeout(() => {
        toast.style.display = "none";
    }, 1800);
    toast.dataset.timer = String(timeout);
}

function addToCart(item, quantity) {
    const cart = getCart();
    const existing = cart.find((entry) => entry.id === item.id);
    if (existing) {
        existing.qty += quantity;
    } else {
        cart.push({ ...item, qty: quantity });
    }
    saveCart(cart);
}

function updateCartItem(id, delta) {
    const cart = getCart();
    const updated = cart
        .map((entry) => {
            if (entry.id !== id) return entry;
            return { ...entry, qty: entry.qty + delta };
        })
        .filter((entry) => entry.qty > 0);
    saveCart(updated);
    renderCart();
}

function removeCartItem(id) {
    const cart = getCart().filter((entry) => entry.id !== id);
    saveCart(cart);
    renderCart();
}

function handleMenuActions() {
    if (!menuGrid) return;

    document.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-action]");
        if (!actionButton) return;

        const card = actionButton.closest(".menu-card");
        if (!card) return;

        const item = {
            id: card.dataset.id,
            name: card.dataset.name,
            price: Number(card.dataset.price || 0),
            img: card.dataset.img || "",
        };

        if (actionButton.dataset.action === "add") {
            addToCart(item, 1);
            showToast("Added to cart");
        }

        if (actionButton.dataset.action === "buy") {
            addToCart(item, 1);
            window.location.href = "cart.html";
        }
    });
}

function handleFilters() {
    if (!menuGrid) return;

    function applyFilter() {
        const activeButton = document.querySelector(".filter-btn.active");
        const filterValue = activeButton ? activeButton.dataset.filter : "all";
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

        document.querySelectorAll(".menu-card").forEach((card) => {
            const category = card.dataset.category || "";
            const name = (card.dataset.name || "").toLowerCase();
            const matchesFilter = filterValue === "all" || category === filterValue;
            const matchesSearch = !query || name.includes(query);
            card.style.display = matchesFilter && matchesSearch ? "" : "none";
        });
    }

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            filterButtons.forEach((btn) => btn.classList.remove("active"));
            button.classList.add("active");
            applyFilter();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", applyFilter);
    }
}

function setActiveNavLink() {
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".navbar .nav-link").forEach((link) => {
        const href = link.getAttribute("href") || "";
        const target = href.split("/").pop();
        if (target === currentPath) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

function renderCart() {
    if (!productBox) return;

    const cart = getCart();
    if (!cart.length) {
        productBox.innerHTML = `<div class="card info-block"><h3>Your cart is empty</h3><p>Add dishes from the menu to get started.</p><a class="btn btn-outline-light" href="menu.html">Browse menu</a></div>`;
        if (cartSummary) {
            cartSummary.innerHTML = "";
        }
        return;
    }

    const itemsMarkup = cart
        .map((item) => {
            const total = (item.price * item.qty).toFixed(2);
            return `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}">
                <div>
                    <h3>${item.name}</h3>
                    <p>$${item.price.toFixed(2)} each</p>
                </div>
                <div class="cart-actions">
                    <div class="qty-control">
                        <button class="qty-btn" type="button" data-cart-action="decrease" data-id="${item.id}">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" type="button" data-cart-action="increase" data-id="${item.id}">+</button>
                    </div>
                    <strong>$${total}</strong>
                    <button class="remove-btn" type="button" data-cart-action="remove" data-id="${item.id}">Remove</button>
                </div>
            </div>
            `;
        })
        .join("");

    productBox.innerHTML = itemsMarkup;

    if (cartSummary) {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const delivery = subtotal > 0 ? 1.5 : 0;
        const service = subtotal * 0.08;
        const total = subtotal + delivery + service;

        cartSummary.innerHTML = `
            <div class="summary-row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
            <div class="summary-row"><span>Service</span><span>$${service.toFixed(2)}</span></div>
            <div class="summary-row"><span>Delivery</span><span>$${delivery.toFixed(2)}</span></div>
            <div class="summary-total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
        `;
    }
}

function handleCartActions() {
    document.addEventListener("click", (event) => {
        const button = event.target.closest("[data-cart-action]");
        if (!button) return;
        const id = button.dataset.id;
        const action = button.dataset.cartAction;

        if (action === "increase") {
            updateCartItem(id, 1);
        }

        if (action === "decrease") {
            updateCartItem(id, -1);
        }

        if (action === "remove") {
            removeCartItem(id);
        }
    });
}

function handlePayment() {
    if (!paymentForm) return;
    paymentForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const cart = getCart();
        if (!cart.length) {
            alert("Your cart is empty. Please add items first.");
            return;
        }
        alert("Order placed successfully!");
        saveCart([]);
        window.location.href = "index.html";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount();
    handleMenuActions();
    handleFilters();
    renderCart();
    handleCartActions();
    handlePayment();
    setActiveNavLink();
});

window.barmenu = displaybar;
