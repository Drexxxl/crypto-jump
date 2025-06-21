let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let rocketImg = new Image();
rocketImg.src = "public/rocket.png";

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let rocket = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  vy: 0,
  gravity: 0.5,
  jumpStrength: -10
};

function drawRocket() {
  ctx.drawImage(rocketImg, rocket.x - 20, rocket.y - 40, 40, 60);
}

function update() {
  rocket.vy += rocket.gravity;
  rocket.y += rocket.vy;

  if (rocket.y > canvas.height - 100) {
    rocket.y = canvas.height - 100;
    rocket.vy = rocket.jumpStrength;
  }
}

function drawFlame() {
  ctx.fillStyle = "orange";
  ctx.beginPath();
  ctx.moveTo(rocket.x, rocket.y + 20);
  ctx.lineTo(rocket.x - 5, rocket.y + 40);
  ctx.lineTo(rocket.x + 5, rocket.y + 40);
  ctx.closePath();
  ctx.fill();
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  update();
  drawFlame();
  drawRocket();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  document.getElementById("menu").style.display = "none";
  gameLoop();
}
