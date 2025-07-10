// Importa las funciones necesarias de Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, orderBy, limit, serverTimestamp, increment } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Variables globales de Firebase (proporcionadas por el entorno Canvas)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userId = null; // Para almacenar el ID del usuario actual
let isAuthReady = false; // Bandera para indicar que la autenticación ha sido verificada
let map = null; // Variable global para la instancia del mapa Leaflet

// Referencias a elementos del DOM
const navButtons = document.querySelectorAll('.nav-button');
const contentSections = document.querySelectorAll('.content-section');
const sendThoughtButton = document.getElementById('sendThoughtButton');
const thoughtInput = document.getElementById('thoughtInput');
const charCount = document.getElementById('charCount');
const featuredThoughtDisplay = document.getElementById('featuredThoughtDisplay');
const myThoughtsList = document.getElementById('myThoughtsList');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');
const messageIcon = document.getElementById('messageIcon');
const userIdDisplay = document.getElementById('userIdDisplay');
const nextThoughtBtn = document.getElementById('nextThoughtBtn'); // Asegurarse de que esta referencia exista
const totalThoughtsCount = document.getElementById('totalThoughtsCount'); // Referencia al contador global

// Referencias al modal de confirmación
const confirmModal = document.getElementById('confirmModal');
const modalMessage = document.getElementById('modalMessage');
const confirmButton = document.getElementById('confirmButton');
const cancelButton = document.getElementById('cancelButton');

// Constantes
const MAX_CHARS = 280;

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

/**
 * Activa la sección de contenido seleccionada.
 * @param {string} sectionId - El ID de la sección a activar.
 */
function activateSection(sectionId) {
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    console.log(`Sección activa: ${sectionId}`);

    // Si la sección del mapa se activa, inicializa o invalida el tamaño del mapa
    if (sectionId === 'mapDisplaySection') {
        console.log('Activando sección del mapa.');
        // Asegurarse de que L (Leaflet) esté disponible
        if (typeof L === 'undefined') {
            console.error('Leaflet (L) no está cargado. Asegúrate de que leaflet.js se carga ANTES de script.js.');
            showMessage('Error: El mapa no pudo cargarse. Recarga la página.', 'error');
            return;
        }
        if (map) {
            console.log('Mapa ya inicializado, invalidando tamaño.');
            map.invalidateSize(); // Asegura que el mapa se renderice correctamente si ya existe
        } else {
            console.log('Inicializando mapa por primera vez.');
            initializeMap(); // Inicializa el mapa si aún no se ha hecho
        }
        // Centra el mapa en una vista global al activarse
        if (map) {
            map.setView([20, 0], 2); // Centra el mapa en el mundo con un zoom bajo
            loadThoughtsForMap(); // Carga los pensamientos en el mapa
        }
    }
}

// --- Funciones de Geolocalización y Geocodificación Inversa ---

/**
 * Obtiene la ubicación del usuario (país y ciudad) usando la API de geolocalización
 * y un servicio de geocodificación inversa.
 * @returns {Promise<{country: string|null, city: string|null}>}
 */
async function getUserLocation() {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            console.warn('Geolocation is not supported by your browser.');
            resolve({ country: null, city: null });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Usar Nominatim de OpenStreetMap para geocodificación inversa
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
                    const data = await response.json();

                    const country = data.address.country || null;
                    const city = data.address.city || data.address.town || data.address.village || null;

                    console.log('Ubicación obtenida:', { country, city });
                    resolve({ country, city });
                } catch (error) {
                    console.error('Error during reverse geocoding:', error);
                    resolve({ country: null, city: null });
                }
            },
            (error) => {
                console.warn('Geolocation error:', error.message);
                // Si el usuario deniega el permiso o hay un error, resuelve con null
                resolve({ country: null, city: null });
            },
            {
                enableHighAccuracy: false, // No necesitamos alta precisión para el país
                timeout: 10000, // 10 segundos de timeout
                maximumAge: 0 // No usar una posición en caché
            }
        );
    });
}

