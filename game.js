const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ==== GRID SETTINGS ====
const gridSize = 60; // big squares
const cols = Math.floor(canvas.width / gridSize);
const rows = Math.floor(canvas.height / gridSize);

// ==== GAME DATA ====
let enemies = [];
let towers = [];
let occupiedCells = new Set(); // to prevent stacking towers

// ==== PATH THROUGH GRID MIDDLE ====
const path = [
  { x: 0, y: gridSize*4 + gridSize/2 },
  { x: gridSize*5 + gridSize/2, y: gridSize*4 + gridSize/2 },
  { x: gridSize*5 + gridSize/2, y: gridSize*2 + gridSize/2 },
  { x: gridSize*10 + gridSize/2, y: gridSize*2 + gridSize/2 },
  { x: gridSize*10 + gridSize/2, y: gridSize*6 + gridSize/2 },
  { x: gridSize*14 + gridSize/2, y: gridSize*6 + gridSize/2 },
];

// ==== TOWER SYSTEM ====
let placingTower = false;
let mouseX = 0;
let mouseY = 0;
let hoverTower = null;

// ==== CURRENCY SYSTEM ====
let money = 50;
const towerCost = 25;
const enemyReward = 2;

// ==== WAVE SYSTEM ====
let currentWave = 1;
let waveIndex = 0;       // Fibonacci index
let enemiesToSpawn = 0;
let enemiesAlive = 0;
let waveCountdown = 5;
let lastTime = Date.now();

// Fibonacci sequence for waves
const fib = [1, 1];
for (let i=2;i<15;i++) fib[i] = fib[i-1]+fib[i-2];

// ==== BUTTON HANDLER ====
document.getElementById("placeTowerBtn").addEventListener("click", () => {
  placingTower = true;
});

// ==== MOUSE EVENTS ====
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

// Snap mouse to grid
function snapToGrid(x,y){
  const col = Math.floor(x/gridSize);
  const row = Math.floor(y/gridSize);
  return { x: col*gridSize + gridSize/2, y: row*gridSize + gridSize/2, col, row };
}

// Check if a grid cell is part of the path
function isPathCell(col,row){
  for(let i=0;i<path.length-1;i++){
    const startCol = Math.floor(path[i].x/gridSize);
    const startRow = Math.floor(path[i].y/gridSize);
    const endCol = Math.floor(path[i+1].x/gridSize);
    const endRow = Math.floor(path[i+1].y/gridSize);

    if(startCol===endCol){
      if(col===startCol && row>=Math.min(startRow,endRow) && row<=Math.max(startRow,endRow)) return true;
    }else if(startRow===endRow){
      if(row===startRow && col>=Math.min(startCol,endCol) && col<=Math.max(startCol,endCol)) return true;
    }
  }
  return false;
}

// Place tower on click
canvas.addEventListener("click", ()=>{
  if(!placingTower) return;
  if(money < towerCost){ alert("Not enough money!"); return; }

  const {x: snappedX, y: snappedY, col, row} = snapToGrid(mouseX, mouseY);
  const key = `${col},${row}`;

  if(occupiedCells.has(key) || isPathCell(col,row)){
    alert("Cannot place here!");
    return;
  }

  towers.push({x: snappedX, y: snappedY, range:120, reload:0, col, row});
  occupiedCells.add(key);
  money -= towerCost;
  placingTower = false;
});

// ==== ENEMY FUNCTIONS ====
function spawnEnemy(){
  enemies.push({x:path[0].x, y:path[0].y, speed:1, pathIndex:0, hp:50});
  enemiesAlive++;
}

function updateEnemy(enemy){
  const target = path[enemy.pathIndex+1];
  if(!target) return;
  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const dist = Math.hypot(dx,dy);
  if(dist < enemy.speed) enemy.pathIndex++;
  else { enemy.x += dx/dist*enemy.speed; enemy.y += dy/dist*enemy.speed; }
}

// ==== TOWER LOGIC ====
function updateTower(tower){
  tower.reload--;
  let target=null, bestDist=Infinity;
  for(let e of enemies){
    const d = Math.hypot(e.x-tower.x,e.y-tower.y);
    if(d<tower.range && d<bestDist){ bestDist=d; target=e; }
  }
  if(target && tower.reload<=0){ target.hp -= 10; tower.reload=30; }
}

// ==== DRAW GRID, PATH, TOWERS, ENEMIES ====
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // draw grid
  ctx.strokeStyle="#444";
  for(let c=0;c<cols;c++){
    for(let r=0;r<rows;r++){
      ctx.strokeRect(c*gridSize,r*gridSize,gridSize,gridSize);
    }
  }

  // draw path
  ctx.strokeStyle="gray";
  ctx.lineWidth=8;
  ctx.beginPath();
  ctx.moveTo(path[0].x,path[0].y);
  for(let p of path) ctx.lineTo(p.x,p.y);
  ctx.stroke();

  // towers
  towers.forEach(t=>{
    if(hoverTower===t){
      ctx.beginPath();
      ctx.arc(t.x,t.y,t.range,0,Math.PI*2);
      ctx.fillStyle="rgba(0,255,255,0.15)";
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(t.x,t.y,10,0,Math.PI*2);
    ctx.fillStyle="cyan";
    ctx.fill();
  });

  // enemies
  enemies.forEach(e=>{
    ctx.fillStyle="red";
    ctx.fillRect(e.x-10,e.y-10,20,20);
  });

  // tower preview
  if(placingTower){
    const {x: snappedX, y: snappedY} = snapToGrid(mouseX,mouseY);
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

// ==== GAME LOOP ====
function gameLoop(){
  const now = Date.now();

  // WAVE LOGIC
  if(enemiesToSpawn===0 && enemiesAlive===0){
    if(waveCountdown>0){
      if(now-lastTime>=1000){ waveCountdown--; lastTime=now; }
    }else{
      enemiesToSpawn = fib[waveIndex] || fib[fib.length-1];
      waveIndex++;
      currentWave++;
      waveCountdown = 5;
    }
  }else{
    if(enemiesToSpawn>0 && Math.random()<0.02){
      spawnEnemy();
      enemiesToSpawn--;
    }
  }

  enemies.forEach(updateEnemy);
  towers.forEach(updateTower);

  // remove dead or escaped enemies
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
