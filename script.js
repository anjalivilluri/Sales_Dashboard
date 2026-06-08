let monthlyChart;
let regionChart;
let allRows = [];

// ==========================
// CSV Upload
// ==========================

document
.getElementById("csvFile")
.addEventListener("change", handleFile);

function handleFile(event){

const file = event.target.files[0];

if(!file) return;

const reader = new FileReader();

reader.onload = function(e){

const text = e.target.result;

processCSV(text);

};

reader.readAsText(file);

}

// ==========================
// Process CSV
// ==========================

function processCSV(csv){

const rows = csv.trim().split("\n");

rows.shift();

allRows = rows;

let totalSales = 0;

let customers = new Set();

let monthlyData = {};

let regionData = {};

rows.forEach(row=>{

const cols = row.split(",");

const month = cols[0]?.trim();

const customer = cols[1]?.trim();

const region = cols[2]?.trim();

const amount = parseFloat(cols[3]);

if(isNaN(amount)) return;

totalSales += amount;

customers.add(customer);

monthlyData[month] =
(monthlyData[month] || 0) + amount;

regionData[region] =
(regionData[region] || 0) + amount;

});

const totalOrders = rows.length;

const avgSale =
(totalSales / totalOrders).toFixed(2);

// KPI Cards

document.getElementById("totalSales")
.innerText =
"₹" + totalSales.toLocaleString();

document.getElementById("avgSales")
.innerText =
"₹" + avgSale;

animateValue(
"totalOrders",
0,
totalOrders,
1000
);

animateValue(
"totalCustomers",
0,
customers.size,
1000
);

// Charts

drawMonthlyChart(monthlyData);

drawRegionChart(regionData);

// Table

displayTable(rows);

}

// ==========================
// Animated Counter
// ==========================

function animateValue(
id,
start,
end,
duration
){

const obj =
document.getElementById(id);

let startTimestamp = null;

function step(timestamp){

if(!startTimestamp)
startTimestamp = timestamp;

const progress =
Math.min(
(timestamp-startTimestamp)
/ duration,
1
);

obj.innerText =
Math.floor(
progress*(end-start)
+ start
);

if(progress < 1){
window.requestAnimationFrame(step);
}

}

window.requestAnimationFrame(step);

}

// ==========================
// Monthly Chart
// ==========================

function drawMonthlyChart(data){

if(monthlyChart){
monthlyChart.destroy();
}

monthlyChart =
new Chart(
document.getElementById("monthlyChart"),
{
type:"line",

data:{
labels:Object.keys(data),

datasets:[{

label:"Monthly Sales",

data:Object.values(data),

fill:true,

borderWidth:3,

tension:0.4

}]
},

options:{
responsive:true
}

}
);

}

// ==========================
// Region Chart
// ==========================

function drawRegionChart(data){

if(regionChart){
regionChart.destroy();
}

regionChart =
new Chart(
document.getElementById("regionChart"),
{
type:"doughnut",

data:{

labels:Object.keys(data),

datasets:[{

data:Object.values(data)

}]

},

options:{
responsive:true
}

}
);

}

// ==========================
// Table
// ==========================

function displayTable(rows){

const tableBody =
document.getElementById("tableBody");

tableBody.innerHTML = "";

rows.forEach(row=>{

const cols = row.split(",");

tableBody.innerHTML += `

<tr>
<td>${cols[0]}</td>
<td>${cols[1]}</td>
<td>${cols[2]}</td>
<td>₹${cols[3]}</td>
</tr>

`;

});

}

// ==========================
// Search
// ==========================

document
.getElementById("searchBox")
.addEventListener("keyup",searchData);

function searchData(){

const value =
document
.getElementById("searchBox")
.value
.toLowerCase();

const filtered =
allRows.filter(row=>

row
.toLowerCase()
.includes(value)

);

displayTable(filtered);

}

// ==========================
// Theme Toggle
// ==========================

const themeBtn =
document.getElementById("themeBtn");

themeBtn.addEventListener("click",()=>{

document.body.classList.toggle(
"light-theme"
);

if(
document.body.classList.contains(
"light-theme"
)
){
themeBtn.innerText =
"🌙 Dark Mode";
}
else{
themeBtn.innerText =
"☀ Light Mode";
}

});

// ==========================
// PDF Export
// ==========================

document
.getElementById("pdfBtn")
.addEventListener("click",()=>{

const { jsPDF } =
window.jspdf;

const doc =
new jsPDF();

doc.setFontSize(18);

doc.text(
"Sales Dashboard Report",
20,
20
);

doc.setFontSize(12);

doc.text(
"Total Sales : " +
document.getElementById("totalSales")
.innerText,
20,
40
);

doc.text(
"Orders : " +
document.getElementById("totalOrders")
.innerText,
20,
50
);

doc.text(
"Customers : " +
document.getElementById("totalCustomers")
.innerText,
20,
60
);

doc.text(
"Average Sale : " +
document.getElementById("avgSales")
.innerText,
20,
70
);

doc.save(
"Sales_Report.pdf"
);

});