// --- Funciones de Firestore ---

/**
 * Guarda un nuevo pensamiento en Firestore.
 * Incluye la geolocalización si está disponible.
 * @param {string} thoughtText - El texto del pensamiento.
 */
async function saveThought(thoughtText) {
    if (!userId) {
        showMessage('Error: Usuario no autenticado.', 'error');
        return;
    }

    showMessage('Enviando pensamiento...', 'loading', 0); // Muestra mensaje de carga indefinido

    try {
        const { country, city } = await getUserLocation(); // Intenta obtener la ubicación

        const thoughtData = {
            text: thoughtText,
            timestamp: serverTimestamp(), // Marca de tiempo del servidor
            userId: userId,
            country: country, // Guarda el país
            city: city, // Guarda la ciudad (puede ser null)
            encounters: 0 // Inicializa el contador de encuentros
        };

        // Guarda en la colección pública para que otros usuarios puedan verlos
        const thoughtsCollectionRef = collection(db, `artifacts/${appId}/public/data/thoughts`);
        await addDoc(thoughtsCollectionRef, thoughtData);

        showMessage('¡Pensamiento enviado con éxito!', 'success');
        thoughtInput.value = ''; // Limpia el input
        charCount.textContent = `0/${MAX_CHARS}`; // Resetea el contador
        fetchFeaturedThought(); // Actualiza el pensamiento destacado
        fetchMyThoughts(); // Actualiza la lista de mis pensamientos
    } catch (e) {
        console.error("Error al añadir documento: ", e);
        showMessage('Error al enviar el pensamiento. Inténtalo de nuevo.', 'error');
    }
}

/**
 * Busca un pensamiento destacado aleatorio de la colección pública.
 */
async function fetchFeaturedThought() {
    if (!isAuthReady) {
        console.log('Auth no está lista para buscar pensamiento destacado.');
        return;
    }

    featuredThoughtDisplay.innerHTML = '<p>Cargando pensamiento destacado...</p>';
    featuredThoughtDisplay.classList.add('loading');

    try {
        const thoughtsCollectionRef = collection(db, `artifacts/${appId}/public/data/thoughts`);
        // Obtener todos los documentos y luego elegir uno al azar en el cliente
        // Esto es para evitar problemas de índices con orderBy y limit en Firestore
        const snapshot = await getDocs(thoughtsCollectionRef);
        const thoughts = [];
        snapshot.forEach(doc => {
            thoughts.push({ id: doc.id, ...doc.data() });
        });

        if (thoughts.length > 0) {
            const randomIndex = Math.floor(Math.random() * thoughts.length);
            const thought = thoughts[randomIndex];

            // Incrementar el contador de encuentros
            if (thought.id) {
                const thoughtRef = doc(db, `artifacts/${appId}/public/data/thoughts`, thought.id);
                await updateDoc(thoughtRef, {
                    encounters: increment(1)
                });
                console.log(`Contador de encuentros incrementado para el pensamiento ID: ${thought.id}`);
            }

            const date = thought.timestamp ? new Date(thought.timestamp.toDate()).toLocaleString() : 'Fecha desconocida';
            const countryInfo = thought.country ? `<br>De: <strong>${thought.country}</strong>` : ''; // Muestra el país
            const encountersInfo = thought.encounters !== undefined ? `<br>Encontrado: <strong>${thought.encounters + 1}</strong> veces` : ''; // +1 porque se acaba de incrementar

            featuredThoughtDisplay.innerHTML = `
                <p>${thought.text}</p>
                <div class="meta-info">
                    Enviado: <strong>${date}</strong>
                    ${countryInfo}
                    ${encountersInfo}
                </div>
                <i class="fas fa-language translate-icon" title="Traducir con Google Translate"></i>
            `;
            // Añadir listener para el icono de traducción
            const translateIcon = featuredThoughtDisplay.querySelector('.translate-icon');
            if (translateIcon) {
                translateIcon.addEventListener('click', () => openGoogleTranslate(thought.text));
            }
        } else {
            featuredThoughtDisplay.innerHTML = '<p>Aún no hay pensamientos. ¡Sé el primero en enviar uno!</p>';
        }
    } catch (e) {
        console.error("Error al obtener pensamiento destacado: ", e);
        featuredThoughtDisplay.innerHTML = '<p class="error-message">Error al cargar el pensamiento destacado.</p>';
    } finally {
        featuredThoughtDisplay.classList.remove('loading');
    }
}

