const habitInput = document.getElementById("habitInput");
const addHabitBtn = document.getElementById("addHabitBtn");
const habitList = document.getElementById("habitList");
const suggestions = document.querySelectorAll(".suggestion");

const STORAGE_KEY = "habitbox_multi_data";
let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderHabits() {
  habitList.innerHTML = "";
  data.forEach((habit, index) => {
    const div = document.createElement("div");
    div.className = "habit-item";

    const info = document.createElement("div");
    info.className = "habit-info";
    info.innerHTML = `<span>${habit.icon}</span> <strong>${habit.name}</strong>`;

    const actions = document.createElement("div");
    const btn = document.createElement("button");
    btn.textContent = "✅";
    btn.onclick = () => {
      habit.count++;
      saveData();
      renderHabits();
    };

    const count = document.createElement("span");
    count.className = "done-count";
    count.textContent = `Hecho: ${habit.count}`;

    actions.appendChild(btn);
    actions.appendChild(count);

    div.appendChild(info);
    div.appendChild(actions);
    habitList.appendChild(div);
  });
}

addHabitBtn.addEventListener("click", () => {
  const name = habitInput.value.trim();
  if (!name) return alert("Escribe un hábito");

  data.push({ name, icon: "🌟", count: 0 });
  saveData();
  habitInput.value = "";
  renderHabits();
});

suggestions.forEach(btn => {
  btn.addEventListener("click", () => {
    const name = btn.textContent;
    const icon = btn.dataset.icon || "🌟";
    data.push({ name, icon, count: 0 });
    saveData();
    renderHabits();
  });
});

renderHabits();