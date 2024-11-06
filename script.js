const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");

canvas.width = 800;
canvas.height = 400;

let alien = {
  x: 100, // Centered horizontally
  y: canvas.height / 2,
  width: 40,
  height: 40,
  color: "#00ff00",
  dy: 0,
  speed: 5,
};

let obstacles = [];
let gameSpeed = 3;
let score = 0;
let highScore = loadHighScore();
let gameStarted = false;
let obstacleInterval;

function drawAlien() {
  ctx.fillStyle = alien.color;
  ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
}

function createObstacle() {
  let obstacle = {
    x: canvas.width,
    y: Math.random() * (canvas.height - 40), // Random height position
    width: 40,
    height: 40,
    color: "#ff0000",
  };
  obstacles.push(obstacle);
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.fillStyle = obstacle.color;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    obstacle.x -= gameSpeed;

    // Remove obstacles that are off-screen
    if (obstacle.x + obstacle.width < 0) {
      obstacles.shift();
      score += 10; // Increase score for avoiding obstacle
      updateScore();
    }
  });
}

function updateScore() {
  scoreDisplay.textContent = `Score: ${score} | High Score: ${highScore}`;
}

function moveAlien() {
  alien.y += alien.dy;

  // Boundary detection
  if (alien.y < 0) alien.y = 0; // Top boundary
  if (alien.y > canvas.height - alien.height)
    alien.y = canvas.height - alien.height; // Bottom boundary
}

function detectCollision() {
  obstacles.forEach((obstacle) => {
    if (
      alien.x < obstacle.x + obstacle.width &&
      alien.x + alien.width > obstacle.x &&
      alien.y < obstacle.y + obstacle.height &&
      alien.y + alien.height > obstacle.y
    ) {
      checkHighScore(); // Check if current score is a new high score
      resetGame();
    }
  });
}

function checkHighScore() {
  if (score > highScore) {
    highScore = score;
    saveHighScore(highScore);
  }
}

function saveHighScore(score) {
  localStorage.setItem("highScore", score);
}

function loadHighScore() {
  return parseInt(localStorage.getItem("highScore")) || 0;
}

function resetGame() {
  alien.y = canvas.height / 2;
  obstacles = [];
  score = 0;
  gameSpeed = 3;
  gameStarted = false;
  clearInterval(obstacleInterval);
  updateScore();
  showStartMessage();
}

function showStartMessage() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "24px Arial";
  ctx.fillText(
    "Press UP or Down Arrow to Start",
    canvas.width / 2 - 150,
    canvas.height / 2
  );
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameStarted) {
    drawAlien();
    moveAlien();
    drawObstacles();
    detectCollision();

    // Increase difficulty
    if (score > 0 && score % 100 === 0) {
      gameSpeed += 0.5;
    }
  } else {
    showStartMessage();
  }

  requestAnimationFrame(gameLoop);
}

// Start game on space or up arrow press
window.addEventListener("keydown", (e) => {
  if ((e.code === "Space" || e.code === "ArrowUp") && !gameStarted) {
    gameStarted = true;
    score = 0;
    gameSpeed = 3;
    updateScore();
    alien.y = canvas.height / 2; // Reset alien to center
    obstacles = [];

    // Start creating obstacles only after game starts
    obstacleInterval = setInterval(createObstacle, 2000);
  }

  // Alien movement control
  if (e.code === "ArrowUp") {
    alien.dy = -alien.speed; // Move up
  } else if (e.code === "ArrowDown") {
    alien.dy = alien.speed; // Move down
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowUp" || e.code === "ArrowDown") {
    alien.dy = 0; // Stop movement when key is released
  }
});

// Initial load of high score
updateScore();

gameLoop();
