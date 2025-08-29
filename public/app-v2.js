// ===== PARTE 1: INICIALIZACIÓN Y SEGURIDAD BÁSICA =====

// Variables globales
let currentLang = 'es';
let currentPage = 1;
let itemsPerPage = 10;
let totalPages = 1;
let myCurrentPage = 1;
let myTotalPages = 1;
let countryReady = false;
let userCountry = '';
let recentReplies = {};

// Inicialización de Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===== FUNCIONES DE SEGURIDAD =====

// Función para sanitizar HTML y prevenir ataques XSS
function sanitizeHTML(str) {
  if (typeof str !== 'string') return ''; 
  
  // Primera pasada: eliminar todas las etiquetas HTML y scripts
  const tempDiv = document.createElement('div');
  tempDiv.textContent = str;
  let sanitized = tempDiv.innerHTML;
  
  // Segunda pasada: remover patrones peligrosos específicos
  sanitized = sanitized
    // Prevenir javascript: URLs
    .replace(/javascript\s*:/gi, 'blocked:')
    // Prevenir data: URLs
    .replace(/data\s*:/gi, 'blocked:')
    // Eliminar otros protocolos potencialmente peligrosos
    .replace(/(vbscript|mhtml|ms-its):/gi, 'blocked:');
  
  return sanitized;
}

// Validación de entrada de usuario
function validateUserInput(text, maxLength = 500) {
  if (!text || typeof text !== 'string') return false;
  
  // Verificar longitud
  if (text.length > maxLength || text.length === 0) return false;
  
  // Verificar si tiene contenido real y no solo espacios
  if (text.trim().length === 0) return false;
  
  // Verificar patrones sospechosos
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /<iframe/i,
    /<img[^>]+onerror/i,
    /document\.cookie/i,
    /\beval\s*\(/i,
    /new\s+Function/i
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) return false;
  }
  
  return true;
}

// Detección segura de país (sin API keys expuestas)
async function detectCountry() {
  try {
    // Usando un servicio sin necesidad de API key expuesta
    const res = await fetch('https://ip-api.com/json?fields=country,countryCode');
    const data = await res.json();
    userCountry = data.countryCode || "Desconocido";
    console.log("País detectado:", userCountry);
  } catch (e) {
    console.error("Error detectando país:", e);
    userCountry = "Desconocido";
  } finally {
    countryReady = true;
  }
}

// Generar un token anti-replay
function generateAntiReplayToken() {
  return Date.now() + '-' + Math.random().toString(36).substring(2);
}

// ===== FORMATEO DE FECHAS =====

function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  
  const now = new Date();
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  
  if (isNaN(seconds)) return '';
  
  const intervals = [
    { label: currentLang === 'es' ? 'año' : 'year', labelPlural: currentLang === 'es' ? 'años' : 'years', seconds: 31536000 },
    { label: currentLang === 'es' ? 'mes' : 'month', labelPlural: currentLang === 'es' ? 'meses' : 'months', seconds: 2592000 },
    { label: currentLang === 'es' ? 'semana' : 'week', labelPlural: currentLang === 'es' ? 'semanas' : 'weeks', seconds: 604800 },
    { label: currentLang === 'es' ? 'día' : 'day', labelPlural: currentLang === 'es' ? 'días' : 'days', seconds: 86400 },
    { label: currentLang === 'es' ? 'hora' : 'hour', labelPlural: currentLang === 'es' ? 'horas' : 'hours', seconds: 3600 },
    { label: currentLang === 'es' ? 'minuto' : 'minute', labelPlural: currentLang === 'es' ? 'minutos' : 'minutes', seconds: 60 },
    { label: currentLang === 'es' ? 'segundo' : 'second', labelPlural: currentLang === 'es' ? 'segundos' : 'seconds', seconds: 1 }
  ];
  
  for (let i = 0; i < intervals.length; i++) {
    const interval = intervals[i];
    const count = Math.floor(seconds / interval.seconds);
    
    if (count >= 1) {
      return currentLang === 'es' 
        ? `Hace ${count} ${count === 1 ? interval.label : interval.labelPlural}`
        : `${count} ${count === 1 ? interval.label : interval.labelPlural} ago`;
    }
  }
  
  return currentLang === 'es' ? 'Justo ahora' : 'Just now';
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  if (isNaN(date.getTime())) return '';
  
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit'
  };
  
  return date.toLocaleDateString(currentLang === 'es' ? 'es-ES' : 'en-US', options);
}

// ===== SISTEMA DE NOTIFICACIONES =====

function showNotification(message, type = 'info', duration = 5000) {
  // Buscar traducción si es una clave
  if (message.includes('.') && translations[currentLang] && translations[currentLang][message]) {
    message = translations[currentLang][message];
  }
  
  // Sanitizar mensaje antes de mostrar
  message = sanitizeHTML(message);
  
  const notificationArea = document.getElementById('notification-area');
  
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  // Agregar al área de notificaciones
  notificationArea.appendChild(notification);
  
  // Animación de entrada
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Auto-eliminar después de la duración
  setTimeout(() => {
    notification.classList.remove('show');
    
    // Eliminar del DOM después de la animación
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, duration);
}

// ===== PARTE 2: SISTEMA DE AUTENTICACIÓN =====

// Configuración de autenticación anónima segura
function setupAnonymousAuth() {
  // Verificar si ya hay sesión activa y controlar intentos de manipulación
  let authAttempts = 0;
  const maxAuthAttempts = 3;
  
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // Usuario ya autenticado - verificar token para prevenir tokens falsificados
      user.getIdToken(true)
        .then(() => {
          console.log("Usuario verificado correctamente");
          document.getElementById('welcome-overlay').classList.add('hidden');
          document.body.classList.remove('welcome-active');
          startLogoAnimation();
          refreshAllData();
        })
        .catch((error) => {
          console.error("Error validando token:", error);
          // Si hay error de validación, hacer logout y reiniciar el proceso
          firebase.auth().signOut();
          document.getElementById('welcome-overlay').classList.remove('hidden');
          document.body.classList.add('welcome-active');
        });
    } else {
      // No hay sesión, mostrar bienvenida
      const welcomeOverlay = document.getElementById('welcome-overlay');
      if (localStorage.getItem('libre_welcome_seen') === 'true') {
        // Si ya vio la bienvenida anteriormente, autenticar directamente
        // Limitar intentos para prevenir bucles
        if (authAttempts < maxAuthAttempts) {
          authAttempts++;
          signInAnonymously();
        } else {
          // Mostrar mensaje de error si hay demasiados intentos fallidos
          welcomeOverlay.classList.remove('hidden');
          document.body.classList.add('welcome-active');
          showNotification("Problema al conectar. Por favor, recarga la página.", "error", 10000);
        }
      } else {
        welcomeOverlay.classList.remove('hidden');
        document.body.classList.add('welcome-active');
      }
    }
  });
}

// Función para iniciar sesión anónima
function signInAnonymously() {
  // Prevenir múltiples intentos simultáneos
  if (window.authInProgress) return;
  
  window.authInProgress = true;
  firebase.auth().signInAnonymously()
    .then(() => {
      localStorage.setItem('libre_welcome_seen', 'true');
      console.log("Autenticación anónima exitosa");
      window.authInProgress = false;
    })
    .catch((error) => {
      console.error("Error de autenticación anónima:", error);
      window.authInProgress = false;
      showNotification("Error de conexión. Por favor, intenta de nuevo.", "error");
    });
}

// Obtener el usuario actual de manera segura
function getCurrentUser() {
  const user = firebase.auth().currentUser;
  if (!user) {
    return null;
  }
  return user;
}

// Verificar si el usuario está autenticado antes de realizar operaciones
function isUserAuthenticated() {
  const user = getCurrentUser();
  if (!user) {
    showNotification("security.auth_required", "error");
    return false;
  }
  return true;
}

// ===== PARTE 3: FUNCIONES DE UI Y UTILIDADES =====

// Sistema de traducciones
function applyTranslations() {
    document.querySelectorAll('[data-translate-key]').forEach(el => {
        const key = el.getAttribute('data-translate-key');
        const translation = translations[currentLang]?.[key];
        if (translation) el.innerHTML = sanitizeHTML(translation);
    });
    document.querySelectorAll('[data-translate-key-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-key-placeholder');
        const translation = translations[currentLang]?.[key];
        if (translation) el.placeholder = sanitizeHTML(translation);
    });
    document.querySelectorAll('[data-translate-key-title]').forEach(el => {
        const key = el.getAttribute('data-translate-key-title');
        const translation = translations[currentLang]?.[key];
        if (translation) el.title = sanitizeHTML(translation);
    });
    document.documentElement.lang = currentLang;
    document.getElementById('lang-es').classList.toggle('active', currentLang === 'es');
    document.getElementById('lang-en').classList.toggle('active', currentLang === 'en');
}

