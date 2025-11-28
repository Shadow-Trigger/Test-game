import { enemyTypes } from "./Enemies/index.js";

export function spawnEnemyByWave(currentWave, enemies, enemiesAlive, path) {
  let type;

  if (currentWave <= 5) type = "normal";
  else if (currentWave === 6) type = "fast";
  else type = Math.random() < 0.65 ? "normal" : "fast";

  // CREATE USING TYPE
  const newEnemy = enemyTypes[type].create(path);

  enemies.push(newEnemy);
  return enemiesAlive + 1;
}

export function updateEnemy(enemy, path) {
  const updater = enemyTypes[enemy.type].update;
  updater(enemy, path);
}
