const input = document.getElementById("phraseInput");
const button = document.getElementById("submitBtn");
const list = document.getElementById("phraseList");
const filter = new Filter();

async function loadPhrases() {
  list.innerHTML = "";
  try {
    const cutoff = new Date(Date.now() - 30*24*60*60*1000);
    const snapshot = await db.collection("phrases").where("createdAt", ">", cutoff).orderBy("createdAt","desc").limit(10).get();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.flags || data.flags < 3) {
        const li = document.createElement("li");
        li.textContent = data.text;
        const flagBtn = document.createElement("button"); flagBtn.className="flag"; flagBtn.textContent="⚠️";
        flagBtn.onclick = async () => { await db.collection("phrases").doc(doc.id).update({ flags: firebase.firestore.FieldValue.increment(1) }); li.style.opacity=0.3; };
        li.appendChild(flagBtn);
        list.appendChild(li);
      }
    });
  } catch (e) { console.error(e); }
}

button.addEventListener("click", async () => {
  const phrase = input.value.trim();
  if (!phrase) return alert("Escribe algo primero.");
  if (filter.isProfane(phrase)) { alert("Tu frase contiene palabras ofensivas."); return; }
  try {
    await db.collection("phrases").add({ text: phrase, createdAt: firebase.firestore.FieldValue.serverTimestamp(), flags:0 });
    input.value="";
    await loadPhrases();
    alert("🌬️ Frase soltada con éxito.");
  } catch(e) { console.error(e); alert("Error al guardar."); }
});

loadPhrases();