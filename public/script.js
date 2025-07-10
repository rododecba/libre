// --- Importaciones Firebase ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import {
    getFirestore, collection, addDoc, getDocs,
    query, orderBy, limit, serverTimestamp, where,
    doc, updateDoc
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

// Configuración Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC7MKy2T8CFvpay4FBp8FTrVp8tpU0Niwc",
    authDomain: "libre-c5bf7.firebaseapp.com",
    projectId: "libre-c5bf7",
    storageBucket: "libre-c5bf7.firebasestorage.app",
    messagingSenderId: "339942652190",
    appId: "1:339942652190:web:595ce692456b9df806f10f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let anonymousUserId = localStorage.getItem('anonymousUserId');

async function signInAnonymouslyOnce() {
    if (!anonymousUserId) {
        try {
            const userCredential = await signInAnonymously(auth);
            anonymousUserId = userCredential.user.uid;
            localStorage.setItem('anonymousUserId', anonymousUserId);
        } catch (error) {
            console.error("Auth error:", error);
            anonymousUserId = crypto.randomUUID();
            localStorage.setItem('anonymousUserId', anonymousUserId);
        }
    }
}
signInAnonymouslyOnce();

// DOM elements
const elements = {
    main: document.getElementById('mainSection'),
    featuredPlaceholder: document.getElementById('featuredThoughtPlaceholder'),
    featuredContent: document.getElementById('featuredThoughtContent'),
    nextBtn: document.getElementById('nextThoughtBtn'),
    thoughtInput: document.getElementById('thoughtInput'),
    charCount: document.getElementById('charCount'),
    launchBtn: document.getElementById('launchThoughtBtn'),
    globalCount: document.getElementById('globalThoughtCount'),
    overlays: {
        my: document.getElementById('myThoughtsOverlay'),
        time: document.getElementById('timeCapsuleOverlay'),
        country: document.getElementById('viewByCountryOverlay'),
        about: document.getElementById('aboutOverlay'),
        faq: document.getElementById('faqOverlay')
    },
    cards: {
        my: document.getElementById('myThoughtsCard'),
        view: document.getElementById('viewByCountryCard'),
        time: document.getElementById('timeCapsuleCard')
    },
    closeBtns: {
        my: document.getElementById('closeMyThoughtsBtn'),
        time: document.getElementById('closeTimeCapsuleBtn'),
        view: document.getElementById('closeViewByCountryBtn'),
        about: document.getElementById('closeAboutBtn'),
        faq: document.getElementById('closeFaqBtn')
    },
    timeInput: document.getElementById('timeCapsuleThoughtInput'),
    timeCount: document.getElementById('timeCapsuleCharCount'),
    timeDate: document.getElementById('timeCapsuleDate'),
    launchTimeBtn: document.getElementById('launchTimeCapsuleBtn'),
    lists: {
        my: document.getElementById('myThoughtsList'),
        time: document.getElementById('timeCapsuleList'),
        country: document.getElementById('countryThoughtsList')
    },
    noMsg: {
        my: document.getElementById('noMyThoughtsMessage'),
        time: document.getElementById('noTimeCapsulesMessage'),
        country: document.getElementById('noCountryThoughtsMessage')
    },
    mapContainer: document.getElementById('mapContainer')
};

const MAX_CHAR = 500;

// Utility
async function getCountry() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        return data.country_name || 'Desconocido';
    } catch {
        return 'Desconocido';
    }
}

function showOverlay(key) {
    document.body.style.overflow = 'hidden';
    elements.overlays[key].style.display = 'flex';
}
function hideOverlay(key) {
    elements.overlays[key].style.display = 'none';
    document.body.style.overflow = '';
}

