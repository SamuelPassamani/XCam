document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const messagesContainer = document.getElementById("messages-container");
  const loginForm = document.getElementById("login-form");
  const messageInput = document.getElementById("message-input");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const messageField = document.getElementById("message");
  const userDisplay = document.getElementById("user-display");
  const startChatButton = document.getElementById("start-chat");
  const sendMessageButton = document.getElementById("send-message");
  const logoutButton = document.getElementById("logout");
  const emojiButton = document.getElementById("emoji-button");
  const emojiPicker = document.getElementById("emoji-picker");
  const onlineCount = document.getElementById("online-count");
  const emojiTabs = document.querySelectorAll(".emoji-tab");
  const emojiCategories = document.querySelectorAll(".emoji-category");
  // User data
  let currentUser = null;
  // Load messages from localStorage
  let messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
  // Display existing messages
  function displayMessages() {
    messagesContainer.innerHTML =
      '<div class="flex justify-center mb-4"><div class="bg-gray-200 text-gray-600 rounded-full px-3 py-1 text-xs">Início da conversa</div></div>';
    messages.forEach((msg) => {
      const isCurrentUser = currentUser && msg.email === currentUser.email;
      const messageElement = document.createElement("div");
      messageElement.className = `message-bubble ${
        isCurrentUser
          ? "ml-auto bg-indigo-500 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg px-4 py-2"
          : "mr-auto bg-gray-200 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg px-4 py-2"
      }`;
      let messageContent = `
                        <div class="font-bold text-sm">${msg.username}</div>
                        <div>${msg.message}</div>
                        <div class="timestamp">${formatTime(
                          msg.timestamp
                        )}</div>
                    `;
      messageElement.innerHTML = messageContent;
      messagesContainer.appendChild(messageElement);
    });
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  // Format timestamp
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    return (
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }) +
      " " +
      date.toLocaleDateString()
    );
  }
  // Add a new message
  function addMessage(message) {
    messages.push(message);
    localStorage.setItem("chatMessages", JSON.stringify(messages));
    displayMessages();
    // Simulate online count change occasionally
    if (Math.random() > 0.7) {
      const randomCount = Math.floor(Math.random() * 5) + 1;
      onlineCount.textContent = randomCount;
    }
  }
  // Start chat button click
  startChatButton.addEventListener("click", function () {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    if (!username) {
      alert("Por favor, digite seu nome.");
      return;
    }
    if (!email || !validateEmail(email)) {
      alert("Por favor, digite um email válido.");
      return;
    }
    currentUser = {
      username,
      email
    };
    localStorage.setItem("chatUser", JSON.stringify(currentUser));
    loginForm.classList.add("hidden");
    messageInput.classList.remove("hidden");
    userDisplay.textContent = username;
    // Add system message for new user
    addMessage({
      username: "Sistema",
      email: "system",
      message: `${username} entrou no chat.`,
      timestamp: Date.now()
    });
  });
  // Send message button click
  sendMessageButton.addEventListener("click", sendMessage);
  // Send message on Enter key
  messageField.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
  // Send message function
  function sendMessage() {
    const message = messageField.value.trim();
    if (!message) return;
    addMessage({
      username: currentUser.username,
      email: currentUser.email,
      message: message,
      timestamp: Date.now()
    });
    messageField.value = "";
    // Hide emoji picker after sending message
    emojiPicker.style.display = "none";
  }
  // Logout button click
  logoutButton.addEventListener("click", function () {
    // Add system message for user leaving
    addMessage({
      username: "Sistema",
      email: "system",
      message: `${currentUser.username} saiu do chat.`,
      timestamp: Date.now()
    });
    currentUser = null;
    localStorage.removeItem("chatUser");
    loginForm.classList.remove("hidden");
    messageInput.classList.add("hidden");
    usernameInput.value = "";
    emailInput.value = "";
  });
  // Emoji picker toggle
  emojiButton.addEventListener("click", function (e) {
    e.stopPropagation(); // Prevent document click from immediately closing it
    if (emojiPicker.style.display === "block") {
      emojiPicker.style.display = "none";
    } else {
      emojiPicker.style.display = "block";
    }
  });
  // Close emoji picker when clicking outside
  document.addEventListener("click", function (e) {
    if (!emojiPicker.contains(e.target) && e.target !== emojiButton) {
      emojiPicker.style.display = "none";
    }
  });
  // Emoji tabs functionality
  emojiTabs.forEach((tab) => {
    tab.addEventListener("click", function (e) {
      e.stopPropagation();
      const category = this.getAttribute("data-category");
      // Update active tab
      emojiTabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");
      // Show corresponding category
      emojiCategories.forEach((cat) => {
        cat.classList.remove("active");
        if (cat.id === category) {
          cat.classList.add("active");
        }
      });
    });
  });
  // Add emoji to message
  const emojiButtons = document.querySelectorAll(".emoji-btn");
  emojiButtons.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent document click from closing picker
      messageField.value += this.textContent;
      messageField.focus();
    });
  });
  // Email validation
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  // Check if user is already logged in
  const savedUser = localStorage.getItem("chatUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    loginForm.classList.add("hidden");
    messageInput.classList.remove("hidden");
    userDisplay.textContent = currentUser.username;
  }
  // Display initial messages
  displayMessages();
  // Set random online count
  onlineCount.textContent = Math.floor(Math.random() * 5) + 1;
});
