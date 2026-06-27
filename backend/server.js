const path = require("path");
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const { assistants, getAssistantById, getPublicAssistants } = require("./data/assistants");
const { getSkillsByIds } = require("./data/skills");
const { buildPromptPayload, buildSystemPrompt } = require("./data/promptBuilder");
const { loadKnowledgeFiles, getRelevantKnowledge } = require("./utils/knowledgeLoader");

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const ENABLE_DEBUG_ROUTES = process.env.ENABLE_DEBUG_ROUTES === "true" || NODE_ENV !== "production";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const OPENAI_MAX_OUTPUT_TOKENS = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS) || 450;
const MAX_MESSAGE_CHARACTERS = Number(process.env.MAX_MESSAGE_CHARACTERS) || 1500;
const CHAT_RATE_LIMIT_WINDOW_MS = Number(process.env.CHAT_RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000;
const CHAT_RATE_LIMIT_MAX_REQUESTS = Number(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS) || 8;
const chatRateLimitStore = new Map();
const KNOWLEDGE_CATEGORIES = [
  { id: "semester-1", label: "Semester 1", prefix: "semester-1/" },
  { id: "semester-2", label: "Semester 2", prefix: "semester-2/" },
  { id: "school-projects", label: "School projects", prefix: "school-projects/" },
  { id: "private-projects", label: "Private projects", prefix: "private-projects/" },
  { id: "shared", label: "Shared", prefix: "shared/" },
  { id: "base-docs", label: "Base docs", prefix: "" },
];
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/api/assistants", (req, res) => {
  const publicAssistants = getPublicAssistants().map((assistant) => {
    const connectedSkills = getSkillsByIds(assistant.skills);

    return {
      ...assistant,
      connectedSkills: connectedSkills.map((skill) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
      })),
    };
  });

  res.json({
    assistants: publicAssistants,
  });
});

function getKnowledgeCategories(files) {
  return KNOWLEDGE_CATEGORIES.map((category) => {
    const count = files.filter((file) => {
      if (category.id === "base-docs") {
        return !file.path.includes("/");
      }

      return file.path.startsWith(category.prefix);
    }).length;

    return {
      id: category.id,
      label: category.label,
      count,
    };
  }).filter((category) => category.count > 0);
}

app.get("/api/knowledge/status", (req, res) => {
  const files = loadKnowledgeFiles();

  res.json({
    status: files.length > 0 ? "ready" : "empty",
    fileCount: files.length,
    categories: getKnowledgeCategories(files),
  });
});

if (ENABLE_DEBUG_ROUTES) {
  app.get("/api/debug/assistants", (req, res) => {
    const debugAssistants = assistants.map((assistant) => {
      const connectedSkills = getSkillsByIds(assistant.skills);
      const sampleMessage = assistant.exampleQuestions[0] || assistant.name;
      const relevantKnowledge = getRelevantKnowledge({
        assistant,
        message: sampleMessage,
      });
      const systemPrompt = buildSystemPrompt(assistant, connectedSkills, relevantKnowledge);

      return {
        id: assistant.id,
        name: assistant.name,
        skills: connectedSkills.map((skill) => ({
          id: skill.id,
          name: skill.name,
          sourceSkillIds: skill.sourceSkillIds,
        })),
        knowledgeFiles: relevantKnowledge.items.map((item) => ({
          path: item.path,
          title: item.title,
          score: item.score,
        })),
        promptPreview: systemPrompt.slice(0, 900),
      };
    });

    res.json({ assistants: debugAssistants });
  });

  app.get("/api/debug/knowledge", (req, res) => {
    const files = loadKnowledgeFiles();

    res.json({
      status: files.length > 0 ? "ready" : "empty",
      count: files.length,
      files: files.map((file) => ({
        path: file.path,
        title: file.title,
        characters: file.characters,
      })),
    });
  });

  app.post("/api/debug/prompt", (req, res) => {
    const { assistantId, message } = req.body;

    if (!assistantId) {
      return res.status(400).json({ error: "Missing assistantId." });
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required." });
    }

    const assistant = getAssistantById(assistantId);

    if (!assistant) {
      return res.status(404).json({ error: "Unknown assistantId." });
    }

    const connectedSkills = getSkillsByIds(assistant.skills);
    const relevantKnowledge = getRelevantKnowledge({
      assistant,
      message: message.trim(),
    });
    const promptPayload = buildPromptPayload({
      assistant,
      connectedSkills,
      relevantKnowledge,
      message,
    });

    res.json({
      assistant: {
        id: assistant.id,
        name: assistant.name,
      },
      skills: connectedSkills.map((skill) => ({
        id: skill.id,
        name: skill.name,
      })),
      knowledge: {
        status: relevantKnowledge.status,
        totalFiles: relevantKnowledge.totalFiles,
        matchedFiles: relevantKnowledge.items.map((item) => ({
          path: item.path,
          title: item.title,
          score: item.score,
        })),
      },
      prompt: {
        instructionsCharacters: promptPayload.instructions.length,
        inputCharacters: promptPayload.input.length,
        instructionsPreview: promptPayload.instructions.slice(0, 1400),
        inputPreview: promptPayload.input,
      },
    });
  });
}

