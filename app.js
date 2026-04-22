const API = "https://script.google.com/macros/s/AKfycbxKemN08WzZTcSCm_7H6zhVQBDOBUwad2RTzHzgYp0fjt_JJprYXTdbXdD4f4dv4SEL/exec";

// ── Replace with your Google Cloud OAuth 2.0 Client ID ──────────────────────
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

// ── Fixed prices per batch size (in USD cents). Update to match your pricing ─
const BATCH_PRICES = {
  45:  { label: "50ml",   cents: 3500  },  // $35.00
  90:  { label: "100ml",  cents: 6500  },  // $65.00
  450: { label: "500ml",  cents: 28000 },  // $280.00
  900: { label: "1000ml", cents: 55000 },  // $550.00
};

// ── State ─────────────────────────────────────────────────────────────────────
let currentUser    = null;
let ingredients    = [];
let clientFormulas = [];
let rows           = [{ name: "", weight: 0 }];
let batchSize      = 45;
let activeTab      = "build";
let purchasing     = false;

// ── Auth ──────────────────────────────────────────────────────────────────────
function initAuth() {
  if (typeof google === "undefined") { setTimeout(initAuth, 100); return; }
  google.accounts.id.initialize({
    client_id: 165533929983-72rs2cobedvmu1b03345429p7q1l7slu.apps.googleusercontent.com,
    callback: onSignIn,
    auto_select: true,
  });
  renderLogin();
  google.accounts.id.prompt();
}

function onSignIn(response) {
  const payload = JSON.parse(atob(response.credential.split(".")[1]));
  currentUser = { email: payload.email, name: payload.name, picture: payload.picture };
  loadClientData();
}

function signOut() {
  google.accounts.id.disableAutoSelect();
  currentUser = null;
  rows = [{ name: "", weight: 0 }];
  batchSize = 45;
  activeTab = "build";
  renderLogin();
}

