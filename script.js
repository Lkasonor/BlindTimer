const startStopButton = document.querySelector("#startStopButton");
const resetButton = document.querySelector("#resetButton");
const revealButton = document.querySelector("#revealButton");
const secretTimer = document.querySelector("#secretTimer");

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
  const totalTenths = Math.floor(milliseconds / 100);
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60);

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${tenths}`;
}

function renderTimer() {
  secretTimer.textContent = formatTime(getElapsedTime());
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
  startStopButton.textContent = "Stop";
  startStopButton.classList.add("is-running");
  tick();
}

function stopTimer() {
  elapsedBeforeStart = getElapsedTime();
  isRunning = false;
  startStopButton.textContent = "Start";
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
  startStopButton.hidden = isRevealed;
  secretTimer.hidden = !isRevealed;
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
