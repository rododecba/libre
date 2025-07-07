// Inicializar filtro de malas palabras
const filter = new Filter();

// Referencias a los elementos
const input = document.getElementById("phraseInput");
const button = document.getElementById("submitBtn");
const list = document.getElementById("phraseList");

// Función para cargar las frases
function loadPhrases() {
  db.collection("phrases")
    .orderBy("timestamp", "desc")
    .limit(50)
    .get()
    .then(snapshot => {
      list.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const li = document.createElement("li");
        li.textContent = data.text;
        list.appendChild(li);
      });
    })
    .catch(error => {
      console.error("❌ Error al cargar frases:", error);
    });
}

// Evento al presionar el botón
button.addEventListener("click", () => {
  const rawText = input.value.trim();

  if (rawText === "") {
    alert("Escribe algo antes de soltarlo.");
    return;
  }

  const cleanText = filter.clean(rawText);

  db.collection("phrases")
    .add({
      text: cleanText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      input.value = "";
      loadPhrases();
    })
    .catch(error => {
      console.error("❌ Error al guardar la frase:", error);
    });
});

// Cargar frases al inicio
loadPhrases();
