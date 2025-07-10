// --- Importaciones Firebase ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, where, doc, updateDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

const firebaseConfig = { /* tu config */ };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let anonymousUserId = localStorage.getItem('anonymousUserId');
async function signInAnonymouslyOnce() {
    if (!anonymousUserId) {
        try {
            const cred = await signInAnonymously(auth);
            anonymousUserId = cred.user.uid;
            localStorage.setItem('anonymousUserId', anonymousUserId);
        } catch {
            anonymousUserId = crypto.randomUUID();
            localStorage.setItem('anonymousUserId', anonymousUserId);
        }
    }
}
signInAnonymouslyOnce();

// Elementos DOM
const overlays = {
    main: document.getElementById('mainSection'),
    my: document.getElementById('myThoughtsOverlay'),
    time: document.getElementById('timeCapsuleOverlay'),
    country: document.getElementById('viewByCountryOverlay'),
    about: document.getElementById('aboutOverlay'),
    faq: document.getElementById('faqOverlay'),
};
const buttons = {
    my: document.getElementById('myThoughtsCard'),
    view: document.getElementById('viewByCountryCard'),
    time: document.getElementById('timeCapsuleCard'),
    about: document.getElementById('aboutLink'),
    faq: document.getElementById('faqLink'),
    closeMy: document.getElementById('closeMyThoughtsBtn'),
    closeTime: document.getElementById('closeTimeCapsuleBtn'),
    closeView: document.getElementById('closeViewByCountryBtn'),
    closeAbout: document.getElementById('closeAboutBtn'),
    closeFaq: document.getElementById('closeFaqBtn'),
};

function showOverlay(key) {
    document.body.style.overflow = 'hidden';
    overlays[key].style.display = 'flex';
}
function hideOverlay(key) {
    overlays[key].style.display = 'none';
    document.body.style.overflow = '';
}

buttons.my.addEventListener('click', () => { showOverlay('my'); displayMyThoughts(); });
buttons.view.addEventListener('click', () => { showOverlay('country'); updateCountryMap(); });
buttons.time.addEventListener('click', () => { showOverlay('time'); displayTimeCapsules(); });
buttons.about.addEventListener('click', e => { e.preventDefault(); showOverlay('about'); });
buttons.faq.addEventListener('click', e => { e.preventDefault(); showOverlay('faq'); });

buttons.closeMy.addEventListener('click', () => hideOverlay('my'));
buttons.closeView.addEventListener('click', () => hideOverlay('country'));
buttons.closeTime.addEventListener('click', () => hideOverlay('time'));
buttons.closeAbout.addEventListener('click', () => hideOverlay('about'));
buttons.closeFaq.addEventListener('click', () => hideOverlay('faq'));

window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        Object.keys(overlays).forEach(k => {
            if (k !== 'main') hideOverlay(k);
        });
    }
});

// ... (rest of script adjusted: fix closeFaqBtn, charCount selectors, remove reflow hack, keep core logic) ...
