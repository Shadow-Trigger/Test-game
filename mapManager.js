// mapManager.js
const gridSize = 60;
const rows = 8;
const cols = 15;

let pathPoints = [];

// -------- INIT MAP --------
export function initMap() {
  pathPoints = [
    { x: gridSize/2,            y: 4*gridSize + gridSize/2 },
    { x: 5*gridSize + gridSize/2, y: 4*gridSize + gridSize/2 },
    { x: 5*gridSize + gridSize/2, y: 2*gridSize + gridSize/2 },
    { x:10*gridSize + gridSize/2, y: 2*gridSize + gridSize/2 },
    { x:10*gridSize + gridSize/2, y: 6*gridSize + gridSize/2 },
    { x:14*gridSize + gridSize/2, y: 6*gridSize + gridSize/2 }
  ];
}

// -------- GET PATH --------
export function getPath() {
  return pathPoints;
}

// -------- SHIFT MAP --------
export function shiftMapLeft() {
  const newPath = [];

  // shift all path points left
  for (let p of pathPoints) {
    const nx = p.x - gridSize;
    if (nx >= -gridSize) {
      newPath.push({ x: nx, y: p.y });
    }
  }

  // add a new point on the right
  const last = newPath[newPath.length - 1];
  const lastRow = Math.floor(last.y / gridSize);

  let newRow = lastRow + (Math.floor(Math.random() * 3) - 1);
  newRow = Math.max(0, Math.min(rows - 1, newRow));

  newPath.push({
    x: (cols - 1) * gridSize + gridSize / 2,
    y: newRow * gridSize + gridSize / 2
  });

  pathPoints = newPath;
}