function createFakeReply(assistant) {
  return `${assistant.name}: ${assistant.fakeReply}`;
}

async function createOpenAIReply(promptPayload) {
  const response = await openai.responses.create({
    model: OPENAI_MODEL,
    instructions: promptPayload.instructions,
    input: promptPayload.input,
    max_output_tokens: OPENAI_MAX_OUTPUT_TOKENS,
  });

  return response.output_text || "I could not create a response right now.";
}

function getOpenAIErrorMessage(error) {
  if (error.status === 401) {
    return "The OpenAI API key is invalid. Check backend/.env and restart the server.";
  }

  if (error.status === 400 && error.message.includes("model")) {
    return "The configured OpenAI model is not available. Check OPENAI_MODEL in backend/.env.";
  }

  if (error.status === 429) {
    return "OpenAI quota or billing limit reached. Check your OpenAI Platform billing and usage limits.";
  }

  return "The AI service is not responding right now. Try again in a moment.";
}

function getClientId(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket.remoteAddress || "unknown";
}

function rateLimitChat(req, res, next) {
  const now = Date.now();
  const clientId = getClientId(req);
  const existingRecord = chatRateLimitStore.get(clientId);

  if (!existingRecord || existingRecord.resetAt <= now) {
    chatRateLimitStore.set(clientId, {
      count: 1,
      resetAt: now + CHAT_RATE_LIMIT_WINDOW_MS,
    });

    return next();
  }

  if (existingRecord.count >= CHAT_RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((existingRecord.resetAt - now) / 1000);
    res.set("Retry-After", String(retryAfterSeconds));

    return res.status(429).json({
      error: `Demo limit reached. Try again in ${retryAfterSeconds} seconds.`,
    });
  }

  existingRecord.count += 1;
  next();
}

app.post("/api/chat", rateLimitChat, async (req, res) => {
  const { assistantId, message } = req.body;

  if (!assistantId) {
    return res.status(400).json({ error: "Missing assistantId." });
  }

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "Message is required." });
  }

  if (message.trim().length > MAX_MESSAGE_CHARACTERS) {
    return res.status(400).json({
      error: `Message is too long. Keep demo messages under ${MAX_MESSAGE_CHARACTERS} characters.`,
    });
  }

  const assistant = getAssistantById(assistantId);

  if (!assistant) {
    return res.status(404).json({ error: "Unknown assistantId." });
  }

  const connectedSkills = getSkillsByIds(assistant.skills);
  const relevantKnowledge = getRelevantKnowledge({
    assistant,
    message: message.trim(),
  });
  const promptPayload = buildPromptPayload({
    assistant,
    connectedSkills,
    relevantKnowledge,
    message,
  });

  console.log(
    `[StudyMate AI] ${assistant.name} loaded skills: ${connectedSkills
      .map((skill) => skill.id)
      .join(", ")}`
  );
  console.log(
    `[StudyMate AI] ${assistant.name} loaded knowledge: ${
      relevantKnowledge.items.map((item) => item.path).join(", ") || "none"
    }`
  );

  if (!openai) {
    return res.json({ reply: createFakeReply(assistant) });
  }

  try {
    const reply = await createOpenAIReply(promptPayload);
    res.json({ reply });
  } catch (error) {
    console.error("[StudyMate AI] OpenAI request failed:", error.message);
    res.status(error.status || 500).json({
      error: getOpenAIErrorMessage(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`StudyMate AI backend is running on http://localhost:${PORT}`);
});
