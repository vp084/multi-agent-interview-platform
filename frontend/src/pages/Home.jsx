import { useState } from "react";
import { motion } from "motion/react";
import { FaArrowRight } from "react-icons/fa";
import {
  FiFileText,
  FiMic,
  FiBarChart2,
  FiMap,
  FiCheckCircle,
  FiZap,
  FiTrendingUp,
  FiCpu,
  FiCheck,
  FiXCircle,
  FiAward,
} from "react-icons/fi";
import LoginModel from "../components/LoginModel.jsx";
import BrandLogo from "../components/BrandLogo.jsx";
import { ThemeToggle } from "../context/ThemeContext.jsx";

/* ─── DATA ─────────────────────────────────────────────── */
const agents = [
  {
    num: "01",
    icon: <FiFileText size={18} />,
    title: "ATS Resume Builder",
    tagline: "Recruiter-Grade Formatting",
    description:
      "Craft ATS-optimized single-column resumes with real-time scoring, keyword matching, and print-ready A4 export.",
    accent: "var(--emerald)",
    accentBg: "var(--emerald-bg)",
    badge: "ATS Schema",
  },
  {
    num: "02",
    icon: <FiMic size={18} />,
    title: "Mock Interview Studio",
    tagline: "Realistic Voice Rounds",
    description:
      "Simulate technical, HR, and system design rounds with responsive voice interviewers and instant feedback.",
    accent: "var(--blue)",
    accentBg: "var(--blue-bg)",
    badge: "Voice & Code",
  },
  {
    num: "03",
    icon: <FiBarChart2 size={18} />,
    title: "Intelligence & Scoring",
    tagline: "Performance Diagnostics",
    description:
      "Get answer analytics, strengths & weaknesses diagnostics, and actionable career improvements.",
    accent: "var(--sienna)",
    accentBg: "var(--amber-bg)",
    badge: "Diagnostics",
  },
  {
    num: "04",
    icon: <FiMap size={18} />,
    title: "Engineering Roadmap",
    tagline: "Tailored Milestones",
    description:
      "Generate custom milestone roadmaps mapped directly to your target engineering roles and skill gaps.",
    accent: "var(--indigo)",
    accentBg: "var(--indigo-bg)",
    badge: "Milestones",
  },
];

const capabilities = [
  {
    tag: "ATS Schema",
    title: "Linear Hierarchy",
    desc: "Single-column A4 structure parsed cleanly by Greenhouse, Workday & Lever",
    icon: <FiFileText size={16} />,
    accent: "var(--emerald)",
    accentBg: "var(--emerald-bg)",
  },
  {
    tag: "Dual-Domain",
    title: "Software & Hardware",
    desc: "Calibrated for Embedded, VLSI, Firmware, and Cloud SWE roles",
    icon: <FiCpu size={16} />,
    accent: "var(--indigo)",
    accentBg: "var(--indigo-bg)",
  },
  {
    tag: "Simulation",
    title: "Live Voice & Monaco",
    desc: "Real-time speech recognition combined with a live code workspace",
    icon: <FiMic size={16} />,
    accent: "var(--blue)",
    accentBg: "var(--blue-bg)",
  },
  {
    tag: "Evaluation",
    title: "StateGraph Diagnostics",
    desc: "Multi-turn interview routing and granular rubric scoring diagnostics",
    icon: <FiZap size={16} />,
    accent: "var(--sienna)",
    accentBg: "var(--amber-bg)",
  },
];

