// ====== main.js (FINAL FULL FIXED VERSION - CONSISTENT STORAGE) ======

/* --- Restriction flag --- */
let userHasPendingOrder = false;

/* --- Safe helpers --- */
const safeJSONParse = (str, fallback = null) => {
  try { return JSON.parse(str); } catch (e) { return fallback; }
};

const user = safeJSONParse(localStorage.getItem("loggedUser"), null);

/* --- Storage helpers (single source of truth) --- */
// Key: orders_user_<id> for logged users, orders_guest for guests
function ordersKey() {
  const u = safeJSONParse(localStorage.getItem("loggedUser"), null) || user;
  if (u && (u.id || u.userId)) return `orders_user_${u.id || u.userId}`;
  return "orders_guest";
}
function getOrders() {
  return safeJSONParse(localStorage.getItem(ordersKey()), []) || [];
}
function setOrders(orders) {
  localStorage.setItem(ordersKey(), JSON.stringify(orders || []));
}
function clearOrdersForCurrent() {
  localStorage.removeItem(ordersKey());
}

/* --- Header scroll class toggle --- */
const header = document.querySelector("#main-header");
if (header) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.remove("header-top");
      header.classList.add("header-scrolled");
    } else {
      header.classList.remove("header-scrolled");
      header.classList.add("header-top");
    }
  });
}

/* --- Swiper (menu swiper) --- */
let swiper_two = null;
if (typeof Swiper !== "undefined") {
  try {
    swiper_two = new Swiper(".menuSwiper", {
      loop: true,
      grabCursor: true,
      speed: 500,
      lazy: { loadPrevNext: true, loadPrevNextAmount: 2 },
      autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
      preloadImages: false,
    });
  } catch (e) {
    console.warn("Swiper init failed:", e);
  }
}

/* --- Top items / trending wrapper --- */
const wrapper = document.getElementById("trend-swiper");

async function loadTopItems() {
  if (!wrapper) return;
  try {
    const res = await fetch("http://localhost:8090/api/likes/top-items");
    if (!res.ok) throw new Error(`Top items fetch failed (${res.status})`);
    const items = await res.json();

    wrapper.innerHTML = "";
    const slidesHTML = items.map(item => `
      <div class="swiper-slide food-slide">
        <div class="food-slide-img flex-center">
          <img src="${item.imageUrl || 'public/imgs/items/placeholder.png'}" alt="${item.name || ''}">
        </div>
        <div class="food-slide-bottom flex-center">
          <div class="food-slide-text">
            <h5>${getDisplayName(item.type)}</h5>
            <h4>${item.name || 'Unnamed'}</h4>
            <p>From <span>₱${(item.price || 0).toFixed(2)}</span></p>
          </div>
          <div class="food-slide-btn">
            <button onclick="order(${item.id || 0})">Buy</button>
          </div>
        </div>
      </div>
    `);

    wrapper.insertAdjacentHTML("beforeend", slidesHTML.join(""));

    const imgs = wrapper.querySelectorAll("img");
    await Promise.all(Array.from(imgs).map(img => new Promise(resolve => {
      if (img.complete) return resolve();
      img.addEventListener("load", resolve, { once: true });
      img.addEventListener("error", resolve, { once: true });
    })));

    if (window.swiper_like) {
      try { window.swiper_like.destroy(true, true); } catch (e) { /* ignore */ }
      window.swiper_like = null;
    }

    if (typeof Swiper !== "undefined") {
      window.swiper_like = new Swiper('.likeSwiper', {
        loop: true,
        grabCursor: true,
        spaceBetween: 30,
        speed: 500,
        lazy: { loadPrevNext: true, loadPrevNextAmount: 2 },
        autoplay: { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
        preloadImages: true,
        breakpoints: { 0: { slidesPerView: 1 }, 620: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } },
      });
    }
  } catch (err) {
    console.error("Failed to load top items:", err);
  }
}

/* --- Sidebar toggle (jQuery) --- */
const orderSidebar = $("#order-side-bar");
const sidebarBtn = $("#order-btn");
let sidebarOpen = false;
if (sidebarBtn && orderSidebar) {
  sidebarBtn.on("click", () => {
    if (!sidebarOpen) {
      orderSidebar.css({ right: "-400px", display: "block" }).animate({ right: "0" }, 300);
    } else {
      orderSidebar.animate({ right: "-400px" }, 300, function () { orderSidebar.css("display", "none"); });
    }
    sidebarOpen = !sidebarOpen;
  });
}

/* --- Order list toggle --- */
$(document).on('click', '.order', function () {
  const orderList = $(this).next('.order-list');
  orderList.stop(true, true).slideToggle(300);
});

