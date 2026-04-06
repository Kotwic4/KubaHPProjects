const GAME_DURATION = 30;
const CATCH_DISTANCE = 40;

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

const messages = [
  { min: 0, max: 2, text: "Nie martw się, nawet najlepsi szukający zaczynali od zera! Spróbuj ponownie!" },
  { min: 3, max: 6, text: "Niezły początek! Trochę więcej treningu i będziesz jak Harry Potter!" },
  { min: 7, max: 11, text: "Świetnie! Masz talent szukającego! Drużyna Quidditcha byłaby z ciebie dumna!" },
  { min: 12, max: 18, text: "Niesamowite! Złoty Znicz nie ma przed tobą szans! Jesteś mistrzem!" },
  { min: 19, max: Infinity, text: "LEGENDA! Nawet Viktor Krum by ci zazdrościł! Absolutny rekord!" },
];

// Stan gry
let multiMode = false;
let p1House = "gryffindor";
let p2House = "slytherin";
let p1Name = "";
let p2Name = "";
let score1 = 0;
let score2 = 0;
let timeLeft = GAME_DURATION;
let gameTimer = null;
let animFrameId = null;
let difficulty = null;
let gameRunning = false;
let snitchCatchable = true;

// Pozycje graczy
let p1x = 0, p1y = 0;
let p2x = 0, p2y = 0;

// Joysticki
const joystickP1 = { active: false, dx: 0, dy: 0 };
const joystickP2 = { active: false, dx: 0, dy: 0 };

// Znicz
let snitchX = 0, snitchY = 0;
let snitchTargetX = 0, snitchTargetY = 0;
let snitchSpeed = 0;
let snitchChangeTimer = null;

let fieldW = 0, fieldH = 0;

// Klawisze
const keysP1 = { up: false, down: false, left: false, right: false };
const keysP2 = { up: false, down: false, left: false, right: false };

// Elementy DOM
const field = document.getElementById("field");
const player1El = document.getElementById("player1");
const player2El = document.getElementById("player2");
const snitchEl = document.getElementById("snitch");
const scoreEl = document.getElementById("score");
const score2El = document.getElementById("score2");
const timerEl = document.getElementById("timer");
const catchEffect = document.getElementById("catchEffect");

// === Wybór trybu ===
document.getElementById("mode-buttons").addEventListener("pointerdown", function (e) {
  const btn = e.target.closest(".mode-btn");
  if (!btn) return;
  e.preventDefault();
  const mode = btn.dataset.mode;
  multiMode = (mode === "multi");
  document.querySelectorAll(".mode-btn").forEach((b) => b.classList.toggle("selected", b.dataset.mode === mode));

  // Pokaż/ukryj elementy gracza 2
  document.getElementById("p2-house-section").classList.toggle("hidden", !multiMode);
  document.getElementById("p2-name-section").classList.toggle("hidden", !multiMode);
  document.getElementById("preview-p2").classList.toggle("hidden", !multiMode);
  document.getElementById("vs2-text").classList.toggle("hidden", !multiMode);

  // Aktualizuj etykiety
  document.getElementById("p1-name-label").textContent = multiMode ? "Imię gracza 1:" : "Twoje imię:";
  document.getElementById("p1-house-label").textContent = multiMode ? "Gracz 1 - wybierz dom (WASD):" : "Wybierz swój dom:";
  document.getElementById("controls-hint").textContent = multiMode
    ? "Steruj joystickami lub klawiaturą (WASD + Strzałki)"
    : "Steruj joystickiem, strzałkami lub WASD!";
  document.getElementById("preview-label-p1").textContent = multiMode ? "WASD" : "";
  document.getElementById("preview-label-p2").textContent = multiMode ? "Strzałki" : "";
});

// === Wybór domu P1 ===
document.getElementById("house-buttons-p1").addEventListener("pointerdown", function (e) {
  const btn = e.target.closest(".house-btn");
  if (!btn) return;
  e.preventDefault();
  p1House = btn.dataset.house;
  this.querySelectorAll(".house-btn").forEach((b) => b.classList.toggle("selected", b.dataset.house === p1House));
  updatePreview();
});

