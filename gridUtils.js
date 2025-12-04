import { getPath } from "./mapManager.js";

export function snapToGrid(x, y, size) {
  const col = Math.floor(x / size);
  const row = Math.floor(y / size);
  return {
    x: col * size + size / 2,
    y: row * size + size / 2,
    col,
    row
  };
}

export function isPathCell(col, row) {
  const path = getPath();

  for (let p of path) {
    const pc = Math.floor(p.x / 60);
    const pr = Math.floor(p.y / 60);
    if (pc === col && pr === row) return true;
  }

  return false;
}
