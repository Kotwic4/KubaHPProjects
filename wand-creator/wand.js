// === Dane różdżek ===

const woods = [
  { id: "akacja", name: "Akacja", desc: "Kapryśna i wierna tylko jednemu właścicielowi. Nie da się jej oszukać.", color: "#c8a070", traits: { creative: 2, ambitious: 1 } },
  { id: "buk", name: "Buk", desc: "Szuka osób otwartych na świat i nowe doświadczenia.", color: "#d4b896", traits: { wise: 2, creative: 1 } },
  { id: "cedr", name: "Cedr", desc: "Wybiera bystrzaków, którzy potrafią dostrzec to, czego inni nie widzą.", color: "#b5845a", traits: { wise: 2, brave: 1 } },
  { id: "cis", name: "Cis", desc: "Potężna i tajemnicza. Może służyć zarówno bohaterom, jak i łotrom.", color: "#6b3a3a", traits: { ambitious: 2, brave: 1 } },
  { id: "dab", name: "Dąb", desc: "Niezwykle lojalna — oczekuje tego samego od swojego właściciela.", color: "#8b6c42", traits: { loyal: 2, brave: 1 } },
  { id: "grab", name: "Grab", desc: "Wybiera pasjonatów z wielką wizją. Raz wybrany, służy do końca.", color: "#a08060", traits: { ambitious: 2, loyal: 1 } },
  { id: "heban", name: "Heban", desc: "Elegancka i potężna. Pasuje do osób, które wierzą w siebie.", color: "#2a1a0a", traits: { brave: 1, ambitious: 2 } },
  { id: "jarzebina", name: "Jarzębina", desc: "Pozwala rzucać niezwykle silne zaklęcia ochronne. Wybiera osoby o wielkim sercu.", color: "#c09070", traits: { kind: 2, brave: 1 } },
  { id: "jawor", name: "Jawor", desc: "Idealna dla poszukiwaczy przygód. Nudzi się przy zwykłych zaklęciach.", color: "#d4b078", traits: { brave: 2, creative: 1 } },
  { id: "klon", name: "Klon", desc: "Dla podróżników i tych, którzy nigdy się nie poddają.", color: "#c8a060", traits: { brave: 1, loyal: 2 } },
  { id: "modrzew", name: "Modrzew", desc: "Dodaje pewności siebie. Świetna dla tych, którzy jeszcze odkrywają swój talent.", color: "#b8945a", traits: { kind: 1, creative: 2 } },
  { id: "ostrokrzew", name: "Ostrokrzew", desc: "Dla odważnych, którym pisane jest stawić czoła wielkim wyzwaniom.", color: "#7a5030", traits: { brave: 2, loyal: 1 } },
  { id: "sekwoja", name: "Sekwoja", desc: "Uważana za przynoszącą szczęście tym, którzy podejmują mądre decyzje.", color: "#9a5a3a", traits: { wise: 1, kind: 2 } },
  { id: "wierzba", name: "Wierzba", desc: "Ma moc uzdrawiania. Często wybiera osoby, w których drzemie ukryty potencjał.", color: "#a0b070", traits: { kind: 2, wise: 1 } },
  { id: "wisnia", name: "Wiśnia", desc: "Bardzo rzadka i piękna. Kryje w sobie ogromną, nieprzewidywalną moc.", color: "#8a3040", traits: { creative: 2, ambitious: 1 } },
];

const cores = [
  { id: "jednorozec", name: "Włos jednorożca", desc: "Niezawodny i wierny. Trudno go użyć do złych celów.", color: "#e8e0f0", glow: "rgba(220, 210, 255, 0.6)", traits: { loyal: 2, kind: 1 } },
  { id: "smok", name: "Włókno smoczego serca", desc: "Potężny i szybko się uczy. Świetnie radzi sobie z wymagającą magią.", color: "#ff6040", glow: "rgba(255, 80, 40, 0.5)", traits: { brave: 2, ambitious: 1 } },
  { id: "feniks", name: "Pióro feniksa", desc: "Najrzadszy rdzeń. Zdolny do najpotężniejszej magii, ale wybredny w doborze właściciela.", color: "#ffd060", glow: "rgba(255, 200, 60, 0.6)", traits: { wise: 1, creative: 2 } },
  { id: "wila", name: "Włos wili", desc: "Pełen wdzięku i subtelności. Najlepiej sprawdza się przy zaklęciach uroku.", color: "#c0e0ff", glow: "rgba(180, 220, 255, 0.5)", traits: { creative: 1, kind: 2 } },
  { id: "testral", name: "Włos testrala", desc: "Tajemniczy i niezwykły. Działa najlepiej w rękach kogoś, kto rozumie trudne prawdy.", color: "#808090", glow: "rgba(140, 140, 160, 0.5)", traits: { wise: 2, ambitious: 1 } },
  { id: "waz", name: "Róg rogatego węża", desc: "Rzadki i nieprzewidywalny. Kryje ogromną siłę dla tych, którzy potrafią go okiełznać.", color: "#50a050", glow: "rgba(80, 180, 80, 0.5)", traits: { ambitious: 2, brave: 1 } },
];

