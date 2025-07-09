// Importa las funciones necesarias de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente cargado. Iniciando script.js...");

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
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app); // Obtiene la instancia de Firestore
        console.log("Firebase inicializado y Firestore conectado.");
    } catch (error) {
        console.error("Error al inicializar Firebase:", error);
        alert("Error al conectar con Firebase. Revisa la consola para más detalles."); // Usar modal
        return; // Detener la ejecución si Firebase no se inicializa
    }


    // Referencias a elementos del DOM
    const thoughtInput = document.getElementById('thoughtInput');
    const charCount = document.getElementById('charCount');
    const sendThoughtBtn = document.getElementById('sendThoughtBtn');
    const featuredThoughtBox = document.querySelector('.featured-thought-box');
    const featuredThoughtPlaceholder = document.querySelector('.featured-thought-placeholder');
    const totalThoughtsCountSpan = document.getElementById('totalThoughtsCount');

    const myThoughtsCard = document.getElementById('myThoughtsCard');
    const viewByCountryCard = document.getElementById('viewByCountryCard');
    const featuredWordsCard = document.getElementById('featuredWordsCard');

    // Verificar que los elementos DOM existen
    if (!thoughtInput) console.error("Error: Elemento 'thoughtInput' no encontrado.");
    if (!charCount) console.error("Error: Elemento 'charCount' no encontrado.");
    if (!sendThoughtBtn) console.error("Error: Elemento 'sendThoughtBtn' no encontrado.");
    if (!featuredThoughtBox) console.error("Error: Elemento 'featuredThoughtBox' no encontrado.");
    if (!totalThoughtsCountSpan) console.error("Error: Elemento 'totalThoughtsCountSpan' no encontrado.");
    if (!myThoughtsCard) console.error("Error: Elemento 'myThoughtsCard' no encontrado.");


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
        console.log("Pensamiento guardado localmente:", thought);
    };

    // --- Lógica de la Aplicación ---

    // 1. Contador de Caracteres y Botón de Enviar
    if (charCount) {
        charCount.textContent = MAX_CHARS; // Inicializar
    }

    if (thoughtInput && charCount && sendThoughtBtn) {
        thoughtInput.addEventListener('input', () => {
            console.log("Evento 'input' detectado en thoughtInput. Valor actual:", thoughtInput.value);
            const remaining = MAX_CHARS - thoughtInput.value.length;
            charCount.textContent = remaining;
            charCount.style.color = remaining < 50 ? 'orange' : (remaining < 10 ? 'red' : 'var(--text-color-secondary)');

            // Mostrar/ocultar el botón de enviar
            if (thoughtInput.value.trim().length > 0) {
                sendThoughtBtn.style.display = 'block';
                console.log("Botón de enviar visible.");
            } else {
                sendThoughtBtn.style.display = 'none';
                console.log("Botón de enviar oculto.");
            }
        });
    } else {
        console.error("No se pudo adjuntar el listener 'input' porque faltan elementos DOM.");
    }


    // 2. Enviar Pensamiento a Firestore
    if (sendThoughtBtn) {
        sendThoughtBtn.addEventListener('click', async () => {
            console.log("Clic en el botón de enviar.");
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
                // Asegúrate de que 'db' esté definido y sea una instancia válida de Firestore
                if (typeof db === 'undefined') {
                    console.error("Error: Firestore (db) no está inicializado.");
                    alert("Error interno: La base de datos no está disponible."); // Usar modal
                    return;
                }

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
                console.log("Pensamiento enviado a Firestore.");
            } catch (e) {
                console.error("Error al añadir el documento: ", e);
                alert("Hubo un error al enviar tu pensamiento. Inténtalo de nuevo."); // Usar un modal personalizado
            }
        });
    } else {
        console.error("No se pudo adjuntar el listener 'click' al botón de enviar.");
    }


    // 3. Obtener y Mostrar Pensamiento Destacado
    const fetchFeaturedThought = async () => {
        console.log("Intentando obtener pensamiento destacado...");
        try {
            if (typeof db === 'undefined') {
                console.error("Error: Firestore (db) no está inicializado para fetchFeaturedThought.");
                featuredThoughtBox.innerHTML = `<p class="featured-thought-placeholder">Error: DB no disponible.</p>`;
                return;
            }

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
                if (featuredThoughtPlaceholder) featuredThoughtPlaceholder.style.display = 'none';
                console.log("Pensamiento destacado cargado:", featuredThought);
            } else {
                featuredThoughtBox.innerHTML = `<p class="featured-thought-placeholder">PENSAMIENTO DESTACADO</p>`;
                if (featuredThoughtPlaceholder) featuredThoughtPlaceholder.style.display = 'block';
                console.log("No hay pensamientos en Firestore para destacar.");
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
    if (totalThoughtsCountSpan) {
        // onSnapshot es ideal para actualizaciones en tiempo real
        onSnapshot(collection(db, "thoughts"), (snapshot) => {
            totalThoughtsCountSpan.textContent = snapshot.size;
            console.log("Conteo de pensamientos actualizado:", snapshot.size);
        }, (error) => {
            console.error("Error al obtener el conteo en tiempo real: ", error);
            totalThoughtsCountSpan.textContent = "Error";
        });
    } else {
        console.error("No se pudo adjuntar el listener 'onSnapshot' porque 'totalThoughtsCountSpan' no fue encontrado.");
    }


    // 5. Funcionalidad de las Tarjetas Interactivas

    // "Ver mis pensamientos"
    if (myThoughtsCard) {
        myThoughtsCard.addEventListener('click', () => {
            console.log("Clic en 'Ver mis pensamientos'.");
            const localThoughts = getLocalThoughts();
            let thoughtsDisplay = '';
            if (localThoughts.length > 0) {
                thoughtsDisplay = localThoughts.join('\n\n');
            } else {
                thoughtsDisplay = 'Aún no has escrito pensamientos hoy.';
            }
            alert(`Tus pensamientos de hoy:\n\n${thoughtsDisplay}`); // Reemplazar con UI real
        });
    } else {
        console.error("No se pudo adjuntar el listener 'click' a 'myThoughtsCard'.");
    }


    // "Ver por País" - Placeholder para la integración del mapa
    if (viewByCountryCard) {
        viewByCountryCard.addEventListener('click', () => {
            alert("Funcionalidad 'Ver por País' en desarrollo. Aquí se integrará un mapa mundial."); // Reemplazar con UI real
            console.log("Clic en Ver por País");
        });
    }


    // "Palabras Destacadas" - Placeholder para la lista de palabras
    if (featuredWordsCard) {
        featuredWordsCard.addEventListener('click', () => {
            const prominentWords = ["paz", "amor", "odio", "guerra", "dinero", "felicidad", "tristeza", "esperanza", "futuro", "cambio"];
            alert(`Palabras Destacadas:\n\n${prominentWords.join(', ')}`); // Reemplazar con UI real
            console.log("Clic en Palabras Destacadas");
        });
    }
});
