# LIBRE 🌬️

**LIBRE** es una app web minimalista y antisocial para soltar pensamientos. Sin likes, sin cuentas obligatorias, sin validación social. Solo tú, tu frase… y el viento.

## 🧠 ¿Qué es LIBRE?

Un lugar para soltar lo que no dijiste. Cada persona puede escribir una frase (máx. 500 caracteres), de forma anónima u opcional con nombre.  
La frase desaparece automáticamente a los **30 días**.  
Cualquier usuario puede responder de forma anónima. No hay recuentos, ni métricas visibles, ni seguidores.

## ✨ Características

- ✅ Sin login obligatorio
- ✅ Diseño limpio, emocional y sin distracciones
- ✅ Frases públicas anónimas
- ✅ Filtro automático de contenido ofensivo (`bad-words`)
- ✅ Animación simbólica de viento al enviar (sugerido)
- ✅ Disponible en varios idiomas (próximamente)
- ✅ Código 100% en HTML + CSS + JS + Firebase

## 📁 Estructura de carpetas

📁 /public
│
├── index.html # Estructura principal del sitio
├── style.css # Estilo visual moderno
├── app.js # Lógica principal de la app
├── firebase-config.js # Configuración de Firebase

## 🚀 Deploy en Netlify

1. Subí el contenido del zip a tu repositorio GitHub
2. Conectá Netlify a tu repo
3. Build command: _(no necesario)_
4. Publish directory: `public/` _(o raíz si es estático)_

## 🔧 Configuración Firebase (Firestore)

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilita Firestore en modo prueba
3. Agrega tu configuración en `firebase-config.js`
4. Asegúrate de tener esta colección: `phrases`

## 🛡️ Seguridad y moderación

- Se utiliza la librería `bad-words` para filtrar lenguaje ofensivo.
- Opcional: implementar botón de “marcar como inapropiado” por los usuarios.
- Las frases no tienen nombre visible por defecto.

## 🧩 Tecnologías usadas

- HTML5 / CSS3 / JavaScript (Vanilla)
- Firebase Firestore
- Bad-Words (npm CDN)
- Hosting con Netlify

## 📬 Sugerencias futuras

- Traducción automática multilingüe
- Respuestas anónimas a frases
- Estadísticas personales (privadas)
- Modo oscuro / silencioso

---

### 🌬️ **LIBRE**
> "Lo que no se dice, también necesita salir."
