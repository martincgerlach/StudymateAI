const fs = require("fs");
const path = require("path");

const DEFAULT_KNOWLEDGE_ROOT =
  process.env.KNOWLEDGE_ROOT || path.join(__dirname, "../../knowledge");

const IGNORED_DIRECTORIES = new Set(["node_modules", ".git", "dist", "build", "vendor"]);
const CONTEXT_EXCLUDED_FILES = new Set(["README.md", "source-map.md"]);
const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "are",
  "you",
  "your",
  "how",
  "can",
  "jeg",
  "det",
  "den",
  "der",
  "med",
  "til",
  "for",
  "som",
  "kan",
  "min",
  "mit",
  "mine",
]);

const ASSISTANT_KEYWORDS = {
  "study-coach": [
    "study",
    "learning",
    "semester",
    "exam",
    "reflection",
    "skills",
    "theme",
    "education",
  ],
  "coding-mentor": [
    "html",
    "css",
    "javascript",
    "api",
    "json",
    "node",
    "github",
    "git",
    "code",
    "frontend",
  ],
  "design-critic": [
    "figma",
    "design",
    "ux",
    "ui",
    "hierarchy",
    "typography",
    "spacing",
    "accessibility",
    "color",
  ],
  "ux-researcher": [
    "ux",
    "research",
    "interview",
    "persona",
    "journey",
    "testing",
    "feedback",
    "survey",
  ],
  "exam-coach": [
    "exam",
    "presentation",
    "reflection",
    "argument",
    "project",
    "process",
    "decision",
  ],
  "project-manager": [
    "project",
    "planning",
    "workflow",
    "deadline",
    "sprint",
    "tasks",
    "documentation",
  ],
};

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function normalizeSearchableText(value) {
  return normalizeText(value).replace(/[^a-z0-9æøå]+/gi, " ");
}

function tokenize(value) {
  return normalizeSearchableText(value)
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function createPhrases(words) {
  const phrases = [];

  for (let index = 0; index < words.length - 1; index += 1) {
    phrases.push(`${words[index]} ${words[index + 1]}`);

    if (words[index + 2]) {
      phrases.push(`${words[index]} ${words[index + 1]} ${words[index + 2]}`);
    }
  }

  return [...new Set(phrases)];
}

function getTitleFromMarkdown(content, fallbackTitle) {
  const heading = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("# "));

  return heading ? heading.replace(/^#\s+/, "").trim() : fallbackTitle;
}

function walkMarkdownFiles(directory, knowledgeRoot = DEFAULT_KNOWLEDGE_ROOT) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        return [];
      }

      return walkMarkdownFiles(fullPath, knowledgeRoot);
    }

    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== ".md") {
      return [];
    }

    const content = fs.readFileSync(fullPath, "utf8");
    const relativePath = path.relative(knowledgeRoot, fullPath);

    return [
      {
        path: relativePath,
        title: getTitleFromMarkdown(content, path.basename(entry.name, ".md")),
        content,
        characters: content.length,
      },
    ];
  });
}

function loadKnowledgeFiles(knowledgeRoot = DEFAULT_KNOWLEDGE_ROOT) {
  return walkMarkdownFiles(knowledgeRoot, knowledgeRoot).sort((a, b) =>
    a.path.localeCompare(b.path)
  );
}

function scoreTerm(term, fields, weights) {
  return Object.entries(fields).reduce((score, [fieldName, fieldValue]) => {
    if (fieldValue.includes(term)) {
      return score + weights[fieldName];
    }

    return score;
  }, 0);
}

function scoreKnowledgeFile(file, userTerms, assistantTerms, userPhrases) {
  const fields = {
    path: normalizeSearchableText(file.path),
    title: normalizeSearchableText(file.title),
    content: normalizeSearchableText(file.content),
  };

  const userTermScore = userTerms.reduce(
    (score, term) =>
      score +
      scoreTerm(term, fields, {
        path: 3,
        title: 4,
        content: 1,
      }),
    0
  );

  const phraseScore = userPhrases.reduce(
    (score, phrase) =>
      score +
      scoreTerm(phrase, fields, {
        path: 8,
        title: 10,
        content: 3,
      }),
    0
  );

  const assistantScore = assistantTerms.reduce(
    (score, term) =>
      score +
      scoreTerm(term, fields, {
        path: 1,
        title: 2,
        content: 1,
      }),
    0
  );

  return userTermScore + phraseScore + assistantScore;
}

function createExcerpt(content, searchTerms, maxCharacters) {
  const compactContent = content.replace(/\s+/g, " ").trim();
  const lowerContent = normalizeText(compactContent);
  const firstMatch = searchTerms
    .map((term) => lowerContent.indexOf(term))
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  if (!firstMatch || firstMatch < maxCharacters / 2) {
    return compactContent.slice(0, maxCharacters);
  }

  const start = Math.max(0, firstMatch - Math.floor(maxCharacters / 3));
  return compactContent.slice(start, start + maxCharacters);
}

function getRelevantKnowledge({
  assistant,
  message,
  maxFiles = 4,
  maxCharactersPerFile = 700,
  knowledgeRoot = DEFAULT_KNOWLEDGE_ROOT,
}) {
  const files = loadKnowledgeFiles(knowledgeRoot);
  const contextFiles = files.filter((file) => !CONTEXT_EXCLUDED_FILES.has(file.path));
  const assistantTerms = ASSISTANT_KEYWORDS[assistant.id] || [];
  const userTerms = tokenize(message);
  const userPhrases = createPhrases(userTerms);
  const searchTerms = [...new Set([...userTerms, ...assistantTerms])];

  const items = contextFiles
    .map((file) => ({
      ...file,
      score: scoreKnowledgeFile(file, userTerms, assistantTerms, userPhrases),
    }))
    .filter((file) => file.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFiles)
    .map((file) => ({
      path: file.path,
      title: file.title,
      score: file.score,
      excerpt: createExcerpt(file.content, searchTerms, maxCharactersPerFile),
    }));

  return {
    status: files.length > 0 ? "ready" : "empty",
    totalFiles: files.length,
    items,
    contextText: items
      .map((item) => `Source: ${item.path}\nTitle: ${item.title}\n${item.excerpt}`)
      .join("\n\n"),
  };
}

module.exports = {
  loadKnowledgeFiles,
  getRelevantKnowledge,
};
