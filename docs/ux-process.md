# StudyMate AI UX Process

## Target Users

The primary target user is a Multimedia Design student who uses AI during school projects, coding, design work, UX research, planning, and exam preparation.

The secondary audience is portfolio visitors and future employers who want to understand how the project works.

## User Need

The user needs AI help that feels more focused than a general chatbot.

A normal chatbot can answer many things, but it does not automatically know whether the user needs:

- Code help.
- Design critique.
- UX research help.
- Study planning.
- Exam practice.
- Project planning.

StudyMate AI solves this by giving the user clear assistant roles.

## User Journey

1. The user opens StudyMate AI.
2. The user sees the available assistants.
3. The user chooses the assistant that fits the task.
4. The app shows what the assistant is best for.
5. The app shows connected skills and Knowledge Base status.
6. The app shows Knowledge Base categories so the user can see that the assistant has study, project, and shared context.
7. The user sends a message.
8. The backend builds the correct AI context.
9. The assistant answers in the chat.

## Key UX Decisions

### Multiple assistants instead of one chatbot

This makes the product easier to understand. The user does not have to write a long prompt explaining the role every time.

### Skills are internal

Skills are not shown as separate assistants. This keeps the UI simpler.

The user sees the assistant, while the backend uses skills to shape behavior.

### Knowledge Base status is visible

The UI shows whether the Knowledge Base is connected and shows category counts. This helps explain that the system is not only a generic chatbot.

The UI does not show exact matched prompt files in normal use. That keeps the product cleaner and avoids exposing internal debug details.

### Chat UI inspired by AI tools

The chat uses familiar patterns:

- Assistant list.
- Current assistant header.
- Message bubbles.
- Loading state.
- Retry action.
- Copy action.
- Example prompts.

This makes the app feel familiar without copying a specific product.

## Accessibility Considerations

Current accessibility decisions:

- Buttons are real `button` elements.
- The message input has a hidden label.
- Chat messages use `aria-live`.
- Focus styles are visible.
- Empty and error states are readable.
- Color is not the only indicator for assistant selection.

Still needs more testing:

- Full keyboard flow.
- Screen reader behavior.
- Color contrast check across every component.
- Mobile testing on real devices.

## Testing So Far

The project has been tested through:

- Backend endpoint checks.
- Prompt architecture checks for all six assistants.
- Knowledge Base loader checks.
- Knowledge Base ranking checks for specific projects such as Gerlach Photo and portfolio.
- Basic syntax checks with `node --check`.

KB-9 documents the updated assistant prompt tests with the 14-file Knowledge Base.

No real user test has been completed yet.

## UX Weaknesses

- The Knowledge Base has useful first coverage, but still needs the remaining project summaries.
- The UI explains connected knowledge, but not which exact file was used in each answer.
- There is no onboarding flow.
- There is no saved chat history.
- The project still needs manual mobile and accessibility testing.

## Next UX Improvements

- Add a short first-time empty state explaining what StudyMate AI can do.
- Add remaining project summaries so answers feel more personal.
- Test with 2-3 students or portfolio viewers.
- Ask users which assistant they understand fastest.
- Improve the mobile assistant selection if it feels too long.