// ── Data ──────────────────────────────────────────────────────────────────────
async function loadClientData() {
  document.getElementById("app").innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading your studio…</p>
    </div>`;
  try {
    [ingredients, clientFormulas] = await Promise.all([
      fetch(API + "?action=getIngredientsFull").then(r => r.json()),
      fetch(API + "?action=getClientFormulas&email=" + encodeURIComponent(currentUser.email)).then(r => r.json()),
    ]);
  } catch {
    ingredients = [];
    clientFormulas = [];
  }
  renderPortal();
}

async function saveFormula() {
  const named = rows.filter(r => r.name.trim());
  if (!named.length) { alert("Add at least one ingredient first."); return; }
  const scent = prompt("Name this formula:");
  if (!scent || !scent.trim()) return;
  try {
    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify({
        action: "saveClientFormula",
        email: currentUser.email,
        clientName: currentUser.name,
        scent: scent.trim(),
        batch: batchSize,
        rows: JSON.stringify(rows),
      }),
    });
    const data = await res.json();
    if (data.success) {
      await loadClientData();
      activeTab = "formulas";
      renderPortal();
    } else {
      alert("Save failed. Please try again.");
    }
  } catch {
    alert("Network error. Please try again.");
  }
}

async function purchaseFormula(idx) {
  if (purchasing) return;
  purchasing = true;
  const btn = document.getElementById("purchase-btn-" + idx);
  if (btn) { btn.disabled = true; btn.textContent = "Creating checkout…"; }

  const formula = clientFormulas[idx];
  try {
    const res = await fetch(API, {
      method: "POST",
      body: JSON.stringify({
        action: "createCheckoutLink",
        email: currentUser.email,
        formulaName: formula.scent,
        batchSize: formula.batch,
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.open(data.url, "_blank");
    } else {
      alert("Could not create checkout. Please contact us.");
    }
  } catch {
    alert("Network error. Please try again.");
  }

  purchasing = false;
  if (btn) { btn.disabled = false; btn.textContent = "Purchase →"; }
}

// ── Formula helpers ───────────────────────────────────────────────────────────
function total() {
  return rows.reduce((s, r) => s + (r.weight || 0), 0);
}

function findIFRA(name) {
  const ing = ingredients.find(i => i.Name?.toLowerCase() === name.toLowerCase());
  return ing?.["IFRA limit"] || null;
}

function addRow() {
  rows.push({ name: "", weight: 0 });
  renderBuildContent();
}

function removeRow(i) {
  rows.splice(i, 1);
  if (!rows.length) rows = [{ name: "", weight: 0 }];
  renderBuildContent();
}

function onNameInput(i, val) {
  rows[i].name = val;
  const sugg = document.getElementById("sugg-" + i);
  if (!sugg) return;
  if (val.length < 2) { sugg.innerHTML = ""; return; }
  const hits = ingredients
    .filter(ing => ing.Name?.toLowerCase().includes(val.toLowerCase()))
    .slice(0, 6);
  sugg.innerHTML = hits.map(s =>
    `<div class="suggestion" onclick="pickIngredient(${i}, ${JSON.stringify(s.Name)})">
       ${s.Name}
       ${s["IFRA limit"] ? `<span class="ifra-badge">IFRA ${s["IFRA limit"]}%</span>` : ""}
     </div>`
  ).join("");
}

function pickIngredient(i, name) {
  rows[i].name = name;
  const input = document.getElementById("name-" + i);
  if (input) input.value = name;
  const sugg = document.getElementById("sugg-" + i);
  if (sugg) sugg.innerHTML = "";
  updateTotalsDisplay();
}

function onWeightInput(i, val) {
  rows[i].weight = parseFloat(val) || 0;
  updateTotalsDisplay();
}

function updateTotalsDisplay() {
  const t = total();
  const totalEl = document.getElementById("total-display");
  if (totalEl) totalEl.textContent = t.toFixed(2) + "g / " + batchSize + "g";
  rows.forEach((r, i) => {
    const pctEl = document.getElementById("pct-" + i);
    if (!pctEl) return;
    const pct = t ? ((r.weight / t) * 100).toFixed(1) : 0;
    const limit = findIFRA(r.name);
    const warn = limit && parseFloat(pct) > parseFloat(limit);
    pctEl.textContent = warn ? pct + "% ⚠ max " + limit + "%" : pct + "%";
    pctEl.className = "pct" + (warn ? " pct-warn" : "");
    const rowEl = pctEl.closest(".row");
    if (rowEl) rowEl.classList.toggle("row-warn", !!warn);
  });
}

function scaleFormula() {
  const t = total();
  if (!t) { alert("Add some weights first."); return; }
  const target = parseFloat(prompt("Scale to grams (45, 90, 450, 900):"));
  if (!target) return;
  const factor = target / t;
  rows = rows.map(r => ({ ...r, weight: parseFloat((r.weight * factor).toFixed(2)) }));
  batchSize = target;
  renderBuildContent();
}

function loadSavedFormula(idx) {
  const f = clientFormulas[idx];
  rows = JSON.parse(f.rows);
  batchSize = f.batch;
  activeTab = "build";
  renderPortal();
}

function onBatchChange(val) {
  batchSize = parseFloat(val);
  updateTotalsDisplay();
  const info = BATCH_PRICES[batchSize];
  const priceEl = document.getElementById("price-display");
  if (priceEl && info) priceEl.textContent = "$" + (info.cents / 100).toFixed(2);
}

// ── Render: Login ─────────────────────────────────────────────────────────────
function renderLogin() {
  document.getElementById("app").innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <div class="brand-mark">✦</div>
        <div class="brand-name">Studio Perfumers</div>
        <p class="login-sub">Sign in to access your personal formula studio</p>
        <div id="google-signin"></div>
      </div>
    </div>`;
  google.accounts.id.renderButton(
    document.getElementById("google-signin"),
    { theme: "outline", size: "large", text: "signin_with", shape: "rectangular", width: 280 }
  );
}

// ── Render: Portal shell ──────────────────────────────────────────────────────
function renderPortal() {
  document.getElementById("app").innerHTML = `
    <div class="portal">
      <header class="header">
        <div class="brand-name">✦ Studio Perfumers</div>
        <nav class="tabs">
          <button class="tab${activeTab === "build" ? " active" : ""}"
            onclick="activeTab='build'; renderPortal()">Build Formula</button>
          <button class="tab${activeTab === "formulas" ? " active" : ""}"
            onclick="activeTab='formulas'; renderPortal()">
            My Formulas${clientFormulas.length ? " (" + clientFormulas.length + ")" : ""}
          </button>
        </nav>
        <div class="user-bar">
          <img src="${currentUser.picture}" class="avatar" referrerpolicy="no-referrer">
          <span class="user-name">${currentUser.name.split(" ")[0]}</span>
          <button class="ghost sm" onclick="signOut()">Sign out</button>
        </div>
      </header>
      <main class="main" id="main-content">
        ${activeTab === "build" ? buildTabHTML() : formulasTabHTML()}
      </main>
    </div>`;
}

// Re-renders only the build tab content without destroying the header
function renderBuildContent() {
  const el = document.getElementById("main-content");
  if (el) el.innerHTML = buildTabHTML();
}