const lengths = [
  { id: "short", name: "Krótka (9 cali)", value: "9 cali", desc: "Precyzyjna i skupiona. Idealna do skomplikowanych zaklęć.", traits: { wise: 2, kind: 1 } },
  { id: "medium-short", name: "Średnio-krótka (10 cali)", value: "10 cali", desc: "Zrównoważona z nutą precyzji.", traits: { wise: 1, loyal: 1 } },
  { id: "medium", name: "Średnia (11 cali)", value: "11 cali", desc: "Wszechstronna i niezawodna. Pasuje do wielu stylów magii.", traits: { loyal: 1, kind: 1 } },
  { id: "medium-long", name: "Średnio-długa (12 cali)", value: "12 cali", desc: "Dla pewnych siebie czarodziejów o szerokim repertuarze zaklęć.", traits: { brave: 1, creative: 1 } },
  { id: "long", name: "Długa (13 cali)", value: "13 cali", desc: "Stworzona dla odważnych osobowości, które lubią być w centrum uwagi.", traits: { brave: 2, ambitious: 1 } },
];

const flexibilities = [
  { id: "rigid", name: "Sztywna", desc: "Niezłomna, jak jej właściciel. Idealna dla osób o silnych przekonaniach.", traits: { loyal: 2, brave: 1 } },
  { id: "slight", name: "Lekko elastyczna", desc: "Stabilna, ale potrafi się przystosować gdy trzeba.", traits: { wise: 1, loyal: 1 } },
  { id: "flexible", name: "Elastyczna", desc: "Chętna do współpracy i otwarta na nowe zaklęcia.", traits: { kind: 1, creative: 1 } },
  { id: "very-flexible", name: "Bardzo elastyczna", desc: "Szybko uczy się nowych sztuczek. Dla kreatywnych dusz.", traits: { creative: 2, kind: 1 } },
  { id: "whippy", name: "Giętka", desc: "Nieprzewidywalna i pełna niespodzianek. Dla wolnych duchów.", traits: { creative: 1, ambitious: 2 } },
];

// === Pytania quizu ===

const questions = [
  {
    text: "Ollivander patrzy ci w oczy i pyta: co robisz, gdy twój przyjaciel ma kłopoty?",
    answers: [
      { text: "Biegnę na pomoc, nawet jeśli to ryzykowne!", traits: { brave: 3 } },
      { text: "Szukam mądrego sposobu, żeby mu pomóc", traits: { wise: 3 } },
      { text: "Jestem przy nim i pocieszam go", traits: { kind: 3 } },
      { text: "Wymyślam sprytny plan, żeby rozwiązać problem", traits: { ambitious: 2, creative: 1 } },
    ],
  },
  {
    text: "Jakie magiczne stworzenie chciałbyś spotkać?",
    answers: [
      { text: "Smoka — są potężne i fascynujące!", traits: { brave: 2, ambitious: 1 } },
      { text: "Feniksa — symbol odrodzenia i mądrości", traits: { wise: 2, kind: 1 } },
      { text: "Jednorożca — pięknego i dobrego", traits: { kind: 2, loyal: 1 } },
      { text: "Hipogryfa — dumnego i wolnego", traits: { creative: 2, brave: 1 } },
    ],
  },
  {
    text: "Ollivander podaje ci pudełko. Jaki kolor cię przyciąga?",
    answers: [
      { text: "Złoty — jak blask słońca", traits: { brave: 2, ambitious: 1 } },
      { text: "Srebrny — jak światło księżyca", traits: { wise: 2, creative: 1 } },
      { text: "Zielony — jak las pełen tajemnic", traits: { kind: 1, loyal: 2 } },
      { text: "Fioletowy — jak magia sama w sobie", traits: { creative: 2, ambitious: 1 } },
    ],
  },
  {
    text: "Co najbardziej lubisz robić w wolnym czasie?",
    answers: [
      { text: "Odkrywać nowe miejsca i przeżywać przygody", traits: { brave: 2, creative: 1 } },
      { text: "Czytać książki i poznawać nowe rzeczy", traits: { wise: 3 } },
      { text: "Spędzać czas z rodziną i przyjaciółmi", traits: { kind: 2, loyal: 1 } },
      { text: "Tworzyć coś nowego — rysować, budować, wymyślać", traits: { creative: 3 } },
    ],
  },
  {
    text: "Jaką cechę cenisz w sobie najbardziej?",
    answers: [
      { text: "Odwagę — nie boję się nowych wyzwań", traits: { brave: 3 } },
      { text: "Wierność — zawsze dotrzymuję słowa", traits: { loyal: 3 } },
      { text: "Życzliwość — staram się być miły dla każdego", traits: { kind: 3 } },
      { text: "Pomysłowość — zawsze coś wymyślę", traits: { creative: 2, ambitious: 1 } },
    ],
  },
  {
    text: "Ollivander szepcze: 'Ostatnie pytanie...' Co widzisz, gdy zamykasz oczy?",
    answers: [
      { text: "Siebie stojącego na szczycie góry, patrzącego na świat", traits: { ambitious: 2, brave: 1 } },
      { text: "Wielką bibliotekę pełną tajemnic do odkrycia", traits: { wise: 2, creative: 1 } },
      { text: "Ciepły dom pełen śmiechu i bliskich osób", traits: { kind: 2, loyal: 1 } },
      { text: "Magiczny warsztat, gdzie tworzę niesamowite rzeczy", traits: { creative: 3 } },
    ],
  },
];

