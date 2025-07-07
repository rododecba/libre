const habitInput = document.getElementById("habitInput");
const saveHabitBtn = document.getElementById("saveHabitBtn");
const setup = document.getElementById("setup");
const gameSection = document.getElementById("gameSection");
const habitTitle = document.getElementById("habitTitle");
const markDoneBtn = document.getElementById("markDoneBtn");
const message = document.getElementById("message");
const pointsSpan = document.getElementById("points");
const levelSpan = document.getElementById("level");
const streak = document.getElementById("streak");
const shareBtn = document.getElementById("shareBtn");
const suggestions = document.querySelectorAll(".suggestion");

const STORAGE_KEY = "habitbox_game_data";

function loadData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    habit: "",
    points: 0,
    level: 1,
    lastDone: "",
    streakMap: {}
  };
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function calcLevel(points) {
  return Math.floor(points / 10) + 1;
}

function render(data) {
  habitTitle.textContent = data.habit;
  pointsSpan.textContent = data.points;
  levelSpan.textContent = data.level;
  message.textContent = "";
  renderStreak(data.streakMap);
}

function renderStreak(map) {
  streak.innerHTML = "";
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const div = document.createElement("div");
    if (map[key]) div.classList.add("done");
    streak.appendChild(div);
  }
}

saveHabitBtn.addEventListener("click", () => {
  const habit = habitInput.value.trim();
  if (!habit) return alert("Escribe un hábito");
  const data = {
    habit,
    points: 0,
    level: 1,
    lastDone: "",
    streakMap: {}
  };
  saveData(data);
  setup.classList.add("hidden");
  gameSection.classList.remove("hidden");
  render(data);
});

suggestions.forEach(btn => {
  btn.addEventListener("click", () => {
    habitInput.value = btn.textContent;
  });
});

markDoneBtn.addEventListener("click", () => {
  const data = loadData();
  const today = getTodayKey();
  if (data.lastDone === today) {
    message.textContent = "Ya marcaste hoy 👍";
    return;
  }
  data.points += 1;
  data.level = calcLevel(data.points);
  data.lastDone = today;
  data.streakMap[today] = true;
  message.textContent = "¡Sumaste +1 punto! 🎉";
  saveData(data);
  render(data);
});

shareBtn.addEventListener("click", () => {
  const data = loadData();
  const text = `🌟 Estoy en el nivel ${data.level} en HabitBox con mi hábito: "${data.habit}". ¡Desafíate tú también! 🚀`;
  if (navigator.share) {
    navigator.share({ text, url: window.location.href });
  } else {
    navigator.clipboard.writeText(text);
    alert("Texto copiado para compartir 📋");
  }
});

(function init() {
  const data = loadData();
  if (data.habit) {
    setup.classList.add("hidden");
    gameSection.classList.remove("hidden");
    render(data);
  }
})();