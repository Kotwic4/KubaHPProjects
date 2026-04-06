const GAME_DURATION = 30;
const CATCH_DISTANCE = 40;
const MAX_PLAYERS = 4;

const DIFFICULTY = {
  easy: { snitchSpeed: 1.5, speedIncrease: 0.12, playerSpeed: 5, changeInterval: 2500 },
  medium: { snitchSpeed: 2.5, speedIncrease: 0.2, playerSpeed: 5.5, changeInterval: 1800 },
  hard: { snitchSpeed: 4, speedIncrease: 0.3, playerSpeed: 6, changeInterval: 1200 },
};

const HOUSE_COLORS = {
  gryffindor: "#ae0001",
  hufflepuff: "#ecb939",
  ravenclaw: "#222f5b",
  slytherin: "#2a623d",
};

const DEFAULT_HOUSES = ["gryffindor", "slytherin", "ravenclaw", "hufflepuff"];
const HAIR_COLORS = ["#3d2b1a", "#8b5e3c", "#8b2500", "#c8a050"];

const messages = [
  { min: 0, max: 2, text: "Nie martw się, nawet najlepsi szukający zaczynali od zera! Spróbuj ponownie!" },
  { min: 3, max: 6, text: "Niezły początek! Trochę więcej treningu i będziesz jak Harry Potter!" },
  { min: 7, max: 11, text: "Świetnie! Masz talent szukającego! Drużyna Quidditcha byłaby z ciebie dumna!" },
  { min: 12, max: 18, text: "Niesamowite! Złoty Znicz nie ma przed tobą szans! Jesteś mistrzem!" },
  { min: 19, max: Infinity, text: "LEGENDA! Nawet Viktor Krum by ci zazdrościł! Absolutny rekord!" },
];

// === Stan gry ===
let playerCount = 1;
let timeLeft = GAME_DURATION;
let gameTimer = null;
let animFrameId = null;
let difficulty = null;
let gameRunning = false;
let snitchCatchable = true;

// Gracze — tablica obiektów
let players = [];

// Znicz
let snitchX = 0, snitchY = 0;
let snitchTargetX = 0, snitchTargetY = 0;
let snitchSpeed = 0;
let snitchChangeTimer = null;

let fieldW = 0, fieldH = 0;

// Joysticki i klawisze (stałe — 4 sloty)
const joysticks = [];
const keyStates = [];
for (let i = 0; i < MAX_PLAYERS; i++) {
  joysticks.push({ active: false, dx: 0, dy: 0 });
  keyStates.push({ up: false, down: false, left: false, right: false });
}

// Elementy DOM
const field = document.getElementById("field");
const snitchEl = document.getElementById("snitch");
const timerEl = document.getElementById("timer");
const catchEffect = document.getElementById("catchEffect");

// === Wybór trybu ===
document.getElementById("mode-buttons").addEventListener("pointerdown", function (e) {
  const btn = e.target.closest(".mode-btn");
  if (!btn) return;
  e.preventDefault();
  playerCount = parseInt(btn.dataset.count);
  document.querySelectorAll(".mode-btn").forEach((b) =>
    b.classList.toggle("selected", parseInt(b.dataset.count) === playerCount)
  );
  updateIntroVisibility();
});

function updateIntroVisibility() {
  const multi = playerCount > 1;
  // Pokaż/ukryj sekcje graczy 2-4
  for (let i = 2; i <= MAX_PLAYERS; i++) {
    const setupEl = document.getElementById("p" + i + "-setup");
    if (setupEl) setupEl.classList.toggle("hidden", i > playerCount);
  }

  // Etykiety
  document.getElementById("p1-name-label").textContent = multi ? "Imię gracza 1:" : "Twoje imię:";
  document.getElementById("p1-house-label").textContent = multi ? "Gracz 1 - wybierz dom:" : "Wybierz swój dom:";

  if (multi) {
    document.getElementById("controls-hint").textContent =
      "Steruj joystickami lub klawiaturą (WASD + Strzałki)";
  } else {
    document.getElementById("controls-hint").textContent =
      "Steruj joystickiem, strzałkami lub WASD!";
  }
}

