// DOM Elements
const elements = {
  startScreen: document.getElementById("start-screen"),
  gameScreen: document.getElementById("game-screen"),
  endScreen: document.getElementById("end-screen"),
  startButton: document.getElementById("start-btn"),
  packOptions: document.getElementById("pack-options"),
  flagImage: document.getElementById("flag"),
  options: document.getElementById("options"),
  progressBar: document.getElementById("progress-bar"),
  nextButton: document.getElementById("next-btn"),
  exitButton: document.getElementById("exit-btn"),
  playAgainButton: document.getElementById("play-again-btn"),
  endExitButton: document.getElementById("end-exit-btn"),
  // End screen result elements
  resultIcon: document.querySelector(".result-icon"),
  resultTitle: document.querySelector(".result-title"),
  resultScore: document.querySelector(".result-score"),
};

// Game Configuration
const CONFIG = {
  totalQuestions: 10,
  flagBasePath: "assets/flags",
  optionRevealDelay: 120,
  winThreshold: 8,
};

// Audio Configuration
const AUDIO_VOICE_ID = "kPzsL2i3teMYv0FxEYQ6";
const AUDIO_BASE_PATH = `assets/audio/${AUDIO_VOICE_ID}`;
const AUDIO_SOURCES = {
  question: `${AUDIO_BASE_PATH}/question.mp3`,
  positive: "assets/audio/positive.mp3",
  negative: "assets/audio/negative.mp3",
  background: "assets/audio/background.mp3",
  celebration: "assets/audio/celebration.mp3",
  score: (value) => `${AUDIO_BASE_PATH}/score_${value}.mp3`,
  country: (code) => `${AUDIO_BASE_PATH}/${code}.mp3`,
};

// Game State
const state = {
  pool: [],
  usedCodes: new Set(),
  currentAnswer: null,
  questionNumber: 0,
  score: 0,
  isLocked: false,
  audioEnabled: false,
  audioAllowed: false,
  selectedPack: null,
  results: [], // Track correct/wrong for each question
};

// Audio State
const audio = {
  active: null,
  background: null,
};

// Utility Functions
const shuffle = (array) => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// UI Functions
const showScreen = (screen) => {
  elements.startScreen.classList.toggle("hidden", screen !== "start");
  elements.gameScreen.classList.toggle("hidden", screen !== "game");
  elements.endScreen.classList.toggle("hidden", screen !== "end");
};

const initProgressBar = () => {
  elements.progressBar.innerHTML = "";
  state.results = [];
  for (let i = 0; i < CONFIG.totalQuestions; i++) {
    const pip = document.createElement("div");
    pip.className = "progress-pip";
    elements.progressBar.appendChild(pip);
  }
};

const updateProgressPip = (index, isCorrect) => {
  const pips = elements.progressBar.querySelectorAll(".progress-pip");
  if (pips[index]) {
    pips[index].classList.add(isCorrect ? "correct" : "wrong");
  }
};

const updateEndScreen = () => {
  const score = state.score;
  const total = CONFIG.totalQuestions;
  const percentage = (score / total) * 100;

  elements.resultScore.textContent = `${score} / ${total}`;

  if (percentage >= 80) {
    elements.resultIcon.src = "assets/images/cup.png";
    elements.resultTitle.textContent = "Congratulations!";
  } else {
    elements.resultIcon.src = "assets/images/lamp.png";
    elements.resultTitle.textContent = "You've learned a lot!";
  }
};

// Audio Functions
const stopAudio = () => {
  if (audio.active) {
    audio.active.pause();
    audio.active.currentTime = 0;
    audio.active = null;
  }
};

const startBackgroundAudio = () => {
  if (audio.background) return;

  const bgAudio = new Audio(AUDIO_SOURCES.background);
  bgAudio.loop = true;
  bgAudio.volume = 1;
  audio.background = bgAudio;
  bgAudio.play().catch(() => {});
};

const playAudio = (src) =>
  new Promise((resolve) => {
    if (!src || !state.audioEnabled) {
      resolve();
      return;
    }

    const sound = new Audio(src);
    audio.active = sound;

    const finish = () => {
      if (audio.active === sound) {
        audio.active = null;
      }
      resolve();
    };

    sound.addEventListener("ended", finish, { once: true });
    sound.addEventListener("error", finish, { once: true });
    sound.play().catch(finish);
  });

// Game Logic
const getCountryPool = () => {
  const codes = new Set(state.selectedPack.codes);
  return countries.filter((country) => codes.has(country.code));
};

const getRandomCountry = (pool, excludeCodes = []) => {
  const available = pool.filter((country) => !excludeCodes.includes(country.code));
  return available.length > 0 ? getRandomItem(available) : null;
};

const generateOptions = (answer) => {
  const wrongOptions = [];
  const excludeCodes = [answer.code];

  while (wrongOptions.length < 3) {
    const candidate = getRandomCountry(state.pool, excludeCodes);
    if (candidate) {
      wrongOptions.push(candidate);
      excludeCodes.push(candidate.code);
    } else {
      break;
    }
  }

  return shuffle([answer, ...wrongOptions]);
};