// Event listeners for cards and close buttons
elements.cards.my.addEventListener('click', () => { showOverlay('my'); displayMyThoughts(); });
elements.cards.view.addEventListener('click', () => { showOverlay('country'); updateCountryMap(); });
elements.cards.time.addEventListener('click', () => { showOverlay('time'); displayTimeCapsules(); });
document.getElementById('aboutLink').addEventListener('click', e => { e.preventDefault(); showOverlay('about'); });
document.getElementById('faqLink').addEventListener('click', e => { e.preventDefault(); showOverlay('faq'); });

Object.values(elements.closeBtns).forEach((btn, idx) => {
    const keys = ['my','time','view','about','faq'];
    btn.addEventListener('click', () => hideOverlay(keys[idx]));
});

window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        ['my','time','country','about','faq'].forEach(k => hideOverlay(k));
    }
});

// Input char counts
elements.thoughtInput.addEventListener('input', () => {
    const len = elements.thoughtInput.value.length;
    elements.charCount.textContent = `${len}/${MAX_CHAR}`;
    elements.launchBtn.disabled = len > MAX_CHAR;
    elements.charCount.style.color = len > MAX_CHAR ? 'red':'';
});
elements.nextBtn.addEventListener('click', fetchRandomThought);
elements.launchBtn.addEventListener('click', async () => {
    const text = elements.thoughtInput.value.trim();
    if (!text || text.length > MAX_CHAR) return alert('Texto inválido');
    const country = await getCountry();
    await addThought(text, anonymousUserId, country);
});

// Time capsule events
elements.timeInput.addEventListener('input', () => {
    const len = elements.timeInput.value.length;
    elements.timeCount.textContent = `${len}/${MAX_CHAR}`;
    elements.launchTimeBtn.disabled = len > MAX_CHAR;
    elements.timeCount.style.color = len > MAX_CHAR ? 'red':'';
});
elements.launchTimeBtn.addEventListener('click', async () => {
    const msg = elements.timeInput.value.trim();
    const dt = new Date(elements.timeDate.value);
    if (!msg || msg.length > MAX_CHAR) return alert('Mensaje inválido');
    if (isNaN(dt) || dt <= new Date()) return alert('Fecha inválida');
    await addTimeCapsule(msg, dt, anonymousUserId);
});

// Firebase operations
async function addThought(text, userId, country) {
    try {
        await addDoc(collection(db,'thoughts'), {
            text, timestamp: serverTimestamp(), userId, country,
            expiresAt: new Date(Date.now()+30*24*60*60*1000)
        });
        elements.thoughtInput.value=''; elements.charCount.textContent='0/500';
        updateGlobalCount(); displayMyThoughts(); showOverlay('my');
    } catch(e) { console.error(e); alert('Error al lanzar pensamiento'); }
}

async function fetchRandomThought() {
    elements.featuredPlaceholder.style.display='block';
    elements.featuredContent.textContent='';
    const q = query(collection(db,'thoughts'), where('expiresAt','>',new Date()), orderBy('expiresAt','desc'), limit(100));
    try {
        const snap = await getDocs(q);
        const arr = [];
        snap.forEach(doc=>arr.push(doc.data().text));
        if(arr.length){
            const idx=Math.floor(Math.random()*arr.length);
            elements.featuredPlaceholder.style.display='none';
            elements.featuredContent.textContent=arr[idx];
        } else {
            elements.featuredContent.textContent='Sé el primero en lanzar uno!';
        }
    } catch(e){ console.error(e); elements.featuredContent.textContent='Error cargando'; }
}

async function updateGlobalCount() {
    const q = query(collection(db,'thoughts'), where('expiresAt','>',new Date()));
    const snap = await getDocs(q);
    elements.globalCount.textContent=snap.size;
}

async function displayMyThoughts() {
    elements.lists.my.innerHTML=''; elements.noMsg.my.style.display='block';
    const q = query(
        collection(db,'thoughts'),
        where('userId','==',anonymousUserId),
        where('expiresAt','>',new Date()),
        orderBy('expiresAt','asc'),
        orderBy('timestamp','desc')
    );
    const snap = await getDocs(q);
    if(snap.empty) return;
    elements.noMsg.my.style.display='none';
    snap.forEach(docSnap=>{
        const t=docSnap.data();
        const d=t.timestamp?.toDate()||new Date();
        const div=document.createElement('div');
        div.className='my-thought-item';
        div.innerHTML=`<p>${t.text}</p><span class="my-thought-date">${d.toLocaleString()}</span>`;
        elements.lists.my.appendChild(div);
    });
}

