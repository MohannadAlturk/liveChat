// 🔧 Firebase-Konfiguration
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
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const messagesRef = db.ref("messages");
  const typingRef = db.ref("typing");
  const statusRef = db.ref("status");
  
  // DOM-Elemente
  const form = document.getElementById("chat-form");
  const input = document.getElementById("message-input");
  const messagesDiv = document.getElementById("messages");
  const typingIndicator = document.getElementById("typing-indicator");
  const chatContainer = document.getElementById("chat-container");
  const userSelectionOverlay = document.getElementById("user-selection-overlay");
  const chatPartnerName = document.getElementById("chat-partner-name");
  const chatStatus = document.getElementById("chat-status");
  
  let userId = null;
  let username = null;
  let partnerId = null;
  let typingTimeout;
  
  // Benutzer auswählen
  userSelectionOverlay.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      userId = button.getAttribute("data-userid");
      username = button.getAttribute("data-username");
  
      localStorage.setItem("userId", userId);
      localStorage.setItem("username", username);
  
      userSelectionOverlay.style.display = "none";
      chatContainer.classList.remove("blur");
  
      startChat();
    });
  });
  
  // Wenn bereits gewählt → direkt starten
  const storedUserId = localStorage.getItem("userId");
  const storedUsername = localStorage.getItem("username");
  if (storedUserId && storedUsername) {
    userId = storedUserId;
    username = storedUsername;
    userSelectionOverlay.style.display = "none";
    chatContainer.classList.remove("blur");
    startChat();
  } else {
    userSelectionOverlay.style.display = "flex";
    chatContainer.classList.add("blur");
  }
  
  function startChat() {
    // 👥 Partner setzen
    partnerId = (userId === "mohannad") ? "mariella" : "mohannad";
    chatPartnerName.textContent = partnerId === "mohannad" ? "Mohannad" : "Mariella";
  
    // 🔵 Online setzen + Disconnect vorbereiten
    // Verbindung überwachen
    const connectedRef = firebase.database().ref(".info/connected");

    connectedRef.on("value", (snap) => {
    if (snap.val() === true) {
        // Benutzer ist online
        const userStatusRef = statusRef.child(userId);

        // Auf Disconnect vorbereiten
        userStatusRef.onDisconnect().set({
        online: false,
        lastSeen: Date.now(),
        username: username
        });

        // Online setzen
        userStatusRef.set({
        online: true,
        lastSeen: Date.now(),
        username: username
        });
    }
    });
  
    // 🔁 Online-Status vom Partner anzeigen
    statusRef.child(partnerId).on("value", snapshot => {
      const data = snapshot.val();
      if (data?.online) {
        chatStatus.textContent = "Online";
      } else if (data?.lastSeen) {
        chatStatus.textContent = "Zuletzt online: " + formatTimestamp(data.lastSeen);
      } else {
        chatStatus.textContent = "Status unbekannt";
      }
    });
  
    // 📤 Nachricht senden
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (text !== "") {
        const timestamp = Date.now();
        messagesRef.push({
          userId: userId,
          username: username,
          text: text,
          timestamp: timestamp
        });
        input.value = "";
        typingRef.child(userId).set(false);
      }
    });
  
    // ✍️ Tippanzeige
    input.addEventListener("input", () => {
      typingRef.child(userId).set(true);
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        typingRef.child(userId).set(false);
      }, 2000);
    });
  
    // 📥 Nachrichten anzeigen
    messagesRef.orderByChild("timestamp").on("value", (snapshot) => {
      messagesDiv.innerHTML = "";
      snapshot.forEach((childSnapshot) => {
        const msg = childSnapshot.val();
        renderMessage(msg);
      });
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
  
    // 👀 Anzeigen wenn jemand schreibt
    typingRef.on("value", (snapshot) => {
      const typingUsers = snapshot.val() || {};
      const othersTyping = Object.entries(typingUsers).filter(([id, isTyping]) => id !== userId && isTyping);
      if (othersTyping.length > 0) {
        typingIndicator.textContent = "Schreibt...";
      } else {
        typingIndicator.textContent = "";
      }
    });
  }
  
  // 🖼 Nachrichten rendern
  function renderMessage(msg) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");
  
    if (msg.userId === userId) {
      msgDiv.classList.add("self");
    } else {
      msgDiv.classList.add("other");
    }
  
    const textNode = document.createTextNode(msg.text);
    msgDiv.appendChild(textNode);
  
    const timeDiv = document.createElement("div");
    timeDiv.classList.add("timestamp");
    timeDiv.textContent = formatTimestamp(msg.timestamp);
    msgDiv.appendChild(timeDiv);
  
    messagesDiv.appendChild(msgDiv);
  }
  
  // 🕓 Zeit formatieren
  function formatTimestamp(ts) {
    const date = new Date(ts);
    return date.toLocaleDateString("de-DE") + " " +
      date.toLocaleTimeString("de-DE", { hour: '2-digit', minute: '2-digit' });
  }
  