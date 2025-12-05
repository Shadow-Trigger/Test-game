export function createNormalEnemy(path) {
  return {
    type: "normal",
    x: path[0].x,
    y: path[0].y,
    speed: 1.5,
    hp: 50,
    color: "red",
    pathIndex: 0
  };
}

export function updateNormalEnemy(enemy, path) {
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

