const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const startButton = document.getElementById('startButton');
const scoreboard = document.getElementById('scoreboard');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const musicToggle = document.getElementById('musicToggle');
const jumpSound = new Audio('assets/jump.wav');
const gameOverSound = new Audio('assets/gameover.wav');
const music = new Audio('assets/music.mp3');
music.loop = true;

const rocketImg = new Image();
rocketImg.src = 'assets/rocket.png';

const platformImg = new Image();
platformImg.src = 'assets/platform.png';

let gameRunning = false;
let rocket;
let platforms = [];
let keys = {};
let ground;
let score = 0;
let stars = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  if (ground) {
    ground.width = canvas.width;
    ground.y = canvas.height - GROUND_HEIGHT;
  }
}

function initStars() {
  stars = [];
  for (let i = 0; i < 50; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1
    });
  }
}

function playJumpSound() {
  jumpSound.currentTime = 0;
  jumpSound.play();
}

function playGameOverSound() {
  gameOverSound.currentTime = 0;
  gameOverSound.play();
}
const GRAVITY = 0.4;
const GROUND_HEIGHT = 20;

function init() {
  ground = { x: 0, y: canvas.height - GROUND_HEIGHT, width: canvas.width, height: GROUND_HEIGHT };
  rocket = {
    x: canvas.width / 2 - 20,
    y: ground.y - 40,
    width: 40,
    height: 40,
    vy: 0
  };
  platforms = [];
  initStars();
  let y = ground.y - 50;
  for (let i = 0; i < 7; i++) {
    platforms.push({
      x: Math.random() * 340,
      y: y,
      width: 60,
      height: 10,
      dx: Math.random() < 0.5 ? (Math.random() > 0.5 ? 1 : -1) * 1.5 : 0
    });
    y -= 80;
  }
  score = 0;
  scoreElement.textContent = score;
  bestScoreElement.textContent = localStorage.getItem('bestScore') || 0;
  scoreboard.style.display = 'block';
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
  stars.forEach(s => {
    s.y += 0.5;
    if (s.y > canvas.height) {
      s.y = 0;
      s.x = Math.random() * canvas.width;
    }
  });
  platforms.forEach(p => {
    p.x += p.dx;
    if (p.x < 0 || p.x + p.width > canvas.width) {
      p.dx *= -1;
    }
  });
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

  // collision with ground and platforms
  if (rocket.vy > 0) {
    // ground
    if (
      rocket.x + rocket.width > ground.x &&
      rocket.x < ground.x + ground.width &&
      rocket.y + rocket.height > ground.y &&
      rocket.y + rocket.height < ground.y + ground.height + rocket.vy
    ) {
      rocket.vy = -10;
      playJumpSound();
    }
    // platforms
    platforms.forEach(p => {
      if (
        rocket.x + rocket.width > p.x &&
        rocket.x < p.x + p.width &&
        rocket.y + rocket.height > p.y &&
        rocket.y + rocket.height < p.y + p.height + rocket.vy
      ) {
        rocket.vy = -10;
        playJumpSound();
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
        p.dx = Math.random() < 0.5 ? (Math.random() > 0.5 ? 1 : -1) * 1.5 : 0;
      }
    });
    stars.forEach(s => {
      s.y += diff;
      if (s.y > canvas.height) {
        s.y -= canvas.height;
        s.x = Math.random() * canvas.width;
      }
    });
    ground.y += diff;
    score += Math.floor(diff);
    scoreElement.textContent = score;
  }

  // game over
  if (rocket.y > canvas.height) {
    gameRunning = false;
    menu.style.display = 'block';
    menu.classList.add('show');
    canvas.style.display = 'none';
    scoreboard.style.display = 'none';
    const best = Number(localStorage.getItem('bestScore') || 0);
    if (score > best) {
      localStorage.setItem('bestScore', score);
      bestScoreElement.textContent = score;
    } else {
      bestScoreElement.textContent = best;
    }
    playGameOverSound();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  stars.forEach(s => {
    ctx.fillRect(s.x, s.y, s.size, s.size);
  });
  // draw ground
  ctx.fillStyle = '#444';
  ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
  // draw platforms
  platforms.forEach(p => {
    if (platformImg.complete) {
      ctx.drawImage(platformImg, p.x, p.y, p.width, p.height);
    } else {
      ctx.fillStyle = '#0f0';
      ctx.fillRect(p.x, p.y, p.width, p.height);
    }
  });
  // draw rocket
  if (rocketImg.complete && rocketImg.naturalWidth !== 0) {
    ctx.drawImage(rocketImg, rocket.x, rocket.y, rocket.width, rocket.height);
  } else {
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
}

startButton.addEventListener('click', () => {
  menu.classList.remove('show');
  menu.style.display = 'none';
  canvas.style.display = 'block';
  scoreboard.style.display = 'block';
  init();
  if (music.paused) {
    music.play().catch(() => {});
  }
});

musicToggle.addEventListener('click', () => {
  if (music.paused) {
    music.play().catch(() => {});
    musicToggle.textContent = 'Music: On';
  } else {
    music.pause();
    musicToggle.textContent = 'Music: Off';
  }
});

document.addEventListener('keydown', e => {
  keys[e.key] = true;
});

document.addEventListener('keyup', e => {
  keys[e.key] = false;
});

// Show the main menu when the page first loads
window.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  menu.classList.add('show');
});

window.addEventListener('resize', resizeCanvas);
