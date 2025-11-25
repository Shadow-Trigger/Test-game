// game.js
import { spawnEnemy, updateEnemy, enemyTypes } from './enemySpawner.js';
import { snapToGrid, isPathCell, drawTowers, updateTower } from './tower.js';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==== GRID SETTINGS ====
const gridSize = 60;
const cols = Math.floor(canvas.width / gridSize);
const rows = Math.floor(canvas.height / gridSize);

// ==== GAME DATA ====
let enemies = [];
let towers = [];
let occupiedCells = new Set();

let placingTower = false;
let mouseX = 0;
let mouseY = 0;
let hoverTower = null;

// Currency
let money = 100;
const towerCost = 20;
const enemyReward = 8;

// Wave system
let currentWave = 1;
let waveIndex = 0;
let enemiesToSpawn = 0;
let enemiesAlive = 0;
let waveCountdown = 5;
let lastTime = Date.now();

// Path through middle
const path = [
  { x:0, y:gridSize*4+gridSize/2 },
  { x:gridSize*5+gridSize/2, y:gridSize*4+gridSize/2 },
  { x:gridSize*5+gridSize/2, y:gridSize*2+gridSize/2 },
  { x:gridSize*10+gridSize/2, y:gridSize*2+gridSize/2 },
  { x:gridSize*10+gridSize/2, y:gridSize*6+gridSize/2 },
  { x:gridSize*14+gridSize/2, y:gridSize*6+gridSize/2 },
];

// Fibonacci sequence for waves
const fib = [1,1];
for(let i=2;i<15;i++) fib[i]=fib[i-1]+fib[i-2];

// Button
document.getElementById("placeTowerBtn").addEventListener("click",()=>{ placingTower=true; });

// Mouse events
canvas.addEventListener("mousemove", e=>{
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;

  hoverTower = null;
  for(let t of towers){
    if(Math.hypot(mouseX-t.x,mouseY-t.y)<10){ hoverTower=t; break; }
  }
});

canvas.addEventListener("click", ()=>{
  if(!placingTower) return;
  if(money < towerCost){ alert("Not enough money!"); return; }

  const {x: snappedX, y: snappedY, col, row} = snapToGrid(mouseX, mouseY, gridSize);
  const key = `${col},${row}`;

  if(occupiedCells.has(key) || isPathCell(col,row,path,gridSize)){
    alert("Cannot place here!"); return;
  }

  towers.push({x:snappedX, y:snappedY, range:120, reload:0, col, row});
  occupiedCells.add(key);
  money -= towerCost;
  placingTower = false;
});

// Draw everything
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Grid
  ctx.strokeStyle="#444";
  for(let c=0;c<cols;c++){
    for(let r=0;r<rows;r++){
      ctx.strokeRect(c*gridSize,r*gridSize,gridSize,gridSize);
    }
  }

  // Path
  ctx.strokeStyle="gray";
  ctx.lineWidth=8;
  ctx.beginPath();
  ctx.moveTo(path[0].x,path[0].y);
  for(let p of path) ctx.lineTo(p.x,p.y);
  ctx.stroke();

  // Towers
  drawTowers(towers, hoverTower, ctx);

  // Enemies
  enemies.forEach(e=>{
    ctx.fillStyle=e.color;
    ctx.fillRect(e.x-10,e.y-10,20,20);
  });

  // Tower preview
  if(placingTower){
    const {x: snappedX, y: snappedY} = snapToGrid(mouseX, mouseY, gridSize);
    ctx.beginPath();
    ctx.arc(snappedX,snappedY,120,0,Math.PI*2);
    ctx.fillStyle="rgba(0,255,255,0.15)";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(snappedX,snappedY,10,0,Math.PI*2);
    ctx.fillStyle="rgba(0,255,255,0.6)";
    ctx.fill();
  }

  // UI
  ctx.fillStyle="white";
  ctx.font="20px Arial";
  ctx.fillText(`Money: $${money}`,10,25);
  ctx.fillText(`Wave: ${currentWave}`,10,55);
  ctx.fillStyle="orange";
  ctx.fillText(`Enemies alive: ${enemiesAlive}`,10,85);
  if(enemiesAlive===0 && enemiesToSpawn===0 && waveCountdown>0){
    ctx.fillStyle="yellow";
    ctx.font="24px Arial";
    ctx.fillText(`Next wave in: ${waveCountdown}`,10,115);
  }
}

// Game loop
function gameLoop(){
  const now = Date.now();

  // Wave logic
  if(enemiesToSpawn===0 && enemiesAlive===0){
    if(waveCountdown>0){
      if(now-lastTime>=1000){ waveCountdown--; lastTime=now; }
    }else{
      enemiesToSpawn = fib[waveIndex] || fib[fib.length-1];
      waveIndex++;
      currentWave++;
      waveCountdown=5;
    }
  }else{
    if(enemiesToSpawn>0 && Math.random()<0.02){
      const type = currentWave > 3 ? "fast" : "normal";
      enemiesAlive = spawnEnemy(type,enemies,enemiesAlive,path);
      enemiesToSpawn--;
    }
  }

  enemies.forEach(e=>updateEnemy(e,path));
  towers.forEach(t=>updateTower(t,enemies));

  // Remove dead/escaped enemies
  enemies = enemies.filter(e=>{
    if(e.hp<=0){ money+=enemyReward; enemiesAlive--; return false; }
    if(e.pathIndex>=path.length-1){ enemiesAlive--; return false; }
    return true;
  });
  enemiesAlive = Math.max(enemiesAlive,0);

  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
