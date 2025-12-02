// Enemies/SlowEnemy.js

export function createSlowEnemy(path) {
  return {
    x: path[0].x,
    y: path[0].y,
    speed: 0.6,       // slower than normal
    maxHp: 40,
    hp: 40,
    color: "lightblue",
    pathIndex: 0,
    type: "slow"      // optional, helps with tower targeting if needed
  };
}

// Optional: if you want a draw function for debugging or preview
export function drawSlowEnemy(ctx, enemy) {
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x - 10, enemy.y - 10, 20, 20);
}

// Optional: update logic if different from normal enemies
export function updateSlowEnemy(enemy, path) {
  const target = path[enemy.pathIndex + 1];
  if (!target) return;

  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const dist = Math.hypot(dx, dy);

  if (dist < enemy.speed) {
    enemy.x = target.x;
    enemy.y = target.y;
    enemy.pathIndex++;
  } else {
    enemy.x += (dx / dist) * enemy.speed;
    enemy.y += (dy / dist) * enemy.speed;
  }
}