// === Stan gry ===

let currentQuestion = 0;
let traitScores = { brave: 0, wise: 0, kind: 0, loyal: 0, creative: 0, ambitious: 0 };
let typewriterTimeout = null;
let isAnimating = false;
let selectedWand = { wood: null, core: null, length: null, flexibility: null };
let customStep = 0;

// === Tryb quiz ===

function startQuiz() {
  currentQuestion = 0;
  traitScores = { brave: 0, wise: 0, kind: 0, loyal: 0, creative: 0, ambitious: 0 };

  document.getElementById("intro").classList.add("hidden");
  document.getElementById("result").classList.add("hidden");
  document.getElementById("custom").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");

  showQuestion();
}

function typewriteQuestion(text, onComplete) {
  const questionEl = document.getElementById("question-text");
  const words = text.split(" ");
  questionEl.innerHTML = "";
  isAnimating = true;

  words.forEach((word) => {
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = word;
    questionEl.appendChild(span);
  });

  const wordSpans = questionEl.querySelectorAll(".word");
  let i = 0;

  function showNextWord() {
    if (i > 0) wordSpans[i - 1].classList.remove("cursor");
    if (i < wordSpans.length) {
      wordSpans[i].classList.add("visible", "cursor");
      i++;
      typewriterTimeout = setTimeout(showNextWord, 100 + Math.random() * 60);
    } else {
      if (wordSpans.length > 0) wordSpans[wordSpans.length - 1].classList.remove("cursor");
      isAnimating = false;
      if (onComplete) onComplete();
    }
  }

  typewriterTimeout = setTimeout(showNextWord, 300);
}

function showQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("progress").style.width =
    ((currentQuestion / questions.length) * 100) + "%";
  document.getElementById("answers").innerHTML = "";

  typewriteQuestion(q.text, () => {
    showAnswers(q.answers);
  });
}

function showAnswers(answersData) {
  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";
  const shuffled = [...answersData].sort(() => Math.random() - 0.5);

  shuffled.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = answer.text;
    btn.onclick = () => {
      if (!isAnimating) selectAnswer(answer.traits);
    };
    answersDiv.appendChild(btn);
    setTimeout(() => btn.classList.add("visible"), index * 150);
  });
}

function selectAnswer(traits) {
  if (typewriterTimeout) clearTimeout(typewriterTimeout);

  for (const [trait, val] of Object.entries(traits)) {
    traitScores[trait] = (traitScores[trait] || 0) + val;
  }
  currentQuestion++;

  if (currentQuestion >= questions.length) {
    const wand = calculateWand(traitScores);
    showResult(wand, true);
  } else {
    showQuestion();
  }
}

