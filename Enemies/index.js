import { createNormalEnemy, updateNormalEnemy } from "./NormalEnemy.js";
import { createFastEnemy, updateFastEnemy } from "./FastEnemy.js";

export const enemyTypes = {
  normal: {
    create: createNormalEnemy,
    update: updateNormalEnemy
  },
  fast: {
    create: createFastEnemy,
    update: updateFastEnemy
  }
};

