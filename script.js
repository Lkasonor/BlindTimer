const startStopButton = document.querySelector("#startStopButton");
const resetButton = document.querySelector("#resetButton");
const revealButton = document.querySelector("#revealButton");
const targetControls = document.querySelector("#targetControls");
const targetInput = document.querySelector("#targetInput");
const revealPanel = document.querySelector("#revealPanel");
const secretTimer = document.querySelector("#secretTimer");
const targetDisplay = document.querySelector("#targetDisplay");
const deltaDisplay = document.querySelector("#deltaDisplay");

let elapsedBeforeStart = 0;
let startedAt = 0;
let isRunning = false;
let isRevealed = false;
let animationFrameId = null;

function getElapsedTime() {
  if (!isRunning) {
    return elapsedBeforeStart;
  }

  return elapsedBeforeStart + Date.now() - startedAt;
}

function formatTime(milliseconds) {
  const totalHundredths = Math.floor(milliseconds / 10);
  const hundredths = totalHundredths % 100;
  const totalSeconds = Math.floor(totalHundredths / 100);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

function parseTargetTime(value) {
  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return null;
  }

  const parts = trimmedValue.split(":");

  if (parts.length > 3) {
    return null;
  }

  const numbers = parts.map((part) => Number(part));

  if (numbers.some((number) => !Number.isFinite(number) || number < 0)) {
    return null;
  }

  let totalSeconds = 0;

  if (numbers.length === 1) {
    totalSeconds = numbers[0];
  } else if (numbers.length === 2) {
    totalSeconds = numbers[0] * 60 + numbers[1];
  } else {
    totalSeconds = numbers[0] * 3600 + numbers[1] * 60 + numbers[2];
  }

  return Math.round(totalSeconds * 1000);
}

function formatDelta(milliseconds) {
  const sign = milliseconds < 0 ? "-" : "+";

  return `${sign}${formatTime(Math.abs(milliseconds))}`;
}

function renderTimer() {
  const elapsedTime = getElapsedTime();
  const targetTime = parseTargetTime(targetInput.value);

  secretTimer.textContent = formatTime(elapsedTime);
  targetDisplay.textContent = targetTime === null ? "--:--.--" : formatTime(targetTime);
  deltaDisplay.classList.remove("is-over", "is-under");

  if (targetTime === null) {
    deltaDisplay.textContent = "DELTA --:--.--";
    return;
  }

  const delta = elapsedTime - targetTime;
  deltaDisplay.textContent = `DELTA ${formatDelta(delta)}`;
  deltaDisplay.classList.add(delta > 0 ? "is-over" : "is-under");
}

function tick() {
  renderTimer();

  if (isRunning) {
    animationFrameId = requestAnimationFrame(tick);
  }
}

function startTimer() {
  startedAt = Date.now();
  isRunning = true;
  startStopButton.textContent = "STOP";
  startStopButton.classList.add("is-running");
  tick();
}

function stopTimer() {
  elapsedBeforeStart = getElapsedTime();
  isRunning = false;
  startStopButton.textContent = "START";
  startStopButton.classList.remove("is-running");

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  renderTimer();
}

function resetTimer() {
  elapsedBeforeStart = 0;
  startedAt = isRunning ? Date.now() : 0;
  renderTimer();
}

function setRevealMode(nextIsRevealed) {
  isRevealed = nextIsRevealed;
  targetControls.hidden = isRevealed;
  startStopButton.hidden = isRevealed;
  revealPanel.hidden = !isRevealed;
  revealButton.textContent = isRevealed ? "Start/Stop" : "Reveal";
  revealButton.setAttribute(
    "aria-label",
    isRevealed ? "Hide timer and show start stop button" : "Reveal secret timer"
  );

  if (isRevealed) {
    renderTimer();
  }
}

startStopButton.addEventListener("click", () => {
  if (isRunning) {
    stopTimer();
    return;
  }

  startTimer();
});

resetButton.addEventListener("click", resetTimer);

revealButton.addEventListener("click", () => {
  setRevealMode(!isRevealed);
});

renderTimer();
