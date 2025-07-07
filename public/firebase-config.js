// === 🔥 CONFIGURACIÓN FIREBASE LIBRE ===
const firebaseConfig = {
  apiKey: "AIzaSyC7MKy2T8CFvpay4FBp8FTrVp8tpU0Niwc",
  authDomain: "libre-c5bf7.firebaseapp.com",
  projectId: "libre-c5bf7",
  storageBucket: "libre-c5bf7.appspot.com",
  messagingSenderId: "339942652190",
  appId: "1:339942652190:web:595ce692456b9df806f10f"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Referencia a Firestore
const db = firebase.firestore();
