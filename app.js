const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start");
const gameSection = document.getElementById("game");
const messageSection = document.getElementById("message");
const flagImage = document.getElementById("flag");
const optionsContainer = document.getElementById("options");
const progressText = document.getElementById("progress");
const scoreText = document.getElementById("score");
const nextButton = document.getElementById("next");
const restartButton = document.getElementById("restart");

const TOTAL_QUESTIONS = 5;
const FLAG_BASE_PATH = "assets/flags";

const commonCodes = [
  "us",
  "gb",
  "fr",
  "de",
  "it",
  "es",
  "pt",
  "ca",
  "br",
  "ru",
  "ua",
  "kz",
  "jp",
  "cn",
  "kr",
  "in",
  "au",
  "nz",
  "za",
  "fi",
  "tr",
];

const audioEnabledCodes = new Set(commonCodes);
/* aEO01A4wXwd1O8GPgGlF
gJx1vCzNCD1EQHT212Ls
kPzsL2i3teMYv0FxEYQ6
NDTYOmYEjbDIVCKB35i3
KZf6RW0Q3MZ4fvKPhRpt
*/
const audioVoiceId = "kPzsL2i3teMYv0FxEYQ6";
const audioBasePath = `assets/audio/${audioVoiceId}`;
const questionAudioSrc = `${audioBasePath}/question.mp3`;
const positiveAudioSrc = "assets/audio/positive.mp3";
const negativeAudioSrc = "assets/audio/negative.mp3";
const backgroundAudioSrc = "assets/audio/background.mp3";
const celebrationAudioSrc = "assets/audio/celebration.mp3";
const correctAudioSrcs = [
  `${audioBasePath}/correct.mp3`,
  `${audioBasePath}/correct_alt1.mp3`,
  `${audioBasePath}/correct_alt2.mp3`,
];
const incorrectAudioSrc = `${audioBasePath}/incorrect.mp3`;
const congratsAudioSrc = `${audioBasePath}/congrats.mp3`;
const tryAgainAudioSrc = `${audioBasePath}/try_again.mp3`;

const mediumCodes = [
  ...commonCodes,
  "se",
  "no",
  "fi",
  "dk",
  "nl",
  "be",
  "ch",
  "at",
  "pl",
  "cz",
  "gr",
  "tr",
  "ua",
  "ro",
  "hu",
  "ie",
  "is",
  "il",
  "pt",
  "sa",
  "ae",
  "qa",
  "sg",
  "th",
  "vn",
  "ph",
  "my",
  "id",
  "pk",
  "bd",
  "lk",
  "ke",
  "gh",
  "ma",
  "dz",
  "tn",
  "ar",
  "cl",
  "co",
  "pe",
  "ve",
  "uy",
  "bo",
  "cu",
  "do",
  "cr",
  "pa",
  "jm",
  "ir",
  "iq",
  "af",
  "np",
  "mm",
  "kh",
  "la",
  "tw",
  "hk",
  "eg",
  "et",
  "tz",
  "ug",
  "zm",
  "zw",
  "cm",
  "sn",
  "ci",
  "mx",
  "ng",
  "sd",
];

let currentPool = [];
let usedCodes = new Set();
let currentAnswer = null;
let currentQuestion = 0;
let score = 0;
let isLocked = false;
let audioEnabled = false;
let audioAllowed = false;
let activeAudio = null;
let backgroundAudio = null;
let audioDuckCount = 0;
const backgroundVolume = 1;
const backgroundDuckedVolume = 1;

const shuffle = (list) => list.sort(() => Math.random() - 0.5);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const setMessage = (text) => {
  messageSection.textContent = text;
  messageSection.classList.toggle("hidden", !text);
};

const stopAudio = () => {
  if (!activeAudio) {
    return;
  }
  activeAudio.pause();
  activeAudio.currentTime = 0;
  activeAudio = null;
};

const setBackgroundVolume = (value) => {
  if (backgroundAudio) {
    backgroundAudio.volume = value;
  }
};

const startBackgroundAudio = () => {
  if (backgroundAudio) {
    return;
  }
  const audio = new Audio(backgroundAudioSrc);
  audio.loop = true;
  audio.volume = backgroundVolume;
  backgroundAudio = audio;
  audio.play().catch(() => {});
};

const duckBackgroundAudio = () => {
  audioDuckCount += 1;
  setBackgroundVolume(backgroundDuckedVolume);
};

const unduckBackgroundAudio = () => {
  audioDuckCount = Math.max(0, audioDuckCount - 1);
  if (audioDuckCount === 0) {
    setBackgroundVolume(backgroundVolume);
  }
};

const playAudio = (src) =>
  new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }
    const audio = new Audio(src);
    activeAudio = audio;
    const finish = () => {
      if (activeAudio === audio) {
        activeAudio = null;
      }
      unduckBackgroundAudio();
      resolve();
    };
    duckBackgroundAudio();
    audio.addEventListener("ended", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    audio.play().catch(finish);
  });

const getScoreAudioSrc = (value) =>
  `${audioBasePath}/score_${value}.mp3`;

const getRandomCorrectAudioSrc = () => {
  const index = Math.floor(Math.random() * correctAudioSrcs.length);
  return correctAudioSrcs[index];
};

