const API = "https://script.google.com/macros/s/AKfycbxKemN08WzZTcSCm_7H6zhVQBDOBUwad2RTzHzgYp0fjt_JJprYXTdbXdD4f4dv4SEL/exec";

let rows = [{ name: "", weight: 0 }];
let orders = [];
let ingredients = [];
let formulas = [];
let activeOrder = null;
let batchSize = 45;

// ================= LOAD =================
async function loadAll() {
  try {
    orders = await (await fetch(API + "?action=getOrders")).json();
    ingredients = await (await fetch(API + "?action=getIngredientsFull")).json();
    formulas = await (await fetch(API + "?action=getFormulas")).json();
  } catch {
    orders = [];
    ingredients = [];
    formulas = [];
  }
  render();
}

// ================= HELPERS =================
function total() {
  return rows.reduce((s, r) => s + (r.weight || 0), 0);
}

function findIFRA(name) {
  const ing = ingredients.find(i => i.Name?.toLowerCase() === name.toLowerCase());
  return ing?.["IFRA limit"] || null;
}

function suggestions(input) {
  if (!input) return [];
  return ingredients.filter(i => i.Name?.toLowerCase().includes(input.toLowerCase())).slice(0,5);
}

// ================= ORDER =================
function loadOrder(o) {
  activeOrder = o;
  fetch(API, {
    method: "POST",
    body: JSON.stringify({ action: "updateOrderStatus", orderId: o.order_id, status: "in_progress" })
  });
  rows = [{ name: "", weight: 0 }];
  render();
}

// ================= FORM =================
function addRow() {
  rows.push({ name: "", weight: 0 });
  render();
}

function updateRow(i, key, val) {
  rows[i][key] = key === "weight" ? parseFloat(val) || 0 : val;
  render();
}

// ================= SAVE =================
function save() {
  if (!confirm("Save formula?")) return;

  const payload = {
    action: "saveFormula",
    client: activeOrder?.customer_name || "",
    scent: activeOrder?.product || "",
    batch: batchSize,
    rows: JSON.stringify(rows),
    order_id: activeOrder?.order_id || ""
  };

  fetch(API, { method: "POST", body: JSON.stringify(payload) });

  alert("Saved ✓");
}

// ================= SCALE =================
function scaleFormula() {
  const target = parseFloat(prompt("Scale to grams (45,90,450,900):"));
  if (!target) return;

  if (!confirm("Scaling creates NEW formula")) return;

  const factor = target / total();

  rows = rows.map(r => ({
    ...r,
    weight: parseFloat((r.weight * factor).toFixed(2))
  }));

  batchSize = target;
  render();
}

// ================= LOAD FORMULA =================
function loadFormula(f) {
  rows = JSON.parse(f.rows);
  batchSize = f.batch;
  render();
}

// ================= UI =================
function render() {
  document.getElementById("app").innerHTML = `
  <style>
  body{margin:0;background:#0f0f0f;color:#e8e4d9;font-family:Georgia}
  .container{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:20px;padding:24px}
  .panel{background:#181818;border:1px solid #2a2a2a;padding:20px;border-radius:12px}
  h3{color:#d4af37}
  input,select{width:100%;padding:8px;background:#111;color:#fff;border:1px solid #333}
  .row{display:grid;grid-template-columns:1fr 80px 60px 120px;gap:6px}
  .suggest{font-size:11px;color:#aaa;cursor:pointer}
  .warn{color:red;font-size:11px}
  .item{padding:10px;border-bottom:1px solid #2a2a2a;cursor:pointer}
  .item:hover{background:#222}
  button{margin-top:6px;padding:8px}
  .primary{background:#d4af37;color:black;border:none}
  </style>

  <div class="container">

    <div class="panel">
      <h3>Formulation</h3>

      <select onchange="batchSize=this.value;render()">
        <option value="45">50ml (45g)</option>
        <option value="90">100ml (90g)</option>
        <option value="450">500ml (450g)</option>
        <option value="900">1000ml (900g)</option>
      </select>

      ${rows.map((r,i)=>{
        const t=total();
        const pct=t?((r.weight/t)*100).toFixed(1):0;
        const limit=findIFRA(r.name);
        const warn=limit&&pct>limit?`⚠ ${limit}% max`:"";

        return `
        <div class="row">
          <div>
            <input value="${r.name}" oninput="updateRow(${i},'name',this.value)">
            ${suggestions(r.name).map(s=>`<div class="suggest" onclick="updateRow(${i},'name','${s.Name}')">${s.Name}</div>`).join("")}
          </div>
          <input type="number" value="${r.weight}" oninput="updateRow(${i},'weight',this.value)">
          <div>${pct}%</div>
          <div class="warn">${warn}</div>
        </div>`
      }).join("")}

      <button onclick="addRow()">+ Add</button>
      <div>${total().toFixed(2)}g / ${batchSize}g</div>

      <button class="primary" onclick="save()">Save</button>
      <button onclick="scaleFormula()">Scale</button>
    </div>

    <div class="panel">
      <h3>Saved Formulas</h3>
      ${formulas.map(f=>`
        <div class="item" onclick='loadFormula(${JSON.stringify(f)})'>
          ${f.scent}<br>${f.client}
        </div>
      `).join("")}
    </div>

    <div class="panel">
      <h3>Orders</h3>
      ${orders.map(o=>`
        <div class="item" onclick='loadOrder(${JSON.stringify(o)})'>
          ${o.product}<br>${o.customer_name}<br>${o.status}
        </div>
      `).join("")}
    </div>

  </div>
  `;
}

loadAll();