const renderOptions = (options) => {
  elements.options.innerHTML = "";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = option.name;
    button.dataset.code = option.code;
    button.addEventListener("click", () => handleGuess(option.code, button));
    elements.options.appendChild(button);
  });
};

const revealOptionsSequentially = async (options) => {
  renderOptions(options);
  const buttons = elements.options.querySelectorAll(".option");
  const packCodes = new Set(state.selectedPack.codes);

  for (const button of buttons) {
    await wait(CONFIG.optionRevealDelay);
    button.classList.add("show");

    if (state.audioEnabled && packCodes.has(button.dataset.code)) {
      await playAudio(AUDIO_SOURCES.country(button.dataset.code));
    }
  }
};

const nextQuestion = async () => {
  if (state.questionNumber >= CONFIG.totalQuestions) return;

  state.questionNumber += 1;
  state.isLocked = false;
  elements.nextButton.classList.add("hidden");
  elements.options.innerHTML = "";
  stopAudio();

  const available = state.pool.filter((country) => !state.usedCodes.has(country.code));
  const answer = getRandomCountry(available);

  if (!answer) {
    console.error("Not enough countries available.");
    return;
  }

  state.currentAnswer = answer;
  state.usedCodes.add(answer.code);

  const options = generateOptions(answer);

  elements.flagImage.classList.add("hidden");
  elements.flagImage.onload = async () => {
    elements.flagImage.onload = null;
    elements.flagImage.classList.remove("hidden");

    if (state.audioEnabled) {
      await playAudio(AUDIO_SOURCES.question);
    }
    await revealOptionsSequentially(options);
  };
  elements.flagImage.src = `${CONFIG.flagBasePath}/${answer.code}.png`;
  elements.flagImage.alt = `Flag of ${answer.name}`;
};

const handleGuess = async (code, button) => {
  if (state.isLocked) return;
  state.isLocked = true;
  stopAudio();

  const buttons = elements.options.querySelectorAll(".option");
  const isCorrect = code === state.currentAnswer.code;

  buttons.forEach((btn) => {
    // Immediately reveal any hidden options
    btn.classList.add("show");
    btn.disabled = true;

    if (btn.dataset.code === state.currentAnswer.code) {
      btn.classList.add("correct");
    } else if (btn !== button) {
      // Mark non-clicked, non-correct options as inactive
      btn.classList.add("inactive");
    }
  });

  if (isCorrect) {
    state.score += 1;
    if (state.audioEnabled) {
      await playAudio(AUDIO_SOURCES.positive);
    }
  } else {
    button.classList.add("wrong");
    if (state.audioEnabled) {
      await playAudio(AUDIO_SOURCES.negative);
    }
  }

  // Update progress pip for this question
  updateProgressPip(state.questionNumber - 1, isCorrect);
  state.results.push(isCorrect);

  if (state.questionNumber >= CONFIG.totalQuestions) {
    endGame();
  } else {
    elements.nextButton.classList.remove("hidden");
  }
};

const endGame = async () => {
  updateEndScreen();
  showScreen("end");

  if (state.audioEnabled) {
    stopAudio();

    if (state.score >= CONFIG.winThreshold) {
      await playAudio(AUDIO_SOURCES.celebration);
    }

    await playAudio(AUDIO_SOURCES.score(state.score));
  }
};

const resetGameState = () => {
  state.usedCodes = new Set();
  state.currentAnswer = null;
  state.questionNumber = 0;
  state.score = 0;
  state.isLocked = false;
  state.results = [];

  elements.options.innerHTML = "";
  elements.nextButton.classList.add("hidden");
  initProgressBar();
};

const getSelectedPackId = () => {
  const selected = elements.packOptions.querySelector(".pack-card.selected");
  return selected ? selected.dataset.pack : "europe";
};

const startGame = () => {
  showScreen("game");
  resetGameState();

  state.selectedPack = packs[getSelectedPackId()];
  state.pool = getCountryPool();
  state.audioEnabled = state.audioAllowed;

  if (state.pool.length < CONFIG.totalQuestions) {
    console.error(`Not enough countries to play ${CONFIG.totalQuestions} rounds.`);
    return;
  }

  nextQuestion();
};

// Event Listeners
elements.nextButton.addEventListener("click", nextQuestion);

elements.packOptions.addEventListener("click", (e) => {
  const button = e.target.closest(".pack-card");
  if (!button) return;

  elements.packOptions.querySelectorAll(".pack-card").forEach((btn) => {
    btn.classList.remove("selected");
  });
  button.classList.add("selected");
});

elements.startButton.addEventListener("click", () => {
  state.audioAllowed = true;
  startBackgroundAudio();
  startGame();
});

elements.exitButton.addEventListener("click", () => {
  stopAudio();
  showScreen("start");
});

elements.playAgainButton.addEventListener("click", () => {
  startGame();
});

elements.endExitButton.addEventListener("click", () => {
  showScreen("start");
});