// === Wybór domu ===
for (let i = 1; i <= MAX_PLAYERS; i++) {
  (function (idx) {
    const container = document.getElementById("house-buttons-p" + idx);
    if (!container) return;
    container.addEventListener("pointerdown", function (e) {
      const btn = e.target.closest(".house-btn");
      if (!btn) return;
      e.preventDefault();
      container.querySelectorAll(".house-btn").forEach((b) =>
        b.classList.toggle("selected", b === btn)
      );
    });
  })(i);
}

function getSelectedHouse(playerIdx) {
  const container = document.getElementById("house-buttons-p" + (playerIdx + 1));
  if (!container) return DEFAULT_HOUSES[playerIdx];
  const sel = container.querySelector(".house-btn.selected");
  return sel ? sel.dataset.house : DEFAULT_HOUSES[playerIdx];
}

function applyPlayerColors(playerEl, house) {
  const color = HOUSE_COLORS[house];
  playerEl.querySelector(".scarf").setAttribute("stroke", color);
  playerEl.querySelector(".robe").setAttribute("fill", color);
  playerEl.querySelector(".robe").setAttribute("opacity", "0.7");
}

// === Gra ===

function startGame(diff) {
  difficulty = DIFFICULTY[diff];
  timeLeft = GAME_DURATION;
  snitchSpeed = difficulty.snitchSpeed;
  gameRunning = true;
  snitchCatchable = true;

  // Zbuduj tablicę graczy
  players = [];
  for (let i = 0; i < playerCount; i++) {
    const nameInput = document.getElementById("p" + (i + 1) + "-name");
    const defaultName = playerCount > 1 ? "Gracz " + (i + 1) : "";
    players.push({
      x: 0, y: 0, score: 0,
      house: getSelectedHouse(i),
      name: nameInput ? (nameInput.value.trim() || defaultName) : defaultName,
      el: document.getElementById("player" + (i + 1)),
      joystick: joysticks[i],
      keys: keyStates[i],
    });
  }

  // Reset klawiszy i joysticków
  for (let i = 0; i < MAX_PLAYERS; i++) {
    keyStates[i].up = keyStates[i].down = keyStates[i].left = keyStates[i].right = false;
    joysticks[i].active = false; joysticks[i].dx = 0; joysticks[i].dy = 0;
  }

  // HUD
  timerEl.textContent = GAME_DURATION;
  timerEl.classList.remove("warning");
  const hudContainer = document.getElementById("scores-hud");
  hudContainer.innerHTML = "";
  players.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "hud-item";
    const label = playerCount > 1 ? p.name : "Złapane";
    div.innerHTML =
      '<span class="hud-label">' + label + '</span>' +
      '<span class="hud-value" id="score-val-' + i + '" style="color:' + HOUSE_COLORS[p.house] + '">0</span>';
    hudContainer.appendChild(div);
  });

  // Pokaż/ukryj graczy i joysticki
  for (let i = 0; i < MAX_PLAYERS; i++) {
    const pEl = document.getElementById("player" + (i + 1));
    if (pEl) pEl.classList.toggle("hidden", i >= playerCount);
    const jw = document.getElementById("joy-wrapper-p" + (i + 1));
    if (jw) jw.classList.toggle("hidden", i >= playerCount);
    // Resetuj gałki
    const knob = document.getElementById("knob" + (i + 1));
    if (knob) knob.style.transform = "translate(-50%, -50%)";
  }

  // Ustaw kolory graczy i joysticków
  players.forEach((p, i) => {
    applyPlayerColors(p.el, p.house);
    p.el.querySelector(".hair").setAttribute("fill", HAIR_COLORS[i]);
    const joy = document.getElementById("joystick" + (i + 1));
    const knob = document.getElementById("knob" + (i + 1));
    const label = document.getElementById("joy-label-p" + (i + 1));
    if (joy) joy.style.borderColor = HOUSE_COLORS[p.house];
    if (knob) knob.style.background = HOUSE_COLORS[p.house];
    if (label) label.textContent = p.name || "Gracz";
  });

  // Joysticki i pole gry
  const joysticksEl = document.getElementById("joysticks");
  joysticksEl.classList.remove("hidden");
  joysticksEl.classList.toggle("solo", playerCount === 1);
  field.classList.add("with-joysticks");

  document.getElementById("intro").classList.add("hidden");
  document.getElementById("result").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  const rect = field.getBoundingClientRect();
  fieldW = rect.width;
  fieldH = rect.height;

  // Pozycje startowe
  const startPositions = [
    { x: fieldW * 0.15, y: fieldH * 0.5 },
    { x: fieldW * 0.85 - 80, y: fieldH * 0.5 },
    { x: fieldW * 0.5 - 40, y: fieldH * 0.15 },
    { x: fieldW * 0.5 - 40, y: fieldH * 0.85 - 40 },
  ];
  players.forEach((p, i) => {
    p.x = startPositions[i].x;
    p.y = startPositions[i].y;
  });

  snitchX = fieldW * 0.5 - 27;
  snitchY = fieldH * 0.3;
  pickNewSnitchTarget();

  snitchEl.classList.remove("caught");
  snitchEl.style.opacity = "1";
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
  const pad = 25;
  snitchTargetX = pad + Math.random() * (fieldW - 55 - pad * 2);
  snitchTargetY = pad + Math.random() * (fieldH - 28 - pad * 2);
}