// Inicialización de las textareas con autoguardado y contadores
function setupTextareaFeatures(textarea, counterElement, localStorageKey) {
    if (!textarea || !counterElement) return;

    // Cargar borrador si existe
    const savedDraft = localStorage.getItem(localStorageKey);
    if (savedDraft) {
        textarea.value = savedDraft;
    }
    
    // Actualizar contador inicial
    const maxLength = parseInt(textarea.getAttribute('maxlength')) || 500;
    const remainingChars = maxLength - textarea.value.length;
    counterElement.textContent = remainingChars;
    
    // Cambiar color del contador según caracteres restantes
    const updateCounterStyle = () => {
        const remaining = maxLength - textarea.value.length;
        counterElement.textContent = remaining;
        
        counterElement.classList.toggle('warn', remaining < 100);
        counterElement.classList.toggle('danger', remaining < 50);
    };
    
    // Inicializar estilo del contador
    updateCounterStyle();
    
    // Actualizar contador y guardar borrador al escribir
    textarea.addEventListener('input', () => {
        updateCounterStyle();
        localStorage.setItem(localStorageKey, textarea.value);
    });
}

// Mostrar frases inspiradoras aleatorias en el textarea
function mostrarFraseInspiradoraEnTextarea() {
    const textarea = document.getElementById('textarea');
    if (!textarea) return;
    
    // Obtener frases según idioma
    const frases = translations[currentLang]?.inspirational_phrases || [];
    if (frases.length === 0) return;
    
    // Seleccionar frase aleatoria y actualizar placeholder
    const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];
    textarea.placeholder = sanitizeHTML(fraseAleatoria);
}

// Función para animación del logo inicial
function startLogoAnimation() {
    const textLogo = document.getElementById('textLogo');
    if (!textLogo) return;
    
    // Mostrar y escalar logo
    textLogo.classList.remove('logo-hidden');
    
    // Animación de desaparición después de 2 segundos
    setTimeout(() => {
        textLogo.classList.add('logo-fade-out');
        
        // Eliminar animación después de que termine
        setTimeout(() => {
            const logoAnimation = document.getElementById('logoAnimation');
            if (logoAnimation) logoAnimation.style.display = 'none';
        }, 1000);
    }, 2000);
}

