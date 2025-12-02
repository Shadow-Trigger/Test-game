import { createNormalEnemy, updateNormalEnemy } from "./NormalEnemy.js";
import { createFastEnemy, updateFastEnemy } from "./FastEnemy.js";
import { createSlowEnemy, updateSlowEnemy } from "./SlowEnemy.js";  // new

export const enemyTypes = {
  normal: {
    create: createNormalEnemy,
    update: updateNormalEnemy
  },
  fast: {
    create: createFastEnemy,
    update: updateFastEnemy
  },
  slow: {                                         // new entry
    create: createSlowEnemy,
    update: updateSlowEnemy
  }
};
