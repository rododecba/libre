// --- Importaciones de Firebase ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, where, doc, getDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

// --- Importaciones de Leaflet ---
import './lib/leaflet/leaflet-src.esm.js'; 
import 'https://unpkg.com/leaflet-geosearch@3.11.0/dist/geosearch.umd.js'; // Import GeoSearch

// --- TU CONFIGURACIÓN DE FIREBASE REAL ---
const firebaseConfig = {
    apiKey: "AIzaSyC7MKy2T8CFvpay4FBp8FTrVp8tpU0Niwc",
    authDomain: "libre-c5bf7.firebaseapp.com",
    projectId: "libre-c5bf7",
    storageBucket: "libre-c5bf7.firebasestorage.app",
    messagingSenderId: "339942652190",
    appId: "1:339942652190:web:595ce692456b9df806f10f"
};

// --- Inicialización de Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Obtiene la instancia de Firestore
const auth = getAuth(app);     // Obtiene la instancia de Auth

// Initialize Firebase Auth
let anonymousUserId = localStorage.getItem('anonymousUserId');

// Helper function for anonymous sign-in
async function signInAnonymouslyOnce() {
    if (!anonymousUserId) {
        try {
            const userCredential = await signInAnonymously(auth);
            anonymousUserId = userCredential.user.uid;
            localStorage.setItem('anonymousUserId', anonymousUserId);
            console.log("Signed in anonymously with UID:", anonymousUserId);
        } catch (error) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error("Anonymous sign-in failed:", errorCode, errorMessage);
            // Fallback to local storage UUID if Firebase auth fails
            if (!anonymousUserId) {
                anonymousUserId = crypto.randomUUID();
                localStorage.setItem('anonymousUserId', anonymousUserId);
                console.warn("Using local UUID as fallback:", anonymousUserId);
            }
        }
    } else {
        // Attempt to sign in with existing anonymous user session if available
        // This is handled by Firebase Auth SDK automatically if a session exists
        // We just ensure anonymousUserId is set from localStorage for local use
        console.log("Existing anonymous user ID found:", anonymousUserId);
    }
}

// Ensure anonymous user is signed in on load
signInAnonymouslyOnce();


// --- HTML Elements ---
const featuredThoughtPlaceholder = document.getElementById('featuredThoughtPlaceholder');
const featuredThoughtContent = document.getElementById('featuredThoughtContent');
const nextThoughtBtn = document.getElementById('nextThoughtBtn');
const thoughtInput = document.getElementById('thoughtInput');
const charCount = document.getElementById('charCount');
const launchThoughtBtn = document.getElementById('launchThoughtBtn');
const globalThoughtCountDisplay = document.getElementById('globalThoughtCount');

// Card navigation elements
const mainSection = document.getElementById('mainSection');
const myThoughtsCard = document.getElementById('myThoughtsCard');
const viewByCountryCard = document.getElementById('viewByCountryCard');
const timeCapsuleCard = document.getElementById('timeCapsuleCard');

// Section displays
const myThoughtsSection = document.getElementById('myThoughtsSection');
const closeMyThoughtsBtn = document.getElementById('closeMyThoughtsBtn');
const myThoughtsList = document.getElementById('myThoughtsList');
const noMyThoughtsMessage = document.getElementById('noMyThoughtsMessage');

const timeCapsuleSection = document.getElementById('timeCapsuleSection');
const closeTimeCapsuleBtn = document.getElementById('closeTimeCapsuleBtn');
const timeCapsuleThoughtInput = document.getElementById('timeCapsuleThoughtInput');
const timeCapsuleCharCount = document.getElementById('timeCapsuleCharCount');
const timeCapsuleDateInput = document.getElementById('timeCapsuleDate');
const launchTimeCapsuleBtn = document.getElementById('launchTimeCapsuleBtn');
const timeCapsuleList = document.getElementById('timeCapsuleList');
const noTimeCapsulesMessage = document.getElementById('noTimeCapsulesMessage');

