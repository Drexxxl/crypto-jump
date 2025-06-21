const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const rocketImg = new Image();
rocketImg.src = "https://i.imgur.com/8Qf5vqC.png";
const flameImg = new Image();
flameImg.src = "https://i.imgur.com/5cX1twT.png";

let rocket = { x: canvas.width/2 - 25, y: canvas.height - 100, vy: 0, width: 50, height: 80 };
let platforms = [];
let gravity = 0.5;
let jumpStrength = -12;

function createPlatforms() {
  for (let i = 0; i < 6; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - 100),
      y: i * 150,
      width: 100,
      height: 20
    });
  }
}

function drawRocket() {
  if (rocket.vy < 0) {
    ctx.drawImage(flameImg, rocket.x + rocket.width / 2 - 10, rocket.y + rocket.height, 20, 30);
  }
  ctx.drawImage(rocketImg, rocket.x, rocket.y, rocket.width, rocket.height);
}

function drawPlatforms() {
  ctx.fillStyle = "lime";
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.width, p.height));
}

function update() {
  rocket.vy += gravity;
  rocket.y += rocket.vy;
  if (rocket.y > canvas.height) rocket.y = canvas.height - 100;

  platforms.forEach(p => {
    if (
      rocket.x + rocket.width > p.x &&
      rocket.x < p.x + p.width &&
      rocket.y + rocket.height > p.y &&
      rocket.y + rocket.height < p.y + p.height + rocket.vy &&
      rocket.vy > 0
    ) {
      rocket.vy = jumpStrength;
    }
  });

  if (rocket.y < canvas.height / 2) {
    let delta = canvas.height / 2 - rocket.y;
    rocket.y = canvas.height / 2;
    platforms.forEach(p => p.y += delta);
  }

  platforms = platforms.filter(p => p.y < canvas.height);
  while (platforms.length < 6) {
    platforms.push({
      x: Math.random() * (canvas.width - 100),
      y: -20,
      width: 100,
      height: 20
    });
  }
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlatforms();
  drawRocket();
  update();
  requestAnimationFrame(loop);
}

function startGame() {
  document.getElementById("menu").style.display = "none";
  createPlatforms();
  loop();
}