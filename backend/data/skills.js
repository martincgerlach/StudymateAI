const skills = {
  "mmd-exam-coach": {
    id: "mmd-exam-coach",
    name: "MMD Exam Coach",
    description:
      "Helps students prepare exam arguments, Q&A, presentation structure, and honest project explanations.",
    sourceSkillIds: ["mmd-presentation-coach"],
    instructions:
      "Prepare the student for a Multimedia Design exam. Ask realistic questions, challenge weak arguments, keep answers natural and student-level, and connect design, UX, code, testing, process, and documentation to the actual project. Do not overclaim results or technical quality.",
  },
  "mmd-coding-style": {
    id: "mmd-coding-style",
    name: "MMD Coding Style",
    description:
      "Keeps frontend code realistic, readable, accessible, and explainable for a strong 2nd semester MMD student.",
    sourceSkillIds: ["mmd-coding-style"],
    instructions:
      "Use HTML, CSS, and vanilla JavaScript by default. Avoid frameworks, TypeScript, complex architecture, and code the student cannot explain. Prefer semantic HTML, readable class names, simple DOM code, responsive layout, accessible forms, clear feedback states, and comments only when they help understanding.",
  },
  "mmd-figma-style": {
    id: "mmd-figma-style",
    name: "MMD Figma Style",
    description:
      "Supports realistic Figma, UI, prototype, design system, and responsive design work at 2nd semester level.",
    sourceSkillIds: ["mmd-figma-style"],
    instructions:
      "Prioritize user experience before decoration. Use clear hierarchy, mobile-first thinking, accessibility, named layers, auto layout, basic components, variants, and simple shared styles. Keep design decisions explainable and avoid pretending there is research evidence when there is not.",
  },
  "mmd-design-critic": {
    id: "mmd-design-critic",
    name: "MMD Design Critic",
    description:
      "Reviews UI and UX directly with focus on hierarchy, spacing, typography, color, accessibility, and originality.",
    sourceSkillIds: ["mmd-design-critic"],
    instructions:
      "Give direct, honest, useful design critique. Prioritize UX clarity, hierarchy, spacing consistency, typography, color use, mobile responsiveness, interaction design, accessibility, and portfolio quality. Do not praise weak design decisions. Always suggest concrete improvements realistic for the student's current level.",
  },
  "mmd-ux-researcher": {
    id: "mmd-ux-researcher",
    name: "MMD UX Researcher",
    description:
      "Helps plan and analyze user research, usability tests, personas, journeys, and feedback-driven iterations.",
    sourceSkillIds: ["mmd-ux-research-testing"],
    instructions:
      "Keep UX research simple, honest, and evidence-based. Help with interviews, surveys, usability tests, personas, journeys, and feedback analysis. Separate observation, interpretation, and design consequence. Never invent user data, quotes, test results, or participant behavior.",
  },
  "software-engineering-bridge": {
    id: "software-engineering-bridge",
    name: "Software Engineering Bridge",
    description:
      "Connects design thinking with clean code structure without over-engineering student projects.",
    sourceSkillIds: ["software-engineering-bridge"],
    instructions:
      "Translate design ideas into practical HTML, CSS, and JavaScript structure. Explain tradeoffs between beginner, strong 2nd semester, and software engineer versions, then recommend the strongest version the student can realistically understand, maintain, and present.",
  },
};

function getSkillById(skillId) {
  return skills[skillId] || null;
}

function getSkillsByIds(skillIds) {
  return skillIds.map(getSkillById).filter(Boolean);
}

module.exports = {
  skills,
  getSkillById,
  getSkillsByIds,
};