function calculateWand(scores) {
  function bestMatch(items) {
    let best = items[0], bestScore = -Infinity;
    for (const item of items) {
      let s = 0;
      for (const [trait, weight] of Object.entries(item.traits)) {
        s += (scores[trait] || 0) * weight;
      }
      // Dodaj losowość żeby wyniki nie były zawsze takie same
      s += Math.random() * 2;
      if (s > bestScore) { bestScore = s; best = item; }
    }
    return best;
  }
  return {
    wood: bestMatch(woods),
    core: bestMatch(cores),
    length: bestMatch(lengths),
    flexibility: bestMatch(flexibilities),
  };
}

// === Tryb własny ===

function startCustom() {
  customStep = 0;
  selectedWand = { wood: null, core: null, length: null, flexibility: null };

  document.getElementById("intro").classList.add("hidden");
  document.getElementById("result").classList.add("hidden");
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("custom").classList.remove("hidden");

  showCustomStep();
}

const customSteps = [
  { key: "wood", title: "Wybierz drewno różdżki", items: () => woods },
  { key: "core", title: "Wybierz rdzeń różdżki", items: () => cores },
  { key: "length", title: "Wybierz długość", items: () => lengths },
  { key: "flexibility", title: "Wybierz elastyczność", items: () => flexibilities },
];

function showCustomStep() {
  const step = customSteps[customStep];
  const items = step.items();

  document.getElementById("custom-progress").style.width =
    (((customStep) / customSteps.length) * 100) + "%";
  document.getElementById("custom-title").textContent = step.title;
  document.getElementById("custom-step-num").textContent =
    "Krok " + (customStep + 1) + " z " + customSteps.length;

  const grid = document.getElementById("option-grid");
  grid.innerHTML = "";

  items.forEach((item) => {
    const card = document.createElement("button");
    card.className = "option-card";
    if (selectedWand[step.key] && selectedWand[step.key].id === item.id) {
      card.classList.add("selected");
    }

    const colorDot = item.color ? `<span class="option-dot" style="background:${item.color}"></span>` : "";
    card.innerHTML = `
      <span class="option-name">${colorDot}${item.name}</span>
      <span class="option-desc">${item.desc}</span>
    `;

    card.onclick = () => {
      selectedWand[step.key] = item;
      grid.querySelectorAll(".option-card").forEach((c) => c.classList.remove("selected"));
      card.classList.add("selected");
      document.getElementById("custom-next").disabled = false;
    };

    grid.appendChild(card);
  });

  const backBtn = document.getElementById("custom-back");
  const nextBtn = document.getElementById("custom-next");
  backBtn.classList.toggle("hidden", customStep === 0);
  nextBtn.textContent = customStep === customSteps.length - 1 ? "Zobacz różdżkę!" : "Dalej";
  nextBtn.disabled = !selectedWand[step.key];
}

function customNext() {
  if (!selectedWand[customSteps[customStep].key]) return;

  if (customStep >= customSteps.length - 1) {
    showResult(selectedWand, false);
  } else {
    customStep++;
    showCustomStep();
  }
}

function customBack() {
  if (customStep > 0) {
    customStep--;
    showCustomStep();
  }
}

// === Wynik ===

function showResult(wand, isQuiz) {
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("custom").classList.add("hidden");

  const resultDiv = document.getElementById("result");
  resultDiv.classList.remove("hidden");

  // Buduj wizualizację różdżki
  buildWandSVG(wand.wood, wand.core);

  // Wypełnij statystyki
  document.getElementById("stat-wood").textContent = wand.wood.name;
  document.getElementById("stat-wood-desc").textContent = wand.wood.desc;
  document.getElementById("stat-core").textContent = wand.core.name;
  document.getElementById("stat-core-desc").textContent = wand.core.desc;
  document.getElementById("stat-length").textContent = wand.length.value || wand.length.name;
  document.getElementById("stat-length-desc").textContent = wand.length.desc;
  document.getElementById("stat-flex").textContent = wand.flexibility.name;
  document.getElementById("stat-flex-desc").textContent = wand.flexibility.desc;

  // Opis quizowy
  const quizMsg = document.getElementById("quiz-message");
  if (isQuiz) {
    quizMsg.classList.remove("hidden");
    quizMsg.textContent = generateQuizMessage(wand);
  } else {
    quizMsg.classList.add("hidden");
  }

  // Animacja statystyk
  document.querySelectorAll(".stat-item").forEach((el, i) => {
    el.style.animationDelay = (0.8 + i * 0.2) + "s";
  });
}

