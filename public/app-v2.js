// ... [tus otras funciones y variables aquí, sin cambios hasta llegar a la animación de bienvenida] ...

// ---- LÓGICA DE LA PANTALLA DE BIENVENIDA ----
function setupWelcomeScreen() {
    const overlay = document.getElementById('welcome-overlay');
    if (!overlay) return;
    // Si el usuario ya vio la bienvenida, eliminamos el overlay del DOM y no hacemos nada más.
    if (localStorage.getItem('libre_welcome_seen') === 'true') {
        overlay.remove();
        return;
    }
    // Mostramos el overlay si es la primera vez
    overlay.classList.remove('hidden');
    overlay.setAttribute('tabindex', '0');
    setTimeout(() => overlay.focus(), 400);

    const slides = document.querySelectorAll('.welcome-slide');
    const startBtn = document.getElementById('welcome-start-btn');
    const dotsContainer = document.getElementById('welcome-dots');
    const prevArrow = document.getElementById('welcome-arrow-prev');
    const nextArrow = document.getElementById('welcome-arrow-next');
    let currentSlide = 0;
    let welcomeInterval;
    let dots = [];

    // Crear puntos de navegación
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'welcome-dot';
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.onclick = () => goToSlide(i);
        dot.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { goToSlide(i); } };
        dotsContainer.appendChild(dot);
    });
    dots = document.querySelectorAll('.welcome-dot');

    function updateDots() {
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    function showSlide(idx) {
        slides.forEach((slide, i) => slide.classList.toggle('active', i === idx));
        updateDots();
        // Mostrar/ocultar flechas según posición
        if (prevArrow) prevArrow.style.display = idx === 0 ? 'none' : '';
        if (nextArrow) nextArrow.style.display = idx === slides.length - 1 ? 'none' : '';
        // Mostrar botón solo en la última slide
        if (startBtn) startBtn.classList.toggle('hidden', idx !== slides.length - 1);
        // Ocultar puntos al final
        if (dotsContainer) dotsContainer.classList.toggle('hidden', idx === slides.length - 1);
    }

    function goToSlide(idx) {
        if (idx < 0) idx = 0;
        if (idx >= slides.length) idx = slides.length - 1;
        currentSlide = idx;
        showSlide(currentSlide);
        resetInterval();
    }

    function showNextSlide() {
        if (currentSlide < slides.length - 1) {
            goToSlide(currentSlide + 1);
        } else {
            clearInterval(welcomeInterval);
            showSlide(currentSlide);
        }
    }

    function showPrevSlide() {
        if (currentSlide > 0) goToSlide(currentSlide - 1);
    }

    function resetInterval() {
        clearInterval(welcomeInterval);
        if (currentSlide < slides.length - 1) {
            welcomeInterval = setInterval(showNextSlide, 8000);
        }
    }

    // Flechas
    if (prevArrow) {
        prevArrow.onclick = showPrevSlide;
        prevArrow.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { showPrevSlide(); } };
    }
    if (nextArrow) {
        nextArrow.onclick = showNextSlide;
        nextArrow.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { showNextSlide(); } };
    }

    // Teclado: flechas izquierda/derecha, escape para cerrar si está en el final
    overlay.addEventListener('keydown', (e) => {
        if (overlay.classList.contains('hidden')) return;
        if (e.key === 'ArrowRight') { showNextSlide(); e.preventDefault(); }
        if (e.key === 'ArrowLeft') { showPrevSlide(); e.preventDefault(); }
        if ((e.key === 'Enter' || e.key === ' ') && currentSlide === slides.length - 1 && document.activeElement === startBtn) {
            startBtn.click();
        }
        // Opcional: permitir cerrar con ESC en la última slide
        if (e.key === 'Escape' && currentSlide === slides.length - 1) {
            startBtn.click();
        }
    });

    // Iniciar el carrusel automático
    welcomeInterval = setInterval(showNextSlide, 8000); // 8 segundos por diapositiva

    startBtn.onclick = () => {
        localStorage.setItem('libre_welcome_seen', 'true');
        overlay.classList.add('hidden');
        // Esperar a que la transición de opacidad termine antes de eliminar el elemento
        overlay.addEventListener('transitionend', () => overlay.remove());
        clearInterval(welcomeInterval);
    };

    // Inicialización
    showSlide(currentSlide);
}

// ... [resto del código intacto, sin conflictos] ...

// ---- INICIO DE LA APLICACIÓN ----
document.addEventListener('DOMContentLoaded', () => {
    setupWelcomeScreen();
    detectCountry();
    initializeApp();
});