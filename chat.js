function $(id) {
  return document.getElementById(id);
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
}

function formatCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

let timerSeconds = 0;
let timerInterval = null;

function startChatTimer() {
  const timerEl = $("chatTimer");
  if (!timerEl) return;

  function updateTimer() {
    const mins = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
    const secs = String(timerSeconds % 60).padStart(2, "0");
    timerEl.textContent = `${mins}:${secs}`;
    timerSeconds++;
  }

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function appendUserMessage(text) {
  const chatMessages = $("chatMessages");
  if (!chatMessages) return;

  const row = document.createElement("div");
  row.className = "message-row user";

  row.innerHTML = `
    <div class="message-bubble user-bubble">
      ${text}
      <span class="message-time">${formatCurrentTime()}</span>
    </div>
  `;

  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendHostMessage(text) {
  const chatMessages = $("chatMessages");
  if (!chatMessages) return;

  const hostImage = $("chatHostImage")?.getAttribute("src") || "assets/riya.jpg";

  const row = document.createElement("div");
  row.className = "message-row host";

  row.innerHTML = `
    <img src="${hostImage}" alt="Host" class="message-avatar" />
    <div class="message-bubble host-bubble">
      ${text}
      <span class="message-time">${formatCurrentTime()}</span>
    </div>
  `;

  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function containsBlockedContact(text) {
  const patterns = [
    /\b\d{10}\b/g,
    /\+91\d{10}\b/g,
    /\b\d{5}[-\s]?\d{5}\b/g,
    /whatsapp/gi,
    /telegram/gi,
    /contact me/gi,
    /call me/gi,
    /phonepe/gi,
    /gpay/gi,
    /paytm/gi,
    /instagram/gi,
    /insta/gi,
    /gmail/gi,
    /email/gi,
    /@/g,
    /http/gi,
    /www\./gi,
    /\.com/gi,
    /\.in/gi
  ];

  return patterns.some((pattern) => pattern.test(text));
}

function sendMessage() {
  const input = $("messageInput");
  if (!input) return;

  const text = input.value.trim();

  if (!text) {
    showToast("Type a message first");
    return;
  }

  if (containsBlockedContact(text)) {
    showToast("Personal contact details cannot be shared in chat.");
    return;
  }

  appendUserMessage(text);
  input.value = "";

  setTimeout(() => {
    appendHostMessage("Thanks for your message 💬");
  }, 900);
}

function endChat() {
  showToast("Chat ended");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 900);
}

function initChatPage() {
  const backBtn = $("backBtn");
  const moreBtn = $("moreBtn");
  const sendBtn = $("sendBtn");
  const endChatBtn = $("endChatBtn");
  const messageInput = $("messageInput");

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  if (moreBtn) {
    moreBtn.addEventListener("click", () => {
      showToast("Stay connected inside TalkMitra");
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", sendMessage);
  }

  if (messageInput) {
    messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendMessage();
      }
    });
  }

  if (endChatBtn) {
    endChatBtn.addEventListener("click", endChat);
  }

  startChatTimer();
}

initChatPage();