// --- Importaciones de Firebase ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, where, doc, getDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';


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
const auth = getAuth(app);    // Obtiene la instancia de Auth

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
const globalThoughtCountDisplay = document.getElementById('globalThoughtCount'); // CORREGIDO: ID correcto

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
const closeFaqBtn = document.getElementById('closeFaqBtn'); // CORREGIDO: Error de asignación


// --- Global State ---
const MAX_CHAR_COUNT = 500;
let currentMap = null; // To store the Leaflet map instance
let currentMarkers = {}; // To store markers on the map
let countryCoordinatesCache = {}; // NUEVO: Cache para coordenadas de países


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
    aboutSection.style.display = 'none';
    faqSection.style.display = 'none';

    sectionToShow.style.display = 'block';
}

// Function to hide a specific section and show mainSection
function hideSection(sectionToHide) {
    sectionToHide.style.display = 'none';
    mainSection.offsetHeight; 
    setTimeout(() => {
        mainSection.style.display = 'flex'; 
    }, 100); 
}

// NUEVO: Función refactorizada para contadores de caracteres
function setupCharCounter(inputEl, countEl, maxChars, buttonEl) {
    inputEl.addEventListener('input', () => {
        const currentLength = inputEl.value.length;
        countEl.textContent = `${currentLength}/${maxChars}`;
        
        const isTooLong = currentLength > maxChars;
        const isEmpty = inputEl.value.trim().length === 0;

        countEl.style.color = isTooLong ? 'red' : '';
        if (buttonEl) {
            buttonEl.disabled = isTooLong || isEmpty;
        }
    });
    // Disparar una vez al inicio para establecer el estado inicial del botón
    inputEl.dispatchEvent(new Event('input'));
}


// --- Firebase Operations ---

