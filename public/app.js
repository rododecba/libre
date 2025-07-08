// === FIRESTORE ===
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const phrasesRef = db.collection("phrases");

// === ELEMENTOS ===
const input = document.getElementById("phraseInput");
const button = document.getElementById("submitBtn");
const list = document.getElementById("phraseList");

// === FILTRO SIMPLE DE MALAS PALABRAS ===
const badWords = ["puta", "mierda", "imbécil", "tonto", "idiota", "joder"];
function isClean(text) {
  const lower = text.toLowerCase();
  return !badWords.some(word => lower.includes(word));
}

// === GUARDAR FRASE ===
button.addEventListener("click", async () => {
  const text = input.value.trim();

  if (text === "") return alert("Escribe algo...");
  if (!isClean(text)) return alert("Tu mensaje contiene palabras inapropiadas.");

  try {
    await phrasesRef.add({
      text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    input.value = "";
    alert("Frase soltada 🌬️");
    loadPhrases(); // recargar lista
  } catch (err) {
    console.error("Error al guardar:", err);
  }
});

// === CARGAR FRASES ===
async function loadPhrases() {
  list.innerHTML = "";
  const snapshot = await phrasesRef.orderBy("createdAt", "desc").limit(10).get();
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = doc.data().text;
    list.appendChild(li);
  });
}

// Inicial
loadPhrases();
