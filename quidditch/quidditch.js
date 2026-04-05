const GAME_DURATION = 30;
const CATCH_DISTANCE = 40;

const DIFFICULTY = {
  easy: {
    snitchSpeed: 1.5,
    speedIncrease: 0.12,
    playerSpeed: 5,
    changeInterval: 2500,
  },
  medium: {
    snitchSpeed: 2.5,
    speedIncrease: 0.2,
    playerSpeed: 5.5,
    changeInterval: 1800,
  },
  hard: {
    snitchSpeed: 4,
    speedIncrease: 0.3,
    playerSpeed: 6,
    changeInterval: 1200,
  },
};

const messages = [
  { min: 0, max: 2, text: "Nie martw się, nawet najlepsi szukający zaczynali od zera! Spróbuj ponownie!" },
  { min: 3, max: 6, text: "Niezły początek! Trochę więcej treningu i będziesz jak Harry Potter!" },
  { min: 7, max: 11, text: "Świetnie! Masz talent szukającego! Drużyna Quidditcha byłaby z ciebie dumna!" },
  { min: 12, max: 18, text: "Niesamowite! Złoty Znicz nie ma przed tobą szans! Jesteś mistrzem!" },
  { min: 19, max: Infinity, text: "LEGENDA! Nawet Viktor Krum by ci zazdrościł! Absolutny rekord!" },
];

const HOUSE_COLORS = {
  gryffindor: "#ae0001",
  hufflepuff: "#ecb939",
  ravenclaw: "#222f5b",
  slytherin: "#2a623d",
};

let selectedHouse = "gryffindor";
let score = 0;
let timeLeft = GAME_DURATION;
let gameTimer = null;
let animFrameId = null;
let bestScore = parseInt(localStorage.getItem("snitch-best") || "0");
let difficulty = null;
let gameRunning = false;

// Pozycje
let playerX = 0;
let playerY = 0;
let targetPlayerX = 0;
let targetPlayerY = 0;

let snitchX = 0;
let snitchY = 0;
let snitchTargetX = 0;
let snitchTargetY = 0;
let snitchSpeed = 0;
let snitchChangeTimer = null;

let fieldW = 0;
let fieldH = 0;

// Klawiatura - strzałki
const keys = { up: false, down: false, left: false, right: false };
let usingKeys = false;

const field = document.getElementById("field");
const player = document.getElementById("player");
const snitch = document.getElementById("snitch");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const bestEl = document.getElementById("best");
const catchEffect = document.getElementById("catchEffect");

bestEl.textContent = bestScore;

// Wybór domu - event listener działa na telefonie i komputerze
document.getElementById("house-buttons").addEventListener("pointerdown", function (e) {
  const btn = e.target.closest(".house-btn");
  if (!btn) return;
  e.preventDefault();
  selectHouse(btn.dataset.house);
});

function selectHouse(house) {
  selectedHouse = house;
  document.querySelectorAll(".house-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.house === house);
  });
  // Aktualizuj podgląd postaci
  updatePreviewColors();
}

function updatePreviewColors() {
  const color = HOUSE_COLORS[selectedHouse];
  document.querySelectorAll(".preview-scarf").forEach((s) => {
    s.setAttribute("stroke", color);
  });
  document.querySelectorAll(".preview-robe").forEach((r) => {
    r.setAttribute("fill", color);
    r.setAttribute("opacity", "0.7");
  });
}

function applyHouseColors() {
  const color = HOUSE_COLORS[selectedHouse];
  document.querySelectorAll("#player .scarf").forEach((s) => {
    s.setAttribute("stroke", color);
  });
  document.querySelectorAll("#player .robe").forEach((r) => {
    r.setAttribute("fill", color);
    r.setAttribute("opacity", "0.7");
  });
}

// Ustaw kolory podglądu na start
updatePreviewColors();

function startGame(diff) {
  difficulty = DIFFICULTY[diff];
  score = 0;
  timeLeft = GAME_DURATION;
  snitchSpeed = difficulty.snitchSpeed;
  gameRunning = true;

  scoreEl.textContent = "0";
  timerEl.textContent = GAME_DURATION;
  timerEl.classList.remove("warning");
  bestEl.textContent = bestScore;
  keys.up = keys.down = keys.left = keys.right = false;
  usingKeys = false;

  document.getElementById("intro").classList.add("hidden");
  document.getElementById("result").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  applyHouseColors();

  const rect = field.getBoundingClientRect();
  fieldW = rect.width;
  fieldH = rect.height;

  // Gracz startuje na środku-lewo
  playerX = fieldW * 0.25;
  playerY = fieldH * 0.5;
  targetPlayerX = playerX;
  targetPlayerY = playerY;

  // Znicz startuje na środku-prawo
  snitchX = fieldW * 0.7;
  snitchY = fieldH * 0.4;
  pickNewSnitchTarget();

  snitch.classList.remove("caught");
  snitch.style.opacity = "1";
  updatePositions();

  gameTimer = setInterval(tick, 1000);
  snitchChangeTimer = setInterval(pickNewSnitchTarget, difficulty.changeInterval);
  animFrameId = requestAnimationFrame(gameLoop);
}

