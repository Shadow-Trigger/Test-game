// circleTower.js

export function createCircleTower(x, y, col, row) {
  return {
    type: "circle",
    x,
    y,
    col,
    row,
    range: 120,
    reloadTime: 30,
    reload: 0
  };
}

export function updateCircleTower(tower, enemies, bullets) {
  if (tower.reload > 0) {
    tower.reload--;
    return;
  }

  // Find target inside range
  let target = null;
  for (let e of enemies) {
    if (Math.hypot(e.x - tower.x, e.y - tower.y) <= tower.range) {
      target = e;
      break;
    }
  }
  if (!target) return;

  // Shoot
  tower.reload = tower.reloadTime;
  target.hp -= 10;

  // Bullet trail
  bullets.push({
    x1: tower.x,
    y1: tower.y,
    x2: target.x,
    y2: target.y,
    life: 15,
    color: "yellow"
  });
}

export function drawCircleTower(tower, hover, ctx) {
  ctx.save();

  ctx.fillStyle = hover === tower ? "cyan" : "lightblue";
  ctx.beginPath();
  ctx.arc(tower.x, tower.y, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
