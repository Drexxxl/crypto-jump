const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');

startBtn.onclick = () => {
  document.getElementById('menu').style.display = 'none';
  canvas.style.display = 'block';
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  generatePlatforms();
  startGame();
};

let rocketY = 300;
let velocity = 0;
let gravity = 0.5;
let score = 0;
let platforms = [];
let gameLoopId;

const rocketImg = new Image();
rocketImg.src = 'public/rocket.png';

const flameImg = new Image();
flameImg.src = 'public/flame.png';

function createPlatform(y) {
  const width = 60 + Math.random() * 40;
  const x = Math.random() * (canvas.width - width);
  platforms.push({ x, y, width, height: 10 });
}

function generatePlatforms() {
  platforms = [];
  for (let i = 0; i < 10; i++) {
    createPlatform(canvas.height - i * 100);
  }
}

function drawPlatforms() {
  ctx.fillStyle = "#00ffcc";
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });
}

function updatePlatforms() {
  platforms.forEach(p => p.y += velocity > 0 ? -velocity / 2 : 0);
  if (platforms[0].y > canvas.height) {
    platforms.shift();
    createPlatform(-10);
    score++;
  }
}

function checkPlatformCollision() {
  platforms.forEach(p => {
    if (
      rocketY + 100 >= p.y &&
      rocketY + 100 <= p.y + p.height &&
      canvas.width / 2 >= p.x &&
      canvas.width / 2 <= p.x + p.width &&
      velocity > 0
    ) {
      velocity = -12;
    }
  });
}

function drawScore() {
  ctx.fillStyle = "#fff";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

function checkGameOver() {
  if (rocketY > canvas.height) {
    showGameOver();
  }
}

function showGameOver() {
  document.getElementById('finalScore').textContent = "Твой счёт: " + score;
  document.getElementById('gameOverScreen').style.display = 'block';
  cancelAnimationFrame(gameLoopId);
}

function restartGame() {
  score = 0;
  rocketY = 300;
  velocity = 0;
  generatePlatforms();
  document.getElementById('gameOverScreen').style.display = 'none';
  gameLoop();
}

function startGame() {
  gameLoop();
}

function gameLoop() {
  gameLoopId = requestAnimationFrame(gameLoop);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  velocity += gravity;
  rocketY += velocity;

  if (rocketY > canvas.height - 100) {
    velocity = -12;
  }

  ctx.drawImage(rocketImg, canvas.width / 2 - 25, rocketY, 50, 100);
  ctx.drawImage(flameImg, canvas.width / 2 - 10, rocketY + 90, 20, 30);

  updatePlatforms();
  checkPlatformCollision();
  drawPlatforms();
  drawScore();
  checkGameOver();
}