/* --- Post popup handlers --- */
const postPopUpElement = $('.post-popup-mp');
window.postPopup = function () { if (postPopUpElement) postPopUpElement.removeClass("hidden"); };
window.postExit  = function () { if (postPopUpElement) postPopUpElement.addClass("hidden"); };

/* --- Image preview --- */
const imageInput = document.getElementById('post-file-mp');
const previewImage = document.getElementById('preview-img-mp');
if (imageInput && previewImage) {
  imageInput.addEventListener('change', function () {
    const file = this.files && this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) { previewImage.src = e.target.result; };
    reader.readAsDataURL(file);
  });
}

/* --- Fallback food items --- */
const foodItems = [
  { category: "Drinks and Refreshment", name: "Okinawa Milktea", price: 100.00, image: "public/imgs/items/placeholder.png" },
  { category: "Snacks", name: "Cheesy Fries", price: 70.00, image: "public/imgs/items/placeholder.png" },
  { category: "Meals", name: "Burger Steak", price: 120.00, image: "public/imgs/items/placeholder.png" }
];

/* --- Display name helper --- */
window.getDisplayName = function (type) {
  switch (type) {
    case "riceMeal": return "Rice Meals";
    case "noodles": return "Noodles & Pasta";
    case "snacks": return "Snacks";
    case "desserts": return "Desserts & Sweets";
    case "drinks": return "Drinks";
    case "bakedGoods": return "Baked Goods";
    default: return "Unknown";
  }
};

/* --- Type filter button --- */
window.typeButton = function (type) {
  if (type) {
    localStorage.setItem("selectedType", type);
    window.location.href = "menu-type.html";
  } else {
    localStorage.removeItem("selectedType");
    window.location.href = "menu.html";
  }
};

/* --- loadItems --- */
async function loadItems(type) {
  const banner = document.querySelector("#banner-type-img");
  if (banner) banner.src = `public/imgs/banner/${type}.png`;

  const menuCon = document.querySelector('.menu-gallery-con');
  if (!menuCon) return;
  menuCon.innerHTML = "";

  const apiUrl = type ? `http://localhost:8090/api/items/type/${type}` : "http://localhost:8090/api/items";

  // optional: get user's liked item ids so we can mark hearts on load
  const loggedUser = (typeof user !== "undefined" && user) ? user : null;
  let likedItemIds = new Set();
  if (loggedUser && loggedUser.id) {
    try {
      const likesRes = await fetch(`http://localhost:8090/api/likes/user/${loggedUser.id}`);
      if (likesRes.ok) {
        const likedItems = await likesRes.json(); // expecting array of Item objects
        likedItems.forEach(it => {
          if (it.id != null) likedItemIds.add(String(it.id));
        });
      }
    } catch (err) {
      // ignore if endpoint not available
      console.warn("Could not preload liked items:", err);
    }
  }

  try {
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error(`Failed to load items (${res.status})`);
    const items = await res.json();

    items.forEach(item => {
      const slide = document.createElement("div");
      slide.classList.add("gallery-item-con");

      // attach data-id to the container so it's easy to find
      slide.dataset.id = item.id;

      // decide heart icons based on whether user liked this already
      const liked = likedItemIds.has(String(item.id));
      const likeIcon = liked ? "public/imgs/icons/like-pressed.png" : "public/imgs/icons/like.png";
      const dislikeIcon = liked ? "public/imgs/icons/dislike.png" : "public/imgs/icons/dislike.png"; // keep same or use different image

      slide.innerHTML = `
        <form id="order-form" class="hidden"></form>
        <input type="hidden" value="${item.id}">
        <button class="gallery-overlay flex-center btn-order" data-id="${item.id}">
          <h2>*Tap to Order*</h2>
        </button>
        <div class="gallery-overlay-btn">
          <button class="like-btn" type="button"><img src="${likeIcon}" alt="like"></button>
        </div>
        <div class="gallery-img-con">
          <img src="${item.imageUrl || 'public/imgs/items/placeholder.png'}" alt="">
        </div>
        <div class="gallery-bottom-con flex-center">
          <div class="gallery-text-con flex-center">
            <h4>${item.name}</h4>
            <h5>${getDisplayName(item.type)}</h5>
          </div>
          <div class="gallery-price-con">
            <p>₱${(item.price || 0).toFixed(2)}</p>
          </div>
        </div>
      `;
      menuCon.appendChild(slide);
    });
  } catch (err) {
    console.error("Error loading items:", err);
  }
}


/* --- Sidebar & order elements --- */
const sideBarNoAcc = document.querySelector("#sidebar-no-account");
const sideBarWithAcc = document.querySelector("#sidebar-with-account");
const orderEmpty = document.querySelector("#order-empty");
const orderContainer = document.querySelector("#order-contains");
const withOrder = document.querySelector("#with-order") || orderContainer;

