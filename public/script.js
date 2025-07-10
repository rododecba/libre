import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// IMPORTANTE: Añadido 'Timestamp' a las importaciones de firestore para la cápsula del tiempo
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, onSnapshot, serverTimestamp, doc, updateDoc, getDoc, increment, where, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Importar Leaflet (asegúrate de que la ruta sea correcta)
import "./lib/leaflet/leaflet.js"; 

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente cargado. Iniciando script.js...");

    // --- Configuración de Firebase ---
    // ¡Asegúrate de que estas credenciales sean las correctas de tu proyecto de Firebase!
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
    // Nota: Los IDs han sido estandarizados y corregidos para coincidir con index.html
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
    const mapContainer = document.getElementById('mapContainer'); 
    const countryThoughtsList = document.getElementById('countryThoughtsList');
    const noCountryThoughtsMessage = document.getElementById('noCountryThoughtsMessage');

    // --- Constantes y Variables ---
    const MAX_CHARS_THOUGHT = 500; 
    const MAX_CHARS_TIME_CAPSULE = 500; 
    const THOUGHTS_PER_DAY_LIMIT = 3; 

    let currentThoughtIndex = 0; 
    let allThoughts = []; 

    // Variable global para almacenar la instancia del mapa Leaflet
    let map = null; 

    // --- Funciones de Utilidad ---

    // Función para ocultar todas las secciones y mostrar solo la principal
    function hideAllSections() {
        if (mainSection) {
            mainSection.style.display = 'block'; 
        }
        if (myThoughtsSection) {
            myThoughtsSection.style.display = 'none';
        }
        if (viewByCountrySection) {
            viewByCountrySection.style.display = 'none';
        }
        if (timeCapsuleSection) {
            timeCapsuleSection.style.display = 'none';
        }
    }

    // Función para mostrar una sección específica
    function showSection(section) {
        hideAllSections(); 
        if (mainSection) { 
            mainSection.style.display = 'none';
        }
        if (section) { 
            section.style.display = 'block';
        }
    }

    // --- Contadores de Caracteres ---
    if (thoughtInput && charCount) {
        thoughtInput.addEventListener('input', () => {
            const currentLength = thoughtInput.value.length;
            charCount.textContent = `${currentLength}/${MAX_CHARS_THOUGHT}`;
            if (currentLength > MAX_CHARS_THOUGHT) {
                charCount.style.color = 'red';
                if (launchThoughtBtn) launchThoughtBtn.disabled = true;
            } else {
                charCount.style.color = 'var(--text-color-secondary)';
                if (launchThoughtBtn) launchThoughtBtn.disabled = false;
            }
        });
    }

    if (timeCapsuleThoughtInput && timeCapsuleCharCount) {
        timeCapsuleThoughtInput.addEventListener('input', () => {
            const currentLength = timeCapsuleThoughtInput.value.length;
            timeCapsuleCharCount.textContent = `${currentLength}/${MAX_CHARS_TIME_CAPSULE}`;
            if (currentLength > MAX_CHARS_TIME_CAPSULE) {
                timeCapsuleCharCount.style.color = 'red';
                if (launchTimeCapsuleBtn) launchTimeCapsuleBtn.disabled = true;
            } else {
                timeCapsuleCharCount.style.color = 'var(--text-color-secondary)';
                if (launchTimeCapsuleBtn) launchTimeCapsuleBtn.disabled = false;
            }
        });
    }

    // --- Funciones de Firebase ---

    // 1. Lanzar Pensamiento (Normal)
    async function launchThought() { 
        const thoughtText = thoughtInput.value.trim();

        if (thoughtText.length === 0 || thoughtText.length > MAX_CHARS_THOUGHT) {
            alert("El pensamiento no puede estar vacío o exceder los " + MAX_CHARS_THOUGHT + " caracteres.");
            return;
        }

        let userId = localStorage.getItem('anonymousUserId');
        if (!userId) {
            userId = 'anon_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('anonymousUserId', userId);
        }

        const today = new Date().toISOString().slice(0, 10); 
        const userDailyThoughtDocRef = doc(db, `users/${userId}/dailyThoughts`, today); 

        try {
            const dailyThoughtDoc = await getDoc(userDailyThoughtDocRef);
            let thoughtsToday = 0;

            if (dailyThoughtDoc.exists()) {
                thoughtsToday = dailyThoughtDoc.data().count || 0;
            }

            if (thoughtsToday >= THOUGHTS_PER_DAY_LIMIT) {
                alert(`Has alcanzado el límite de ${THOUGHTS_PER_DAY_LIMIT} pensamientos por día.`);
                return;
            }

            await addDoc(collection(db, "thoughts"), {
                text: thoughtText,
                timestamp: serverTimestamp(),
                type: "normal",
                userId: userId 
            });

            await setDoc(userDailyThoughtDocRef, { count: increment(1) }, { merge: true });

            const globalCounterRef = doc(db, "counters", "globalThoughts");
            await setDoc(globalCounterRef, { count: increment(1) }, { merge: true }); 

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
        const releaseDateInput = timeCapsuleDateInput.value; // Obtiene el valor del input datetime-local

        if (thoughtText.length === 0 || thoughtText.length > MAX_CHARS_TIME_CAPSULE) {
            alert("El pensamiento de la cápsula no puede estar vacío o exceder los " + MAX_CHARS_TIME_CAPSULE + " caracteres.");
            return;
        }
        if (!releaseDateInput) {
            alert("Por favor, selecciona una fecha y hora de liberación para tu cápsula del tiempo.");
            return;
        }

        const selectedDateTime = new Date(releaseDateInput); // Convierte el string "YYYY-MM-DDTHH:MM" a un objeto Date
        const now = new Date();
        
        // Compara el objeto Date completo (fecha y hora)
        if (selectedDateTime <= now) {
            alert("La fecha y hora de liberación debe ser en el futuro.");
            return;
        }

        try {
            await addDoc(collection(db, "timeCapsules"), {
                text: thoughtText,
                creationTimestamp: serverTimestamp(),
                releaseDate: Timestamp.fromDate(selectedDateTime), // ¡Guardamos como Timestamp!
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
            if (featuredThoughtPlaceholder) featuredThoughtPlaceholder.style.display = 'block';
            if (featuredThoughtContent) featuredThoughtContent.style.display = 'none';
            return;
        }

        if (featuredThoughtPlaceholder) featuredThoughtPlaceholder.style.display = 'none';
        if (featuredThoughtContent) featuredThoughtContent.style.display = 'block';

        const thought = allThoughts[currentThoughtIndex];
        if (featuredThoughtContent && thought && thought.text) featuredThoughtContent.textContent = `"${thought.text}"`;

        currentThoughtIndex = (currentThoughtIndex + 1) % allThoughts.length; 
    }

    // 4. Actualizar Contador Global en Tiempo Real
    function setupGlobalThoughtCounter() {
        const globalCounterRef = doc(db, "counters", "globalThoughts");
        onSnapshot(globalCounterRef, (docSnap) => {
            if (docSnap.exists()) {
                if (globalThoughtCountElement) globalThoughtCountElement.textContent = docSnap.data().count;
            } else {
                setDoc(globalCounterRef, { count: 0 }, { merge: true });
                if (globalThoughtCountElement) globalThoughtCountElement.textContent = 0;
            }
        }, (error) => {
            console.error("Error al escuchar el contador global:", error);
            if (globalThoughtCountElement) globalThoughtCountElement.textContent = "Error";
        });
    }

    // 5. Cargar Mis Pensamientos -- VERSIÓN CON FILTRO DE 30 DÍAS
    async function loadMyThoughts() {
        if (myThoughtsList) myThoughtsList.innerHTML = ''; 
        const userId = localStorage.getItem('anonymousUserId');

        if (!userId) {
            if (noMyThoughtsMessage) noMyThoughtsMessage.style.display = 'block';
            return;
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const q = query(
            collection(db, "thoughts"),
            where("userId", "==", userId),
            where("timestamp", ">=", thirtyDaysAgo), 
            orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            if (noMyThoughtsMessage) noMyThoughtsMessage.style.display = 'block';
        } else {
            if (noMyThoughtsMessage) noMyThoughtsMessage.style.display = 'none';
            querySnapshot.forEach((docSnap) => { 
                const data = docSnap.data();
                const li = document.createElement('li');
                li.classList.add('my-thought-item');
                const timestamp = data.timestamp ? data.timestamp.toDate() : new Date();
                const formattedDate = timestamp.toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                const foundCountText = data.foundCount !== undefined ? ` (Encontrado ${data.foundCount} veces)` : '';
                li.innerHTML = `${data.text}<span class="my-thought-date">${formattedDate}${foundCountText}</span>`;
                if (myThoughtsList) myThoughtsList.appendChild(li);
            });
        }
    }

    // 6. Cargar Cápsulas del Tiempo Liberadas
    async function loadReleasedTimeCapsules() {
        if (timeCapsuleList) timeCapsuleList.innerHTML = ''; 
        
        // La comparación ahora es con el Timestamp actual de Firebase
        const q = query(
            collection(db, "timeCapsules"), 
            where("releaseDate", "<=", Timestamp.now()), // ¡Compara con el Timestamp actual!
            orderBy("releaseDate", "asc")
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            if (noTimeCapsulesMessage) noTimeCapsulesMessage.style.display = 'block';
        } else {
            if (noTimeCapsulesMessage) noTimeCapsulesMessage.style.display = 'none';
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const li = document.createElement('li');
                li.classList.add('my-thought-item'); 
                
                // Formatear el Timestamp de liberación
                const releaseTimestamp = data.releaseDate ? data.releaseDate.toDate() : new Date();
                const formattedReleaseDate = releaseTimestamp.toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                li.textContent = `Cápsula: "${data.text}" (Liberada: ${formattedReleaseDate})`; 
                if (timeCapsuleList) timeCapsuleList.appendChild(li);

                // Opcional: Marcar como liberada en la DB si aún no lo está
                // Esta lógica se podría hacer una vez por día en un Cloud Function para eficiencia
                // if (!data.isReleased) {
                //     updateDoc(doc(db, "timeCapsules", docSnap.id), { isReleased: true });
                // }
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
            loadMyThoughts(); 
        });
    }

    if (viewByCountryCard && viewByCountrySection && closeViewByCountryBtn && mapContainer) {
        viewByCountryCard.addEventListener('click', () => {
            showSection(viewByCountrySection); 

            if (map === null) {
                const initialLat = 40.416775; // Latitud para España
                const initialLng = -3.703790; // Longitud para España
                const initialZoom = 6; // Zoom para ver el país

                map = L.map('mapContainer').setView([initialLat, initialLng], initialZoom);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                }).addTo(map);

                L.marker([initialLat, initialLng]).addTo(map)
                    .bindPopup('Centro de España (Placeholder)').openPopup();

                console.log("Mapa Leaflet inicializado.");
            } else {
                map.invalidateSize();
                console.log("Mapa ya inicializado. Recargando vista.");
            }
        });
    }

    if (timeCapsuleCard) {
        timeCapsuleCard.addEventListener('click', () => {
            showSection(timeCapsuleSection);
            loadReleasedTimeCapsules(); 
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
        const qAll = query(collection(db, "thoughts"), orderBy("timestamp", "desc"), limit(100));
        const querySnapshotAll = await getDocs(qAll);
        allThoughts = querySnapshotAll.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })); 
        loadFeaturedThought(); 

        setupGlobalThoughtCounter(); 

        hideAllSections(); 
    }

    initializeAppOnLoad();
});
