
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
const wordCoords = [];

// MAPA
const map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

button.addEventListener("click", async () => {
  const word = input.value.trim().toLowerCase();
  const today = getToday();
  if (!word) return alert("Escribe una palabra");

  const last = localStorage.getItem("lastSubmissionDate");
  if (last === today) return alert("Ya enviaste tu palabra de hoy");

  const loc = await fetch("https://ipapi.co/json").then(res => res.json()).catch(() => null);
  const lat = loc?.latitude ?? null;
  const lon = loc?.longitude ?? null;

  wordEntries.push({ word, date: today });
  if (lat && lon) {
    wordCoords.push({ word, lat, lon });
    L.circleMarker([lat, lon], { radius: 6, color: "#4a90e2" }).addTo(map).bindPopup(word);
  }

  try {
    await wordsRef.add({
      word: word,
      date: firebase.firestore.Timestamp.now(),
      lat: lat,
      lon: lon
    });
    localStorage.setItem("lastSubmissionDate", today);
    input.value = "";
    updateWordCloud();
    updateHighlights();
  } catch (e) {
    console.error("Error:", e);
  }
});

shareBtn.addEventListener("click", () => {
  const word = input.value.trim();
  if (!word) return alert("Escribe una palabra antes de compartir");
  const text = `Hoy mi palabra es: "${word}" 🌍 Participá en https://onewordworld.netlify.app`;

  if (navigator.share) {
    navigator.share({ text }).catch(console.error);
  } else {
    navigator.clipboard.writeText(text);
    alert("Copiado para compartir en redes");
  }
});

async function loadWordsFromFirestore() {
  try {
    const snapshot = await wordsRef.get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      const date = data.date.toDate().toISOString().slice(0, 10);
      wordEntries.push({ word: data.word, date });

      if (data.lat && data.lon) {
        L.circleMarker([data.lat, data.lon], { radius: 6, color: "#4a90e2" })
          .addTo(map).bindPopup(data.word);
      }
    });
    updateWordCloud();
    updateHighlights();
  } catch (e) {
    console.error("Error al cargar palabras:", e);
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
  WordCloud(canvas, {
    list: Object.entries(counts),
    gridSize: 8,
    weightFactor: 10,
    fontFamily: "sans-serif",
    color: "random-dark",
    rotateRatio: 0.5,
    backgroundColor: "#f4f4f4",
  });
}

loadWordsFromFirestore();


// === Extras ===
// Detectar idioma automáticamente
function detectLanguage(word) {
  // Simplificado: solo idioma por caracteres comunes
  if (/^[a-zA-Z]+$/.test(word)) return "en";
  if (/^[a-zA-ZñÑáéíóúüÁÉÍÓÚÜ]+$/.test(word)) return "es";
  if (/[一-鿿]/.test(word)) return "zh";
  if (/[Ѐ-ӿ]/.test(word)) return "ru";
  return "unknown";
}

// Mostrar estadísticas
function updateStats() {
  const total = wordEntries.length;
  const unique = new Set(wordEntries.map(e => e.word)).size;
  const langCounts = {};

  wordEntries.forEach(e => {
    const lang = detectLanguage(e.word);
    langCounts[lang] = (langCounts[lang] || 0) + 1;
  });

  const statBox = document.getElementById("stats");
  statBox.innerHTML = `
    <h3>📊 Estadísticas</h3>
    <p>Total de palabras: ${total}</p>
    <p>Palabras únicas: ${unique}</p>
    <p>Idiomas detectados:</p>
    <ul>
      ${Object.entries(langCounts).map(([l,c]) => `<li>${l}: ${c}</li>`).join("")}
    </ul>
  `;
}

function updateAll() {
  updateWordCloud();
  updateHighlights();
  updateStats();
}


// Traducción automática usando API pública gratuita (simulada)
async function translateWord(word, fromLang = "auto", toLang = "en") {
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${fromLang}|${toLang}`);
    const data = await res.json();
    const translated = data.responseData.translatedText;
    document.getElementById("translatedText").innerText = `Traducción al inglés: "${translated}"`;
  } catch (e) {
    console.error("Error al traducir:", e);
    document.getElementById("translatedText").innerText = "No se pudo traducir.";
  }
}

// Traducir al escribir
input.addEventListener("input", () => {
  const word = input.value.trim();
  if (word) translateWord(word);
  else document.getElementById("translatedText").innerText = "Escribe una palabra para ver su traducción automática.";
});
