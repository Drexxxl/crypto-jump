const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverEl = document.getElementById('gameOver');
const scoreEl = document.getElementById('score');
const recordEl = document.getElementById('record');
const shieldUI = document.getElementById('shieldUI');
const loadingEl = document.getElementById('loading');

const BASE_WIDTH = 360;
const BASE_HEIGHT = 640;
const MAX_GAP_RATIO = 0.15; // max distance between platforms relative to screen
let MAX_GAP_PX = window.innerHeight * MAX_GAP_RATIO;
let MIN_PLATFORMS = Math.ceil(window.innerHeight / 80); // minimum number of platforms visible
let scale = 1;

function resizeGame() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const scaleX = canvas.width / BASE_WIDTH;
  const scaleY = canvas.height / BASE_HEIGHT;
  scale = Math.min(scaleX, scaleY);
  MAX_GAP_PX = canvas.height * MAX_GAP_RATIO;
}

resizeGame();

let gameState = 'start';
let highscore = parseInt(localStorage.getItem('highscore') || '0');
recordEl.textContent = 'Record: ' + highscore;

let player = {
  x: 160,
  y: 500,
  width: 30,
  height: 30,
  dy: 0,
  gravity: 0.2,
  jump: -6,
  color: '#ffea00'
};

let platforms = [];
let score = 0;
let keys = { left: false, right: false };
let platformGap = 50;
let hasShield = false;
let rocketActive = false;
let springActive = false;
let shieldStartTime = 0;
let rocketStartTime = 0;
let springStartTime = 0;
const boostDuration = 5000; // ms
const stars = [];

function checkJumpable() {
  platforms.sort((a, b) => b.y - a.y);
  for (let i = 0; i < platforms.length - 1; i++) {
    while (platforms[i].y - platforms[i + 1].y > MAX_GAP_PX) {
      const newY = platforms[i].y - MAX_GAP_PX;
      platforms.push(createPlatform(newY));
      platforms.sort((a, b) => b.y - a.y);
    }
  }
}

function initStars() {
  stars.length = 0;
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.5
    });
  }
}

function difficulty() {
  return Math.min(score / 5000, 1);
}

function createPlatform(y) {
  const diff = difficulty();
  const r = Math.random();
  let type = 'normal';
  if (r < diff * 0.1) type = 'deadly';
  else if (r < 0.1 + diff * 0.2) type = 'break';
  else if (r < 0.3 + diff * 0.2) type = 'moving';

  let boost = null;
  if (Math.random() < 0.05) {
    const br = Math.random();
    if (br < 0.34) boost = 'spring';
    else if (br < 0.67) boost = 'rocket';
    else boost = 'shield';
  }

  const width = 60 * scale;
  const height = 10 * scale;
  return {
    x: Math.random() * (canvas.width - width),
    y,
    width,
    height,
    type,
    boost,
    used: false,
    opacity: 1,
    dx: type === 'moving' ? (Math.random() < 0.5 ? -1 : 1) * (1 + diff) : 0
  };
}

function resetGame() {
  resizeGame();
  MIN_PLATFORMS = Math.ceil(canvas.height / 80);
  player.width = 30 * scale;
  player.height = 30 * scale;
  player.jump = -6 * scale;
  player.x = canvas.width / 2 - player.width / 2;
  player.y = canvas.height - 140 * scale;
  player.dy = 0;
  platforms = [];
  score = 0;
  platformGap = Math.min(50 * scale, MAX_GAP_PX);
  hasShield = false;
  rocketActive = false;
  springActive = false;
  shieldStartTime = 0;
  rocketStartTime = 0;
  springStartTime = 0;
  initStars();
  // starting platform directly under the player
  const startY = Math.min(
    canvas.height - 50 * scale,
    player.y + player.height + 20 * scale
  );
  platforms.push({
    x: player.x - 15 * scale,
    y: startY,
    width: 60 * scale,
    height: 10 * scale,
    type: 'normal',
    boost: null,
    used: false,
    dx: 0
  });
  const initialCount = Math.max(MIN_PLATFORMS, Math.ceil(canvas.height / platformGap));
  for (let i = 1; i <= initialCount; i++) {
    platforms.push(createPlatform(startY - i * platformGap));
  }
  checkJumpable();
  scoreEl.textContent = 'Score: 0';
  shieldUI.style.display = 'none';
}