function snitchFleeFrom(px, py) {
  const dx = snitchX - px;
  const dy = snitchY - py;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 100) {
    const angle = Math.atan2(dy, dx);
    const flee = 100 + Math.random() * 80;
    snitchTargetX = Math.max(20, Math.min(fieldW - 75, snitchX + Math.cos(angle) * flee));
    snitchTargetY = Math.max(20, Math.min(fieldH - 48, snitchY + Math.sin(angle) * flee));
  }
}

function gameLoop() {
  if (!gameRunning) return;

  // Ruch graczy
  players.forEach((p) => {
    let dx = 0;
    const keys = p.keys;
    const joy = p.joystick;
    const spd = difficulty.playerSpeed;

    if (keys.left || keys.right || keys.up || keys.down) {
      let kx = 0, ky = 0;
      if (keys.left) kx -= spd;
      if (keys.right) kx += spd;
      if (keys.up) ky -= spd;
      if (keys.down) ky += spd;
      if (kx !== 0 && ky !== 0) { kx *= 0.707; ky *= 0.707; }
      p.x += kx; p.y += ky;
      dx = kx;
    } else if (joy.active) {
      p.x += joy.dx * spd;
      p.y += joy.dy * spd;
      dx = joy.dx;
    }

    p.x = Math.max(0, Math.min(fieldW - 80, p.x));
    p.y = Math.max(0, Math.min(fieldH - 40, p.y));

    // Kierunek
    if (dx < -0.1) p.el.classList.add("facing-left");
    else if (dx > 0.1) p.el.classList.remove("facing-left");

    // Znicz ucieka
    snitchFleeFrom(p.x + 40, p.y + 20);
  });

  // Ruch znicza
  const sdx = snitchTargetX - snitchX;
  const sdy = snitchTargetY - snitchY;
  const sDist = Math.sqrt(sdx * sdx + sdy * sdy);
  if (sDist > 2) {
    snitchX += (sdx / sDist) * snitchSpeed;
    snitchY += (sdy / sDist) * snitchSpeed;
  } else {
    pickNewSnitchTarget();
  }

  // Kolizje
  if (snitchCatchable) {
    let closestIdx = -1, closestDist = Infinity;
    players.forEach((p, i) => {
      const d = distToSnitch(p.x, p.y);
      if (d < CATCH_DISTANCE && d < closestDist) {
        closestDist = d; closestIdx = i;
      }
    });
    if (closestIdx >= 0) {
      players[closestIdx].score++;
      document.getElementById("score-val-" + closestIdx).textContent = players[closestIdx].score;
      onCatch();
    }
  }

  updatePositions();
  animFrameId = requestAnimationFrame(gameLoop);
}

