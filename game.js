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
const towerCost = 25;
const enemyReward = 3;

// ==== ENEMY SPAWN COUNTDOWN ====
let spawnCountdown = 5; // seconds
let lastTime = Date.now();

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

  // SPAWN COUNTDOWN DISPLAY
  if (spawnCountdown > 0) {
    ctx.fillStyle = "yellow";
    ctx.font = "24px Arial";
    ctx.fillText(`Enemies start in: ${spawnCountdown}`, 10, 55);
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
    // Hover range circle
    if (hoverTower === t) {
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.range, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 255, 255, 0.15)";
      ctx.fill();
    }

    // Tower body
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
  // Countdown before enemies spawn
  if (spawnCountdown > 0) {
    const now = Date.now();
    if (now - lastTime >= 1000) {
      spawnCountdown--;
      lastTime = now;
    }
  } else {
    if (Math.random() < 0.02) spawnEnemy();
  }

  enemies.forEach(updateEnemy);
  towers.forEach(updateTower);

  // Remove dead/escaped enemies + reward money
  enemies = enemies.filter((e) => {
    if (e.hp <= 0) {
      money += enemyReward;
      return false;
    }
    return e.pathIndex < path.length - 1;
  });

  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