async function addTimeCapsule(message, deployAt, userId) {
    await addDoc(collection(db,'timeCapsules'), {
        message, deployAt, userId, createdAt: serverTimestamp(), opened:false
    });
    elements.timeInput.value=''; elements.timeCount.textContent='0/500'; elements.timeDate.value='';
    displayTimeCapsules();
}

async function displayTimeCapsules() {
    elements.lists.time.innerHTML=''; elements.noMsg.time.style.display='block';
    const q = query(collection(db,'timeCapsules'), where('userId','==',anonymousUserId), orderBy('deployAt','asc'));
    const snap = await getDocs(q);
    const now=new Date();
    snap.forEach(async docSnap=>{
        const c=docSnap.data(), d=c.deployAt.toDate();
        let text, ready=d<=now && !c.opened;
        text=ready ? `(DESPLEGADA): ${c.message}` : `Programada: ${d.toLocaleString()}`;
        const div=document.createElement('div');
        div.className='my-thought-item';
        if(ready) div.classList.add('time-capsule-ready');
        div.innerHTML=`<p>${text}</p>`;
        elements.lists.time.appendChild(div);
        if(ready) await updateDoc(doc(db,'timeCapsules',docSnap.id),{opened:true});
    });
}

let map, markers={}, geoCoords={};
function initMap(){ if(map) map.remove(); map=L.map(elements.mapContainer).setView([0,0],1);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap'}).addTo(map);
}

async function updateCountryMap() {
    initMap();
    const q = query(collection(db,'thoughts'), where('expiresAt','>',new Date()));
    const snap = await getDocs(q);
    const counts={};
    snap.forEach(docSnap=>{ const c=docSnap.data().country||'Desconocido'; counts[c]=(counts[c]||0)+1; });
    Object.values(markers).forEach(m=>m.remove()); markers={};
    for(const country in counts){
        if(country==='Desconocido') continue;
        if(!geoCoords[country]){
            const res=await fetch(`https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(country)}&format=json&limit=1`);
            const data=await res.json();
            if(data[0]) geoCoords[country]=[parseFloat(data[0].lat),parseFloat(data[0].lon)];
        }
        if(geoCoords[country]){
            const [lat,lon]=geoCoords[country], count=counts[country];
            const m=L.marker([lat,lon]).addTo(map).bindPopup(`<b>${country}</b>: ${count}`).on('click',()=>displayCountryThoughts(country));
            markers[country]=m;
        }
    }
}

async function displayCountryThoughts(country){
    elements.lists.country.innerHTML=''; elements.noMsg.country.textContent=`No hay pensamientos de ${country}.`;
    const q = query(
        collection(db,'thoughts'),
        where('country','==',country),
        where('expiresAt','>',new Date()),
        orderBy('expiresAt','asc'),
        orderBy('timestamp','desc')
    );
    const snap=await getDocs(q);
    if(snap.empty) return;
    elements.noMsg.country.style.display='none';
    snap.forEach(docSnap=>{
        const t=docSnap.data(), d=t.timestamp?.toDate()||new Date();
        const div=document.createElement('div');
        div.className='my-thought-item';
        div.innerHTML=`<p>"${t.text}"</p><span class="my-thought-date">${d.toLocaleString()} desde ${t.country}</span>`;
        elements.lists.country.appendChild(div);
    });
}

// Initial calls
fetchRandomThought();
updateGlobalCount();

// Set time capsule min date
const tomorrow=new Date();
tomorrow.setDate(tomorrow.getDate()+1);
elements.timeDate.min = tomorrow.toISOString().slice(0,16);
