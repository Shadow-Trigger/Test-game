// game.js
import { spawnEnemyByWave, updateEnemy } from './enemySpawner.js';
import { snapToGrid, isPathCell } from './gridUtils.js';

import {
  createCircleTower,
  updateCircleTower,
  drawCircleTower
} from './Towers/CircleTower.js';

import { addKillScore, subtractLeakScore, drawScore } from './highScore.js';

console.log("game.js loaded");

// CANVAS
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// GRID
const gridSize = 60;
const cols = canvas.width / gridSize;
const rows = canvas.height / gridSize;

// STATE
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

// WAVES
let currentWave = 0;
let waveIndex = 0;
let enemiesToSpawn = 0;
let enemiesAlive = 0;

let waveCountdown = 5;
let lastTime = Date.now();

// PATH
const path = [
  { x: 0, y: 4 * gridSize + gridSize / 2 },
  { x: 5 * gridSize + gridSize / 2, y: 4 * gridSize + gridSize / 2 },
  { x: 5 * gridSize + gridSize / 2, y: 2 * gridSize + gridSize / 2 },
  { x: 10 * gridSize + gridSize / 2, y: 2 * gridSize + gridSize / 2 },
  { x: 10 * gridSize + gridSize / 2, y: 6 * gridSize + gridSize / 2 },
  { x: 14 * gridSize + gridSize / 2, y: 6 * gridSize + gridSize / 2 }
];

// FIBONACCI WAVES
const fib = [1, 1];
for (let i = 2; i < 20; i++) fib[i] = fib[i - 1] + fib[i - 2];

// BUTTON
document.getElementById("circleTowerBtn").addEventListener("click", () => {
  placingTower = true;
});

// MOUSE MOVE
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  hoverTower = towers.find(
    t => Math.hypot(mouseX - t.x, mouseY - t.y) < 10
  );
});

// PLACE TOWER
canvas.addEventListener("click", () => {
  if (!placingTower) return;
  if (money < towerCost) return alert("Not enough money!");

  const snap = snapToGrid(mouseX, mouseY, gridSize);
  const key = `${snap.col},${snap.row}`;

  if (occupiedCells.has(key)) return alert("Cell occupied!");
  if (isPathCell(snap.col, snap.row, path, gridSize)) return alert("Can't place on the path!");

  const tower = createCircleTower(snap.x, snap.y, snap.col, snap.row);
  towers.push(tower);
  occupiedCells.add(key);

  money -= towerCost;
  placingTower = false;
});

// DRAW FRAME
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // GRID UNDER EVERYTHING
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      ctx.strokeRect(c * gridSize, r * gridSize, gridSize, gridSize);
    }
  }

  // PATH
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let p of path) ctx.lineTo(p.x, p.y);
  ctx.stroke();

  // TOWERS
  towers.forEach(t => drawCircleTower(t, hoverTower, ctx));

  // ENEMIES
  enemies.forEach(e => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
  });

  // BULLETS
  bullets.forEach(b => {
    ctx.strokeStyle = `rgba(255,255,0,${b.life / 15})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
    ctx.stroke();
  });

  // TOWER PLACEMENT PREVIEW
  if (placingTower) {
    const snap = snapToGrid(mouseX, mouseY, gridSize);

    ctx.fillStyle = "rgba(0,255,255,0.15)";
    ctx.beginPath();
    ctx.arc(snap.x, snap.y, 120, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,255,255,0.6)";
    ctx.beginPath();
    ctx.arc(snap.x, snap.y, 10, 0, Math.PI * 2);
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

// MAIN LOOP
function gameLoop() {
  const now = Date.now();

  // WAVES
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
  } else if (enemiesToSpawn > 0 && Math.random() < 0.02) {
    enemiesAlive = spawnEnemyByWave(currentWave, enemies, enemiesAlive, path);
    enemiesToSpawn--;
  }

  // UPDATE
  enemies.forEach(e => updateEnemy(e, path));
  towers.forEach(t => updateCircleTower(t, enemies, bullets));

  bullets = bullets.filter(b => (--b.life > 0));

  // CLEANUP ENEMIES
  enemies = enemies.filter(e => {
    if (e.hp <= 0) {
      enemiesAlive--;
      money += enemyReward;
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

  enemiesAlive = Math.max(0, enemiesAlive);

  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
