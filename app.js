
const input = document.getElementById("phraseInput");
const button = document.getElementById("submitBtn");
const list = document.getElementById("phraseList");
const filter = new Filter();

function renderPhrase(text, id) {
  const li = document.createElement("li");
  li.textContent = text;
  const flagBtn = document.createElement("button");
  flagBtn.className = "flag";
  flagBtn.textContent = "⚠️";
  flagBtn.onclick = () => {
    db.collection("phrases").doc(id).update({
      flags: firebase.firestore.FieldValue.increment(1),
    });
    li.style.opacity = 0.3;
  };
  li.appendChild(flagBtn);
  list.prepend(li);
}

db.collection("phrases")
  .where("timestamp", ">", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  .orderBy("timestamp", "desc")
  .onSnapshot((snapshot) => {
    list.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.flags || data.flags < 3) {
        renderPhrase(data.text, doc.id);
      }
    });
  });

button.addEventListener("click", () => {
  const text = input.value.trim();
  if (!text) return;
  if (filter.isProfane(text)) {
    alert("Tu frase contiene lenguaje inapropiado.");
    return;
  }
  db.collection("phrases").add({
    text,
    timestamp: new Date(),
    flags: 0,
  });
  input.value = "";
});
