const questions = [
  {
    text: "Znajdujesz tajemnicze drzwi w Hogwarcie. Co robisz?",
    answers: [
      { text: "Wchodzę od razu! Przygoda czeka!", house: "gryffindor" },
      { text: "Dokładnie badam drzwi w poszukiwaniu wskazówek i zaklęć", house: "ravenclaw" },
      { text: "Proszę przyjaciela, żeby poszedł ze mną - razem fajniej!", house: "hufflepuff" },
      { text: "Sprawdzam, czy nikt nie patrzy, i wślizguję się do środka", house: "slytherin" },
    ],
  },
  {
    text: "Jakiego magicznego zwierzaka zabrałbyś do Hogwartu?",
    answers: [
      { text: "Odważnego feniksa", house: "gryffindor" },
      { text: "Mądrą sowę", house: "ravenclaw" },
      { text: "Wiernego borsuka", house: "hufflepuff" },
      { text: "Sprytnego węża", house: "slytherin" },
    ],
  },
  {
    text: "Co zobaczyłbyś w Zwierciadle Ain Eingarp?",
    answers: [
      { text: "Siebie jako wielkiego bohatera, ratującego wszystkich", house: "gryffindor" },
      { text: "Siebie odkrywającego wszystkie tajemnice magii", house: "ravenclaw" },
      { text: "Siebie otoczonego szczęśliwymi przyjaciółmi i rodziną", house: "hufflepuff" },
      { text: "Siebie jako najpotężniejszego czarodzieja na świecie", house: "slytherin" },
    ],
  },
  {
    text: "Troll blokuje ci drogę! Jaki masz plan?",
    answers: [
      { text: "Walczę z nim z odwagą w sercu!", house: "gryffindor" },
      { text: "Wymyślam sprytne zaklęcie, żeby go przechytrzyć", house: "ravenclaw" },
      { text: "Próbuję go uspokoić i zaprzyjaźnić się", house: "hufflepuff" },
      { text: "Szukam podstępnego sposobu, żeby go obejść", house: "slytherin" },
    ],
  },
  {
    text: "Które zajęcia w Hogwarcie brzmią najciekawiej?",
    answers: [
      { text: "Obrona przed Czarną Magią", house: "gryffindor" },
      { text: "Zaklęcia i Starożytne Runy", house: "ravenclaw" },
      { text: "Zielarstwo i Opieka nad Magicznymi Stworzeniami", house: "hufflepuff" },
      { text: "Eliksiry", house: "slytherin" },
    ],
  },
  {
    text: "Jaką cechę cenisz najbardziej?",
    answers: [
      { text: "Odwagę - bycie dzielnym nawet gdy się boisz", house: "gryffindor" },
      { text: "Mądrość - naukę i rozumienie świata", house: "ravenclaw" },
      { text: "Dobroć - bycie miłym dla każdego", house: "hufflepuff" },
      { text: "Ambicję - stawanie się najlepszą wersją siebie", house: "slytherin" },
    ],
  },
  {
    text: "Masz wolne popołudnie w Hogwarcie. Gdzie jesteś?",
    answers: [
      { text: "Na zewnątrz, odkrywam okolice Zakazanego Lasu", house: "gryffindor" },
      { text: "W bibliotece, czytam o pradawnych zaklęciach", house: "ravenclaw" },
      { text: "W kuchni, piekę ciasto ze skrzatami domowymi", house: "hufflepuff" },
      { text: "W pokoju wspólnym, planuję coś wielkiego", house: "slytherin" },
    ],
  },
];

const houses = {
  gryffindor: {
    name: "Gryffindor!",
    emoji: "🦁",
    color: "#ae0001",
    description:
      "Twoje miejsce jest w Gryffindorze, gdzie mieszkają odważni duchem! Twoja odwaga, śmiałość i rycerskość wyróżniają cię spośród innych. Tak jak Harry Potter, Hermiona i Ron!",
  },
  hufflepuff: {
    name: "Hufflepuff!",
    emoji: "🦡",
    color: "#ecb939",
    description:
      "Twoje miejsce jest w Hufflepuffie, gdzie cenią sprawiedliwość i lojalność! Twoja cierpliwość, dobroć i pracowitość czynią cię prawdziwym przyjacielem. Tak jak Newt Skamander i Cedrik Diggory!",
  },
  ravenclaw: {
    name: "Ravenclaw!",
    emoji: "🦅",
    color: "#222f5b",
    description:
      "Twoje miejsce jest w Ravenclawie, gdzie ci o bystrym umyśle zawsze znajdą bratnie dusze! Twoja mądrość i kreatywność świecą jasno. Tak jak Luna Lovegood!",
  },
  slytherin: {
    name: "Slytherin!",
    emoji: "🐍",
    color: "#2a623d",
    description:
      "Twoje miejsce jest w Slytherinie, gdzie znajdziesz prawdziwych przyjaciół! Twoja ambicja, spryt i determinacja zaprowadzą cię do wielkości. Tak jak sam Merlin!",
  },
};

let currentQuestion = 0;
let scores = { gryffindor: 0, hufflepuff: 0, ravenclaw: 0, slytherin: 0 };

function startQuiz() {
  currentQuestion = 0;
  scores = { gryffindor: 0, hufflepuff: 0, ravenclaw: 0, slytherin: 0 };

  document.getElementById("intro").classList.add("hidden");
  document.getElementById("result").classList.add("hidden");
  document.getElementById("quiz").classList.remove("hidden");

  showQuestion();
}

function showQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("question-text").textContent = q.text;
  document.getElementById("progress").style.width =
    ((currentQuestion / questions.length) * 100) + "%";

  const answersDiv = document.getElementById("answers");
  answersDiv.innerHTML = "";

  // Mieszamy odpowiedzi żeby nie były zawsze w tej samej kolejności
  const shuffled = [...q.answers].sort(() => Math.random() - 0.5);

  shuffled.forEach((answer) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.textContent = answer.text;
    btn.onclick = () => selectAnswer(answer.house);
    answersDiv.appendChild(btn);
  });
}

function selectAnswer(house) {
  scores[house]++;
  currentQuestion++;

  if (currentQuestion >= questions.length) {
    showResult();
  } else {
    showQuestion();
  }
}

function showResult() {
  document.getElementById("quiz").classList.add("hidden");

  // Znajdujemy dom z najwyższym wynikiem
  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const house = houses[winner];

  const resultDiv = document.getElementById("result");
  resultDiv.className = "screen " + winner;
  resultDiv.classList.remove("hidden");

  document.getElementById("house-crest").textContent = house.emoji;
  document.getElementById("house-name").textContent = house.name;
  document.getElementById("house-description").textContent = house.description;
}

function resetQuiz() {
  document.getElementById("result").classList.add("hidden");
  document.getElementById("intro").classList.remove("hidden");
}
