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

    let db; // Declara db aquí para que sea accesible en todo el ámbito

    // Inicializa Firebase
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app); // Asigna la instancia de Firestore
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

    // NUEVOS ELEMENTOS DEL DOM para la sección de pensamientos del usuario
    const myThoughtsDisplaySection = document.getElementById('myThoughtsDisplaySection');
    const myThoughtsList = document.getElementById('myThoughtsList');
    const closeMyThoughtsBtn = document.getElementById('closeMyThoughts');


    // Verificar que los elementos DOM existen y loguear si no
    if (!thoughtInput) console.error("Error: Elemento 'thoughtInput' no encontrado.");
    if (!charCount) console.error("Error: Elemento 'charCount' no encontrado.");
    if (!sendThoughtBtn) console.error("Error: Elemento 'sendThoughtBtn' no encontrado. Asegúrate de que el ID 'sendThoughtBtn' esté en tu HTML.");
    if (!featuredThoughtBox) console.error("Error: Elemento 'featuredThoughtBox' no encontrado.");
    if (!totalThoughtsCountSpan) console.error("Error: Elemento 'totalThoughtsCountSpan' no encontrado.");
    if (!myThoughtsCard) console.error("Error: Elemento 'myThoughtsCard' no encontrado.");
    if (!myThoughtsDisplaySection) console.error("Error: Elemento 'myThoughtsDisplaySection' no encontrado.");
    if (!myThoughtsList) console.error("Error: Elemento 'myThoughtsList' no encontrado.");
    if (!closeMyThoughtsBtn) console.error("Error: Elemento 'closeMyThoughtsBtn' no encontrado.");


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

    // Función para guardar un pensamiento localmente (ahora guarda también timestamp)
    const addLocalThought = (thoughtContent) => {
        const today = getTodayDate();
        const thoughts = getLocalThoughts();
        const newThought = {
            content: thoughtContent,
            timestamp: new Date().toISOString() // Guarda la fecha y hora en formato ISO
        };
        thoughts.push(newThought);
        localStorage.setItem(`thoughts_${today}`, JSON.stringify(thoughts));
        console.log("Pensamiento guardado localmente:", newThought);
    };

    // Función para formatear la fecha y hora
    const formatThoughtDateTime = (isoString) => {
        const date = new Date(isoString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // Formato 24 horas
        };
        return date.toLocaleDateString('es-ES', options);
    };

    // --- Lógica de la Aplicación ---

    // Función para manejar el envío de un pensamiento (reutilizable para clic de botón y tecla Enter)
    const sendThought = async () => {
        console.log("Intentando enviar pensamiento...");
        const thoughtText = thoughtInput.value.trim();
        if (!thoughtText) {
            alert("Por favor, escribe un pensamiento antes de enviar.");
            return;
        }

        const localThoughts = getLocalThoughts();
        if (localThoughts.length >= THOUGHTS_PER_DAY_LIMIT) {
            alert(`Lo siento, solo puedes escribir ${THOUGHTS_PER_DAY_LIMIT} pensamientos por día.`);
            return;
        }

        try {
            if (!db) { // Verificar si db está inicializado
                console.error("Error: Firestore (db) no está inicializado.");
                alert("Error interno: La base de datos no está disponible.");
                return;
            }

            await addDoc(collection(db, "thoughts"), {
                content: thoughtText,
                createdAt: serverTimestamp(),
            });

            addLocalThought(thoughtText); // Guardar localmente con fecha/hora
            thoughtInput.value = ''; // Limpiar campo
            charCount.textContent = MAX_CHARS; // Resetear contador
            charCount.style.color = 'var(--text-color-secondary)';
            sendThoughtBtn.style.display = 'none'; // Ocultar botón

            alert("¡Pensamiento enviado con éxito!");
            console.log("Pensamiento enviado a Firestore.");
        } catch (e) {
            console.error("Error al añadir el documento: ", e);
            alert("Hubo un error al enviar tu pensamiento. Inténtalo de nuevo.");
        }
    };


    // 1. Contador de Caracteres, Botón de Enviar y Tecla Enter
    if (charCount) {
        charCount.textContent = MAX_CHARS; // Inicializar
    }

    if (thoughtInput && charCount && sendThoughtBtn) {
        // Listener para el recuento de caracteres y visibilidad del botón
        thoughtInput.addEventListener('input', () => {
            console.log("Evento 'input' detectado en thoughtInput. Valor actual:", thoughtInput.value);
            const remaining = MAX_CHARS - thoughtInput.value.length;
            charCount.textContent = remaining;
            charCount.style.color = remaining < 50 ? 'orange' : (remaining < 10 ? 'red' : 'var(--text-color-secondary)');

            if (thoughtInput.value.trim().length > 0) {
                sendThoughtBtn.style.display = 'block';
                console.log("Botón de enviar visible.");
            } else {
                sendThoughtBtn.style.display = 'none';
                console.log("Botón de enviar oculto.");
            }
        });

        // Listener para la tecla Enter
        thoughtInput.addEventListener('keydown', (event) => {
            // Solo si es 'Enter' y no 'Shift+Enter' (para permitir saltos de línea manuales)
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault(); // Prevenir el comportamiento por defecto (nueva línea)
                sendThought(); // Llamar a la función de envío
            }
        });

    } else {
        console.error("No se pudo adjuntar el listener 'input' o 'keydown' porque faltan elementos DOM. Revisa 'thoughtInput', 'charCount', 'sendThoughtBtn'.");
    }


    // 2. Enviar Pensamiento a Firestore (ahora manejado por la función sendThought)
    if (sendThoughtBtn) {
        sendThoughtBtn.addEventListener('click', sendThought); // Adjunta la función sendThought reutilizable
    } else {
        console.error("No se pudo adjuntar el listener 'click' al botón de enviar. Revisa 'sendThoughtBtn'.");
    }


    // 3. Obtener y Mostrar Pensamiento Destacado
    const fetchFeaturedThought = async () => {
        console.log("Intentando obtener pensamiento destacado...");
        try {
            if (!db) { // Verificar si db está inicializado
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

    // "Ver mis pensamientos" - Ahora despliega la sección de pensamientos
    if (myThoughtsCard && myThoughtsDisplaySection && myThoughtsList && closeMyThoughtsBtn) {
        myThoughtsCard.addEventListener('click', () => {
            console.log("Clic en 'Ver mis pensamientos'. Mostrando sección.");
            const localThoughts = getLocalThoughts();
            myThoughtsList.innerHTML = ''; // Limpiar lista antes de añadir

            if (localThoughts.length > 0) {
                // Ordenar los pensamientos por fecha de creación (más recientes primero)
                localThoughts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                localThoughts.forEach(thought => {
                    const thoughtItem = document.createElement('p');
                    thoughtItem.classList.add('my-thought-item');
                    // Usar innerHTML para interpretar <br> si el usuario los puso
                    thoughtItem.innerHTML = `${thought.content}<span class="my-thought-date">${formatThoughtDateTime(thought.timestamp)}</span>`;
                    myThoughtsList.appendChild(thoughtItem);
                });
            } else {
                const noThoughtsMessage = document.createElement('p');
                noThoughtsMessage.classList.add('no-thoughts-message');
                noThoughtsMessage.textContent = 'Aún no has escrito pensamientos hoy.';
                myThoughtsList.appendChild(noThoughtsMessage);
            }
            myThoughtsDisplaySection.style.display = 'block'; // Mostrar la sección
        });

        // Botón de cierre para la sección de pensamientos del usuario
        closeMyThoughtsBtn.addEventListener('click', () => {
            console.log("Clic en cerrar pensamientos. Ocultando sección.");
            myThoughtsDisplaySection.style.display = 'none'; // Ocultar la sección
        });

    } else {
        console.error("No se pudo adjuntar el listener 'click' a 'myThoughtsCard' o faltan elementos de la sección de pensamientos.");
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