const TRACK_DIAGNOSTICS = {
  distributed: {
    title: "Distributed Systems & Cloud",
    level: "Targeting Staff / Senior (L5/E5)",
    benchmark: "Calibrated to Google L5 & Meta E5 Hiring Bars",
    scores: [
      { label: "System Architecture & Scalability", score: 94, accent: "var(--emerald)" },
      { label: "Concurrency & Distributed State", score: 91, accent: "var(--blue)" },
      { label: "Algorithmic Depth & Optimization", score: 89, accent: "var(--indigo)" },
      { label: "Production Trade-off Communication", score: 95, accent: "var(--sienna)" },
    ],
    strengths: ["Strong failure recovery design", "Explicit p99 latency budgeting", "Clean partition tolerance reasoning"],
    nextFocus: "Deepen zero-copy serialization trade-offs (Protobuf vs FlatBuffers)",
  },
  embedded: {
    title: "Embedded & Firmware Systems",
    level: "Targeting Systems SWE / Firmware Lead",
    benchmark: "Calibrated to Apple & Tesla Systems Engineering Bars",
    scores: [
      { label: "RTOS & Interrupt Handling", score: 96, accent: "var(--emerald)" },
      { label: "Memory Constraints & Cache Locality", score: 92, accent: "var(--blue)" },
      { label: "Hardware Bus Protocols (CAN / I2C / SPI)", score: 95, accent: "var(--indigo)" },
      { label: "Power & Thermal Budget Allocation", score: 90, accent: "var(--sienna)" },
    ],
    strengths: ["Direct memory alignment precision", "Deterministic ISR timing", "Hardware peripheral orchestration"],
    nextFocus: "Practice DMA buffer ring management under saturation",
  },
  fullstack: {
    title: "Full-Stack Web Systems",
    level: "Targeting Senior SWE (L4/L5)",
    benchmark: "Calibrated to Stripe & Vercel Core Engineering Bars",
    scores: [
      { label: "Component Architecture & Hydration", score: 93, accent: "var(--emerald)" },
      { label: "API Contracts & State Machine Logic", score: 90, accent: "var(--blue)" },
      { label: "End-to-End Resilience & Testing", score: 88, accent: "var(--indigo)" },
      { label: "Core Web Vitals & Latency Profiling", score: 94, accent: "var(--sienna)" },
    ],
    strengths: ["Predictable state hydration", "Optimistic mutation rollback", "Accessibility & bundle chunking"],
    nextFocus: "Edge middleware caching patterns & stale-while-revalidate tuning",
  },
};

const SAMPLE_BULLETS = [
  {
    role: "Backend Microservices",
    weak: "Helped build backend APIs with Node.js and fixed database query bugs.",
    weakScore: 38,
    optimized: "Architected event-driven Node.js microservices processing 4.2M daily queries, reducing p99 database latency by 38%.",
    optimizedScore: 96,
    metrics: ["4.2M daily queries", "38% latency reduction", "Event-driven architecture"],
  },
  {
    role: "Database & Caching",
    weak: "Worked with PostgreSQL and Redis to make queries run faster.",
    weakScore: 42,
    optimized: "Engineered distributed Redis caching cluster over PostgreSQL shards, boosting cache-hit ratio to 94.2% across 80k peak QPS.",
    optimizedScore: 97,
    metrics: ["94.2% cache-hit ratio", "80k peak QPS", "Distributed Redis cluster"],
  },
  {
    role: "CI/CD & Cloud Infrastructure",
    weak: "Managed Docker containers and helped deploy software to AWS.",
    weakScore: 40,
    optimized: "Automated multi-region Docker CI/CD pipelines on AWS EKS, slashing deployment cycle times from 45 mins to 6 mins with zero downtime.",
    optimizedScore: 95,
    metrics: ["Slashing deploy time 45m -> 6m", "Multi-region AWS EKS", "Zero-downtime rollouts"],
  },
];

