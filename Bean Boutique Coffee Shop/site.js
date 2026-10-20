/* ---------- Product catalog ----------
   Each "Add to cart" link uses a slug like ?add=mill-lane-blend.
   This table turns that slug into a real name and price. */
var PRODUCTS = {
  "mill-lane-blend":          { name: "Mill Lane Blend",            price: 12.00 },
  "weekend-filter-blend":     { name: "Weekend Filter Blend",       price: 10.89 },
  "yirgacheffe-ethiopia":     { name: "Yirgacheffe, Ethiopia",      price: 12.00 },
  "huila-colombia":           { name: "Huila, Colombia",            price: 15.19 },
  "sumatra-mandheling":       { name: "Sumatra Mandheling",         price: 11.00 },
  "sunday-decaf":             { name: "Sunday Decaf",               price: 10.50 },
  "compact-espresso-machine": { name: "Compact Espresso Machine",   price: 189.00 },
  "french-press-1l":          { name: "French Press, 1L",           price: 28.00 },
  "ceramic-pour-over-dripper":{ name: "Ceramic Pour-Over Dripper",  price: 19.50 },
  "stovetop-moka-pot":        { name: "Stovetop Moka Pot",          price: 32.00 },
  "adjustable-burr-grinder":  { name: "Adjustable Burr Grinder",    price: 65.00 }
};

var CART_KEY = "bb_cart_items";

document.addEventListener("DOMContentLoaded", function () {
  handleAddToCartFromUrl();
  renderCartPage();
  setupCoffeeSearch();
});


/* ---------- Cart helpers ---------- */
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function addToCart(slug) {
  var product = PRODUCTS[slug];
  if (!product) return; // unknown slug, ignore safely

  var items = getCart();
  var existing = items.find(function (item) { return item.slug === slug; });

  if (existing) {
    existing.qty += 1;
  } else {
    items.push({ slug: slug, name: product.name, price: product.price, qty: 1 });
  }

  saveCart(items);
}


/* ---------- 1. Read ?add=slug from the URL and add it to the cart ---------- */
function handleAddToCartFromUrl() {
  var params = new URLSearchParams(window.location.search);
  var slug = params.get("add");

  if (slug) {
    addToCart(slug);
    // remove ?add=... from the address bar so refreshing the page
    // doesn't add the same item again
    var cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}


/* ---------- 2. Render the cart table on Shopping_cart.html ---------- */
function renderCartPage() {
  var tableBody = document.getElementById("cart-table-body");
  if (!tableBody) return; // not the cart page

  var items = getCart();
  var emptyBox = document.getElementById("cart-empty");
  var tableBox = document.getElementById("cart-table-box");

  if (items.length === 0) {
    if (emptyBox) emptyBox.hidden = false;
    if (tableBox) tableBox.hidden = true;
    return;
    
  
  }

  if (emptyBox) emptyBox.hidden = true;
  if (tableBox) tableBox.hidden = false;

  tableBody.innerHTML = "";
  var subtotal = 0;

  items.forEach(function (item, index) {
    var lineTotal = item.price * item.qty;
    subtotal += lineTotal;

    var row = document.createElement("tr");
    row.innerHTML =
      "<td>" + item.name + "</td>" +
      "<td>$" + item.price.toFixed(2) + "</td>" +
      "<td>" +
                '<input type="number" min="1" class="qty-input" value="' + item.qty + '" data-qty-index="' + index + '">' +
      "</td>" +
      "<td>$" + lineTotal.toFixed(2) + "</td>" +
      '<td><button class="cart-table__remove" data-remove-index="' + index + '">Remove</button></td>';
    tableBody.appendChild(row);
  });

  var delivery = subtotal > 0 ? 3.50 : 0;
  var subtotalEl = document.getElementById("cart-subtotal");
  var deliveryEl = document.getElementById("cart-delivery");
  var totalEl = document.getElementById("cart-total");
  if (subtotalEl) subtotalEl.textContent = "$" + subtotal.toFixed(2);
  if (deliveryEl) deliveryEl.textContent = "$" + delivery.toFixed(2);
  if (totalEl) totalEl.textContent = "$" + (subtotal + delivery).toFixed(2);

  // Remove buttons
  tableBody.querySelectorAll("[data-remove-index]").forEach(function (button) {
    button.addEventListener("click", function () {
      var items = getCart();
      var index = parseInt(button.getAttribute("data-remove-index"), 10);
      items.splice(index, 1);
      saveCart(items);
      renderCartPage();
    });
  });

  // Quantity inputs
  tableBody.querySelectorAll("[data-qty-index]").forEach(function (input) {
    input.addEventListener("change", function () {
      var items = getCart();
      var index = parseInt(input.getAttribute("data-qty-index"), 10);
      items[index].qty = Math.max(1, parseInt(input.value, 10) || 1);
      saveCart(items);
      renderCartPage();
    });
  });
}


/* ---------- 3. Real live text search on Coffee Selection ---------- */
function setupCoffeeSearch() {
  var searchInput = document.getElementById("coffee-search");
  var cards = document.querySelectorAll("[data-product-card]");

  if (!searchInput || cards.length === 0) return; 

  searchInput.addEventListener("input", function () {
    var query = searchInput.value.trim().toLowerCase();

    cards.forEach(function (card) {
      var name = card.getAttribute("data-name").toLowerCase();
      var matches = name.indexOf(query) !== -1;
      card.classList.toggle("is-hidden", !matches);
    });
  });
}