// === Wybór domu P2 ===
document.getElementById("house-buttons-p2").addEventListener("pointerdown", function (e) {
  const btn = e.target.closest(".house-btn");
  if (!btn) return;
  e.preventDefault();
  p2House = btn.dataset.house;
  this.querySelectorAll(".house-btn").forEach((b) => b.classList.toggle("selected", b.dataset.house === p2House));
  updatePreview();
});

function updatePreview() {
  const c1 = HOUSE_COLORS[p1House];
  const p1svg = document.getElementById("broom-preview-p1");
  p1svg.querySelector(".preview-robe").setAttribute("fill", c1);
  p1svg.querySelector(".preview-scarf").setAttribute("stroke", c1);

  const c2 = HOUSE_COLORS[p2House];
  const p2svg = document.getElementById("broom-preview-p2");
  p2svg.querySelector(".preview-robe").setAttribute("fill", c2);
  p2svg.querySelector(".preview-scarf").setAttribute("stroke", c2);
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
  score1 = 0;
  score2 = 0;
  timeLeft = GAME_DURATION;
  snitchSpeed = difficulty.snitchSpeed;
  gameRunning = true;
  snitchCatchable = true;

  // Odczytaj imiona
  p1Name = document.getElementById("p1-name").value.trim() || (multiMode ? "Gracz 1" : "");
  p2Name = document.getElementById("p2-name").value.trim() || "Gracz 2";

  scoreEl.textContent = "0";
  score2El.textContent = "0";
  timerEl.textContent = GAME_DURATION;
  timerEl.classList.remove("warning");
  keysP1.up = keysP1.down = keysP1.left = keysP1.right = false;
  keysP2.up = keysP2.down = keysP2.left = keysP2.right = false;
  joystickP1.active = false; joystickP1.dx = 0; joystickP1.dy = 0;
  joystickP2.active = false; joystickP2.dx = 0; joystickP2.dy = 0;

  // Pokaż joysticki
  const joysticksEl = document.getElementById("joysticks");
  if (joysticksEl) {
    joysticksEl.classList.remove("hidden");
    field.classList.add("with-joysticks");
    // Resetuj pozycje gałek
    document.getElementById("knob1").style.transform = "translate(-50%, -50%)";
    document.getElementById("knob2").style.transform = "translate(-50%, -50%)";

    // P1 joystick
    document.getElementById("joystick1").style.borderColor = HOUSE_COLORS[p1House];
    document.getElementById("knob1").style.background = HOUSE_COLORS[p1House];
    document.getElementById("joy-label-p1").textContent = multiMode ? p1Name : (p1Name || "Gracz");

    // P2 joystick — pokaż tylko w multi
    document.getElementById("joy-wrapper-p2").classList.toggle("hidden", !multiMode);
    if (multiMode) {
      document.getElementById("joystick2").style.borderColor = HOUSE_COLORS[p2House];
      document.getElementById("knob2").style.background = HOUSE_COLORS[p2House];
      document.getElementById("joy-label-p2").textContent = p2Name;
    }
  }

  // Ustaw etykiety HUD
  document.getElementById("score-label").textContent = multiMode ? p1Name : "Złapane";
  document.getElementById("score2-label").textContent = p2Name;
  document.getElementById("score2-hud").classList.toggle("hidden", !multiMode);

  document.getElementById("intro").classList.add("hidden");
  document.getElementById("result").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");

  // Pokaż/ukryj gracza 2
  player2El.classList.toggle("hidden", !multiMode);

  applyPlayerColors(player1El, p1House);
  if (multiMode) applyPlayerColors(player2El, p2House);

  const rect = field.getBoundingClientRect();
  fieldW = rect.width;
  fieldH = rect.height;

  // Pozycje startowe
  p1x = fieldW * 0.2;
  p1y = fieldH * 0.5;

  if (multiMode) {
    p2x = fieldW * 0.8 - 80;
    p2y = fieldH * 0.5;
  }

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

function movePlayer(px, py, keys, speed) {
  let dx = 0, dy = 0;
  if (keys.left) dx -= speed;
  if (keys.right) dx += speed;
  if (keys.up) dy -= speed;
  if (keys.down) dy += speed;
  if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
  px += dx;
  py += dy;
  px = Math.max(0, Math.min(fieldW - 80, px));
  py = Math.max(0, Math.min(fieldH - 40, py));
  return { x: px, y: py, dx };
}

function gameLoop() {
  if (!gameRunning) return;

  // Ruch gracza 1
  let p1dx = 0;
  if (keysP1.left || keysP1.right || keysP1.up || keysP1.down) {
    const r = movePlayer(p1x, p1y, keysP1, difficulty.playerSpeed);
    p1x = r.x; p1y = r.y; p1dx = r.dx;
  } else if (joystickP1.active) {
    const spd = difficulty.playerSpeed;
    p1x += joystickP1.dx * spd;
    p1y += joystickP1.dy * spd;
    p1x = Math.max(0, Math.min(fieldW - 80, p1x));
    p1y = Math.max(0, Math.min(fieldH - 40, p1y));
    p1dx = joystickP1.dx;
  }

  // Ruch gracza 2 (multi)
  let p2dx = 0;
  if (multiMode) {
    if (keysP2.left || keysP2.right || keysP2.up || keysP2.down) {
      const r = movePlayer(p2x, p2y, keysP2, difficulty.playerSpeed);
      p2x = r.x; p2y = r.y; p2dx = r.dx;
    } else if (joystickP2.active) {
      const spd = difficulty.playerSpeed;
      p2x += joystickP2.dx * spd;
      p2y += joystickP2.dy * spd;
      p2x = Math.max(0, Math.min(fieldW - 80, p2x));
      p2y = Math.max(0, Math.min(fieldH - 40, p2y));
      p2dx = joystickP2.dx;
    }
  }

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

  // Znicz ucieka od graczy
  snitchFleeFrom(p1x + 40, p1y + 20);
  if (multiMode) snitchFleeFrom(p2x + 40, p2y + 20);

  // Kierunek graczy
  if (p1dx < -1) player1El.classList.add("facing-left");
  else if (p1dx > 1) player1El.classList.remove("facing-left");

  if (multiMode) {
    if (p2dx < -1) player2El.classList.add("facing-left");
    else if (p2dx > 1) player2El.classList.remove("facing-left");
  }

  // Kolizje
  if (snitchCatchable) {
    const d1 = distToSnitch(p1x, p1y);
    const d2 = multiMode ? distToSnitch(p2x, p2y) : Infinity;

    if (d1 < CATCH_DISTANCE || d2 < CATCH_DISTANCE) {
      // Kto był bliżej?
      if (d1 <= d2) {
        score1++;
        scoreEl.textContent = score1;
      } else {
        score2++;
        score2El.textContent = score2;
      }
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
  const totalCatches = score1 + score2;
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
  for (let i = 0; i < 20; i++) {
    snitchX = 30 + Math.random() * (fieldW - 115);
    snitchY = 30 + Math.random() * (fieldH - 68);
    const d1 = Math.sqrt((snitchX - p1x) ** 2 + (snitchY - p1y) ** 2);
    const d2 = multiMode ? Math.sqrt((snitchX - p2x) ** 2 + (snitchY - p2y) ** 2) : 999;
    if (d1 > 120 && d2 > 120) break;
  }
  pickNewSnitchTarget();
}

function updatePositions() {
  player1El.style.left = p1x + "px";
  player1El.style.top = p1y + "px";
  if (multiMode) {
    player2El.style.left = p2x + "px";
    player2El.style.top = p2y + "px";
  }
  snitchEl.style.left = snitchX + "px";
  snitchEl.style.top = snitchY + "px";
}

// === Sterowanie ===

document.addEventListener("keydown", function (e) {
  if (!gameRunning) return;
  const k = e.key;
  // WASD = Gracz 1
  if (k === "w" || k === "W") { keysP1.up = true; e.preventDefault(); }
  if (k === "s" || k === "S") { keysP1.down = true; e.preventDefault(); }
  if (k === "a" || k === "A") { keysP1.left = true; e.preventDefault(); }
  if (k === "d" || k === "D") { keysP1.right = true; e.preventDefault(); }
  // Strzałki = Gracz 2 (multi) lub Gracz 1 (solo)
  if (k === "ArrowUp") { (multiMode ? keysP2 : keysP1).up = true; e.preventDefault(); }
  if (k === "ArrowDown") { (multiMode ? keysP2 : keysP1).down = true; e.preventDefault(); }
  if (k === "ArrowLeft") { (multiMode ? keysP2 : keysP1).left = true; e.preventDefault(); }
  if (k === "ArrowRight") { (multiMode ? keysP2 : keysP1).right = true; e.preventDefault(); }
});

document.addEventListener("keyup", function (e) {
  const k = e.key;
  if (k === "w" || k === "W") keysP1.up = false;
  if (k === "s" || k === "S") keysP1.down = false;
  if (k === "a" || k === "A") keysP1.left = false;
  if (k === "d" || k === "D") keysP1.right = false;
  if (k === "ArrowUp") { (multiMode ? keysP2 : keysP1).up = false; }
  if (k === "ArrowDown") { (multiMode ? keysP2 : keysP1).down = false; }
  if (k === "ArrowLeft") { (multiMode ? keysP2 : keysP1).left = false; }
  if (k === "ArrowRight") { (multiMode ? keysP2 : keysP1).right = false; }
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
    const norm = Math.min(dist, maxDist) / maxDist;
    if (dist > 8) {
      joystickState.dx = (dx / Math.max(dist, maxDist)) * norm;
      joystickState.dy = (dy / Math.max(dist, maxDist)) * norm;
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

  // Dotyk
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

  el.addEventListener("touchcancel", function () {
    resetKnob();
  }, { passive: false });

  // Mysz
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

setupJoystick("joystick1", "knob1", joystickP1);
setupJoystick("joystick2", "knob2", joystickP2);

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

  if (multiMode) {
    if (score1 > score2) {
      titleEl.textContent = p1Name + " wygrywa!";
      scoreText.textContent = p1Name + " złapał(a) " + score1 + " razy, " + p2Name + " złapał(a) " + score2 + " razy.";
      msgEl.textContent = "Świetna gra! " + p1Name + " okazał(a) się lepszym szukającym!";
    } else if (score2 > score1) {
      titleEl.textContent = p2Name + " wygrywa!";
      scoreText.textContent = p2Name + " złapał(a) " + score2 + " razy, " + p1Name + " złapał(a) " + score1 + " razy.";
      msgEl.textContent = "Świetna gra! " + p2Name + " okazał(a) się lepszym szukającym!";
    } else {
      titleEl.textContent = "Remis!";
      scoreText.textContent = p1Name + " i " + p2Name + " złapali Znicza po " + score1 + " razy!";
      msgEl.textContent = "Niesamowite! Obaj jesteście równie dobrymi szukającymi!";
    }
  } else {
    const name = p1Name || "Ty";
    scoreText.textContent = (p1Name ? p1Name + " złapał(a)" : "Złapałeś") + " Znicza " + score1 + " razy!";

    if (score1 === 0) titleEl.textContent = "Koniec czasu!";
    else if (score1 < 7) titleEl.textContent = "Niezła próba" + (p1Name ? ", " + p1Name : "") + "!";
    else if (score1 < 13) titleEl.textContent = "Świetna gra" + (p1Name ? ", " + p1Name : "") + "!";
    else titleEl.textContent = "NIESAMOWITE" + (p1Name ? ", " + p1Name : "") + "!";

    const msg = messages.find((m) => score1 >= m.min && score1 <= m.max);
    msgEl.textContent = msg ? msg.text : "";
  }

  document.getElementById("result").classList.remove("hidden");
}

function backToIntro() {
  document.getElementById("result").classList.add("hidden");
  document.getElementById("game").classList.add("hidden");
  document.getElementById("intro").classList.remove("hidden");
}

// Ustaw podgląd na start
updatePreview();
