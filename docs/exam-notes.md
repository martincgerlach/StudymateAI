# StudyMate AI Exam Notes

## What I Built

I built StudyMate AI, a study-focused AI platform with six specialized assistants.

The assistants are:

- Study Coach
- Coding Mentor
- Design Critic
- UX Researcher
- Exam Coach
- Project Manager

The project is built with HTML, CSS, vanilla JavaScript, Node.js, Express, and the OpenAI API.

## Why I Built It

The idea was to make AI help more structured.

Instead of one generic chatbot, the user can choose an assistant that fits the task. This makes the experience clearer and helps the backend build a better prompt.

It is also a portfolio demo that shows I can connect frontend, backend, API use, prompt design, and UX thinking in one project.

## Important Design Decisions

### Assistant cards

The assistants are shown as cards in the sidebar so the user can quickly switch role.

### Chat-first layout

The app opens directly into the working interface. It is not a marketing landing page.

### Knowledge Base status

The UI shows whether the Knowledge Base is connected and shows categories like Semester 1, School Projects, Private Projects, Shared, and Base Docs. This makes the AI architecture visible without exposing debug prompts.

### Simple visual style

The design is clean and focused because the product is a study/work tool. The UI should not distract from the chat.

## Important Code Decisions

### Vanilla frontend

I used HTML, CSS, and vanilla JavaScript because the project should be understandable and realistic at my level.

### Backend protects the API key

The OpenAI API key is stored in `backend/.env` and is never exposed in frontend JavaScript.

### Assistant data is backend-owned

The backend is the source of truth for assistant data. This makes it easier to keep assistant behavior consistent.

### Skill stacks are internal

Skills are used by the backend to shape each assistant. The user only sees the six main assistants.

### Knowledge Loader

The Knowledge Loader reads Markdown files from the `knowledge/` folder and adds relevant context to the prompt.

It uses simple weighted keyword and phrase matching. This means a project name like "Gerlach Photo" is more important than broad words like design or frontend.

### Prompt Builder

The prompt builder combines:

- Base instructions.
- Response rules.
- Assistant role.
- Skill instructions.
- Matched Knowledge Base source files.
- Relevant Knowledge Base context.
- User message.

## How I Would Explain The Architecture

The frontend sends a message and an `assistantId` to the backend.

The backend finds the assistant, loads its skills, searches the Knowledge Base, builds a prompt payload, and sends that to OpenAI.

OpenAI sends a response back to the backend, and the backend sends it to the frontend.

## What Works Well

- The app has a real frontend and backend.
- The OpenAI key is protected.
- The assistant roles are clear.
- The prompt architecture is structured.
- The Knowledge Base loader works with Markdown files.
- The Knowledge Base now includes semester summaries, personal learning notes, StudyMate AI, portfolio, and Gerlach Photo summaries.
- The code is still simple enough to explain.

## What Is Weak

- The Knowledge Base still needs the remaining project summaries.
- The project does not have login or saved cloud chats.
- Rate limiting is simple and stored in memory.
- Debug endpoints should be disabled before public deployment.
- The AI response quality still needs manual testing across all assistants.

## What I Would Improve Next

- Add summaries for Coastal Brew, OVL Esports, and Stream Deck Redesign when the correct source folders are confirmed.
- Add more manual tests for the chat UI.
- Improve mobile navigation if the assistant list becomes too long.
- Hide debug endpoints in production.
- Add deployment documentation for gerlachdesign.dk or another hosting setup.