function tick() {
  timeLeft--;
  timerEl.textContent = timeLeft;
  if (timeLeft <= 5) timerEl.classList.add("warning");
  if (timeLeft <= 0) endGame();
}

function pickNewSnitchTarget() {
  const padding = 25;
  snitchTargetX = padding + Math.random() * (fieldW - 55 - padding * 2);
  snitchTargetY = padding + Math.random() * (fieldH - 28 - padding * 2);
}

// Znicz ucieka od gracza gdy jest blisko
function snitchFlee() {
  const dx = snitchX - playerX;
  const dy = snitchY - playerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 100) {
    // Ucieka w przeciwnym kierunku od gracza
    const angle = Math.atan2(dy, dx);
    const fleeDist = 100 + Math.random() * 80;
    snitchTargetX = snitchX + Math.cos(angle) * fleeDist;
    snitchTargetY = snitchY + Math.sin(angle) * fleeDist;

    // Nie wylatuj za pole
    snitchTargetX = Math.max(20, Math.min(fieldW - 75, snitchTargetX));
    snitchTargetY = Math.max(20, Math.min(fieldH - 48, snitchTargetY));
  }
}

function gameLoop() {
  if (!gameRunning) return;

  // Ruch gracza
  let pdx = 0;
  let pdy = 0;

  if (usingKeys) {
    // Sterowanie strzałkami / WASD
    if (keys.left) pdx -= difficulty.playerSpeed;
    if (keys.right) pdx += difficulty.playerSpeed;
    if (keys.up) pdy -= difficulty.playerSpeed;
    if (keys.down) pdy += difficulty.playerSpeed;

    // Normalizuj ruch po skosie
    if (pdx !== 0 && pdy !== 0) {
      pdx *= 0.707;
      pdy *= 0.707;
    }

    playerX += pdx;
    playerY += pdy;

    // Nie wylatuj za pole
    playerX = Math.max(0, Math.min(fieldW - 80, playerX));
    playerY = Math.max(0, Math.min(fieldH - 40, playerY));
  } else {
    // Sterowanie myszką/dotykiem
    pdx = targetPlayerX - playerX;
    pdy = targetPlayerY - playerY;
    const pDist = Math.sqrt(pdx * pdx + pdy * pdy);

    if (pDist > 2) {
      const speed = Math.min(difficulty.playerSpeed, pDist * 0.15);
      playerX += (pdx / pDist) * speed;
      playerY += (pdy / pDist) * speed;
    }
  }

  // Znicz leci w stronę swojego celu
  const sdx = snitchTargetX - snitchX;
  const sdy = snitchTargetY - snitchY;
  const sDist = Math.sqrt(sdx * sdx + sdy * sdy);

  if (sDist > 2) {
    snitchX += (sdx / sDist) * snitchSpeed;
    snitchY += (sdy / sDist) * snitchSpeed;
  } else {
    pickNewSnitchTarget();
  }

  // Znicz ucieka gdy gracz jest blisko
  snitchFlee();

  // Odwracamy gracza w stronę ruchu
  if (usingKeys) {
    if (keys.left) player.classList.add("facing-left");
    else if (keys.right) player.classList.remove("facing-left");
  } else {
    if (pdx < -2) player.classList.add("facing-left");
    else if (pdx > 2) player.classList.remove("facing-left");
  }

  // Sprawdzamy kolizję (złapanie znicza)
  const cx = (playerX + 40) - (snitchX + 27);
  const cy = (playerY + 20) - (snitchY + 14);
  const catchDist = Math.sqrt(cx * cx + cy * cy);

  if (catchDist < CATCH_DISTANCE) {
    catchSnitch();
  }

  updatePositions();
  animFrameId = requestAnimationFrame(gameLoop);
}

function updatePositions() {
  player.style.left = playerX + "px";
  player.style.top = playerY + "px";
  snitch.style.left = snitchX + "px";
  snitch.style.top = snitchY + "px";
}

// Sterowanie - klawiatura (strzałki + WASD)
document.addEventListener("keydown", function (e) {
  if (!gameRunning) return;
  const key = e.key;
  if (key === "ArrowUp" || key === "w" || key === "W") { keys.up = true; usingKeys = true; e.preventDefault(); }
  if (key === "ArrowDown" || key === "s" || key === "S") { keys.down = true; usingKeys = true; e.preventDefault(); }
  if (key === "ArrowLeft" || key === "a" || key === "A") { keys.left = true; usingKeys = true; e.preventDefault(); }
  if (key === "ArrowRight" || key === "d" || key === "D") { keys.right = true; usingKeys = true; e.preventDefault(); }
});