// ── Render: Build tab ─────────────────────────────────────────────────────────
function buildTabHTML() {
  const t = total();
  const priceInfo = BATCH_PRICES[batchSize];

  return `
    <div class="build-layout">

      <div class="panel builder-panel">
        <div class="panel-header">
          <h3>Formula Builder</h3>
          <select class="batch-select" onchange="onBatchChange(this.value)">
            ${Object.entries(BATCH_PRICES).map(([g, info]) =>
              `<option value="${g}"${batchSize == g ? " selected" : ""}>${info.label} (${g}g)</option>`
            ).join("")}
          </select>
        </div>

        <div class="rows-list">
          ${rows.map((r, i) => {
            const pct = t ? ((r.weight / t) * 100).toFixed(1) : 0;
            const limit = findIFRA(r.name);
            const warn = limit && parseFloat(pct) > parseFloat(limit);
            return `
              <div class="row${warn ? " row-warn" : ""}">
                <div class="ing-wrap">
                  <input
                    id="name-${i}"
                    class="ing-input"
                    placeholder="Ingredient…"
                    value="${r.name}"
                    autocomplete="off"
                    oninput="onNameInput(${i}, this.value)"
                  >
                  <div class="suggestions" id="sugg-${i}"></div>
                </div>
                <input
                  id="weight-${i}"
                  class="weight-input"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="g"
                  value="${r.weight || ""}"
                  oninput="onWeightInput(${i}, this.value)"
                >
                <div id="pct-${i}" class="pct${warn ? " pct-warn" : ""}">${pct}%${warn ? " ⚠ max " + limit + "%" : ""}</div>
                <button class="remove-btn" onclick="removeRow(${i})" title="Remove">×</button>
              </div>`;
          }).join("")}
        </div>

        <div class="row-footer">
          <button class="ghost" onclick="addRow()">+ Ingredient</button>
          <span class="total-display" id="total-display">${t.toFixed(2)}g / ${batchSize}g</span>
        </div>

        <div class="price-bar">
          <span class="price-label">Formula price</span>
          <span class="price-amount" id="price-display">${priceInfo ? "$" + (priceInfo.cents / 100).toFixed(2) : ""}</span>
        </div>

        <div class="builder-actions">
          <button class="ghost" onclick="scaleFormula()">Scale batch</button>
          <button class="primary" onclick="saveFormula()">Save Formula</button>
        </div>
      </div>

      <div class="panel library-panel">
        <h3>Ingredient Library</h3>
        <input
          class="search-input"
          placeholder="Search ingredients…"
          oninput="filterLibrary(this.value)"
        >
        <div class="library-list" id="library-list">
          ${libraryItemsHTML(ingredients.slice(0, 50))}
        </div>
      </div>

    </div>`;
}

function libraryItemsHTML(list) {
  if (!list.length) return `<p class="empty-msg">No results</p>`;
  return list.map(ing => `
    <div class="ing-item">
      <span class="ing-name">${ing.Name}</span>
      ${ing["IFRA limit"] ? `<span class="ifra-badge">IFRA ${ing["IFRA limit"]}%</span>` : ""}
    </div>`).join("");
}

function filterLibrary(q) {
  const list = q
    ? ingredients.filter(i => i.Name?.toLowerCase().includes(q.toLowerCase())).slice(0, 60)
    : ingredients.slice(0, 50);
  const el = document.getElementById("library-list");
  if (el) el.innerHTML = libraryItemsHTML(list);
}

// ── Render: My Formulas tab ───────────────────────────────────────────────────
function formulasTabHTML() {
  if (!clientFormulas.length) return `
    <div class="empty-state">
      <div class="empty-icon">✦</div>
      <p>No saved formulas yet.</p>
      <button class="primary" onclick="activeTab='build'; renderPortal()">Build Your First Formula</button>
    </div>`;

  return `
    <div class="formulas-grid">
      ${clientFormulas.map((f, idx) => {
        const parsed = JSON.parse(f.rows).filter(r => r.name);
        const info = BATCH_PRICES[f.batch] || BATCH_PRICES[45];
        return `
          <div class="formula-card">
            <div class="formula-name">${f.scent || "Untitled"}</div>
            <div class="formula-meta">${info.label} · ${parsed.length} ingredient${parsed.length !== 1 ? "s" : ""}</div>
            <div class="formula-ings">${parsed.map(r => r.name).join(" · ")}</div>
            <div class="formula-price">$${(info.cents / 100).toFixed(2)}</div>
            <div class="formula-actions">
              <button class="ghost sm" onclick="loadSavedFormula(${idx})">Edit</button>
              <button class="primary sm" id="purchase-btn-${idx}" onclick="purchaseFormula(${idx})">Purchase →</button>
            </div>
          </div>`;
      }).join("")}
    </div>`;
}

// ── Init ──────────────────────────────────────────────────────────────────────
window.addEventListener("load", initAuth);
