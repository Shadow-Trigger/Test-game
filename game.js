// game.js
import { spawnEnemyByWave, updateEnemy } from './enemySpawner.js';
import { snapToGrid, isPathCell } from './tower.js';

import {
  createCircleTower,
  updateCircleTower,
  drawCircleTower
} from './Towers/CircleTower.js';

import { addKillScore, subtractLeakScore, drawScore } from './highScore.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==== GRID SETTINGS ====
const gridSize = 60;
const cols = Math.floor(canvas.width / gridSize);
const rows = Math.floor(canvas.height / gridSize);

// ==== GAME STATE ====
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

// ==== WAVES ====
let currentWave = 1;
let waveIndex = 0;
let enemiesToSpawn = 0;
let enemiesAlive = 0;

let waveCountdown = 5;
let lastTime = Date.now();

// ==== PATH ====
const path = [
  { x: 0, y: gridSize * 4 + gridSize / 2 },
  { x: gridSize * 5 + gridSize / 2, y: gridSize * 4 + gridSize / 2 },
  { x: gridSize * 5 + gridSize / 2, y: gridSize * 2 + gridSize / 2 },
  { x: gridSize * 10 + gridSize / 2, y: gridSize * 2 + gridSize / 2 },
  { x: gridSize * 10 + gridSize / 2, y: gridSize * 6 + gridSize / 2 },
  { x: gridSize * 14 + gridSize / 2, y: gridSize * 6 + gridSize / 2 }
];

// ==== FIBONACCI WAVES ====
const fib = [1, 1];
for (let i = 2; i < 20; i++) {
  fib[i] = fib[i - 1] + fib[i - 2];
}

// ==== TOWER BUTTON ====
document.getElementById("circleTowerBtn").addEventListener("click", () => {
  placingTower = true;
});

// ==== MOUSE ====
canvas.addEventListener("mousemove", e => {
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

  const snap = snapToGrid(mouseX, mouseY, gridSize);
  const key = `${snap.col},${snap.row}`;

  // invalid placement
  if (occupiedCells.has(key) || isPathCell(snap.col, snap.row, path, gridSize)) {
    alert("Can't place here!");
    return;
  }

  // create and add tower
  const tower = createCircleTower(snap.x, snap.y, snap.col, snap.row);
  towers.push(tower);
  occupiedCells.add(key);

  money -= towerCost;
  placingTower = false;
});

// ==== DRAW ====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // GRID (draw first, underneath everything)
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 1;
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
  towers.forEach(t => {
    if (t.type === "circle") {
      drawCircleTower(t, hoverTower, ctx);
    }
  });

  // ENEMIES
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
  });

  // BULLET TRAILS
  bullets.forEach(b => {
    ctx.strokeStyle = `rgba(255,255,0,${b.life / 15})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();
  });

  // PLACEMENT PREVIEW
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
  ctx.fillStyle =
