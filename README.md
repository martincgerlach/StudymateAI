# StudyMate AI

StudyMate AI is a vanilla HTML, CSS, JavaScript, Node.js, and Express demo project.

The goal is to show how a study platform can use specialized AI assistants instead of one generic chatbot. Each assistant has its own role, skill stack, and access to a local Knowledge Base.

This project is built as a portfolio demo for gerlachdesign.dk and future employers.

## Problem

Students often use AI tools in a very general way. That can make the answers feel random, generic, or disconnected from the actual project.

StudyMate AI solves this by giving each assistant a clear purpose:

- Study Coach
- Coding Mentor
- Design Critic
- UX Researcher
- Exam Coach
- Project Manager

The backend builds the AI context before sending the message to OpenAI.

## Main Features

- Responsive AI chat interface.
- First-time welcome screen with frontend-only mock login.
- Six specialized assistants.
- Assistant cards loaded from backend data.
- Internal skill stacks for each assistant.
- OpenAI integration through the backend only.
- Fake fallback replies if no API key is configured.
- Local Knowledge Base loader for Markdown files.
- Knowledge Base status and category breakdown shown in the frontend.
- Prompt debug endpoints for development.
- Basic rate limiting and message length limits.
- Copy, retry, loading, empty, and error states in the chat UI.

## Tech Stack

- HTML
- CSS
- Vanilla JavaScript
- Node.js
- Express
- OpenAI API
- local Markdown Knowledge Base

No React, Next.js, TypeScript, database, login, or advanced architecture is used in this version.

## Project Structure

```text
StudymateAI/
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js
│   └── assets/
├── backend/
│   ├── server.js
│   ├── data/
│   │   ├── assistants.js
│   │   ├── skills.js
│   │   └── promptBuilder.js
│   └── utils/
│       └── knowledgeLoader.js
├── knowledge/
│   ├── README.md
│   ├── source-map.md
│   ├── semester-1/
│   ├── school-projects/
│   ├── private-projects/
│   └── shared/
└── docs/
```

## How To Run

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Create a local environment file:

```bash
cp .env.example .env
```

3. Add your OpenAI API key to `backend/.env`.

Never commit `backend/.env` to GitHub.

4. Start the backend:

```bash
npm start
```

5. Open the app:

```text
http://localhost:3000
```

## Useful Development Endpoints

- `GET /api/assistants`
- `GET /api/knowledge/status`
- `GET /api/debug/knowledge`
- `GET /api/debug/assistants`
- `POST /api/debug/prompt`
- `POST /api/chat`

The debug endpoints only run when debug routes are enabled. Keep `ENABLE_DEBUG_ROUTES=true` locally, but set `NODE_ENV=production` and `ENABLE_DEBUG_ROUTES=false` before public deployment.

## Security Notes

- The OpenAI API key is only used in the backend.
- The frontend never receives the API key.
- `.gitignore` excludes `.env` and `backend/.env`.
- Backend input is validated before OpenAI is called.
- Rate limiting is included for demo protection.
- Output length is limited with `OPENAI_MAX_OUTPUT_TOKENS`.
- Debug endpoints are environment-gated and should be disabled in production.
- `ALLOWED_ORIGINS` can be set for stricter CORS on a public domain.
- See `docs/public-launch-checklist.md` before sharing the demo publicly.

## Current Limitations

- The Knowledge Base currently has 14 Markdown files, but still needs more real project summaries.
- Knowledge matching is weighted keyword and phrase matching, not semantic search.
- There is no database or saved cloud history.
- The login screen is mock authentication only and does not create real accounts.
- Rate limiting is in memory, so it is simple but not production-grade.
- Debug endpoints expose prompt previews, so they must stay disabled in production.

## Next Improvements

- Add the remaining school project summaries to `knowledge/`.
- Add manual browser test notes.
- Set production environment variables before deployment.
- Add deployment documentation.
- Add a small portfolio case page explaining the process and architecture.
