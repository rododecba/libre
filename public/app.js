function openCompose() {
  document.getElementById("composeScreen").classList.add("active");
}
function closeCompose() {
  document.getElementById("composeScreen").classList.remove("active");
}
document.getElementById("phraseInput").addEventListener("input", (e) => {
  document.getElementById("charCount").innerText = e.target.value.length + " / 500";
});
function submitPhrase() {
  const text = document.getElementById("phraseInput").value.trim();
  const isAnon = document.getElementById("anonymous").checked;
  const name = document.getElementById("nameInput").value.trim();

  if (text === "") {
    alert("Escribe algo primero.");
    return;
  }

  const phrase = {
    text,
    timestamp: new Date(),
    author: isAnon ? "Anónimo" : name || "Sin nombre"
  };

  db.collection("phrases").add(phrase).then(() => {
    triggerWind();
    closeCompose();
    document.getElementById("phraseInput").value = "";
    loadPhrases();
  });
}
function triggerWind() {
  const wind = document.getElementById("windAnimation");
  wind.classList.add("active");
  setTimeout(() => wind.classList.remove("active"), 1500);
}
function loadPhrases() {
  db.collection("phrases").orderBy("timestamp", "desc").limit(50).get().then(snapshot => {
    const list = document.getElementById("phraseList");
    list.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("div");
      li.className = "phrase-card";
      li.innerHTML = `
        <p>${data.text}</p>
        <div class="phrase-meta">
          <span class="author">${data.author}</span>
        </div>
      `;
      list.appendChild(li);
    });
  });
}
loadPhrases();