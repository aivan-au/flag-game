import { countries, packs } from './countries.js';
import { progressionChallenges } from './challenges.js';

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
  // Options
  musicToggle: document.getElementById("music-toggle"),
  voiceToggle: document.getElementById("voice-toggle"),
  autoAdvanceToggle: document.getElementById("auto-advance-toggle"),
  questionsSelect: document.getElementById("questions-select"),
};

// Game Configuration
const CONFIG = {
  totalQuestions: 10,
  flagBasePath: "assets/flags",
  optionRevealDelay: 120,
  winThresholdPercent: 80,
  autoAdvanceDelay: 1000,
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
  voiceEnabled: true,
  autoAdvance: false,
  selectedPack: null,
  results: [], // Track correct/wrong for each question
  gameActive: false, // Track if game is in progress (for cancelling async operations)
  // Progression mode
  isProgression: false,
  progressionChallenge: null, // index into progressionChallenges
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

  // Re-render progression path when returning to start screen
  if (screen === "start" && window.renderProgressionPath) {
    window.renderProgressionPath();
  }
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

  if (state.isProgression) {
    const ch = progressionChallenges[state.progressionChallenge];
    const passed = percentage >= ch.passPercent;

    if (passed) {
      elements.resultIcon.src = "assets/images/cup.png";
      elements.resultTitle.textContent = "Challenge complete!";
      elements.playAgainButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="m12 5 7 7-7 7"></path>
        </svg>
        Continue`;
    } else {
      elements.resultIcon.src = "assets/images/lamp.png";
      elements.resultTitle.textContent = "Not quite — try again!";
      elements.playAgainButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
          <path d="M21 3v5h-5"></path>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
          <path d="M8 16H3v5"></path>
        </svg>
        Try Again`;
    }
  } else {
    // Standard mode
    if (percentage >= CONFIG.winThresholdPercent) {
      elements.resultIcon.src = "assets/images/cup.png";
      elements.resultTitle.textContent = "Congratulations!";
    } else {
      elements.resultIcon.src = "assets/images/lamp.png";
      elements.resultTitle.textContent = "You've learned a lot!";
    }
    // Reset button to default
    elements.playAgainButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
        <path d="M8 16H3v5"></path>
      </svg>
      Play Again`;
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

const getMusicEnabled = () => {
  const saved = localStorage.getItem("musicEnabled");
  return saved === null ? true : saved === "true";
};

const setMusicEnabled = (enabled) => {
  localStorage.setItem("musicEnabled", enabled);
};

const getQuestionsPerRound = () => {
  const saved = localStorage.getItem("questionsPerRound");
  return saved ? parseInt(saved, 10) : 10;
};

const setQuestionsPerRound = (count) => {
  localStorage.setItem("questionsPerRound", count);
  CONFIG.totalQuestions = count;
};

const getVoiceEnabled = () => {
  const saved = localStorage.getItem("voiceEnabled");
  return saved === null ? true : saved === "true";
};

const setVoiceEnabled = (enabled) => {
  localStorage.setItem("voiceEnabled", enabled);
  state.voiceEnabled = enabled;
};

const getAutoAdvance = () => {
  const saved = localStorage.getItem("autoAdvance");
  return saved === "true";
};

const setAutoAdvance = (enabled) => {
  localStorage.setItem("autoAdvance", enabled);
  state.autoAdvance = enabled;
};

const startBackgroundAudio = () => {
  if (audio.background) return;

  const bgAudio = new Audio(AUDIO_SOURCES.background);
  bgAudio.loop = true;
  bgAudio.volume = 1;
  audio.background = bgAudio;

  // Only play if music is enabled in settings
  if (getMusicEnabled()) {
    bgAudio.play().catch(() => {});
  }
};

const toggleBackgroundAudio = (enabled) => {
  setMusicEnabled(enabled);

  if (!audio.background) return;

  if (enabled) {
    audio.background.play().catch(() => {});
  } else {
    audio.background.pause();
  }
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
    sound.addEventListener("pause", finish, { once: true }); // Resolve when stopped externally
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

  // If voice is disabled, show all options immediately
  if (!state.voiceEnabled) {
    buttons.forEach((button) => button.classList.add("show"));
    return;
  }

  const packCodes = new Set(state.selectedPack.codes);

  for (const button of buttons) {
    // Stop if game was exited
    if (!state.gameActive) return;

    await wait(CONFIG.optionRevealDelay);

    // Check again after wait
    if (!state.gameActive) return;

    button.classList.add("show");

    if (state.audioEnabled && packCodes.has(button.dataset.code)) {
      await playAudio(AUDIO_SOURCES.country(button.dataset.code));
    }
  }
};

const nextQuestion = async () => {
  if (state.questionNumber >= CONFIG.totalQuestions) {
    endGame();
    return;
  }

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

    // Stop if game was exited before image loaded
    if (!state.gameActive) return;

    elements.flagImage.classList.remove("hidden");

    if (state.audioEnabled && state.voiceEnabled) {
      await playAudio(AUDIO_SOURCES.question);
    }

    // Check again after audio
    if (!state.gameActive) return;

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
      playAudio(AUDIO_SOURCES.positive); // Don't await - show next button immediately
    }
  } else {
    button.classList.add("wrong");
    if (state.audioEnabled) {
      playAudio(AUDIO_SOURCES.negative); // Don't await - show next button immediately
    }
  }

  // Update progress pip for this question
  updateProgressPip(state.questionNumber - 1, isCorrect);
  state.results.push(isCorrect);

  if (state.autoAdvance && isCorrect) {
    // Auto-advance after delay on correct answer
    setTimeout(() => {
      nextQuestion();
    }, CONFIG.autoAdvanceDelay);
  } else {
    elements.nextButton.classList.remove("hidden");
  }
};

// Progression persistence
const getProgressionCompleted = () => {
  const saved = localStorage.getItem("progressionCompleted");
  return saved ? parseInt(saved, 10) : 0;
};

const setProgressionCompleted = (count) => {
  localStorage.setItem("progressionCompleted", count);
};

const endGame = async () => {
  state.gameActive = false; // Game is over

  // Save progression if passed
  if (state.isProgression) {
    const ch = progressionChallenges[state.progressionChallenge];
    const percentage = (state.score / CONFIG.totalQuestions) * 100;
    const passed = percentage >= ch.passPercent;

    if (passed) {
      const completed = getProgressionCompleted();
      // Only advance if this is the current frontier
      if (state.progressionChallenge === completed) {
        setProgressionCompleted(completed + 1);
      }
    }
  }

  updateEndScreen();
  showScreen("end");

  if (state.audioEnabled) {
    stopAudio();

    const percentage = (state.score / CONFIG.totalQuestions) * 100;
    if (percentage >= CONFIG.winThresholdPercent) {
      playAudio(AUDIO_SOURCES.celebration); // Sound effect - not tied to voice
    }

    if (state.voiceEnabled) {
      await playAudio(AUDIO_SOURCES.score(state.score));
    }
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
  return selected ? selected.dataset.pack : "world";
};

const startGame = () => {
  showScreen("game");

  state.gameActive = true;
  state.isProgression = false;
  state.progressionChallenge = null;
  state.selectedPack = packs[getSelectedPackId()];
  state.pool = getCountryPool();
  state.audioEnabled = state.audioAllowed;

  // Set round size to min of selected option and available countries in pack
  const requestedQuestions = getQuestionsPerRound();
  CONFIG.totalQuestions = Math.min(requestedQuestions, state.pool.length);

  resetGameState();
  nextQuestion();
};

// Start a progression challenge with a specific set of country codes and question count
// Exposed on window so the inline progression script can call it
window.startProgressionChallenge = (challengeIndex) => {
  const ch = progressionChallenges[challengeIndex];
  if (!ch) return;

  showScreen("game");

  state.gameActive = true;
  state.isProgression = true;
  state.progressionChallenge = challengeIndex;
  state.audioAllowed = true;
  startBackgroundAudio();
  state.audioEnabled = state.audioAllowed;

  // Build pool from the provided codes
  const codeSet = new Set(ch.codes);
  state.pool = countries.filter((c) => codeSet.has(c.code));
  state.selectedPack = { codes: ch.codes };

  CONFIG.totalQuestions = Math.min(ch.questionsShown, state.pool.length);

  resetGameState();
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
  state.gameActive = false; // Stop any pending async operations
  stopAudio();
  showScreen("start");
});

elements.playAgainButton.addEventListener("click", () => {
  if (state.isProgression) {
    const ch = progressionChallenges[state.progressionChallenge];
    const percentage = (state.score / CONFIG.totalQuestions) * 100;
    const passed = percentage >= ch.passPercent;

    if (passed) {
      // Continue to next challenge
      const nextIndex = state.progressionChallenge + 1;
      if (nextIndex < progressionChallenges.length) {
        window.startProgressionChallenge(nextIndex);
      } else {
        showScreen("start");
      }
    } else {
      // Retry same challenge
      window.startProgressionChallenge(state.progressionChallenge);
    }
  } else {
    startGame();
  }
});

elements.endExitButton.addEventListener("click", () => {
  showScreen("start");
});

elements.musicToggle.addEventListener("change", (e) => {
  toggleBackgroundAudio(e.target.checked);
});

elements.voiceToggle.addEventListener("change", (e) => {
  setVoiceEnabled(e.target.checked);
});

elements.autoAdvanceToggle.addEventListener("change", (e) => {
  setAutoAdvance(e.target.checked);
});

elements.questionsSelect.addEventListener("click", (e) => {
  const btn = e.target.closest(".segment-btn");
  if (!btn) return;

  elements.questionsSelect.querySelectorAll(".segment-btn").forEach((b) => {
    b.classList.remove("selected");
  });
  btn.classList.add("selected");
  setQuestionsPerRound(parseInt(btn.dataset.value, 10));
});

// Initialize settings from saved preferences
elements.musicToggle.checked = getMusicEnabled();
elements.voiceToggle.checked = getVoiceEnabled();
state.voiceEnabled = getVoiceEnabled();
elements.autoAdvanceToggle.checked = getAutoAdvance();
state.autoAdvance = getAutoAdvance();

// Initialize questions per round
const savedQuestions = getQuestionsPerRound();
CONFIG.totalQuestions = savedQuestions;
elements.questionsSelect.querySelectorAll(".segment-btn").forEach((btn) => {
  btn.classList.toggle("selected", parseInt(btn.dataset.value, 10) === savedQuestions);
});

// ====================================================================
// Options modal
// ====================================================================
document.getElementById('options-btn').addEventListener('click', () => {
  document.getElementById('options-modal').classList.remove('hidden');
});
document.getElementById('close-modal').addEventListener('click', () => {
  document.getElementById('options-modal').classList.add('hidden');
});

// ====================================================================
// Progression mode toggle
// ====================================================================
document.getElementById('progression-toggle').addEventListener('change', (e) => {
  const packGrid = document.getElementById('pack-options');
  const challengePath = document.getElementById('challenge-path');
  const startBtn = document.getElementById('start-btn');

  if (e.target.checked) {
    packGrid.classList.add('hidden');
    challengePath.classList.remove('hidden');
    startBtn.classList.add('hidden');
  } else {
    packGrid.classList.remove('hidden');
    challengePath.classList.add('hidden');
    startBtn.classList.remove('hidden');
  }
});

// ====================================================================
// Progression path rendering
// ====================================================================
(function() {
  const GROUP_SIZE = 5;
  const OFFSET = 60;
  const GROUP_OFFSETS_RIGHT = [0, OFFSET, -OFFSET, OFFSET, 0];
  const GROUP_OFFSETS_LEFT  = [0, -OFFSET, OFFSET, -OFFSET, 0];

  const lockSvg = '<svg class="path-lock" width="14" height="14" viewBox="0 0 24 24" fill="var(--color-muted)" stroke="none"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="var(--color-muted)" stroke-width="2" stroke-linecap="round"/></svg>';

  function makeConnector(fromX, toX) {
    const svgFrom = 60 + (fromX / OFFSET) * 40;
    const svgTo = 60 + (toX / OFFSET) * 40;
    const cpX = (svgFrom + svgTo) / 2;
    return `<div class="path-connector"><svg class="path-line" viewBox="0 0 120 40" preserveAspectRatio="none"><path d="M${svgFrom} 0 Q${cpX} 20 ${svgTo} 40" stroke="var(--color-border)" stroke-width="3" fill="none" stroke-linecap="round"/></svg></div>`;
  }

  const container = document.getElementById('path-container');

  function renderPath() {
    const completed = parseInt(localStorage.getItem('progressionCompleted') || '0', 10);
    let html = '';

    progressionChallenges.forEach((ch, i) => {
      const num = i + 1;
      const isReview = ch.type === 'review';
      const groupIndex = Math.floor(i / GROUP_SIZE);
      const posInGroup = i % GROUP_SIZE;
      const offsets = groupIndex % 2 === 0 ? GROUP_OFFSETS_RIGHT : GROUP_OFFSETS_LEFT;
      const isLastChallenge = i === progressionChallenges.length - 1;
      const thisOffset = (isLastChallenge && isReview) ? 0 : offsets[posInGroup];

      let nodeState;
      if (i < completed) nodeState = 'completed';
      else if (i === completed) nodeState = 'unlocked';
      else nodeState = 'locked';

      if (i > 0 && posInGroup === 0) {
        html += makeConnector(0, 0);
      } else if (i > 0) {
        const prevGroupIndex = Math.floor((i - 1) / GROUP_SIZE);
        const prevOffsets = prevGroupIndex % 2 === 0 ? GROUP_OFFSETS_RIGHT : GROUP_OFFSETS_LEFT;
        const prevIsLast = (i - 1) === progressionChallenges.length - 1;
        const prevChIsReview = progressionChallenges[i - 1].type === 'review';
        const prevOffset = (prevIsLast && prevChIsReview) ? 0 : prevOffsets[(i - 1) % GROUP_SIZE];
        html += makeConnector(prevOffset, thisOffset);
      }

      const extras = [];
      if (nodeState === 'locked') extras.push(lockSvg);

      html += `<div class="path-level ${nodeState}${isReview ? ' review' : ''}" data-level="${num}" style="--offset: ${thisOffset}px">`;
      html += `<div class="path-node">`;
      html += `<span class="path-node-number">${num}</span>`;
      html += extras.join('');
      html += `</div>`;
      html += `</div>`;
    });

    container.innerHTML = html;
  }

  // Initial render
  renderPath();

  // Re-render when returning to start screen so progress is reflected
  window.renderProgressionPath = renderPath;

  container.addEventListener('click', (e) => {
    const level = e.target.closest('.path-level');
    if (!level) return;
    if (level.classList.contains('locked')) return;

    const levelNum = parseInt(level.dataset.level, 10);
    window.startProgressionChallenge(levelNum - 1);
  });
})();

// ====================================================================
// Service Worker Registration
// ====================================================================
if ('serviceWorker' in navigator) {
  const devMode = new URLSearchParams(location.search).has('dev') || import.meta.env.DEV;
  if (devMode) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(r => r.unregister());
    });
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
    console.log('Dev mode: Service worker unregistered, caches cleared');
  } else {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
  }
}
