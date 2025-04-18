const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.style.position = 'fixed';
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = 0;
canvas.style.pointerEvents = 'none';
canvas.style.opacity = '10';

const ctx = canvas.getContext('2d');
let width, height;

const moneySymbols = ['₹', '💰', '💵', '$', '💸'];
const particles = [];

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

for (let i = 0; i < 30; i++) {
  particles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: 0.5 + Math.random(),
    symbol: moneySymbols[Math.floor(Math.random() * moneySymbols.length)],
    size: 24 + Math.random() * 24,
    opacity: 0.1 + Math.random() * 0.3
  });
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  ctx.font = 'bold 30px Roboto, sans-serif';

  for (let p of particles) {
    ctx.globalAlpha = p.opacity;
    ctx.font = `${p.size}px Roboto, sans-serif`;
    ctx.fillText(p.symbol, p.x, p.y);
    p.y += p.speed;
    if (p.y > height) {
      p.y = -50;
      p.x = Math.random() * width;
    }
  }

  requestAnimationFrame(draw);
}

draw();