/* --- Render Orders --- */
function renderOrders() {
  if (!orderContainer) return;

  const orders = getOrders();
  orderContainer.innerHTML = "";

  if (orders.length === 0) {
    orderEmpty?.classList.remove("hidden");
    withOrder?.classList.add("hidden");
  } else {
    orderEmpty?.classList.add("hidden");
    withOrder?.classList.remove("hidden");
  }


  let totalQuantity = 0;
  let totalAmount = 0;

  orders.forEach(order => {
    let itemName = order.name || "Unknown Item";
    let quantity = order.quantity || 1;
    let itemTotal = (order.price || 0);
    if(!userHasPendingOrder) itemTotal = (order.price || 0) * quantity;
    totalQuantity += quantity;
    totalAmount += itemTotal;
    const itemPriceText = `₱${itemTotal.toFixed(2)}`;
    const imgSrc = order.imageUrl || "public/imgs/items/placeholder.png";

    const orderHTML = `
      <div class="order-con flex-center" data-id="${order.itemId}">
        <div class="order-img"><img src="${imgSrc}" alt="${itemName}"></div>
        <div class="order-right">
          <div class="order-text-con flex-center">
            <div class="order-details"><div class="order-name"><h5>${itemName}</h5></div></div>
            <div class="order-price"><h4>${itemPriceText}</h4></div>
          </div>
          <div class="order-btns flex-center">
            <div class="order-quantity-btn flex-center">
              <button class="flex-center btn-qty minus" data-id="${order.itemId}">-</button>
              <h4 class="qty-display">${quantity}</h4>
              <button class="flex-center btn-qty plus" data-id="${order.itemId}">+</button>
            </div>
            <div class="order-remove-btn">
              <button class="remove-btn" data-id="${order.itemId}">
                <img src="public/imgs/icons/delete-icon.png" alt="Remove">
              </button>
            </div>
          </div>
        </div>
      </div>`;

    orderContainer.insertAdjacentHTML("beforeend", orderHTML);
  });

  const $totalQuantity = $('#sidebar-quantity');
  const $totalAmount = $('#sidebar-total');

  if ($totalQuantity && $totalQuantity.length) $totalQuantity.text(totalQuantity);
  if ($totalAmount && $totalAmount.length) $totalAmount.text(`₱${totalAmount.toFixed(2)}`);

  const $countDiv = $(".nav-order-count");
  if ($countDiv && $countDiv.length) $countDiv.text(orders.length);
}

/* --- proceedCheckOut (basic) --- */
function proceedCheckOut() {
  if (userHasPendingOrder) {
    alert("Your Order Is Already Pending...");
    return;
  }

  const orders = getOrders();

  if (orders.length <= 0) {
    alert("You haven't ordered anything...");
    return;
  }

  const simplified = {
    userId: user?.id, // or however you store the user id
    items: orders.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
      price: item.price
    }))
  };

  fetch("http://localhost:8090/api/orders/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(simplified)
  })
    .then(res => res.text())
    .then(msg => console.log(msg))
    .catch(err => console.error("Error submitting order:", err));
   alert("Successfully Ordered, your Order is now Pending...")
   location.reload();
}

/* --- Quantity and remove --- */
function updateOrderQuantity(itemId, change) {

  if (userHasPendingOrder) {
    alert("You already have a pending order. Please claim it before making a new one.");
    return;
  }

  let orders = getOrders();
  const order = orders.find(o => o.itemId === itemId);
  if (!order) return;

  order.quantity = Math.max(1, (order.quantity || 1) + change);
  // ensure total is always derived; we store base price in order.price
  setOrders(orders);
  renderOrders();
}

function removeOrder(itemId) {

    if (userHasPendingOrder) {
      alert("You already have a pending order. Please claim it before making a new one.");
      return;
    }

  let orders = getOrders();
  orders = orders.filter(o => o.itemId !== itemId);
  setOrders(orders);
  // if user had pending order in DB and they removed all local orders, we don't automatically clear the server lock --
  // but if you want to allow them to order again once local orders are gone, you can set:
  if (orders.length === 0) userHasPendingOrder = false;
  renderOrders();
}

/* --- Delegate clicks --- */
if (orderContainer) {
  orderContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (btn.classList.contains("plus")) {
      const id = parseInt(btn.dataset.id, 10);
      if (!Number.isNaN(id)) updateOrderQuantity(id, +1);
      return;
    }
    if (btn.classList.contains("minus")) {
      const id = parseInt(btn.dataset.id, 10);
      if (!Number.isNaN(id)) updateOrderQuantity(id, -1);
      return;
    }
    if (btn.classList.contains("remove-btn")) {
      const id = parseInt(btn.dataset.id, 10);
      if (!Number.isNaN(id)) removeOrder(id);
      return;
    }
  });
}

