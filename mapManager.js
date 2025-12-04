// mapManager.js
const gridSize = 60;
const rows = 8;
const cols = 15;

let mapGrid = [];
let pathPoints = [];

// initialize map and path
export function initMap() {
  console.log("[mapManager] initMap");
  mapGrid = Array.from({ length: rows }, () => Array(cols).fill(0));

  // starting path (aligned to grid centers)
  pathPoints = [
    { x: 0 * gridSize + gridSize/2,  y: 4 * gridSize + gridSize/2 },
    { x: 5 * gridSize + gridSize/2,  y: 4 * gridSize + gridSize/2 },
    { x: 5 * gridSize + gridSize/2,  y: 2 * gridSize + gridSize/2 },
    { x:10 * gridSize + gridSize/2,  y: 2 * gridSize + gridSize/2 },
    { x:10 * gridSize + gridSize/2,  y: 6 * gridSize + gridSize/2 },
    { x:14 * gridSize + gridSize/2,  y: 6 * gridSize + gridSize/2 },
  ];

  rebuildGridFromPath();
}

// getters
export function getPath() {
  return pathPoints;
}
export function getGrid() {
  return mapGrid;
}

// shift everything left: grid, path. (This does NOT move towers/enemies.)
export function shiftGridLeft() {
  // 1. shift mapGrid left by dropping first column and adding empty column at right
  mapGrid.forEach(row => row.shift());
  mapGrid.forEach(row => row.push(0));

  // 2. shift path points left (pixel coords)
  pathPoints = pathPoints.map(p => ({ x: p.x - gridSize, y: p.y }))
                         .filter(p => p.x >= -gridSize); // keep a little offscreen margin

  // 3. add a new path node on the right, connected to last
  const last = pathPoints[pathPoints.length - 1] || { x: (cols-2)*gridSize + gridSize/2, y: 4*gridSize + gridSize/2 };
  const lastRow = Math.floor(last.y / gridSize);

  // pick -1,0,+1 offset and clamp
  let newRow = lastRow + (Math.floor(Math.random()*3) - 1);
  newRow = Math.max(0, Math.min(rows-1, newRow));

  const newPoint = {
    x: (cols - 1) * gridSize + gridSize/2,
    y: newRow * gridSize + gridSize/2
  };
  pathPoints.push(newPoint);

  // 4. rebuild grid path marking
  rebuildGridFromPath();

  console.log("[mapManager] shiftGridLeft -> newPoint:", newPoint, "path length:", pathPoints.length);
}

// helper to regenerate mapGrid from pathPoints
function rebuildGridFromPath() {
  for (let r = 0; r < rows; r++) mapGrid[r].fill(0);
  pathPoints.forEach(p => {
    const row = Math.floor(p.y / gridSize);
    const col = Math.floor(p.x / gridSize);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      mapGrid[row][col] = 1;
    }
  });
}
