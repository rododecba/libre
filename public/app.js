// app.js

// Obtener referencias a los elementos
const input = document.getElementById("phraseInput");
const button = document.getElementById("submitBtn");
const list = document.getElementById("phraseList");

// Función para enviar frase a Firestore
button.addEventListener("click", async () => {
  const phrase = input.value.trim();
  if (!phrase) return;

  // Filtrado de lenguaje ofensivo
  const filter = new Filter(); // BadWords Filter
  if (filter.isProfane(phrase)) {
    alert("😬 Tu frase contiene palabras ofensivas.");
    return;
  }

  try {
    // Enviar a Firestore
    await db.collection("phrases").add({
      text: phrase,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    input.value = "";
    alert("🌬️ Frase soltada con éxito.");
    loadPhrases(); // Recargar lista
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("❌ Error al guardar la frase.");
  }
});

// Función para cargar frases existentes (últimos 10)
async function loadPhrases() {
  list.innerHTML = ""; // Limpiar
  try {
    const snapshot = await db
      .collection("phrases")
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    snapshot.forEach((doc) => {
      const li = document.createElement("li");
      li.textContent = doc.data().text;
      list.appendChild(li);
    });
  } catch (error) {
    console.error("Error al cargar frases:", error);
  }
}

// Cargar frases al iniciar
loadPhrases();