/* ─── COMPONENT ─────────────────────────────────────────── */
function Home({ setUser }) {
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState("preview");
  const [selectedTrack, setSelectedTrack] = useState("distributed");
  const [activeBulletIndex, setActiveBulletIndex] = useState(0);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "var(--parchment)", color: "var(--ink)" }}
    >
      {/* ── NAVBAR ─────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          height: 64,
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--rule)",
        }}
      >
        <BrandLogo size="md" />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ThemeToggle showLabel={true} />
          <button
            className="btn-primary"
            style={{ padding: "9px 22px", fontSize: 13, borderRadius: 12 }}
            onClick={() => setShowLogin(true)}
          >
            Get Started <FaArrowRight size={10} />
          </button>
        </div>
      </motion.nav>

      {/* ── HERO ───────────────────────────────────────── */}
      <section
        style={{
          paddingTop: 110,
          paddingBottom: 0,
          borderBottom: "1px solid var(--rule)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient radial glow */}
        <div className="ambient-glow" />

        {/* Structural grid faint overlay */}
        <div
          className="grid-overlay"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.25,
            pointerEvents: "none",
            zIndex: 0,
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 1 }}>
          {/* Section label row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 32,
            }}
          >
            <span className="label-caps">ApexPath AI</span>
            <div className="h-rule" style={{ flex: 1 }} />
            <span className="label-caps">Autonomous Career Agent & Technical Studio</span>
          </div>

          {/* Asymmetric split: big headline left, badge stack right */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 48, alignItems: "end", paddingBottom: 60 }}>
            {/* Left: headline */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05 }}
                style={{
                  fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
                  fontSize: "clamp(50px, 6.8vw, 92px)",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: "-0.03em",
                  marginBottom: 24,
                  color: "var(--ink)",
                }}
              >
                Job Interviews{" "}
                <span className="gradient-text">
                  Don't Have To Suck
                </span>{" "}
                Any More
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.18 }}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "var(--stone)",
                  maxWidth: 520,
                  marginBottom: 36,
                }}
              >
                Build recruiter-ready ATS resumes, master technical rounds with interactive mock interviews, and accelerate your engineering career.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.28 }}
                style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
              >
                <button className="btn-primary" onClick={() => setShowLogin(true)}>
                  Build ATS Resume Free <FaArrowRight size={11} />
                </button>
                <button className="btn-ghost" onClick={() => setShowLogin(true)}>
                  <FiZap size={13} /> Score Your Resume
                </button>
              </motion.div>
            </div>

            {/* Right: stacked stat badges — editorial sidebar feel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.35 }}
              style={{ display: "flex", flexDirection: "column", gap: 0, alignSelf: "end" }}
            >
              {[
                { label: "ATS Architecture", value: "Standardized", sub: "Single-column A4 parsing schema", accent: "var(--emerald)", icon: <FiCheck size={16} color="var(--emerald)" /> },
                { label: "Engineering Domains", value: "SW & Hardware", sub: "Embedded, VLSI & Full-Stack", accent: "var(--indigo)", icon: <FiCpu size={16} color="var(--indigo)" /> },
                { label: "Interview Engine", value: "Interactive", sub: "Live Voice + Monaco Code IDE", accent: "var(--blue)", icon: <FiMic size={16} color="var(--blue)" /> },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    borderTop: i === 0 ? "2px solid var(--ink)" : "1px solid var(--rule)",
                    borderLeft: `3px solid ${s.accent}`,
                    padding: "16px 20px",
                    background: "var(--white)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: i === 2 ? "2px solid var(--ink)" : undefined,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <div>
                    <span className="label-caps" style={{ display: "block", marginBottom: 3, color: s.accent }}>{s.label}</span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, display: "block", color: "var(--ink)" }}>{s.value}</span>
                    <span style={{ fontSize: 11, color: "var(--stone)", fontFamily: "'Space Grotesk', sans-serif" }}>{s.sub}</span>
                  </div>
                  <div style={{ width: 32, height: 32, border: "1px solid var(--rule)", background: "var(--parchment)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {s.icon}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ATS Demo Strip — full-width editorial card at bottom of hero */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            style={{
              border: "2px solid var(--ink)",
              borderBottom: "none",
              background: "var(--white)",
              overflow: "hidden",
            }}
          >
            {/* Tab bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid var(--rule)",
                padding: "0 20px",
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  color: "var(--stone)",
                  marginRight: "auto",
                  padding: "12px 0",
                }}
              >
                apexpath.com/dashboard
              </span>
              {[
                { key: "preview", label: "ATS Live Scanner" },
                { key: "diagnostics", label: "Executive Diagnostics" },
                { key: "optimizer", label: "Bullet Optimizer Sandbox" },
              ].map((t) => {
                const active = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      padding: "12px 18px",
                      cursor: "pointer",
                      background: active ? "var(--ink)" : "transparent",
                      color: active ? "var(--white)" : "var(--stone)",
                      border: "none",
                      borderLeft: "1px solid var(--rule)",
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Scanner Body */}
            {activeTab === "preview" ? (
              <div style={{ position: "relative", padding: "28px 28px 28px", overflow: "hidden" }}>
                {/* Scan line animation */}
                <div
                  className="animate-scan-line"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 1,
                    background: "var(--sienna)",
                    opacity: 0.7,
                    boxShadow: "0 0 12px rgba(196,84,29,0.5)",
                    pointerEvents: "none",
                    zIndex: 5,
                  }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {/* Resume preview */}
                  <div style={{ border: "1px solid var(--rule)", padding: "20px 22px", background: "var(--parchment)" }}>
                    <div style={{ borderBottom: "1px solid var(--rule)", paddingBottom: 12, marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, margin: 0 }}>Alex Mercer</h4>
                        <p style={{ fontSize: 10, color: "var(--stone)", margin: "4px 0 0", fontFamily: "'Space Grotesk', sans-serif" }}>
                          Senior Full-Stack Engineer • San Francisco, CA • alex.mercer@dev.io
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: "monospace",
                          fontWeight: 700,
                          background: "var(--ink)",
                          color: "var(--white)",
                          padding: "3px 8px",
                          letterSpacing: "0.1em",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <FiCheck size={9} /> ATS PARSED
                      </span>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                      <span className="label-caps" style={{ display: "block", marginBottom: 6 }}>Technical Core</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {["TypeScript", "React 19", "Node.js", "Redis", "PostgreSQL", "Docker", "AWS"].map((tag, idx) => (
                          <span key={idx} style={{ fontSize: 9, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, border: "1px solid var(--stone-lt)", padding: "2px 7px", background: "var(--cream)", color: "var(--ink)" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="label-caps" style={{ display: "block", marginBottom: 6 }}>High Impact Experience</span>
                      <p style={{ fontSize: 10, color: "var(--stone)", lineHeight: 1.6, margin: "0 0 4px", fontFamily: "'Space Grotesk', sans-serif" }}>
                        • Architected event-driven microservices reducing latency by <strong style={{ color: "var(--sienna)" }}>38%</strong> across 4.2M daily queries.
                      </p>
                      <p style={{ fontSize: 10, color: "var(--stone)", lineHeight: 1.6, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                        • Led migration of legacy monolith to containerized clusters with <strong style={{ color: "var(--ink)" }}>99.98%</strong> uptime.
                      </p>
                    </div>
                  </div>

                  {/* Metrics column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ border: "1px solid var(--rule)", padding: "14px 16px", background: "var(--white)", borderLeft: "3px solid var(--emerald)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <span className="label-caps">Format Health Check</span>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700, color: "var(--emerald)", background: "var(--emerald-bg)", padding: "3px 8px", border: "1px solid var(--emerald)" }}>
                          COMPLIANT
                        </span>
                      </div>
                      {/* Progress bar — structural, emerald */}
                      <div style={{ height: 3, background: "var(--cream)", position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "100%", background: "var(--emerald)" }} />
                      </div>
                      <p style={{ fontSize: 9, color: "var(--stone)", marginTop: 8, display: "flex", alignItems: "center", gap: 4, fontFamily: "'Space Grotesk', sans-serif" }}>
                        <FiCheckCircle size={9} color="var(--emerald)" /> Verified single-column linear layout
                      </p>
                    </div>

                    <div style={{ border: "1px solid var(--rule)", padding: "14px 16px", background: "var(--white)" }}>
                      <span className="label-caps" style={{ display: "block", marginBottom: 10 }}>Parser Rules Matrix</span>
                      {[
                        ["Single Column Layout", "Verified"],
                        ["Technical Term Lexicon", "Calibrated"],
                        ["Standard A4 Print Margins", "Compliant"],
                        ["No Multi-Column Tables", "Passed"],
                      ].map(([label, val], i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < 3 ? 6 : 0, marginBottom: i < 3 ? 6 : 0, borderBottom: i < 3 ? "1px solid var(--rule)" : "none" }}>
                          <span style={{ fontSize: 10, display: "flex", alignItems: "center", gap: 6, fontFamily: "'Space Grotesk', sans-serif", color: "var(--ink)" }}>
                            <FiCheck size={10} color="var(--emerald)" /> {label}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "var(--emerald)" }}>{val}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      className="btn-primary"
                      onClick={() => setShowLogin(true)}
                      style={{ width: "100%", justifyContent: "center", gap: 8 }}
                    >
                      Run Free Instant Scan
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === "diagnostics" ? (
              <div style={{ padding: "24px 28px", background: "var(--white)" }}>
                {/* Track Selector */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--rule)" }}>
                  <div>
                    <span className="label-caps" style={{ color: "var(--sienna)", display: "block", marginBottom: 2 }}>Candidate Calibration Suite</span>
                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                      {TRACK_DIAGNOSTICS[selectedTrack].title}
                    </h3>
                    <span style={{ fontSize: 11, color: "var(--stone)", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {TRACK_DIAGNOSTICS[selectedTrack].benchmark}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6, background: "var(--parchment)", padding: 3, border: "1px solid var(--rule)" }}>
                    {[
                      { id: "distributed", label: "Distributed (L5)" },
                      { id: "embedded", label: "Firmware (L5)" },
                      { id: "fullstack", label: "Full-Stack (L4+)" },
                    ].map((tr) => (
                      <button
                        key={tr.id}
                        onClick={() => setSelectedTrack(tr.id)}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: "'Space Grotesk', sans-serif",
                          padding: "6px 12px",
                          border: "none",
                          cursor: "pointer",
                          background: selectedTrack === tr.id ? "var(--ink)" : "transparent",
                          color: selectedTrack === tr.id ? "var(--white)" : "var(--stone)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {tr.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
                  {/* Left: Rubric Scores */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <span className="label-caps">Granular Scoring Rubric</span>
                    {TRACK_DIAGNOSTICS[selectedTrack].scores.map((s, idx) => (
                      <div key={idx} style={{ border: "1px solid var(--rule)", padding: "10px 14px", background: "var(--parchment)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink)", fontFamily: "'Space Grotesk', sans-serif" }}>{s.label}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: s.accent, fontFamily: "monospace" }}>{s.score}%</span>
                        </div>
                        <div style={{ height: 4, background: "var(--white)", border: "1px solid var(--rule)", overflow: "hidden" }}>
                          <div style={{ width: `${s.score}%`, height: "100%", background: s.accent, transition: "width 0.4s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Right: Diagnostics & Action Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ border: "1px solid var(--rule)", padding: "14px 16px", background: "var(--white)", borderLeft: "3px solid var(--emerald)" }}>
                      <span className="label-caps" style={{ color: "var(--emerald)", display: "block", marginBottom: 8 }}>Demonstrated Strengths</span>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                        {TRACK_DIAGNOSTICS[selectedTrack].strengths.map((str, i) => (
                          <li key={i} style={{ fontSize: 11, color: "var(--stone)", display: "flex", alignItems: "center", gap: 6, fontFamily: "'Space Grotesk', sans-serif" }}>
                            <FiCheck size={11} color="var(--emerald)" /> {str}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ border: "1px solid var(--rule)", padding: "14px 16px", background: "var(--white)", borderLeft: "3px solid var(--sienna)" }}>
                      <span className="label-caps" style={{ color: "var(--sienna)", display: "block", marginBottom: 6 }}>Target Gap to Address</span>
                      <p style={{ fontSize: 11, color: "var(--stone)", margin: 0, lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif" }}>
                        {TRACK_DIAGNOSTICS[selectedTrack].nextFocus}
                      </p>
                    </div>

                    <button className="btn-primary" onClick={() => setShowLogin(true)} style={{ width: "100%", justifyContent: "center", gap: 8 }}>
                      Run Diagnostic Interview <FaArrowRight size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Bullet Optimizer Sandbox */
              <div style={{ padding: "24px 28px", background: "var(--white)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--rule)" }}>
                  <div>
                    <span className="label-caps" style={{ color: "var(--emerald)", display: "block", marginBottom: 2 }}>Interactive Sandbox (No Login Required)</span>
                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, margin: 0, color: "var(--ink)" }}>
                      Live ATS Bullet Optimizer
                    </h3>
                  </div>
                  <div style={{ display: "flex", gap: 6, background: "var(--parchment)", padding: 3, border: "1px solid var(--rule)" }}>
                    {SAMPLE_BULLETS.map((b, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveBulletIndex(idx)}
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          fontFamily: "'Space Grotesk', sans-serif",
                          padding: "6px 12px",
                          border: "none",
                          cursor: "pointer",
                          background: activeBulletIndex === idx ? "var(--ink)" : "transparent",
                          color: activeBulletIndex === idx ? "var(--white)" : "var(--stone)",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {b.role}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 20, alignItems: "stretch" }}>
                  {/* Before */}
                  <div style={{ border: "1px solid var(--rule)", padding: "18px 20px", background: "var(--parchment)", borderLeft: "3px solid var(--sienna)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span className="label-caps" style={{ color: "var(--sienna)" }}>Uncalibrated Bullet</span>
                        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "var(--sienna)", background: "var(--amber-bg)", padding: "2px 6px", border: "1px solid var(--sienna)" }}>
                          ATS Score: {SAMPLE_BULLETS[activeBulletIndex].weakScore}/100
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--stone)", lineHeight: 1.6, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                        "{SAMPLE_BULLETS[activeBulletIndex].weak}"
                      </p>
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--rule)", fontSize: 10, color: "var(--sienna)", display: "flex", alignItems: "center", gap: 5, fontFamily: "'Space Grotesk', sans-serif" }}>
                      <FiXCircle size={11} /> Missing quantified scale, latency & metrics
                    </div>
                  </div>

                  {/* After */}
                  <div style={{ border: "1px solid var(--rule)", padding: "18px 20px", background: "var(--cream)", borderLeft: "3px solid var(--emerald)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span className="label-caps" style={{ color: "var(--emerald)" }}>ATS Calibrated Standard</span>
                        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: "var(--emerald)", background: "var(--emerald-bg)", padding: "2px 6px", border: "1px solid var(--emerald)" }}>
                          ATS Score: {SAMPLE_BULLETS[activeBulletIndex].optimizedScore}/100
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--ink)", lineHeight: 1.6, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                        • {SAMPLE_BULLETS[activeBulletIndex].optimized}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 12 }}>
                        {SAMPLE_BULLETS[activeBulletIndex].metrics.map((m, idx) => (
                          <span key={idx} style={{ fontSize: 9, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, border: "1px solid var(--emerald)", padding: "2px 7px", background: "var(--emerald-bg)", color: "var(--emerald)" }}>
                            ✓ {m}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 10, borderTop: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "var(--emerald)", fontWeight: 600, fontFamily: "'Space Grotesk', sans-serif" }}>
                        Recruiter screening pass rate: 94%+
                      </span>
                      <button className="btn-primary" onClick={() => setShowLogin(true)} style={{ padding: "6px 14px", fontSize: 11 }}>
                        Optimize Full Resume <FaArrowRight size={9} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── ARCHITECTURE & CAPABILITIES STRIP ─────────── */}
      <section style={{ borderBottom: "2px solid var(--ink)", background: "var(--slate-dark)", color: "var(--white)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {capabilities.map((c, i) => (
            <div
              key={i}
              style={{
                padding: "26px 28px",
                borderRight: i < 3 ? "1px solid rgba(255,255,255,0.1)" : "none",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                position: "relative",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.08)",
                    border: `1px solid ${c.accent}`,
                    color: c.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {c.icon}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: c.accent,
                  }}
                >
                  {c.tag}
                </span>
              </div>
              <h4
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--white)",
                  margin: "2px 0 0",
                  lineHeight: 1.25,
                }}
              >
                {c.title}
              </h4>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--stone-lt)",
                  margin: 0,
                  lineHeight: 1.5,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {c.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AGENTS SECTION ────────────────────────────── */}
      <section style={{ borderBottom: "2px solid var(--ink)", background: "var(--parchment)" }}>
        {/* Section header — asymmetric editorial */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 2fr",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <div
            style={{
              padding: "48px 40px",
              borderRight: "1px solid var(--rule)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <span className="section-num">§ 02</span>
            <span className="label-caps" style={{ marginTop: "auto" }}>Preparation Modules</span>
          </div>
          <div style={{ padding: "40px 40px" }}>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "clamp(26px, 3.2vw, 42px)",
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: 12,
              }}
            >
              Specialized Tools for Every Hiring Phase
            </h2>
            <p style={{ fontSize: 13, color: "var(--stone)", lineHeight: 1.6, maxWidth: 520, fontFamily: "'Space Grotesk', sans-serif" }}>
              Engineered modules designed to help you clear automated ATS filters and excel in live technical interviews.
            </p>
          </div>
        </div>

        {/* Agent cards — modern spaced grid layout */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px 60px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {agents.map((agent, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="saas-card"
              style={{
                borderRadius: 18,
                border: "1px solid var(--rule)",
                borderTop: `4px solid ${agent.accent}`,
                padding: "32px 28px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                background: "var(--white)",
                boxShadow: "var(--card-shadow)",
              }}
              whileHover={{ y: -4, boxShadow: `0 16px 36px -10px ${agent.accent}33` }}
              onClick={() => setShowLogin(true)}
            >
              {/* Top row: number + icon */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    color: agent.accent,
                    background: agent.accentBg,
                    padding: "2px 8px",
                    borderRadius: 6,
                    border: `1px solid ${agent.accent}33`,
                  }}
                >
                  {agent.num}
                </span>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: `1px solid ${agent.accent}44`,
                    background: agent.accentBg,
                    color: agent.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  {agent.icon}
                </div>
              </div>

              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  marginBottom: 6,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                {agent.title}
              </h3>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: agent.accent,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  marginBottom: 14,
                  display: "block",
                }}
              >
                {agent.tagline}
              </span>
              <p style={{ fontSize: 13, color: "var(--stone)", lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans', sans-serif", flexGrow: 1 }}>
                {agent.description}
              </p>

              {/* Bottom row */}
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--rule)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  className="saas-badge"
                  style={{
                    background: agent.accentBg,
                    color: agent.accent,
                    borderColor: `${agent.accent}44`,
                  }}
                >
                  <FiCheckCircle size={11} color={agent.accent} /> {agent.badge}
                </span>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--cream)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--stone)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <FaArrowRight size={10} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────── */}
      <section
        style={{
          background: "var(--ink)",
          borderBottom: "1px solid var(--rule)",
          padding: "60px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Structural grid on dark bg */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 48 }}>
            <div>
              <span className="label-caps" style={{ color: "var(--stone-lt)", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <span style={{ display: "inline-block", width: 24, height: 1, background: "var(--sienna)" }} />
                Ready to accelerate your career?
              </span>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(28px, 4vw, 52px)",
                  fontWeight: 900,
                  lineHeight: 1.08,
                  color: "var(--white)",
                  marginBottom: 14,
                }}
              >
                Start Building Your{" "}
                <em style={{ color: "var(--sienna)", fontStyle: "italic" }}>ATS Resume</em>{" "}
                in Seconds
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--stone-lt)",
                  lineHeight: 1.5,
                  maxWidth: 480,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                No credit card required. Generate recruiter-ready resumes, run scans, and prepare for your target software engineering roles today.
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={() => setShowLogin(true)}
              style={{
                background: "var(--sienna)",
                borderColor: "var(--sienna)",
                color: "var(--white)",
                padding: "16px 32px",
                fontSize: 14,
                whiteSpace: "nowrap",
              }}
            >
              Get Started for Free <FaArrowRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer style={{ background: "var(--ink)", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "28px 40px" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <BrandLogo size="sm" />
          <p style={{ fontSize: 11, color: "var(--stone)", fontFamily: "'Space Grotesk', sans-serif" }}>
            © {new Date().getFullYear()} ApexPath. Career Acceleration Platform. All rights reserved.
          </p>
        </div>
      </footer>

      {showLogin && (
        <LoginModel onClose={() => setShowLogin(false)} setUser={setUser} />
      )}
    </div>
  );
}

export default Home;