/**
 * Busca y muestra los pensamientos enviados por el usuario actual.
 */
async function fetchMyThoughts() {
    if (!userId || !isAuthReady) {
        console.log('Auth o userId no están listos para buscar mis pensamientos.');
        myThoughtsList.innerHTML = '<li><p>Cargando tus pensamientos...</p></li>';
        return;
    }

    myThoughtsList.innerHTML = ''; // Limpia la lista antes de cargar

    try {
        // Consulta la colección pública de pensamientos filtrando por el userId
        const q = query(
            collection(db, `artifacts/${appId}/public/data/thoughts`),
            where("userId", "==", userId)
            // orderBy("timestamp", "desc") // Firestore requiere índice para orderBy. Si hay problemas, ordenar en cliente.
        );

        onSnapshot(q, async (snapshot) => { // Hacemos el callback async para usar await en getDoc
            myThoughtsList.innerHTML = ''; // Limpia para actualizar en tiempo real
            if (snapshot.empty) {
                myThoughtsList.innerHTML = '<li><p>Aún no has enviado ningún pensamiento. ¡Anímate!</p></li>';
                return;
            }
            const thoughts = [];
            snapshot.forEach(doc => {
                thoughts.push({ id: doc.id, ...doc.data() });
            });

            // Ordenar por fecha de forma descendente en el cliente
            thoughts.sort((a, b) => {
                const dateA = a.timestamp ? a.timestamp.toDate() : new Date(0);
                const dateB = b.timestamp ? b.timestamp.toDate() : new Date(0);
                return dateB - dateA;
            });

            for (const thought of thoughts) { // Usamos for...of para await dentro del bucle
                const li = document.createElement('li');
                const date = thought.timestamp ? new Date(thought.timestamp.toDate()).toLocaleString() : 'Fecha desconocida';
                const countryInfo = thought.country ? `<br>De: <strong>${thought.country}</strong>` : ''; // Muestra el país

                let encountersCount = thought.encounters !== undefined ? thought.encounters : 'N/A'; // Obtener encuentros del documento
                // Si necesitas el valor más actualizado, podrías hacer un getDoc aquí, pero onSnapshot ya debería darte el valor actual.
                // const docSnap = await getDoc(doc(db, `artifacts/${appId}/public/data/thoughts`, thought.id));
                // if (docSnap.exists()) { encountersCount = docSnap.data().encounters; }

                li.innerHTML = `
                    <p>${thought.text}</p>
                    <div class="meta-info">
                        Enviado: <strong>${date}</strong>
                        ${countryInfo}
                        <br>Encontrado: <strong>${encountersCount}</strong> veces
                    </div>
                    <button class="delete-button" data-id="${thought.id}" title="Eliminar pensamiento">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <i class="fas fa-language translate-icon" title="Traducir con Google Translate"></i>
                `;
                myThoughtsList.appendChild(li);

                // Añadir listener para el botón de eliminar
                li.querySelector('.delete-button').addEventListener('click', (e) => {
                    const thoughtId = e.currentTarget.dataset.id;
                    deleteThought(thoughtId);
                });
                 // Añadir listener para el icono de traducción
                const translateIcon = li.querySelector('.translate-icon');
                if (translateIcon) {
                    translateIcon.addEventListener('click', () => openGoogleTranslate(thought.text));
                }
            }
        });
    } catch (e) {
        console.error("Error al obtener mis pensamientos: ", e);
        myThoughtsList.innerHTML = '<li><p class="error-message">Error al cargar tus pensamientos.</p></li>';
    }
}

