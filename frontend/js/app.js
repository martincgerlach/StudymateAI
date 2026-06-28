const welcomeScreen = document.querySelector("#welcomeScreen");
const appShell = document.querySelector("#appShell");
const loginForm = document.querySelector("#loginForm");
const authEyebrow = document.querySelector("#authEyebrow");
const authTitle = document.querySelector("#authTitle");
const authDescription = document.querySelector("#authDescription");
const authSubmitText = document.querySelector("#authSubmitText");
const authToggleText = document.querySelector("#authToggleText");
const authModeToggle = document.querySelector("#authModeToggle");
const loginFeedback = document.querySelector("#loginFeedback");
const userNameInput = document.querySelector("#userNameInput");
const studyFocusInput = document.querySelector("#studyFocusInput");
const passwordInput = document.querySelector("#passwordInput");
const passwordToggle = document.querySelector(".password-toggle");
const socialLoginButtons = document.querySelectorAll(".social-login-button");
const signOutButton = document.querySelector("#signOutButton");
const sessionAvatar = document.querySelector("#sessionAvatar");
const sessionName = document.querySelector("#sessionName");
const sessionFocus = document.querySelector("#sessionFocus");
const assistantGrid = document.querySelector("#assistantGrid");
const activeAssistantIcon = document.querySelector("#activeAssistantIcon");
const chatTitle = document.querySelector("#chat-title");
const activeAssistantDescription = document.querySelector("#activeAssistantDescription");
const chatMessages = document.querySelector("#chatMessages");
const promptSuggestions = document.querySelector("#promptSuggestions");
const chatForm = document.querySelector("#chatForm");
const messageInput = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const newChatButton = document.querySelector("#newChatButton");
const newChatDialog = document.querySelector("#newChatDialog");
const newChatCloseButton = document.querySelector("#newChatCloseButton");
const newChatAssistantList = document.querySelector("#newChatAssistantList");
const tutorialDialog = document.querySelector("#tutorialDialog");
const tutorialDoneButton = document.querySelector("#tutorialDoneButton");
const characterCounter = document.querySelector("#characterCounter");

const MAX_MESSAGE_CHARACTERS = 1500;
const DEMO_SESSION_KEY = "studymate-demo-session";
const DEMO_ACCOUNTS_KEY = "studymate-demo-accounts";

let assistants = [];
let selectedAssistant = null;
let messages = [];
let isWaitingForReply = false;
let hasLoadedAppData = false;
let demoSession = getStoredDemoSession();
let authMode = "login";

function getStoredDemoSession() {
  try {
    const storedSession = sessionStorage.getItem(DEMO_SESSION_KEY);
    return storedSession ? JSON.parse(storedSession) : null;
  } catch (error) {
    return null;
  }
}

function saveDemoSession(session) {
  demoSession = session;
  sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
}

function clearDemoSession() {
  demoSession = null;
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}

function getStoredDemoAccounts() {
  try {
    const storedAccounts = localStorage.getItem(DEMO_ACCOUNTS_KEY);
    return storedAccounts ? JSON.parse(storedAccounts) : [];
  } catch (error) {
    return [];
  }
}