// Función para la visualización de pestañas
function showTab(tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Mostrar pestaña seleccionada
    const selectedTab = document.getElementById(`${tabName}Tab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Actualizar botones de navegación
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('onclick') === `showTab('${tabName}')`) {
            btn.classList.add('active');
        }
    });
    
    // Acciones específicas según la pestaña
    if (tabName === 'mine') {
        document.getElementById('mineTabNotification').classList.add('hidden');
        refreshMineTab();
    } else if (tabName === 'revelacion') {
        cargarRevelacionDelDia();
    }
}

// Configuración de la pantalla de bienvenida y onboarding
function setupWelcomeScreen() {
    const welcomeOverlay = document.getElementById('welcome-overlay');
    // No ocultar automáticamente, lo maneja onAuthStateChanged
    
    const slides = document.querySelectorAll('.welcome-slide');
    const dotsContainer = document.getElementById('welcome-dots');
    const nextBtn = document.getElementById('welcome-arrow-next');
    const prevBtn = document.getElementById('welcome-arrow-prev');
    const startBtn = document.getElementById('welcome-start-btn');
    const langButtons = document.querySelectorAll('#welcome-lang-selector button');
    const ageGateButton = document.querySelector('#welcome-age-gate button');

    let currentSlide = 0;

    // Crear puntos de navegación
    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('div');
        dot.classList.add('welcome-dot');
        dot.dataset.slide = i;
        dotsContainer.appendChild(dot);
    }
    const dots = document.querySelectorAll('.welcome-dot');

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        currentSlide = index;
        prevBtn.style.display = index > 0 ? 'flex' : 'none';
        nextBtn.style.display = index < slides.length - 1 ? 'flex' : 'none';
        startBtn.classList.toggle('hidden', index < slides.length - 1);
    }

    function changeSlide(direction) {
        const newIndex = currentSlide + direction;
        if (newIndex >= 0 && newIndex < slides.length) {
            showSlide(newIndex);
        }
    }

    // Event Listeners
    nextBtn.addEventListener('click', () => changeSlide(1));
    prevBtn.addEventListener('click', () => changeSlide(-1));
    dots.forEach(dot => {
        dot.addEventListener('click', () => showSlide(parseInt(dot.dataset.slide)));
    });

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            currentLang = lang; // Actualiza el idioma global
            
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            applyTranslations(); // Aplica traducciones a toda la pantalla
            
            // Habilitar el botón de edad
            ageGateButton.disabled = false;
            ageGateButton.textContent = translations[lang]['welcome.slide1.age_gate_button_enabled'];
        });
    });

    ageGateButton.addEventListener('click', () => {
        // Una vez que se acepta la edad, se puede proceder
        showSlide(1); // Mover a la siguiente diapositiva
    });

    // MODIFICACIÓN: El botón "Comenzar a ser LIBRE" ahora inicia autenticación anónima
    startBtn.addEventListener('click', () => {
        signInAnonymously(); // Autenticar al iniciar
    });

    // Estado inicial
    const browserLang = navigator.language.slice(0, 2);
    const initialLang = ['es', 'en'].includes(browserLang) ? browserLang : 'es';
    document.querySelector(`#welcome-lang-selector button[data-lang="${initialLang}"]`).click();
    showSlide(0);
}

// Mostrar modales legales (privacidad, términos, etc.)
function showLegalModal(type) {
    const modal = document.getElementById('legal-modal-overlay');
    const title = document.getElementById('legal-modal-title');
    const body = document.getElementById('legal-modal-body');
    
    // Contenido según tipo
    if (type === 'privacy') {
        title.textContent = translations[currentLang]['about.privacy.title'] || 'Política de Privacidad';
        body.innerHTML = `
            <p>${sanitizeHTML(translations[currentLang]['about.privacy.p1'] || '')}</p>
            <ul>
                <li>${sanitizeHTML(translations[currentLang]['about.privacy.item1'] || '')}</li>
                <li>${sanitizeHTML(translations[currentLang]['about.privacy.item2'] || '')}</li>
                <li>${sanitizeHTML(translations[currentLang]['about.privacy.item3'] || '')}</li>
                <li>${sanitizeHTML(translations[currentLang]['about.privacy.item4'] || '')}</li>
                <li>${sanitizeHTML(translations[currentLang]['about.privacy.item5'] || '')}</li>
            </ul>
        `;
    } else if (type === 'terms') {
        title.textContent = translations[currentLang]['about.terms.title'] || 'Términos y Condiciones';
        body.innerHTML = `
            <p>${sanitizeHTML(translations[currentLang]['about.terms.p1'] || '')}</p>
            <ul>
                <li>${sanitizeHTML(translations[currentLang]['about.terms.item1'] || '')}</li>
                <li>${sanitizeHTML(translations[currentLang]['about.terms.item2'] || '')}</li>
                <li>${sanitizeHTML(translations[currentLang]['about.terms.item3'] || '')}</li>
                <li>${sanitizeHTML(translations[currentLang]['about.terms.item4'] || '')}</li>
                <li>${sanitizeHTML(translations[currentLang]['about.terms.item5'] || '')}</li>
            </ul>
        `;
    } else if (type === 'about') {
        title.textContent = translations[currentLang]['about.about.title'] || 'Acerca de LIBRE';
        body.innerHTML = `
            <p>${sanitizeHTML(translations[currentLang]['about.about.p1'] || '')}</p>
            <ul>
                <li>${sanitizeHTML(translations[currentLang]['about.about.item1'] || '')}</li>
                <li>${sanitizeHTML(translations[currentLang]['about.about.item2'] || '')}</li>
                <li>${sanitizeHTML(translations[currentLang]['about.about.item3'] || '')}</li>
                <li>${sanitizeHTML(translations[currentLang]['about.about.item4'] || '')}</li>
                <li>${sanitizeHTML(translations[currentLang]['about.about.item5'] || '')}</li>
            </ul>
        `;
    }
    
    // Mostrar modal
    modal.classList.add('active');
    
    // Configurar botón de cierre
    document.getElementById('legal-modal-close-btn').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Cerrar al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ===== PARTE 4: SISTEMA DE PENSAMIENTOS =====

// Enviar un nuevo pensamiento
document.getElementById('sendBtn').onclick = async function() { 
  // Verificar si el país ha sido detectado
  if (!countryReady) { 
    showNotification("js.notification.country_wait", "info"); 
    return; 
  } 
  
  // Verificar autenticación
  const user = firebase.auth().currentUser;
  if (!user) {
    showNotification("security.auth_required", "info");
    return;
  }
  
  const textarea = document.getElementById('textarea'); 
  const txt = textarea.value.trim(); 
  
  // Validar entrada
  if (!validateUserInput(txt)) {
    showNotification("security.content_invalid", "error");
    return;
  }
  
  // Verificar palabras ofensivas
  if (window.contienePalabraOfensiva(txt)) {
    showNotification("security.inappropriate_content", "error");
    return;
  }
  
  // Prevenir envíos múltiples
  if (this.dataset.processing === 'true') {
    return;
  }
  
  try { 
    this.disabled = true; 
    this.dataset.processing = 'true';
    
    // Implementar un token anti-replay
    const antiReplayToken = generateAntiReplayToken();
    
    await db.collection("thoughts").add({ 
      text: sanitizeHTML(txt), 
      ts: firebase.firestore.FieldValue.serverTimestamp(), 
      country: userCountry, 
      user: user.uid, // Usar uid de Firebase
      antiReplay: antiReplayToken
    }); 
    
    textarea.value = ''; 
    localStorage.removeItem('libre_draft_main'); 
    
    const counter = document.getElementById('charCounterMain'); 
    counter.textContent = textarea.getAttribute('maxlength'); 
    counter.classList.remove('warn', 'danger'); 
    
    mostrarFraseInspiradoraEnTextarea(); 
    showNotification("js.notification.thought_sent", "success"); 
    refreshAllData(); 
  } catch (e) { 
    console.error("Error saving thought:", e); 
    showNotification("js.notification.thought_error", "error"); 
    
    if (e.code === 'permission-denied') { 
      showNotification('security.rate_limit', 'error', 5000); 
    } 
  } finally { 
    this.disabled = false; 
    delete this.dataset.processing;
  } 
};

// Cargar pensamientos globales
async function loadGlobalThoughts(page = 1) {
  try {
    const thoughtsContainer = document.getElementById('globalThoughts');
    if (!thoughtsContainer) return;
    
    thoughtsContainer.innerHTML = `
      <div class="p-4 bg-white rounded-lg shadow-sm skeleton-loader"></div>
      <div class="p-4 bg-white rounded-lg shadow-sm skeleton-loader"></div>
      <div class="p-4 bg-white rounded-lg shadow-sm skeleton-loader"></div>
    `;
    
    // Verificar autenticación
    const user = firebase.auth().currentUser;
    if (!user) {
      thoughtsContainer.innerHTML = '<p class="empty-state">' + 
        (translations[currentLang]?.['security.auth_required'] || 'Please wait while the connection is established') + 
        '</p>';
      return;
    }
    
    const startIdx = (page - 1) * itemsPerPage;
    
    // Obtener total para paginación
    const countSnapshot = await db.collection('stats').doc('thoughts_count').get();
    const totalCount = countSnapshot.exists ? (countSnapshot.data()?.count || 0) : 0;
    totalPages = Math.ceil(totalCount / itemsPerPage);
    
    if (totalCount === 0) {
      thoughtsContainer.innerHTML = '<p class="empty-state">' + 
        (translations[currentLang]?.['empty.no_thoughts'] || 'No hay pensamientos para mostrar') + 
        '</p>';
      updatePagination(page, totalPages);
      return;
    }
    
    // Obtener pensamientos para esta página
    const thoughtsSnapshot = await db.collection('thoughts')
      .orderBy('ts', 'desc')
      .limit(itemsPerPage)
      .offset(startIdx)
      .get();
    
    if (thoughtsSnapshot.empty) {
      thoughtsContainer.innerHTML = '<p class="empty-state">' + 
        (translations[currentLang]?.['empty.no_thoughts'] || 'No hay pensamientos para mostrar') + 
        '</p>';
      updatePagination(page, totalPages);
      return;
    }
    
    // Limpiar contenedor y mostrar resultados
    thoughtsContainer.innerHTML = '';
    
    thoughtsSnapshot.forEach(doc => {
      const thought = doc.data();
      const timestamp = thought.ts ? formatTimeAgo(thought.ts) : '';
      const isMyThought = thought.user === user.uid;
      
      const country = thought.country || 'Desconocido';
      const countryName = getCountryName(country, currentLang);
      const countryFlag = getCountryFlag(country);
      
      // Crear elemento de pensamiento con validación XSS
      const thoughtElement = document.createElement('div');
      thoughtElement.className = 'p-4 bg-white rounded-lg shadow-sm mb-4';
      thoughtElement.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <span class="country-flag">${countryFlag}</span>
            <span class="country-name ml-2">${sanitizeHTML(countryName)}</span>
          </div>
          <span class="text-sm text-gray-500">${sanitizeHTML(timestamp)}</span>
        </div>
        <p class="mb-3">${sanitizeHTML(thought.text)}</p>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            ${isMyThought ? 
              `<span class="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                ${translations[currentLang]?.['feed.own_thought_label'] || 'Este pensamiento es tuyo'}
              </span>` : 
              `<button class="action-btn reply-btn" data-thought-id="${doc.id}">
                <span class="material-icons">reply</span>
                <span>${translations[currentLang]?.['feed.action_reply'] || 'Responder'}</span>
              </button>
              <button class="action-btn translate-btn ml-3" data-text="${encodeURIComponent(thought.text)}">
                <span class="material-icons">translate</span>
                <span>${translations[currentLang]?.['feed.action_translate'] || 'Traducir'}</span>
              </button>`
            }
          </div>
          ${!isMyThought ? 
            `<button class="action-btn report-btn" data-thought-id="${doc.id}" data-reported="false">
              <span class="material-icons">flag</span>
              <span class="report-text">${translations[currentLang]?.['feed.action_report'] || 'Reportar'}</span>
            </button>` : ''
          }
        </div>
        <div class="reply-container hidden" id="reply-container-${doc.id}">
          <div class="mt-3 border-t pt-3">
            <div class="textarea-container">
              <textarea class="reply-textarea w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300" 
                rows="2" 
                maxlength="300" 
                placeholder="${translations[currentLang]?.['feed.reply_placeholder'] || 'Escribe tu respuesta...'}"></textarea>
            </div>
            <div class="flex justify-end mt-2">
              <button class="cancel-reply-btn px-3 py-1 text-gray-600 mr-2">
                ${translations[currentLang]?.['modal.close_button'] || 'Cerrar'}
              </button>
              <button class="send-reply-btn px-3 py-1 bg-blue-500 text-white rounded-lg" data-thought-id="${doc.id}">
                ${translations[currentLang]?.['feed.send_reply_button'] || 'Enviar'}
              </button>
            </div>
          </div>
        </div>
      `;
      
      thoughtsContainer.appendChild(thoughtElement);
    });
    
    // Actualizar paginación
    updatePagination(page, totalPages);
    
    // Configurar botones de acción
    setupReplyButtons();
    setupTranslateButtons();
    setupReportButtons();
    
  } catch (error) {
    console.error("Error loading global thoughts:", error);
    const thoughtsContainer = document.getElementById('globalThoughts');
    if (thoughtsContainer) {
      thoughtsContainer.innerHTML = '<p class="error-state">Error al cargar pensamientos.</p>';
    }
  }
}

// Configurar botones de respuesta
function setupReplyButtons() {
  document.querySelectorAll('.reply-btn').forEach(button => {
    button.addEventListener('click', function() {
      const thoughtId = this.getAttribute('data-thought-id');
      const replyContainer = document.getElementById(`reply-container-${thoughtId}`);
      
      // Cerrar cualquier otra respuesta abierta
      document.querySelectorAll('.reply-container').forEach(container => {
        if (container.id !== `reply-container-${thoughtId}` && !container.classList.contains('hidden')) {
          container.classList.add('hidden');
        }
      });
      
      // Mostrar/ocultar contenedor de respuesta
      replyContainer.classList.toggle('hidden');
      
      // Configurar botón para cancelar respuesta
      const cancelBtn = replyContainer.querySelector('.cancel-reply-btn');
      cancelBtn.onclick = () => replyContainer.classList.add('hidden');
      
      // Configurar botón para enviar respuesta
      const sendBtn = replyContainer.querySelector('.send-reply-btn');
      sendBtn.onclick = () => sendReply(thoughtId, replyContainer);
    });
  });
}

// Enviar respuesta a un pensamiento
async function sendReply(thoughtId, replyContainer) {
  // Verificar autenticación
  const user = firebase.auth().currentUser;
  if (!user) {
    showNotification("security.auth_required", "info");
    return;
  }
  
  const textarea = replyContainer.querySelector('.reply-textarea');
  const replyText = textarea.value.trim();
  
  // Validar entrada
  if (!validateUserInput(replyText, 300)) {
    showNotification("security.content_invalid", "error");
    return;
  }
  
  // Verificar palabras ofensivas
  if (window.contienePalabraOfensiva(replyText)) {
    showNotification("security.inappropriate_content", "error");
    return;
  }
  
  // Verificar que no sea una respuesta propia
  try {
    const thoughtDoc = await db.collection('thoughts').doc(thoughtId).get();
    if (!thoughtDoc.exists) {
      showNotification("js.notification.reply_error_generic", "error");
      return;
    }
    
    const thoughtData = thoughtDoc.data();
    if (thoughtData.user === user.uid) {
      showNotification("js.notification.reply_error_own", "error");
      return;
    }
    
    // Guardar respuesta
    await db.collection('replies').add({
      text: sanitizeHTML(replyText),
      thoughtId: thoughtId,
      fromUser: user.uid,
      toUser: thoughtData.user,
      ts: firebase.firestore.FieldValue.serverTimestamp(),
      country: userCountry,
      antiReplay: generateAntiReplayToken()
    });
    
    // Ocultar contenedor de respuesta y limpiar texto
    replyContainer.classList.add('hidden');
    textarea.value = '';
    
    showNotification("Respuesta enviada con éxito", "success");
    
  } catch (error) {
    console.error("Error sending reply:", error);
    showNotification("js.notification.reply_error_generic", "error");
  }
}

// Configurar botones de traducción
function setupTranslateButtons() {
  document.querySelectorAll('.translate-btn').forEach(button => {
    button.addEventListener('click', function() {
      const text = decodeURIComponent(this.getAttribute('data-text'));
      
      // Confirmación antes de abrir traducción externa
      if (confirm(translations[currentLang]?.['js.notification.translate_confirm'] || 
                  '¿Abrir Google Translate para traducir este texto?')) {
        
        // URL segura para Google Translate
        const url = `https://translate.google.com/?sl=auto&tl=${currentLang}&text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    });
  });
}

// Configurar botones de reporte
function setupReportButtons() {
  document.querySelectorAll('.report-btn').forEach(button => {
    button.addEventListener('click', async function() {
      const thoughtId = this.getAttribute('data-thought-id');
      const isReported = this.getAttribute('data-reported') === 'true';
      
      // Si ya fue reportado, no hacer nada
      if (isReported) {
        showNotification("js.notification.report_already_reported", "info");
        return;
      }
      
      // Verificar autenticación
      const user = firebase.auth().currentUser;
      if (!user) {
        showNotification("security.auth_required", "info");
        return;
      }
      
      // Pedir confirmación
      if (confirm(translations[currentLang]?.['js.notification.report_confirm'] || 
                '¿Seguro que quieres reportar este pensamiento como inapropiado?')) {
        
        try {
          showNotification("js.notification.reporting", "info");
          
          // Verificar límite de reportes (máximo 5 por día)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const reportCountSnapshot = await db.collection('reports')
            .where('user', '==', user.uid)
            .where('ts', '>=', today)
            .get();
          
          if (reportCountSnapshot.size >= 5) {
            showNotification("js.notification.report_limit_exceeded", "error");
            return;
          }
          
          // Guardar reporte
          await db.collection('reports').add({
            thoughtId: thoughtId,
            user: user.uid,
            ts: firebase.firestore.FieldValue.serverTimestamp()
          });
          
          // Actualizar botón
          this.setAttribute('data-reported', 'true');
          this.querySelector('.report-text').textContent = 
            translations[currentLang]?.['feed.reported_button'] || 'Reportado';
          this.classList.add('reported');
          
          showNotification("js.notification.report_success", "success");
          
        } catch (error) {
          console.error("Error reporting thought:", error);
          showNotification("js.notification.report_error", "error");
        }
      }
    });
  });
}

// Actualizar paginación
function updatePagination(currentPage, totalPages) {
  const paginationContainer = document.getElementById('globalPagination');
  if (!paginationContainer) return;
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }
  
  const prevBtn = currentPage > 1 ? 
    `<button class="pagination-btn prev" onclick="changePage(${currentPage - 1})">
      ${translations[currentLang]?.['feed.pagination_previous'] || 'Anterior'}
     </button>` : '';
  
  const nextBtn = currentPage < totalPages ? 
    `<button class="pagination-btn next" onclick="changePage(${currentPage + 1})">
      ${translations[currentLang]?.['feed.pagination_next'] || 'Siguiente'}
     </button>` : '';
  
  paginationContainer.innerHTML = `
    <div class="flex items-center justify-between">
      ${prevBtn}
      <span class="pagination-info">
        ${translations[currentLang]?.['feed.pagination_page'] || 'Página'} ${currentPage} 
        ${translations[currentLang]?.['feed.pagination_of'] || 'de'} ${totalPages}
      </span>
      ${nextBtn}
    </div>
  `;
}

// Cambiar página
function changePage(page) {
  currentPage = page;
  loadGlobalThoughts(page);
}

// Verificar si hay nuevas respuestas
async function checkNewReplies() {
  const user = firebase.auth().currentUser;
  if (!user) return;
  
  try {
    // Obtener última fecha vista
    let lastSeen = localStorage.getItem('libre_last_replies_seen');
    lastSeen = lastSeen ? new Date(lastSeen) : new Date(0);
    
    // Buscar nuevas respuestas
    const repliesSnapshot = await db.collection('replies')
      .where('toUser', '==', user.uid)
      .where('ts', '>', lastSeen)
      .get();
    
    const hasNewReplies = !repliesSnapshot.empty;
    
    // Actualizar notificación en pestaña "Lo Mío"
    document.getElementById('mineTabNotification').classList.toggle('hidden', !hasNewReplies);
    
    // Si estamos en la pestaña "Lo Mío", actualizar la fecha
    if (!document.getElementById('mineTab').classList.contains('hidden') && hasNewReplies) {
      localStorage.setItem('libre_last_replies_seen', new Date().toISOString());
    }
    
  } catch (error) {
    console.error("Error checking new replies:", error);
  }
}

// ===== PARTE 5: SISTEMA DE REVELACIONES =====

// Cargar revelación del día
async function cargarRevelacionDelDia() {
  // Verificar autenticación
  const user = firebase.auth().currentUser;
  if (!user) {
    document.getElementById('revelacionQuestion').textContent = 
      translations[currentLang]?.['security.auth_required'] || 'Please wait while the connection is established';
    return;
  }
  
  try {
    // Obtener información de la revelación del día
    const revelacionInfoRef = db.collection('revelaciones_info').doc('actual');
    const revelacionInfoDoc = await revelacionInfoRef.get();
    
    // Si no existe la información, crear una revelación
    if (!revelacionInfoDoc.exists) {
      await setUpTodaysRevelation();
      return cargarRevelacionDelDia();
    }
    
    const revelacionInfo = revelacionInfoDoc.data();
    
    // Mostrar pregunta del día
    document.getElementById('revelacionQuestion').textContent = sanitizeHTML(revelacionInfo.question);
    
    // Verificar si el usuario ya respondió hoy
    const userId = user.uid;
    const userRevelacionRef = db.collection('revelaciones')
      .where('day', '==', revelacionInfo.day)
      .where('userId', '==', userId)
      .limit(1);
    
    const userRevelacionSnapshot = await userRevelacionRef.get();
    
    // Mostrar interfaz según si ya respondió o no
    const revelacionInputArea = document.getElementById('revelacionInputArea');
    const revelacionThanks = document.getElementById('revelacionThanks');
    
    if (!userRevelacionSnapshot.empty) {
      // Ya respondió - mostrar agradecimiento y countdown
      revelacionInputArea.classList.add('hidden');
      revelacionThanks.classList.remove('hidden');
      startRevelacionCountdown(revelacionInfo.nextReveal);
    } else {
      // No ha respondido - mostrar formulario
      revelacionInputArea.classList.remove('hidden');
      revelacionThanks.classList.add('hidden');
    }
  } catch (error) {
    console.error("Error cargando revelación:", error);
    document.getElementById('revelacionQuestion').textContent = "Error al cargar la revelación del día";
  }
}

// Configurar la revelación del día actual
async function setUpTodaysRevelation() {
  try {
    // Obtener fecha actual en formato simple (YYYY-MM-DD)
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Verificar si ya existe revelación para hoy
    const existingRef = db.collection('revelaciones_info')
      .where('day', '==', todayString)
      .limit(1);
    
    const existingDoc = await existingRef.get();
    
    if (!existingDoc.empty) {
      // Ya existe, actualizar documento "actual"
      const existingData = existingDoc.docs[0].data();
      await db.collection('revelaciones_info').doc('actual').set(existingData);
      return;
    }
    
    // Crear nueva revelación para hoy
    
    // Obtener todas las preguntas disponibles
    const preguntas = translations[currentLang]?.revelation_questions || [];
    
    if (preguntas.length === 0) {
      throw new Error("No hay preguntas disponibles");
    }
    
    // Seleccionar pregunta aleatoria
    const randomIndex = Math.floor(Math.random() * preguntas.length);
    const preguntaHoy = preguntas[randomIndex];
    
    // Calcular próxima revelación (mañana a las 00:00)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Crear documento de revelación
    const revelacionData = {
      day: todayString,
      question: preguntaHoy,
      questionIndex: randomIndex,
      nextReveal: tomorrow,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Guardar en Firestore
    await db.collection('revelaciones_info').doc('actual').set(revelacionData);
    
    // Opcional: guardar también con ID del día para historial
    await db.collection('revelaciones_info').doc(todayString).set(revelacionData);
    
  } catch (error) {
    console.error("Error setting up revelation:", error);
  }
}

// Iniciar cuenta regresiva para próxima revelación
function startRevelacionCountdown(nextRevealDate) {
  if (!nextRevealDate) return;
  
  const countdownElement = document.getElementById('revelacionCountdown');
  if (!countdownElement) return;
  
  // Convertir a objeto Date si es timestamp de Firestore
  const targetDate = nextRevealDate instanceof Date ? 
    nextRevealDate : nextRevealDate.toDate();
  
  // Actualizar cada segundo
  const updateCountdown = () => {
    const now = new Date();
    const difference = targetDate - now;
    
    if (difference <= 0) {
      // Tiempo terminado, recargar revelación
      countdownElement.textContent = "00:00:00";
      setTimeout(cargarRevelacionDelDia, 1000);
      return;
    }
    
    // Calcular horas, minutos y segundos
    let hours = Math.floor(difference / (1000 * 60 * 60));
    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    // Formatear con padding de ceros
    hours = String(hours).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');
    
    countdownElement.textContent = `${hours}:${minutes}:${seconds}`;
  };
  
  // Actualizar inmediatamente y luego cada segundo
  updateCountdown();
  const intervalId = setInterval(updateCountdown, 1000);
  
  // Guardar ID del intervalo para limpieza
  countdownElement.dataset.intervalId = intervalId;
  
  // Limpiar intervalo previo si existe
  return () => {
    clearInterval(intervalId);
  };
}

// Enviar respuesta a revelación
document.getElementById('revelacionSendBtn').onclick = async function() {
  // Verificar autenticación
  const user = firebase.auth().currentUser;
  if (!user) {
    showNotification("security.auth_required", "info");
    return;
  }
  
  const textarea = document.getElementById('revelacionTextarea');
  const revelacionText = textarea.value.trim();
  
  // Validar entrada
  if (!validateUserInput(revelacionText, 500)) {
    showNotification("security.content_invalid", "error");
    return;
  }
  
  // Verificar palabras ofensivas
  if (window.contienePalabraOfensiva(revelacionText)) {
    showNotification("security.inappropriate_content", "error");
    return;
  }
  
  // Prevenir envíos múltiples
  if (this.dataset.processing === 'true') {
    return;
  }
  
  try {
    this.disabled = true;
    this.dataset.processing = 'true';
    
    // Obtener información de la revelación actual
    const revelacionInfoRef = db.collection('revelaciones_info').doc('actual');
    const revelacionInfoDoc = await revelacionInfoRef.get();
    
    if (!revelacionInfoDoc.exists) {
      throw new Error("No hay revelación activa");
    }
    
    const revelacionInfo = revelacionInfoDoc.data();
    
    // Guardar respuesta
    await db.collection('revelaciones').add({
      text: sanitizeHTML(revelacionText),
      day: revelacionInfo.day,
      question: revelacionInfo.question,
      userId: user.uid,
      country: userCountry,
      ts: firebase.firestore.FieldValue.serverTimestamp(),
      antiReplay: generateAntiReplayToken()
    });
    
    // Limpiar textarea y borrador
    textarea.value = '';
    localStorage.removeItem('libre_draft_revelation');
    
    // Mostrar agradecimiento y countdown
    document.getElementById('revelacionInputArea').classList.add('hidden');
    document.getElementById('revelacionThanks').classList.remove('hidden');
    startRevelacionCountdown(revelacionInfo.nextReveal);
    
  } catch (error) {
    console.error("Error enviando revelación:", error);
    showNotification("revelation.send_error", "error");
  } finally {
    this.disabled = false;
    delete this.dataset.processing;
  }
};

// Mostrar revelación de ayer
async function showYesterdaysRevelation() {
  // Verificar autenticación
  const user = firebase.auth().currentUser;
  if (!user) {
    showNotification("security.auth_required", "info");
    return;
  }
  
  try {
    const revelacionAyerContainer = document.getElementById('revelacionAyerContainer');
    const revelacionAyerQuestion = document.getElementById('revelacionAyerQuestion');
    const revelacionAyerRespuestas = document.getElementById('revelacionAyerRespuestas');
    
    // Calcular fecha de ayer
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    // Obtener información de la revelación de ayer
    const revelacionAyerDoc = await db.collection('revelaciones_info').doc(yesterdayString).get();
    
    if (!revelacionAyerDoc.exists) {
      showNotification("No hay datos de la revelación de ayer", "info");
      return;
    }
    
    const revelacionAyer = revelacionAyerDoc.data();
    
    // Mostrar pregunta
    revelacionAyerQuestion.textContent = 
      (translations[currentLang]?.['revelation.yesterdays_question_prefix'] || 'Ayer preguntamos: ') + 
      sanitizeHTML(revelacionAyer.question);
    
    // Obtener respuestas (limitado a 20 por rendimiento)
    const respuestasSnapshot = await db.collection('revelaciones')
      .where('day', '==', yesterdayString)
      .orderBy('ts', 'desc')
      .limit(20)
      .get();
    
    // Mostrar respuestas
    if (respuestasSnapshot.empty) {
      revelacionAyerRespuestas.innerHTML = `<p class="empty-state">
        ${translations[currentLang]?.['empty.no_revelation_answers'] || 'Nadie ha respondido a la revelación de ayer'}
      </p>`;
    } else {
      revelacionAyerRespuestas.innerHTML = '';
      
      respuestasSnapshot.forEach(doc => {
        const respuesta = doc.data();
        const country = respuesta.country || 'Desconocido';
        const countryName = getCountryName(country, currentLang);
        const countryFlag = getCountryFlag(country);
        
        const respuestaElement = document.createElement('div');
        respuestaElement.className = 'p-3 bg-green-50 rounded-lg mb-3';
        respuestaElement.innerHTML = `
          <div class="flex items-center mb-2">
            <span class="country-flag">${countryFlag}</span>
            <span class="country-name ml-2">${sanitizeHTML(countryName)}</span>
          </div>
          <p>${sanitizeHTML(respuesta.text)}</p>
        `;
        
        revelacionAyerRespuestas.appendChild(respuestaElement);
      });
    }
    
    // Mostrar contenedor
    revelacionAyerContainer.classList.remove('hidden');
    
  } catch (error) {
    console.error("Error mostrando revelación de ayer:", error);
    showNotification("Error al cargar la revelación de ayer", "error");
  }
}

// ===== PARTE 6: SISTEMA DE CÁPSULAS DEL TIEMPO =====

// Enviar una nueva cápsula del tiempo
document.getElementById('capsuleBtn').onclick = async function() {
  // Verificar autenticación
  const user = firebase.auth().currentUser;
  if (!user) {
    showNotification("security.auth_required", "info");
    return;
  }
  
  // Obtener valores del formulario
  const dateInput = document.getElementById('capsuleDate');
  const timeInput = document.getElementById('capsuleTime');
  const messageInput = document.getElementById('capsuleMessage');
  
  const dateValue = dateInput.value;
  const timeValue = timeInput.value;
  const message = messageInput.value.trim();
  
  // Validar que todos los campos estén completos
  if (!dateValue || !timeValue || !message) {
    showNotification("js.notification.capsule_missing_fields", "error");
    return;
  }
  
  // Validar mensaje
  if (!validateUserInput(message, 500)) {
    showNotification("security.content_invalid", "error");
    return;
  }
  
  // Verificar palabras ofensivas
  if (window.contienePalabraOfensiva(message)) {
    showNotification("security.inappropriate_content", "error");
    return;
  }
  
  // Convertir fecha y hora a objeto Date
  const openDate = new Date(`${dateValue}T${timeValue}`);
  const now = new Date();
  
  // Validar que la fecha sea futura
  if (openDate <= now) {
    showNotification("js.notification.capsule_in_past", "error");
    return;
  }
  
  // Prevenir envíos múltiples
  if (this.dataset.processing === 'true') {
    return;
  }
  
  try {
    this.disabled = true;
    this.dataset.processing = 'true';
    
    // Guardar cápsula
    await db.collection('capsules').add({
      message: sanitizeHTML(message),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      openAt: openDate,
      userId: user.uid,
      country: userCountry,
      isOpen: false,
      antiReplay: generateAntiReplayToken()
    });
    
    // Limpiar formulario
    dateInput.value = '';
    timeInput.value = '';
    messageInput.value = '';
    localStorage.removeItem('libre_draft_capsule');
    
    const counterElement = document.getElementById('charCounterCapsule');
    if (counterElement) {
      counterElement.textContent = messageInput.getAttribute('maxlength') || '500';
      counterElement.classList.remove('warn', 'danger');
    }
    
    // Formatear fecha para notificación
    const dateOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    };
    const formattedDate = openDate.toLocaleDateString(
      currentLang === 'es' ? 'es-ES' : 'en-US', 
      dateOptions
    );
    
    showNotification(
      `${translations[currentLang]?.['js.notification.capsule_scheduled'] || 'Cápsula programada para'} ${formattedDate}`,
      "success"
    );
    
    // Recargar lista de cápsulas
    loadMyCapsules();
    
  } catch (error) {
    console.error("Error guardando cápsula:", error);
    showNotification("js.notification.capsule_error", "error");
  } finally {
    this.disabled = false;
    delete this.dataset.processing;
  }
};

// Cargar mis cápsulas
async function loadMyCapsules() {
  const capsulesContainer = document.getElementById('capsulesList');
  if (!capsulesContainer) return;
  
  // Verificar autenticación
  const user = firebase.auth().currentUser;
  if (!user) {
    capsulesContainer.innerHTML = '<p class="empty-state">' + 
      (translations[currentLang]?.['security.auth_required'] || 'Please wait while the connection is established') + 
      '</p>';
    return;
  }
  
  try {
    // Mostrar loader
    capsulesContainer.innerHTML = '<div class="p-3 skeleton-loader"></div><div class="p-3 skeleton-loader"></div>';
    
    // Obtener cápsulas del usuario
    const capsulesSnapshot = await db.collection('capsules')
      .where('userId', '==', user.uid)
      .orderBy('openAt', 'asc')
      .get();
    
    // Si no hay cápsulas, mostrar mensaje
    if (capsulesSnapshot.empty) {
      capsulesContainer.innerHTML = `<p class="empty-state">
        ${translations[currentLang]?.['empty.my_capsules'] || 'No tienes cápsulas programadas.'}
      </p>`;
      return;
    }
    
    // Mostrar cápsulas
    capsulesContainer.innerHTML = '';
    
    capsulesSnapshot.forEach(doc => {
      const capsule = doc.data();
      const openAt = capsule.openAt.toDate();
      const now = new Date();
      const isOpen = capsule.isOpen || openAt <= now;
      
      // Si está abierta y no se ha marcado como tal, actualizarla
      if (openAt <= now && !capsule.isOpen) {
        db.collection('capsules').doc(doc.id).update({ isOpen: true });
      }
      
      const capsuleElement = document.createElement('div');
      capsuleElement.className = `p-4 rounded-lg mb-3 ${isOpen ? 'bg-purple-100' : 'bg-white shadow-sm'}`;
      
      // Formatear fecha
      const dateOptions = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      };
      const formattedDate = openAt.toLocaleDateString(
        currentLang === 'es' ? 'es-ES' : 'en-US', 
        dateOptions
      );
      
      // Mostrar cuenta regresiva o fecha de apertura
      let timeDisplay;
      if (isOpen) {
        timeDisplay = `
          <div class="text-sm text-purple-600 mb-2">
            <span class="material-icons" style="font-size: 1rem; vertical-align: text-bottom;">schedule</span>
            <span>${translations[currentLang]?.['capsule.opened_label'] || 'Abierta:'} ${formattedDate}</span>
          </div>`;
      } else {
        timeDisplay = `
          <div class="text-sm text-purple-800 mb-2">
            <span class="material-icons" style="font-size: 1rem; vertical-align: text-bottom;">hourglass_empty</span>
            <span>${translations[currentLang]?.['capsule.countdown_label'] || 'Se abre en:'}</span>
            <span class="capsule-countdown" data-open-at="${openAt.getTime()}"></span>
          </div>`;
      }
      
      capsuleElement.innerHTML = `
        ${timeDisplay}
        <p class="${isOpen ? '' : 'blur-text'}">${sanitizeHTML(capsule.message)}</p>
      `;
      
      capsulesContainer.appendChild(capsuleElement);
    });
    
    // Iniciar cuentas regresivas
    updateCapsuleCountdowns();
    setInterval(updateCapsuleCountdowns, 60000); // Actualizar cada minuto
    
  } catch (error) {
    console.error("Error cargando cápsulas:", error);
    capsulesContainer.innerHTML = '<p class="error-state">Error al cargar cápsulas.</p>';
  }
}

// Actualizar cuentas regresivas de cápsulas
function updateCapsuleCountdowns() {
  document.querySelectorAll('.capsule-countdown').forEach(element => {
    const openAt = new Date(parseInt(element.dataset.openAt));
    const now = new Date();
    const difference = openAt - now;
    
    if (difference <= 0) {
      // Cápsula ya abierta, recargar lista
      loadMyCapsules();
      return;
    }
    
    // Calcular días, horas y minutos restantes
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    
    // Formatear texto según idioma
    if (currentLang === 'es') {
      if (days > 0) {
        element.textContent = `${days} día${days !== 1 ? 's' : ''} y ${hours} hora${hours !== 1 ? 's' : ''}`;
      } else if (hours > 0) {
        element.textContent = `${hours} hora${hours !== 1 ? 's' : ''} y ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
      } else {
        element.textContent = `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
      }
    } else {
      if (days > 0) {
        element.textContent = `${days} day${days !== 1 ? 's' : ''} and ${hours} hour${hours !== 1 ? 's' : ''}`;
      } else if (hours > 0) {
        element.textContent = `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else {
        element.textContent = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      }
    }
  });
}

// ===== PARTE 7: ESTADÍSTICAS Y ARRANQUE =====

// Refrescar todos los datos
function refreshAllData() {
  loadGlobalThoughts(currentPage);
  loadGlobalStats();
  loadCountryRanking();
  loadMap();
}

// Refrescar pestaña "Lo Mío"
function refreshMineTab() {
  loadMyThoughts(myCurrentPage);
  loadPersonalStats();
  updateLastRepliesSeen();
}

// Actualizar última fecha de visualización de respuestas
function updateLastRepliesSeen() {
  localStorage.setItem('libre_last_replies_seen', new Date().toISOString());
}

// Cargar mis pensamientos
async function loadMyThoughts(page = 1) {
  const myThoughtsContainer = document.getElementById('myThoughts');
  if (!myThoughtsContainer) return;
  
  // Verificar autenticación
  const user = firebase.auth().currentUser;
  if (!user) {
    myThoughtsContainer.innerHTML = '<p class="empty-state">' + 
      (translations[currentLang]?.['security.auth_required'] || 'Please wait while the connection is established') + 
      '</p>';
    return;
  }
  
  try {
    // Mostrar loader
    myThoughtsContainer.innerHTML = '<div class="p-4 skeleton-loader"></div><div class="p-4 skeleton-loader"></div>';
    
    // Calcular índices para paginación
    const startIdx = (page - 1) * itemsPerPage;
    
    // Obtener cantidad total de pensamientos para la paginación
    const userThoughtsCountSnapshot = await db.collection('thoughts')
      .where('user', '==', user.uid)
      .count()
      .get();
    
    const totalMyThoughts = userThoughtsCountSnapshot.data().count;
    myTotalPages = Math.ceil(totalMyThoughts / itemsPerPage) || 1;
    
    // Si no hay pensamientos, mostrar mensaje
    if (totalMyThoughts === 0) {
      myThoughtsContainer.innerHTML = `<p class="empty-state">
        ${translations[currentLang]?.['empty.my_thoughts'] || 'No has compartido ningún pensamiento'}
      </p>`;
      updateMyPagination(page, myTotalPages);
      return;
    }
    
    // Obtener pensamientos para esta página
    const myThoughtsSnapshot = await db.collection('thoughts')
      .where('user', '==', user.uid)
      .orderBy('ts', 'desc')
      .limit(itemsPerPage)
      .offset(startIdx)
      .get();
    
    // Limpiar contenedor
    myThoughtsContainer.innerHTML = '';
    
    // Obtener última fecha vista de respuestas
    let lastSeen = localStorage.getItem('libre_last_replies_seen');
    lastSeen = lastSeen ? new Date(lastSeen) : new Date(0);
    
    // Para cada pensamiento, obtener sus respuestas
    const promises = myThoughtsSnapshot.docs.map(async doc => {
      const thought = doc.data();
      const timestamp = thought.ts ? formatDate(thought.ts) : '';
      
      // Obtener respuestas para este pensamiento
      const repliesSnapshot = await db.collection('replies')
        .where('thoughtId', '==', doc.id)
        .orderBy('ts', 'desc')
        .get();
      
      // Verificar si hay respuestas nuevas (posteriores a lastSeen)
      let hasNewReplies = false;
      repliesSnapshot.forEach(replyDoc => {
        const replyTimestamp = replyDoc.data().ts;
        if (replyTimestamp && replyTimestamp.toDate() > lastSeen) {
          hasNewReplies = true;
        }
      });
      
      // Crear elemento del pensamiento
      const thoughtElement = document.createElement('div');
      thoughtElement.className = 'p-4 bg-white rounded-lg shadow-sm mb-4';
      
      // HTML para las respuestas
      let repliesHTML = '';
      
      if (repliesSnapshot.size > 0) {
        repliesHTML += `
          <div class="mt-4 border-t pt-3">
            <h4 class="font-medium mb-2">
              ${translations[currentLang]?.['mine.replies_received_title'] || 'Respuestas recibidas'}
              ${hasNewReplies ? 
                `<span class="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                  ${translations[currentLang]?.['mine.new_replies_badge'] || 'NUEVO'}
                </span>` : 
                ''}
            </h4>
            <div class="space-y-3">
        `;
        
        repliesSnapshot.forEach(replyDoc => {
          const reply = replyDoc.data();
          const replyTimestamp = reply.ts ? formatTimeAgo(reply.ts) : '';
          
          const country = reply.country || 'Desconocido';
          const countryName = getCountryName(country, currentLang);
          const countryFlag = getCountryFlag(country);
          
          // Añadir clase para resaltar respuestas nuevas
          const isNewClass = reply.ts && reply.ts.toDate() > lastSeen ? 'new-reply' : '';
          
          repliesHTML += `
            <div class="p-3 bg-blue-50 rounded-lg ${isNewClass}">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center">
                  <span class="country-flag">${countryFlag}</span>
                  <span class="country-name ml-2">${sanitizeHTML(countryName)}</span>
                </div>
                <span class="text-sm text-gray-500">${sanitizeHTML(replyTimestamp)}</span>
              </div>
              <p>${sanitizeHTML(reply.text)}</p>
            </div>
          `;
        });
        
        repliesHTML += `</div></div>`;
      } else {
        repliesHTML = `
          <div class="mt-4 border-t pt-3">
            <p class="text-gray-500 text-sm">
              ${translations[currentLang]?.['mine.no_replies'] || 'Aún no hay respuestas'}
            </p>
          </div>
        `;
      }
      
      // Completar el elemento del pensamiento
      thoughtElement.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <span class="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
              ${translations[currentLang]?.['feed.own_thought_label'] || 'Este pensamiento es tuyo'}
            </span>
          </div>
          <span class="text-sm text-gray-500">
            ${translations[currentLang]?.['mine.sent_on'] || 'Enviado el'} ${sanitizeHTML(timestamp)}
          </span>
        </div>
        <p class="mb-3">${sanitizeHTML(thought.text)}</p>
        ${repliesHTML}
      `;
      
      // Añadir el pensamiento al contenedor
      myThoughtsContainer.appendChild(thoughtElement);
    });
    
    // Esperar a que todas las promesas se completen
    await Promise.all(promises);
    
    // Actualizar paginación
    updateMyPagination(page, myTotalPages);
    
  } catch (error) {
    console.error("Error loading my thoughts:", error);
    myThoughtsContainer.innerHTML = '<p class="error-state">Error al cargar tus pensamientos.</p>';
  }
}

// Actualizar paginación para "mis pensamientos"
function updateMyPagination(currentPage, totalPages) {
  const paginationContainer = document.getElementById('myPagination');
  if (!paginationContainer) return;
  
  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }
  
  const prevBtn = currentPage > 1 ? 
    `<button class="pagination-btn prev" onclick="changeMyPage(${currentPage - 1})">
      ${translations[currentLang]?.['feed.pagination_previous'] || 'Anterior'}
     </button>` : '';
  
  const nextBtn = currentPage < totalPages ? 
    `<button class="pagination-btn next" onclick="changeMyPage(${currentPage + 1})">
      ${translations[currentLang]?.['feed.pagination_next'] || 'Siguiente'}
     </button>` : '';
  
  paginationContainer.innerHTML = `
    <div class="flex items-center justify-between">
      ${prevBtn}
      <span class="pagination-info">
        ${translations[currentLang]?.['feed.pagination_page'] || 'Página'} ${currentPage} 
        ${translations[currentLang]?.['feed.pagination_of'] || 'de'} ${totalPages}
      </span>
      ${nextBtn}
    </div>
  `;
}

// Cambiar página en "mis pensamientos"
function changeMyPage(page) {
  myCurrentPage = page;
  loadMyThoughts(page);
}

// Cargar estadísticas personales
async function loadPersonalStats() {
  const statsContainer = document.getElementById('personalStats');
  if (!statsContainer) return;
  
  // Verificar autenticación
  const user = firebase.auth().currentUser;
  if (!user) return;
  
  try {
    // Mostrar loader
    statsContainer.innerHTML = '<div class="p-2 skeleton-loader"></div>';
    
    // Contar pensamientos enviados
    const thoughtsSnapshot = await db.collection('thoughts')
      .where('user', '==', user.uid)
      .count()
      .get();
    const thoughtsCount = thoughtsSnapshot.data().count;
    
    // Contar respuestas recibidas
    const repliesSnapshot = await db.collection('replies')
      .where('toUser', '==', user.uid)
      .count()
      .get();
    const repliesCount = repliesSnapshot.data().count;
    
    // Contar países que han visto mis pensamientos (aproximación)
    const countriesSnapshot = await db.collection('replies')
      .where('toUser', '==', user.uid)
      .get();
    
    const countriesSet = new Set();
    countriesSnapshot.forEach(doc => {
      const country = doc.data().country;
      if (country && country !== 'Desconocido') {
        countriesSet.add(country);
      }
    });
    
    // Mostrar estadísticas
    statsContainer.innerHTML = `
      <h3 class="font-semibold mb-3">
        ${translations[currentLang]?.['mine.stats_title'] || 'Mis estadísticas'}
      </h3>
      <div class="space-y-2">
        <div class="flex justify-between">
          <span>${translations[currentLang]?.['mine.stats_thoughts_sent'] || 'Pensamientos enviados:'}</span>
          <span class="font-medium">${thoughtsCount}</span>
        </div>
        <div class="flex justify-between">
          <span>${translations[currentLang]?.['mine.stats_replies_received'] || 'Respuestas recibidas:'}</span>
          <span class="font-medium">${repliesCount}</span>
        </div>
        <div class="flex justify-between">
          <span>${translations[currentLang]?.['mine.stats_global_reach'] || 'Alcance global:'}</span>
          <span class="font-medium">
            ${countriesSet.size} 
            ${translations[currentLang]?.['mine.stats_countries'] || 'países'}
          </span>
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error("Error loading personal stats:", error);
    statsContainer.innerHTML = '<p class="error-state">Error al cargar estadísticas.</p>';
  }
}

// Cargar estadísticas globales
async function loadGlobalStats() {
  const statsContainer = document.getElementById('estadisticasAnonimas');
  if (!statsContainer) return;
  
  try {
    // Mostrar loader
    statsContainer.innerHTML = '<div class="p-2 skeleton-loader"></div>';
    
    // Obtener estadísticas globales
    const statsDoc = await db.collection('stats').doc('global').get();
    
    if (!statsDoc.exists) {
      statsContainer.innerHTML = '<p class="empty-state">No hay estadísticas disponibles.</p>';
      return;
    }
    
    const stats = statsDoc.data();
    
    // Formatear estadísticas
    statsContainer.innerHTML = `
      <h3 class="font-semibold mb-2">
        ${translations[currentLang]?.['feed.stats_title'] || 'Estadísticas'}
      </h3>
      <div class="space-y-1 text-sm">
        <div class="flex justify-between">
          <span>${translations[currentLang]?.['feed.stats_today'] || 'Hoy:'}</span>
          <span class="font-medium">${stats.today || 0}</span>
        </div>
        <div class="flex justify-between">
          <span>${translations[currentLang]?.['feed.stats_week_countries'] || 'Países esta semana:'}</span>
          <span class="font-medium">${stats.week_countries || 0}</span>
        </div>
        <div class="flex justify-between">
          <span>${translations[currentLang]?.['feed.stats_record'] || 'Récord diario:'}</span>
          <span class="font-medium">${stats.record || 0}</span>
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error("Error loading global stats:", error);
    statsContainer.innerHTML = '<p class="error-state">Error al cargar estadísticas.</p>';
  }
}

// Cargar ranking de países
async function loadCountryRanking() {
  const rankingContainer = document.getElementById('countryRanking');
  if (!rankingContainer) return;
  
  try {
    // Mostrar loader
    rankingContainer.innerHTML = '<div class="p-2 skeleton-loader"></div>';
    
    // Obtener ranking
    const rankingDoc = await db.collection('stats').doc('country_ranking').get();
    
    if (!rankingDoc.exists || !rankingDoc.data().ranking || rankingDoc.data().ranking.length === 0) {
      rankingContainer.innerHTML = '<p class="empty-state">No hay datos de países disponibles.</p>';
      return;
    }
    
    const ranking = rankingDoc.data().ranking.slice(0, 5); // Top 5 países
    
    let rankingHTML = `
      <h3 class="font-semibold mb-2">
        ${translations[currentLang]?.['feed.ranking_title'] || 'Top países'}
      </h3>
      <div class="space-y-2">
    `;
    
    ranking.forEach((item, index) => {
      const countryCode = item.country;
      const countryName = getCountryName(countryCode, currentLang);
      const countryFlag = getCountryFlag(countryCode);
      
      rankingHTML += `
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span class="text-gray-500 mr-2">${index + 1}.</span>
            <span class="country-flag">${countryFlag}</span>
            <span class="country-name ml-1">${sanitizeHTML(countryName)}</span>
          </div>
          <span class="font-medium">${item.count}</span>
        </div>
      `;
    });
    
    rankingHTML += '</div>';
    rankingContainer.innerHTML = rankingHTML;
    
  } catch (error) {
    console.error("Error loading country ranking:", error);
    rankingContainer.innerHTML = '<p class="error-state">Error al cargar ranking.</p>';
  }
}

// Cargar mapa de pensamientos
function loadMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;
  
  try {
    // Inicializar mapa si no existe
    if (!window.thoughtsMap) {
      window.thoughtsMap = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 1,
        maxZoom: 5,
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: false,
        doubleClickZoom: false
      });
      
      // Añadir capa base (estilo minimalista)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: false
      }).addTo(window.thoughtsMap);
      
      // Invalidar tamaño para corregir renderizado
      setTimeout(() => {
        window.thoughtsMap.invalidateSize();
      }, 100);
    }
    
    // Limpiar marcadores anteriores
    if (window.thoughtMarkers) {
      window.thoughtMarkers.forEach(marker => marker.remove());
    }
    window.thoughtMarkers = [];
    
    // Cargar puntos de actividad
    db.collection('map_data').doc('activity_points').get().then(doc => {
      if (!doc.exists || !doc.data().points) return;
      
      const points = doc.data().points;
      
      points.forEach(point => {
        // Añadir un pequeño jitter para separar puntos en la misma ubicación
        const jitterLat = (Math.random() * 0.6) - 0.3;
        const jitterLng = (Math.random() * 0.6) - 0.3;
        
        const marker = L.circleMarker([point.lat + jitterLat, point.lng + jitterLng], {
          radius: 4,
          fillColor: '#3b82f6',
          fillOpacity: 0.6,
          color: '#2563eb',
          weight: 1
        }).addTo(window.thoughtsMap);
        
        window.thoughtMarkers.push(marker);
      });
    }).catch(error => {
      console.error("Error loading map data:", error);
    });
    
  } catch (error) {
    console.error("Error initializing map:", error);
  }
}