document.addEventListener("keyup", function (e) {
  const key = e.key;
  if (key === "ArrowUp" || key === "w" || key === "W") keys.up = false;
  if (key === "ArrowDown" || key === "s" || key === "S") keys.down = false;
  if (key === "ArrowLeft" || key === "a" || key === "A") keys.left = false;
  if (key === "ArrowRight" || key === "d" || key === "D") keys.right = false;
});

// Sterowanie - mysz
field.addEventListener("mousemove", function (e) {
  usingKeys = false;
  if (!gameRunning) return;
  const rect = field.getBoundingClientRect();
  targetPlayerX = e.clientX - rect.left - 40;
  targetPlayerY = e.clientY - rect.top - 20;
  clampTarget();
});

// Sterowanie - dotyk
field.addEventListener("touchmove", function (e) {
  if (!gameRunning) return;
  usingKeys = false;
  e.preventDefault();
  const touch = e.touches[0];
  const rect = field.getBoundingClientRect();
  targetPlayerX = touch.clientX - rect.left - 40;
  targetPlayerY = touch.clientY - rect.top - 20;
  clampTarget();
}, { passive: false });

field.addEventListener("touchstart", function (e) {
  if (!gameRunning) return;
  usingKeys = false;
  e.preventDefault();
  const touch = e.touches[0];
  const rect = field.getBoundingClientRect();
  targetPlayerX = touch.clientX - rect.left - 40;
  targetPlayerY = touch.clientY - rect.top - 20;
  clampTarget();
}, { passive: false });

function clampTarget() {
  targetPlayerX = Math.max(0, Math.min(fieldW - 80, targetPlayerX));
  targetPlayerY = Math.max(0, Math.min(fieldH - 40, targetPlayerY));
}

function catchSnitch() {
  score++;
  scoreEl.textContent = score;

  // Iskry
  spawnSparks(snitchX + 27, snitchY + 14);

  // Efekt +1
  catchEffect.style.left = snitchX + 15 + "px";
  catchEffect.style.top = snitchY - 10 + "px";
  catchEffect.classList.remove("show");
  void catchEffect.offsetWidth;
  catchEffect.classList.add("show");

  // Znicz znika
  snitch.classList.add("caught");

  // Szybszy znicz
  snitchSpeed += difficulty.speedIncrease;

  // Częściej zmienia kierunek
  clearInterval(snitchChangeTimer);
  const newInterval = Math.max(600, difficulty.changeInterval - score * 40);
  snitchChangeTimer = setInterval(pickNewSnitchTarget, newInterval);

  // Znicz pojawia się w nowym miejscu (daleko od gracza)
  setTimeout(() => {
    respawnSnitch();
    snitch.classList.remove("caught");
    snitch.style.opacity = "1";
  }, 500);
}

function respawnSnitch() {
  // Znicz pojawia się w losowym miejscu, ale daleko od gracza
  let attempts = 0;
  do {
    snitchX = 30 + Math.random() * (fieldW - 115);
    snitchY = 30 + Math.random() * (fieldH - 68);
    const dx = snitchX - playerX;
    const dy = snitchY - playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 150 || attempts > 10) break;
    attempts++;
  } while (true);
  pickNewSnitchTarget();
}

function spawnSparks(x, y) {
  for (let i = 0; i < 8; i++) {
    const spark = document.createElement("div");
    spark.className = "spark";
    const angle = (Math.PI * 2 * i) / 8;
    const dist = 25 + Math.random() * 25;
    spark.style.left = x + "px";
    spark.style.top = y + "px";
    spark.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    spark.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    field.appendChild(spark);
    spark.classList.add("animate");
    setTimeout(() => spark.remove(), 600);
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(gameTimer);
  clearInterval(snitchChangeTimer);
  cancelAnimationFrame(animFrameId);

  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("snitch-best", bestScore);
  }

  document.getElementById("game").classList.add("hidden");

  const resultTitle = document.getElementById("result-title");
  const finalScore = document.getElementById("final-score");
  const resultMsg = document.getElementById("result-msg");

  finalScore.textContent = score;

  if (score === 0) {
    resultTitle.textContent = "Koniec czasu!";
  } else if (score < 7) {
    resultTitle.textContent = "Niezła próba!";
  } else if (score < 13) {
    resultTitle.textContent = "Świetna gra!";
  } else {
    resultTitle.textContent = "NIESAMOWITE!";
  }

  const msg = messages.find((m) => score >= m.min && score <= m.max);
  resultMsg.textContent = msg ? msg.text : "";

  document.getElementById("result").classList.remove("hidden");
}

function backToIntro() {
  bestEl.textContent = bestScore;
  document.getElementById("result").classList.add("hidden");
  document.getElementById("game").classList.add("hidden");
  document.getElementById("intro").classList.remove("hidden");
}
