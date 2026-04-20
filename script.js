const SUPABASE_URL = "https://vugexzusziumzzgturum.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1Z2V4enVzeml1bXp6Z3R1cnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3OTk3ODYsImV4cCI6MjA5MTM3NTc4Nn0.CYChM5hKWj_Bk2I_osLUcoWGHE0OeeBDHEh1Vju6dkM";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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

function openModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.classList.remove("hidden");
}

function closeModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.classList.add("hidden");
}

document.querySelectorAll(".faq-question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const answer = btn.nextElementSibling;
    if (!answer) return;

    const isOpen = answer.style.maxHeight && answer.style.maxHeight !== "0px";

    document.querySelectorAll(".faq-answer").forEach((item) => {
      item.style.maxHeight = null;
    });

    if (!isOpen) {
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

const openLoginBtn = $("openLogin");
const openRegisterBtn = $("openRegister");
const walletNavBtn = $("walletNav");
const walletTopBtn = $("walletTopBtn");
const walletBannerBtn = $("walletBannerBtn");
const chatNavBtn = $("chatNavBtn");
const callingNavBtn = $("callingNavBtn");

if (openLoginBtn) {
  openLoginBtn.addEventListener("click", () => openModal("loginModal"));
}

if (openRegisterBtn) {
  openRegisterBtn.addEventListener("click", () => openModal("registerModal"));
}

if (walletNavBtn) {
  walletNavBtn.addEventListener("click", (e) => {
    e.preventDefault();
    openModal("walletModal");
  });
}

if (walletTopBtn) {
  walletTopBtn.addEventListener("click", () => openModal("walletModal"));
}

if (walletBannerBtn) {
  walletBannerBtn.addEventListener("click", () => openModal("walletModal"));
}

if (chatNavBtn) {
  chatNavBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showToast("Chats page next step me connect karenge");
  });
}

if (callingNavBtn) {
  callingNavBtn.addEventListener("click", (e) => {
    e.preventDefault();
    showToast("Calling page next step me connect karenge");
  });
}

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const modalId = btn.getAttribute("data-close");
    closeModal(modalId);
  });
});

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  });
});

let walletBalance = 20;
let selectedRechargeAmount = 0;
const walletBalanceEl = $("walletBalance");
const walletBalanceTopEl = $("walletBalanceTop");
const rechargeButtons = document.querySelectorAll(".recharge-option");
const applyRechargeBtn = $("applyRecharge");

function updateWalletBalance() {
  if (walletBalanceEl) {
    walletBalanceEl.textContent = walletBalance;
  }
  if (walletBalanceTopEl) {
    walletBalanceTopEl.textContent = walletBalance.toFixed(2);
  }
}

rechargeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    rechargeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedRechargeAmount = Number(btn.dataset.amount || 0);
  });
});

if (applyRechargeBtn) {
  applyRechargeBtn.addEventListener("click", () => {
    if (!selectedRechargeAmount) {
      showToast("Please choose recharge amount");
      return;
    }

    walletBalance += selectedRechargeAmount;
    updateWalletBalance();
    showToast("Recharge added: ₹" + selectedRechargeAmount);
    closeModal("walletModal");

    rechargeButtons.forEach((b) => b.classList.remove("active"));
    selectedRechargeAmount = 0;
  });
}

updateWalletBalance();

const loginSubmitBtn = $("loginSubmit");
const registerSubmitBtn = $("registerSubmit");

if (loginSubmitBtn) {
  loginSubmitBtn.addEventListener("click", async () => {
    const email = $("loginEmail")?.value.trim();
    const password = $("loginPassword")?.value.trim();

    if (!email || !password) {
      showToast("Enter email and password");
      return;
    }

    try {
      loginSubmitBtn.disabled = true;
      loginSubmitBtn.textContent = "Logging In...";

      const { error } = await sb.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        showToast(error.message);
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = "Login Now";
        return;
      }

      closeModal("loginModal");
      showToast("Login successful");
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.textContent = "Login Now";
    } catch (err) {
      console.error(err);
      showToast("Login failed");
      loginSubmitBtn.disabled = false;
      loginSubmitBtn.textContent = "Login Now";
    }
  });
}

if (registerSubmitBtn) {
  registerSubmitBtn.addEventListener("click", async () => {
    const name = $("registerName")?.value.trim();
    const email = $("registerEmail")?.value.trim();
    const password = $("registerPassword")?.value.trim();
    const gender = $("registerGender")?.value;

    if (!name || !email || !password || !gender) {
      showToast("Please fill all fields");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters");
      return;
    }

    try {
      registerSubmitBtn.disabled = true;
      registerSubmitBtn.textContent = "Creating...";

      const { error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            gender: gender
          }
        }
      });

      if (error) {
        showToast(error.message);
        registerSubmitBtn.disabled = false;
        registerSubmitBtn.textContent = "Create Account";
        return;
      }

      closeModal("registerModal");
      showToast("Registration successful");
      registerSubmitBtn.disabled = false;
      registerSubmitBtn.textContent = "Create Account";
    } catch (err) {
      console.error(err);
      showToast("Registration failed");
      registerSubmitBtn.disabled = false;
      registerSubmitBtn.textContent = "Create Account";
    }
  });
}

const genderButtons = document.querySelectorAll(".filter-btn");
const statusButtons = document.querySelectorAll(".status-btn");
const hostGrid = $("hostGrid");
const emptyMsg = $("emptyMsg");

let currentGenderFilter = "all";
let currentStatusFilter = "all";

