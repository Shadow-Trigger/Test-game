import { getPath } from "./mapManager.js";

const gridSize = 60;

export function isPathCell(col, row) {
    const cellX = col * gridSize + gridSize / 2;
    const cellY = row * gridSize + gridSize / 2;

    const path = getPath();

    for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];

        if (isPointNearSegment(cellX, cellY, p1.x, p1.y, p2.x, p2.y, gridSize * 0.45)) {
            return true;
        }
    }

    return false;
}

function isPointNearSegment(px, py, x1, y1, x2, y2, R) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy) <= R;
}