function generateQuizMessage(wand) {
  const dominant = Object.entries(traitScores).sort((a, b) => b[1] - a[1])[0][0];
  const traitNames = {
    brave: "odwaga", wise: "mądrość", kind: "dobroć",
    loyal: "lojalność", creative: "kreatywność", ambitious: "ambicja",
  };
  return "Ollivander uśmiecha się i mówi: \"Ciekawe, bardzo ciekawe... " +
    "Ta różdżka wyczuła w tobie " + traitNames[dominant] +
    ". Drewno " + wand.wood.name.toLowerCase() +
    " z rdzeniem z materiału \"" + wand.core.name.toLowerCase() +
    "\" — to niezwykłe połączenie. Wielkie rzeczy cię czekają!\"";
}

function buildWandSVG(wood, core) {
  const container = document.getElementById("wand-visual");
  const woodColor = wood.color;
  const coreGlow = core.glow;
  const coreColor = core.color;

  // Ciemniejszy wariant koloru drewna
  const darkWood = darkenColor(woodColor, 0.6);
  const lightWood = lightenColor(woodColor, 1.3);

  container.innerHTML = `
    <svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg" class="wand-svg">
      <defs>
        <linearGradient id="woodGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="${lightWood}"/>
          <stop offset="40%" stop-color="${woodColor}"/>
          <stop offset="100%" stop-color="${darkWood}"/>
        </linearGradient>
        <linearGradient id="coreGlowGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="transparent"/>
          <stop offset="30%" stop-color="${coreGlow}"/>
          <stop offset="70%" stop-color="${coreGlow}"/>
          <stop offset="100%" stop-color="transparent"/>
        </linearGradient>
        <filter id="wandGlow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="sparkGlow">
          <feGaussianBlur stdDeviation="2"/>
        </filter>
      </defs>

      <!-- Poświata -->
      <ellipse cx="200" cy="50" rx="180" ry="35" fill="${coreGlow}" opacity="0.15" class="wand-aura"/>

      <!-- Różdżka - główny kształt -->
      <path d="M60 42 L340 47 L342 50 L340 53 L60 58 Z" fill="url(#woodGrad)" stroke="${darkWood}" stroke-width="0.5"/>

      <!-- Rdzeń (wewnętrzna linia) -->
      <line x1="80" y1="50" x2="330" y2="50" stroke="url(#coreGlowGrad)" stroke-width="2" opacity="0.7" class="core-line"/>

      <!-- Rękojeść - pierścienie -->
      <ellipse cx="75" cy="50" rx="4" ry="10" fill="${darkWood}" stroke="${lightWood}" stroke-width="0.5" opacity="0.8"/>
      <ellipse cx="85" cy="50" rx="3" ry="9" fill="${darkWood}" stroke="${lightWood}" stroke-width="0.5" opacity="0.6"/>
      <ellipse cx="93" cy="50" rx="2" ry="8" fill="${darkWood}" stroke="${lightWood}" stroke-width="0.5" opacity="0.4"/>

      <!-- Końcówka rękojeści -->
      <ellipse cx="58" cy="50" rx="6" ry="12" fill="${darkWood}" stroke="${lightWood}" stroke-width="1"/>
      <circle cx="58" cy="50" r="4" fill="${coreColor}" opacity="0.5"/>

      <!-- Iskierka na końcu -->
      <circle cx="345" cy="50" r="4" fill="${coreColor}" opacity="0.9" filter="url(#sparkGlow)" class="wand-tip-spark"/>
      <circle cx="345" cy="50" r="2" fill="white" opacity="0.8" class="wand-tip-spark"/>

      <!-- Małe iskierki -->
      <circle cx="350" cy="44" r="1.5" fill="${coreColor}" opacity="0" class="mini-spark s1"/>
      <circle cx="355" cy="50" r="1" fill="${coreColor}" opacity="0" class="mini-spark s2"/>
      <circle cx="350" cy="56" r="1.5" fill="${coreColor}" opacity="0" class="mini-spark s3"/>
      <circle cx="348" cy="40" r="1" fill="white" opacity="0" class="mini-spark s4"/>
      <circle cx="352" cy="58" r="1" fill="white" opacity="0" class="mini-spark s5"/>
    </svg>
  `;
}

function darkenColor(hex, factor) {
  const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
  const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
  const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor);
  return `rgb(${Math.min(255, r)},${Math.min(255, g)},${Math.min(255, b)})`;
}

function lightenColor(hex, factor) {
  return darkenColor(hex, factor);
}

// === Nawigacja ===

function backToIntro() {
  if (typewriterTimeout) clearTimeout(typewriterTimeout);
  document.getElementById("quiz").classList.add("hidden");
  document.getElementById("custom").classList.add("hidden");
  document.getElementById("result").classList.add("hidden");
  document.getElementById("intro").classList.remove("hidden");
}