function matchesStatusFilter(card, selectedFilter) {
  const cardStatus = card.dataset.status || "offline";
  const tags = card.dataset.tags || "";

  if (selectedFilter === "all") return true;
  if (selectedFilter === "online") return cardStatus === "online";
  if (selectedFilter === "new") return tags.includes("new");
  if (selectedFilter === "popular") return tags.includes("popular");
  if (selectedFilter === "voice") return tags.includes("voice");

  return true;
}

function applyHostFilters() {
  const cards = document.querySelectorAll("#hostGrid .host-card");
  let visibleCount = 0;

  cards.forEach((card) => {
    const gender = card.dataset.gender || "all";

    const genderMatch =
      currentGenderFilter === "all" || gender === currentGenderFilter;

    const statusMatch = matchesStatusFilter(card, currentStatusFilter);

    if (genderMatch && statusMatch) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  if (emptyMsg) {
    if (visibleCount === 0) {
      emptyMsg.classList.remove("hidden");
    } else {
      emptyMsg.classList.add("hidden");
    }
  }
}

genderButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    genderButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentGenderFilter = btn.dataset.gender || "all";
    applyHostFilters();
  });
});

statusButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    statusButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentStatusFilter = btn.dataset.filter || "all";
    applyHostFilters();
  });
});

function bindHostActionButtons() {
  document.querySelectorAll(".chat-btn").forEach((btn) => {
    if (!btn.dataset.bound) {
      btn.dataset.bound = "true";

      btn.addEventListener("click", () => {
        const card = btn.closest(".host-card");

        const hostName =
          card.querySelector("h4")?.textContent || "Host";

        const hostImage =
          card.querySelector("img")?.getAttribute("src") || "assets/riya.jpg";

        openChatPage(hostName, hostImage);
      });
    }
  });
}

  document.querySelectorAll(".call-btn").forEach((btn) => {
    if (!btn.dataset.bound) {
      btn.dataset.bound = "true";
      btn.addEventListener("click", () => {
        showToast("Voice call feature coming soon");
      });
    }
  });

  document.querySelectorAll(".offline-btn").forEach((btn) => {
    if (!btn.dataset.bound) {
      btn.dataset.bound = "true";
      btn.addEventListener("click", () => {
        showToast("Host is offline right now");
      });
    }
  });
}

bindHostActionButtons();
applyHostFilters();

async function loadLiveHosts() {
  console.log("loadLiveHosts started");

  if (!hostGrid) return;

  const { data: hosts, error } = await sb
    .from("hosts")
    .select("*")
    .eq("approved", true);

  console.log("hosts data:", hosts);
  console.log("hosts error:", error);

  if (error) {
    return;
  }

  if (!hosts || !hosts.length) {
    return;
  }

  hosts.forEach((host) => {
    const status = host.online ? "Online" : "Offline";
    const statusClass = host.online ? "online" : "offline";
    const liveDotClass = host.online ? "dot-online" : "dot-offline";
    const img = host.profile_image || "assets/riya.jpg";

    const tagList = [];
    if (host.plan === "premium") {
      tagList.push("popular");
    } else {
      tagList.push("new");
    }

    if (host.online) {
      tagList.push("voice");
    }

    const badgeText = host.plan === "premium" ? "Premium" : "Live Host";
    const hostAge = host.age ? `${host.age} Y` : "22 Y";
    const hostLocation = host.city || "India";
    const hostLanguage = host.language || "Hindi";
    const hostRating = host.rating || "4.8";

    const card = document.createElement("div");
    card.className = "host-card";
    card.dataset.gender = host.gender || "all";
    card.dataset.status = host.online ? "online" : "offline";
    card.dataset.tags = tagList.join(" ");

    card.innerHTML = `
      <div class="host-card-inner">
        <div class="host-avatar-col">
          <div class="host-image-wrap">
            <img src="${img}" alt="${host.display_name || "Host"}" class="host-image" />
            <span class="live-dot ${liveDotClass}"></span>
          </div>
          <span class="host-status ${statusClass}">${status}</span>
          <span class="rating-line">⭐ <span>${hostRating}</span></span>
        </div>

        <div class="host-content">
          <div class="host-top-row">
            <div class="host-main-text">
              <div class="host-name-line">
                <h4>${host.display_name || "Host"}</h4>
                <span class="host-age">${hostAge}</span>
              </div>
              <p class="host-location">${hostLocation}</p>
            </div>
            <span class="host-language">${hostLanguage}</span>
          </div>

          <div class="badge-row">
            <span class="badge ${host.plan === "premium" ? "badge-popular" : "badge-new"}">${badgeText}</span>
            ${host.online ? '<span class="badge badge-voice">Voice Active</span>' : ""}
          </div>

          <div class="price-row">
            <span class="price-pill">Chat ₹${host.chat_rate || 2}/min</span>
            <span class="price-pill">Call ₹${host.call_rate || 5}/min</span>
          </div>

          <div class="action-row">
            <button class="card-btn ${host.online ? "chat-btn" : "disabled-btn offline-btn"}">Chat Now</button>
            <button class="card-btn ${host.online ? "call-btn" : "disabled-btn offline-btn"}">Call Now</button>
          </div>
        </div>
      </div>
    `;

    hostGrid.appendChild(card);
  });

  bindHostActionButtons();
  applyHostFilters();
}

loadLiveHosts();
function openChatPage(hostName, hostImage) {
  const url = `chat.html?name=${encodeURIComponent(hostName)}&img=${encodeURIComponent(hostImage)}`;
  window.location.href = url;
}
