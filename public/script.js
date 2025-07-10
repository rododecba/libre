// Importa las funciones necesarias de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, onSnapshot, serverTimestamp, doc, updateDoc, getDoc, increment, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente cargado. Iniciando script.js...");

    // Tu configuración de Firebase
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


    // --- Referencias a elementos del DOM ---
    const thoughtInput = document.getElementById('thoughtInput');
    const charCount = document.getElementById('charCount');
    const sendThoughtBtn = document.getElementById('sendThoughtBtn');
    const featuredThoughtBox = document.querySelector('.featured-thought-box');
    const featuredThoughtPlaceholder = document.getElementById('featuredThoughtPlaceholder'); // Usar ID
    const featuredThoughtContent = document.getElementById('featuredThoughtContent'); // Usar ID

    // Cambio: Renombrado a 'myThoughtsCard' y 'totalThoughtsCountSpan' a 'globalThoughtCount'
    const myThoughtsCard = document.getElementById('myThoughtsCard'); // Ahora "Ecos de mis Pensamientos"
    const viewByCountryCard = document.getElementById('viewByCountryCard');
    const globalThoughtCountSpan = document.getElementById('globalThoughtCount'); // Contador global de pensamientos
    const thoughtsWrittenCard = document.getElementById('thoughtsWrittenCard'); // La tarjeta contenedora del contador

    // Elementos del DOM para la sección de pensamientos del usuario
    const myThoughtsDisplaySection = document.getElementById('myThoughtsDisplaySection');
    const myThoughtsList = document.getElementById('myThoughtsList');
    const closeMyThoughtsBtn = document.getElementById('closeMyThoughtsBtn'); // Usar ID
    const noMyThoughtsMessage = document.getElementById('noMyThoughtsMessage'); // Nuevo elemento

    const nextThoughtBtn = document.getElementById('nextThoughtBtn');

    // --- NUEVOS ELEMENTOS PARA CÁPSULA DEL TIEMPO ---
    const timeCapsuleCard = document.getElementById('timeCapsuleCard');
    const timeCapsuleSection = document.getElementById('timeCapsuleSection');
    const closeTimeCapsuleBtn = document.getElementById('closeTimeCapsuleBtn');
    const timeCapsuleInput = document.getElementById('timeCapsuleInput');
    const timeCapsuleCharCount = document.getElementById('timeCapsuleCharCount');
    const timeCapsuleDateInput = document.getElementById('timeCapsuleDate');
    const sendTimeCapsuleBtn = document.getElementById('sendTimeCapsuleBtn');
    const timeCapsuleList = document.getElementById('timeCapsuleList');
    const noTimeCapsuleMessage = document.getElementById('noTimeCapsuleMessage');

    // Elementos del DOM para la sección Ver por País (ya existentes en HTML)
    const viewByCountrySection = document.getElementById('viewByCountrySection');
    const closeViewByCountryBtn = document.getElementById('closeViewByCountryBtn');
    const mapContainer = document.getElementById('mapContainer');
    const countryThoughtsList = document.getElementById('countryThoughtsList');
    const noCountryThoughtsMessage = document.getElementById('noCountryThoughtsMessage');


    // Verificar que los elementos DOM existen y loguear si no (solo los nuevos o modificados)
    if (!thoughtInput) console.error("Error: Elemento 'thoughtInput' no encontrado.");
    if (!charCount) console.error("Error: Elemento 'charCount' no encontrado.");
    if (!sendThoughtBtn) console.error("Error: Elemento 'sendThoughtBtn' no encontrado.");
    if (!featuredThoughtBox) console.error("Error: Elemento 'featuredThoughtBox' no encontrado.");
    if (!globalThoughtCountSpan) console.error("Error: Elemento 'globalThoughtCountSpan' no encontrado.");
    if (!myThoughtsCard) console.error("Error: Elemento 'myThoughtsCard' no encontrado.");
    if (!myThoughtsDisplaySection) console.error("Error: Elemento 'myThoughtsDisplaySection' no encontrado.");
    if (!myThoughtsList) console.error("Error: Elemento 'myThoughtsList' no encontrado.");
    if (!closeMyThoughtsBtn) console.error("Error: Elemento 'closeMyThoughtsBtn' no encontrado.");
    if (!nextThoughtBtn) console.error("Error: Elemento 'nextThoughtBtn' no encontrado.");
    if (!timeCapsuleCard) console.error("Error: Elemento 'timeCapsuleCard' no encontrado.");
    if (!timeCapsuleSection) console.error("Error: Elemento 'timeCapsuleSection' no encontrado.");
    if (!closeTimeCapsuleBtn) console.error("Error: Elemento 'closeTimeCapsuleBtn' no encontrado.");
    if (!timeCapsuleInput) console.error("Error: Elemento 'timeCapsuleInput' no encontrado.");
    if (!timeCapsuleCharCount) console.error("Error: Elemento 'timeCapsuleCharCount' no encontrado.");
    if (!timeCapsuleDateInput) console.error("Error: Elemento 'timeCapsuleDateInput' no encontrado.");
    if (!sendTimeCapsuleBtn) console.error("Error: Elemento 'sendTimeCapsuleBtn' no encontrado.");
    if (!timeCapsuleList) console.error("Error: Elemento 'timeCapsuleList' no encontrado.");
    if (!noTimeCapsuleMessage) console.error("Error: Elemento 'noTimeCapsuleMessage' no encontrado.");
    if (!viewByCountrySection) console.error("Error: Elemento 'viewByCountrySection' no encontrado.");
    if (!closeViewByCountryBtn) console.error("Error: Elemento 'closeViewByCountryBtn' no encontrado.");
    if (!mapContainer) console.error("Error: Elemento 'mapContainer' no encontrado.");
    if (!countryThoughtsList) console.error("Error: Elemento 'countryThoughtsList' no encontrado.");
    if (!noCountryThoughtsMessage) console.error("Error: Elemento 'noCountryThoughtsMessage' no encontrado.");


    const MAX_CHARS_THOUGHT = 200; // Límite de caracteres por pensamiento normal
    const MAX_CHARS_TIME_CAPSULE = 500; // Límite de caracteres para cápsula del tiempo (más largo)
    const THOUGHTS_PER_DAY_LIMIT = 3; // Límite de pensamientos por día

    // --- Funciones de Utilidad ---

    // Función para obtener la fecha de hoy en formato ISO (YYYY-MM-DD)
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

    // Función para guardar un pensamiento localmente (ahora guarda también timestamp Y ID de Firestore)
    const addLocalThought = (thoughtContent, thoughtId) => {
        const today = getTodayDate();
        const thoughts = getLocalThoughts();
        const newThought = {
            content: thoughtContent,
            timestamp: new Date().toISOString(), // Guarda la fecha y hora en formato ISO
            id: thoughtId // Guarda el ID del documento de Firestore
        };
        thoughts.push(newThought);
        localStorage.setItem(`thoughts_${today}`, JSON.stringify(thoughts));
        console.log("Pensamiento guardado localmente:", newThought);
    };

    // Función para formatear la fecha y hora
    const formatDateTime = (isoStringOrTimestamp) => {
        let date;
        if (isoStringOrTimestamp && typeof isoStringOrTimestamp.toDate === 'function') {
            // Es un Firebase Timestamp
            date = isoStringOrTimestamp.toDate();
        } else if (typeof isoStringOrTimestamp === 'string') {
            // Es un ISO string
            date = new Date(isoStringOrTimestamp);
        } else {
            return 'Fecha inválida';
        }

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

    // Función para formatear solo la fecha (para la cápsula del tiempo)
    const formatDateOnly = (dateObj) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return dateObj.toLocaleDateString('es-ES', options);
    };


    // Función genérica para ocultar todas las secciones desplegables
    const hideAllSections = () => {
        myThoughtsDisplaySection.style.display = 'none';
        timeCapsuleSection.style.display = 'none';
        viewByCountrySection.style.display = 'none';
        // Añadir aquí cualquier otra sección desplegable si la hay
    };

    // --- Lógica de la Aplicación Principal ---

    // 1. Contador de Caracteres, Botón de Enviar y Tecla Enter (Pensamiento normal)
    if (charCount) {
        charCount.textContent = `${MAX_CHARS_THOUGHT}/${MAX_CHARS_THOUGHT}`; // Inicializar
    }

    if (thoughtInput && charCount && sendThoughtBtn) {
        // Listener para el recuento de caracteres y visibilidad del botón
        thoughtInput.addEventListener('input', () => {
            const remaining = MAX_CHARS_THOUGHT - thoughtInput.value.length;
            charCount.textContent = `${thoughtInput.value.length}/${MAX_CHARS_THOUGHT}`;
            charCount.style.color = remaining < 20 ? 'orange' : (remaining < 10 ? 'red' : 'var(--text-color-secondary)');

            if (thoughtInput.value.trim().length > 0) {
                sendThoughtBtn.style.display = 'block';
            } else {
                sendThoughtBtn.style.display = 'none';
            }
        });

        // Listener para la tecla Enter
        thoughtInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendThought();
            }
        });
    }


    // Función para manejar el envío de un pensamiento (normal)
    const sendThought = async () => {
        const thoughtText = thoughtInput.value.trim();
        if (!thoughtText) {
            alert("Por favor, escribe un pensamiento antes de lanzar.");
            return;
        }

        const localThoughts = getLocalThoughts();
        if (localThoughts.length >= THOUGHTS_PER_DAY_LIMIT) {
            alert(`Lo siento, solo puedes lanzar ${THOUGHTS_PER_DAY_LIMIT} pensamientos por día.`);
            return;
        }

        try {
            if (!db) {
                console.error("Error: Firestore (db) no está inicializado.");
                alert("Error interno: La base de datos no está disponible.");
                return;
            }

            const docRef = await addDoc(collection(db, "thoughts"), {
                content: thoughtText,
                createdAt: serverTimestamp(),
                encounters: 0
            });

            addLocalThought(thoughtText, docRef.id);
            thoughtInput.value = '';
            charCount.textContent = `${MAX_CHARS_THOUGHT}/${MAX_CHARS_THOUGHT}`;
            charCount.style.color = 'var(--text-color-secondary)';
            sendThoughtBtn.style.display = 'none';

            alert("¡Pensamiento lanzado con éxito!");
        } catch (e) {
            console.error("Error al añadir el documento: ", e);
            alert("Hubo un error al lanzar tu pensamiento. Inténtalo de nuevo.");
        }
    };

    // 2. Enviar Pensamiento a Firestore (normal)
    if (sendThoughtBtn) {
        sendThoughtBtn.addEventListener('click', sendThought);
    }


    // 3. Obtener y Mostrar Pensamiento Destacado
    const fetchFeaturedThought = async () => {
        try {
            if (!db) {
                featuredThoughtContent.textContent = "Error: DB no disponible.";
                return;
            }

            const q = query(collection(db, "thoughts"), orderBy("createdAt", "desc"), limit(100)); // Obtiene los 100 más recientes
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const thoughtsWithIds = [];
                querySnapshot.forEach((doc) => {
                    thoughtsWithIds.push({ id: doc.id, ...doc.data() });
                });
                const randomIndex = Math.floor(Math.random() * thoughtsWithIds.length);
                const featuredThoughtData = thoughtsWithIds[randomIndex];

                // Incrementar el contador de encuentros para este pensamiento
                if (featuredThoughtData.id) {
                    const thoughtRef = doc(db, "thoughts", featuredThoughtData.id);
                    await updateDoc(thoughtRef, {
                        encounters: increment(1)
                    });
                }

                featuredThoughtContent.textContent = `"${featuredThoughtData.content}"`;
                featuredThoughtContent.style.display = 'flex';
                if (featuredThoughtPlaceholder) featuredThoughtPlaceholder.style.display = 'none';
            } else {
                featuredThoughtContent.style.display = 'none';
                if (featuredThoughtPlaceholder) featuredThoughtPlaceholder.style.display = 'block';
            }
        } catch (e) {
            console.error("Error al obtener o actualizar pensamiento destacado: ", e);
            featuredThoughtContent.textContent = "Error al cargar pensamiento.";
            featuredThoughtContent.style.display = 'flex';
            if (featuredThoughtPlaceholder) featuredThoughtPlaceholder.style.display = 'none';
        }
    };

    // Cargar el primer pensamiento destacado al inicio
    fetchFeaturedThought();
    // Actualizar cada 30 minutos (1800000 ms)
    setInterval(fetchFeaturedThought, 1800000);

    // Listener para el botón de siguiente pensamiento
    if (nextThoughtBtn) {
        nextThoughtBtn.addEventListener('click', fetchFeaturedThought);
    }


    // 4. Actualizar Conteo Global de Pensamientos en Tiempo Real
    if (globalThoughtCountSpan) {
        onSnapshot(collection(db, "thoughts"), (snapshot) => {
            globalThoughtCountSpan.textContent = snapshot.size;
        }, (error) => {
            console.error("Error al obtener el conteo en tiempo real: ", error);
            globalThoughtCountSpan.textContent = "Error";
        });
    }


    // --- Funcionalidad de las Tarjetas Interactivas ---

    // 5. "Ecos de mis Pensamientos" (Unificado)
    if (myThoughtsCard && myThoughtsDisplaySection && myThoughtsList && closeMyThoughtsBtn) {
        myThoughtsCard.addEventListener('click', async () => {
            hideAllSections(); // Ocultar otras secciones
            const localThoughts = getLocalThoughts();
            myThoughtsList.innerHTML = ''; // Limpiar lista antes de añadir

            if (localThoughts.length > 0) {
                noMyThoughtsMessage.style.display = 'none'; // Ocultar mensaje de no hay pensamientos
                localThoughts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                for (const localThought of localThoughts) {
                    let encountersCount = '...';
                    try {
                        if (db && localThought.id) {
                            const docSnap = await getDoc(doc(db, "thoughts", localThought.id));
                            if (docSnap.exists()) {
                                encountersCount = docSnap.data().encounters || 0;
                            } else {
                                encountersCount = 'N/A (No encontrado)';
                            }
                        } else {
                            encountersCount = 'N/A (Sin ID/DB)';
                        }
                    } catch (e) {
                        console.error("Error al obtener encuentros para el pensamiento:", localThought.id, e);
                        encountersCount = 'Error';
                    }

                    const thoughtItem = document.createElement('p');
                    thoughtItem.classList.add('my-thought-item');
                    thoughtItem.innerHTML = `${localThought.content}<br><span class="my-thought-date">${formatDateTime(localThought.timestamp)}</span><span class="my-thought-encounters">Encontrado: ${encountersCount} veces</span>`;
                    myThoughtsList.appendChild(thoughtItem);
                }
            } else {
                noMyThoughtsMessage.style.display = 'block'; // Mostrar mensaje de no hay pensamientos
            }
            myThoughtsDisplaySection.style.display = 'block'; // Mostrar la sección
        });

        closeMyThoughtsBtn.addEventListener('click', () => {
            myThoughtsDisplaySection.style.display = 'none';
        });
    }


    // 6. "Ver por País" - Placeholder para la integración del mapa
    if (viewByCountryCard && viewByCountrySection && closeViewByCountryBtn) {
        viewByCountryCard.addEventListener('click', () => {
            hideAllSections(); // Ocultar otras secciones
            viewByCountrySection.style.display = 'block';
            alert("Funcionalidad 'Ver por País' en desarrollo. Aquí se integrará un mapa mundial."); // Reemplazar con UI real
            // TODO: Integrar Leaflet aquí.
        });

        closeViewByCountryBtn.addEventListener('click', () => {
            viewByCountrySection.style.display = 'none';
        });
    }

    // --- NUEVA FUNCIONALIDAD: CÁPSULA DEL TIEMPO ---
    if (timeCapsuleCard && timeCapsuleSection && closeTimeCapsuleBtn && timeCapsuleInput && timeCapsuleCharCount && timeCapsuleDateInput && sendTimeCapsuleBtn && timeCapsuleList) {

        // Listener para la tarjeta "Cápsula del Tiempo"
        timeCapsuleCard.addEventListener('click', () => {
            hideAllSections(); // Ocultar otras secciones
            timeCapsuleSection.style.display = 'block';
            displayTimeCapsules(); // Cargar y mostrar las cápsulas disponibles
        });

        // Botón de cierre para la sección de la cápsula del tiempo
        closeTimeCapsuleBtn.addEventListener('click', () => {
            timeCapsuleSection.style.display = 'none';
        });

        // Contador de caracteres para el input de la cápsula
        timeCapsuleCharCount.textContent = `0/${MAX_CHARS_TIME_CAPSULE}`;
        timeCapsuleInput.addEventListener('input', () => {
            const currentLength = timeCapsuleInput.value.length;
            const remaining = MAX_CHARS_TIME_CAPSULE - currentLength;
            timeCapsuleCharCount.textContent = `${currentLength}/${MAX_CHARS_TIME_CAPSULE}`;
            timeCapsuleCharCount.style.color = remaining < 50 ? 'orange' : (remaining < 10 ? 'red' : 'var(--text-color-secondary)');
            // Podríamos añadir lógica para mostrar/ocultar el botón "Programar Mensaje" si el campo no está vacío
            if (currentLength > 0 && timeCapsuleDateInput.value) {
                sendTimeCapsuleBtn.style.display = 'block';
            } else {
                sendTimeCapsuleBtn.style.display = 'none';
            }
        });

        // Listener para el cambio de fecha para mostrar/ocultar botón de envío
        timeCapsuleDateInput.addEventListener('change', () => {
            if (timeCapsuleInput.value.trim().length > 0 && timeCapsuleDateInput.value) {
                sendTimeCapsuleBtn.style.display = 'block';
            } else {
                sendTimeCapsuleBtn.style.display = 'none';
            }
            // Asegurarse de que la fecha seleccionada no sea anterior a hoy
            const selectedDate = new Date(timeCapsuleDateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Resetear hora para comparar solo fechas
            if (selectedDate < today) {
                alert("La fecha de despliegue no puede ser anterior a hoy.");
                timeCapsuleDateInput.value = ''; // Limpiar la selección de fecha
                sendTimeCapsuleBtn.style.display = 'none';
            }
        });

        // Establecer la fecha mínima en el input de fecha (para evitar fechas pasadas)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        timeCapsuleDateInput.min = `${year}-${month}-${day}`;


        // Función para enviar una cápsula del tiempo
        sendTimeCapsuleBtn.addEventListener('click', async () => {
            const message = timeCapsuleInput.value.trim();
            const deployDate = timeCapsuleDateInput.value; // Formato YYYY-MM-DD

            if (!message || !deployDate) {
                alert("Por favor, escribe tu mensaje y selecciona una fecha de despliegue.");
                return;
            }

            // Convertir la fecha de despliegue a un objeto Date para Firestore
            const deployDateTime = new Date(deployDate);
            // Asegurarse de que la fecha no sea en el pasado
            const now = new Date();
            now.setHours(0,0,0,0); // Comparar solo el día
            if (deployDateTime < now) {
                alert("No puedes programar un mensaje para una fecha pasada.");
                return;
            }


            try {
                await addDoc(collection(db, "timeCapsules"), {
                    content: message,
                    deployDate: deployDateTime, // Guardar como Timestamp de Firebase
                    createdAt: serverTimestamp(),
                });

                alert("¡Mensaje de la cápsula del tiempo programado con éxito!");
                timeCapsuleInput.value = '';
                timeCapsuleCharCount.textContent = `0/${MAX_CHARS_TIME_CAPSULE}`;
                timeCapsuleDateInput.value = '';
                sendTimeCapsuleBtn.style.display = 'none';
                displayTimeCapsules(); // Recargar la lista de cápsulas desplegadas
            } catch (e) {
                console.error("Error al programar la cápsula del tiempo: ", e);
                alert("Hubo un error al programar tu mensaje. Inténtalo de nuevo.");
            }
        });

        // Función para mostrar las cápsulas del tiempo desplegadas
        const displayTimeCapsules = async () => {
            timeCapsuleList.innerHTML = ''; // Limpiar lista
            const now = new Date();
            now.setHours(0, 0, 0, 0); // Para comparar solo la fecha

            try {
                // Consultar cápsulas cuya fecha de despliegue es hoy o anterior
                const q = query(
                    collection(db, "timeCapsules"),
                    where("deployDate", "<=", now), // Filtrar por fecha de despliegue
                    orderBy("deployDate", "desc"), // Ordenar por fecha de despliegue (más recientes primero)
                    limit(50) // Limitar para no cargar demasiados
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    noTimeCapsuleMessage.style.display = 'none';
                    querySnapshot.forEach((doc) => {
                        const capsule = doc.data();
                        const capsuleItem = document.createElement('p');
                        capsuleItem.classList.add('my-thought-item'); // Reutilizar estilo
                        capsuleItem.innerHTML = `"${capsule.content}"<br><span class="my-thought-date">Programado para: ${formatDateOnly(capsule.deployDate.toDate())}</span>`;
                        timeCapsuleList.appendChild(capsuleItem);
                    });
                } else {
                    noTimeCapsuleMessage.style.display = 'block';
                }
            } catch (e) {
                console.error("Error al obtener cápsulas del tiempo: ", e);
                timeCapsuleList.innerHTML = `<p class="no-thoughts-message">Error al cargar las cápsulas del tiempo.</p>`;
            }
        };

        // Llama a displayTimeCapsules cuando la sección se abre
        // Esto se hace en el listener de timeCapsuleCard.click()
    } else {
        console.error("Faltan elementos DOM para la funcionalidad de la Cápsula del Tiempo.");
    }
    // --- FIN NUEVA FUNCIONALIDAD: CÁPSULA DEL TIEMPO ---

});
