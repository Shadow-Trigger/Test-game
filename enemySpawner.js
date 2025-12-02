import { enemyTypes } from "./Enemies/index.js";

export function spawnEnemyByWave(currentWave, enemies, enemiesAlive, path) {
  let type;

  if (currentWave <= 5) type = "normal";
  else if (currentWave === 6 || currentWave === 7) type = "fast";
  else if (currentWave >= 8) {
    // After wave 8, mix normal, fast, and slow
    const rand = Math.random();
    if (rand < 0.5) type = "normal";
    else if (rand < 0.8) type = "fast";
    else type = "slow";
  }

  // CREATE USING TYPE
  const newEnemy = enemyTypes[type].create(path);

  enemies.push(newEnemy);
  return enemiesAlive + 1;
}

export function updateEnemy(enemy, path) {
  const updater = enemyTypes[enemy.type].update;
  updater(enemy, path);
}
