const assistants = [
  {
    id: "study-coach",
    name: "Study Coach",
    shortDescription: "Helps you understand topics and plan your study work.",
    longDescription:
      "A broad learning assistant that explains difficult topics clearly, helps with study plans, and connects learning to exam expectations.",
    icon: "SC",
    skills: ["mmd-exam-coach", "software-engineering-bridge"],
    exampleQuestions: [
      "Explain what a user journey is in simple words.",
      "Make a study plan for my UX assignment.",
      "Quiz me on basic JavaScript concepts.",
    ],
    bestFor: ["Study plans", "Topic explanations", "Exam connection", "Learning structure"],
    fakeReply:
      "I can help you break the topic into smaller parts, make a simple study plan, and connect it to what you may need to explain at an exam.",
  },
  {
    id: "coding-mentor",
    name: "Coding Mentor",
    shortDescription: "Explains HTML, CSS, JavaScript, APIs, JSON, and bugs.",
    longDescription:
      "Helps with frontend code, Fetch API, JSON, DOM, bugs, and simple architecture while keeping the solution realistic for a strong 2nd semester Multimedia Design student.",
    icon: "CM",
    skills: ["mmd-coding-style", "software-engineering-bridge"],
    exampleQuestions: [
      "Explain fetch step by step.",
      "Why does my event listener not work?",
      "Show me how JSON is used in JavaScript.",
    ],
    bestFor: ["HTML", "CSS", "JavaScript", "APIs", "Debugging"],
    fakeReply:
      "I can explain the code step by step and help you debug HTML, CSS, JavaScript, fetch, JSON, and frontend structure in a way you can explain yourself.",
  },
  {
    id: "design-critic",
    name: "Design Critic",
    shortDescription: "Gives feedback on hierarchy, spacing, color, and accessibility.",
    longDescription:
      "Reviews UI and UX strictly with focus on layout, hierarchy, typography, spacing, colors, accessibility, responsiveness, Figma structure, components, variants, and design systems.",
    icon: "DC",
    skills: ["mmd-figma-style", "mmd-design-critic"],
    exampleQuestions: [
      "Critique my dashboard layout.",
      "What should I check for accessibility?",
      "How can I improve visual hierarchy?",
    ],
    bestFor: ["UI critique", "Figma structure", "Accessibility", "Visual hierarchy", "Design systems"],
    fakeReply:
      "I can give strict but useful feedback on hierarchy, spacing, typography, color, accessibility, responsiveness, and Figma structure.",
  },
  {
    id: "ux-researcher",
    name: "UX Researcher",
    shortDescription: "Helps with personas, interviews, journeys, and feedback.",
    longDescription:
      "Helps with user interviews, surveys, usability tests, personas, user journeys, feedback analysis, UX documentation, and turning findings into design decisions.",
    icon: "UX",
    skills: ["mmd-ux-researcher"],
    exampleQuestions: [
      "Write five interview questions for students.",
      "Help me create a persona.",
      "How do I analyse user test feedback?",
    ],
    bestFor: ["Interviews", "User journeys", "Personas", "Usability tests", "Feedback analysis"],
    fakeReply:
      "I can help you plan interviews, personas, user journeys, usability tests, and turn feedback into honest design decisions.",
  },
  {
    id: "exam-coach",
    name: "Exam Coach",
    shortDescription: "Asks exam-style questions and challenges your arguments.",
    longDescription:
      "Acts like a strict Multimedia Design examiner and challenges design, UX, code, process, documentation, group work, and oral exam arguments.",
    icon: "EX",
    skills: ["mmd-exam-coach", "mmd-coding-style", "mmd-figma-style", "mmd-ux-researcher"],
    exampleQuestions: [
      "Ask me exam questions about mobile first.",
      "Challenge my navigation choice.",
      "What should I say about my user test?",
    ],
    bestFor: ["Exam questions", "Argument practice", "Design decisions", "Code decisions", "Process reflection"],
    fakeReply:
      "I can ask realistic exam questions, challenge weak arguments, and help you explain your design, UX, code, testing, and process choices clearly.",
  },
  {
    id: "project-manager",
    name: "Project Manager",
    shortDescription: "Helps with tasks, deadlines, group work, and project planning.",
    longDescription:
      "Helps plan projects, tasks, deadlines, group work, GitHub workflow, documentation, sprint planning, and exam-ready process explanations.",
    icon: "PM",
    skills: ["software-engineering-bridge", "mmd-exam-coach"],
    exampleQuestions: [
      "Make a simple sprint plan.",
      "Turn my project into a to-do list.",
      "Help me prioritize before deadline.",
    ],
    bestFor: ["To-do lists", "Sprint planning", "Deadlines", "Group work", "Documentation"],
    fakeReply:
      "I can help you organize tasks, deadlines, group roles, documentation, and project priorities in a way that is easy to explain later.",
  },
];

function getAssistantById(assistantId) {
  return assistants.find((assistant) => assistant.id === assistantId) || null;
}

function getPublicAssistants() {
  return assistants.map((assistant) => ({
    id: assistant.id,
    name: assistant.name,
    icon: assistant.icon,
    description: assistant.shortDescription,
    shortDescription: assistant.shortDescription,
    longDescription: assistant.longDescription,
    skills: assistant.skills,
    exampleQuestions: assistant.exampleQuestions,
    bestFor: assistant.bestFor,
  }));
}

module.exports = {
  assistants,
  getAssistantById,
  getPublicAssistants,
};
