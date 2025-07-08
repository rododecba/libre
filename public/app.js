
// Inicialización de Firestore
const db = firebase.firestore();
const phraseInput = document.getElementById("phraseInput");
const submitBtn = document.getElementById("submitBtn");
const phraseList = document.getElementById("phraseList");

// Función para soltar frase
submitBtn.addEventListener("click", async () => {
  const text = phraseInput.value.trim();
  if (!text) return;

  const now = new Date();
  await db.collection("phrases").add({
    text,
    timestamp: firebase.firestore.Timestamp.fromDate(now),
    responses: []
  });

  phraseInput.value = "";
  loadPhrases(); // refrescar
});

// Cargar frases activas (menos de 30 días)
async function loadPhrases() {
  phraseList.innerHTML = "";
  const snapshot = await db.collection("phrases").get();
  const now = new Date();

  snapshot.forEach(doc => {
    const data = doc.data();
    const created = data.timestamp.toDate();
    const age = (now - created) / (1000 * 60 * 60 * 24);

    if (age <= 30) {
      const li = document.createElement("li");
      li.textContent = data.text;
      phraseList.appendChild(li);
    }
  });
}

loadPhrases();
