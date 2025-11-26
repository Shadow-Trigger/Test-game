// game.js
import { spawnEnemy, updateEnemy } from './enemySpawner.js';
import { snapToGrid, isPathCell, drawTowers, updateTower } from './tower.js';
import { addKillScore, subtractLeakScore, drawScore } from './highScore.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==== GRID SETTINGS ====
const gridSize = 60;
const cols = Math.floor(canvas.width / gridSize);
const rows = Math.floor(canvas.height / gridSize);

// ==== GAME DATA ====
let enemies = [];
let towers = [];
let bullets = [];  // <<---- BULLET TRAILS

let occupiedCells = new Set();

let placingTower = false;
let mouseX = 0;
let mouseY = 0;
let hoverTower = null;

// Currency
let money = 200;
const towerCost = 100;
const enemyReward = 10;

// Wave system
let currentWave = 1;
let waveIndex = 0;
let enemiesToSpawn = 0;
let enemiesAlive = 0;
let waveCountdown = 5;
let lastTime = Date.now();

// ==== PATH THROUGH GRID ====
const path = [
  { x: 0, y: gridSize * 4 + gridSize / 2 },

  { x: gridSize * 5 + gridSize / 2, y: gridSize * 4 + gridSize / 2 },
  { x: gridSize * 5 + gridSize / 2, y: gridSize * 2 + gridSize / 2 },

  { x: gridSize * 10 + gridSize / 2, y: gridSize * 2 + gridSize / 2 },
  { x: gridSize * 10 + gridSize / 2, y: gridSize * 6 + gridSize / 2 },

  { x: gridSize * 14 + gridSize / 2, y: gridSize * 6 + gridSize / 2 }
];

// ==== FIBONACCI WAVE PATTERN ====
const fib = [1, 1];
for (let i = 2; i < 20; i++) {
  fib[i] = fib[i - 1] + fib[i - 2];
}

// ==== BUTTON HANDLER ====
document.getElementById("circleTowerBtn").addEventListener("click", () => {
  placingTower = true;
});

// ==== MOUSE EVENTS ====
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  // tower hover detection
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

  const snap = snapToGrid(mouseX, mouseY, gridSize);
  const key = `${snap.col},${snap.row}`;

  if (occupiedCells.has(key) || isPathCell(snap.col, snap.row, path, gridSize)) {
    alert("Can't place here!");
    return;
  }

  towers.push({
    x: snap.x,
    y: snap.y,
    range: 120,
    reload: 0,
    col: snap.col,
    row: snap.row
  });

  money -= towerCost;
  occupiedCells.add(key);
  placingTower = false;
});

// ==== DRAW EVERYTHING ====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // GRID
  ctx.strokeStyle = "#444";
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      ctx.strokeRect(c * gridSize, r * gridSize, gridSize, gridSize);
    }
  }

  // PATH
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let p of path) ctx.lineTo(p.x, p.y);
  ctx.stroke();

  // TOWERS
  drawTowers(towers, hoverTower, ctx);

  // ENEMIES
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
  });

  // ==== BULLET TRAILS ====
  bullets.forEach(b => {
    ctx.strokeStyle = `rgba(255,255,0,${b.life / 8})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();
  });

  // TOWER PLACEMENT PREVIEW
  if (placingTower) {
    const snap = snapToGrid(mouseX, mouseY, gridSize);

    ctx.beginPath();
    ctx.arc(snap.x, snap.y, 120, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,255,255,0.15)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(snap.x, snap.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,255,255,0.6)";
    ctx.fill();
  }

  // UI TEXT
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Money: $${money}`, 10, 25);
  ctx.fillText(`Wave: ${currentWave}`, 10, 55);

  ctx.fillStyle = "orange";
  ctx.fillText(`Enemies alive: ${enemiesAlive}`, 10, 85);

  // SCORE
  drawScore(ctx);
}

// ==== GAME LOOP ====
function gameLoop() {
  const now = Date.now();

  // ==== WAVE CONTROL ====
  if (enemiesToSpawn === 0 && enemiesAlive === 0) {
    if (waveCountdown > 0) {
      if (now - lastTime >= 1000) {
        waveCountdown--;
        lastTime = now;
      }
    } else {
      enemiesToSpawn = fib[waveIndex] || fib[fib.length - 1];
      waveIndex++;
      currentWave++;
      waveCountdown = 5;
    }

  } else {
    if (enemiesToSpawn > 0 && Math.random() < 0.02) {
      const type = currentWave > 3 ? "fast" : "normal";  
      enemiesAlive = spawnEnemy(type, enemies, enemiesAlive, path);
      enemiesToSpawn--;
    }
  }

  // UPDATE ENEMIES
  enemies.forEach(e => updateEnemy(e, path));

  // UPDATE TOWERS + SPAWN BULLETS
  towers.forEach(t => {
    const shotTarget = updateTower(t, enemies);

    if (shotTarget) {
      bullets.push({
        x1: t.x,
        y1: t.y,
        x2: shotTarget.x,
        y2: shotTarget.y,
        life: 8
      });
    }
  });

  // UPDATE BULLETS
  bullets = bullets.filter(b => {
    b.life--;
    return b.life > 0;
  });

  // CLEANUP ENEMIES
  enemies = enemies.filter(e => {
    if (e.hp <= 0) {
      money += enemyReward;
      enemiesAlive--;
      addKillScore(1000);
      return false;
    }
    if (e.pathIndex >= path.length - 1) {
      enemiesAlive--;
      subtractLeakScore(10000);
      return false;
    }
    return true;
  });

  enemiesAlive = Math.max(enemiesAlive, 0);

  // DRAW EVERYTHING
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
