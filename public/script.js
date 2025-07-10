import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// IMPORTANTE: Añadido 'setDoc' a las importaciones de firestore
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, onSnapshot, serverTimestamp, doc, updateDoc, getDoc, increment, where, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
    const launchThoughtBtn = document.getElementById('launchThoughtBtn'); // Corregido ID
    const featuredThoughtContent = document.getElementById('featuredThoughtContent');
    const featuredThoughtPlaceholder = document.getElementById('featuredThoughtPlaceholder');
    const nextThoughtBtn = document.getElementById('nextThoughtBtn');
    const globalThoughtCountElement = document.getElementById('globalThoughtCount');

    // Secciones y botones de navegación
    const mainSection = document.getElementById('mainSection'); // Ahora es el DIV que envuelve el contenido principal
    const myThoughtsSection = document.getElementById('myThoughtsSection'); // Corregido ID
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
    const timeCapsuleThoughtInput = document.getElementById('timeCapsuleThoughtInput'); // Corregido ID
    const timeCapsuleCharCount = document.getElementById('timeCapsuleCharCount');
    const launchTimeCapsuleBtn = document.getElementById('launchTimeCapsuleBtn'); // Corregido ID
    const timeCapsuleList = document.getElementById('timeCapsuleList');
    const noTimeCapsulesMessage = document.getElementById('noTimeCapsulesMessage'); // Corregido ID

    // Elementos de la sección "Ver por País"
    const mapContainer = document.getElementById('mapContainer'); 
    const countryThoughtsList = document.getElementById('countryThoughtsList');
    const noCountryThoughtsMessage = document.getElementById('noCountryThoughtsMessage');

    // --- Constantes y Variables ---
    const MAX_CHARS_THOUGHT = 200; // Límite de caracteres por pensamiento normal (ajustado a 200)
    const MAX_CHARS_TIME_CAPSULE = 200; // Límite de caracteres para cápsula del tiempo (ajustado a 200)
    const THOUGHTS_PER_DAY_LIMIT = 3; // Límite de pensamientos por día

    let currentThoughtIndex = 0; // Para el pensamiento destacado
    let allThoughts = []; // Para almacenar todos los pensamientos para el destacado

    // Variable global para almacenar la instancia del mapa Leaflet
    let map = null; 

    // --- Funciones de Utilidad ---

    // Función para ocultar todas las secciones y mostrar solo la principal
    function hideAllSections() {
        // Asegura que mainSection siempre esté visible cuando se vuelve a la "home"
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
        hideAllSections(); // Primero oculta todo
        if (mainSection) { // Oculta la sección principal si se va a mostrar otra
            mainSection.style.display = 'none';
        }
        if (section) { // Muestra la sección deseada
            section.style.display = 'block';
        }
    }

    // --- Contadores de Caracteres ---
    // Se agregan checks para evitar errores si los elementos no se encuentran (aunque ya deberían existir con las correcciones de ID)
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

        // Generar un ID de usuario anónimo basado en IP (simulado o real si usas una función de backend)
        // Para un entorno de navegador, esto es un placeholder. En un entorno real, usarías una función de Cloud Functions.
        // Para este ejemplo, usaremos un ID de sesión simple o un ID de dispositivo si es posible.
        let userId = localStorage.getItem('anonymousUserId');
        if (!userId) {
            userId = 'anon_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('anonymousUserId', userId);
        }

        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const userDailyThoughtDocRef = doc(db, `users/${userId}/dailyThoughts`, today); // Referencia al documento del día

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
                userId: userId // Guardar el ID anónimo
            });

            // Incrementar el contador de pensamientos del usuario para el día
            await setDoc(userDailyThoughtDocRef, { count: increment(1) }, { merge: true });

            // Incrementar el contador global
            const globalCounterRef = doc(db, "counters", "globalThoughts");
            await setDoc(globalCounterRef, { count: increment(1) }, { merge: true }); // Usar setDoc con merge para crear si no existe

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
            alert("El pensamiento de la cápsula no puede estar vacío o exceder los " + MAX_CHARS_TIME_CAPSULE + " caracteres.");
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
            if (featuredThoughtPlaceholder) featuredThoughtPlaceholder.style.display = 'block';
            if (featuredThoughtContent) featuredThoughtContent.style.display = 'none';
            return;
        }

        if (featuredThoughtPlaceholder) featuredThoughtPlaceholder.style.display = 'none';
        if (featuredThoughtContent) featuredThoughtContent.style.display = 'block';

        const thought = allThoughts[currentThoughtIndex];
        if (featuredThoughtContent) featuredThoughtContent.textContent = `"${thought.text}"`;

        currentThoughtIndex = (currentThoughtIndex + 1) % allThoughts.length; // Ciclar
    }

    // 4. Actualizar Contador Global en Tiempo Real
    function setupGlobalThoughtCounter() {
        const globalCounterRef = doc(db, "counters", "globalThoughts");
        onSnapshot(globalCounterRef, (docSnap) => {
            if (docSnap.exists()) {
                if (globalThoughtCountElement) globalThoughtCountElement.textContent = docSnap.data().count;
            } else {
                // Si el documento no existe, crearlo con 0. merge: true es importante aquí.
                setDoc(globalCounterRef, { count: 0 }, { merge: true });
                if (globalThoughtCountElement) globalThoughtCountElement.textContent = 0;
            }
        }, (error) => {
            console.error("Error al escuchar el contador global:", error);
            if (globalThoughtCountElement) globalThoughtCountElement.textContent = "Error";
        });
    }

    // 5. Cargar Mis Pensamientos
    async function loadMyThoughts() {
        if (myThoughtsList) myThoughtsList.innerHTML = ''; // Limpiar lista
        const userId = localStorage.getItem('anonymousUserId');

        if (!userId) {
            if (noMyThoughtsMessage) noMyThoughtsMessage.style.display = 'block';
            return;
        }

        const q = query(collection(db, "thoughts"), where("userId", "==", userId), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            if (noMyThoughtsMessage) noMyThoughtsMessage.style.display = 'block';
        } else {
            if (noMyThoughtsMessage) noMyThoughtsMessage.style.display = 'none';
            querySnapshot.forEach((doc) => {
                const li = document.createElement('li');
                li.classList.add('my-thought-item'); // Añadir clase para estilos
                // Formatear la fecha
                const timestamp = doc.data().timestamp ? doc.data().timestamp.toDate() : new Date();
                const formattedDate = timestamp.toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
                li.innerHTML = `${doc.data().text}<span class="my-thought-date">${formattedDate}</span>`;
                if (myThoughtsList) myThoughtsList.appendChild(li);
            });
        }
    }

    // 6. Cargar Cápsulas del Tiempo Liberadas
    async function loadReleasedTimeCapsules() {
        if (timeCapsuleList) timeCapsuleList.innerHTML = ''; // Limpiar lista
        const today = new Date();
        const todayISO = today.toISOString().slice(0, 10); // YYYY-MM-DD

        // Consulta para obtener cápsulas cuya fecha de liberación es hoy o anterior
        // Ordenar por fecha de liberación ascendente para ver las más antiguas primero
        const q = query(collection(db, "timeCapsules"), where("releaseDate", "<=", todayISO), orderBy("releaseDate", "asc"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            if (noTimeCapsulesMessage) noTimeCapsulesMessage.style.display = 'block';
        } else {
            if (noTimeCapsulesMessage) noTimeCapsulesMessage.style.display = 'none';
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const li = document.createElement('li');
                li.classList.add('my-thought-item'); // Reutilizar el estilo de item de pensamiento
                // Añadir un pequeño indicador de que es una cápsula si es necesario, o solo el texto
                li.textContent = `Cápsula: "${data.text}" (Liberada: ${data.releaseDate})`; // Puedes ajustar el formato
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
            loadMyThoughts(); // Cargar los pensamientos del usuario al abrir la sección
        });
    }

    if (viewByCountryCard && viewByCountrySection && closeViewByCountryBtn && mapContainer) {
        viewByCountryCard.addEventListener('click', () => {
            showSection(viewByCountrySection); // Ocultar otras secciones y mostrar 'Ver por País'

            // Inicializar el mapa solo si no ha sido inicializado antes
            if (map === null) {
                const initialLat = 40.416775; // Latitud para España
                const initialLng = -3.703790; // Longitud para España
                const initialZoom = 6; // Zoom para ver el país

                map = L.map('mapContainer').setView([initialLat, initialLng], initialZoom);

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
