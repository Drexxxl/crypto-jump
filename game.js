const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menu');
const startButton = document.getElementById('startButton');
const scoreboard = document.getElementById('scoreboard');
const scoreElement = document.getElementById('score');
const bestScoreElement = document.getElementById('best-score');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let gameRunning = false;
let rocket;
let platforms = [];
let keys = {};
let ground;
let score = 0;

function playSound(freq, duration, type = 'sine') {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function playJumpSound() {
  playSound(440, 0.1, 'square');
}

function playGameOverSound() {
  playSound(220, 0.5, 'sawtooth');
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
  // draw ground
  ctx.fillStyle = '#444';
  ctx.fillRect(ground.x, ground.y, ground.width, ground.height);
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
  menu.classList.remove('show');
  menu.style.display = 'none';
  canvas.style.display = 'block';
  scoreboard.style.display = 'block';
  init();
});

document.addEventListener('keydown', e => {
  keys[e.key] = true;
});

document.addEventListener('keyup', e => {
  keys[e.key] = false;
});
