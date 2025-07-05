
// Firebase setup
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

// DOM elements
const input = document.getElementById("wordInput");
const submitBtn = document.getElementById("submitBtn");
const shareBtn = document.getElementById("shareBtn");
const canvas = document.getElementById("wordCloud");
const highlights = document.getElementById("highlights");
const inspirationEl = document.getElementById("inspiration");
const translatedText = document.getElementById("translatedText");
const bloomEl = document.getElementById("wordAnimation");
const mapDiv = document.getElementById("map");

// Data
let wordEntries = [];

// Initialize map
const map = L.map(mapDiv).setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Inspirational quotes
const quotes = [
  "La esperanza es la memoria del corazón.",
  "Una palabra puede cambiar un día entero.",
  "La magia sucede cuando compartes tu voz.",
  "Cada palabra es un pequeño universo."
];
function pickInspiration() {
  const q = quotes[Math.floor(Math.random()*quotes.length)];
  inspirationEl.textContent = `"${q}"`;
}

// Utilities
function getToday() { return new Date().toISOString().slice(0,10); }
async function translateWord(word) {
  if (!word) { translatedText.textContent = ""; return; }
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=auto|en`);
    const data = await res.json();
    translatedText.textContent = `Traducción: "${data.responseData.translatedText}"`;
  } catch {
    translatedText.textContent = "Traducción no disponible.";
  }
}
function updateWordCloud() {
  const counts = {};
  wordEntries.forEach(e => counts[e.word] = (counts[e.word]||0)+1);
  WordCloud(canvas, { list: Object.entries(counts), gridSize:8, weightFactor:10, color:'random-dark', backgroundColor: document.body.matches('(prefers-color-scheme: dark)')?'#1e1e1e':'#f9fafc' });
}
function getTopWord(filterFn) {
  const counts = {};
  wordEntries.filter(e=>filterFn(e.date)).forEach(e=> counts[e.word]=(counts[e.word]||0)+1 );
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||"—";
}
function updateHighlights() {
  const now = new Date();
  const isToday = d=>d===getToday();
  const isWeek = d=> (now-new Date(d))/(1000*60*60*24)<=7;
  const isMonth = d=> new Date(d).getMonth()===now.getMonth();
  const isYear = d=> new Date(d).getFullYear()===now.getFullYear();
  document.getElementById('topDay').textContent = getTopWord(isToday);
  document.getElementById('topWeek').textContent = getTopWord(isWeek);
  document.getElementById('topMonth').textContent = getTopWord(isMonth);
  document.getElementById('topYear').textContent = getTopWord(isYear);
}
async function loadWords() {
  wordEntries = [];
  const snap = await wordsRef.get();
  snap.forEach(doc=>{
    const d = doc.data();
    const date = d.date.toDate().toISOString().slice(0,10);
    wordEntries.push({ word: d.word, date, lat: d.lat, lon: d.lon });
    if (d.lat && d.lon) {
      L.circleMarker([d.lat,d.lon],{radius:5,color:'#0077ff'}).addTo(map).bindPopup(d.word);
    }
  });
  updateWordCloud();
  updateHighlights();
  pickInspiration();
}

// Bloom animation
function bloom() {
  bloomEl.classList.remove('hidden');
  bloomEl.style.opacity = '0';
  bloomEl.style.display = 'block';
  setTimeout(()=> bloomEl.classList.remove('hidden'), 10);
  setTimeout(()=> bloomEl.classList.add('hidden'), 2000);
}

// Submit logic
submitBtn.addEventListener('click', async ()=>{
  const word = input.value.trim().toLowerCase();
  const today = getToday();
  if (!word) return alert('Escribe una palabra');
  if (localStorage.getItem('lastSubmissionDate')===today) return alert('Ya enviaste tu palabra de hoy');
  // Get location
  let lat, lon;
  try {
    const loc = await fetch('https://ipapi.co/json').then(r=>r.json());
    lat = loc.latitude; lon = loc.longitude;
  } catch { lat=lon=null; }
  bloom();
  translateWord(word);
  wordEntries.push({ word, date: today });
  if (lat&&lon) L.circleMarker([lat,lon],{radius:5,color:'#0077ff'}).addTo(map).bindPopup(word);
  await wordsRef.add({ word, date: firebase.firestore.Timestamp.now(), lat, lon });
  localStorage.setItem('lastSubmissionDate', today);
  input.value='';
  updateWordCloud();
  updateHighlights();
});

// Real-time translation on input
input.addEventListener('input', ()=> translateWord(input.value.trim()));

// Share
shareBtn.addEventListener('click', ()=>{
  const text = `Hoy mi palabra es: "${input.value.trim()}" 🌍 https://onewordworld.netlify.app`;
  if (navigator.share) navigator.share({ text }).catch(()=>{});
  else { navigator.clipboard.writeText(text); alert('Texto copiado al portapapeles'); }
});

// Initialize
loadWords();
