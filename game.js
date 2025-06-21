const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const startButton = document.getElementById('startButton');

let gameRunning = false;
let rocket;
let platforms = [];
let keys = {};
const GRAVITY = 0.4;

function init() {
  rocket = { x: 180, y: 500, width: 40, height: 40, vy: 0 };
  platforms = [];
  let y = 550;
  for (let i = 0; i < 7; i++) {
    platforms.push({ x: Math.random() * 340, y: y, width: 60, height: 10 });
    y -= 80;
  }
  gameRunning = true;
  requestAnimationFrame(loop);
}

function loop() {
  if (!gameRunning) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

function update() {
  rocket.vy += GRAVITY;
  rocket.y += rocket.vy;

  if (keys['ArrowLeft']) {
    rocket.x -= 4;
    if (rocket.x < -rocket.width) rocket.x = canvas.width;
  }
  if (keys['ArrowRight']) {
    rocket.x += 4;
    if (rocket.x > canvas.width) rocket.x = -rocket.width;
  }

  // collision with platforms
  if (rocket.vy > 0) {
    platforms.forEach(p => {
      if (
        rocket.x + rocket.width > p.x &&
        rocket.x < p.x + p.width &&
        rocket.y + rocket.height > p.y &&
        rocket.y + rocket.height < p.y + p.height + rocket.vy
      ) {
        rocket.vy = -10;
      }
    });
  }

  // move world up when rocket goes above middle
  if (rocket.y < canvas.height / 2) {
    let diff = canvas.height / 2 - rocket.y;
    rocket.y = canvas.height / 2;
    platforms.forEach(p => {
      p.y += diff;
      if (p.y > canvas.height) {
        p.y -= canvas.height;
        p.x = Math.random() * 340;
      }
    });
  }

  // game over
  if (rocket.y > canvas.height) {
    gameRunning = false;
    menu.style.display = 'block';
    canvas.style.display = 'none';
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // draw platforms
  ctx.fillStyle = '#0f0';
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });
  // draw rocket
  ctx.fillStyle = '#fff';
  ctx.fillRect(rocket.x + 15, rocket.y, 10, 30); // body
  ctx.fillStyle = '#f00';
  if (rocket.vy < 0) {
    ctx.beginPath();
    ctx.moveTo(rocket.x + 20, rocket.y + 30);
    ctx.lineTo(rocket.x + 10, rocket.y + 40);
    ctx.lineTo(rocket.x + 30, rocket.y + 40);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#0ff';
  ctx.fillRect(rocket.x, rocket.y, 40, 10); // top
}

startButton.addEventListener('click', () => {
  menu.style.display = 'none';
  canvas.style.display = 'block';
  init();
});

document.addEventListener('keydown', e => {
  keys[e.key] = true;
});

document.addEventListener('keyup', e => {
  keys[e.key] = false;
});