function distToSnitch(px, py) {
  const cx = (px + 40) - (snitchX + 27);
  const cy = (py + 20) - (snitchY + 14);
  return Math.sqrt(cx * cx + cy * cy);
}

function onCatch() {
  snitchCatchable = false;
  spawnSparks(snitchX + 27, snitchY + 14);

  catchEffect.style.left = snitchX + 15 + "px";
  catchEffect.style.top = snitchY - 10 + "px";
  catchEffect.classList.remove("show");
  void catchEffect.offsetWidth;
  catchEffect.classList.add("show");

  snitchEl.classList.add("caught");
  snitchSpeed += difficulty.speedIncrease;

  clearInterval(snitchChangeTimer);
  const totalCatches = players.reduce((s, p) => s + p.score, 0);
  const newInterval = Math.max(600, difficulty.changeInterval - totalCatches * 40);
  snitchChangeTimer = setInterval(pickNewSnitchTarget, newInterval);

  setTimeout(() => {
    respawnSnitch();
    snitchEl.classList.remove("caught");
    snitchEl.style.opacity = "1";
    snitchCatchable = true;
  }, 500);
}

function respawnSnitch() {
  for (let attempt = 0; attempt < 20; attempt++) {
    snitchX = 30 + Math.random() * (fieldW - 115);
    snitchY = 30 + Math.random() * (fieldH - 68);
    let tooClose = false;
    for (const p of players) {
      if (Math.sqrt((snitchX - p.x) ** 2 + (snitchY - p.y) ** 2) < 120) {
        tooClose = true; break;
      }
    }
    if (!tooClose) break;
  }
  pickNewSnitchTarget();
}

function updatePositions() {
  players.forEach((p) => {
    p.el.style.left = p.x + "px";
    p.el.style.top = p.y + "px";
  });
  snitchEl.style.left = snitchX + "px";
  snitchEl.style.top = snitchY + "px";
}

// === Sterowanie klawiaturą ===

document.addEventListener("keydown", function (e) {
  if (!gameRunning) return;
  const k = e.key;
  // WASD = Gracz 1
  if (k === "w" || k === "W") { keyStates[0].up = true; e.preventDefault(); }
  if (k === "s" || k === "S") { keyStates[0].down = true; e.preventDefault(); }
  if (k === "a" || k === "A") { keyStates[0].left = true; e.preventDefault(); }
  if (k === "d" || k === "D") { keyStates[0].right = true; e.preventDefault(); }
  // Strzałki = Gracz 2 (multi) lub Gracz 1 (solo)
  const arrowTarget = playerCount > 1 ? keyStates[1] : keyStates[0];
  if (k === "ArrowUp") { arrowTarget.up = true; e.preventDefault(); }
  if (k === "ArrowDown") { arrowTarget.down = true; e.preventDefault(); }
  if (k === "ArrowLeft") { arrowTarget.left = true; e.preventDefault(); }
  if (k === "ArrowRight") { arrowTarget.right = true; e.preventDefault(); }
});

document.addEventListener("keyup", function (e) {
  const k = e.key;
  if (k === "w" || k === "W") keyStates[0].up = false;
  if (k === "s" || k === "S") keyStates[0].down = false;
  if (k === "a" || k === "A") keyStates[0].left = false;
  if (k === "d" || k === "D") keyStates[0].right = false;
  const arrowTarget = playerCount > 1 ? keyStates[1] : keyStates[0];
  if (k === "ArrowUp") arrowTarget.up = false;
  if (k === "ArrowDown") arrowTarget.down = false;
  if (k === "ArrowLeft") arrowTarget.left = false;
  if (k === "ArrowRight") arrowTarget.right = false;
});

// === Joysticki (mysz + dotyk) ===

