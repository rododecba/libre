const phraseInput = document.getElementById("phraseInput");
const submitBtn = document.getElementById("submitBtn");
const phraseList = document.getElementById("phraseList");
const windOverlay = document.getElementById("windOverlay");

function showWindOverlay(text) {
  windOverlay.textContent = text;
  windOverlay.classList.add("active");
  setTimeout(() => windOverlay.classList.remove("active"), 2000);
}

function renderPhrase(phraseData, id) {
  const li = document.createElement("li");
  li.className = "phrase-card";
  li.innerHTML = `
    <p>${phraseData.text}</p>
    <div class="phrase-meta">
      <span class="author">${phraseData.name || "Anónimo"}</span>
      <span>${phraseData.location || ""}</span>
    </div>
  `;
  phraseList.appendChild(li);
}

submitBtn.addEventListener("click", async () => {
  const text = phraseInput.value.trim();
  if (!text) return;

  const phrase = {
    text,
    name: null, // aún sin opción de ingresar nombre
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection("phrases").add(phrase);
    showWindOverlay("Tu frase vuela con el viento.");
    phraseInput.value = "";
  } catch (err) {
    console.error("❌ Error al enviar la frase:", err);
  }
});

// Cargar frases aleatorias
async function loadRandomPhrase() {
  const snapshot = await db.collection("phrases").orderBy("createdAt", "desc").limit(50).get();
  const phrases = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  if (phrases.length === 0) return;
  const random = phrases[Math.floor(Math.random() * phrases.length)];
  renderPhrase(random, random.id);
}

loadRandomPhrase();
