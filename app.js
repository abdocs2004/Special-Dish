const mobileNav = document.querySelector("#mobile-nav");
const menuItems = document.querySelectorAll(".item");
const productBox = document.querySelector("#product-container");
const paymentForm = document.querySelector("#paymentForm");

/* ==========================
   FUNCTIONS
========================== */

// toggle المينيو للموبايل
function displaybar() {
    if (mobileNav) {
        mobileNav.classList.toggle("active");
    }
}

// التعامل مع ضغط المستخدم على items في menu.html
function handleItemsClick() {
    if (!menuItems.length) return;

    menuItems.forEach((item) => {
        item.addEventListener("click", () => {
            const name =
                item.dataset.name ||
                item.querySelector("p")?.textContent?.trim() ||
                "Unknown Item";
            const price = parseFloat(item.dataset.price || "0");
            const img = item.querySelector("img")?.src || "";

            // خزن المنتج
            localStorage.setItem(
                "selectedItem",
                JSON.stringify({ name, price, img })
            );

            // روح على cart.html
            window.location.href = "cart.html";
        });
    });
}

// عرض المنتج المختار في cart.html
function handleCartDisplay() {
    if (!productBox) return;

    let productData = null;
    try {
        productData = JSON.parse(localStorage.getItem("selectedItem"));
    } catch (_) {
        productData = null;
    }

    if (productData) {
        productBox.innerHTML = `
    <div class="product"
    style="display:flex;
    gap:16px;
    align-items:center;
    ">
        <img src="${productData.img}" alt="${productData.name}" 
        style="width:120px;
        height:120px;
        object-fit:cover;
        border-radius:12px;
        ">
        <div class="info">
            <h3 style="margin:0 0 6px;">${productData.name}</h3>
            <p style="margin:0;">Price: $${Number(productData.price).toFixed(2)}</p>
        </div>
    </div>
    `;
    } else {
        productBox.innerHTML = `
    <p>No product selected.</p>
    <p><a href="menu.html">Go to menu</a></p>
    `;
    }
}

// معالجة فورم الدفع في cart.html
function handlePayment() {
    if (!paymentForm) return;

    paymentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        alert("Order placed successfully!");
        localStorage.removeItem("selectedItem");
        window.location.href = "index.html";
    });
}

/* ==========================
   INIT
========================== */
document.addEventListener("DOMContentLoaded", () => {
    handleItemsClick();
    handleCartDisplay();
    handlePayment();
});

// نخلي toggleMenu متاحة للـ HTML
window.barmenu = displaybar;
