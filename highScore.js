// highScore.js

// Initialize current score and high score
export let score = 0;
export let highScore = 0;

// Call this when an enemy is killed
export function addKillScore(points = 1000) {
  score += points;
  if(score > highScore) highScore = score;
}

// Call this when an enemy leaks
export function subtractLeakScore(points = 10000) {
  score -= points;
  if(score < 0) score = 0;
  if(score > highScore) highScore = score;
}

// Draw scores on canvas (pass ctx)
export function drawScore(ctx) {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`Score: ${score}`, 10, 145);
  ctx.fillText(`High Score: ${highScore}`, 10, 175);
}
