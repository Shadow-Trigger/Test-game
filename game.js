// game.js
import { spawnEnemyByWave, updateEnemy } from './enemySpawner.js';
import { snapToGrid, isPathCell } from './gridUtils.js';
import { updateMap, getPath } from "./mapManager.js";

import {
  createCircleTower,
  updateCircleTower,
  drawCircleTower
} from './Towers/CircleTower.js';

import {
  createTriangleTower,
  updateTriangleTower,
  drawTriangleTower
} from './Towers/TriangleTower.js';

import { addKillScore, subtractLeakScore, drawScore } from './highScore.js';

import { initMap, getPath, shiftMapLeft } from "./mapManager.js";
initMap();  // <-- this must run once before the loop

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
let placingTower = null;  // "circle" or "triangle"
let mouseX = 0;
let mouseY = 0;
let hoverTower = null;
let money = 200;

let path = []; // dynamic path from mapManager

const towerCosts = {
  circle: 100,
  triangle: 170
};
const enemyReward = 10;

// WAVES
let currentWave = 0;
let waveIndex = 0;
let enemiesToSpawn = 0;
let enemiesAlive = 0;
let waveCountdown = 1;
let waveCountdownTimer = 0;
let lastTime = Date.now();

// FIBONACCI WAVES
const fib = [1, 1];
for (let i = 2; i < 20; i++) fib[i] = fib[i - 1] + fib[i - 2];

// BUTTONS
document.getElementById("circleTowerBtn").addEventListener("click", () => {
  placingTower = "circle";
});
document.getElementById("triangleTowerBtn").addEventListener("click", () => {
  placingTower = "triangle";
});

// MOUSE MOVE
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  hoverTower = towers.find(
    t => Math.hypot(mouseX - t.x, mouseY - t.y) < 12
  );
});

// PLACE TOWER
canvas.addEventListener("click", () => {
  if (!placingTower) return;

  const cost = towerCosts[placingTower];
  if (money < cost) return alert("Not enough money!");

  const snap = snapToGrid(mouseX, mouseY, gridSize);
  const key = `${snap.col},${snap.row}`;

  if (occupiedCells.has(key)) return alert("Cell occupied!");
  if (isPathCell(snap.col, snap.row, path, gridSize)) return alert("Can't place on the path!");

  let tower;
  if (placingTower === "circle") {
    tower = createCircleTower(snap.x, snap.y, snap.col, snap.row);
  } else if (placingTower === "triangle") {
    tower = createTriangleTower(snap.x, snap.y, snap.col, snap.row);
  }

  towers.push(tower);
  occupiedCells.add(key);

  money -= cost;
  placingTower = null;
});

// DRAW FRAME
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // GRID
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      ctx.strokeRect(c * gridSize, r * gridSize, gridSize, gridSize);
    }
  }

  // PATH
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 10;
  if (path.length > 0) {
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let p of path) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  // TOWERS
  towers.forEach(t => {
    if (hoverTower === t) {
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.range, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,255,255,0.15)";
      ctx.fill();
    }
    if (t.type === "circle") drawCircleTower(t, hoverTower, ctx);
    if (t.type === "triangle") drawTriangleTower(t, hoverTower, ctx);
  });

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

    // RANGE
    const previewRange =
        placingTower === "circle" ? 120 :
        placingTower === "triangle" ? 210 : 100;
    ctx.fillStyle = "rgba(0,255,255,0.15)";
    ctx.beginPath();
    ctx.arc(snap.x, snap.y, previewRange, 0, Math.PI * 2);
    ctx.fill();

    // CENTER SHAPE
    ctx.fillStyle = "rgba(0,255,255,0.6)";
    if (placingTower === "circle") {
      ctx.beginPath();
      ctx.arc(snap.x, snap.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    if (placingTower === "triangle") {
      ctx.beginPath();
      ctx.moveTo(snap.x, snap.y - 12);
      ctx.lineTo(snap.x - 12, snap.y + 12);
      ctx.lineTo(snap.x + 12, snap.y + 12);
      ctx.closePath();
      ctx.fill();
    }
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
  const deltaTime = now - lastTime;
  lastTime = now;

 updateMap(deltaTime);
shiftTimer += deltaTime;
if (shiftTimer >= 20000) {
    shiftMapLeft(towers, enemies, occupiedCells);
    shiftTimer = 0;
}

  // --- WAVES ---
  waveCountdownTimer += deltaTime;

  if (enemiesToSpawn === 0 && enemiesAlive === 0) {
    if (waveCountdown > 0) {
      if (waveCountdownTimer >= 1000) {
        waveCountdown--;
        waveCountdownTimer = 0;
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

  // --- UPDATE ENEMIES ---
  enemies.forEach(e => updateEnemy(e, path));

  // --- UPDATE TOWERS ---
  towers.forEach(t => {
    if (t.type === "circle") updateCircleTower(t, enemies, bullets);
    if (t.type === "triangle") updateTriangleTower(t, enemies, bullets);
  });

  bullets = bullets.filter(b => (--b.life > 0));

  // --- CLEANUP ---
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
