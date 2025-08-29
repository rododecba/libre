// --- IMPORTANTE ---
// La configuración de Firebase se ha movido para mejorar la seguridad.
// NO DEBES almacenar tus claves de API directamente en el código del lado del cliente.
// En su lugar, utiliza variables de entorno o un servicio de configuración remota
// proporcionado por tu plataforma de hosting (ej. Netlify, Vercel, Firebase Hosting).

// Ejemplo de cómo podrías obtener las variables de entorno (esto es conceptual):
// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID,
//   measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
// };

// Por ahora, el objeto está vacío. Debes llenarlo desde una fuente segura.
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "TU_AUTH_DOMAIN_AQUI",
  projectId: "TU_PROJECT_ID_AQUI",
  storageBucket: "TU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "TU_MESSAGING_SENDER_ID_AQUI",
  appId: "TU_APP_ID_AQUI",
  measurementId: "TU_MEASUREMENT_ID_AQUI"
};


// No incluir tokens de API en el código cliente
// Se reemplaza la función por una versión que use un servicio sin tokens
async function detectCountry() {
  try {
    // Usando un servicio sin necesidad de API key expuesta
    const res = await fetch('https://ip-api.com/json?fields=country,countryCode');
    const data = await res.json();
    userCountry = data.countryCode || "Desconocido";
  } catch (e) {
    console.error("Error detecting country:", e);
    userCountry = "Desconocido";
  } finally {
    countryReady = true;
  }
}