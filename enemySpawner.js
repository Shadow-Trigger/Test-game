// enemySpawner.js

// Enemy types
export const enemyTypes = {
  normal: { hp: 50, speed: 1, color: "red" },
  fast: { hp: 60, speed: 2, color: "purple" } // spawns after wave 3
};

// Spawn enemy and increment enemiesAlive
export function spawnEnemy(type = "normal", enemies, enemiesAlive, path) {
  const eType = enemyTypes[type];
  enemies.push({
    x: path[0].x,
    y: path[0].y,
    speed: eType.speed,
    pathIndex: 0,
    hp: eType.hp,
    color: eType.color
  });
  return enemiesAlive + 1; // return new count
}

// Update enemy position
export function updateEnemy(enemy, path) {
  const target = path[enemy.pathIndex + 1];
  if (!target) return;

  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const dist = Math.hypot(dx, dy);

  if (dist < enemy.speed) enemy.pathIndex++;
  else { enemy.x += (dx/dist) * enemy.speed; enemy.y += (dy/dist) * enemy.speed; }
}
