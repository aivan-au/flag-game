// DOM Elements
const elements = {
  startScreen: document.getElementById("start-screen"),
  startButton: document.getElementById("start"),
  packOptions: document.getElementById("pack-options"),
  gameSection: document.getElementById("game"),
  message: document.getElementById("message"),
  flagImage: document.getElementById("flag"),
  options: document.getElementById("options"),
  progress: document.getElementById("progress"),
  score: document.getElementById("score"),
  nextButton: document.getElementById("next"),
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
const setMessage = (text) => {
  elements.message.textContent = text;
  elements.message.classList.toggle("hidden", !text);
};

const updateStatus = () => {
  elements.progress.textContent = `${state.questionNumber} / ${CONFIG.totalQuestions}`;
  elements.score.textContent = `Score: ${state.score}`;
};

const showScreen = (screen) => {
  elements.startScreen.classList.toggle("hidden", screen !== "start");
  elements.gameSection.classList.toggle("hidden", screen !== "game");
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
  updateStatus();
  elements.nextButton.classList.add("is-hidden");
  elements.options.innerHTML = "";
  stopAudio();

  const available = state.pool.filter((country) => !state.usedCodes.has(country.code));
  const answer = getRandomCountry(available);

  if (!answer) {
    setMessage("Not enough countries available.");
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
  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.code === state.currentAnswer.code) {
      btn.classList.add("correct");
    }
  });

  const isCorrect = code === state.currentAnswer.code;

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

  updateStatus();

  if (state.questionNumber >= CONFIG.totalQuestions) {
    endGame();
  } else {
    elements.nextButton.classList.remove("is-hidden");
  }
};

const endGame = async () => {
  showScreen("start");
  setMessage(`Your score is ${state.score}/${CONFIG.totalQuestions}`);

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

  updateStatus();
  elements.options.innerHTML = "";
  elements.nextButton.classList.add("is-hidden");
};

const getSelectedPackId = () => {
  const selected = elements.packOptions.querySelector(".pack-option.selected");
  return selected ? selected.dataset.pack : "starter";
};

const startGame = () => {
  setMessage("");
  showScreen("game");
  resetGameState();

  state.selectedPack = packs[getSelectedPackId()];
  state.pool = getCountryPool();
  state.audioEnabled = state.audioAllowed;

  if (state.pool.length < CONFIG.totalQuestions) {
    setMessage(`Not enough countries to play ${CONFIG.totalQuestions} rounds.`);
    return;
  }

  nextQuestion();
};

// Event Listeners
elements.nextButton.addEventListener("click", nextQuestion);

elements.packOptions.addEventListener("click", (e) => {
  const button = e.target.closest(".pack-option");
  if (!button) return;

  elements.packOptions.querySelectorAll(".pack-option").forEach((btn) => {
    btn.classList.remove("selected");
  });
  button.classList.add("selected");
});

elements.startButton.addEventListener("click", () => {
  state.audioAllowed = true;
  startBackgroundAudio();
  startGame();
});
