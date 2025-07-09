// Importa las funciones necesarias de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // Tu configuración de Firebase (proporcionada por el usuario)
    const firebaseConfig = {
        apiKey: "AIzaSyC7MKy2T8CFvpay4FBp8FTrVp8tpU0Niwc",
        authDomain: "libre-c5bf7.firebaseapp.com",
        projectId: "libre-c5bf7",
        storageBucket: "libre-c5bf7.firebasestorage.app",
        messagingSenderId: "339942652190",
        appId: "1:339942652190:web:595ce692456b9df806f10f"
    };

    // Inicializa Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app); // Obtiene la instancia de Firestore

    // Referencias a elementos del DOM
    const thoughtInput = document.getElementById('thoughtInput');
    const charCount = document.getElementById('charCount');
    const sendThoughtBtn = document.getElementById('sendThoughtBtn');
    const featuredThoughtBox = document.querySelector('.featured-thought-box');
    const featuredThoughtPlaceholder = document.querySelector('.featured-thought-placeholder');
    const totalThoughtsCountSpan = document.getElementById('totalThoughtsCount'); // Renombrado para claridad

    const myThoughtsCard = document.getElementById('myThoughtsCard');
    const viewByCountryCard = document.getElementById('viewByCountryCard');
    const featuredWordsCard = document.getElementById('featuredWordsCard');

    const MAX_CHARS = 500; // Límite de caracteres por pensamiento
    const THOUGHTS_PER_DAY_LIMIT = 3; // Límite de pensamientos por día

    // --- Funciones de Utilidad ---

    // Función para obtener la fecha de hoy en formato YYYY-MM-DD
    const getTodayDate = () => {
        const now = new Date();
        return now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    };

    // Función para obtener los pensamientos locales del día
    const getLocalThoughts = () => {
        const today = getTodayDate();
        const stored = localStorage.getItem(`thoughts_${today}`);
        return stored ? JSON.parse(stored) : [];
    };

    // Función para guardar un pensamiento localmente
    const addLocalThought = (thought) => {
        const today = getTodayDate();
        const thoughts = getLocalThoughts();
        thoughts.push(thought);
        localStorage.setItem(`thoughts_${today}`, JSON.stringify(thoughts));
    };

    // --- Lógica de la Aplicación ---

    // 1. Contador de Caracteres y Botón de Enviar
    charCount.textContent = MAX_CHARS; // Inicializar

    thoughtInput.addEventListener('input', () => {
        const remaining = MAX_CHARS - thoughtInput.value.length;
        charCount.textContent = remaining;
        charCount.style.color = remaining < 50 ? 'orange' : (remaining < 10 ? 'red' : 'var(--text-color-secondary)');

        // Mostrar/ocultar el botón de enviar
        if (thoughtInput.value.trim().length > 0) {
            sendThoughtBtn.style.display = 'block';
        } else {
            sendThoughtBtn.style.display = 'none';
        }
    });

    // 2. Enviar Pensamiento a Firestore
    sendThoughtBtn.addEventListener('click', async () => {
        const thoughtText = thoughtInput.value.trim();
        if (!thoughtText) {
            alert("Por favor, escribe un pensamiento antes de enviar."); // Usar un modal personalizado en un entorno real
            return;
        }

        const localThoughts = getLocalThoughts();
        if (localThoughts.length >= THOUGHTS_PER_DAY_LIMIT) {
            alert(`Lo siento, solo puedes escribir ${THOUGHTS_PER_DAY_LIMIT} pensamientos por día.`); // Usar un modal personalizado
            return;
        }

        try {
            // Añadir el pensamiento a la colección 'thoughts'
            await addDoc(collection(db, "thoughts"), {
                content: thoughtText,
                createdAt: serverTimestamp(), // Marca de tiempo del servidor
                // Podríamos añadir una ubicación aproximada aquí si la tuviéramos
                // location: { lat: ..., lon: ... }
            });

            addLocalThought(thoughtText); // Guardar localmente para "Ver mis pensamientos"
            thoughtInput.value = ''; // Limpiar campo
            charCount.textContent = MAX_CHARS; // Resetear contador
            charCount.style.color = 'var(--text-color-secondary)';
            sendThoughtBtn.style.display = 'none'; // Ocultar botón

            alert("¡Pensamiento enviado con éxito!"); // Usar un modal personalizado
        } catch (e) {
            console.error("Error al añadir el documento: ", e);
            alert("Hubo un error al enviar tu pensamiento. Inténtalo de nuevo."); // Usar un modal personalizado
        }
    });

    // 3. Obtener y Mostrar Pensamiento Destacado
    const fetchFeaturedThought = async () => {
        try {
            // Consulta para obtener un pensamiento aleatorio (Firestore no tiene aleatorio nativo)
            // Una estrategia común es obtener un subconjunto reciente y elegir uno aleatorio
            // O, si hay muchos, obtener un ID aleatorio y luego el documento.
            // Por simplicidad, obtendremos los 100 más recientes y elegiremos uno.
            const q = query(collection(db, "thoughts"), orderBy("createdAt", "desc"), limit(100));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const thoughts = [];
                querySnapshot.forEach((doc) => {
                    thoughts.push(doc.data().content);
                });
                const randomIndex = Math.floor(Math.random() * thoughts.length);
                const featuredThought = thoughts[randomIndex];
                featuredThoughtBox.innerHTML = `<p class="featured-thought-content">"${featuredThought}"</p>`;
                featuredThoughtPlaceholder.style.display = 'none'; // Ocultar placeholder
            } else {
                featuredThoughtBox.innerHTML = `<p class="featured-thought-placeholder">PENSAMIENTO DESTACADO</p>`;
                featuredThoughtPlaceholder.style.display = 'block'; // Mostrar placeholder si no hay pensamientos
            }
        } catch (e) {
            console.error("Error al obtener pensamiento destacado: ", e);
            featuredThoughtBox.innerHTML = `<p class="featured-thought-placeholder">Error al cargar pensamiento.</p>`;
        }
    };

    // Cargar el primer pensamiento destacado al inicio
    fetchFeaturedThought();
    // Actualizar cada 30 minutos (1800000 ms)
    setInterval(fetchFeaturedThought, 1800000);

    // 4. Actualizar Conteo Global de Pensamientos en Tiempo Real
    // onSnapshot es ideal para actualizaciones en tiempo real
    onSnapshot(collection(db, "thoughts"), (snapshot) => {
        totalThoughtsCountSpan.textContent = snapshot.size;
    }, (error) => {
        console.error("Error al obtener el conteo en tiempo real: ", error);
        totalThoughtsCountSpan.textContent = "Error";
    });

    // 5. Funcionalidad de las Tarjetas Interactivas

    // "Ver mis pensamientos"
    myThoughtsCard.addEventListener('click', () => {
        const localThoughts = getLocalThoughts();
        let thoughtsHtml = '';
        if (localThoughts.length > 0) {
            thoughtsHtml = localThoughts.map(thought => `<p class="local-thought-item">${thought}</p>`).join('');
        } else {
            thoughtsHtml = '<p class="no-thoughts-message">Aún no has escrito pensamientos hoy.</p>';
        }

        // Aquí podrías mostrar un modal o una nueva sección con estos pensamientos
        // Por ahora, lo mostraremos en una alerta simple (reemplazar con UI real)
        alert(`Tus pensamientos de hoy:\n\n${localThoughts.join('\n\n') || 'Aún no has escrito pensamientos hoy.'}`);
        console.log("Tus pensamientos de hoy:", localThoughts);
    });

    // "Ver por País" - Placeholder para la integración del mapa
    viewByCountryCard.addEventListener('click', () => {
        alert("Funcionalidad 'Ver por País' en desarrollo. Aquí se integrará un mapa mundial."); // Reemplazar con UI real
        console.log("Clic en Ver por País");
    });

    // "Palabras Destacadas" - Placeholder para la lista de palabras
    featuredWordsCard.addEventListener('click', () => {
        const prominentWords = ["paz", "amor", "odio", "guerra", "dinero", "felicidad", "tristeza", "esperanza", "futuro", "cambio"];
        alert(`Palabras Destacadas:\n\n${prominentWords.join(', ')}`); // Reemplazar con UI real
        console.log("Clic en Palabras Destacadas");
    });

    // Asegurarse de que el input tenga foco al cargar si es necesario (opcional)
    // thoughtInput.focus();
});
