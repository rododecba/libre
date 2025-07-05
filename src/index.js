// Firebase config placeholder - replace with your config
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "TU_PROYECTO_ID",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "XXXXX",
  appId: "XXXXX"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const wordsRef = db.collection("words");

const input = document.getElementById("wordInput");
const button = document.getElementById("submitBtn");
const canvas = document.getElementById("wordCloud");
const highlights = document.getElementById("highlights");
const mapDiv = document.getElementById("map");
const shareTwitter = document.getElementById("shareTwitter");
const shareInstagram = document.getElementById("shareInstagram");
const shareWhatsApp = document.getElementById("shareWhatsApp");
const authSection = document.getElementById("authSection");
const appSection = document.getElementById("app");
const anonSignIn = document.getElementById("anonSignIn");
const emailSignIn = document.getElementById("emailSignIn");
const emailInput = document.getElementById("emailInput");
const signOut = document.getElementById("signOut");

let wordEntries = [];

// Utils
function getToday() { return new Date().toISOString().slice(0,10); }
async function getGeoInfo() {
  try {
    const res = await fetch("https://ipinfo.io/json?token=3f23dc5e77a349");
    const d = await res.json();
    return { country: d.country||"??", language: navigator.language||"unknown", loc: d.loc };
  } catch { return { country:"??", language:"unknown", loc:"0,0" }; }
}
function updateWordCloud() {
  const counts = {};
  wordEntries.forEach(e=>counts[e.word]=(counts[e.word]||0)+1);
  WordCloud(canvas,{ list: Object.entries(counts), gridSize:8, weightFactor:10, color:"random-dark", backgroundColor:document.body.classList.contains('dark')?'#1e1e1e':'#f5f5f5' });
}
function getTop(filter) {
  const c={};
  wordEntries.filter(e=>filter(e.date)).forEach(e=>c[e.word]=(c[e.word]||0)+1);
  let max="—",mc=0;for(const w in c) if(c[w]>mc){mc=c[w];max=w;} return max;
}
function updateHighlights() {
  const n=new Date(), td=getToday();
  const filters = {
    day: d=>d===td, week: d=>(n-new Date(d))/(1000*3600*24)<=7,
    month: d=>{const x=new Date(d);return x.getMonth()===n.getMonth()&&x.getFullYear()===n.getFullYear();},
    year: d=>new Date(d).getFullYear()===n.getFullYear()
  };
  highlights.innerHTML=`
    <li>🏆 Día: ${getTop(filters.day)}</li>
    <li>📅 Semana: ${getTop(filters.week)}</li>
    <li>📆 Mes: ${getTop(filters.month)}</li>
    <li>🗓️ Año: ${getTop(filters.year)}</li>`;
}
function initMap() {
  const map = L.map(mapDiv).setView([20,0],2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '' }).addTo(map);
  wordEntries.forEach(e=>{
    if(e.loc){
      const [lat,lon]=e.loc.split(',');
      L.circleMarker([lat,lon],{radius:5}).addTo(map).bindPopup(e.word);
    }
  });
}

// Auth
auth.onAuthStateChanged(user=>{
  if(user){ authSection.style.display='none'; appSection.style.display='block'; loadData(); }
  else { authSection.style.display='block'; appSection.style.display='none'; }
});
anonSignIn.onclick=()=>auth.signInAnonymously();
emailSignIn.onclick=()=>auth.signInWithEmailLink(emailInput.value, window.location.href)
signOut.onclick=()=>auth.signOut();

// Load Data
async function loadData(){
  wordEntries=[];
  const sn=await wordsRef.get();
  sn.forEach(doc=>{
    const d=doc.data(), dt=d.date.toDate().toISOString().slice(0,10);
    wordEntries.push({word:d.word,date:dt,country:d.country,language:d.language,loc:d.loc});
  });
  updateWordCloud(); updateHighlights(); initMap();
}

// Submit
button.addEventListener("click",async()=>{
  const w=input.value.trim().toLowerCase(), td=getToday();
  if(!w){alert("Escribe una palabra.");return;}
  const last=localStorage.getItem("lastSubmissionDate");
  if(last===td){alert("Ya enviaste hoy.");return;}
  const geo=await getGeoInfo();
  await wordsRef.add({word:w,date:firebase.firestore.Timestamp.now(),country:geo.country,language:geo.language,loc:geo.loc});
  localStorage.setItem("lastSubmissionDate",td);
  input.value=''; loadData();
});

// Share
shareTwitter.onclick=()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Mi palabra del día: '+input.value)}`);
shareWhatsApp.onclick=()=>window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Mi palabra del día: '+input.value)}`);
// Instagram sharing via URL typically unsupported, use fallback
shareInstagram.onclick=()=>alert("Comparte tu palabra manualmente en Instagram.");

