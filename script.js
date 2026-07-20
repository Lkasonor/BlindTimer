const startStopButton = document.querySelector("#startStopButton");
const resetButton = document.querySelector("#resetButton");
const revealButton = document.querySelector("#revealButton");
const targetControls = document.querySelector("#targetControls");
const targetAdjustButtons = document.querySelectorAll(".target-adjust");
const targetMinutesDisplay = document.querySelector("#targetMinutes");
const targetSecondsDisplay = document.querySelector("#targetSeconds");
const targetHundredthsDisplay = document.querySelector("#targetHundredths");
const revealPanel = document.querySelector("#revealPanel");
const secretTimer = document.querySelector("#secretTimer");
const targetDisplay = document.querySelector("#targetDisplay");
const deltaDisplay = document.querySelector("#deltaDisplay");

const targetTime = {
  minutes: 0,
  seconds: 0,
  hundredths: 0,
};

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

function formatDelta(milliseconds) {
  const sign = milliseconds < 0 ? "-" : "+";

  return `${sign}${formatTime(Math.abs(milliseconds))}`;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getTargetTime() {
  return (
    targetTime.minutes * 60 * 1000 +
    targetTime.seconds * 1000 +
    targetTime.hundredths * 10
  );
}

function renderTargetControls() {
  targetMinutesDisplay.textContent = String(targetTime.minutes).padStart(2, "0");
  targetSecondsDisplay.textContent = String(targetTime.seconds).padStart(2, "0");
  targetHundredthsDisplay.textContent = String(targetTime.hundredths).padStart(2, "0");
}

function adjustTargetTime(unit, change) {
  if (unit === "minutes") {
    targetTime.minutes = clamp(targetTime.minutes + change, 0, 99);
  } else if (unit === "seconds") {
    targetTime.seconds = clamp(targetTime.seconds + change, 0, 59);
  } else if (unit === "hundredths") {
    targetTime.hundredths = clamp(targetTime.hundredths + change, 0, 99);
  }

  renderTargetControls();
  renderTimer();
}

function renderTimer() {
  const elapsedTime = getElapsedTime();
  const selectedTargetTime = getTargetTime();

  secretTimer.textContent = formatTime(elapsedTime);
  targetDisplay.textContent = formatTime(selectedTargetTime);
  deltaDisplay.classList.remove("is-over", "is-under");

  const delta = elapsedTime - selectedTargetTime;
  deltaDisplay.textContent = `DELTA ${formatDelta(delta)}`;

  if (delta !== 0) {
    deltaDisplay.classList.add(delta > 0 ? "is-over" : "is-under");
  }
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

targetAdjustButtons.forEach((button) => {
  button.addEventListener("click", () => {
    adjustTargetTime(button.dataset.targetUnit, Number(button.dataset.change));
  });
});

revealButton.addEventListener("click", () => {
  setRevealMode(!isRevealed);
});

renderTargetControls();
renderTimer();
