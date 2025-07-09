// Importa las funciones necesarias de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, onSnapshot, serverTimestamp, doc, updateDoc, FieldValue } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
    // CAMBIO: Nueva referencia para la tarjeta "Ecos del Pensamiento"
    const ecosThoughtsCard = document.getElementById('ecosThoughtsCard');

    // Elementos del DOM para la sección de pensamientos del usuario
    const myThoughtsDisplaySection = document.getElementById('myThoughtsDisplaySection');
    const myThoughtsList = document.getElementById('myThoughtsList');
    const closeMyThoughtsBtn = document.getElementById('closeMyThoughts');

    const nextThoughtBtn = document.getElementById('nextThoughtBtn');


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
    if (!nextThoughtBtn) console.error("Error: Elemento 'nextThoughtBtn' no encontrado.");
    if (!ecosThoughtsCard) console.error("Error: Elemento 'ecosThoughtsCard' no encontrado.");


    const MAX_CHARS = 500; // Límite de caracteres por pensamiento
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

            // Añadir el pensamiento a la colección 'thoughts' con un contador de encuentros inicial
            const docRef = await addDoc(collection(db, "thoughts"), {
                content: thoughtText,
                createdAt: serverTimestamp(),
                encounters: 0 // NUEVO: Contador de encuentros inicializado a 0
            });

            addLocalThought(thoughtText, docRef.id); // Guardar localmente con fecha/hora e ID del documento
            thoughtInput.value = ''; // Limpiar campo
            charCount.textContent = MAX_CHARS; // Resetear contador
            charCount.style.color = 'var(--text-color-secondary)';
            sendThoughtBtn.style.display = 'none'; // Ocultar botón

            alert("¡Pensamiento enviado con éxito!");
            console.log("Pensamiento enviado a Firestore con ID:", docRef.id);
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

            const q = query(collection(db, "thoughts"), orderBy("createdAt", "desc"), limit(100)); // Obtiene los 100 más recientes
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const thoughtsWithIds = [];
                querySnapshot.forEach((doc) => {
                    thoughtsWithIds.push({ id: doc.id, ...doc.data() }); // Guardar ID y datos
                });
                const randomIndex = Math.floor(Math.random() * thoughtsWithIds.length);
                const featuredThoughtData = thoughtsWithIds[randomIndex]; // Obtener el objeto completo

                // Incrementar el contador de encuentros para este pensamiento
                const thoughtRef = doc(db, "thoughts", featuredThoughtData.id);
                await updateDoc(thoughtRef, {
                    encounters: FieldValue.increment(1) // Incrementar en 1
                });
                console.log(`Contador de encuentros incrementado para el pensamiento ID: ${featuredThoughtData.id}`);


                const featuredThoughtContent = featuredThoughtBox.querySelector('.featured-thought-content');
                const featuredThoughtPlaceholder = featuredThoughtBox.querySelector('.featured-thought-placeholder');


                if (featuredThoughtContent) {
                    featuredThoughtContent.textContent = `"${featuredThoughtData.content}"`;
                    featuredThoughtContent.style.display = 'flex';
                } else {
                    const newContent = document.createElement('p');
                    newContent.classList.add('featured-thought-content');
                    newContent.textContent = `"${featuredThoughtData.content}"`;
                    if (nextThoughtBtn) {
                        featuredThoughtBox.insertBefore(newContent, nextThoughtBtn);
                    } else {
                        featuredThoughtBox.appendChild(newContent);
                    }
                }

                if (featuredThoughtPlaceholder) featuredThoughtPlaceholder.style.display = 'none';
                console.log("Pensamiento destacado cargado:", featuredThoughtData.content);
            } else {
                featuredThoughtBox.innerHTML = `<p class="featured-thought-placeholder">PENSAMIENTO DESTACADO</p>`;
                if (featuredThoughtPlaceholder) featuredThoughtPlaceholder.style.display = 'block';
                console.log("No hay pensamientos en Firestore para destacar.");
            }
        } catch (e) {
            console.error("Error al obtener o actualizar pensamiento destacado: ", e);
            featuredThoughtBox.innerHTML = `<p class="featured-thought-placeholder">Error al cargar pensamiento.</p>`;
        }
    };

    // Cargar el primer pensamiento destacado al inicio
    fetchFeaturedThought();
    // Actualizar cada 30 minutos (1800000 ms)
    setInterval(fetchFeaturedThought, 1800000);

    // Listener para el botón de siguiente pensamiento
    if (nextThoughtBtn) {
        nextThoughtBtn.addEventListener('click', () => {
            console.log("Clic en 'Ver otro pensamiento'.");
            fetchFeaturedThought(); // Llama a la función para cargar un nuevo pensamiento
        });
    }


    // 4. Actualizar Conteo Global de Pensamientos en Tiempo Real
    if (totalThoughtsCountSpan) {
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

    // "Ver mis pensamientos" - Ahora despliega la sección de pensamientos con contador de encuentros
    if (myThoughtsCard && myThoughtsDisplaySection && myThoughtsList && closeMyThoughtsBtn) {
        myThoughtsCard.addEventListener('click', async () => { // Hacemos la función async
            console.log("Clic en 'Ver mis pensamientos'. Mostrando sección.");
            const localThoughts = getLocalThoughts();
            myThoughtsList.innerHTML = ''; // Limpiar lista antes de añadir

            if (localThoughts.length > 0) {
                // Ordenar los pensamientos por fecha de creación (más recientes primero)
                localThoughts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                for (const localThought of localThoughts) { // Usamos for...of para await
                    let encountersCount = '...'; // Placeholder mientras se carga
                    try {
                        if (db && localThought.id) { // Asegurarse de que db e id existan
                            const thoughtDoc = await getDocs(query(collection(db, "thoughts"), limit(1), orderBy("createdAt", "desc"))); // Fetch the thought by its ID
                            // This is a simplified approach. A more robust way would be to fetch the specific doc by ID.
                            // For now, we are just getting the latest thoughts, which might not include the specific thought by ID.
                            // A better approach would be: const docSnap = await getDoc(doc(db, "thoughts", localThought.id));
                            // If docSnap.exists(), encountersCount = docSnap.data().encounters;
                            // For now, let's assume localThought.id is the actual ID and fetch it directly.
                            const docSnap = await getDoc(doc(db, "thoughts", localThought.id));
                            if (docSnap.exists()) {
                                encountersCount = docSnap.data().encounters || 0;
                            } else {
                                encountersCount = 'N/A'; // No encontrado en Firestore
                            }
                        }
                    } catch (e) {
                        console.error("Error al obtener encuentros para el pensamiento:", localThought.id, e);
                        encountersCount = 'Error';
                    }

                    const thoughtItem = document.createElement('p');
                    thoughtItem.classList.add('my-thought-item');
                    thoughtItem.innerHTML = `${localThought.content}<br><span class="my-thought-date">${formatThoughtDateTime(localThought.timestamp)}</span><span class="my-thought-encounters">Encontrado: ${encountersCount} veces</span>`;
                    myThoughtsList.appendChild(thoughtItem);
                }
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


    // "Ecos del Pensamiento" - Listener para la nueva tarjeta
    if (ecosThoughtsCard) {
        ecosThoughtsCard.addEventListener('click', () => {
            // Podríamos mostrar una estadística general de encuentros aquí, o simplemente
            // dirigir al usuario a "Ver mis pensamientos" si es la forma principal de ver ecos.
            // Por ahora, mostrará una alerta simple.
            alert("Aquí se mostrarán estadísticas o un resumen de los 'Ecos de tus Pensamientos'.");
            console.log("Clic en Ecos del Pensamiento");
            // Opcional: myThoughtsCard.click(); para abrir directamente "Ver mis pensamientos"
        });
    }
});
