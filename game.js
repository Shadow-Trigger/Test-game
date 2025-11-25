const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==== GAME DATA ====
let enemies = [];
let towers = [];

const path = [
  { x: 0, y: 250 },
  { x: 200, y: 250 },
  { x: 200, y: 100 },
  { x: 600, y: 100 },
  { x: 600, y: 400 },
  { x: 800, y: 400 },
];

// ==== TOWER PLACEMENT SYSTEM ====
let placingTower = false;
let mouseX = 0;
let mouseY = 0;
let hoverTower = null;

// ==== CURRENCY SYSTEM ====
let money = 50;
const towerCost = 30;
const enemyReward = 3;

// ==== WAVE SYSTEM ====
let currentWave = 0;
let waveIndex = 0;       // index in Fibonacci sequence
let enemiesToSpawn = 0;  // enemies left to spawn in current wave
let enemiesAlive = 0;    // enemies currently alive on canvas
let waveCountdown = 5;   // 5-second countdown between waves
let lastTime = Date.now();

// Precompute Fibonacci sequence for waves
const fib = [1, 1];
for (let i = 2; i < 15; i++) {
  fib[i] = fib[i - 1] + fib[i - 2];
}

// ==== BUTTON HANDLER ====
document.getElementById("placeTowerBtn").addEventListener("click", () => {
  placingTower = true;
});

// ==== MOUSE EVENTS ====
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  hoverTower = null;
  for (let t of towers) {
    if (Math.hypot(mouseX - t.x, mouseY - t.y) < 10) {
      hoverTower = t;
      break;
    }
  }
});

canvas.addEventListener("click", () => {
  if (!placingTower) return;
  if (money < towerCost) {
    alert("Not enough money!");
    return;
  }

  towers.push({
    x: mouseX,
    y: mouseY,
    range: 120,
    reload: 0,
  });

  money -= towerCost;
  placingTower = false;
});

// ==== ENEMY FUNCTIONS ====
function spawnEnemy() {
  enemies.push({
    x: path[0].x,
    y: path[0].y,
    speed: 1,
    pathIndex: 0,
    hp: 50,
  });
  enemiesAlive++; // increment only when enemy is actually spawned
}

function updateEnemy(enemy) {
  const target = path[enemy.pathIndex + 1];
  if (!target) return;

  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const dist = Math.hypot(dx, dy);

  if (dist < enemy.speed) {
    enemy.pathIndex++;
  } else {
    enemy.x += (enemy.speed * dx) / dist;
    enemy.y += (enemy.speed * dy) / dist;
  }
}

// ==== TOWER LOGIC ====
function updateTower(tower) {
  tower.reload--;

  let target = null;
  let bestDist = Infinity;

  for (let e of enemies) {
    const d = Math.hypot(e.x - tower.x, e.y - tower.y);
    if (d < tower.range && d < bestDist) {
      bestDist = d;
      target = e;
    }
  }

  if (target && tower.reload <= 0) {
    target.hp -= 10;
    tower.reload = 30;
  }
}

// ==== DRAW EVERYTHING ====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // MONEY DISPLAY
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Money: $${money}`, 10, 25);

  // CURRENT WAVE & ENEMIES ALIVE
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Wave: ${currentWave}`, 10, 55);
  ctx.fillStyle = "orange";
  ctx.fillText(`Enemies alive: ${enemiesAlive}`, 10, 85);

  // WAVE COUNTDOWN DISPLAY (only when no enemies left)
  if (enemiesAlive === 0 && enemiesToSpawn === 0 && waveCountdown > 0) {
    ctx.fillStyle = "yellow";
    ctx.font = "24px Arial";
    ctx.fillText(`Next wave in: ${waveCountdown}`, 10, 115);
  }

  // PATH
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let p of path) ctx.lineTo(p.x, p.y);
  ctx.stroke();

  // TOWERS + HOVER RANGE
  towers.forEach((t) => {
    if (hoverTower === t) {
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.range, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 255, 255, 0.15)";
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "cyan";
    ctx.fill();
  });

  // ENEMIES
  enemies.forEach((e) => {
    ctx.fillStyle = "red";
    ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
  });

  // PLACEMENT PREVIEW
  if (placingTower) {
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 120, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 255, 255, 0.15)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 255, 255, 0.6)";
    ctx.fill();
  }
}

// ==== GAME LOOP ====
function gameLoop() {
  const now = Date.now();

  // WAVE LOGIC
  if (enemiesToSpawn === 0 && enemiesAlive === 0) {
    if (waveCountdown > 0) {
      if (now - lastTime >= 1000) {
        waveCountdown--;
        lastTime = now;
      }
    } else {
      // Start next wave
      enemiesToSpawn = fib[waveIndex] || fib[fib.length - 1];
      waveIndex++;
      currentWave++;
      waveCountdown = 5; // reset countdown for next wave
    }
  } else {
    // Spawn enemies gradually
    if (enemiesToSpawn > 0 && Math.random() < 0.02) {
      spawnEnemy();
      enemiesToSpawn--;
    }
  }

  enemies.forEach(updateEnemy);
  towers.forEach(updateTower);

  // Remove dead or escaped enemies
  enemies = enemies.filter((e) => {
    if (e.hp <= 0) {
      money += enemyReward;
      enemiesAlive--;
      return false;
    }
    if (e.pathIndex >= path.length - 1) {
      enemiesAlive--;
      return false;
    }
    return true;
  });

  // Ensure counter never goes below 0
  enemiesAlive = Math.max(enemiesAlive, 0);

  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