/**
 * Elimina un pensamiento de Firestore.
 * @param {string} thoughtId - El ID del documento del pensamiento a eliminar.
 */
async function deleteThought(thoughtId) {
    const confirmed = await showConfirmModal('¿Estás seguro de que quieres eliminar este pensamiento? Esta acción no se puede deshacer.');
    if (!confirmed) {
        return;
    }

    showMessage('Eliminando pensamiento...', 'loading', 0);
    try {
        // Eliminar de la colección pública (donde se guardan todos los pensamientos)
        const thoughtDocRef = doc(db, `artifacts/${appId}/public/data/thoughts`, thoughtId);
        await deleteDoc(thoughtDocRef);
        showMessage('Pensamiento eliminado con éxito.', 'success');
        fetchFeaturedThought(); // Actualiza el pensamiento destacado
        // fetchMyThoughts() se actualizará automáticamente por onSnapshot
    } catch (e) {
        console.error("Error al eliminar documento: ", e);
        showMessage('Error al eliminar el pensamiento. Inténtalo de nuevo.', 'error');
    }
}

// --- Funciones de Mapa (Leaflet.js) ---

/**
 * Inicializa el mapa Leaflet.
 */
function initializeMap() {
    console.log('Intentando inicializar mapa...');
    if (map) {
        console.log('Mapa ya existe, removiendo instancia anterior.');
        map.remove(); // Elimina la instancia del mapa si ya existe para evitar duplicados
        map = null;
    }

    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('Elemento #map no encontrado en el DOM. No se puede inicializar el mapa.');
        showMessage('Error: Contenedor del mapa no encontrado.', 'error');
        return;
    }

    if (typeof L === 'undefined') {
        console.error('Leaflet (L) no está disponible. No se puede inicializar el mapa.');
        showMessage('Error: Librería de mapa no cargada.', 'error');
        return;
    }

    map = L.map('map').setView([20, 0], 2); // Centra el mapa en el mundo, zoom 2
    console.log('Mapa Leaflet creado.');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    console.log('Capa de tiles de OpenStreetMap añadida.');

    // Carga los pensamientos para mostrarlos en el mapa
    loadThoughtsForMap();
}

/**
 * Carga todos los pensamientos de Firestore y los muestra como marcadores en el mapa.
 */
async function loadThoughtsForMap() {
    if (!isAuthReady) {
        console.log('Auth no está lista para cargar pensamientos para el mapa.');
        return;
    }

    if (!map) {
        console.error('Mapa no inicializado. No se pueden cargar los pensamientos en el mapa.');
        return;
    }

    showMessage('Cargando pensamientos en el mapa...', 'loading', 0);

    try {
        const thoughtsCollectionRef = collection(db, `artifacts/${appId}/public/data/thoughts`);
        const snapshot = await getDocs(thoughtsCollectionRef);
        const thoughtsByCountry = {}; // Agrupar pensamientos por país

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.country) {
                if (!thoughtsByCountry[data.country]) {
                    thoughtsByCountry[data.country] = {
                        count: 0,
                        thoughts: [],
                        latlng: null // Para almacenar las coordenadas del país
                    };
                }
                thoughtsByCountry[data.country].count++;
                thoughtsByCountry[data.country].thoughts.push(data.text);
            }
        });

        // Para cada país con pensamientos, obtener sus coordenadas y añadir un marcador
        for (const country in thoughtsByCountry) {
            if (thoughtsByCountry.hasOwnProperty(country)) {
                // Usar Nominatim para obtener las coordenadas del país
                console.log(`Buscando coordenadas para el país: ${country}`);
                const response = await fetch(`https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(country)}&format=json&limit=1`);
                const data = await response.json();

                if (data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    thoughtsByCountry[country].latlng = [lat, lon];
                    console.log(`Coordenadas para ${country}: [${lat}, ${lon}]`);

                    const popupContent = `
                        <b>${country}</b><br>
                        Pensamientos: ${thoughtsByCountry[country].count}<br>
                        <button class="action-button view-country-thoughts-button" data-country="${country}">Ver pensamientos</button>
                    `;
                    const marker = L.marker([lat, lon]).addTo(map)
                        .bindPopup(popupContent);

                    // Añadir listener al botón dentro del popup cuando se abre
                    marker.on('popupopen', function() {
                        const button = document.querySelector(`.view-country-thoughts-button[data-country="${country}"]`);
                        if (button) {
                            button.addEventListener('click', () => displayThoughtsForCountry(country));
                        }
                    });
                } else {
                    console.warn(`No se encontraron coordenadas para el país: ${country}`);
                }
            }
        }
        showMessage('Mapa actualizado con pensamientos.', 'success');
    } catch (e) {
        console.error("Error al cargar pensamientos para el mapa: ", e);
        showMessage('Error al cargar pensamientos en el mapa.', 'error');
    }
}

