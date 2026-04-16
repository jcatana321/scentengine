const API = "PASTE_YOUR_GOOGLE_SCRIPT_URL_HERE";

let rows = [{name:"",weight:0}];
let orders = [];
let session = [];
let activeOrder = null;

function grams(ml){ return ml*0.9 }

async function loadOrders(){
 try{
  const res = await fetch(API+"?action=getOrders");
  orders = await res.json();
 }catch{}
 render();
}

function updateStatus(id,status){
 fetch(API+"?action=updateOrderStatus",{method:"POST",body:JSON.stringify({orderId:id,status})});
 orders = orders.map(o=>o.order_id===id?{...o,status}:o);
 render();
}

function loadOrder(o){
 activeOrder=o;
 updateStatus(o.order_id,"in_progress");
 rows=[{name:"",weight:0}];
 render();
}

function addRow(){
 rows.push({name:"",weight:0});
 render();
}

function updateRow(i,key,val){
 rows[i][key]=val;
 render();
}

function save(){
 const entry={
  client:activeOrder?.customer_name||"",
  scent:activeOrder?.product||"",
  rows
 };
 session.unshift(entry);
 alert(activeOrder?"Saved + Linked ✓":"Saved ✓");
 render();
}

function complete(){
 if(!activeOrder)return;
 updateStatus(activeOrder.order_id,"completed");
 activeOrder=null;
 alert("Completed ✓");
 render();
}

function total(){
 return rows.reduce((s,r)=>s+(parseFloat(r.weight)||0),0);
}

function render(){
 document.getElementById("app").innerHTML=`
 <div class="container">

  <div class="panel">
   <h3>New Formula Entry</h3>

   ${activeOrder?`<div>Working on: ${activeOrder.product}
   <button onclick="complete()">Complete</button></div>`:""}

   ${rows.map((r,i)=>{
    const t=total();
    const pct=t?((r.weight/t)*100).toFixed(1):0;
    return `<div class="row">
     <input value="${r.name}" oninput="updateRow(${i},'name',this.value)">
     <input type="number" value="${r.weight}" oninput="updateRow(${i},'weight',this.value)">
     <div>${pct}%</div>
     <button onclick="rows.splice(${i},1);render()">x</button>
    </div>`
   }).join("")}

   <button onclick="addRow()">+ Add Ingredient</button>

   <div style="margin-top:10px">
    Total: ${total().toFixed(2)}g
   </div>

   <button class="primary" onclick="save()">Save</button>
  </div>

  <div class="panel">
   <h3>Session</h3>
   ${session.map(s=>`
    <div class="item">
     @${s.client}<br>
     "${s.scent}"
    </div>
   `).join("")}
  </div>

  <div class="panel">
   <h3>Orders</h3>
   ${orders.map(o=>`
    <div class="item" onclick='loadOrder(${JSON.stringify(o)})'>
     ${o.product}
     <span class="status ${o.status}">${o.status}</span><br>
     ${o.customer_name}
    </div>
   `).join("")}
  </div>

 </div>`;
}

loadOrders();
