# StudyMate AI Architecture

## Overview

StudyMate AI is built as a simple full-stack JavaScript project.

The frontend handles the user interface. The backend owns the assistant data, skill stacks, Knowledge Base loading, prompt building, API key, rate limiting, and OpenAI request.

The most important architecture decision is that the frontend never talks directly to OpenAI.

## Data Flow

```text
User
-> Frontend chat UI
-> POST /api/chat
-> Assistant lookup
-> Skill stack lookup
-> Knowledge Loader
-> Prompt Builder
-> OpenAI API
-> Backend response
-> Frontend message bubble
```

## Frontend

The frontend is built with:

- `frontend/index.html`
- `frontend/css/style.css`
- `frontend/js/app.js`

The frontend is responsible for:

- Rendering assistant cards.
- Showing the active assistant.
- Showing skill and knowledge tags.
- Sending chat messages with `fetch`.
- Showing loading, empty, error, retry, copy, and message states.
- Showing Knowledge Base status from `/api/knowledge/status`.
- Showing Knowledge Base categories such as semester, school projects, private projects, shared knowledge, and base docs.

The frontend does not contain the OpenAI API key.

## Backend

The backend is built with Node.js and Express.

Main file:

- `backend/server.js`

The backend is responsible for:

- Serving the frontend.
- Exposing assistant data.
- Validating chat input.
- Applying rate limits.
- Loading assistant skills.
- Loading relevant Knowledge Base files.
- Building the prompt payload.
- Calling OpenAI through the official OpenAI package.

## Cloudflare Pages Functions

The public portfolio demo can also run on Cloudflare Pages.

Cloudflare files:

- `functions/api/assistants.js`
- `functions/api/chat.js`
- `cloudflare/studymate-api.js`
- `frontend/_routes.json`

Cloudflare serves `frontend/` as static files and runs only `/api/*` as server-side functions. This keeps the OpenAI API key out of the frontend and out of GitHub. The Cloudflare version keeps the same API shape as the local Express backend, but the local Express backend is still better for development because it can read the Markdown Knowledge Base directly from the file system.

## Assistant Data

Assistant data lives in:

- `backend/data/assistants.js`

Each assistant has:

- `id`
- `name`
- `shortDescription`
- `longDescription`
- `icon`
- `skills`
- `exampleQuestions`
- `bestFor`
- `fakeReply`

The six user-facing assistants are:

- Study Coach
- Coding Mentor
- Design Critic
- UX Researcher
- Exam Coach
- Project Manager

## Skills

Skills live in:

- `backend/data/skills.js`

Skills are internal behavior modules. They are not separate user-facing assistants.

For example, Coding Mentor uses:

- `mmd-coding-style`
- `software-engineering-bridge`

This keeps the product simple for the user while still making the assistant behavior more structured.

## Knowledge Loader

Knowledge loading lives in:

- `backend/utils/knowledgeLoader.js`

The loader:

- Reads Markdown files from `knowledge/`.
- Ignores folders like `node_modules`, `.git`, `dist`, and `build`.
- Uses simple weighted keyword and phrase matching.
- Gives user message terms more weight than broad assistant keywords.
- Gives project names and matched phrases extra weight.
- Returns short excerpts from relevant files.
- Passes the context to the prompt builder.

This is intentionally simple. It is good enough for a portfolio demo and easy to explain.

## Prompt Builder

Prompt building lives in:

- `backend/data/promptBuilder.js`

The prompt payload contains:

- Base StudyMate behavior.
- Response rules for honest, student-level answers.
- Assistant role.
- Assistant description.
- Best-for areas.
- Skill instructions.
- Relevant Knowledge Base context.
- Matched Knowledge Base source file list.
- User message.

The final OpenAI request uses:

- `instructions`
- `input`
- `max_output_tokens`

## API Endpoints

Main product endpoints:

- `GET /api/assistants`
- `GET /api/knowledge/status`
- `POST /api/chat`

`GET /api/knowledge/status` returns the Knowledge Base status, total file count, and category counts for the frontend.

Development/debug endpoints:

- `GET /api/debug/knowledge`
- `GET /api/debug/assistants`
- `POST /api/debug/prompt`

The debug endpoints are useful for learning and testing, but should be disabled before a public production deployment.

## Security Decisions

- API key is stored in `backend/.env`.
- API key is never used in frontend JavaScript.
- `.gitignore` excludes `.env` and `backend/.env`.
- The backend validates `assistantId` and `message`.
- Empty messages are rejected.
- Long messages are rejected.
- Demo rate limiting protects against basic overuse.
- OpenAI response length is limited through `OPENAI_MAX_OUTPUT_TOKENS`.

## Current Weaknesses

- Rate limiting is stored in memory, so it resets on server restart.
- Debug endpoints expose prompt previews.
- Knowledge matching is weighted keyword and phrase based, not semantic.
- Knowledge Base content is stronger now, but still missing some project summaries.
- There is no database or login.

These are acceptable for the current version because the goal is a realistic portfolio demo, not a production SaaS product.