function update() {
  const diff = difficulty();
  const scrollSpeed = 1 + diff;
  const now = performance.now();

  stars.forEach(s => {
    s.y += s.speed * scrollSpeed;
    if (s.y > canvas.height) s.y = 0;
  });

  player.gravity = (0.2 + diff * 0.2) * scale;
  player.dy += player.gravity;
  player.y += player.dy;

  if (keys.left) player.x -= 4 * scale;
  if (keys.right) player.x += 4 * scale;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }

  const scrollPoint = 300 * scale;
  if (player.y < scrollPoint) {
    let dy = (scrollPoint - player.y) * scrollSpeed;
    player.y = scrollPoint;
    platforms.forEach(p => (p.y += dy));
    score += Math.floor(dy);
    platformGap = Math.min((50 + diff * 30) * scale, MAX_GAP_PX);
  }

  let minY = Math.min(...platforms.map(p => p.y));

  platforms.forEach((p, idx) => {
    if (
      player.x + player.width > p.x &&
      player.x < p.x + p.width &&
      player.y + player.height > p.y &&
      player.y + player.height < p.y + p.height &&
      player.dy > 0
    ) {
      if (p.type === 'deadly') {
        if (hasShield) {
          hasShield = false;
          player.dy = player.jump;
        } else {
          endGame();
          return;
        }
      } else {
        let bounce = player.jump;
        if (p.boost === 'spring') {
          springActive = true;
          springStartTime = now;
        }
        if (p.boost === 'rocket') {
          rocketActive = true;
          rocketStartTime = now;
        }
        if (springActive) bounce = player.jump * 0.75;
        if (rocketActive) bounce = player.jump * 2;
        player.dy = bounce;
        if (p.boost === 'shield') {
          hasShield = true;
          shieldStartTime = now;
        }
      }
      p.boost = null;
      if (p.type === 'break') p.used = true;
    }

    if (p.type === 'moving') {
      p.x += p.dx;
      if (p.x < 0 || p.x + p.width > canvas.width) p.dx *= -1;
    }

    if (p.type === 'break' && p.used) {
      p.opacity -= 0.05;
    }

    if (p.y > canvas.height || (p.used && p.opacity <= 0)) {
      platforms.splice(idx, 1);
      platforms.push(createPlatform(minY - platformGap));
      minY = Math.min(...platforms.map(pl => pl.y));
    }
  });
  const needed = Math.max(MIN_PLATFORMS, Math.ceil(canvas.height / platformGap));
  while (platforms.length < needed) {
    platforms.push(createPlatform(minY - platformGap));
    minY = Math.min(...platforms.map(pl => pl.y));
  }

  if (player.y > canvas.height) {
    if (hasShield) {
      hasShield = false;
      player.y = canvas.height - 60 * scale;
      player.dy = player.jump;
    } else {
      endGame();
    }
  }

  if (hasShield && now - shieldStartTime > boostDuration) {
    hasShield = false;
  }
  if (springActive && now - springStartTime > boostDuration) {
    springActive = false;
  }
  if (rocketActive) {
    if (now - rocketStartTime > boostDuration) {
      rocketActive = false;
    } else {
      player.dy = player.jump * 2;
    }
  }

  shieldUI.style.display = hasShield ? 'inline' : 'none';
}

