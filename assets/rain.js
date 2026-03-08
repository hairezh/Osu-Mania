const canvas = document.getElementById("rainCanvas");
const toggle = document.getElementById("rainToggle");
const clockTime = document.getElementById("clockTime");

let ctx = null;
let rainEnabled = true;
let drops = [];

if (canvas) {
  ctx = canvas.getContext("2d", { alpha: true });
}

function resizeRain() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createRain();
}

function createRain() {
  if (!canvas) return;
  drops = [];

  const amount = Math.max(120, Math.floor(window.innerWidth * 0.18));

  for (let i = 0; i < amount; i++) {
    drops.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      len: 10 + Math.random() * 20,
      speed: 4 + Math.random() * 6,
      drift: -0.5 + Math.random() * 1
    });
  }
}

function drawRain() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!rainEnabled) return;

  ctx.strokeStyle = "rgba(180, 200, 255, 0.30)";
  ctx.lineWidth = 1;

  for (const d of drops) {
    ctx.beginPath();
    ctx.moveTo(d.x, d.y);
    ctx.lineTo(d.x + d.drift * 2, d.y + d.len);
    ctx.stroke();

    d.y += d.speed;
    d.x += d.drift;

    if (d.y > canvas.height + 30 || d.x < -30 || d.x > canvas.width + 30) {
      d.y = -20;
      d.x = Math.random() * canvas.width;
    }
  }
}

function rainLoop() {
  drawRain();
  requestAnimationFrame(rainLoop);
}

function setupRainToggle() {
  if (!toggle) return;

  const saved = localStorage.getItem("rainEnabled");
  rainEnabled = saved !== "off";

  toggle.textContent = rainEnabled ? "Rain: ON" : "Rain: OFF";

  toggle.addEventListener("click", () => {
    rainEnabled = !rainEnabled;
    localStorage.setItem("rainEnabled", rainEnabled ? "on" : "off");
    toggle.textContent = rainEnabled ? "Rain: ON" : "Rain: OFF";

    if (!rainEnabled && ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });
}

function setupClockInline() {
  if (!clockTime) return;

  function updateClock() {
    const now = new Date();

    const date = now.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });

    const time = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    clockTime.innerHTML = `${date}<br>${time}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

window.addEventListener("resize", resizeRain);

resizeRain();
setupRainToggle();
setupClockInline();
rainLoop();
