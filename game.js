// game.js
import { spawnEnemyByWave, updateEnemy } from './enemySpawner.js';
import {
  createCircleTower,
  updateCircleTower,
  drawCircleTower
} from './Towers/CircleTower.js';
import { addKillScore, subtractLeakScore, drawScore } from './highScore.js';

// ===== GRID UTILS =====
function snapToGrid(x, y, gridSize) {
  const col = Math.floor(x / gridSize);
  const row = Math.floor(y / gridSize);
  return { x: col*gridSize + gridSize/2, y: row*gridSize + gridSize/2, col, row };
}

function isPathCell(col, row, path, gridSize) {
  for (let i = 0; i < path.length - 1; i++) {
    const startCol = Math.floor(path[i].x / gridSize);
    const startRow = Math.floor(path[i].y / gridSize);
    const endCol = Math.floor(path[i+1].x / gridSize);
    const endRow = Math.floor(path[i+1].y / gridSize);

    if (startCol === endCol) {
      if (col === startCol && row >= Math.min(startRow,endRow) && row <= Math.max(startRow,endRow)) return true;
    } else if (startRow === endRow) {
      if (row === startRow && col >= Math.min(startCol,endCol) && col <= Math.max(startCol,endCol)) return true;
    }
  }
  return false;
}

// ===== SETUP =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 60;
const cols = Math.floor(canvas.width / gridSize);
const rows = Math.floor(canvas.height / gridSize);

// ===== GAME STATE =====
let enemies = [];
let towers = [];
let bullets = [];
let occupiedCells = new Set();

let placingTower = false;
let mouseX = 0;
let mouseY = 0;
let hoverTower = null;

let money = 200;
const towerCost = 100;
const enemyReward = 10;

// ===== WAVES =====
let currentWave = 1;
let waveIndex = 0;
let enemiesToSpawn = 0;
let enemiesAlive = 0;

let waveCountdown = 5;
let lastTime = Date.now();

// ===== PATH =====
const path = [
  { x: 0, y: gridSize * 4 + gridSize / 2 },
  { x: gridSize * 5 + gridSize / 2, y: gridSize * 4 + gridSize / 2 },
  { x: gridSize * 5 + gridSize / 2, y: gridSize * 2 + gridSize / 2 },
  { x: gridSize * 10 + gridSize / 2, y: gridSize * 2 + gridSize / 2 },
  { x: gridSize * 10 + gridSize / 2, y: gridSize * 6 + gridSize / 2 },
  { x: gridSize * 14 + gridSize / 2, y: gridSize * 6 + gridSize / 2 }
];

// ===== FIBONACCI WAVES =====
const fib = [1,1];
for (let i = 2; i < 20; i++) fib[i] = fib[i-1] + fib[i-2];

// ===== BUTTON =====
document.getElementById("circleTowerBtn").addEventListener("click", () => {
  placingTower = true;
});

// ===== MOUSE =====
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  hoverTower = null;
  for (let t of towers) {
    if (Math.hypot(mouseX - t.x, mouseY - t.y) < 10) hoverTower = t;
  }
});

canvas.addEventListener("click", () => {
  if (!placingTower) return;
  if (money < towerCost) { alert("Not enough money!"); return; }

  const snap = snapToGrid(mouseX, mouseY, gridSize);
  const key = `${snap.col},${snap.row}`;

  if (occupiedCells.has(key) || isPathCell(snap.col, snap.row, path, gridSize)) {
    alert("Can't place here!"); return;
  }

  const tower = createCircleTower(snap.x, snap.y, snap.col, snap.row);
  towers.push(tower);
  occupiedCells.add(key);

  money -= towerCost;
  placingTower = false;
});

// ===== DRAW =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // GRID under everything
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1;
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++)
      ctx.strokeRect(c*gridSize, r*gridSize, gridSize, gridSize);

  // PATH
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let p of path) ctx.lineTo(p.x, p.y);
  ctx.stroke();

  // TOWERS
  towers.forEach(t => {
    if (t.type === "circle") drawCircleTower(t, hoverTower, ctx);
  });

  // ENEMIES
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x-10, e.y-10, 20, 20);
  });

  // BULLETS
  bullets.forEach(b => {
    ctx.strokeStyle = `rgba(255,255,0,${b.life/15})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x1,b.y1);
    ctx.lineTo(b.x2,b.y2);
    ctx.stroke();
  });

  // PLACEMENT PREVIEW
  if (placingTower) {
    const snap = snapToGrid(mouseX, mouseY, gridSize);
    ctx.beginPath();
    ctx.arc(snap.x, snap.y, 120,0,Math.PI*2);
    ctx.fillStyle = "rgba(0,255,255,0.15)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(snap.x, snap.y, 10,0,Math.PI*2);
    ctx.fillStyle = "rgba(0,255,255,0.6)";
    ctx.fill();
  }

  // UI
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Money: $${money}`, 10, 25);
  ctx.fillText(`Wave: ${currentWave}`, 10, 55);
  ctx.fillStyle = "orange";
  ctx.fillText(`Enemies alive: ${enemiesAlive}`, 10, 85);

  drawScore(ctx);
}

// ===== GAME LOOP =====
function gameLoop() {
  const now = Date.now();

  // WAVE SPAWN
  if (enemiesToSpawn === 0 && enemiesAlive === 0) {
    if (waveCountdown > 0) {
      if (now - lastTime >= 1000) { waveCountdown--; lastTime=now; }
    } else {
      enemiesToSpawn = fib[waveIndex] || fib[fib.length-1];
      waveIndex++;
      currentWave++;
      waveCountdown = 5;
    }
  } else if (enemiesToSpawn > 0 && Math.random() < 0.02) {
    enemiesAlive = spawnEnemyByWave(currentWave, enemies, enemiesAlive, path);
    enemiesToSpawn--;
  }

  // UPDATE ENEMIES
  enemies.forEach(e => updateEnemy(e, path));

  // UPDATE TOWERS
  towers.forEach(t => {
    if (t.type === "circle") updateCircleTower(t, enemies, bullets);
  });

  // UPDATE BULLETS
  bullets = bullets.filter(b => { b.life--; return b.life>0; });

  // CLEANUP ENEMIES
  enemies = enemies.filter(e => {
    if (e.hp <= 0) { money += enemyReward; enemiesAlive--; addKillScore(1000); return false; }
    if (e.pathIndex >= path.length-1) { enemiesAlive--; subtractLeakScore(10000); return false; }
    return true;
  });

  enemiesAlive = Math.max(enemiesAlive,0);

  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
