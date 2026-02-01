let balance = 1000;
let selectedBet = "";
let history = [];
let decisionTimes = [];
let lastTime = Date.now();

let balanceChart, timeChart;

/* NAV */
function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  if (id === "play") document.querySelectorAll(".nav-btn")[0].classList.add("active");
  if (id === "dashboard") {
    document.querySelectorAll(".nav-btn")[1].classList.add("active");
    renderDashboard();
  }
}

/* BET SELECT */
function selectBet(bet) {
  selectedBet = bet;
  document.querySelectorAll(".bet").forEach(b => b.classList.remove("active"));
  document.getElementById(bet).classList.add("active");
}

/* GAME */
function rollDice() {
  const bet = parseInt(document.getElementById("betAmount").value);
  if (!bet || bet <= 0 || bet > balance || !selectedBet) {
    alert("Invalid bet");
    return;
  }

  const now = Date.now();
  const decisionTime = ((now - lastTime) / 1000).toFixed(2);
  lastTime = now;
  decisionTimes.push(parseFloat(decisionTime));
  document.getElementById("decisionTime").innerText = decisionTime;

  const d1 = rand(1,6);
  const d2 = rand(1,6);
  const total = d1 + d2;

  const win =
    (selectedBet === "low" && total <= 6) ||
    (selectedBet === "seven" && total === 7) ||
    (selectedBet === "high" && total >= 8);

  if (win) {
    balance += bet;
    document.getElementById("result").innerText = `🎉 YOU WON ₹${bet * 2}`;
  } else {
    balance -= bet;
    document.getElementById("result").innerText = `❌ YOU LOST ₹${bet}`;
  }

  history.push({ amount: bet, win, balance, time: parseFloat(decisionTime) });

  document.getElementById("balance").innerText = balance;
  document.getElementById("dice").innerText = `🎲 ${d1} + 🎲 ${d2} = ${total}`;
}

/* DASHBOARD */
function renderDashboard() {
  if (history.length === 0) return;

  const wins = history.filter(h => h.win);
  const losses = history.filter(h => !h.win);

  document.getElementById("kpiBets").innerText = history.length;
  document.getElementById("kpiWon").innerText = "₹" + sum(wins.map(h => h.amount));
  document.getElementById("kpiLost").innerText = "₹" + sum(losses.map(h => h.amount));
  document.getElementById("kpiNet").innerText =
    "₹" + (sum(wins.map(h => h.amount)) - sum(losses.map(h => h.amount)));
  document.getElementById("kpiTime").innerText = avg(decisionTimes).toFixed(2) + "s";

  const type = classifyPlayer();
  document.getElementById("kpiType").innerText = type;
  document.getElementById("insightsText").innerText = type;

  drawCharts();
}

/* PLAYER TYPE */
function classifyPlayer() {
  const avgTime = avg(decisionTimes);
  const avgBet = avg(history.map(h => h.amount));
  const winRate = history.filter(h => h.win).length / history.length;

  if (avgTime < 2 && avgBet > 200) return "Impulsive Risk-Taker";
  if (avgTime > 5 && avgBet < 150) return "Value-Conscious Player";
  if (winRate < 0.4 && avgBet > 200) return "Loss-Chasing Behavior";
  return "Balanced Decision Maker";
}

/* CHARTS */
function drawCharts() {
  const ctx1 = document.getElementById("balanceChart");
  const ctx2 = document.getElementById("timeChart");

  balanceChart?.destroy();
  timeChart?.destroy();

  balanceChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels: history.map((_, i) => i + 1),
      datasets: [{ label: "Balance", data: history.map(h => h.balance), borderColor: "#3ea6ff" }]
    }
  });

  timeChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: decisionTimes.map((_, i) => i + 1),
      datasets: [{ label: "Decision Time (sec)", data: decisionTimes, borderColor: "#f1c40f" }]
    }
  });
}

/* UTILS */
function rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
function sum(a){ return a.reduce((x,y)=>x+y,0); }
function avg(a){ return a.reduce((x,y)=>x+y,0)/a.length; }
