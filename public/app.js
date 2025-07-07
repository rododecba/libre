const filter = new Filter();
const input = document.getElementById("phraseInput");
const button = document.getElementById("submitBtn");
const list = document.getElementById("phraseList");

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

loadPhrases();
