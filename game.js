const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');

startBtn.onclick = () => {
  document.getElementById('menu').style.display = 'none';
  canvas.style.display = 'block';
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  startGame();
};

let rocketY = 300;
let velocity = 0;
let gravity = 0.5;

const rocketImg = new Image();
rocketImg.src = 'public/rocket.png';

const flameImg = new Image();
flameImg.src = 'public/flame.png';

function startGame() {
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  velocity += gravity;
  rocketY += velocity;

  if (rocketY > canvas.height - 100) {
    velocity = -12;
  }

  ctx.drawImage(rocketImg, canvas.width / 2 - 25, rocketY, 50, 100);
  ctx.drawImage(flameImg, canvas.width / 2 - 10, rocketY + 90, 20, 30);

  requestAnimationFrame(gameLoop);
}