# Private Project Summary: StudyMate AI

## Project Type

StudyMate AI is a private portfolio demo project for gerlachdesign.dk and future employers.

The project shows how a simple web application can use AI in a structured way instead of acting like one generic chatbot.

## Project Goal

The goal is to build an AI-powered study platform where students can chat with specialized assistants.

The six user-facing assistants are:

- Study Coach.
- Coding Mentor.
- Design Critic.
- UX Researcher.
- Exam Coach.
- Project Manager.

Each assistant has a clear purpose, while internal skill stacks and Knowledge Base context help shape the backend prompt.

## Problem

Students often use AI tools by asking broad questions in one general chat.

That can create answers that feel too generic, too advanced, or disconnected from the student's real project.

StudyMate AI tries to solve this by making the role clear before the message is sent.

## Main Features

- Responsive frontend built with HTML, CSS, and vanilla JavaScript.
- Chat interface inspired by common AI tools.
- Assistant cards and active assistant state.
- Backend-owned assistant data.
- Internal skill stacks.
- Prompt builder.
- Local Markdown Knowledge Base.
- OpenAI API integration through the backend.
- Fake reply fallback if no API key is configured.
- Loading, empty, error, retry, copy, and disabled states.
- Basic rate limiting and message length validation.

## Tech Stack

- HTML.
- CSS.
- Vanilla JavaScript.
- Node.js.
- Express.
- OpenAI API.
- Markdown files as local Knowledge Base.
- Browser localStorage for simple local state.

The project intentionally does not use React, Next.js, TypeScript, login, database, or advanced architecture in this version.

## Architecture Explanation

The user selects an assistant and writes a message in the frontend.

The frontend sends `assistantId` and `message` to `POST /api/chat`.

The backend:

- Finds the selected assistant.
- Loads the assistant's internal skills.
- Searches the Knowledge Base for relevant Markdown files.
- Builds a prompt from base behavior, assistant role, skills, knowledge context, and the user message.
- Sends the request to OpenAI.
- Returns the AI reply to the frontend.

This keeps the OpenAI API key safe because the frontend never talks directly to OpenAI.

## Important Design Decisions

### Multiple Assistants

Multiple assistants make the app easier to understand because each assistant has a clear task.

This also helps the prompt become more focused.

### Skills Are Internal

Skills are not shown as separate assistants. They are used inside the backend to shape assistant behavior.

This keeps the UI simpler for users.

### Chat-First Product

The app opens directly into the work interface instead of using a marketing landing page.

This fits the product because the main value is the chat workflow.

### Knowledge Base Status

The UI shows whether the Knowledge Base is connected, so users can understand that the system has local project context.

## Important Code Decisions

- The frontend is vanilla JavaScript so it is easier to explain.
- The backend is Express because it is simple and clear.
- Assistant data is centralized in backend data files.
- Prompt building is separated into its own module.
- The Knowledge Loader reads Markdown recursively.
- The OpenAI API key is stored in `backend/.env`.
- `.env` must never be committed to GitHub.
- Demo usage is protected with rate limiting and response length limits.

## Portfolio Value

StudyMate AI is useful in a portfolio because it shows:

- Product thinking.
- UX structure.
- Frontend development.
- Backend development.
- API integration.
- AI prompt architecture.
- Security awareness.
- Documentation.
- Honest technical scope.

The strongest portfolio angle is not that it is a finished SaaS product. The strongest angle is that it shows a complete working AI workflow that is still understandable.

## Current Weaknesses

- The Knowledge Base still needs more personal project summaries.
- The AI quality needs more real testing.
- Debug endpoints should be disabled before public deployment.
- Rate limiting is simple and resets when the server restarts.
- There is no database or cloud account system.
- There is no automated frontend test suite.

## Next Steps

- Add school project summaries.
- Add a portfolio case study.
- Add production deployment notes.
- Disable debug endpoints in production mode.
- Test the app with a few people and document the feedback.

## Useful Keywords

StudyMate AI, portfolio demo, gerlachdesign.dk, AI assistant, OpenAI, frontend, backend, Express, vanilla JavaScript, prompt builder, Knowledge Base, skill stack, API key, rate limiting, UX, exam explanation, project reflection
