document.addEventListener('DOMContentLoaded', () => {
    const thoughtInput = document.getElementById('thoughtInput');
    const charCount = document.getElementById('charCount');
    // const activateThoughtInput = document.getElementById('activateThoughtInput'); // Eliminado ya que el lápiz fue removido
    const sendThoughtBtn = document.getElementById('sendThoughtBtn');

    const MAX_CHARS = 500; // Definimos el límite de caracteres

    // Inicializar el contador de caracteres
    charCount.textContent = MAX_CHARS;

    // Actualizar el contador de caracteres mientras se escribe
    thoughtInput.addEventListener('input', () => {
        const remaining = MAX_CHARS - thoughtInput.value.length;
        charCount.textContent = remaining;
        // Opcional: cambiar color si quedan pocos caracteres
        if (remaining < 50) {
            charCount.style.color = 'orange';
        } else if (remaining < 10) {
            charCount.style.color = 'red';
        } else {
            charCount.style.color = 'var(--text-color-secondary)'; // Usar el color por defecto
        }

        // Mostrar u ocultar el botón de enviar basado en si hay texto
        if (thoughtInput.value.trim().length > 0) {
            sendThoughtBtn.style.display = 'block';
        } else {
            sendThoughtBtn.style.display = 'none';
        }
    });

    // Eliminado: Activar el campo de texto al hacer clic en el icono del lápiz
    /*
    activateThoughtInput.addEventListener('click', () => {
        thoughtInput.focus();
    });
    */

    // Evento para el botón de enviar (por ahora, solo un console.log)
    sendThoughtBtn.addEventListener('click', () => {
        const thought = thoughtInput.value.trim();
        if (thought) {
            console.log("Pensamiento enviado:", thought);
            // Aquí irá la lógica para enviar el pensamiento a Firebase
            // y manejar el límite de 3 pensamientos/día.
            thoughtInput.value = ''; // Limpiar el campo después de "enviar"
            charCount.textContent = MAX_CHARS; // Restablecer el contador
            charCount.style.color = 'var(--text-color-secondary)';
            sendThoughtBtn.style.display = 'none'; // Ocultar el botón
        }
    });

    // También, para el Pensamiento Destacado y el conteo global, por ahora
    // pondremos valores de ejemplo. Luego se llenarán desde Firebase.
    const featuredThoughtBox = document.querySelector('.featured-thought-box');
    const totalThoughtsCount = document.getElementById('totalThoughtsCount');

    // Ejemplo inicial de Pensamiento Destacado
    featuredThoughtBox.innerHTML = `<p class="featured-thought-content">"La creatividad es la inteligencia divirtiéndose." - Albert Einstein</p>`;

    // Ejemplo inicial de conteo global (luego vendrá de Firebase)
    totalThoughtsCount.textContent = '14230'; // Tu número de ejemplo

    // Ocultar el placeholder "PENSAMIENTO DESTACADO" una vez que hay contenido
    const featuredThoughtPlaceholder = document.querySelector('.featured-thought-placeholder');
    if (featuredThoughtPlaceholder) {
        featuredThoughtPlaceholder.style.display = 'none';
    }
});