function saveDemoAccounts(accounts) {
  localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function findDemoAccount(email) {
  return getStoredDemoAccounts().find((account) => account.email === normalizeEmail(email));
}

function updateDemoAccount(email, updates) {
  const accounts = getStoredDemoAccounts();
  const accountIndex = accounts.findIndex((account) => account.email === normalizeEmail(email));

  if (accountIndex === -1) {
    return;
  }

  accounts[accountIndex] = {
    ...accounts[accountIndex],
    ...updates,
  };
  saveDemoAccounts(accounts);
}

async function hashPassword(password) {
  if (!window.crypto || !window.crypto.subtle) {
    return `demo:${password}`;
  }

  const encodedPassword = new TextEncoder().encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", encodedPassword);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function setAuthMode(nextMode) {
  authMode = nextMode;
  loginForm.dataset.mode = authMode;
  clearLoginFeedback();

  if (authMode === "signup") {
    authEyebrow.textContent = "Opret konto";
    authTitle.textContent = "Opret din konto";
    authDescription.textContent = "Lav en lokal demo-konto før du bruger StudyMate AI.";
    authSubmitText.textContent = "Opret konto";
    authToggleText.textContent = "Har du allerede en konto?";
    authModeToggle.textContent = "Log ind";
    passwordInput.autocomplete = "new-password";
    return;
  }

  authEyebrow.textContent = "Login";
  authTitle.textContent = "Velkommen tilbage";
  authDescription.textContent = "Log ind med en konto du allerede har oprettet.";
  authSubmitText.textContent = "Log ind";
  authToggleText.textContent = "Har du ikke en konto?";
  authModeToggle.textContent = "Opret konto";
  passwordInput.autocomplete = "current-password";
}

function clearLoginFeedback() {
  loginFeedback.textContent = "";
  loginFeedback.className = "login-feedback";
}

function setLoginFeedback(message, type = "error") {
  loginFeedback.textContent = message;
  loginFeedback.className = `login-feedback is-${type}`;
}

function getUserDisplayName() {
  return demoSession?.name || "Dig";
}

function getUserInitial() {
  return getUserDisplayName().trim().charAt(0).toUpperCase() || "Y";
}

function updateSessionUI() {
  sessionAvatar.textContent = getUserInitial();
  sessionName.textContent = getUserDisplayName();
  sessionFocus.textContent = demoSession?.focus || "Multimediedesign";
}

function showWelcomeScreen() {
  welcomeScreen.classList.remove("is-hidden");
  appShell.classList.add("is-hidden");
  userNameInput.focus();
}

function showAppShell() {
  updateSessionUI();
  welcomeScreen.classList.add("is-hidden");
  appShell.classList.remove("is-hidden");
  startAppData();
}

function startAppData() {
  if (hasLoadedAppData) {
    return;
  }

  hasLoadedAppData = true;
  loadAssistants();
}

async function handleLogin(event) {
  event.preventDefault();

  const email = normalizeEmail(userNameInput.value);
  const password = passwordInput ? passwordInput.value : "";

  if (!email) {
    userNameInput.focus();
    return;
  }

  if (!password || password.length < 6) {
    setLoginFeedback("Adgangskoden skal være mindst 6 tegn.");
    passwordInput.focus();
    return;
  }

  if (authMode === "signup") {
    await createLocalDemoAccount(email, password);
    return;
  }

  await signInWithLocalDemoAccount(email, password);
}

async function createLocalDemoAccount(email, password) {
  const existingAccount = findDemoAccount(email);

  if (existingAccount) {
    setLoginFeedback("Der findes allerede en konto med den e-mail. Log ind i stedet.");
    return;
  }

  const account = {
    email,
    name: getNameFromEmail(email),
    focus: studyFocusInput ? studyFocusInput.value : "Multimediedesign",
    passwordHash: await hashPassword(password),
    provider: "email",
    createdAt: new Date().toISOString(),
    hasSeenTutorial: false,
  };

  const accounts = getStoredDemoAccounts();
  accounts.push(account);
  saveDemoAccounts(accounts);
  startSessionForAccount(account);
  showAppShell();
  openTutorialDialogSoon();
}

async function signInWithLocalDemoAccount(email, password) {
  const account = findDemoAccount(email);

  if (!account || account.provider !== "email") {
    setLoginFeedback("Kontoen findes ikke. Opret en konto først.");
    return;
  }

  const passwordHash = await hashPassword(password);

  if (account.passwordHash !== passwordHash) {
    setLoginFeedback("Forkert adgangskode.");
    passwordInput.focus();
    return;
  }

  startSessionForAccount(account);
  showAppShell();

  if (!account.hasSeenTutorial) {
    openTutorialDialogSoon();
  }
}

function startSessionForAccount(account) {
  saveDemoSession({
    name: account.name,
    email: account.email,
    focus: account.focus || "Multimediedesign",
    provider: account.provider,
    createdAt: new Date().toISOString(),
  });
}

function handleSocialLogin(event) {
  const provider = event.currentTarget.dataset.provider || "social login";
  const email = `${provider.toLowerCase()}@studymate.demo`;
  let account = findDemoAccount(email);
  const isNewAccount = !account;

  if (!account) {
    account = {
      email,
      name: "Demo Studerende",
      focus: "Multimediedesign",
      passwordHash: "",
      provider,
      createdAt: new Date().toISOString(),
      hasSeenTutorial: false,
    };

    const accounts = getStoredDemoAccounts();
    accounts.push(account);
    saveDemoAccounts(accounts);
  }

  startSessionForAccount({
    ...account,
    provider,
  });
  showAppShell();

  if (isNewAccount || !account.hasSeenTutorial) {
    openTutorialDialogSoon();
  }
}

function getNameFromEmail(email) {
  const emailName = email.split("@")[0].trim();

  if (!emailName) {
    return "Studerende";
  }

  return emailName
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function handleSignOut() {
  clearDemoSession();
  messages = [];
  userNameInput.value = "";
  if (passwordInput) {
    passwordInput.value = "";
  }
  if (studyFocusInput) {
    studyFocusInput.selectedIndex = 0;
  }
  setAuthMode("login");
  renderMessages();
  renderPromptSuggestions();
  showWelcomeScreen();
}

function togglePasswordVisibility() {
  if (!passwordInput || !passwordToggle) {
    return;
  }

  const shouldShowPassword = passwordInput.type === "password";
  passwordInput.type = shouldShowPassword ? "text" : "password";
  passwordToggle.textContent = shouldShowPassword ? "Skjul" : "Vis";
  passwordToggle.setAttribute(
    "aria-label",
    shouldShowPassword ? "Skjul adgangskode" : "Vis adgangskode"
  );
}

async function loadAssistants() {
  try {
    const response = await fetch("/api/assistants");

    if (!response.ok) {
      throw new Error("Could not load assistants");
    }

    const data = await response.json();
    assistants = data.assistants;
    selectedAssistant = assistants[0];

    renderAssistants();
    renderNewChatAssistants();
    updateActiveAssistant();
    renderPromptSuggestions();
    renderMessages();
    updateSendButton();
  } catch (error) {
    assistantGrid.innerHTML = `<p class="sidebar-error">Could not load assistants from the backend.</p>`;
    chatTitle.textContent = "StudyMate AI";
    activeAssistantDescription.textContent = "The backend assistant data is not available.";
    sendButton.disabled = true;
  }
}

function renderAssistants() {
  assistantGrid.innerHTML = "";

  assistants.forEach((assistant) => {
    const button = document.createElement("button");
    button.className = "assistant-card";
    button.type = "button";
    button.dataset.assistantId = assistant.id;

    if (assistant.id === selectedAssistant.id) {
      button.classList.add("is-active");
      button.setAttribute("aria-current", "true");
    }

    button.innerHTML = `
      <span class="assistant-icon" aria-hidden="true">${assistant.icon}</span>
      <span class="assistant-card-content">
        <h2>${assistant.name}</h2>
        <p>${assistant.shortDescription || assistant.description}</p>
        ${getAssistantBestForMarkup(assistant)}
      </span>
    `;

    button.addEventListener("click", () => {
      selectAssistant(assistant);
    });

    assistantGrid.appendChild(button);
  });
}

function renderNewChatAssistants() {
  if (!newChatAssistantList) {
    return;
  }

  newChatAssistantList.innerHTML = "";

  assistants.forEach((assistant) => {
    const button = document.createElement("button");
    button.className = "new-chat-agent-card";
    button.type = "button";
    button.dataset.assistantId = assistant.id;

    if (assistant.id === selectedAssistant?.id) {
      button.classList.add("is-active");
    }

    button.innerHTML = `
      <span class="assistant-icon" aria-hidden="true">${assistant.icon}</span>
      <span>
        <strong>${assistant.name}</strong>
        <small>${assistant.shortDescription || assistant.description}</small>
      </span>
    `;

    button.addEventListener("click", () => {
      closeNewChatDialog();
      selectAssistant(assistant, { startNewChat: true });
    });

    newChatAssistantList.appendChild(button);
  });
}

function selectAssistant(assistant, options = {}) {
  selectedAssistant = assistant;

  if (options.startNewChat) {
    messages = [];
  }

  updateActiveAssistant();
  renderAssistants();
  renderPromptSuggestions();
  renderMessages();
  updateSendButton();
  messageInput.focus();
}

function updateActiveAssistant() {
  if (!selectedAssistant) {
    return;
  }

  activeAssistantIcon.textContent = selectedAssistant.icon;
  chatTitle.textContent = selectedAssistant.name;
  activeAssistantDescription.textContent =
    selectedAssistant.shortDescription || selectedAssistant.description;
}

function getAssistantBestForMarkup(assistant) {
  const bestForItems = assistant.bestFor || [];

  if (bestForItems.length === 0) {
    return "";
  }

  const tags = bestForItems
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");

  return `
    <span class="assistant-best-for" aria-hidden="true">
      <span class="assistant-best-for-label">Best for</span>
      <span class="assistant-best-for-tags">${tags}</span>
    </span>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderPromptSuggestions() {
  promptSuggestions.innerHTML = "";

  if (!selectedAssistant) {
    promptSuggestions.classList.add("is-hidden");
    return;
  }

  promptSuggestions.classList.toggle("is-hidden", messages.length > 0);

  selectedAssistant.exampleQuestions.forEach((example) => {
    const button = document.createElement("button");
    button.className = "prompt-chip";
    button.type = "button";
    button.textContent = example;

    button.addEventListener("click", () => {
      messageInput.value = example;
      resizeTextarea();
      updateSendButton();
      messageInput.focus();
    });

    promptSuggestions.appendChild(button);
  });
}

function renderMessages() {
  chatMessages.innerHTML = "";

  if (messages.length === 0 && !isWaitingForReply) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.innerHTML = `
      <img src="assets/studymate-favicon.svg" alt="" />
      <h2>What are we working on?</h2>
      <p>Pick an assistant, write a message, or start with one of the example prompts below.</p>
    `;
    chatMessages.appendChild(emptyState);
    return;
  }

  messages.forEach((message) => {
    chatMessages.appendChild(createMessageElement(message));
  });

  if (isWaitingForReply) {
    chatMessages.appendChild(createLoadingMessage());
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function createMessageElement(message) {
  const row = document.createElement("article");
  row.className = `message-row is-${message.role}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = message.icon;
  avatar.setAttribute("aria-hidden", "true");

  const content = document.createElement("div");
  content.className = "message-content";

  const meta = document.createElement("div");
  meta.className = "message-meta";

  const name = document.createElement("span");
  name.textContent = message.role === "user" ? getUserDisplayName() : message.name;

  const time = document.createElement("time");
  time.dateTime = message.createdAt;
  time.textContent = formatMessageTime(message.createdAt);

  meta.append(name, time);

  const text = document.createElement("div");
  text.className = "message-text";
  renderMessageText(text, message.text, message.role !== "error");

  content.append(meta, text);

  const actions = createMessageActions(message);

  if (actions) {
    content.appendChild(actions);
  }

  row.append(avatar, content);

  return row;
}

function createMessageActions(message) {
  if (!message.text) {
    return null;
  }

  const actions = document.createElement("div");
  actions.className = "message-actions";

  const copyButton = document.createElement("button");
  copyButton.className = "message-action-button";
  copyButton.type = "button";
  copyButton.textContent = "Copy";
  copyButton.setAttribute("aria-label", "Copy message");
  copyButton.addEventListener("click", () => {
    copyMessageText(message.text, copyButton);
  });
  actions.appendChild(copyButton);

  if (message.role === "error" && message.retryText) {
    const retryButton = document.createElement("button");
    retryButton.className = "message-action-button";
    retryButton.type = "button";
    retryButton.textContent = "Retry";
    retryButton.disabled = isWaitingForReply;
    retryButton.addEventListener("click", () => {
      retryMessage(message.retryText, message.retryAssistantId);
    });
    actions.appendChild(retryButton);
  }

  return actions;
}

function createLoadingMessage() {
  const row = document.createElement("article");
  row.className = "message-row is-ai";
  row.innerHTML = `
    <div class="message-avatar" aria-hidden="true">${selectedAssistant.icon}</div>
    <div class="message-content">
      <p class="message-meta">${selectedAssistant.name}</p>
      <p class="message-text">
        Thinking
        <span class="typing-dots" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
      </p>
    </div>
  `;
  return row;
}

function addMessage(role, text, assistant = selectedAssistant, options = {}) {
  const message = {
    id: createMessageId(),
    role,
    text,
    name: role === "user" ? getUserDisplayName() : assistant.name,
    icon: role === "user" ? getUserInitial() : assistant.icon,
    createdAt: new Date().toISOString(),
    ...options,
  };

  messages.push(message);
  renderMessages();
  renderPromptSuggestions();

  return message;
}

function createMessageId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatMessageTime(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderMessageText(container, text, useMarkdown) {
  if (!useMarkdown) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    container.appendChild(paragraph);
    return;
  }

  const codeBlockPattern = /```([a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match = codeBlockPattern.exec(text);

  while (match) {
    renderTextSection(container, text.slice(lastIndex, match.index));
    appendCodeBlock(container, match[1], match[2]);
    lastIndex = codeBlockPattern.lastIndex;
    match = codeBlockPattern.exec(text);
  }

  renderTextSection(container, text.slice(lastIndex));
}

function renderTextSection(container, text) {
  const lines = text.replace(/\r/g, "").split("\n");
  let paragraphLines = [];
  let list = null;

  function flushParagraph() {
    const paragraphText = paragraphLines.join(" ").trim();

    if (!paragraphText) {
      paragraphLines = [];
      return;
    }

    const paragraph = document.createElement("p");
    appendInlineMarkdown(paragraph, paragraphText);
    container.appendChild(paragraph);
    paragraphLines = [];
  }

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    const bulletMatch = trimmedLine.match(/^[-*]\s+(.+)/);

    if (!trimmedLine) {
      flushParagraph();
      list = null;
      return;
    }

    if (bulletMatch) {
      flushParagraph();

      if (!list) {
        list = document.createElement("ul");
        container.appendChild(list);
      }

      const item = document.createElement("li");
      appendInlineMarkdown(item, bulletMatch[1]);
      list.appendChild(item);
      return;
    }

    list = null;
    paragraphLines.push(trimmedLine);
  });

  flushParagraph();
}

function appendInlineMarkdown(parent, text) {
  const inlinePattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match = inlinePattern.exec(text);

  while (match) {
    parent.append(document.createTextNode(text.slice(lastIndex, match.index)));
    parent.appendChild(createInlineMarkdownElement(match[0]));
    lastIndex = inlinePattern.lastIndex;
    match = inlinePattern.exec(text);
  }

  parent.append(document.createTextNode(text.slice(lastIndex)));
}

function createInlineMarkdownElement(token) {
  if (token.startsWith("`")) {
    const code = document.createElement("code");
    code.textContent = token.slice(1, -1);
    return code;
  }

  if (token.startsWith("**")) {
    const strong = document.createElement("strong");
    strong.textContent = token.slice(2, -2);
    return strong;
  }

  const emphasis = document.createElement("em");
  emphasis.textContent = token.slice(1, -1);
  return emphasis;
}

function appendCodeBlock(container, language, codeText) {
  const pre = document.createElement("pre");
  const code = document.createElement("code");

  if (language) {
    pre.dataset.language = language;
  }

  code.textContent = codeText.replace(/^\n/, "").replace(/\n$/, "");
  pre.appendChild(code);
  container.appendChild(pre);
}

async function copyMessageText(text, button) {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      copyTextFallback(text);
    }

    setTemporaryButtonText(button, "Copied");
  } catch (error) {
    setTemporaryButtonText(button, "Copy failed");
  }
}

function copyTextFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function setTemporaryButtonText(button, text) {
  const originalText = button.textContent;
  button.textContent = text;

  setTimeout(() => {
    button.textContent = originalText;
  }, 1200);
}

async function sendMessage(message, assistantId) {
  const apiUrl = window.location.protocol === "file:" ? "http://localhost:3000/api/chat" : "/api/chat";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      assistantId,
      message,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Backend request failed");
  }

  const data = await response.json();
  return data.reply;
}

async function handleUserMessage(message, assistantAtSendTime) {
  if (!assistantAtSendTime || isWaitingForReply) {
    return;
  }

  addMessage("user", message, assistantAtSendTime);
  setWaitingState(true);

  try {
    const [reply] = await Promise.all([
      sendMessage(message, assistantAtSendTime.id),
      wait(800),
    ]);
    addMessage("ai", reply, assistantAtSendTime);
  } catch (error) {
    addMessage("error", error.message || "The backend is not responding. Make sure the server is running.", {
      name: "System",
      icon: "!",
    }, {
      retryText: message,
      retryAssistantId: assistantAtSendTime.id,
    });
  } finally {
    setWaitingState(false);
    messageInput.disabled = false;
    messageInput.focus();
  }
}

function retryMessage(message, assistantId) {
  const assistant = assistants.find((item) => item.id === assistantId) || selectedAssistant;
  handleUserMessage(message, assistant);
}

