
const firebaseConfig = {
  apiKey: "AIzaSyBSxBLk7ugyWXhBhjCsMkEhzDgeotVmJoY",
  authDomain: "onewordworld-1d967.firebaseapp.com",
  projectId: "onewordworld-1d967",
  storageBucket: "onewordworld-1d967.appspot.com",
  messagingSenderId: "382515045282",
  appId: "1:382515045282:web:b3554f189ec575198888fb"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const wordsRef = db.collection("words");

const input = document.getElementById("wordInput");
const button = document.getElementById("submitBtn");
const shareBtn = document.getElementById("shareBtn");
const canvas = document.getElementById("wordCloud");
const highlights = document.getElementById("highlights");

const wordEntries = [];

button.addEventListener("click", async () => {
  const word = input.value.trim().toLowerCase();
  const today = getToday();
  if (!word) {
    alert("Escribe una palabra");
    return;
  }

  const last = localStorage.getItem("lastSubmissionDate");
  if (last === today) {
    alert("Ya enviaste tu palabra de hoy");
    return;
  }

  wordEntries.push({ word, date: today });

  try {
    await wordsRef.add({
      word: word,
      date: firebase.firestore.Timestamp.now()
    });
    localStorage.setItem("lastSubmissionDate", today);
    input.value = "";
    updateWordCloud();
    updateHighlights();
  } catch (e) {
    alert("Error al guardar palabra");
    console.error(e);
  }
});

shareBtn.addEventListener("click", () => {
  const word = input.value.trim();
  if (!word) {
    alert("Primero escribe una palabra para compartir.");
    return;
  }

  const shareText = `Hoy mi palabra es: "${word}" 🌍 Participá en https://onewordworld.netlify.app`;
  if (navigator.share) {
    navigator.share({ text: shareText })
      .then(() => console.log("✅ Compartido"))
      .catch(err => console.error("❌ No se pudo compartir", err));
  } else {
    navigator.clipboard.writeText(shareText);
    alert("Palabra copiada al portapapeles. ¡Ahora podés pegarla en tus redes!");
  }
});

async function loadWordsFromFirestore() {
  try {
    const snapshot = await wordsRef.get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.date.toDate().toISOString().slice(0, 10);
      wordEntries.push({ word: data.word, date });
    });
    updateWordCloud();
    updateHighlights();
  } catch (e) {
    console.error("Error cargando palabras:", e);
  }
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getTopWord(filterFn) {
  const counts = {};
  wordEntries.filter(e => filterFn(e.date)).forEach(e => {
    counts[e.word] = (counts[e.word] || 0) + 1;
  });

  return Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || "—";
}

function updateHighlights() {
  const now = new Date();
  const isToday = d => d === getToday();
  const isThisWeek = d => (now - new Date(d)) / (1000*60*60*24) <= 7;
  const isThisMonth = d => new Date(d).getMonth() === now.getMonth();
  const isThisYear = d => new Date(d).getFullYear() === now.getFullYear();

  highlights.innerHTML = `
    <li>🏆 Hoy: ${getTopWord(isToday)}</li>
    <li>📅 Semana: ${getTopWord(isThisWeek)}</li>
    <li>📆 Mes: ${getTopWord(isThisMonth)}</li>
    <li>🗓️ Año: ${getTopWord(isThisYear)}</li>
  `;
}

function updateWordCloud() {
  const counts = {};
  wordEntries.forEach((e) => {
    counts[e.word] = (counts[e.word] || 0) + 1;
  });

  const wordArray = Object.entries(counts);

  WordCloud(canvas, {
    list: wordArray,
    gridSize: 8,
    weightFactor: 10,
    fontFamily: "sans-serif",
    color: "random-dark",
    rotateRatio: 0.5,
    backgroundColor: "#f4f4f4",
  });
}

loadWordsFromFirestore();
