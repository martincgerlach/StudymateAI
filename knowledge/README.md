# StudyMate AI Knowledge Base

## Purpose

The `knowledge/` folder is the single source of truth for all personal learning material used by StudyMate AI.

Its purpose is to give the AI relevant context about my education, projects, experience, and skills so it can provide personalized and more accurate assistance.

This is not model training. Instead, the AI should use the files in this folder as contextual information whenever they are relevant to a user's question.

## Folder Structure

```text
knowledge/
├── README.md
├── source-map.md
├── semester-1/
├── semester-2/
├── school-projects/
├── private-projects/
└── shared/
```

## semester-1

Contains everything related to my first semester of Multimedia Design.

Examples:

- Themes
- Projects
- Skills learned
- UX methods
- Figma knowledge
- HTML/CSS/JavaScript
- Exam preparation
- Exam questions
- Personal reflections

## semester-2

Contains all knowledge from my second semester.

As new topics are learned, they should be documented here.

## school-projects

Contains summaries of completed school projects.

Each project should include:

- Purpose
- Technologies
- Design decisions
- UX process
- Learning outcomes
- Strengths
- Weaknesses
- Possible exam talking points

Do not duplicate the project's source code. Summarize it instead.

## private-projects

Contains summaries of personal projects built outside school.

Each project should document:

- Technologies
- Architecture
- Features
- Lessons learned
- Improvements
- Portfolio value

## shared

Contains knowledge that is useful across multiple semesters.

Examples:

- HTML
- CSS
- JavaScript
- Git
- GitHub
- Node.js
- APIs
- JSON
- UX principles
- Accessibility
- Design systems

## Rules

StudyMate AI should:

- Read knowledge from this folder when it is relevant.
- Never modify these files unless explicitly instructed.
- Prefer summarizing knowledge rather than copying large amounts of text.
- Never expose private information.
- Never include API keys, passwords, or secrets.

## Assistant Integration

The assistants should use this knowledge when appropriate.

### Study Coach

- Learning progress
- Semester knowledge
- Future study recommendations

### Coding Mentor

- Coding experience
- Projects
- Technologies
- Skill progression

### Design Critic

- Figma knowledge
- UX methods
- Previous design decisions

### UX Researcher

- User testing
- Personas
- Interviews
- User journeys

### Exam Coach

- Previous exams
- Reflection
- Project explanations
- Common exam questions

### Project Manager

- Project documentation
- Planning
- Workflow
- Portfolio development

## Source of Truth

This folder is the primary source of personal knowledge for StudyMate AI.

Whenever new semesters, projects, or learning experiences are added, they should be documented here before being integrated into the AI.

This ensures that StudyMate AI grows together with my education and development as a Multimedia Design student and future Software Engineer.
