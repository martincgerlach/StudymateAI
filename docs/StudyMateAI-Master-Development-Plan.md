# StudyMate AI – Master Development Plan

> **Note:** This is the master plan for developing StudyMate AI. It is the source of truth for the project and should be followed by Codex before implementing new features.

## 1. Vision

StudyMate AI is a personal AI learning platform that grows together with Martin's education.

The AI should:
- Understand semester knowledge.
- Understand school projects.
- Understand private projects.
- Use assistant-specific skill stacks.
- Use a local Knowledge Base as contextual information.
- Never rely on model training for personalization.

## 2. Development Workflow

StudyMate AI must be developed using an iterative sprint workflow.

Rules:

- One sprint = one clearly defined feature or subsystem.
- Never continue automatically to the next sprint.
- At the end of every sprint:
  1. Summarize the work completed.
  2. Explain why it was implemented.
  3. List changed files.
  4. Explain how to test.
  5. Wait for approval.

## 3. Knowledge Rules

The `knowledge/` folder is the Source of Truth.

Codex must:
- Read knowledge before implementing related features.
- Never reorganize the folder without approval.
- Never overwrite notes.
- Never modify markdown unless instructed.
- Suggest improvements instead of changing files.

## 4. Target Structure

knowledge/
├── README.md
├── source-map.md
├── semester-1/
├── semester-2/
├── school-projects/
├── private-projects/
└── shared/

backend/
└── utils/
    └── knowledgeLoader.js

## 5. Assistant Architecture

User
→ Assistant
→ Skill Stack
→ Knowledge Loader
→ Prompt Builder
→ OpenAI
→ Response

Assistants:
- Study Coach
- Coding Mentor
- Design Critic
- UX Researcher
- Exam Coach
- Project Manager

Skills remain internal and are not separate assistants.

## 6. Sprint Roadmap

### Sprint KB-1
Scan existing projects.
Stop for approval.

### Sprint KB-2
Validate knowledge folder.
Create missing markdown files.
Stop.

### Sprint KB-3
Populate semester-1 themes.
Stop.

### Sprint KB-4
Add personal semester knowledge:
- projects
- exam
- skills
- reflections
Stop.

### Sprint KB-5
Scan approved projects and create knowledge summaries.
Update source-map.md.
Stop.

### Sprint KB-6
Build knowledgeLoader.js.
Support recursive markdown loading.
Use keyword matching and assistant routing.
Stop.

### Sprint KB-7
Merge:
- base instructions
- assistant role
- skill stack
- relevant knowledge
- user message

Stop.

### Sprint KB-8
Frontend:
Show Knowledge Base status.
Show assistant knowledge capability.
Stop.

### Sprint KB-9
Run test scenarios for every assistant.
Document failures and successes.
Stop.

### Sprint KB-10
Documentation:
- README
- architecture
- exam notes
- ux process

Finish with technical review.

## 7. Project Import Rules

Never modify original projects.

Only:
- scan
- summarize
- create markdown
- update source-map

Ignore:
- node_modules
- .git
- dist
- build
- vendor
- .env
- secrets

## 8. Long-Term Goal

StudyMate AI should continue growing through:
- Semester 2
- Semester 3
- Internship
- Top-up
- Certifications
- Private projects
- Portfolio projects

The Knowledge Base should remain scalable and organized for years.