const viewByCountrySection = document.getElementById('viewByCountrySection');
const closeViewByCountryBtn = document.getElementById('closeViewByCountryBtn');
const mapContainer = document.getElementById('mapContainer');
const countryThoughtsList = document.getElementById('countryThoughtsList');
const noCountryThoughtsMessage = document.getElementById('noCountryThoughtsMessage');

// NUEVOS ELEMENTOS PARA ACERCA DE Y FAQ
const aboutLink = document.getElementById('aboutLink');
const faqLink = document.getElementById('faqLink');
const aboutSection = document.getElementById('aboutSection');
const faqSection = document.getElementById('faqSection');
const closeAboutBtn = document.getElementById('closeAboutBtn');
const closeFaqBtn = document.getElementById('closeFaqBtn');


// --- Global State ---
const MAX_CHAR_COUNT = 500;
let currentMap = null; // To store the Leaflet map instance
let currentMarkers = {}; // To store markers on the map


// --- Utility Functions ---

// Function to get approximate country based on IP (server-side function or external API)
async function getCountry() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return data.country_name || 'Desconocido';
    } catch (error) {
        console.error("Error getting country:", error);
        return 'Desconocido';
    }
}

// Function to hide all main sections and show a specific one
function showSection(sectionToShow) {
    mainSection.style.display = 'none';
    myThoughtsSection.style.display = 'none';
    timeCapsuleSection.style.display = 'none';
    viewByCountrySection.style.display = 'none';
    aboutSection.style.display = 'none'; // Esconde nueva sección
    faqSection.style.display = 'none';   // Esconde nueva sección

    sectionToShow.style.display = 'block';
}

// Function to hide a specific section and show mainSection
function hideSection(sectionToHide) {
    sectionToHide.style.display = 'none';
    mainSection.style.display = 'flex'; // Assuming mainSection is flex
}

// --- Firebase Operations ---

// Add a thought to Firestore
async function addThought(thoughtText, userId, countryName) {
    try {
        await addDoc(collection(db, "thoughts"), {
            text: thoughtText,
            timestamp: serverTimestamp(),
            userId: userId, // Store the anonymous user ID
            country: countryName,
            // Add a field for expiration date (30 days from now)
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
        });
        console.log("Thought launched!");
        thoughtInput.value = ''; // Clear input
        charCount.textContent = '0/500'; // Reset char count
        updateGlobalThoughtCount();
        // After launching, show "My Thoughts" section
        displayMyThoughts();
        showSection(myThoughtsSection);
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Hubo un error al lanzar tu pensamiento. Inténtalo de nuevo.");
    }
}

// Fetch a random thought
async function fetchRandomThought() {
    featuredThoughtPlaceholder.style.display = 'block';
    featuredThoughtContent.textContent = '';
    
    // Query for thoughts that have not expired yet
    const thoughtsRef = collection(db, "thoughts");
    const q = query(thoughtsRef, 
        where("expiresAt", ">", new Date()), // Only thoughts not yet expired
        orderBy("expiresAt", "desc"), // Order by expiration to potentially get newer ones first, or just to have an order
        limit(100) // Fetch a batch to pick a random one
    );

    try {
        const querySnapshot = await getDocs(q);
        const thoughts = [];
        querySnapshot.forEach((doc) => {
            thoughts.push(doc.data().text);
        });

        if (thoughts.length > 0) {
            const randomIndex = Math.floor(Math.random() * thoughts.length); // Defined here
            featuredThoughtPlaceholder.style.display = 'none';
            featuredThoughtContent.textContent = thoughts[randomIndex];
        } else {
            featuredThoughtPlaceholder.style.display = 'block';
            featuredThoughtContent.textContent = 'Parece que no hay pensamientos disponibles en este momento. ¡Sé el primero en lanzar uno!';
        }
    } catch (e) {
        console.error("Error fetching random thought: ", e);
        featuredThoughtPlaceholder.style.display = 'block';
        featuredThoughtContent.textContent = 'Error al cargar pensamientos. Inténtalo de nuevo más tarde.';
    }
}

