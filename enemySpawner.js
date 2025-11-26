// enemySpawner.js

// Enemy types
export const enemyTypes = {
  normal: { hp: 50, speed: 1.75, color: "red" },
  fast: { hp: 30, speed: 5, color: "purple" }
};

// Spawn enemy and increment enemiesAlive
export function spawnEnemyByWave(currentWave, enemies, enemiesAlive, path) {
  let type;
  if (currentWave <= 5) type = "normal";        // RED only
  else if (currentWave === 6) type = "fast";    // PURPLE only
  else type = Math.random() < 0.65 ? "normal" : "fast"; // MIX from wave 7+

  const eType = enemyTypes[type];
  enemies.push({
    x: path[0].x,
    y: path[0].y,
    speed: eType.speed,
    pathIndex: 0,
    hp: eType.hp,
    color: eType.color
  });

  return enemiesAlive + 1; // return updated count
}

// Update enemy position
export function updateEnemy(enemy, path) {
  const target = path[enemy.pathIndex + 1];
  if (!target) return;

  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const dist = Math.hypot(dx, dy);

  if (dist < enemy.speed) enemy.pathIndex++;
  else { enemy.x += (dx / dist) * enemy.speed; enemy.y += (dy / dist) * enemy.speed; }
}