function 
function drawRocket(x, y, w, h) {
  // body gradient
  const gradient = ctx.createLinearGradient(x, y, x, y + h);
  gradient.addColorStop(0, '#ffe259');
  gradient.addColorStop(1, '#ffa751');
  ctx.fillStyle = gradient;
  ctx.fillRect(x + w * 0.25, y, w * 0.5, h);

  // nose
  ctx.fillStyle = '#ffd500';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.25, y);
  ctx.lineTo(x + w * 0.5, y - h * 0.5);
  ctx.lineTo(x + w * 0.75, y);
  ctx.closePath();
  ctx.fill();

  // wings
  ctx.fillStyle = '#ff6d00';
  ctx.fillRect(x, y + h * 0.6, w * 0.25, h * 0.25);
  ctx.fillRect(x + w * 0.75, y + h * 0.6, w * 0.25, h * 0.25);

  // flame when moving up
  if (player.dy < 0) {
    const flameGrad = ctx.createLinearGradient(x + w*0.5, y + h, x + w*0.5, y + h + 15);
    flameGrad.addColorStop(0, '#ff6d00');
    flameGrad.addColorStop(1, '#ffd500');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(x + w * 0.5, y + h);
    ctx.lineTo(x + w * 0.35, y + h + 15);
    ctx.lineTo(x + w * 0.65, y + h + 15);
    ctx.closePath();
    ctx.fill();
  }

  // window
  ctx.fillStyle = '#00e5ff';
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.4, w * 0.15, 0, Math.PI * 2);
  ctx.fill();
}
  ctx.fillStyle = '#00e5ff';
  ctx.beginPath();
  ctx.arc(x + w * 0.5, y + h * 0.4, w * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0b0f1a');
  gradient.addColorStop(1, '#000');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.shadowBlur = 0;
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  });

  platforms.forEach(p => {
    ctx.globalAlpha = p.opacity;
    switch (p.type) {
      case 'break':
        ctx.fillStyle = '#8d6e63';
        break;
      case 'moving':
        ctx.fillStyle = '#00695c';
        break;
      case 'deadly':
        ctx.fillStyle = '#ff3d00';
        break;
      default:
        ctx.fillStyle = '#004d40';
    }
    ctx.fillRect(p.x, p.y, p.width, p.height);
    ctx.globalAlpha = 1;
    if (p.boost) {
      switch (p.boost) {
        case 'spring':
          ctx.fillStyle = '#ffea00';
          ctx.shadowColor = '#ffea00';
          break;
        case 'rocket':
          ctx.fillStyle = '#ff3d00';
          ctx.shadowColor = '#ff3d00';
          break;
        case 'shield':
          ctx.fillStyle = '#00e5ff';
          ctx.shadowColor = '#00e5ff';
          break;
      }
      ctx.shadowBlur = 10;
      if (p.boost === 'spring') {
        ctx.fillRect(p.x + p.width / 2 - 5, p.y - 10, 10, 10);
      } else if (p.boost === 'rocket') {
        ctx.fillRect(p.x + p.width / 2 - 4, p.y - 15, 8, 15);
      } else if (p.boost === 'shield') {
        ctx.beginPath();
        ctx.arc(p.x + p.width / 2, p.y - 5, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }
  });

  drawRocket(player.x, player.y, player.width, player.height);
  if (hasShield) {
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(player.x - 2, player.y - 2, player.width + 4, player.height + 4);
  }

  scoreEl.textContent = 'Score: ' + Math.floor(score / 100);
  shieldUI.style.display = hasShield ? 'inline' : 'none';
}

function loop() {
  if (gameState !== 'playing') return;
  update();
  draw();
  requestAnimationFrame(loop);
}

function endGame() {
  gameState = 'over';
  const finalScore = Math.floor(score / 100);
  if (finalScore > highscore) {
    highscore = finalScore;
    localStorage.setItem('highscore', highscore);
  }
  recordEl.textContent = 'Record: ' + highscore;
  gameOverEl.style.display = 'block';
  restartBtn.style.display = 'block';
  if (window.Telegram && Telegram.WebApp && Telegram.WebApp.sendData) {
    Telegram.WebApp.sendData(JSON.stringify({ score: finalScore }));
    Telegram.WebApp.close();
  }
}

function startGame() {
  if (gameState === 'playing') return;
  startBtn.style.display = 'none';
  gameOverEl.style.display = 'none';
  restartBtn.style.display = 'none';
  resetGame();
  gameState = 'playing';
  loop();
}

startBtn.addEventListener('click', startGame);
startBtn.addEventListener('pointerdown', startGame);

restartBtn.addEventListener('click', () => {
  startGame();
});
restartBtn.addEventListener('pointerdown', () => {
  startGame();
});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') keys.left = true;
  else if (e.key === 'ArrowRight') keys.right = true;
});

document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') keys.left = false;
  else if (e.key === 'ArrowRight') keys.right = false;
});

function handleTouch(e) {
  if (e.touches && e.touches[0]) {
    const x = e.touches[0].clientX;
    const mid = window.innerWidth / 2;
    keys.left = x < mid;
    keys.right = x >= mid;
  }
  e.preventDefault();
}

document.addEventListener('touchstart', handleTouch, { passive: false });
document.addEventListener('touchmove', handleTouch, { passive: false });
document.addEventListener('touchend', () => {
  keys.left = false;
  keys.right = false;
});


window.addEventListener('deviceorientation', event => {
  if (event.gamma) {
    if (event.gamma > 5) keys.right = true;
    else if (event.gamma < -5) keys.left = true;
    else {
      keys.left = false;
      keys.right = false;
    }
  }
});

window.addEventListener('load', () => {
  setTimeout(() => {
    loadingEl.style.display = 'none';
  }, 1000);
});

function handleResize() {
  const prevW = canvas.width;
  const prevH = canvas.height;
  resizeGame();
  MIN_PLATFORMS = Math.ceil(canvas.height / 80);
  const ratioX = canvas.width / prevW;
  const ratioY = canvas.height / prevH;

  player.x *= ratioX;
  player.y *= ratioY;
  player.width = 30 * scale;
  player.height = 30 * scale;
  player.jump = -6 * scale;

  platforms.forEach(p => {
    p.x *= ratioX;
    p.y *= ratioY;
    p.width = 60 * scale;
    p.height = 10 * scale;
  });

  platformGap = Math.min(platformGap * ratioY, MAX_GAP_PX);
  let minY = Math.min(...platforms.map(pl => pl.y));
  const needed = Math.max(MIN_PLATFORMS, Math.ceil(canvas.height / platformGap));
  while (platforms.length < needed) {
    platforms.push(createPlatform(minY - platformGap));
    minY = Math.min(...platforms.map(pl => pl.y));
  }
  checkJumpable();
}

window.addEventListener('resize', handleResize);

resetGame();
