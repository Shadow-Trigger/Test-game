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

  // Shift map left every 20 seconds
  if (shiftTimer >= 20000) {
    shiftMapLeft();
    shiftTimer = 0;
  }
}

// Return current path for enemies
export function getPath() {
  return pathPoints;
}

// --- INTERNAL ---
function shiftMapLeft() {
  const dx = gridSize;

  // Shift all path points left
  pathPoints = pathPoints.map(p => ({ x: p.x - dx, y: p.y }));

  // Remove points that are off the left side
  pathPoints = pathPoints.filter(p => p.x >= 0);

  // Add a new point on the right
  const last = pathPoints[pathPoints.length - 1];
  let newX = last ? last.x + gridSize : gridSize / 2;

  // Random vertical move: -1, 0, +1 row
  const offset = (Math.floor(Math.random() * 3) - 1) * gridSize;
  let newY = last ? last.y + offset : 4 * gridSize + gridSize / 2;

  // Clamp to valid rows
  newY = Math.max(gridSize / 2, Math.min(rows * gridSize - gridSize / 2, newY));

  pathPoints.push({ x: newX, y: newY });
}
