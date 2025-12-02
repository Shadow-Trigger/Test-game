// Enemies/SlowEnemy.js
export function createSlowEnemy(path) {
  return {
    type: "slow",
    x: path[0].x,
    y: path[0].y,
    pathIndex: 0,
    speed: 1,          // slower than normal
    hp: 75,
    color: "blue"
  };
}

export function updateSlowEnemy(enemy, path) {
  if (enemy.pathIndex >= path.length - 1) return;

  const target = path[enemy.pathIndex + 1];
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
