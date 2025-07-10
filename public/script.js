// Importa las funciones necesarias de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// Importar 'increment' directamente junto con las otras funciones
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, onSnapshot, serverTimestamp, doc, updateDoc, FieldValue, getDoc, increment } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"; 
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";


document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente cargado. Iniciando script.js...");

    // Variables globales de Firebase (proporcionadas por el entorno Canvas)
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    let db; // Declara db aquí para que sea accesible en todo el ámbito
    let userId = null; // Para almacenar el ID del usuario actual
    let isAuthReady = false; // Bandera para indicar que la autenticación ha sido verificada

    // Inicializa Firebase
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app); // Asigna la instancia de Firestore
        const auth = getAuth(app); // Inicializa Auth
        console.log("Firebase inicializado y Firestore conectado.");

        // Autenticación de Firebase
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
                console.log('Usuario autenticado:', userId);
                document.getElementById('userIdDisplay').textContent = `Tu ID de usuario: ${userId}`;
            } else {
                // Si no hay token inicial, inicia sesión anónimamente
                if (!initialAuthToken) {
                    try {
                        const anonUser = await signInAnonymously(auth);
                        userId = anonUser.user.uid;
                        console.log('Sesión anónima iniciada:', userId);
                        document.getElementById('userIdDisplay').textContent = `Tu ID de usuario: ${userId}`;
                    } catch (error) {
                        console.error("Error al iniciar sesión anónimamente:", error);
                        // showMessage('Error al iniciar sesión. Algunas funciones pueden no estar disponibles.', 'error', 0); // Reemplazar con modal
                    }
                } else {
                    // Si hay un token inicial, úsalo para iniciar sesión
                    try {
                        const customUser = await signInWithCustomToken(auth, initialAuthToken);
                        userId = customUser.user.uid;
                        console.log('Sesión con token personalizado iniciada:', userId);
                        document.getElementById('userIdDisplay').textContent = `Tu ID de usuario: ${userId}`;
                    } catch (error) {
                        console.error("Error al iniciar sesión con token personalizado:", error);
                        // showMessage('Error al iniciar sesión con token. Algunas funciones pueden no estar disponibles.', 'error', 0); // Reemplazar con modal
                    }
                }
            }
            isAuthReady = true; // La autenticación ha sido verificada
            // Una vez que la autenticación está lista, carga los datos iniciales
            fetchFeaturedThought();
            fetchMyThoughts();

            // Actualizar Conteo Global de Pensamientos en Tiempo Real
            const totalThoughtsCountSpan = document.getElementById('totalThoughtsCount');
            if (totalThoughtsCountSpan) {
                onSnapshot(collection(db, `artifacts/${appId}/public/data/thoughts`), (snapshot) => {
                    totalThoughtsCountSpan.textContent = `${snapshot.size} pensamientos escritos`;
                    console.log("Conteo de pensamientos actualizado:", snapshot.size);
                }, (error) => {
                    console.error("Error al obtener el conteo en tiempo real: ", error);
                    totalThoughtsCountSpan.textContent = "Error al cargar conteo";
                });
            } else {
                console.error("No se pudo adjuntar el listener 'onSnapshot' porque 'totalThoughtsCountSpan' no fue encontrado.");
            }
        });

    } catch (error) {
        console.error("Error al inicializar Firebase:", error);
        // alert("Error al conectar con Firebase. Revisa la consola para más detalles."); // Reemplazar con modal
        return; // Detener la ejecución si Firebase no se inicializa
    }


    // Referencias a elementos del DOM
    const thoughtInput = document.getElementById('thoughtInput');
    const charCount = document.getElementById('charCount');
    const sendThoughtBtn = document.getElementById('sendThoughtBtn');
    const featuredThoughtBox = document.querySelector('.featured-thought-box');
    const featuredThoughtPlaceholder = document.querySelector('.featured-thought-placeholder');
    // const totalThoughtsCountSpan = document.getElementById('totalThoughtsCount'); // Ya definida arriba

    const myThoughtsCard = document.getElementById('myThoughtsCard');
    const viewByCountryCard = document.getElementById('viewByCountryCard');
    const ecosThoughtsCard = document.getElementById('ecosThoughtsCard');

    // Elementos del DOM para la sección de pensamientos del usuario
    const myThoughtsDisplaySection = document.getElementById('myThoughtsDisplaySection');
    const myThoughtsList = document.getElementById('myThoughtsList');
    const closeMyThoughtsBtn = document.getElementById('closeMyThoughts');

    const nextThoughtBtn = document.getElementById('nextThoughtBtn');

    // Referencias al modal de confirmación
    const confirmModal = document.getElementById('confirmModal');
    const modalMessage = document.getElementById('modalMessage');
    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');

    // Referencias al messageBox (para reemplazar alerts)
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const messageIcon = document.getElementById('messageIcon');


    // Verificar que los elementos DOM existen y loguear si no
    if (!thoughtInput) console.error("Error: Elemento 'thoughtInput' no encontrado.");
    if (!charCount) console.error("Error: Elemento 'charCount' no encontrado.");
    if (!sendThoughtBtn) console.error("Error: Elemento 'sendThoughtBtn' no encontrado. Asegúrate de que el ID 'sendThoughtBtn' esté en tu HTML.");
    if (!featuredThoughtBox) console.error("Error: Elemento 'featuredThoughtBox' no encontrado.");
    // if (!totalThoughtsCountSpan) console.error("Error: Elemento 'totalThoughtsCountSpan' no encontrado."); // Ya definida
    if (!myThoughtsCard) console.error("Error: Elemento 'myThoughtsCard' no encontrado.");
    if (!myThoughtsDisplaySection) console.error("Error: Elemento 'myThoughtsDisplaySection' no encontrado.");
    if (!myThoughtsList) console.error("Error: Elemento 'myThoughtsList' no encontrado.");
    if (!closeMyThoughtsBtn) console.error("Error: Elemento 'closeMyThoughtsBtn' no encontrado.");
    if (!nextThoughtBtn) console.error("Error: Elemento 'nextThoughtBtn' no encontrado.");
    if (!ecosThoughtsCard) console.error("Error: Elemento 'ecosThoughtsCard' no encontrado.");
    if (!confirmModal) console.error("Error: Elemento 'confirmModal' no encontrado.");
    if (!messageBox) console.error("Error: Elemento 'messageBox' no encontrado.");


    const MAX_CHARS = 500; // Límite de caracteres por pensamiento
    const THOUGHTS_PER_DAY_LIMIT = 3; // Límite de pensamientos por día

    // --- Funciones de Utilidad ---

    /**
     * Muestra un mensaje de estado en la interfaz.
     * @param {string} message - El texto del mensaje.
     * @param {'success'|'error'|'loading'} type - El tipo de mensaje (para aplicar estilos).
     * @param {number} duration - Duración en milisegundos antes de ocultar el mensaje (0 para no ocultar automáticamente).
     */
    function showMessage(message, type, duration = 3000) {
        messageText.textContent = message;
        messageBox.className = `message-box show ${type}`;
        messageIcon.className = ''; // Limpia iconos anteriores
        if (type === 'success') messageIcon.classList.add('fas', 'fa-check-circle');
        if (type === 'error') messageIcon.classList.add('fas', 'fa-exclamation-triangle');
        if (type === 'loading') messageIcon.classList.add('fas', 'fa-spinner', 'fa-spin');

        if (duration > 0) {
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, duration);
        }
    }

    /**
     * Oculta el mensaje de estado.
     */
    function hideMessage() {
        messageBox.classList.remove('show');
    }

    /**
     * Muestra el modal de confirmación y devuelve una promesa que se resuelve con true/false.
     * @param {string} message - El mensaje a mostrar en el modal.
     * @returns {Promise<boolean>} - True si el usuario confirma, false si cancela.
     */
    function showConfirmModal(message) {
        return new Promise((resolve) => {
            modalMessage.textContent = message;
            confirmModal.classList.add('show');

            // Restaurar botones de confirmación/cancelación
            confirmButton.style.display = 'inline-block';
            cancelButton.style.display = 'inline-block';

            const onConfirm = () => {
                confirmModal.classList.remove('show');
                confirmButton.removeEventListener('click', onConfirm);
                cancelButton.removeEventListener('click', onCancel);
                resolve(true);
            };

            const onCancel = () => {
                confirmModal.classList.remove('show');
                confirmButton.removeEventListener('click', onConfirm);
                cancelButton.removeEventListener('click', onCancel);
                resolve(false);
            };

            confirmButton.addEventListener('click', onConfirm);
            cancelButton.addEventListener('click', onCancel);
        });
    }

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
            showMessage("Por favor, escribe un pensamiento antes de enviar.", "error");
            return;
        }

        const localThoughts = getLocalThoughts();
        if (localThoughts.length >= THOUGHTS_PER_DAY_LIMIT) {
            showMessage(`Lo siento, solo puedes escribir ${THOUGHTS_PER_DAY_LIMIT} pensamientos por día.`, "error");
            return;
        }

        try {
            if (!db) { // Verificar si db está inicializado
                console.error("Error: Firestore (db) no está inicializado.");
                showMessage("Error interno: La base de datos no está disponible.", "error");
                return;
            }
            if (!userId) {
                showMessage("Error: Usuario no autenticado. Recarga la página.", "error");
                return;
            }

            showMessage('Enviando pensamiento...', 'loading', 0); // Muestra mensaje de carga indefinido

            // Añadir el pensamiento a la colección 'thoughts' con un contador de encuentros inicial
            const docRef = await addDoc(collection(db, `artifacts/${appId}/public/data/thoughts`), {
                content: thoughtText,
                createdAt: serverTimestamp(),
                encounters: 0, // NUEVO: Contador de encuentros inicializado a 0
                userId: userId // Guarda el ID del usuario que envió el pensamiento
            });

            addLocalThought(thoughtText, docRef.id); // Guardar localmente con fecha/hora e ID del documento
            thoughtInput.value = ''; // Limpiar campo
            charCount.textContent = MAX_CHARS; // Resetear contador
            charCount.style.color = 'var(--text-color-secondary)';
            sendThoughtBtn.style.display = 'none'; // Ocultar botón

            showMessage("¡Pensamiento enviado con éxito!", "success");
            console.log("Pensamiento enviado a Firestore con ID:", docRef.id);
        } catch (e) {
            console.error("Error al añadir el documento: ", e);
            showMessage("Hubo un error al enviar tu pensamiento. Inténtalo de nuevo.", "error");
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
            charCount.style.color = remaining < 50 ? 'orange' : (remaining < 10 ? 'red' : '#777'); // Usar color directo si var no está definida

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
                console.error("Error: Firestore (db) no está inicializado para fetchFeaturedThought. No se puede obtener pensamiento.");
                featuredThoughtBox.innerHTML = `<p class="featured-thought-placeholder">Error: DB no disponible.</p>`;
                return;
            }

            const q = query(collection(db, `artifacts/${appId}/public/data/thoughts`), orderBy("createdAt", "desc"), limit(100)); // Obtiene los 100 más recientes
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const thoughtsWithIds = [];
                querySnapshot.forEach((doc) => {
                    thoughtsWithIds.push({ id: doc.id, ...doc.data() }); // Guardar ID y datos
                });
                const randomIndex = Math.floor(Math.random() * thoughtsWithIds.length);
                const featuredThoughtData = thoughtsWithIds[randomIndex]; // Obtener el objeto completo

                // Incrementar el contador de encuentros para este pensamiento
                // Solo si el pensamiento tiene un ID válido y db está disponible
                if (featuredThoughtData.id && db) {
                    const thoughtRef = doc(db, `artifacts/${appId}/public/data/thoughts`, featuredThoughtData.id);
                    await updateDoc(thoughtRef, {
                        encounters: increment(1) // Incrementar en 1
                    });
                    console.log(`Contador de encuentros incrementado para el pensamiento ID: ${featuredThoughtData.id}`);
                } else {
                    console.warn("No se pudo incrementar el contador de encuentros: ID de pensamiento o DB no disponible.");
                }


                const currentThoughtContent = featuredThoughtBox.querySelector('.featured-thought-content');
                // const featuredThoughtPlaceholder = featuredThoughtBox.querySelector('.featured-thought-placeholder'); // Ya definida

                // Actualizar el contenido del pensamiento destacado
                if (currentThoughtContent) {
                    currentThoughtContent.textContent = `"${featuredThoughtData.content}"`;
                    currentThoughtContent.style.display = 'flex';
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
    // fetchFeaturedThought(); // Se llama después de que la autenticación está lista
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
    // Movido a la sección de autenticación para asegurar que db y appId estén listos


    // 5. Funcionalidad de las Tarjetas Interactivas

    // "Ver mis pensamientos" - Ahora despliega la sección de pensamientos con contador de encuentros
    if (myThoughtsCard && myThoughtsDisplaySection && myThoughtsList && closeMyThoughtsBtn) {
        myThoughtsCard.addEventListener('click', async () => { // Hacemos la función async
            console.log("Clic en 'Ver mis pensamientos'. Mostrando sección.");
            const localThoughts = getLocalThoughts();
            myThoughtsList.innerHTML = ''; // Limpiar lista antes de añadir

            if (!userId || !isAuthReady) {
                myThoughtsList.innerHTML = '<li><p>Cargando tus pensamientos...</p></li>';
                showMessage("Iniciando sesión... Por favor, espera.", "loading", 0);
                return;
            }

            if (localThoughts.length > 0) {
                // Ordenar los pensamientos por fecha de creación (más recientes primero)
                localThoughts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                for (const localThought of localThoughts) { // Usamos for...of para await
                    let encountersCount = '...'; // Placeholder mientras se carga
                    try {
                        if (db && localThought.id) { // Asegurarse de que db e id existan
                            const docSnap = await getDoc(doc(db, `artifacts/${appId}/public/data/thoughts`, localThought.id)); // Obtener el documento por su ID
                            if (docSnap.exists()) {
                                encountersCount = docSnap.data().encounters || 0;
                            } else {
                                encountersCount = 'N/A (No encontrado en DB)'; // No encontrado en Firestore
                            }
                        } else {
                            encountersCount = 'N/A (Sin ID/DB)'; // Si no hay ID o DB
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
            hideMessage(); // Ocultar mensaje de carga
        });

        // Botón de cierre para la sección de pensamientos del usuario
        closeMyThoughtsBtn.addEventListener('click', () => {
            console.log("Clic en cerrar pensamientos. Ocultando sección.");
            myThoughtsDisplaySection.style.display = 'none'; // Ocultar la sección
        });

    } else {
        console.error("No se pudo adjuntar el listener 'click' a 'myThoughtsCard' o faltan elementos de la sección de pensamientos.");
    }

    // Función para obtener y mostrar los pensamientos del usuario (para onSnapshot)
    async function fetchMyThoughts() {
        if (!userId || !isAuthReady) {
            console.log('Auth o userId no están listos para buscar mis pensamientos.');
            return;
        }
        try {
            const q = query(
                collection(db, `artifacts/${appId}/public/data/thoughts`),
                where("userId", "==", userId)
            );
            onSnapshot(q, (snapshot) => {
                myThoughtsList.innerHTML = ''; // Limpia la lista para actualizar en tiempo real
                if (snapshot.empty) {
                    myThoughtsList.innerHTML = '<li><p>Aún no has enviado ningún pensamiento. ¡Anímate!</p></li>';
                    return;
                }
                const thoughts = [];
                snapshot.forEach(doc => {
                    thoughts.push({ id: doc.id, ...doc.data() });
                });
                thoughts.sort((a, b) => {
                    const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
                    const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
                    return dateB - dateA;
                });

                thoughts.forEach(thought => {
                    const li = document.createElement('li');
                    const date = thought.createdAt ? new Date(thought.createdAt.toDate()).toLocaleString() : 'Fecha desconocida';
                    const encounters = thought.encounters !== undefined ? thought.encounters : 'N/A';
                    li.innerHTML = `
                        <p>${thought.content}</p>
                        <span class="my-thought-date">Enviado: ${date}</span>
                        <span class="my-thought-encounters">Encontrado: ${encounters} veces</span>
                    `;
                    myThoughtsList.appendChild(li);
                });
            }, (error) => {
                console.error("Error al obtener mis pensamientos en tiempo real: ", error);
                myThoughtsList.innerHTML = '<li><p>Error al cargar tus pensamientos.</p></li>';
            });
        } catch (e) {
            console.error("Error al configurar listener para mis pensamientos: ", e);
        }
    }


    // "Ver por País" - Placeholder para la integración del mapa
    if (viewByCountryCard) {
        viewByCountryCard.addEventListener('click', () => {
            showMessage("Funcionalidad 'Ver por País' en desarrollo. Aquí se integrará un mapa mundial.", "info"); // Usar showMessage
            console.log("Clic en Ver por País");
            // Ocultar otras secciones y mostrar un mensaje
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            // Podrías tener una sección específica para este mensaje si no quieres usar el modal
            // Por ahora, solo se muestra el mensaje temporal
        });
    }


    // "Ecos del Pensamiento" - Listener para la nueva tarjeta
    if (ecosThoughtsCard) {
        ecosThoughtsCard.addEventListener('click', () => {
            showMessage("Aquí se mostrarán estadísticas o un resumen de los 'Ecos de tus Pensamientos'.", "info"); // Usar showMessage
            console.log("Clic en Ecos del Pensamiento");
            // Opcional: myThoughtsCard.click(); para abrir directamente "Ver mis pensamientos"
        });
    }

    // Navegación entre secciones
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.dataset.section;
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            } else {
                console.error(`Sección con ID ${sectionId} no encontrada.`);
            }
        });
    });

    // Activa la sección de "Enviar un pensamiento" al cargar la página
    // document.addEventListener('DOMContentLoaded', () => { // Ya envuelto en DOMContentLoaded
    //     document.getElementById('sendThoughtSection').classList.add('active');
    //     charCount.textContent = MAX_CHARS; // Inicializa el contador
    // });
});
