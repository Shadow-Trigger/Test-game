const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let enemies = [];
let towers = [];

const path = [
  {x: 0, y: 250},
  {x: 200, y: 250},
  {x: 200, y: 100},
  {x: 600, y: 100},
  {x: 600, y: 400},
  {x: 800, y: 400},
];

function spawnEnemy() {
  enemies.push({
    x: path[0].x,
    y: path[0].y,
    speed: 1,
    pathIndex: 0,
    hp: 50
  });
}

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  towers.push({
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
    range: 120,
    reload: 0
  });
});

function updateEnemy(enemy) {
  const target = path[enemy.pathIndex + 1];
  if (!target) return;

  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const dist = Math.hypot(dx, dy);

  if (dist < enemy.speed) {
    enemy.pathIndex++;
  } else {
    enemy.x += enemy.speed * dx / dist;
    enemy.y += enemy.speed * dy / dist;
  }
}

function updateTower(tower) {
  tower.reload--;

  let target = null;
  let targetDist = Infinity;

  enemies.forEach(e => {
    const d = Math.hypot(e.x - tower.x, e.y - tower.y);
    if (d < tower.range && d < targetDist) {
      target = e;
      targetDist = d;
    }
  });

  if (target && tower.reload <= 0) {
    target.hp -= 10;
    tower.reload = 30;
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // path
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let p of path) ctx.lineTo(p.x, p.y);
  ctx.stroke();

// towers + range indicators
towers.forEach(t => {
  // Range circle
  ctx.beginPath();
  ctx.arc(t.x, t.y, t.range, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 255, 255, 0.15)"; // light transparent cyan
  ctx.fill();

  // Tower body
  ctx.beginPath();
  ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
  ctx.fillStyle = "cyan";
  ctx.fill();
});

  // enemies
  enemies.forEach(e => {
    ctx.fillStyle = "red";
    ctx.fillRect(e.x - 10, e.y - 10, 20, 20);
  });
}

function gameLoop() {
  if (Math.random() < 0.02) spawnEnemy();

  enemies.forEach(updateEnemy);
  towers.forEach(updateTower);

  enemies = enemies.filter(e => e.hp > 0 && e.pathIndex < path.length - 1);

  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