// Add a thought to Firestore
async function addThought(thoughtText, userId, countryName) {
    try {
        await addDoc(collection(db, "thoughts"), {
            text: thoughtText,
            timestamp: serverTimestamp(),
            userId: userId,
            country: countryName,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        console.log("Thought launched!");
        thoughtInput.value = '';
        thoughtInput.dispatchEvent(new Event('input')); // Actualiza contador y botón
        await updateGlobalThoughtCount();
        await displayMyThoughts(); // Carga los pensamientos antes de mostrar la sección
        showSection(myThoughtsSection); // MEJORA: Unificación de UX, muestra la sección de "mis pensamientos"
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Hubo un error al lanzar tu pensamiento. Inténtalo de nuevo.");
    }
}

// Fetch a random thought
async function fetchRandomThought() {
    featuredThoughtPlaceholder.style.display = 'block';
    featuredThoughtContent.textContent = '';

    const thoughtsRef = collection(db, "thoughts");
    const q = query(thoughtsRef,
        where("expiresAt", ">", new Date()),
        orderBy("expiresAt", "desc"),
        limit(100)
    );

    try {
        const querySnapshot = await getDocs(q);
        const thoughts = [];
        querySnapshot.forEach((doc) => {
            thoughts.push(doc.data().text);
        });

        if (thoughts.length > 0) {
            const randomIndex = Math.floor(Math.random() * thoughts.length);
            featuredThoughtPlaceholder.style.display = 'none';
            featuredThoughtContent.textContent = thoughts[randomIndex];
        } else {
            featuredThoughtPlaceholder.style.display = 'none'; // Se oculta para mostrar el contenido
            featuredThoughtContent.textContent = 'Parece que no hay pensamientos disponibles. ¡Sé el primero en lanzar uno!';
        }
    } catch (e) {
        console.error("Error fetching random thought: ", e);
        featuredThoughtPlaceholder.style.display = 'none'; // Se oculta para mostrar el error
        featuredThoughtContent.textContent = 'Error al cargar pensamientos. Inténtalo de nuevo más tarde.';
    }
}

// Update global thought count
async function updateGlobalThoughtCount() {
    const thoughtsRef = collection(db, "thoughts");
    const q = query(thoughtsRef, where("expiresAt", ">", new Date()));
    try {
        const querySnapshot = await getDocs(q);
        globalThoughtCountDisplay.textContent = querySnapshot.size;
    } catch (e) {
        console.error("Error updating global thought count:", e);
    }
}

// Display user's own thoughts
async function displayMyThoughts() {
    myThoughtsList.innerHTML = '';
    noMyThoughtsMessage.style.display = 'block';

    // IMPORTANTE: Esta consulta requiere un índice compuesto en Firestore.
    // Colección: thoughts, Campos: userId (Asc), expiresAt (Asc), timestamp (Desc)
    const thoughtsRef = collection(db, "thoughts");
    const q = query(thoughtsRef,
        where("userId", "==", anonymousUserId),
        where("expiresAt", ">", new Date()), 
        orderBy("expiresAt", "asc"),
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
        myThoughtsList.innerHTML = '<p class="error-message">Error al cargar tus pensamientos. Revisa la consola para crear el índice de Firestore si es necesario.</p>';
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
            opened: false
        });
        console.log("Time Capsule programmed!");
        timeCapsuleThoughtInput.value = '';
        timeCapsuleDateInput.value = '';
        timeCapsuleThoughtInput.dispatchEvent(new Event('input')); // Actualiza contador y botón
        
        // MEJORA: Unificación de UX
        await displayTimeCapsules();
        showSection(timeCapsuleSection); 
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
        orderBy("deployAt", "asc")
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
                capsuleItem.className = 'my-thought-item';
                if (isReady && !capsule.opened) {
                    capsuleItem.classList.add('time-capsule-ready'); // CORREGIDO: Ahora el CSS le dará estilo
                }

                if (isReady) {
                     capsuleItem.innerHTML = `<p><strong>(DESPLEGADA):</strong> ${capsule.message}</p> <span class="my-thought-date">Programada para: ${deployDate.toLocaleString()}</span>`;
                } else {
                     capsuleItem.innerHTML = `<p><strong>Programada para: ${deployDate.toLocaleString()}</strong></p><span class="my-thought-date">Mensaje: ${capsule.message.substring(0, 50)}...</span>`;
                }
                
                timeCapsuleList.appendChild(capsuleItem);

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

function initializeMap() {
    if (currentMap) { 
        currentMap.remove();
        currentMap = null; 
    }
    currentMap = L.map(mapContainer).setView([20, 0], 2); // Vista inicial mejorada
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(currentMap);
}

async function updateCountryMap() {
    if (!currentMap) {
        initializeMap();
    }

    const thoughtsRef = collection(db, "thoughts");
    const q = query(thoughtsRef, where("expiresAt", ">", new Date()));
    const querySnapshot = await getDocs(q);

    const countryCounts = {};
    querySnapshot.forEach((doc) => {
        const country = doc.data().country || 'Desconocido';
        countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    // Limpia marcadores existentes
    for (const key in currentMarkers) {
        currentMarkers[key].remove();
    }
    currentMarkers = {};

    for (const country in countryCounts) {
        if (country === 'Desconocido') continue;

        // MEJORA: Usar cache para las coordenadas
        if (countryCoordinatesCache[country]) {
            addMarkerToMap(country, countryCounts[country], countryCoordinatesCache[country]);
        } else {
            const geocodingUrl = `https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(country)}&format=json&limit=1`;
            try {
                const response = await fetch(geocodingUrl);
                const data = await response.json();
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    const coords = [lat, lon];
                    countryCoordinatesCache[country] = coords; // Guardar en cache
                    addMarkerToMap(country, countryCounts[country], coords);
                }
            } catch (e) {
                console.error(`Error fetching coordinates for ${country}:`, e);
            }
        }
    }
}

function addMarkerToMap(country, count, coords) {
    const [lat, lon] = coords;
    const marker = L.marker([lat, lon])
        .addTo(currentMap)
        .bindPopup(`<b>${country}</b>: ${count} pensamiento(s)`)
        .on('click', () => displayThoughtsByCountry(country));
    currentMarkers[country] = marker;
}

async function displayThoughtsByCountry(country) {
    countryThoughtsList.innerHTML = '';
    noCountryThoughtsMessage.style.display = 'block';

    // IMPORTANTE: Esta consulta requiere un índice compuesto en Firestore.
    // Colección: thoughts, Campos: country (Asc), expiresAt (Asc), timestamp (Desc)
    const thoughtsRef = collection(db, "thoughts");
    const q = query(thoughtsRef,
        where("country", "==", country),
        where("expiresAt", ">", new Date()),
        orderBy("expiresAt", "asc"),
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
                thoughtItem.className = 'my-thought-item';
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
        countryThoughtsList.innerHTML = '<p class="error-message">Error al cargar pensamientos. Revisa la consola para crear el índice de Firestore si es necesario.</p>';
        noCountryThoughtsMessage.style.display = 'none';
    }
}


// --- Event Listeners ---

// Launch thought button
launchThoughtBtn.addEventListener('click', async () => {
    const thoughtText = thoughtInput.value.trim();
    if (thoughtText && thoughtText.length <= MAX_CHAR_COUNT) {
        launchThoughtBtn.disabled = true; // Deshabilita para evitar doble envío
        const country = await getCountry();
        await addThought(thoughtText, anonymousUserId, country);
        launchThoughtBtn.disabled = false; // Rehabilita
    }
});

// Next thought button
nextThoughtBtn.addEventListener('click', fetchRandomThought);

// Card clicks to show sections
myThoughtsCard.addEventListener('click', () => {
    displayMyThoughts();
    showSection(myThoughtsSection);
});

viewByCountryCard.addEventListener('click', () => {
    showSection(viewByCountrySection);
    // Retrasar la inicialización del mapa hasta que la sección sea visible para que se renderice correctamente
    setTimeout(() => {
        updateCountryMap();
    }, 0);
});

timeCapsuleCard.addEventListener('click', () => {
    displayTimeCapsules();
    showSection(timeCapsuleSection);
});

// Close buttons for sections
closeMyThoughtsBtn.addEventListener('click', () => hideSection(myThoughtsSection));
closeViewByCountryBtn.addEventListener('click', () => hideSection(viewByCountrySection));
closeTimeCapsuleBtn.addEventListener('click', () => hideSection(timeCapsuleSection));
closeAboutBtn.addEventListener('click', () => hideSection(aboutSection));
closeFaqBtn.addEventListener('click', () => hideSection(faqSection)); // CORREGIDO

// Time Capsule launch button
launchTimeCapsuleBtn.addEventListener('click', async () => {
    const messageText = timeCapsuleThoughtInput.value.trim();
    const deployDateStr = timeCapsuleDateInput.value;
    
    if (!deployDateStr) {
        alert("Por favor, selecciona una fecha y hora para tu cápsula del tiempo.");
        return;
    }
    const deployDate = new Date(deployDateStr);

    if (!messageText || messageText.length > MAX_CHAR_COUNT) {
        alert("Por favor, escribe un mensaje válido (máximo 500 caracteres).");
        return;
    }
    if (isNaN(deployDate.getTime()) || deployDate <= new Date()) {
        alert("Por favor, selecciona una fecha y hora futura válida.");
        return;
    }

    launchTimeCapsuleBtn.disabled = true; // Deshabilita para evitar doble envío
    await addTimeCapsule(messageText, deployDate, anonymousUserId);
    launchTimeCapsuleBtn.disabled = false; // Rehabilita
});


// Listeners para Acerca de y FAQ
aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(aboutSection);
});

faqLink.addEventListener('click', (e) => {
    e.preventDefault();
    showSection(faqSection);
});


// --- Initial Calls ---

// MEJORA: Usar la función refactorizada para los contadores
setupCharCounter(thoughtInput, charCount, MAX_CHAR_COUNT, launchThoughtBtn);
setupCharCounter(timeCapsuleThoughtInput, timeCapsuleCharCount, MAX_CHAR_COUNT, launchTimeCapsuleBtn);

fetchRandomThought();
updateGlobalThoughtCount();

// Set min date for time capsule input to today
const now = new Date();
const nowISO = now.toISOString().slice(0, 16);
timeCapsuleDateInput.min = nowISO;