/**
 * Muestra una lista de pensamientos para un país específico.
 * Esto podría ser un modal o una nueva sección. Por ahora, lo imprimimos en consola.
 * @param {string} country - El nombre del país.
 */
async function displayThoughtsForCountry(country) {
    showMessage(`Cargando pensamientos de ${country}...`, 'loading', 0);
    try {
        const q = query(
            collection(db, `artifacts/${appId}/public/data/thoughts`),
            where("country", "==", country)
        );
        const snapshot = await getDocs(q);
        let thoughtsHtml = `<h3>Pensamientos de ${country}</h3><ul>`;

        if (snapshot.empty) {
            thoughtsHtml += `<li>No hay pensamientos registrados para ${country} aún.</li>`;
        } else {
            snapshot.forEach(doc => {
                const data = doc.data();
                const date = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : 'Fecha desconocida';
                thoughtsHtml += `<li><p>${data.text}</p><div class="meta-info">Enviado: ${date}</div><i class="fas fa-language translate-icon" title="Traducir con Google Translate" data-text="${data.text}"></i></li>`;
            });
        }
        thoughtsHtml += `</ul><button class="action-button close-country-thoughts-button">Cerrar</button>`;

        // Mostrar esto en un modal o una sección dedicada
        // Por simplicidad, usaremos el modal de confirmación como un modal genérico
        showGenericModal(thoughtsHtml, () => {
            // Añadir listeners de traducción a los iconos dentro del modal
            document.querySelectorAll('#confirmModal .translate-icon').forEach(icon => { // Usar #confirmModal
                icon.addEventListener('click', (e) => {
                    openGoogleTranslate(e.target.dataset.text);
                });
            });
            // Listener para el botón de cerrar
            document.querySelector('#confirmModal .close-country-thoughts-button').addEventListener('click', () => { // Usar #confirmModal
                document.getElementById('confirmModal').classList.remove('show');
            });
        });
        hideMessage();
    } catch (e) {
        console.error(`Error al obtener pensamientos para ${country}: `, e);
        showMessage(`Error al cargar pensamientos de ${country}.`, 'error');
    }
}

/**
 * Función genérica para mostrar un modal con contenido HTML arbitrario.
 * @param {string} htmlContent - El contenido HTML a insertar en el modal.
 * @param {function} onShowCallback - Callback a ejecutar después de que el modal se muestre.
 */
function showGenericModal(htmlContent, onShowCallback = () => {}) {
    const genericModal = document.getElementById('confirmModal'); // Reutilizamos el modal de confirmación
    const genericModalContent = genericModal.querySelector('.modal-content');

    // Ocultamos los botones de confirmación/cancelación estándar del modal
    confirmButton.style.display = 'none';
    cancelButton.style.display = 'none';

    // Insertamos el contenido y mostramos el modal
    genericModalContent.innerHTML = htmlContent;
    genericModal.classList.add('show');

    // Ejecutar el callback después de mostrar el modal para añadir listeners
    onShowCallback();
}


// --- Funciones de Traducción ---

