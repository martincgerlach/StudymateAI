const assistantGrid = document.querySelector("#assistantGrid");
const activeAssistantIcon = document.querySelector("#activeAssistantIcon");
const chatTitle = document.querySelector("#chat-title");
const activeAssistantDescription = document.querySelector("#activeAssistantDescription");
const bestForList = document.querySelector("#bestForList");
const skillList = document.querySelector("#skillList");
const knowledgeList = document.querySelector("#knowledgeList");
const chatMessages = document.querySelector("#chatMessages");
const promptSuggestions = document.querySelector("#promptSuggestions");
const chatForm = document.querySelector("#chatForm");
const messageInput = document.querySelector("#messageInput");
const sendButton = document.querySelector("#sendButton");
const clearChatButton = document.querySelector("#clearChatButton");
const characterCounter = document.querySelector("#characterCounter");
const knowledgeStatusCard = document.querySelector("#knowledgeStatusCard");
const knowledgeStatusDot = document.querySelector("#knowledgeStatusDot");
const knowledgeStatusTitle = document.querySelector("#knowledgeStatusTitle");
const knowledgeStatusMeta = document.querySelector("#knowledgeStatusMeta");
const knowledgeBreakdown = document.querySelector("#knowledgeBreakdown");

const MAX_MESSAGE_CHARACTERS = 1500;

let assistants = [];
let selectedAssistant = null;
let messages = [];
let isWaitingForReply = false;
let knowledgeStatus = {
  status: "loading",
  fileCount: 0,
  categories: [],
};

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

async function loadKnowledgeStatus() {
  try {
    const response = await fetch("/api/knowledge/status");

    if (!response.ok) {
      throw new Error("Could not load Knowledge Base status");
    }

    knowledgeStatus = await response.json();
  } catch (error) {
    knowledgeStatus = {
      status: "error",
      fileCount: 0,
    };
  }

  updateKnowledgeStatus();
  updateActiveAssistant();
  renderAssistants();
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
        ${createAssistantKnowledgeBadge()}
      </span>
    `;

    button.addEventListener("click", () => {
      selectedAssistant = assistant;
      updateActiveAssistant();
      renderAssistants();
      renderPromptSuggestions();
      messageInput.focus();
    });

    assistantGrid.appendChild(button);
  });
}

function updateActiveAssistant() {
  if (!selectedAssistant) {
    return;
  }

  activeAssistantIcon.textContent = selectedAssistant.icon;
  chatTitle.textContent = selectedAssistant.name;
  activeAssistantDescription.textContent =
    selectedAssistant.shortDescription || selectedAssistant.description;

  renderTags(bestForList, selectedAssistant.bestFor || []);
  renderTags(
    skillList,
    (selectedAssistant.connectedSkills || []).map((skill) => skill.name)
  );
  renderTags(knowledgeList, getAssistantKnowledgeTags());
}

function createAssistantKnowledgeBadge() {
  if (knowledgeStatus.status !== "ready") {
    return "";
  }

  return `<small class="assistant-knowledge-badge">Knowledge-aware</small>`;
}

function getAssistantKnowledgeTags() {
  if (knowledgeStatus.status === "ready") {
    return [
      `${knowledgeStatus.fileCount} knowledge files`,
      ...getVisibleKnowledgeCategories().map((category) => category.label),
    ];
  }

  if (knowledgeStatus.status === "empty") {
    return ["No knowledge files yet"];
  }

  if (knowledgeStatus.status === "error") {
    return ["Knowledge status unavailable"];
  }

  return ["Checking knowledge"];
}

function updateKnowledgeStatus() {
  if (!knowledgeStatusCard) {
    return;
  }

  knowledgeStatusDot.className = `status-dot is-${knowledgeStatus.status}`;
  renderKnowledgeBreakdown();

  if (knowledgeStatus.status === "ready") {
    knowledgeStatusTitle.textContent = "Knowledge ready";
    knowledgeStatusMeta.textContent = `${knowledgeStatus.fileCount} Markdown files connected.`;
    return;
  }

  if (knowledgeStatus.status === "empty") {
    knowledgeStatusTitle.textContent = "No knowledge yet";
    knowledgeStatusMeta.textContent = "Add Markdown files to the knowledge folder.";
    return;
  }

  if (knowledgeStatus.status === "error") {
    knowledgeStatusTitle.textContent = "Knowledge unavailable";
    knowledgeStatusMeta.textContent = "The backend status endpoint did not respond.";
    return;
  }

  knowledgeStatusTitle.textContent = "Checking knowledge";
  knowledgeStatusMeta.textContent = "Looking for Markdown notes.";
}

function getVisibleKnowledgeCategories() {
  return (knowledgeStatus.categories || []).filter((category) => category.count > 0);
}

function renderKnowledgeBreakdown() {
  if (!knowledgeBreakdown) {
    return;
  }

  knowledgeBreakdown.innerHTML = "";

  if (knowledgeStatus.status !== "ready") {
    knowledgeBreakdown.classList.add("is-hidden");
    return;
  }

  const categories = getVisibleKnowledgeCategories();
  knowledgeBreakdown.classList.toggle("is-hidden", categories.length === 0);

  categories.forEach((category) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <span>${category.label}</span>
      <strong>${category.count}</strong>
    `;
    knowledgeBreakdown.appendChild(item);
  });
}

function renderTags(container, items) {
  container.innerHTML = "";

  items.forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "info-tag";
    tag.textContent = item;
    container.appendChild(tag);
  });
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
  avatar.textContent = message.role === "user" ? "M" : message.icon;
  avatar.setAttribute("aria-hidden", "true");

  const content = document.createElement("div");
  content.className = "message-content";

  const meta = document.createElement("div");
  meta.className = "message-meta";

  const name = document.createElement("span");
  name.textContent = message.role === "user" ? "You" : message.name;

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
    name: role === "user" ? "You" : assistant.name,
    icon: role === "user" ? "M" : assistant.icon,
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

clearChatButton.addEventListener("click", () => {
  messages = [];
  renderMessages();
  renderPromptSuggestions();
  messageInput.focus();
});

loadAssistants();
loadKnowledgeStatus();
