let balance = 1000;
let selectedBet = "";
let history = [];
let decisionTimes = [];
let lastTime = Date.now();

let charts = {};

function showView(id) {
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.querySelectorAll(".sidebar button").forEach(b=>b.classList.remove("active"));
  if(id==="play") document.querySelectorAll(".sidebar button")[0].classList.add("active");
  if(id==="dashboard") {
    document.querySelectorAll(".sidebar button")[1].classList.add("active");
    renderDashboard();
  }
}

function selectBet(b) {
  selectedBet = b;
  document.querySelectorAll(".bets div").forEach(x=>x.classList.remove("active"));
  document.getElementById(b).classList.add("active");
}

function rollDice() {
  const bet = parseInt(document.getElementById("betAmount").value);
  if(!bet || bet>balance || !selectedBet) return alert("Invalid bet");

  const now = Date.now();
  const decision = ((now-lastTime)/1000).toFixed(2);
  lastTime = now;
  decisionTimes.push(parseFloat(decision));
  document.getElementById("decisionTime").innerText = decision;

  const d1 = rand(1,6), d2 = rand(1,6);
  const total = d1+d2;

  const win =
    (selectedBet==="low" && total<=6) ||
    (selectedBet==="seven" && total===7) ||
    (selectedBet==="high" && total>=8);

  if(win){
    balance+=bet;
    document.getElementById("result").innerText=`🎉 YOU WON ₹${bet*2}`;
  } else {
    balance-=bet;
    document.getElementById("result").innerText=`❌ YOU LOST ₹${bet}`;
  }

  history.push({bet:selectedBet, amount:bet, win, balance, time:parseFloat(decision)});
  document.getElementById("balance").innerText=balance;
  document.getElementById("dice").innerText=`🎲 ${d1} + 🎲 ${d2} = ${total}`;
}

function renderDashboard() {
  if(history.length===0) return;

  const wins = history.filter(h=>h.win);
  const losses = history.filter(h=>!h.win);

  set("kpiBets", history.length);
  set("kpiWon", "₹"+sum(wins.map(h=>h.amount)));
  set("kpiLost", "₹"+sum(losses.map(h=>h.amount)));
  set("kpiNet", "₹"+(sum(wins.map(h=>h.amount))-sum(losses.map(h=>h.amount))));
  set("kpiAvgBet", "₹"+Math.round(avg(history.map(h=>h.amount))));
  set("kpiTime", avg(decisionTimes).toFixed(2)+"s");

  drawCharts();
  drawHeatmap();
  generateInsights();
}

function drawCharts() {
  destroyCharts();

  charts.balance = new Chart(balanceChart,{
    type:"line",
    data:{labels:history.map((_,i)=>i+1),
      datasets:[{data:history.map(h=>h.balance),borderColor:"#3ea6ff"}]},
    options:{plugins:{legend:{display:false}}}
  });

  const counts = {low:0,seven:0,high:0};
  history.forEach(h=>counts[h.bet]++);

  charts.bar = new Chart(betBar,{
    type:"bar",
    data:{labels:["2–6","7","8–12"],
      datasets:[{data:Object.values(counts),backgroundColor:"#3ea6ff"}]},
    options:{plugins:{legend:{display:false}}}
  });

  charts.pie = new Chart(betPie,{
    type:"doughnut",
    data:{labels:["2–6","7","8–12"],
      datasets:[{data:Object.values(counts),
        backgroundColor:["#3498db","#2ecc71","#e74c3c"]}]}
  });

  charts.time = new Chart(timeChart,{
    type:"line",
    data:{labels:decisionTimes.map((_,i)=>i+1),
      datasets:[{data:decisionTimes,borderColor:"#f1c40f"}]},
    options:{plugins:{legend:{display:false}}}
  });
}

function drawHeatmap() {
  const ctx = heatmap.getContext("2d");
  ctx.clearRect(0,0,600,200);

  history.forEach(h=>{
    const x = h.amount/500*600;
    const y = h.time/10*200;
    ctx.fillStyle = h.win ? "rgba(46,204,113,0.6)" : "rgba(231,76,60,0.6)";
    ctx.fillRect(x,y,8,8);
  });
}

function generateInsights() {
  const avgTime = avg(decisionTimes);
  const avgBet = avg(history.map(h=>h.amount));
  const winRate = history.filter(h=>h.win).length/history.length;

  let text="";
  if(avgTime<2 && avgBet>200) text="Impulsive risk-taker: fast decisions with high exposure.";
  else if(avgTime>5 && avgBet<150) text="Value-conscious player: slow and calculated decisions.";
  else if(winRate<0.4 && avgBet>200) text="Loss-chasing behavior detected.";
  else text="Balanced decision-making profile.";

  set("insights",text);
}

function destroyCharts(){
  Object.values(charts).forEach(c=>c.destroy());
  charts={};
}

function rand(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function sum(a){return a.reduce((x,y)=>x+y,0);}
function avg(a){return a.reduce((x,y)=>x+y,0)/a.length;}
function set(id,v){document.getElementById(id).innerText=v;}
