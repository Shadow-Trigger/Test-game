// game.js
import { spawnEnemyByWave, updateEnemy } from './enemySpawner.js';
import { snapToGrid, isPathCell } from './gridUtils.js';
import { initMap, getPath, shiftMapLeft } from "./mapManager.js";

import { createCircleTower, updateCircleTower, drawCircleTower } from './Towers/CircleTower.js';
import { createTriangleTower, updateTriangleTower, drawTriangleTower } from './Towers/TriangleTower.js';
import { addKillScore, subtractLeakScore, drawScore } from './highScore.js';

console.log("game.js loaded");

// init map first
initMap();

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
let placingTower = null;
let mouseX = 0, mouseY = 0;
let hoverTower = null;
let money = 200;

let path = getPath(); // initial

const towerCosts = { circle: 100, triangle: 170 };
const enemyReward = 10;

// WAVES
let currentWave = 0, waveIndex = 0, enemiesToSpawn = 0, enemiesAlive = 0;
let waveCountdown = 1, waveCountdownTimer = 0;
let lastTime = Date.now();
let shiftTimer = 0;

// Fibonacci waves
const fib = [1,1];
for (let i = 2; i < 20; i++) fib[i] = fib[i-1] + fib[i-2];

// BUTTONS
document.getElementById("circleTowerBtn").addEventListener("click", ()=> placingTower = "circle");
document.getElementById("triangleTowerBtn").addEventListener("click", ()=> placingTower = "triangle");

// MOUSE
canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
  hoverTower = towers.find(t => Math.hypot(mouseX - t.x, mouseY - t.y) < 12);
});

canvas.addEventListener("click", () => {
  if (!placingTower) return;
  const cost = towerCosts[placingTower];
  if (money < cost) return alert("Not enough money!");
  const snap = snapToGrid(mouseX, mouseY, gridSize);
  const key = `${snap.col},${snap.row}`;
  if (occupiedCells.has(key)) return alert("Cell occupied!");
  if (isPathCell(snap.col, snap.row)) return alert("Can't place on the path!");
  const tower = placingTower === "circle"
    ? createCircleTower(snap.x, snap.y, snap.col, snap.row)
    : createTriangleTower(snap.x, snap.y, snap.col, snap.row);
  towers.push(tower);
  occupiedCells.add(key);
  money -= cost;
  placingTower = null;
});

// DRAW
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Grid lines
  ctx.strokeStyle = "#333"; ctx.lineWidth = 1;
  for (let c=0;c<cols;c++) for (let r=0;r<rows;r++) ctx.strokeRect(c*gridSize,r*gridSize,gridSize,gridSize);

  // Path line
  path = getPath();
  if (path.length > 0) {
    ctx.strokeStyle = "#666"; ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let p of path) ctx.lineTo(p.x, p.y);
    ctx.stroke();

    // Debug: draw red points
    ctx.fillStyle = "red";
    for (let p of path) {
      ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fill();
    }
  }

  // Towers
  towers.forEach(t => {
    if (hoverTower===t) {
      ctx.beginPath(); ctx.arc(t.x,t.y,t.range,0,Math.PI*2);
      ctx.fillStyle="rgba(0,255,255,0.15)"; ctx.fill();
    }
    if (t.type==="circle") drawCircleTower(t,hoverTower,ctx);
    if (t.type==="triangle") drawTriangleTower(t,hoverTower,ctx);
  });

  // Enemies
  enemies.forEach(e => { ctx.fillStyle=e.color; ctx.fillRect(e.x-10,e.y-10,20,20); });

  // Bullets
  bullets.forEach(b => {
    ctx.strokeStyle=`rgba(255,255,0,${b.life/15})`; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(b.x1,b.y1); ctx.lineTo(b.x2,b.y2); ctx.stroke();
  });

  // Placement preview
  if (placingTower) {
    const snap = snapToGrid(mouseX,mouseY,gridSize);
    const r = placingTower==="circle"?120:210;
    ctx.fillStyle="rgba(0,255,255,0.15)"; ctx.beginPath();
    ctx.arc(snap.x,snap.y,r,0,Math.PI*2); ctx.fill();
    ctx.fillStyle="rgba(0,255,255,0.6)";
    if (placingTower==="circle"){ ctx.beginPath(); ctx.arc(snap.x,snap.y,10,0,Math.PI*2); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(snap.x,snap.y-12); ctx.lineTo(snap.x-12,snap.y+12); ctx.lineTo(snap.x+12,snap.y+12); ctx.closePath(); ctx.fill(); }
  }

  // UI
  ctx.fillStyle="white"; ctx.font="20px Arial";
  ctx.fillText(`Money: $${money}`,10,25);
  ctx.fillText(`Wave: ${currentWave}`,10,55);
  ctx.fillStyle="orange"; ctx.fillText(`Enemies alive: ${enemiesAlive}`,10,85);
  drawScore(ctx);
}

// GAME LOOP
function gameLoop() {
  const now = Date.now();
  const deltaTime = now - lastTime;
  lastTime = now;

  // SHIFT LEFT EVERY 20s
  shiftTimer += deltaTime;
  if (shiftTimer >= 20000) {
    shiftMapLeft();

    // Shift towers
    for (let i=towers.length-1;i>=0;i--) {
      const t=towers[i];
      t.x -= gridSize; t.col -=1;
      if (t.col<0){ occupiedCells.delete(`${t.col+1},${t.row}`); towers.splice(i,1); }
    }

    // Shift enemies
    for (let i=enemies.length-1;i>=0;i--) {
      const e=enemies[i];
      e.x -= gridSize;
      if (e.x<-50) enemies.splice(i,1);
    }

    // Shift occupied cells
    const newOcc = new Set();
    occupiedCells.forEach(k=>{ const [col,row]=k.split(",").map(Number); if (col>0) newOcc.add(`${col-1},${row}`); });
    occupiedCells.clear(); newOcc.forEach(k=>occupiedCells.add(k));

    shiftTimer = 0;
  }

  // WAVES
  waveCountdownTimer += deltaTime;
  if (enemiesToSpawn===0 && enemiesAlive===0){
    if (waveCountdown>0){
      if (waveCountdownTimer>=1000){ waveCountdown--; waveCountdownTimer=0; }
    } else {
      enemiesToSpawn = fib[waveIndex] || fib[fib.length-1];
      waveIndex++; currentWave++; waveCountdown=5;
    }
  } else if (enemiesToSpawn>0 && Math.random()<0.02){
    enemiesAlive = spawnEnemyByWave(currentWave,enemies,enemiesAlive,path);
    enemiesToSpawn--;
  }

  // UPDATE
  enemies.forEach(e=>updateEnemy(e,path));
  towers.forEach(t=>{ if(t.type==="circle") updateCircleTower(t,enemies,bullets); if(t.type==="triangle") updateTriangleTower(t,enemies,bullets); });
  bullets = bullets.filter(b=>(--b.life>0));

  // CLEANUP
  enemies = enemies.filter(e=>{
    if(e.hp<=0){ enemiesAlive--; money+=enemyReward; addKillScore(1000); return false; }
    if(e.pathIndex>=path.length-1){ enemiesAlive--; subtractLeakScore(10000); return false; }
    return true;
  });
  enemiesAlive=Math.max(0,enemiesAlive);

  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
