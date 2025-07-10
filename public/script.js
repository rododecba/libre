// --- Importaciones de Firebase ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp, where, doc, getDoc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

// --- (Las importaciones de Leaflet y GeoSearch se ELIMINAN de aquí) ---
// ANTES:
// import './lib/leaflet/leaflet-src.esm.js';
// import 'https://unpkg.com/leaflet-geosearch@3.11.0/dist/geosearch.umd.js';
// AHORA: ¡Estas dos líneas deben ser BORRADAS de script.js!


// --- TU CONFIGURACIÓN DE FIREBASE REAL ---
const firebaseConfig = {
    apiKey: "AIzaSyC7MKy2T8CFvpay4FBp8FTrVp8tpU0Niwc",
    authDomain: "libre-c5bf7.firebaseapp.com",
    projectId: "libre-c5bf7",
    storageBucket: "libre-c5bf7.firebasestorage.app",
    messagingSenderId: "339942652190",
    appId: "1:339942652190:web:595ce692456b9df806f10f"
};

// --- Inicialización de Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // Obtiene la instancia de Firestore
const auth = getAuth(app);     // Obtiene la instancia de Auth

// ... (el resto de tu script.js se mantiene igual desde aquí hacia abajo)
