const GAME_DURATION = 30;

const DIFFICULTY = {
  easy: {
    baseSpeed: 1.5,
    speedIncrease: 0.15,
    moveInterval: 2500,
    dodgeChance: 0,
  },
  medium: {
    baseSpeed: 2.5,
    speedIncrease: 0.25,
    moveInterval: 1800,
    dodgeChance: 0.2,
  },
  hard: {
    baseSpeed: 4,
    speedIncrease: 0.35,
    moveInterval: 1200,
    dodgeChance: 0.4,
  },
};

const messages = [
  { min: 0, max: 3, text: "Nie martw się, nawet najlepsi szukający zaczynali od zera! Spróbuj ponownie!" },
  { min: 4, max: 7, text: "Niezły początek! Trochę więcej treningu i będziesz jak Harry Potter!" },
  { min: 8, max: 12, text: "Świetnie! Masz talent szukającego! Drużyna Quidditcha byłaby z ciebie dumna!" },
  { min: 13, max: 20, text: "Niesamowite! Złoty Znicz nie ma przed tobą szans! Jesteś mistrzem!" },
  { min: 21, max: Infinity, text: "LEGENDA! Nawet Viktor Krum by ci zazdrościł! Absolutny rekord!" },
];

let score = 0;
let timeLeft = GAME_DURATION;
let gameTimer = null;
let moveTimer = null;
let animFrameId = null;
let bestScore = parseInt(localStorage.getItem("snitch-best") || "0");
let difficulty = null;

// Pozycja i ruch znicza
let snitchX = 0;
let snitchY = 0;
let targetX = 0;
let targetY = 0;
let speed = 0;

const field = document.getElementById("field");
const snitch = document.getElementById("snitch");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const bestEl = document.getElementById("best");
const catchEffect = document.getElementById("catchEffect");

bestEl.textContent = bestScore;

function startGame(diff) {
  difficulty = DIFFICULTY[diff];
  score = 0;
  timeLeft = GAME_DURATION;
  speed = difficulty.baseSpeed;

  scoreEl.textContent = "0";
  timerEl.textContent = GAME_DURATION;
  timerEl.classList.remove("warning");
  bestEl.textContent = bestScore;

  document.getElementById("intro").classList.add("hidden");
  document.getElementById("result").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  // Startowa pozycja na środku
  const rect = field.getBoundingClientRect();
  snitchX = rect.width / 2 - 35;
  snitchY = rect.height / 2 - 17;
  pickNewTarget();
  updateSnitchPosition();

  snitch.classList.remove("caught");
  snitch.style.opacity = "1";

  // Startujemy grę
  gameTimer = setInterval(tick, 1000);
  moveTimer = setInterval(pickNewTarget, difficulty.moveInterval);
  animFrameId = requestAnimationFrame(gameLoop);
}

function tick() {
  timeLeft--;
  timerEl.textContent = timeLeft;

  if (timeLeft <= 5) {
    timerEl.classList.add("warning");
  }

  if (timeLeft <= 0) {
    endGame();
  }
}

function pickNewTarget() {
  const rect = field.getBoundingClientRect();
  const padding = 20;
  targetX = padding + Math.random() * (rect.width - 70 - padding * 2);
  targetY = padding + Math.random() * (rect.height - 35 - padding * 2);
}

function gameLoop() {
  // Poruszamy znicza w stronę celu
  const dx = targetX - snitchX;
  const dy = targetY - snitchY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 2) {
    snitchX += (dx / dist) * speed;
    snitchY += (dy / dist) * speed;
  } else {
    pickNewTarget();
  }

  updateSnitchPosition();
  animFrameId = requestAnimationFrame(gameLoop);
}

function updateSnitchPosition() {
  snitch.style.left = snitchX + "px";
  snitch.style.top = snitchY + "px";
}

// Unikanie kliknięcia
function maybeDodge() {
  if (Math.random() < difficulty.dodgeChance) {
    const rect = field.getBoundingClientRect();
    // Znicz ucieka w losowym kierunku
    const angle = Math.random() * Math.PI * 2;
    const jumpDist = 80 + Math.random() * 60;
    targetX = Math.max(20, Math.min(rect.width - 90, snitchX + Math.cos(angle) * jumpDist));
    targetY = Math.max(20, Math.min(rect.height - 55, snitchY + Math.sin(angle) * jumpDist));
  }
}

// Złapanie znicza
snitch.addEventListener("pointerdown", function (e) {
  e.preventDefault();
  catchSnitch(e);
});

function catchSnitch(e) {
  if (timeLeft <= 0) return;

  score++;
  scoreEl.textContent = score;

  // Efekt złapania - iskry
  spawnSparks(snitchX + 35, snitchY + 17);

  // Efekt +1
  catchEffect.style.left = snitchX + 20 + "px";
  catchEffect.style.top = snitchY + "px";
  catchEffect.classList.remove("show");
  void catchEffect.offsetWidth;
  catchEffect.classList.add("show");

  // Znicz znika i pojawia się w nowym miejscu
  snitch.classList.add("caught");

  // Zwiększamy prędkość
  speed += difficulty.speedIncrease;

  // Szybciej zmienia cel
  clearInterval(moveTimer);
  const newInterval = Math.max(600, difficulty.moveInterval - score * 50);
  moveTimer = setInterval(pickNewTarget, newInterval);

  setTimeout(() => {
    const rect = field.getBoundingClientRect();
    snitchX = Math.random() * (rect.width - 70);
    snitchY = Math.random() * (rect.height - 35);
    pickNewTarget();
    updateSnitchPosition();
    snitch.classList.remove("caught");
    snitch.style.opacity = "1";
  }, 400);
}

function spawnSparks(x, y) {
  for (let i = 0; i < 8; i++) {
    const spark = document.createElement("div");
    spark.className = "spark";
    const angle = (Math.PI * 2 * i) / 8;
    const dist = 30 + Math.random() * 30;
    spark.style.left = x + "px";
    spark.style.top = y + "px";
    spark.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    spark.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    field.appendChild(spark);
    spark.classList.add("animate");
    setTimeout(() => spark.remove(), 600);
  }
}

// Unikanie - znicz reaguje gdy mysz jest blisko
field.addEventListener("pointermove", function (e) {
  if (timeLeft <= 0) return;
  const rect = field.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  const dx = mouseX - (snitchX + 35);
  const dy = mouseY - (snitchY + 17);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Gdy mysz jest bardzo blisko, znicz może uciec
  if (dist < 80) {
    maybeDodge();
  }
});

function endGame() {
  clearInterval(gameTimer);
  clearInterval(moveTimer);
  cancelAnimationFrame(animFrameId);

  // Zapisz najlepszy wynik
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("snitch-best", bestScore);
  }

  document.getElementById("game").classList.add("hidden");

  const resultTitle = document.getElementById("result-title");
  const finalScore = document.getElementById("final-score");
  const resultMsg = document.getElementById("result-msg");

  finalScore.textContent = score;

  // Tytuł i wiadomość w zależności od wyniku
  if (score === 0) {
    resultTitle.textContent = "Koniec czasu!";
  } else if (score < 8) {
    resultTitle.textContent = "Niezła próba!";
  } else if (score < 15) {
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
