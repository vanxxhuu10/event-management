const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.style.position = 'fixed';
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.zIndex = 0;
canvas.style.pointerEvents = 'none';
canvas.style.opacity = '0.8';

const ctx = canvas.getContext('2d');
let width, height;

const symbols = ['🎤', '🔊', '🔌', '🖊️', '🧴', '📋', '📎', '✂️', '💡', '🛠️'];
const particles = [];

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

for (let i = 0; i < 25; i++) {
  particles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: 0.3 + Math.random() * 0.7,
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    size: 22 + Math.random() * 18,
    opacity: 0.2 + Math.random() * 0.4
  });
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  particles.forEach(p => {
    ctx.globalAlpha = p.opacity;
    ctx.font = `${p.size}px Arial`;
    ctx.fillText(p.symbol, p.x, p.y);
    p.y += p.speed;
    if (p.y > height) {
      p.y = -50;
      p.x = Math.random() * width;
    }
  });
  requestAnimationFrame(draw);
}

draw();
