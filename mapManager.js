// mapManager.js
const gridSize = 60;
const rows = 8;    // adjust to your canvas
const cols = 15;   // adjust to your canvas

let mapGrid = [];
let pathPoints = [];
let shiftTimer = 0;

// Initialize map and path
export function initMap() {
  mapGrid = Array.from({ length: rows }, () => Array(cols).fill(0));
  pathPoints = [
    { x: 0, y: 4 * gridSize + gridSize / 2 },
    { x: 5 * gridSize + gridSize / 2, y: 4 * gridSize + gridSize / 2 },
    { x: 5 * gridSize + gridSize / 2, y: 2 * gridSize + gridSize / 2 },
    { x: 10 * gridSize + gridSize / 2, y: 2 * gridSize + gridSize / 2 },
    { x: 10 * gridSize + gridSize / 2, y: 6 * gridSize + gridSize / 2 },
    { x: 14 * gridSize + gridSize / 2, y: 6 * gridSize + gridSize / 2 }
  ];
}

// Called every frame
export function updateMap(deltaTime) {
  shiftTimer += deltaTime;

  // Shift map right every 20 seconds
  if (shiftTimer >= 20000) {
    shiftMapRight();
    shiftTimer = 0;
  }
}

// Return current path for enemies
export function getPath() {
  return pathPoints;
}

// --- INTERNAL ---
function shiftMapRight() {
  const dx = gridSize; // move by one grid square
  pathPoints = pathPoints.map(p => ({ x: p.x + dx, y: p.y }));

  // Procedurally extend path if needed
  const last = pathPoints[pathPoints.length - 1];
  if (last.x < cols * gridSize) {
    // Random vertical offset: -1, 0, +1 rows
    const offset = (Math.floor(Math.random() * 3) - 1) * gridSize;
    const newY = Math.max(gridSize / 2, Math.min(rows * gridSize - gridSize / 2, last.y + offset));
    pathPoints.push({ x: last.x + gridSize, y: newY });
  }
}