/* --- Logged-in logic --- */
if (user) {

  window.order = async function (id) {

    if (!id) return console.warn("Invalid item id");

    // Block if server says user has pending order
    if (userHasPendingOrder) {
      alert("You already have a pending order. Please claim it before making a new one.");
      return;
    }

    try {

      const res = await fetch(`http://localhost:8090/api/items/${id}`);
      if (!res.ok) throw new Error(`Fetch item failed (${res.status})`);
      const item = await res.json();

      if(item.status === "unstocked") {
        alert("That Item is Currently Out of Stock");
        return;
      }

      const itemModify = {
        itemId: item.id,
        name: item.name,
        type: item.type,
        price: item.price, // base price per unit
        imageUrl: item.imgUrl || item.imageUrl,
        quantity: 1
      };

      const orders = getOrders();
      const existing = orders.find(o => o.itemId === itemModify.itemId);
      if (existing) existing.quantity += 1;
      else orders.push(itemModify);

      setOrders(orders);
      renderOrders();

      const $countDiv = $(".nav-order-count");
      if ($countDiv && $countDiv.length) {
        $countDiv.stop(true, true).addClass("pop").delay(200).queue(function (next) {
          $(this).removeClass("pop"); next();
        });
      }

      // optional: POST to backend to create order immediately
      // await fetch("http://localhost:8090/api/orders/add", { method: "POST", credentials:"include", headers:{ "Content-Type":"application/json"}, body: JSON.stringify({ itemId: item.id, quantity: 1 }) });

    } catch (err) {
      console.error("Error adding order:", err);
      alert("Failed to add item.");
    }
  };

  const signUpBtn = document.querySelector("#sign-up-btn");
  const signUpH4 = document.querySelector("#sign-up-btn h4");
  if (signUpH4) signUpH4.textContent = "Log Out";

  window.logout = function () {
    // only remove login and user-specific orders; keep guest or other settings
    const key = ordersKey();
    localStorage.removeItem("loggedUser");
    localStorage.removeItem(key);
    // do not call localStorage.clear() — that wipes everything
    window.location.href = "login.html";
  };

  if (signUpBtn) signUpBtn.addEventListener("click", logout);

  // load orders from server and sync intelligently
  async function loadUserOrders() {
    if (!orderContainer) return;
    try {
      const response = await fetch("http://localhost:8090/api/orders/myOrders", {
        method: "GET", credentials: "include"
      });

      // if server says user not logged in or no orders, do not delete local guest orders.
      if (!response.ok) {
        userHasPendingOrder = false;
        // leave existing local orders intact (they are stored under orders_user_<id> or orders_guest)
        renderOrders();
        return;
      }

      const serverOrders = await response.json();

      if (Array.isArray(serverOrders) && serverOrders.length > 0) {
        // User has server-side orders: block new orders and sync them into local storage for UI
        userHasPendingOrder = true;

        // Map server format into our frontend format (base price preserved)
        const mapped = serverOrders.map(o => ({
          itemId: o.itemId?.id || o.itemId || 0,
          name: o.itemId?.name || "Unknown",
          price: o.cost || o.itemId?.price || 0,
          quantity: o.quantity || 1,
          imageUrl: o.itemId?.imagePath || "public/imgs/items/placeholder.png"
        }));

        // Save to user-specific key (replace only for this user)
        setOrders(mapped);
        renderOrders();
      } else {
        // No server orders — do not delete local guest orders; clear user-specific key so user starts fresh on server
        userHasPendingOrder = false;
        // If you want to preserve any previous local orders for this user, you can skip removing; here we leave existing local orders as-is.
        renderOrders();
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      userHasPendingOrder = false;
      renderOrders();
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await loadTopItems();
    await loadUserOrders();
    renderOrders();
  });

} else {
  // guest UI
  if (sideBarNoAcc) sideBarNoAcc.classList.remove("hidden");
  if (sideBarWithAcc) sideBarWithAcc.classList.add("hidden");
  document.addEventListener("DOMContentLoaded", loadTopItems);
}

/* --- Gallery order handler --- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-order");
  if (!btn) return;
  e.preventDefault();
  const id = parseInt(btn.dataset.id, 10);
  if (!Number.isNaN(id)) {
    if (typeof window.order === "function") window.order(id);
    else console.warn("order() unavailable");
  }
});


document.addEventListener("DOMContentLoaded", () => {
    const profileBtn = document.querySelector('.nav-btn img[src="public/imgs/icons/profile-icon.png"]')
        ?.closest(".nav-btn");

    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

            if (loggedUser && loggedUser.id) {
                // ✅ Go to the logged-in user's profile page
                window.location.href = `profile.html?id=${loggedUser.id}`;
            } else {
                // ⚠️ No logged user found — maybe redirect to login
                alert("Please log in to view your profile.");
                window.location.href = "login.html";
            }
        });
    }
});