// Update global thought count
async function updateGlobalThoughtCount() {
    const thoughtsRef = collection(db, "thoughts");
    const q = query(thoughtsRef, where("expiresAt", ">", new Date())); // Count non-expired thoughts
    try {
        const querySnapshot = await getDocs(q);
        globalThoughtCountDisplay.textContent = querySnapshot.size;
    } catch (e) {
        console.error("Error updating global thought count:", e);
    }
}

// Display user's own thoughts
async function displayMyThoughts() {
    myThoughtsList.innerHTML = ''; // Clear previous thoughts
    noMyThoughtsMessage.style.display = 'block'; // Show no thoughts message by default

    const thoughtsRef = collection(db, "thoughts");
    const q = query(thoughtsRef, 
        where("userId", "==", anonymousUserId), 
        where("expiresAt", ">", new Date()), // Only non-expired thoughts
        orderBy("timestamp", "desc")
    );

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            noMyThoughtsMessage.style.display = 'block';
        } else {
            noMyThoughtsMessage.style.display = 'none';
            querySnapshot.forEach((doc) => {
                const thought = doc.data();
                const thoughtItem = document.createElement('div');
                thoughtItem.className = 'my-thought-item';
                const date = thought.timestamp ? thought.timestamp.toDate() : new Date();
                thoughtItem.innerHTML = `
                    <p>${thought.text}</p>
                    <span class="my-thought-date">${date.toLocaleString()}</span>
                `;
                myThoughtsList.appendChild(thoughtItem);
            });
        }
    } catch (e) {
        console.error("Error displaying my thoughts: ", e);
        myThoughtsList.innerHTML = '<p class="error-message">Error al cargar tus pensamientos.</p>';
        noMyThoughtsMessage.style.display = 'none';
    }
}

// --- Time Capsule Functions ---

async function addTimeCapsule(messageText, deployDate, userId) {
    try {
        await addDoc(collection(db, "timeCapsules"), {
            message: messageText,
            deployAt: deployDate,
            userId: userId,
            createdAt: serverTimestamp(),
            opened: false // New field to track if it's been opened
        });
        console.log("Time Capsule programmed!");
        timeCapsuleThoughtInput.value = '';
        timeCapsuleCharCount.textContent = '0/500';
        timeCapsuleDateInput.value = '';
        alert('Tu cápsula del tiempo ha sido programada con éxito!');
        displayTimeCapsules(); // Refresh the list
    } catch (e) {
        console.error("Error adding time capsule: ", e);
        alert("Hubo un error al programar tu cápsula. Inténtalo de nuevo.");
    }
}

async function displayTimeCapsules() {
    timeCapsuleList.innerHTML = '';
    noTimeCapsulesMessage.style.display = 'block';

    const capsulesRef = collection(db, "timeCapsules");
    const q = query(capsulesRef, 
        where("userId", "==", anonymousUserId), 
        orderBy("deployAt", "asc") // Order by deploy date
    );

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            noTimeCapsulesMessage.style.display = 'block';
        } else {
            noTimeCapsulesMessage.style.display = 'none';
            const now = new Date();
            querySnapshot.forEach(async (docSnap) => {
                const capsule = docSnap.data();
                const deployDate = capsule.deployAt.toDate();
                const isReady = deployDate <= now;

                const capsuleItem = document.createElement('div');
                capsuleItem.className = 'my-thought-item'; // Reuse styling
                if (isReady && !capsule.opened) {
                    capsuleItem.classList.add('time-capsule-ready'); // Add class for styling
                }
                
                capsuleItem.innerHTML = `
                    <p>${isReady && !capsule.opened ? `(DESPLEGADA): ${capsule.message}` : `Programada para: ${deployDate.toLocaleString()}`}</p>
                    ${!isReady || capsule.opened ? `<span class="my-thought-date">Mensaje: ${capsule.message.substring(0, 50)}...</span>` : ''}
                `;
                
                timeCapsuleList.appendChild(capsuleItem);

                // Mark as opened if ready and not already opened
                if (isReady && !capsule.opened) {
                    await updateDoc(doc(db, "timeCapsules", docSnap.id), {
                        opened: true
                    });
                }
            });
        }
    } catch (e) {
        console.error("Error displaying time capsules: ", e);
        timeCapsuleList.innerHTML = '<p class="error-message">Error al cargar tus cápsulas del tiempo.</p>';
        noTimeCapsulesMessage.style.display = 'none';
    }
}


