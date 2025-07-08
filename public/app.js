const phraseInput = document.getElementById("phraseInput");
const submitBtn = document.getElementById("submitBtn");
const phraseList = document.getElementById("phraseList");

submitBtn.addEventListener("click", async () => {
  const text = phraseInput.value.trim();
  if (!text) {
    alert("Escribe una frase antes de soltarla.");
    return;
  }

  if (text.length > 500) {
    alert("La frase no puede superar los 500 caracteres.");
    return;
  }

  try {
    await db.collection("phrases").add({
      text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    phraseInput.value = "";
    loadPhrases();
  } catch (error) {
    console.error("Error al guardar la frase:", error);
  }
});

async function loadPhrases() {
  phraseList.innerHTML = "";
  const snapshot = await db.collection("phrases")
    .orderBy("timestamp", "desc")
    .limit(30)
    .get();

  snapshot.forEach(doc => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = data.text;
    phraseList.appendChild(li);
  });
}

loadPhrases();
