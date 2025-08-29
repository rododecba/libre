// Firebase config - Seguro incluir en cliente ya que se protege con reglas de Firestore
const firebaseConfig = {
  apiKey: "AIzaSyD3fKmS0g3JRfiIp8i9dqsdSA9w_C0ctxY",
  authDomain: "libreantisocial.firebaseapp.com",
  projectId: "libreantisocial",
  storageBucket: "libreantisocial.firebasestorage.app",
  messagingSenderId: "842162863212",
  appId: "1:842162863212:web:5dde2e830ba261fd35ec49",
  measurementId: "G-ZCYR53CGX7"
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