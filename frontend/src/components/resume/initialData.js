export const initialData = {
  name: "ANISH PATANKAR",
  email: "anishpatankar974@gmail.com",
  phone: "+91 8208795203",
  location: "Nagpur, Maharashtra, India",
  linkedin: "https://linkedin.com",
  github: "https://github.com",
  summary: "",
  education: [
    {
      college: "Shri Ramdeobaba College of Engineering and Management",
      degree: "B.Tech in Computer Science and Engineering (AI & ML)",
      cgpa: "7.55",
      year: "2022 – 2026",
      location: "Nagpur, India",
    },
  ],
  schooling: {
    class12: {
      institution: "Shankarrao Bande Arts and Science College, Warud",
      score: "80.67%",
      year: "2022",
      stream: "HSC",
    },
    class10: {
      institution: "NTR High School, Warud",
      score: "97.20%",
      year: "2020",
      stream: "SSC",
    },
  },
  skills: `Languages: Python, JavaScript, TypeScript, SQL, C, HTML, CSS
Frontend: React.js, Next.js (App Router), Tailwind CSS, Three.js, WebGL, WebAssembly, Electron, Tauri
Backend & APIs: Node.js, Express.js, FastAPI, Flask, REST APIs, WebSockets, MQTT, MAVLink, Microservices, JWT & OAuth
AI & Machine Learning: PyTorch, Scikit-learn, PennyLane (Quantum ML), Deep Learning, CNNs, NumPy, Pandas, LLM APIs (Gemini, Claude), Prompt Engineering
Databases & DevOps: PostgreSQL, MongoDB, Prisma ORM, Supabase, Docker, Vercel (Serverless & Edge), CI/CD, Git, GitHub, Postman, Linux`,
  experience: [
    {
      company: "BERAM Pvt. Ltd.",
      role: "Co-Founder and Software Lead",
      duration: "Jun 2025 – Present",
      location: "Nagpur, India",
      description: `• Architect a multi-drone Unmanned Traffic Management System (UTMS) in React, Node.js, Python and MongoDB, coordinating up to 100 vehicles per operator from a single console; lead a cross-functional ML and full-stack team.
• Built a real-time 2Hz telemetry pipeline over WebSockets and QoS-1 MQTT, with a 5s TTL fleet-status cache that absorbs repeat dashboard polls without hitting the database.
• Developed a MAVLink command gateway with a 30s staleness guard that rejects expired commands during cellular dropouts, preventing unsafe out-of-order actuation.`,
    },
  ],
  projects: [
    {
      name: "DroSky",
      subtitle: "3D Multiplayer Drone Racing Game",
      techStack: "Three.js, WebGL, Electron, Node.js, WebSockets",
      timeline: "Jul 2026",
      github: "https://github.com",
      description: `• Built a 3D drone racer in Three.js with no game engine — 4 maps × 20 levels, moving hazards, timed runs and gamepad support — shipped as a web build and an Electron desktop installer.
• Implemented 6-player real-time multiplayer over a Node/ws relay with room codes and client-side state interpolation, plus a procedural Web Audio synth using zero audio assets.`,
    },
    {
      name: "LimitUp.AI",
      subtitle: "AI Gamified Self-Improvement App",
      techStack: "React, Node.js, Gemini API, Prisma, PostgreSQL",
      timeline: "Feb 2026",
      github: "https://github.com",
      description: `• Created a habit-tracking RPG with a 20-level progression system, 225 quest templates and Twilio-based automated voice coaching calls with ElevenLabs speech synthesis.
• Integrated the Google Gemini API into a context-aware feedback engine with 3 adaptive coaching personas conditioned on each user's streak and completion history.`,
    },
    {
      name: "Praxis",
      subtitle: "Interactive Coding Practice Platform",
      techStack: "Next.js, TypeScript, Monaco Editor, Pyodide, Prisma",
      timeline: "Nov 2025",
      github: "https://github.com",
      description: `• Built a learn-by-doing platform where users write real HTML, CSS, JS and Python in an embedded Monaco editor, executed client-side via sandboxed iframes and Pyodide (WebAssembly) for zero server compute cost.
• Built a per-test-case hint engine that pinpoints the first failing check, backed by Prisma/PostgreSQL progress tracking, NextAuth login and Cashfree subscription billing.`,
    },
    {
      name: "DocFlow",
      subtitle: "Browser-Based PDF Editor",
      techStack: "Next.js, TypeScript, pdf-lib, FastAPI, Docker",
      timeline: "Aug 2025",
      github: "https://github.com",
      description: `• Built a PDF editor keeping annotation, signing and page reordering fully client-side with pdf-lib and pdf.js, so ordinary edits never leave the browser; OCR and true redaction route to a self-hosted OCRmyPDF/PyMuPDF sidecar.`,
    },
  ],
  customSections: [
    {
      id: "sec-1",
      title: "Certifications",
      content: `Generative AI Engineering with LLMs | IBM (2025) | DevOps, DataOps, MLOps | Duke University (2025)
AWS Cloud Technical Essentials | AWS (2023) | Programming in Python | Meta (2023)`,
    },
  ],
};
