const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameRunning = false;

const rocket = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 60,
  vy: 0,
};

const platforms = [];
const platformCount = 7;
const gravity = 0.2;

function initPlatforms() {
  let y = canvas.height - 20;
  for (let i = 0; i < platformCount; i++) {
    platforms.push({ x: Math.random() * (canvas.width - 60), y: y, width: 60, height: 10 });
    y -= 80;
  }
}

function resetGame() {
  rocket.x = canvas.width / 2 - 20;
  rocket.y = canvas.height - 60;
  rocket.vy = 0;
  platforms.length = 0;
  initPlatforms();
}

function drawRocket() {
  ctx.fillStyle = 'white';
  ctx.fillRect(rocket.x, rocket.y, rocket.width, rocket.height);
  // flame
  if (rocket.vy < 0) {
    ctx.fillStyle = 'orange';
    ctx.fillRect(rocket.x + rocket.width / 2 - 5, rocket.y + rocket.height, 10, 15);
  }
}

function drawPlatforms() {
  ctx.fillStyle = '#0f0';
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });
}

function update() {
  rocket.vy += gravity;
  rocket.y += rocket.vy;

  platforms.forEach(p => {
    if (
      rocket.x < p.x + p.width &&
      rocket.x + rocket.width > p.x &&
      rocket.y + rocket.height < p.y + p.height &&
      rocket.y + rocket.height + rocket.vy >= p.y
    ) {
      rocket.vy = -8;
    }
  });

  if (rocket.y < canvas.height / 2) {
    const dy = canvas.height / 2 - rocket.y;
    rocket.y = canvas.height / 2;
    platforms.forEach(p => {
      p.y += dy;
      if (p.y > canvas.height) {
        p.y = 0;
        p.x = Math.random() * (canvas.width - p.width);
      }
    });
  }

  if (rocket.y > canvas.height) {
    gameRunning = false;
    document.getElementById('menu').style.display = 'flex';
    canvas.style.display = 'none';
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlatforms();
  drawRocket();
  update();
  if (gameRunning) requestAnimationFrame(gameLoop);
}

document.getElementById('start').addEventListener('click', () => {
  document.getElementById('menu').style.display = 'none';
  canvas.style.display = 'block';
  resetGame();
  gameRunning = true;
  gameLoop();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') rocket.x -= 5;
  else if (e.key === 'ArrowRight') rocket.x += 5;
  if (rocket.x < 0) rocket.x = canvas.width - rocket.width;
  if (rocket.x + rocket.width > canvas.width) rocket.x = 0;
});

initPlatforms();
