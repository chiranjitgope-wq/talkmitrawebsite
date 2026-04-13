document.addEventListener("DOMContentLoaded", function () {
  const SUPABASE_URL = "https://vugexzusziumzzgturum.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1Z2V4enVzeml1bXp6Z3R1cnVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3OTk3ODYsImV4cCI6MjA5MTM3NTc4Nn0.CYChM5hKWj_Bk2I_osLUcoWGHE0OeeBDHEh1Vju6dkM";

  let sb = null;
  if (window.supabase && window.supabase.createClient) {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }

  const genderButtons = document.querySelectorAll(".filter-btn");
  const statusButtons = document.querySelectorAll(".status-btn");
  const hostCards = document.querySelectorAll(".host-card");
  const emptyMsg = document.getElementById("emptyMsg");
  const toast = document.getElementById("toast");
  const walletBalance = document.getElementById("walletBalance");

  const loginModal = document.getElementById("loginModal");
  const registerModal = document.getElementById("registerModal");
  const walletModal = document.getElementById("walletModal");

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");

  const registerName = document.getElementById("registerName");
  const registerEmail = document.getElementById("registerEmail");
  const registerPassword = document.getElementById("registerPassword");
  const registerGender = document.getElementById("registerGender");

  let currentGender = "all";
  let currentStatus = "all";
  let selectedRechargeAmount = 0;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(() => {
      toast.classList.add("hidden");
    }, 2200);
  }

  function openModal(modal) {
    if (modal) modal.classList.remove("hidden");
  }

  function closeModal(modal) {
    if (modal) modal.classList.add("hidden");
  }

  function applyFilters() {
    let visibleCount = 0;

    hostCards.forEach((card) => {
      const gender = card.dataset.gender;
      const status = card.dataset.status;
      const tags = card.dataset.tags || "";

      const genderMatch = currentGender === "all" || gender === currentGender;

      let statusMatch = false;
      if (currentStatus === "all") statusMatch = true;
      else if (currentStatus === "online") statusMatch = status === "online";
      else if (currentStatus === "new") statusMatch = tags.includes("new");
      else if (currentStatus === "popular") statusMatch = tags.includes("popular");
      else if (currentStatus === "voice") statusMatch = tags.includes("voice");

      if (genderMatch && statusMatch) {
        card.classList.remove("hidden");
        visibleCount++;
      } else {
        card.classList.add("hidden");
      }
    });

    if (emptyMsg) {
      if (visibleCount === 0) emptyMsg.classList.remove("hidden");
      else emptyMsg.classList.add("hidden");
    }
  }

  async function getCurrentUser() {
    if (!sb) return null;
    try {
      const { data, error } = await sb.auth.getUser();
      if (error) return null;
      return data?.user || null;
    } catch (e) {
      return null;
    }
  }

  async function ensureWallet(userId) {
    if (!sb) return null;

    try {
      const { data: wallet } = await sb
        .from("user_wallets")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (wallet) return wallet;

      const { data: newWallet } = await sb
        .from("user_wallets")
        .insert({
          user_id: userId,
          balance: 0,
          bonus_balance: 0
        })
        .select()
        .single();

      return newWallet;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
async function ensureProfile(user) {
  if (!sb || !user) return null;

  try {
    const { data: profile } = await sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) return profile;

    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      "User";

    const email = user.email || "";
    const role = "user";

    const { data: newProfile, error } = await sb
      .from("profiles")
      .insert({
        id: user.id,
        full_name: fullName,
        email: email,
        role: role,
        status: "active"
      })
      .select()
      .single();

    if (error) {
      console.error("Profile create error:", error);
      return null;
    }

    return newProfile;
  } catch (e) {
    console.error("ensureProfile error:", e);
    return null;
  }
}
async function updateLoggedInUI() {
  const user = await getCurrentUser();

  const openLoginBtn = document.getElementById("openLogin");
  const openRegisterBtn = document.getElementById("openRegister");

  if (user) {
    if (openLoginBtn) openLoginBtn.textContent = "Logged In";
    if (openRegisterBtn) openRegisterBtn.textContent = "Logout";
  } else {
    if (openLoginBtn) openLoginBtn.textContent = "Login";
    if (openRegisterBtn) openRegisterBtn.textContent = "Register";
  }
}

  genderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      genderButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentGender = button.dataset.gender;
      applyFilters();
    });
  });

  statusButtons.forEach((button) => {
    button.addEventListener("click", () => {
      statusButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      currentStatus = button.dataset.filter;
      applyFilters();
    });
  });

  const openLoginBtn = document.getElementById("openLogin");
  if (openLoginBtn) {
  openLoginBtn.addEventListener("click", async () => {
    const user = await getCurrentUser();

    if (user) {
      showToast("Already logged in");
      return;
    }

    openModal(loginModal);
  });
}

  const openRegisterBtn = document.getElementById("openRegister");
  if (openRegisterBtn) {
  openRegisterBtn.addEventListener("click", async () => {
    const user = await getCurrentUser();

    if (user) {
      await sb.auth.signOut();
      await updateLoggedInUI();
      showToast("Logged out successfully");
      return;
    }

    openModal(registerModal);
  });
}

  const walletNavBtn = document.getElementById("walletNav");
  if (walletNavBtn) {
    walletNavBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(walletModal);
    });
  }

  document.querySelectorAll(".close-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.close;
      closeModal(document.getElementById(target));
    });
  });

  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.classList.add("hidden");
    }
  });

  const loginSubmitBtn = document.getElementById("loginSubmit");
  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener("click", async () => {
      const email = loginEmail ? loginEmail.value.trim() : "";
      const password = loginPassword ? loginPassword.value.trim() : "";

      if (!email || !password) {
        showToast("Enter email & password");
        return;
      }

      if (!sb) {
        showToast("Supabase not loaded");
        return;
      }

      try {
        const { data, error } = await sb.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          showToast(error.message);
          return;
        }

        if (data?.user) {
  await ensureProfile(data.user);
  await ensureWallet(data.user.id);
}

        closeModal(loginModal);
        await updateLoggedInUI();
        showToast("Login successful");
      } catch (e) {
        console.error(e);
        showToast("Login failed");
      }
    });
  }

  const registerSubmitBtn = document.getElementById("registerSubmit");
  if (registerSubmitBtn) {
    registerSubmitBtn.addEventListener("click", async () => {
      const name = registerName ? registerName.value.trim() : "";
      const email = registerEmail ? registerEmail.value.trim() : "";
      const password = registerPassword ? registerPassword.value.trim() : "";
      const gender = registerGender ? registerGender.value : "";

      if (!name || !email || !password || !gender) {
        showToast("Fill all fields");
        return;
      }

      if (!sb) {
        showToast("Supabase not loaded");
        return;
      }

      try {
        const { data, error } = await sb.auth.signUp({
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
          return;
        }

        if (data?.user) {
  await ensureProfile(data.user);
  await ensureWallet(data.user.id);
}

        closeModal(registerModal);
        showToast("Account created successfully");
      } catch (e) {
        console.error(e);
        showToast("Register failed");
      }
    });
  }

  document.querySelectorAll(".recharge-option").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".recharge-option").forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      selectedRechargeAmount = Number(button.dataset.amount);
    });
  });

  const applyRechargeBtn = document.getElementById("applyRecharge");
  if (applyRechargeBtn) {
    applyRechargeBtn.addEventListener("click", async () => {
      if (selectedRechargeAmount === 0) {
        showToast("Please select a recharge amount.");
        return;
      }

      const user = await getCurrentUser();

      if (!user) {
        closeModal(walletModal);
        openModal(loginModal);
        showToast("Please login first.");
        return;
      }

      if (!sb) {
        showToast("Supabase not loaded");
        return;
      }

      try {
        const wallet = await ensureWallet(user.id);
        const current = Number(wallet?.balance || 0);
        const bonus = Math.floor(selectedRechargeAmount * 0.2);
        const finalAmount = current + selectedRechargeAmount + bonus;

        const { error } = await sb
          .from("user_wallets")
          .update({ balance: finalAmount })
          .eq("user_id", user.id);

        if (error) {
          showToast("Recharge update failed.");
          return;
        }

        if (walletBalance) walletBalance.textContent = finalAmount;
        closeModal(walletModal);
        showToast(`Recharge successful. ₹${selectedRechargeAmount} + ₹${bonus} bonus added.`);
      } catch (e) {
        console.error(e);
        showToast("Recharge failed");
      }
    });
  }

  document.querySelectorAll(".chat-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.classList.contains("offline-btn")) {
        showToast("This host is offline right now.");
        return;
      }

      const user = await getCurrentUser();
      if (!user) {
        openModal(loginModal);
        showToast("Please login first.");
        return;
      }

      const wallet = await ensureWallet(user.id);
      const balance = Number(wallet?.balance || 0);

      if (balance < 5) {
        showToast("Low wallet balance. Please recharge first.");
        openModal(walletModal);
        return;
      }

      showToast("Chat feature next step me connect karenge.");
    });
  });

  document.querySelectorAll(".call-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.classList.contains("offline-btn")) {
        showToast("This host is offline right now.");
        return;
      }

      const user = await getCurrentUser();
      if (!user) {
        openModal(loginModal);
        showToast("Please login first.");
        return;
      }

      const wallet = await ensureWallet(user.id);
      const balance = Number(wallet?.balance || 0);

      if (balance < 10) {
        showToast("Need minimum ₹10 balance for voice call.");
        openModal(walletModal);
        return;
      }

      showToast("Voice call connecting...");
    });
  });

  document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {
      const item = question.parentElement;
      item.classList.toggle("active");
    });
  });

  const activityList = document.getElementById("activityList");
  const demoActivities = [
    "<strong>Rahul</strong> recharged wallet successfully.",
    "<strong>Puja</strong> started chat with Aman.",
    "<strong>Arjun</strong> began a voice call session.",
    "<strong>Neha</strong> received a new message request.",
    "<strong>Simran</strong> added bonus balance to wallet.",
    "<strong>Vicky</strong> joined a live chat room."
  ];

  let activityIndex = 0;

  if (activityList) {
    setInterval(() => {
      const items = activityList.querySelectorAll(".activity-item");
      if (items.length > 0) items[0].remove();

      const newItem = document.createElement("div");
      newItem.className = "activity-item";
      newItem.innerHTML = `
        <span class="activity-dot"></span>
        <p>${demoActivities[activityIndex]}</p>
      `;
      activityList.appendChild(newItem);

      activityIndex++;
      if (activityIndex >= demoActivities.length) activityIndex = 0;
    }, 3500);
  }

  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  let currentSlide = 0;

  function showSlide(index) {
    slides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));

    if (slides[index]) slides[index].classList.add("active");
    if (dots[index]) dots[index].classList.add("active");
  }

  function nextSlide() {
    currentSlide++;
    if (currentSlide >= slides.length) currentSlide = 0;
    showSlide(currentSlide);
  }

  if (slides.length > 0) {
    setInterval(nextSlide, 3000);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });

  applyFilters();
  showSlide(currentSlide);
updateLoggedInUI();
});