function setupJoystick(elId, knobId, joystickState) {
  const el = document.getElementById(elId);
  const knob = document.getElementById(knobId);
  if (!el || !knob) return;
  let touchId = null;
  let mouseDown = false;

  function updateKnob(clientX, clientY) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = rect.width / 2 - 12;
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }
    knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    if (dist > 8) {
      joystickState.dx = dx / maxDist;
      joystickState.dy = dy / maxDist;
      joystickState.active = true;
    } else {
      joystickState.dx = 0;
      joystickState.dy = 0;
      joystickState.active = false;
    }
  }

  function resetKnob() {
    knob.style.transform = "translate(-50%, -50%)";
    joystickState.dx = 0;
    joystickState.dy = 0;
    joystickState.active = false;
    touchId = null;
    mouseDown = false;
  }

  el.addEventListener("touchstart", function (e) {
    e.preventDefault();
    const t = e.changedTouches[0];
    touchId = t.identifier;
    updateKnob(t.clientX, t.clientY);
  }, { passive: false });

  el.addEventListener("touchmove", function (e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId) {
        updateKnob(e.changedTouches[i].clientX, e.changedTouches[i].clientY);
        break;
      }
    }
  }, { passive: false });

  el.addEventListener("touchend", function (e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId) {
        resetKnob();
        break;
      }
    }
  }, { passive: false });

  el.addEventListener("touchcancel", function () { resetKnob(); }, { passive: false });

  el.addEventListener("mousedown", function (e) {
    e.preventDefault();
    mouseDown = true;
    updateKnob(e.clientX, e.clientY);
  });
  document.addEventListener("mousemove", function (e) {
    if (!mouseDown) return;
    updateKnob(e.clientX, e.clientY);
  });
  document.addEventListener("mouseup", function () {
    if (mouseDown) resetKnob();
  });
}

for (let i = 0; i < MAX_PLAYERS; i++) {
  setupJoystick("joystick" + (i + 1), "knob" + (i + 1), joysticks[i]);
}

// === Efekty ===

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

// === Koniec gry ===

function endGame() {
  gameRunning = false;
  clearInterval(gameTimer);
  clearInterval(snitchChangeTimer);
  cancelAnimationFrame(animFrameId);

  document.getElementById("game").classList.add("hidden");

  const titleEl = document.getElementById("result-title");
  const scoreText = document.getElementById("result-score-text");
  const msgEl = document.getElementById("result-msg");

  if (playerCount > 1) {
    // Znajdź zwycięzcę
    const sorted = [...players].sort((a, b) => b.score - a.score);
    const winner = sorted[0];
    const isTie = sorted.length > 1 && sorted[0].score === sorted[1].score;

    if (isTie) {
      const tied = sorted.filter((p) => p.score === winner.score);
      titleEl.textContent = "Remis!";
      scoreText.textContent = tied.map((p) => p.name).join(" i ") + " złapali Znicza po " + winner.score + " razy!";
      msgEl.textContent = "Niesamowite! Jesteście równie dobrymi szukającymi!";
    } else {
      titleEl.textContent = winner.name + " wygrywa!";
      scoreText.textContent = players.map((p) => p.name + ": " + p.score).join(" | ");
      msgEl.textContent = "Świetna gra! " + winner.name + " okazał(a) się najlepszym szukającym!";
    }
  } else {
    const p = players[0];
    const name = p.name;
    scoreText.textContent = (name ? name + " złapał(a)" : "Złapałeś") + " Znicza " + p.score + " razy!";

    if (p.score === 0) titleEl.textContent = "Koniec czasu!";
    else if (p.score < 7) titleEl.textContent = "Niezła próba" + (name ? ", " + name : "") + "!";
    else if (p.score < 13) titleEl.textContent = "Świetna gra" + (name ? ", " + name : "") + "!";
    else titleEl.textContent = "NIESAMOWITE" + (name ? ", " + name : "") + "!";

    const msg = messages.find((m) => p.score >= m.min && p.score <= m.max);
    msgEl.textContent = msg ? msg.text : "";
  }

  document.getElementById("result").classList.remove("hidden");
}

function backToIntro() {
  document.getElementById("result").classList.add("hidden");
  document.getElementById("game").classList.add("hidden");
  document.getElementById("intro").classList.remove("hidden");
}
