const menu = document.getElementById('menu');
const gameScreen = document.getElementById('game');
const startButton = document.getElementById('startButton');
const backButton = document.getElementById('backButton');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let rocket;
let platforms;
let gameOver = false;
let keys = {};

const gravity = 0.4;
const jumpStrength = 12;

startButton.addEventListener('click', () => {
  menu.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  startGame();
  requestAnimationFrame(loop);
});

backButton.addEventListener('click', () => {
  gameScreen.classList.add('hidden');
  menu.classList.remove('hidden');
});

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function startGame() {
  rocket = { x: canvas.width/2 - 10, y: canvas.height - 60, width: 20, height: 40, vy: -jumpStrength };
  platforms = [];
  for (let i = 0; i < 10; i++) {
    platforms.push({ x: Math.random() * (canvas.width - 60), y: canvas.height - i * 60, width: 60, height: 10 });
  }
  gameOver = false;
}

function loop() {
  update();
  draw();
  if (!gameOver) requestAnimationFrame(loop);
}

function update() {
  rocket.vy += gravity;
  rocket.y += rocket.vy;
  if (keys['ArrowLeft']) rocket.x -= 4;
  if (keys['ArrowRight']) rocket.x += 4;

  // wrap horizontally
  if (rocket.x > canvas.width) rocket.x = -rocket.width;
  if (rocket.x + rocket.width < 0) rocket.x = canvas.width;

  // collision with platforms
  if (rocket.vy > 0) {
    for (let p of platforms) {
      if (
        rocket.x + rocket.width > p.x &&
        rocket.x < p.x + p.width &&
        rocket.y + rocket.height > p.y &&
        rocket.y + rocket.height < p.y + p.height + rocket.vy
      ) {
        rocket.vy = -jumpStrength;
      }
    }
  }

  // scroll
  if (rocket.y < canvas.height * 0.4) {
    const diff = canvas.height * 0.4 - rocket.y;
    rocket.y += diff;
    for (let p of platforms) {
      p.y += diff;
      if (p.y > canvas.height) {
        p.y = 0;
        p.x = Math.random() * (canvas.width - p.width);
      }
    }
  }

  if (rocket.y > canvas.height) {
    gameOver = true;
  }
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // stars background
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = 'white';
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    ctx.fillRect(x, y, 1, 1);
  }

  // platforms
  ctx.fillStyle = '#0f0';
  for (let p of platforms) {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }

  // rocket
  ctx.fillStyle = '#f00';
  ctx.beginPath();
  ctx.moveTo(rocket.x + rocket.width/2, rocket.y);
  ctx.lineTo(rocket.x, rocket.y + rocket.height);
  ctx.lineTo(rocket.x + rocket.width, rocket.y + rocket.height);
  ctx.closePath();
  ctx.fill();

  if (rocket.vy < 0) {
    ctx.fillStyle = 'orange';
    ctx.fillRect(rocket.x + rocket.width/2 - 3, rocket.y + rocket.height, 6, 10);
  }

  if (gameOver) {
    ctx.fillStyle = '#fff';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width/2, canvas.height/2);
  }
}
