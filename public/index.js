// HabitBox: simple daily habit tracker
const habitInput = document.getElementById('habitInput');
const saveHabitBtn = document.getElementById('saveHabitBtn');
const setupSection = document.getElementById('setup');
const trackerSection = document.getElementById('tracker');
const habitTitle = document.getElementById('habitTitle');
const markDoneBtn = document.getElementById('markDoneBtn');
const streakDiv = document.getElementById('streak');

const STORAGE_KEY = 'habitbox-data';

function loadData() {
  const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  return {
    habit: data.habit || '',
    records: data.records || {}
  };
}

function saveData(habit, records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ habit, records }));
}

function getTodayKey() {
  return new Date().toISOString().slice(0,10);
}

function renderTracker(habit, records) {
  habitTitle.textContent = habit;
  streakDiv.innerHTML = '';
  const today = new Date();
  for (let i=6; i>=0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0,10);
    const cell = document.createElement('div');
    if (records[key]) cell.classList.add('done');
    streakDiv.appendChild(cell);
  }
}

function init() {
  const { habit, records } = loadData();
  if (habit) {
    setupSection.classList.add('hidden');
    trackerSection.classList.remove('hidden');
    renderTracker(habit, records);
  }
}

saveHabitBtn.addEventListener('click', () => {
  const habit = habitInput.value.trim();
  if (!habit) {
    alert('Escribe tu hábito');
    return;
  }
  saveData(habit, {});
  init();
});

markDoneBtn.addEventListener('click', () => {
  const { habit, records } = loadData();
  const today = getTodayKey();
  records[today] = true;
  saveData(habit, records);
  renderTracker(habit, records);
});

function getTodayKey() {
  return new Date().toISOString().slice(0,10);
}

init();