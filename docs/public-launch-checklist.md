# StudyMate AI Public Launch Checklist

## Goal

This checklist is for preparing StudyMate AI before showing it publicly on a portfolio site or sharing it with a few people.

The goal is not enterprise security. The goal is a safer demo that protects the OpenAI API key, limits usage, and avoids exposing internal debug information.

## Before Deployment

- Confirm `backend/.env` is not committed to GitHub.
- Confirm `.gitignore` excludes local `.env` files in the root and backend folders.
- Confirm raw source files in `knowledge/` are not committed unless you have permission to publish them.
- Set a low OpenAI spending limit in the OpenAI Platform.
- Use a cheap model such as `gpt-4.1-mini`.
- Keep `OPENAI_MAX_OUTPUT_TOKENS` low enough for demo use.
- Keep `MAX_MESSAGE_CHARACTERS` low enough for short demo messages.
- Keep rate limiting enabled.
- Disable debug routes in production.

## Recommended Production Environment

```text
NODE_ENV=production
ENABLE_DEBUG_ROUTES=false
OPENAI_MODEL=gpt-4.1-mini
OPENAI_MAX_OUTPUT_TOKENS=450
MAX_MESSAGE_CHARACTERS=1500
CHAT_RATE_LIMIT_WINDOW_MS=600000
CHAT_RATE_LIMIT_MAX_REQUESTS=8
ALLOWED_ORIGINS=https://gerlachdesign.dk
```

`OPENAI_API_KEY` should be added through the hosting provider's secret/environment variable settings. It should not be written into frontend JavaScript or committed to GitHub.

## Local Development

For local testing, debug routes can stay enabled:

```text
NODE_ENV=development
ENABLE_DEBUG_ROUTES=true
```

Useful local debug endpoints:

- `GET /api/debug/knowledge`
- `GET /api/debug/assistants`
- `POST /api/debug/prompt`

These endpoints should not be public because they expose prompt previews and internal Knowledge Base matching.

## Manual Test Before Sharing

- Open the app.
- Check that assistants load.
- Check that Knowledge Base status shows connected files and categories.
- Send one short message to each assistant.
- Test empty message handling.
- Test rate limit behavior if needed.
- Test the app on mobile width.
- Test keyboard focus on assistant cards, prompt chips, message input, and buttons.
- Confirm `/api/debug/knowledge` is not available in production.

## Honest Portfolio Explanation

StudyMate AI is a portfolio demo, not a finished SaaS product.

It shows:

- Frontend UI.
- Express backend.
- OpenAI integration through the backend.
- API key protection.
- Rate limiting.
- Prompt architecture.
- Internal assistant skills.
- Local Knowledge Base context.

It still needs:

- Production hosting setup.
- More user testing.
- More project summaries.
- Stronger long-term rate limiting if many people use it.