function openNewChatDialog() {
  if (!newChatDialog || isWaitingForReply) {
    return;
  }

  renderNewChatAssistants();

  if (typeof newChatDialog.showModal === "function") {
    newChatDialog.showModal();
  } else {
    newChatDialog.setAttribute("open", "");
  }

  const firstAgentButton = newChatDialog.querySelector(".new-chat-agent-card");
  firstAgentButton?.focus();
}

function closeNewChatDialog() {
  if (!newChatDialog) {
    return;
  }

  if (typeof newChatDialog.close === "function") {
    newChatDialog.close();
  } else {
    newChatDialog.removeAttribute("open");
  }
}

function openTutorialDialogSoon() {
  window.setTimeout(openTutorialDialog, 120);
}

function openTutorialDialog() {
  if (!tutorialDialog) {
    return;
  }

  if (typeof tutorialDialog.showModal === "function") {
    tutorialDialog.showModal();
  } else {
    tutorialDialog.setAttribute("open", "");
  }

  tutorialDoneButton?.focus();
}

function closeTutorialDialog() {
  if (!tutorialDialog) {
    return;
  }

  updateDemoAccount(demoSession?.email || "", {
    hasSeenTutorial: true,
  });

  if (typeof tutorialDialog.close === "function") {
    tutorialDialog.close();
  } else {
    tutorialDialog.removeAttribute("open");
  }

  messageInput.focus();
}