// Obtener nombre de país
function getCountryName(countryCode, lang = 'es') {
  if (!countryCode || countryCode === 'Desconocido') {
    return lang === 'es' ? 'Desconocido' : 'Unknown';
  }
  
  try {
    // Usar la base de datos de países
    if (window.countriesDB && window.countriesDB[countryCode]) {
      return window.countriesDB[countryCode][lang === 'es' ? 'name_es' : 'name_en'] || countryCode;
    }
    
    return countryCode;
  } catch (error) {
    console.error("Error getting country name:", error);
    return countryCode;
  }
}

// Obtener bandera de país
function getCountryFlag(countryCode) {
  if (!countryCode || countryCode === 'Desconocido') {
    return '🌐'; // Globo terráqueo para desconocido
  }
  
  try {
    // Convertir código de país a emoji de bandera (Unicode)
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    console.error("Error getting country flag:", error);
    return '🌐';
  }
}

// ===== INICIALIZACIÓN DE LA APLICACIÓN =====

// Función principal de inicialización
function initializeApp() {
  // Detectar país del usuario
  detectCountry();
  
  // Configurar autenticación anónima
  setupAnonymousAuth();
  
  // Configurar pantalla de bienvenida
  setupWelcomeScreen();
  
  // Aplicar traducciones según idioma del navegador
  const browserLang = navigator.language.slice(0, 2);
  currentLang = ['es', 'en'].includes(browserLang) ? browserLang : 'es';
  applyTranslations();
  
  // Configurar botones de idioma
  document.getElementById('lang-es').addEventListener('click', () => {
    currentLang = 'es';
    applyTranslations();
    mostrarFraseInspiradoraEnTextarea();
    if (!document.getElementById('mineTab').classList.contains('hidden')) {
      refreshMineTab();
    } else {
      refreshAllData();
    }
  });
  
  document.getElementById('lang-en').addEventListener('click', () => {
    currentLang = 'en';
    applyTranslations();
    mostrarFraseInspiradoraEnTextarea();
    if (!document.getElementById('mineTab').classList.contains('hidden')) {
      refreshMineTab();
    } else {
      refreshAllData();
    }
  });
  
  // Configurar textareas y contadores
  setupTextareaFeatures(
    document.getElementById('textarea'),
    document.getElementById('charCounterMain'),
    'libre_draft_main'
  );
  
  setupTextareaFeatures(
    document.getElementById('revelacionTextarea'),
    document.getElementById('charCounterRevelation'),
    'libre_draft_revelation'
  );
  
  setupTextareaFeatures(
    document.getElementById('capsuleMessage'),
    document.getElementById('charCounterCapsule'),
    'libre_draft_capsule'
  );
  
  // Mostrar frase inspiradora inicial
  mostrarFraseInspiradoraEnTextarea();
  
  // Comprobar nuevas respuestas periódicamente
  setInterval(checkNewReplies, 60000); // Cada minuto
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeApp);