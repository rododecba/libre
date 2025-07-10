import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, onSnapshot, serverTimestamp, doc, updateDoc, getDoc, increment, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Importar Leaflet (asegúrate de que la ruta sea correcta)
import "lib/leaflet/leaflet.js"; 

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente cargado. Iniciando script.js...");

    // --- Configuración de Firebase (asegúrate de reemplazar con tus credenciales) ---
    const firebaseConfig = {
  apiKey: "AIzaSyC7MKy2T8CFvpay4FBp8FTrVp8tpU0Niwc",
  authDomain: "libre-c5bf7.firebaseapp.com",
  projectId: "libre-c5bf7",
  storageBucket: "libre-c5bf7.firebasestorage.app",
  messagingSenderId: "339942652190",
  appId: "1:339942652190:web:595ce692456b9df806f10f"
};

    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // --- Elementos del DOM ---
    const thoughtInput = document.getElementById('thoughtInput');
    const charCount = document.getElementById('charCount');
    const launchThoughtBtn = document.getElementById('launchThoughtBtn');
    const featuredThoughtContent = document.getElementById('featuredThoughtContent');
    const featuredThoughtPlaceholder = document.getElementById('featuredThoughtPlaceholder');
    const nextThoughtBtn = document.getElementById('nextThoughtBtn');
    const globalThoughtCountElement = document.getElementById('globalThoughtCount');

    // Secciones y botones de navegación
    const mainSection = document.getElementById('mainSection');
    const myThoughtsSection = document.getElementById('myThoughtsSection');
    const viewByCountrySection = document.getElementById('viewByCountrySection');
    const timeCapsuleSection = document.getElementById('timeCapsuleSection');

    const myThoughtsCard = document.getElementById('myThoughtsCard');
    const viewByCountryCard = document.getElementById('viewByCountryCard');
    const timeCapsuleCard = document.getElementById('timeCapsuleCard');

    const closeMyThoughtsBtn = document.getElementById('closeMyThoughtsBtn');
    const closeViewByCountryBtn = document.getElementById('closeViewByCountryBtn');
    const closeTimeCapsuleBtn = document.getElementById('closeTimeCapsuleBtn');

    // Elementos de la sección "Ecos de mis Pensamientos"
    const myThoughtsList = document.getElementById('myThoughtsList');
    const noMyThoughtsMessage = document.getElementById('noMyThoughtsMessage');

    // Elementos de la sección "Cápsula del Tiempo"
    const timeCapsuleDateInput = document.getElementById('timeCapsuleDate');
    const timeCapsuleThoughtInput = document.getElementById('timeCapsuleThoughtInput');
    const timeCapsuleCharCount = document.getElementById('timeCapsuleCharCount');
    const launchTimeCapsuleBtn = document.getElementById('launchTimeCapsuleBtn');
    const timeCapsuleList = document.getElementById('timeCapsuleList');
    const noTimeCapsulesMessage = document.getElementById('noTimeCapsulesMessage');

    // Elementos de la sección "Ver por País"
    const mapContainer = document.getElementById('mapContainer'); // Asegúrate de que este ID existe en tu HTML
    const countryThoughtsList = document.getElementById('countryThoughtsList');
    const noCountryThoughtsMessage = document.getElementById('noCountryThoughtsMessage');

    // --- Constantes y Variables ---
    const MAX_CHARS_THOUGHT = 500; // Límite de caracteres por pensamiento normal
    const MAX_CHARS_TIME_CAPSULE = 500; // Límite de caracteres para cápsula del tiempo
    const THOUGHTS_PER_DAY_LIMIT = 3; // Límite de pensamientos por día

    let currentThoughtIndex = 0; // Para el pensamiento destacado
    let allThoughts = []; // Para almacenar todos los pensamientos para el destacado

    // Variable global para almacenar la instancia del mapa Leaflet
    let map = null; 

    // --- Funciones de Utilidad ---

    // Función para ocultar todas las secciones y mostrar solo la principal
    function hideAllSections() {
        mainSection.style.display = 'block'; // Asegura que la sección principal siempre sea visible
        myThoughtsSection.style.display = 'none';
        viewByCountrySection.style.display = 'none';
        timeCapsuleSection.style.display = 'none';
    }

    // Función para mostrar una sección específica
    function showSection(section) {
        hideAllSections();
        section.style.display = 'block';
    }

    // --- Contadores de Caracteres ---
    if (thoughtInput && charCount) {
        thoughtInput.addEventListener('input', () => {
            const currentLength = thoughtInput.value.length;
            charCount.textContent = `${currentLength}/${MAX_CHARS_THOUGHT}`;
            if (currentLength > MAX_CHARS_THOUGHT) {
                charCount.style.color = 'red';
                launchThoughtBtn.disabled = true;
            } else {
                charCount.style.color = 'var(--text-color-secondary)';
                launchThoughtBtn.disabled = false;
            }
        });
    }

    if (timeCapsuleThoughtInput && timeCapsuleCharCount) {
        timeCapsuleThoughtInput.addEventListener('input', () => {
            const currentLength = timeCapsuleThoughtInput.value.length;
            timeCapsuleCharCount.textContent = `${currentLength}/${MAX_CHARS_TIME_CAPSULE}`;
            if (currentLength > MAX_CHARS_TIME_CAPSULE) {
                timeCapsuleCharCount.style.color = 'red';
                launchTimeCapsuleBtn.disabled = true;
            } else {
                timeCapsuleCharCount.style.color = 'var(--text-color-secondary)';
                launchTimeCapsuleBtn.disabled = false;
            }
        });
    }

    // --- Funciones de Firebase ---

    // 1. Lanzar Pensamiento (Normal)
    async function launchThought() {
        const thoughtText = thoughtInput.value.trim();
        if (thoughtText.length === 0 || thoughtText.length > MAX_CHARS_THOUGHT) {
            alert("El pensamiento no puede estar vacío o exceder los 500 caracteres.");
            return;
        }

        // Generar un ID de usuario anónimo basado en IP (simulado o real si usas una función de backend)
        // Para un entorno de navegador, esto es un placeholder. En un entorno real, usarías una función de Cloud Functions.
        // Para este ejemplo, usaremos un ID de sesión simple o un ID de dispositivo si es posible.
        let userId = localStorage.getItem('anonymousUserId');
        if (!userId) {
            userId = 'anon_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('anonymousUserId', userId);
        }

        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const userThoughtsTodayRef = collection(db, `users/${userId}/dailyThoughts/${today}/thoughts`);

        try {
            const q = query(userThoughtsTodayRef, limit(THOUGHTS_PER_DAY_LIMIT + 1)); // Obtener hasta el límite + 1
            const snapshot = await getDocs(q);

            if (snapshot.size >= THOUGHTS_PER_DAY_LIMIT) {
                alert(`Has alcanzado el límite de ${THOUGHTS_PER_DAY_LIMIT} pensamientos por día.`);
                return;
            }

            await addDoc(collection(db, "thoughts"), {
                text: thoughtText,
                timestamp: serverTimestamp(),
                type: "normal",
                userId: userId // Guardar el ID anónimo
            });

            // Registrar el pensamiento para el límite diario
            await addDoc(userThoughtsTodayRef, {
                timestamp: serverTimestamp()
            });

            // Incrementar el contador global
            const globalCounterRef = doc(db, "counters", "globalThoughts");
            await updateDoc(globalCounterRef, {
                count: increment(1)
            });

            thoughtInput.value = '';
            charCount.textContent = `0/${MAX_CHARS_THOUGHT}`;
            alert("¡Pensamiento lanzado al mar!");
        } catch (e) {
            console.error("Error al añadir pensamiento: ", e);
            alert("Hubo un error al lanzar tu pensamiento. Inténtalo de nuevo.");
        }
    }

    // 2. Lanzar Cápsula del Tiempo
    async function launchTimeCapsule() {
        const thoughtText = timeCapsuleThoughtInput.value.trim();
        const releaseDate = timeCapsuleDateInput.value;

        if (thoughtText.length === 0 || thoughtText.length > MAX_CHARS_TIME_CAPSULE) {
            alert("El pensamiento de la cápsula no puede estar vacío o exceder los 500 caracteres.");
            return;
        }
        if (!releaseDate) {
            alert("Por favor, selecciona una fecha de liberación para tu cápsula del tiempo.");
            return;
        }

        const selectedDate = new Date(releaseDate);
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

        if (selectedDate <= now) {
            alert("La fecha de liberación debe ser en el futuro.");
            return;
        }

        try {
            await addDoc(collection(db, "timeCapsules"), {
                text: thoughtText,
                creationTimestamp: serverTimestamp(),
                releaseDate: releaseDate, // Guardar como string YYYY-MM-DD
                isReleased: false
            });

            timeCapsuleThoughtInput.value = '';
            timeCapsuleDateInput.value = '';
            timeCapsuleCharCount.textContent = `0/${MAX_CHARS_TIME_CAPSULE}`;
            alert("¡Cápsula del tiempo lanzada!");
        } catch (e) {
            console.error("Error al añadir cápsula del tiempo: ", e);
            alert("Hubo un error al lanzar tu cápsula. Inténtalo de nuevo.");
        }
    }

    // 3. Cargar Pensamiento Destacado
    async function loadFeaturedThought() {
        if (allThoughts.length === 0) {
            featuredThoughtPlaceholder.style.display = 'block';
            featuredThoughtContent.style.display = 'none';
            return;
        }

        featuredThoughtPlaceholder.style.display = 'none';
        featuredThoughtContent.style.display = 'block';

        const thought = allThoughts[currentThoughtIndex];
        featuredThoughtContent.textContent = `"${thought.text}"`;

        currentThoughtIndex = (currentThoughtIndex + 1) % allThoughts.length; // Ciclar
    }

    // 4. Actualizar Contador Global en Tiempo Real
    function setupGlobalThoughtCounter() {
        const globalCounterRef = doc(db, "counters", "globalThoughts");
        onSnapshot(globalCounterRef, (docSnap) => {
            if (docSnap.exists()) {
                globalThoughtCountElement.textContent = docSnap.data().count;
            } else {
                // Si el documento no existe, crearlo con 0
                setDoc(globalCounterRef, { count: 0 });
                globalThoughtCountElement.textContent = 0;
            }
        }, (error) => {
            console.error("Error al escuchar el contador global:", error);
            globalThoughtCountElement.textContent = "Error";
        });
    }

    // 5. Cargar Mis Pensamientos
    async function loadMyThoughts() {
        myThoughtsList.innerHTML = ''; // Limpiar lista
        const userId = localStorage.getItem('anonymousUserId');

        if (!userId) {
            noMyThoughtsMessage.style.display = 'block';
            return;
        }

        const q = query(collection(db, "thoughts"), where("userId", "==", userId), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            noMyThoughtsMessage.style.display = 'block';
        } else {
            noMyThoughtsMessage.style.display = 'none';
            querySnapshot.forEach((doc) => {
                const li = document.createElement('li');
                li.textContent = doc.data().text;
                myThoughtsList.appendChild(li);
            });
        }
    }

    // 6. Cargar Cápsulas del Tiempo Liberadas
    async function loadReleasedTimeCapsules() {
        timeCapsuleList.innerHTML = ''; // Limpiar lista
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        const q = query(collection(db, "timeCapsules"), where("releaseDate", "<=", today), orderBy("releaseDate", "asc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            noTimeCapsulesMessage.style.display = 'block';
        } else {
            noTimeCapsulesMessage.style.display = 'none';
            querySnapshot.forEach((doc) => {
                const li = document.createElement('li');
                li.textContent = doc.data().text;
                timeCapsuleList.appendChild(li);
            });
        }
    }

    // --- Event Listeners ---

    // Botón de Lanzar Pensamiento
    if (launchThoughtBtn) {
        launchThoughtBtn.addEventListener('click', launchThought);
    }

    // Botón de Siguiente Pensamiento Destacado
    if (nextThoughtBtn) {
        nextThoughtBtn.addEventListener('click', loadFeaturedThought);
    }

    // Botón de Lanzar Cápsula del Tiempo
    if (launchTimeCapsuleBtn) {
        launchTimeCapsuleBtn.addEventListener('click', launchTimeCapsule);
    }

    // Navegación de Tarjetas
    if (myThoughtsCard) {
        myThoughtsCard.addEventListener('click', () => {
            showSection(myThoughtsSection);
            loadMyThoughts(); // Cargar los pensamientos del usuario al abrir la sección
        });
    }

    if (viewByCountryCard && viewByCountrySection && closeViewByCountryBtn && mapContainer) {
        viewByCountryCard.addEventListener('click', () => {
            showSection(viewByCountrySection); // Ocultar otras secciones y mostrar 'Ver por País'

            // Inicializar el mapa solo si no ha sido inicializado antes
            if (map === null) {
                // Centrar el mapa en un lugar neutral (ej. España) o global
                const initialLat = 40.416775; // Latitud para España
                const initialLng = -3.703790; // Longitud para España
                const initialZoom = 6; // Zoom para ver el país

                map = L.map('mapContainer').setView([initialLat, initialLng], initialZoom);

                // Añadir una capa de tiles (OpenStreetMap es el más común)
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                // Opcional: Añadir un marcador simple para probar
                L.marker([initialLat, initialLng]).addTo(map)
                    .bindPopup('Centro de España (Placeholder)').openPopup();

                console.log("Mapa Leaflet inicializado.");
            } else {
                // Si el mapa ya está inicializado, asegúrate de que se reajusta bien
                map.invalidateSize();
                console.log("Mapa ya inicializado. Recargando vista.");
            }
            // Por ahora, no hay pensamientos por país para cargar, pero aquí iría la lógica
            // loadThoughtsByCountry(); 
        });
    }

    if (timeCapsuleCard) {
        timeCapsuleCard.addEventListener('click', () => {
            showSection(timeCapsuleSection);
            loadReleasedTimeCapsules(); // Cargar las cápsulas liberadas al abrir la sección
        });
    }

    // Botones de Cerrar Sección
    if (closeMyThoughtsBtn) {
        closeMyThoughtsBtn.addEventListener('click', () => showSection(mainSection));
    }
    if (closeViewByCountryBtn) {
        closeViewByCountryBtn.addEventListener('click', () => showSection(mainSection));
    }
    if (closeTimeCapsuleBtn) {
        closeTimeCapsuleBtn.addEventListener('click', () => showSection(mainSection));
    }

    // --- Inicialización al Cargar la Página ---
    async function initializeAppOnLoad() {
        // Cargar todos los pensamientos para el destacado (solo los últimos 100 para eficiencia)
        const qAll = query(collection(db, "thoughts"), orderBy("timestamp", "desc"), limit(100));
        const querySnapshotAll = await getDocs(qAll);
        allThoughts = querySnapshotAll.docs.map(doc => doc.data());
        loadFeaturedThought(); // Cargar el primer pensamiento destacado

        setupGlobalThoughtCounter(); // Iniciar el contador global en tiempo real

        hideAllSections(); // Asegurarse de que solo la sección principal sea visible al inicio
    }

    initializeAppOnLoad();
});
