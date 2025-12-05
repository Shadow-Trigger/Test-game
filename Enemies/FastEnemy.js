export function createFastEnemy(path) {
  return {
    type: "fast",
    x: path[0].x,
    y: path[0].y,
    speed: 3.5,
    hp: 30,
    color: "purple",
    pathIndex: 0
  };
}

export function updateFastEnemy(enemy, path) {
  const target = path[enemy.pathIndex + 1];
  if (!target) return;

  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const dist = Math.hypot(dx, dy);

  if (dist < enemy.speed) enemy.pathIndex++;
  else {
    enemy.x += (dx / dist) * enemy.speed;
    enemy.y += (dy / dist) * enemy.speed;
  }
}

