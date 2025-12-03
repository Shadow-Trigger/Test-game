// mapManager.js
console.log("mapManager loaded");

// -- CONFIG --
const gridSize = 60;
const shiftInterval = 20000; // 20 seconds

// Timer
let timeSinceShift = 0;

// Current path array (starts exactly as your static map)
let path = [
  { x: 0, y: 4 * gridSize + gridSize / 2 },
  { x: 5 * gridSize + gridSize / 2, y: 4 * gridSize + gridSize / 2 },
  { x: 5 * gridSize + gridSize / 2, y: 2 * gridSize + gridSize / 2 },
  { x: 10 * gridSize + gridSize / 2, y: 2 * gridSize + gridSize / 2 },
  { x: 10 * gridSize + gridSize / 2, y: 6 * gridSize + gridSize / 2 },
  { x: 14 * gridSize + gridSize / 2, y: 6 * gridSize + gridSize / 2 }
];

// -- INTERNAL: Procedural segment generator --
function generateNextPathPoint(last) {
  // 3 possible directions
  const dirs = ["up", "down", "straight"];
  const choice = dirs[Math.floor(Math.random() * dirs.length)];

  let newY = last.y;
  if (choice === "up")    newY -= gridSize;
  if (choice === "down")  newY += gridSize;

  // Clamp to grid: between rows 0–9
  newY = Math.max(gridSize / 2, Math.min(9 * gridSize + gridSize / 2, newY));

  return {
    x: last.x + gridSize,
    y: newY
  };
}


// -- INTERNAL: Shift entire map right one grid cell --
function shiftPathRight() {
  // Shift existing points
  path = path.map(p => ({
    x: p.x + gridSize,
    y: p.y
  }));

  // Generate NEW procedural point
  const last = path[path.length - 1];
  const newPoint = generateNextPathPoint(last);

  path.push(newPoint);

  // Remove first segment so the map continues moving
  if (path.length > 12) {
    path.shift();
  }

  console.log("Path shifted +1 cell");
}


// -- PUBLIC: Called from the game loop --
export function updateMap(deltaTime) {
  timeSinceShift += deltaTime;

  if (timeSinceShift >= shiftInterval) {
    shiftPathRight();
    timeSinceShift = 0;
  }
}


// -- PUBLIC: Game uses this instead of a static path --
export function getPath() {
  return path;
}