// --- Map and Country-based Thoughts Functions ---

let mapInitialized = false;

function initializeMap() {
    if (mapInitialized) {
        currentMap.remove(); // Remove existing map before re-initializing
    }
    currentMap = L.map(mapContainer).setView([0, 0], 1); // Centered, low zoom
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(currentMap);
    mapInitialized = true;
}

async function updateCountryMap() {
    initializeMap(); // Ensure map is initialized or reset

    const thoughtsRef = collection(db, "thoughts");
    const q = query(thoughtsRef, where("expiresAt", ">", new Date())); // Only non-expired
    const querySnapshot = await getDocs(q);

    const countryCounts = {};
    const countryCoordinates = {};

    querySnapshot.forEach((doc) => {
        const thought = doc.data();
        const country = thought.country || 'Desconocido';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    // Clear previous markers
    for (const key in currentMarkers) {
        currentMarkers[key].remove();
    }
    currentMarkers = {};

    // Fetch coordinates for countries with thoughts and add markers
    for (const country in countryCounts) {
        if (country === 'Desconocido') continue; // Skip unknown countries
        
        if (!countryCoordinates[country]) {
            // Use Nominatim or a similar service to get country coordinates
            const geocodingUrl = `https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(country)}&format=json&limit=1`;
            try {
                const response = await fetch(geocodingUrl);
                const data = await response.json();
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    countryCoordinates[country] = [lat, lon];
                }
            } catch (e) {
                console.error(`Error fetching coordinates for ${country}:`, e);
            }
        }

        if (countryCoordinates[country]) {
            const [lat, lon] = countryCoordinates[country];
            const count = countryCounts[country];
            const marker = L.marker([lat, lon])
                .addTo(currentMap)
                .bindPopup(`<b>${country}</b>: ${count} pensamiento(s)`)
                .on('click', () => displayThoughtsByCountry(country)); // Add click event
            currentMarkers[country] = marker;
        }
    }
}

async function displayThoughtsByCountry(country) {
    countryThoughtsList.innerHTML = '';
    noCountryThoughtsMessage.style.display = 'block';

    const thoughtsRef = collection(db, "thoughts");
    const q = query(thoughtsRef, 
        where("country", "==", country), 
        where("expiresAt", ">", new Date()), // Only non-expired
        orderBy("timestamp", "desc")
    );

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            noCountryThoughtsMessage.textContent = `No hay pensamientos de ${country} aún.`;
            noCountryThoughtsMessage.style.display = 'block';
        } else {
            noCountryThoughtsMessage.style.display = 'none';
            querySnapshot.forEach((doc) => {
                const thought = doc.data();
                const thoughtItem = document.createElement('div');
                thoughtItem.className = 'my-thought-item'; // Reuse styling
                const date = thought.timestamp ? thought.timestamp.toDate() : new Date();
                thoughtItem.innerHTML = `
                    <p>"${thought.text}"</p>
                    <span class="my-thought-date">${date.toLocaleString()} desde ${thought.country}</span>
                `;
                countryThoughtsList.appendChild(thoughtItem);
            });
        }
    } catch (e) {
        console.error("Error displaying thoughts by country: ", e);
        countryThoughtsList.innerHTML = '<p class="error-message">Error al cargar pensamientos de este país.</p>';
        noCountryThoughtsMessage.style.display = 'none';
    }
}


