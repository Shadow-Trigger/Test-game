// Snap mouse to grid
export function snapToGrid(x, y, gridSize) {
  const col = Math.floor(x / gridSize);
  const row = Math.floor(y / gridSize);
  return { x: col*gridSize + gridSize/2, y: row*gridSize + gridSize/2, col, row };
}

// Check if a cell is part of the path
export function isPathCell(col, row, path, gridSize) {
  for (let i = 0; i < path.length - 1; i++) {
    const startCol = Math.floor(path[i].x / gridSize);
    const startRow = Math.floor(path[i].y / gridSize);
    const endCol = Math.floor(path[i+1].x / gridSize);
    const endRow = Math.floor(path[i+1].y / gridSize);

    if (startCol === endCol) {
      if (col === startCol && row >= Math.min(startRow,endRow) && row <= Math.max(startRow,endRow)) return true;
    } else if (startRow === endRow) {
      if (row === startRow && col >= Math.min(startCol,endCol) && col <= Math.max(startCol,endCol)) return true;
    }
  }
  return false;
}
