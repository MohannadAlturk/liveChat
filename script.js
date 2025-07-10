// 🔧 Firebase-Konfiguration (ersetzen durch deine Daten)
const firebaseConfig = {

    apiKey: "AIzaSyCHU0cWIu6VUrevidA9vquZ9H4AocAH_bY",

    authDomain: "livechat-3a604.firebaseapp.com",

    databaseURL: "https://livechat-3a604-default-rtdb.europe-west1.firebasedatabase.app",

    projectId: "livechat-3a604",

    storageBucket: "livechat-3a604.firebasestorage.app",

    messagingSenderId: "691308226783",

    appId: "1:691308226783:web:8e317392499fb41b15e16a",

    measurementId: "G-2N0L6T372G"

  };

  
  // 🚀 Firebase initialisieren
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  // 🔗 Referenz zur Nachrichtenliste
  const messagesRef = db.ref("messages");
  
  // 💾 User-ID im Browser speichern (einfaches System)
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = Date.now().toString();
    localStorage.setItem("userId", userId);
  }
  
  const form = document.getElementById("chat-form");
  const input = document.getElementById("message-input");
  const messagesDiv = document.getElementById("messages");
  
  // 📤 Nachricht senden
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text !== "") {
      const timestamp = Date.now();
      messagesRef.push({
        userId: userId,
        text: text,
        timestamp: timestamp
      });
      input.value = "";
    }
  });
  
  // 📥 Alle Nachrichten laden (beim Start und live)
  messagesRef.orderByChild("timestamp").on("value", (snapshot) => {
    messagesDiv.innerHTML = ""; // alte löschen, neue anzeigen
    snapshot.forEach((childSnapshot) => {
      const msg = childSnapshot.val();
      renderMessage(msg);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // nach unten scrollen
  });
  
  // 📦 Nachricht anzeigen (mit Zeit)
  function renderMessage(msg) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");
    msgDiv.classList.add(msg.userId === userId ? "self" : "other");
  
    // 💬 Nachrichtentext
    const textNode = document.createTextNode(msg.text);
    msgDiv.appendChild(textNode);
  
    // 🕒 Zeit anzeigen
    const timeDiv = document.createElement("div");
    timeDiv.classList.add("timestamp");
    timeDiv.textContent = formatTimestamp(msg.timestamp);
    msgDiv.appendChild(timeDiv);
  
    messagesDiv.appendChild(msgDiv);
  }
  
  // 🧮 Zeitformat: "10.07.2025 14:32"
  function formatTimestamp(ts) {
    const date = new Date(ts);
    return date.toLocaleDateString("de-DE") + " " +
           date.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' });
  }
  