// mapManager.js
const gridSize = 60;
const rows = 8;     // adjust to your canvas
const cols = 15;    // adjust to your canvas

let mapGrid = [];
let pathPoints = [];
let shiftTimer = 0;

// Initialize map and path
export function initMap() {
  // Empty map grid: 0 = empty, 1 = path
  mapGrid = Array.from({ length: rows }, () => Array(cols).fill(0));

  // Initial path
  pathPoints = [
    { x: 0, y: 4 * gridSize + gridSize / 2 },
    { x: 5 * gridSize + gridSize / 2, y: 4 * gridSize + gridSize / 2 },
    { x: 5 * gridSize + gridSize / 2, y: 2 * gridSize + gridSize / 2 },
    { x: 10 * gridSize + gridSize / 2, y: 2 * gridSize + gridSize / 2 },
    { x: 10 * gridSize + gridSize / 2, y: 6 * gridSize + gridSize / 2 },
    { x: 14 * gridSize + gridSize / 2, y: 6 * gridSize + gridSize / 2 }
  ];

  // Fill initial path in mapGrid
  pathPoints.forEach(p => {
    const row = Math.floor(p.y / gridSize);
    const col = Math.floor(p.x / gridSize);
    if (mapGrid[row] && mapGrid[row][col] !== undefined) {
      mapGrid[row][col] = 1;
    }
  });
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
  // Remove leftmost column from mapGrid
  mapGrid.forEach(row => row.shift());

  // Add new column on the right
  mapGrid.forEach(row => {
    // 0 = empty, 1 = path (we will adjust later)
    row.push(0);
  });

  // Move all path points left
  pathPoints = pathPoints
    .map(p => ({ x: p.x - gridSize, y: p.y }))
    .filter(p => p.x >= 0); // remove points that went offscreen

  // Add new path piece on the right
  // Get last point
  const last = pathPoints[pathPoints.length - 1] || { x: 0, y: 4 * gridSize + gridSize / 2 };

  // Random vertical offset: -1, 0, +1 row
  const offset = (Math.floor(Math.random() * 3) - 1) * gridSize;
  let newY = last.y + offset;

  // Clamp to grid
  newY = Math.max(gridSize / 2, Math.min((rows - 1) * gridSize + gridSize / 2, newY));

  const newX = (cols - 1) * gridSize + gridSize / 2;
  const newPoint = { x: newX, y: newY };
  pathPoints.push(newPoint);

  // Mark new path in mapGrid
  const newRow = Math.floor(newY / gridSize);
  const newCol = cols - 1;
  if (mapGrid[newRow] && mapGrid[newRow][newCol] !== undefined) {
    mapGrid[newRow][newCol] = 1;
  }
}