/**
 * Abre Google Translate en una nueva pestaña con el texto dado.
 * @param {string} text - El texto a traducir.
 */
function openGoogleTranslate(text) {
    const encodedText = encodeURIComponent(text);
    // Podemos pre-seleccionar el idioma de origen (auto) y el de destino (español, por ejemplo)
    // O dejarlo en auto/auto para que el usuario elija
    window.open(`https://translate.google.com/?sl=auto&tl=es&text=${encodedText}&op=translate`, '_blank');
}


// --- Event Listeners ---

// Navegación entre secciones
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.dataset.section;
        activateSection(sectionId);
    });
});

// Contador de caracteres para el input de pensamiento
thoughtInput.addEventListener('input', () => {
    const currentLength = thoughtInput.value.length;
    charCount.textContent = `${currentLength}/${MAX_CHARS}`;
    if (currentLength > MAX_CHARS) {
        thoughtInput.classList.add('error');
        sendThoughtButton.disabled = true;
    } else {
        thoughtInput.classList.remove('error');
        sendThoughtButton.disabled = false;
    }
});

// Enviar pensamiento
sendThoughtButton.addEventListener('click', () => {
    const thoughtText = thoughtInput.value.trim();
    if (thoughtText.length > 0 && thoughtText.length <= MAX_CHARS) {
        saveThought(thoughtText);
    } else {
        showMessage('El pensamiento no puede estar vacío o exceder los 280 caracteres.', 'error');
    }
});

// Listener para el botón "Ver otro pensamiento"
if (nextThoughtBtn) {
    nextThoughtBtn.addEventListener('click', fetchFeaturedThought);
}


// --- Inicialización de la Aplicación ---

// Autenticación de Firebase
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userId = user.uid;
        console.log('Usuario autenticado:', userId);
        userIdDisplay.textContent = `Tu ID de usuario: ${userId}`;
    } else {
        // Si no hay token inicial, inicia sesión anónimamente
        if (!initialAuthToken) {
            try {
                const anonUser = await signInAnonymously(auth);
                userId = anonUser.user.uid;
                console.log('Sesión anónima iniciada:', userId);
                userIdDisplay.textContent = `Tu ID de usuario: ${userId}`;
            } catch (error) {
                console.error("Error al iniciar sesión anónimamente:", error);
                showMessage('Error al iniciar sesión. Algunas funciones pueden no estar disponibles.', 'error', 0);
            }
        } else {
            // Si hay un token inicial, úsalo para iniciar sesión
            try {
                const customUser = await signInWithCustomToken(auth, initialAuthToken);
                userId = customUser.user.uid;
                console.log('Sesión con token personalizado iniciada:', userId);
                userIdDisplay.textContent = `Tu ID de usuario: ${userId}`;
            } catch (error) {
                console.error("Error al iniciar sesión con token personalizado:", error);
                showMessage('Error al iniciar sesión con token. Algunas funciones pueden no estar disponibles.', 'error', 0);
            }
        }
    }
    isAuthReady = true; // La autenticación ha sido verificada
    // Una vez que la autenticación está lista, carga los datos iniciales
    fetchFeaturedThought();
    fetchMyThoughts();

    // Actualizar Conteo Global de Pensamientos en Tiempo Real
    // CAMBIO: Usar la ruta correcta para la colección pública
    const totalThoughtsCollectionRef = collection(db, `artifacts/${appId}/public/data/thoughts`);
    onSnapshot(totalThoughtsCollectionRef, (snapshot) => {
        totalThoughtsCount.textContent = `${snapshot.size} pensamientos escritos`;
        console.log("Conteo de pensamientos actualizado:", snapshot.size);
    }, (error) => {
        console.error("Error al obtener el conteo en tiempo real: ", error);
        totalThoughtsCount.textContent = "Error al cargar conteo";
    });
});

// Activa la sección de "Enviar un pensamiento" al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    activateSection('sendThoughtSection');
    charCount.textContent = `0/${MAX_CHARS}`; // Inicializa el contador
});
