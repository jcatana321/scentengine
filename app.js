const API = "PASTE_YOUR_GOOGLE_SCRIPT_URL_HERE";

let orders = [];
let activeOrder = null;

async function fetchOrders() {
  try {
    const res = await fetch(API + "?action=getOrders");
    orders = await res.json();
    render();
  } catch {
    orders = [];
    render();
  }
}

function updateOrderStatus(id, status) {
  fetch(API + "?action=updateOrderStatus", {
    method: "POST",
    body: JSON.stringify({ orderId: id, status })
  });

  orders = orders.map(o =>
    o.order_id === id ? { ...o, status } : o
  );

  render();
}

function loadOrder(order) {
  activeOrder = order;
  updateOrderStatus(order.order_id, "in_progress");
  render();
}

function save() {
  if (activeOrder) {
    updateOrderStatus(activeOrder.order_id, "in_progress");
    alert("Saved + Linked ✓");
  } else {
    alert("Saved ✓");
  }
}

function complete() {
  if (!activeOrder) return;
  updateOrderStatus(activeOrder.order_id, "completed");
  activeOrder = null;
  alert("Completed ✓");
}

function render() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="grid">
      <div class="panel">
        <h3>New Formula Entry</h3>
        ${activeOrder ? `
          <div>
            Working on: ${activeOrder.product}
            <button onclick="complete()">Complete</button>
          </div>
        ` : ""}
        <button class="primary" onclick="save()">Save</button>
      </div>

      <div class="panel">
        <h3>Orders</h3>
        ${orders.map(o => `
          <div onclick='loadOrder(${JSON.stringify(o)})'>
            ${o.product}
            <span class="status ${o.status}">
              ${o.status}
            </span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

fetchOrders();
