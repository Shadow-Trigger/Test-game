// TriangleTower.js

export function createTriangleTower(x, y, col, row) {
  return {
    type: "triangle",
    x,
    y,
    col,
    row,
    range: 500,
    reloadTime: 120,
    reload: 0
  };
}

export function updateTriangleTower(tower, enemies, bullets) {
  if (tower.reload > 0) {
    tower.reload--;
    return;
  }

  // Find target
  let target = null;
  for (let e of enemies) {
    if (Math.hypot(e.x - tower.x, e.y - tower.y) <= tower.range) {
      target = e;
      break;
    }
  }
  if (!target) return;

  tower.reload = tower.reloadTime;
  target.hp -= 25; // stronger than circle tower

  bullets.push({
    x1: tower.x,
    y1: tower.y,
    x2: target.x,
    y2: target.y,
    life: 20,
    color: "cyan"
  });
}

export function drawTriangleTower(tower, hover, ctx) {
  ctx.save();

  ctx.fillStyle = hover === tower ? "yellow" : "lime";

  ctx.beginPath();
  ctx.moveTo(tower.x, tower.y - 12);
  ctx.lineTo(tower.x - 12, tower.y + 12);
  ctx.lineTo(tower.x + 12, tower.y + 12);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
