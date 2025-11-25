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
let placingTower = false;   // true when player clicked Place Tower
let mouseX = 0;             // mouse position for preview
let mouseY = 0;
let hoverTower = null;      // tower player is hovering over

// Button to start placement
document.getElementById("placeTowerBtn").addEventListener("click", () => {
  placingTower = true;
});

// Track mouse for preview + hover
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

// Click to place ONLY if placingTower is true
canvas.addEventListener("click", () => {
  if (!placingTower) return;

  towers.push({
    x: mouseX,
    y: mouseY,
    range: 120,
    reload: 0,
  });

  placingTower = false; // exit placement mode
});

// ==== ENEMY SPAWNING ====
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

  // PATH
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let p of path) ctx.lineTo(p.x, p.y);
  ctx.stroke();

  // ==== DRAW TOWERS + HOVER RANGE ====
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

  // ==== DRAW ENEMIES ====
  enemies.forEach((e) => {
    ctx.fillStyle = "red";
    ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
  });

  // ==== TOWER PLACEMENT PREVIEW ====
  if (placingTower) {
    // Range preview
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 120, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 255, 255, 0.15)";
    ctx.fill();

    // Tower preview body
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 255, 255, 0.6)";
    ctx.fill();
  }
}

// ==== MAIN GAME LOOP ====
function gameLoop() {
  if (Math.random() < 0.02) spawnEnemy();

  enemies.forEach(updateEnemy);
  towers.forEach(updateTower);

  // Remove dead/escaped enemies
  enemies = enemies.filter(
    (e) => e.hp > 0 && e.pathIndex < path.length - 1
  );

  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
