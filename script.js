const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const rocket = { x: width / 2 - 20, y: height - 80, vy: 0, width: 40, height: 60 };
const gravity = 0.4;
const jumpVelocity = -10;
let platforms = [];
const platformW = 60;
const platformH = 10;
const maxPlatforms = 6;

function initPlatforms() {
  const step = height / maxPlatforms;
  for (let i = 0; i < maxPlatforms; i++) {
    platforms.push({
      x: Math.random() * (width - platformW),
      y: height - i * step,
      width: platformW,
      height: platformH
    });
  }
}

function drawRocket() {
  const grad = ctx.createLinearGradient(rocket.x, rocket.y, rocket.x, rocket.y + rocket.height);
  grad.addColorStop(0, '#fff');
  grad.addColorStop(1, '#888');
  ctx.fillStyle = grad;
  ctx.fillRect(rocket.x, rocket.y, rocket.width, rocket.height);

  ctx.fillStyle = '#eee';
  ctx.beginPath();
  ctx.moveTo(rocket.x, rocket.y);
  ctx.lineTo(rocket.x + rocket.width / 2, rocket.y - 20);
  ctx.lineTo(rocket.x + rocket.width, rocket.y);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ff4136';
  ctx.beginPath();
  ctx.moveTo(rocket.x - 10, rocket.y + rocket.height);
  ctx.lineTo(rocket.x, rocket.y + rocket.height - 10);
  ctx.lineTo(rocket.x, rocket.y + rocket.height);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(rocket.x + rocket.width + 10, rocket.y + rocket.height);
  ctx.lineTo(rocket.x + rocket.width, rocket.y + rocket.height - 10);
  ctx.lineTo(rocket.x + rocket.width, rocket.y + rocket.height);
  ctx.closePath();
  ctx.fill();

  if (rocket.vy < 0) {
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.moveTo(rocket.x + rocket.width / 2, rocket.y + rocket.height);
    ctx.lineTo(rocket.x + rocket.width / 2 - 10, rocket.y + rocket.height + 30);
    ctx.lineTo(rocket.x + rocket.width / 2 + 10, rocket.y + rocket.height + 30);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPlatforms() {
  platforms.forEach(p => {
    const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
    grad.addColorStop(0, '#0f0');
    grad.addColorStop(1, '#090');
    ctx.fillStyle = grad;
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });
}

function update() {
  rocket.y += rocket.vy;
  rocket.vy += gravity;
  if (keys.left) rocket.x -= 4;
  if (keys.right) rocket.x += 4;
  if (rocket.x < -rocket.width) rocket.x = width;
  if (rocket.x > width) rocket.x = -rocket.width;

  platforms.forEach(p => {
    if (
      rocket.vy > 0 &&
      rocket.x + rocket.width > p.x &&
      rocket.x < p.x + p.width &&
      rocket.y + rocket.height > p.y &&
      rocket.y + rocket.height < p.y + p.height + rocket.vy
    ) {
      rocket.vy = jumpVelocity;
    }
  });

  if (rocket.y < height / 2) {
    const diff = height / 2 - rocket.y;
    rocket.y = height / 2;
    platforms.forEach(p => (p.y += diff));
    if (Math.random() < 0.1) {
      platforms.push({
        x: Math.random() * (width - platformW),
        y: -platformH,
        width: platformW,
        height: platformH
      });
    }
    platforms = platforms.filter(p => p.y < height);
  }

  if (rocket.y > height) {
    alert('Game Over');
    window.location.href = 'index.html';
  }
}

function loop() {
  ctx.clearRect(0, 0, width, height);
  drawPlatforms();
  drawRocket();
  update();
  requestAnimationFrame(loop);
}

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const keys = { left: false, right: false };
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
});
window.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
});

initPlatforms();
loop();
