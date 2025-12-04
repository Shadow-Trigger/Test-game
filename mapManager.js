// mapManager.js
const gridSize = 60;
const rows = 8;
const cols = 15;

// --- STATE ---
let mapGrid = [];
let pathPoints = [];
let shiftTimer = 0;

// ------------------------------------------------
//  PUBLIC FUNCTIONS
// ------------------------------------------------

export function initMap() {
    // Create empty grid
    mapGrid = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Initial hard-coded path
    pathPoints = [
        { x: 0 * gridSize + gridSize/2,  y: 4 * gridSize + gridSize/2 },
        { x: 5 * gridSize + gridSize/2,  y: 4 * gridSize + gridSize/2 },
        { x: 5 * gridSize + gridSize/2,  y: 2 * gridSize + gridSize/2 },
        { x:10 * gridSize + gridSize/2,  y: 2 * gridSize + gridSize/2 },
        { x:10 * gridSize + gridSize/2,  y: 6 * gridSize + gridSize/2 },
        { x:14 * gridSize + gridSize/2,  y: 6 * gridSize + gridSize/2 },
    ];

    // Fill grid with path=1
    rebuildGridFromPath();
}

export function updateMap(deltaTime) {
    shiftTimer += deltaTime;

    if (shiftTimer >= 20000) {
        shiftTimer = 0;
        // Only shift path + grid here
        shiftGridAndPath();
    }
}

export function getGrid() {
    return mapGrid;
}

export function getPath() {
    return pathPoints;
}

// ------------------------------------------------
//   SHIFT EVERYTHING LEFT (USED BY game.js)
// ------------------------------------------------
export function shiftMapLeft(towers, enemies, occupiedCells) {

    // 1) Shift grid + path
    shiftGridAndPath();

    // 2) Shift towers
    towers.forEach((t, i) => {
        t.x -= gridSize;
        t.col -= 1;
        if (t.col < 0) towers.splice(i, 1);
    });

    // 3) Shift enemies
    enemies.forEach((e, i) => {
        e.x -= gridSize;
        if (e.x < 0) enemies.splice(i, 1);
    });

    // 4) Shift occupiedCells
    const newOccupied = new Set();
    occupiedCells.forEach(key => {
        const [col, row] = key.split(",").map(Number);
        if (col > 0) {
            newOccupied.add(`${col - 1},${row}`);
        }
    });
    occupiedCells.clear();
    newOccupied.forEach(k => occupiedCells.add(k));
}

// ------------------------------------------------
//   INTERNAL UTILITY FUNCTIONS
// ------------------------------------------------

function shiftGridAndPath() {

    // --- A) Shift grid left ---
    mapGrid.forEach(row => row.shift());   // remove leftmost column
    mapGrid.forEach(row => row.push(0));   // add empty column on right

    // --- B) Shift pathPoints left ---
    pathPoints = pathPoints
        .map(p => ({ x: p.x - gridSize, y: p.y }))
        .filter(p => p.x >= 0);

    // --- C) Generate new path node on the right ---
    const last = pathPoints[pathPoints.length - 1];
    const lastRow = Math.floor(last.y / gridSize);

    // random row offset: -1, 0, +1
    let newRow = lastRow + (Math.floor(Math.random() * 3) - 1);
    newRow = Math.max(0, Math.min(rows - 1, newRow));

    const newPoint = {
        x: (cols - 1) * gridSize + gridSize / 2,
        y: newRow * gridSize + gridSize / 2
    };

    pathPoints.push(newPoint);

    // --- D) Update mapGrid from new pathPoints ---
    rebuildGridFromPath();
}

function rebuildGridFromPath() {
    // reset grid
    mapGrid.forEach(row => row.fill(0));

    pathPoints.forEach(p => {
        const row = Math.floor(p.y / gridSize);
        const col = Math.floor(p.x / gridSize);
        if (row >= 0 && row < rows && col >= 0 && col < cols) {
            mapGrid[row][col] = 1;
        }
    });
}