// --- Event Listeners ---

// Main thought input char count
thoughtInput.addEventListener('input', () => {
    const currentLength = thoughtInput.value.length;
    charCount.textContent = `${currentLength}/${MAX_CHAR_COUNT}`;
    if (currentLength > MAX_CHAR_COUNT) {
        charCount.style.color = 'red';
        launchThoughtBtn.disabled = true;
    } else {
        charCount.style.color = '';
        launchThoughtBtn.disabled = false;
    }
});

// Launch thought button
launchThoughtBtn.addEventListener('click', async () => {
    const thoughtText = thoughtInput.value.trim();
    if (thoughtText && thoughtText.length <= MAX_CHAR_COUNT) {
        const country = await getCountry();
        addThought(thoughtText, anonymousUserId, country);
    } else {
        alert("Por favor, escribe un pensamiento válido (máximo 500 caracteres).");
    }
});

// Next thought button
nextThoughtBtn.addEventListener('click', fetchRandomThought);

// Card clicks to show sections
myThoughtsCard.addEventListener('click', () => {
    showSection(myThoughtsSection);
    displayMyThoughts();
});

viewByCountryCard.addEventListener('click', () => {
    showSection(viewByCountrySection);
    updateCountryMap(); // Re-initialize and update map on display
});

timeCapsuleCard.addEventListener('click', () => {
    showSection(timeCapsuleSection);
    displayTimeCapsules();
});

// Close buttons for sections
closeMyThoughtsBtn.addEventListener('click', () => hideSection(myThoughtsSection));
closeViewByCountryBtn.addEventListener('click', () => hideSection(viewByCountrySection));
closeTimeCapsuleBtn.addEventListener('click', () => hideSection(timeCapsuleSection));

// Time Capsule input char count
timeCapsuleThoughtInput.addEventListener('input', () => {
    const currentLength = timeCapsuleThoughtInput.value.length;
    timeCapsuleCharCount.textContent = `${currentLength}/${MAX_CHAR_COUNT}`;
    if (currentLength > MAX_CHAR_COUNT) {
        timeCapsuleCharCount.style.color = 'red';
        launchTimeCapsuleBtn.disabled = true;
    } else {
        charCount.style.color = '';
        launchTimeCapsuleBtn.disabled = false;
    }
});

// Time Capsule launch button
launchTimeCapsuleBtn.addEventListener('click', async () => {
    const messageText = timeCapsuleThoughtInput.value.trim();
    const deployDate = new Date(timeCapsuleDateInput.value);

    if (!messageText || messageText.length > MAX_CHAR_COUNT) {
        alert("Por favor, escribe un mensaje válido (máximo 500 caracteres) para tu cápsula del tiempo.");
        return;
    }
    if (isNaN(deployDate.getTime()) || deployDate <= new Date()) {
        alert("Por favor, selecciona una fecha y hora futura válida para tu cápsula del tiempo.");
        return;
    }

    await addTimeCapsule(messageText, deployDate, anonymousUserId);
});


// NUEVOS LISTENERS PARA ACERCA DE Y FAQ
aboutLink.addEventListener('click', (e) => {
    e.preventDefault(); // Evita el salto de página
    showSection(aboutSection);
});

faqLink.addEventListener('click', (e) => {
    e.preventDefault(); // Evita el salto de página
    showSection(faqSection);
});

closeAboutBtn.addEventListener('click', () => hideSection(aboutSection));
closeFaqBtn.addEventListener('click', () => hideSection(faqSection));


// --- Initial Calls ---
fetchRandomThought();
updateGlobalThoughtCount();

// Set min date for time capsule input to tomorrow
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowISO = tomorrow.toISOString().slice(0, 16);
timeCapsuleDateInput.min = tomorrowISO;