function setWaitingState(isWaiting) {
  isWaitingForReply = isWaiting;
  messageInput.disabled = isWaiting;
  updateSendButton();
  renderMessages();
}

function updateSendButton() {
  const characterCount = messageInput.value.length;
  const hasMessage = messageInput.value.trim().length > 0;
  const isTooLong = characterCount > MAX_MESSAGE_CHARACTERS;
  sendButton.disabled = !selectedAssistant || !hasMessage || isTooLong || isWaitingForReply;
  updateCharacterCounter(characterCount);
}

function updateCharacterCounter(characterCount) {
  if (!characterCounter) {
    return;
  }

  characterCounter.textContent = `${characterCount}/${MAX_MESSAGE_CHARACTERS}`;
  characterCounter.classList.toggle("is-warning", characterCount > MAX_MESSAGE_CHARACTERS * 0.86);
}

function resizeTextarea() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 160)}px`;
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();

  if (!selectedAssistant || !message || isWaitingForReply) {
    return;
  }

  const assistantAtSendTime = selectedAssistant;
  messageInput.value = "";
  resizeTextarea();
  updateSendButton();
  await handleUserMessage(message, assistantAtSendTime);
});

messageInput.addEventListener("input", () => {
  resizeTextarea();
  updateSendButton();
});

messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    chatForm.requestSubmit();
  }
});

newChatButton.addEventListener("click", openNewChatDialog);
newChatCloseButton.addEventListener("click", closeNewChatDialog);

newChatDialog.addEventListener("click", (event) => {
  if (event.target === newChatDialog) {
    closeNewChatDialog();
  }
});

loginForm.addEventListener("submit", handleLogin);
authModeToggle.addEventListener("click", () => {
  setAuthMode(authMode === "login" ? "signup" : "login");
});
signOutButton.addEventListener("click", handleSignOut);
tutorialDoneButton.addEventListener("click", closeTutorialDialog);

if (passwordToggle) {
  passwordToggle.addEventListener("click", togglePasswordVisibility);
}

socialLoginButtons.forEach((button) => {
  button.addEventListener("click", handleSocialLogin);
});

if (demoSession) {
  showAppShell();
} else {
  showWelcomeScreen();
}