const resetGameState = () => {
  usedCodes = new Set();
  currentAnswer = null;
  currentQuestion = 0;
  score = 0;
  isLocked = false;
  updateStatus();
  optionsContainer.innerHTML = "";
  nextButton.classList.add("is-hidden");
  restartButton.classList.add("is-hidden");
};

const updateStatus = () => {
  progressText.textContent = `${currentQuestion} / ${TOTAL_QUESTIONS}`;
  scoreText.textContent = `Score: ${score}`;
};

const getPoolForLevel = (level) => {
  if (level === 1) {
    return countries.filter((country) => commonCodes.includes(country.code));
  }
  if (level === 2) {
    return countries.filter((country) => mediumCodes.includes(country.code));
  }
  return countries;
};

const getRandomCountry = (pool, excludeCodes = []) => {
  const available = pool.filter(
    (country) => !excludeCodes.includes(country.code)
  );
  return available[Math.floor(Math.random() * available.length)];
};

const renderOptions = (options) => {
  optionsContainer.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "option";
    button.textContent = option.name;
    button.dataset.code = option.code;
    button.addEventListener("click", () => handleGuess(option.code, button));
    optionsContainer.appendChild(button);
  });
};

const revealOptionsSequentially = async (options) => {
  renderOptions(options);
  const buttons = Array.from(optionsContainer.querySelectorAll(".option"));
  for (let index = 0; index < buttons.length; index += 1) {
    const button = buttons[index];
    await wait(120);
    button.classList.add("show");
    if (audioEnabled && audioEnabledCodes.has(button.dataset.code)) {
      await playAudio(`${audioBasePath}/${button.dataset.code}.mp3`);
    }
  }
};

const nextQuestion = async () => {
  if (currentQuestion >= TOTAL_QUESTIONS) {
    return;
  }

  currentQuestion += 1;
  updateStatus();
  nextButton.classList.add("is-hidden");
  isLocked = false;
  stopAudio();
  optionsContainer.innerHTML = "";

  const available = currentPool.filter(
    (country) => !usedCodes.has(country.code)
  );
  const answer = getRandomCountry(available);
  currentAnswer = answer;
  usedCodes.add(answer.code);

  const wrongOptions = [];
  while (wrongOptions.length < 3) {
    const candidate = getRandomCountry(currentPool, [
      answer.code,
      ...wrongOptions.map((item) => item.code),
    ]);
    if (candidate) {
      wrongOptions.push(candidate);
    }
  }

  const options = shuffle([answer, ...wrongOptions]);
  flagImage.classList.add("hidden");
  flagImage.onload = async () => {
    flagImage.classList.remove("hidden");
    if (audioEnabled) {
      await playAudio(questionAudioSrc);
    }
    await revealOptionsSequentially(options);
  };
  flagImage.src = `${FLAG_BASE_PATH}/${answer.code}.png`;
  flagImage.alt = `Flag of ${answer.name}`;
};

const endGame = () => {
  gameSection.classList.add("hidden");
  setMessage(`Your score is ${score}/${TOTAL_QUESTIONS}`);
  nextButton.classList.add("is-hidden");
  restartButton.classList.add("is-hidden");
  startScreen.classList.remove("hidden");
  if (audioEnabled) {
    stopAudio();
    (async () => {
      await playAudio(getScoreAudioSrc(score));
      if (score >= 4) {
        await playAudio(celebrationAudioSrc);
        await playAudio(congratsAudioSrc);
      } else {
        await playAudio(tryAgainAudioSrc);
      }
    })();
  }
};

const handleGuess = async (code, button) => {
  if (isLocked) {
    return;
  }
  isLocked = true;
  stopAudio();

  const buttons = Array.from(optionsContainer.querySelectorAll(".option"));
  buttons.forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.code === currentAnswer.code) {
      btn.classList.add("correct");
    }
  });

  if (code === currentAnswer.code) {
    score += 1;
    if (audioEnabled) {
      await playAudio(positiveAudioSrc);
      await playAudio(getRandomCorrectAudioSrc());
    }
  } else {
    button.classList.add("wrong");
    if (audioEnabled) {
      await playAudio(negativeAudioSrc);
      await playAudio(incorrectAudioSrc);
    }
  }

  updateStatus();

  if (currentQuestion >= TOTAL_QUESTIONS) {
    endGame();
  } else {
    nextButton.classList.remove("is-hidden");
  }
};

const startGame = (level = 1) => {
  setMessage("");
  startScreen.classList.add("hidden");
  gameSection.classList.remove("hidden");
  resetGameState();
  currentPool = getPoolForLevel(level);
  audioEnabled = level === 1 && audioAllowed;
  if (currentPool.length < TOTAL_QUESTIONS) {
    setMessage("Not enough countries in this level to play 10 rounds.");
    return;
  }
  gameSection.classList.remove("hidden");
  nextQuestion();
};

const restartGame = () => {
  startGame(1);
};

nextButton.addEventListener("click", nextQuestion);
restartButton.addEventListener("click", restartGame);
startButton.addEventListener("click", () => {
  audioAllowed = true;
  startBackgroundAudio();
  startGame(1);
});
