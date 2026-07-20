const startStopButton = document.querySelector("#startStopButton");
const resetButton = document.querySelector("#resetButton");
const revealButton = document.querySelector("#revealButton");
const targetControls = document.querySelector("#targetControls");
const targetAdjustButtons = document.querySelectorAll(".target-adjust");
const targetValueInputs = document.querySelectorAll(".target-value");
const targetSecondsInput = document.querySelector("#targetSeconds");
const targetHundredthsInput = document.querySelector("#targetHundredths");
const revealPanel = document.querySelector("#revealPanel");
const secretTimer = document.querySelector("#secretTimer");
const targetDisplay = document.querySelector("#targetDisplay");
const deltaDisplay = document.querySelector("#deltaDisplay");

const targetTime = {
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

  return `${String(totalSeconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

function formatTimeOff(milliseconds) {
  const totalHundredths = Math.floor(milliseconds / 10);
  const hundredths = totalHundredths % 100;
  const totalSeconds = Math.floor(totalHundredths / 100);

  return `${totalSeconds}.${String(hundredths).padStart(2, "0")}`;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function wrap(value, minimum, maximum) {
  if (value < minimum) {
    return maximum;
  }

  if (value > maximum) {
    return minimum;
  }

  return value;
}

function getTargetTime() {
  return targetTime.seconds * 1000 + targetTime.hundredths * 10;
}

function renderTargetControls() {
  targetSecondsInput.value = String(targetTime.seconds).padStart(2, "0");
  targetHundredthsInput.value = String(targetTime.hundredths).padStart(2, "0");
}

function adjustTargetTime(unit, change) {
  if (unit === "seconds") {
    targetTime.seconds = wrap(targetTime.seconds + change, 0, 60);
  } else if (unit === "hundredths") {
    targetTime.hundredths = wrap(targetTime.hundredths + change, 0, 99);
  }

  renderTargetControls();
  renderTimer();
}

function updateTargetFromInput(input) {
  const unit = input.dataset.targetUnit;
  const maximum = unit === "seconds" ? 60 : 99;
  const cleanValue = input.value.replace(/\D/g, "").slice(0, 2);

  input.value = cleanValue;
  targetTime[unit] = cleanValue === "" ? 0 : clamp(Number(cleanValue), 0, maximum);

  if (cleanValue !== "" && Number(cleanValue) > maximum) {
    input.value = String(maximum);
  }

  renderTimer();
}

function renderTimer() {
  const elapsedTime = getElapsedTime();
  const selectedTargetTime = getTargetTime();

  secretTimer.textContent = formatTime(elapsedTime);
  targetDisplay.textContent = formatTime(selectedTargetTime);
  deltaDisplay.classList.remove("is-over", "is-under");

  const timeOff = Math.abs(elapsedTime - selectedTargetTime);
  deltaDisplay.textContent = formatTimeOff(timeOff);
  deltaDisplay.classList.add(timeOff < 1000 ? "is-under" : "is-over");
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
  targetTime.seconds = 0;
  targetTime.hundredths = 0;
  renderTargetControls();
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

targetValueInputs.forEach((input) => {
  input.addEventListener("focus", () => {
    input.select();
  });

  input.addEventListener("input", () => {
    updateTargetFromInput(input);
  });

  input.addEventListener("blur", renderTargetControls);
});

revealButton.addEventListener("click", () => {
  setRevealMode(!isRevealed);
});

renderTargetControls();
renderTimer();
