import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiArrowLeft,
  FiMap,
  FiClock,
  FiCompass,
  FiCheckCircle,
  FiTrash2,
  FiPlus,
  FiLayers,
  FiFolder,
  FiZap,
  FiCpu,
  FiCode,
  FiRefreshCw,
  FiX,
  FiChevronRight,
  FiAward,
} from "react-icons/fi";
import BrandLogo from "../components/BrandLogo";
import ModuleCard from "../components/roadmap/ModuleCard";
import { ThemeToggle } from "../context/ThemeContext";
import {
  generateRoadmap,
  getAllRoadmaps,
  getRoadmapById,
  updateModuleStatus,
  deleteRoadmap,
} from "../apis/roadmap.api";

const PRESET_ROLES = [
  { label: "Full Stack Developer", category: "Software" },
  { label: "Frontend Engineer", category: "Software" },
  { label: "Backend Engineer", category: "Software" },
  { label: "DevOps & Cloud Engineer", category: "Software" },
  { label: "Machine Learning Engineer", category: "Software" },
  { label: "Embedded Systems Engineer", category: "Hardware" },
  { label: "VLSI & Chip Design Engineer", category: "Hardware" },
  { label: "Firmware Engineer", category: "Hardware" },
  { label: "Robotics Engineer", category: "Hardware" },
];

const DURATIONS = [
  { value: "1 Month", desc: "Fast-Track Sprint • 40-60 hrs" },
  { value: "3 Months", desc: "Recommended • 120-160 hrs" },
  { value: "6 Months", desc: "Deep Mastery • 250+ hrs" },
];

const EXPERIENCES = [
  { value: "Fresher", label: "Student / Fresher" },
  { value: "1-3 Yrs", label: "Junior (1-3 yrs)" },
  { value: "3-5 Yrs", label: "Mid-Level (3-5 yrs)" },
  { value: "5+ Yrs", label: "Senior (5+ yrs)" },
];

export default function Roadmap({ user }) {
  const navigate = useNavigate();
  const resume = useSelector((state) => state.resume?.resume);

  // Form states
  const [role, setRole] = useState("Full Stack Developer");
  const [duration, setDuration] = useState("3 Months");
  const [experience, setExperience] = useState("Fresher");
  const [useResume, setUseResume] = useState(Boolean(resume));

  // Data states
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [roadmapsList, setRoadmapsList] = useState([]);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [updatingModuleId, setUpdatingModuleId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [generationStep, setGenerationStep] = useState(0);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingRoadmaps(true);
    const data = await getAllRoadmaps();
    if (data?.success && data.roadmaps) {
      setRoadmapsList(data.roadmaps);
      if (data.roadmaps.length > 0 && !activeRoadmap) {
        setActiveRoadmap(data.roadmaps[0]);
      }
    }
    setLoadingRoadmaps(false);
  };

  // Generation loading step animation
  useEffect(() => {
    let interval;
    if (generating) {
      setGenerationStep(0);
      const steps = [
        "Analyzing target industry standards...",
        "Evaluating candidate background and skill gaps...",
        "Structuring modular curriculum and milestones...",
        "Curating verified video masterclasses and documentation...",
        "Finalizing autonomous engineering roadmap...",
      ];
      interval = setInterval(() => {
        setGenerationStep((prev) => (prev + 1) % steps.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!role.trim()) {
      setErrorMsg("Please enter or select a target engineering role.");
      return;
    }
    setErrorMsg("");
    setGenerating(true);

    const payload = {
      role: role.trim(),
      targetRole: role.trim(),
      duration,
      experience,
      useResume: Boolean(useResume && resume),
      resume: useResume && resume ? resume : {},
    };

    const result = await generateRoadmap(payload);
    setGenerating(false);

    if (result?.success && result.roadmap) {
      setActiveRoadmap(result.roadmap);
      setExpandedIndex(0);
      setHistoryOpen(false);
      // Refresh roadmaps list
      setRoadmapsList((prev) => [result.roadmap, ...prev.filter((r) => r._id !== result.roadmap._id)]);
    } else {
      setErrorMsg(result?.message || "Failed to generate roadmap. Please try again.");
    }
  };

  const handleStatusChange = async (moduleId, newStatus) => {
    if (!activeRoadmap) return;
    setUpdatingModuleId(moduleId);

    // Optimistic update
    const previousRoadmap = { ...activeRoadmap };
    const updatedModules = activeRoadmap.modules.map((m) =>
      m._id === moduleId ? { ...m, status: newStatus } : m
    );
    setActiveRoadmap({ ...activeRoadmap, modules: updatedModules });

    const result = await updateModuleStatus(activeRoadmap._id, moduleId, newStatus);
    setUpdatingModuleId(null);

    if (!result?.success) {
      // Revert if failed
      setActiveRoadmap(previousRoadmap);
    } else {
      // Sync list
      setRoadmapsList((prev) =>
        prev.map((r) => (r._id === activeRoadmap._id ? result.roadmap : r))
      );
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this roadmap?")) return;

    const res = await deleteRoadmap(id);
    if (res?.success) {
      const remaining = roadmapsList.filter((r) => r._id !== id);
      setRoadmapsList(remaining);
      if (activeRoadmap?._id === id) {
        setActiveRoadmap(remaining.length > 0 ? remaining[0] : null);
      }
    }
  };

  // Calculate completed modules
  const totalModules = activeRoadmap?.modules?.length || 0;
  const completedModules =
    activeRoadmap?.modules?.filter((m) => m.status === "completed").length || 0;
  const progressPct =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--parchment)",
        color: "var(--ink)",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* ─────────────────────────────────────────────
          1. TOP NAVIGATION BAR
      ───────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: "var(--nav-bg)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--rule)",
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "var(--white)",
              border: "1px solid var(--rule)",
              borderRadius: 10,
              padding: "7px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "'Space Grotesk', sans-serif",
              color: "var(--ink)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease",
            }}
          >
            <FiArrowLeft size={14} /> Back
          </button>

          <div
            onClick={() => navigate("/dashboard")}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          >
            <BrandLogo size="sm" />
            <span style={{ color: "var(--rule)", fontSize: 12 }}>/</span>
            <span
              className="saas-badge saas-badge-indigo"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Roadmap Architect
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle showLabel={false} />
          {activeRoadmap && (
            <button
              onClick={() => setActiveRoadmap(null)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                padding: "8px 16px",
                borderRadius: 10,
                background: "var(--white)",
                border: "1px solid var(--rule)",
                color: "var(--ink)",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "all 0.15s ease",
              }}
            >
              <FiPlus size={13} /> New Roadmap
            </button>
          )}

          <button
            onClick={() => setHistoryOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              padding: "8px 16px",
              borderRadius: 10,
              background: "var(--white)",
              border: "1px solid var(--rule)",
              color: "var(--ink)",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              position: "relative",
              transition: "all 0.15s ease",
            }}
          >
            <FiFolder size={13} /> Saved Paths
            {roadmapsList.length > 0 && (
              <span
                style={{
                  background: "var(--sienna)",
                  color: "var(--white)",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "1px 7px",
                  borderRadius: 20,
                  marginLeft: 2,
                }}
              >
                {roadmapsList.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────
          2. MAIN CONTENT AREA
      ───────────────────────────────────────────── */}
      <main style={{ paddingTop: 78, paddingBottom: 60, maxWidth: 1100, margin: "0 auto", paddingLeft: 20, paddingRight: 20 }}>
        {/* Error message */}
        {errorMsg && (
          <div
            style={{
              background: "#FEE2E2",
              border: "1px solid #F87171",
              color: "#991B1B",
              padding: "10px 16px",
              marginBottom: 20,
              fontSize: 13,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#991B1B" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* LOADING GENERATION OVERLAY */}
        {generating ? (
          <div
            style={{
              background: "var(--white)",
              border: "1px solid var(--rule)",
              padding: "60px 30px",
              textAlign: "center",
              boxShadow: "var(--card-shadow)",
              marginTop: 20,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                border: "3px solid var(--cream)",
                borderTop: "3px solid var(--sienna)",
                borderRadius: "50%",
                margin: "0 auto 24px",
                animation: "spin 1s linear infinite",
              }}
            />
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 26,
                marginBottom: 10,
              }}
            >
              Synthesizing Engineering Roadmap
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--stone)",
                maxWidth: 480,
                margin: "0 auto 20px",
              }}
            >
              Constructing tailored milestone progression for <strong>{role}</strong> with verified YouTube tutorials and official documentation.
            </p>
            <div
              style={{
                display: "inline-block",
                padding: "6px 14px",
                background: "var(--parchment)",
                border: "1px solid var(--rule)",
                fontSize: 12,
                color: "var(--sienna)",
                fontWeight: 600,
              }}
            >
              <FiZap size={12} style={{ display: "inline", marginRight: 6 }} />
              {[
                "Analyzing target industry standards...",
                "Evaluating candidate background and skill gaps...",
                "Structuring modular curriculum and milestones...",
                "Curating verified video masterclasses and documentation...",
                "Finalizing autonomous engineering roadmap...",
              ][generationStep]}
            </div>
          </div>
        ) : !activeRoadmap ? (
          /* ─────────────────────────────────────────────
              3. GENERATOR FORM (NO ACTIVE ROADMAP)
          ───────────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Header Hero */}
            <div style={{ textAlign: "center", marginBottom: 36, marginTop: 10 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  background: "var(--cream)",
                  border: "1px solid var(--rule)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--sienna)",
                  marginBottom: 12,
                }}
              >
                <FiCompass size={12} /> Autonomous Career Curriculum
              </div>
              <h1
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 34,
                  fontWeight: 700,
                  color: "var(--ink)",
                  margin: "0 0 10px",
                }}
              >
                Engineering Career Roadmap
              </h1>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--stone)",
                  maxWidth: 620,
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}
              >
                Synthesize a comprehensive, week-by-week learning trajectory calibrated to current industry benchmarks, complete with high-yield video masterclasses and official references.
              </p>
            </div>

            {/* Generator Card */}
            <form
              onSubmit={handleGenerate}
              className="saas-card"
              style={{
                borderRadius: 20,
                padding: "36px 32px",
                border: "1px solid var(--rule)",
              }}
            >
              {/* Field 1: Target Role */}
              <div style={{ marginBottom: 28 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--ink)",
                    marginBottom: 10,
                  }}
                >
                  1. Target Engineering Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer, Embedded Systems Engineer, DevOps Engineer"
                  className="saas-input"
                  style={{
                    width: "100%",
                    padding: "13px 16px",
                    fontSize: 14,
                    borderRadius: 12,
                    border: "1px solid var(--rule)",
                    background: "var(--parchment)",
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: "var(--ink)",
                    outline: "none",
                    marginBottom: 14,
                  }}
                />

                {/* Quick Presets */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--stone)", marginRight: 2 }}>
                    Quick presets:
                  </span>
                  {PRESET_ROLES.map((preset) => {
                    const active = role === preset.label;
                    return (
                      <button
                        type="button"
                        key={preset.label}
                        onClick={() => setRole(preset.label)}
                        style={{
                          fontSize: 11,
                          padding: "5px 12px",
                          borderRadius: 20,
                          border: `1px solid ${active ? "var(--indigo)" : "var(--rule)"}`,
                          background: active ? "var(--cream)" : "var(--white)",
                          color: active ? "var(--indigo)" : "var(--ink)",
                          fontWeight: active ? 700 : 500,
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          transition: "all 0.15s ease",
                          boxShadow: active ? "var(--shadow-sm)" : "none",
                        }}
                      >
                        {preset.category === "Hardware" ? (
                          <FiCpu size={11} style={{ opacity: 0.8 }} />
                        ) : (
                          <FiCode size={11} style={{ opacity: 0.8 }} />
                        )}
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 2 & 3: Duration & Experience Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: 24,
                  marginBottom: 28,
                }}
              >
                {/* Duration */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--ink)",
                      marginBottom: 10,
                    }}
                  >
                    2. Planned Duration
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {DURATIONS.map((d) => {
                      const isSel = duration === d.value;
                      return (
                        <div
                          key={d.value}
                          onClick={() => setDuration(d.value)}
                          style={{
                            padding: "12px 16px",
                            borderRadius: "var(--radius-md)",
                            border: `1.5px solid ${isSel ? "var(--accent)" : "var(--rule)"}`,
                            background: isSel ? "var(--cream)" : "var(--white)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.18s ease",
                            boxShadow: isSel ? "var(--shadow-sm)" : "none",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: isSel ? 700 : 500,
                              color: isSel ? "var(--indigo)" : "var(--ink)",
                            }}
                          >
                            {d.value}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--stone)" }}>
                            {d.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--ink)",
                      marginBottom: 10,
                    }}
                  >
                    3. Target Seniority / Experience
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    {EXPERIENCES.map((exp) => {
                      const isSel = experience === exp.value;
                      return (
                        <div
                          key={exp.value}
                          onClick={() => setExperience(exp.value)}
                          style={{
                            padding: "12px 16px",
                            borderRadius: "var(--radius-md)",
                            border: `1.5px solid ${isSel ? "var(--accent)" : "var(--rule)"}`,
                            background: isSel ? "var(--cream)" : "var(--white)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            transition: "all 0.18s ease",
                            boxShadow: isSel ? "var(--shadow-sm)" : "none",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: isSel ? 700 : 500,
                              color: isSel ? "var(--indigo)" : "var(--ink)",
                            }}
                          >
                            {exp.label}
                          </span>
                          {isSel && (
                            <FiCheckCircle size={15} style={{ color: "var(--indigo)" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Field 4: Resume Calibration Toggle */}
              <div
                style={{
                  background: "var(--parchment)",
                  border: "1px solid var(--rule)",
                  borderRadius: 16,
                  padding: "18px 22px",
                  marginBottom: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <FiLayers size={15} style={{ color: "var(--indigo)" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                      Resume Calibration & Skill Gap Analysis
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "var(--stone)", margin: 0, maxWidth: 540, lineHeight: 1.5 }}>
                    When enabled, the system correlates your target role against your existing ATS resume skills and projects to skip what you already know and focus directly on blindspots.
                  </p>
                  {resume ? (
                    <div style={{ fontSize: 11, color: "var(--emerald)", marginTop: 6, fontWeight: 600 }}>
                      ✓ Active profile linked: {resume.personal?.jobTitle || user?.name || "Ready"}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: "var(--stone)", marginTop: 6 }}>
                      (No active resume detected; general curriculum will be generated)
                    </div>
                  )}
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "6px 12px",
                    borderRadius: 20,
                    background: "var(--white)",
                    border: "1px solid var(--rule)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={useResume}
                    onChange={(e) => setUseResume(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "var(--indigo)", cursor: "pointer" }}
                  />
                  Calibrate
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={generating}
                className="btn-primary"
                style={{
                  width: "100%",
                  padding: "15px 24px",
                  borderRadius: "var(--radius-md)",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: "var(--shadow-md)",
                  border: "none",
                }}
              >
                <FiCompass size={17} /> Generate Career Roadmap
              </button>
            </form>
          </motion.div>
        ) : (
          /* ─────────────────────────────────────────────
              4. ACTIVE ROADMAP DETAIL VIEW
          ───────────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Roadmap Banner Header */}
            <div
              className="saas-card"
              style={{
                borderRadius: 20,
                padding: "30px 32px",
                marginBottom: 24,
                border: "1px solid var(--rule)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 16,
                  marginBottom: 22,
                }}
              >
                <div>
                  <div
                    className="saas-badge saas-badge-indigo"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    Target Career Path
                  </div>
                  <h1
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 28,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      margin: "0 0 8px",
                      color: "var(--ink)",
                    }}
                  >
                    {activeRoadmap.targetRole}
                  </h1>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "var(--stone)", display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
                      <FiClock size={13} style={{ color: "var(--indigo)" }} /> {activeRoadmap.duration || "3 Months"}
                    </span>
                    <span style={{ color: "var(--rule)", fontSize: 10 }}>•</span>
                    <span style={{ fontSize: 12, color: "var(--stone)", fontWeight: 500 }}>
                      Level: <strong style={{ color: "var(--ink)" }}>{activeRoadmap.experience || "Fresher"}</strong>
                    </span>
                    <span style={{ color: "var(--rule)", fontSize: 10 }}>•</span>
                    <span style={{ fontSize: 12, color: "var(--stone)", fontWeight: 500 }}>
                      <strong style={{ color: "var(--ink)" }}>{totalModules}</strong> Modules
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setActiveRoadmap(null)}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "8px 16px",
                      borderRadius: 10,
                      background: "var(--white)",
                      border: "1px solid var(--rule)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "var(--ink)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <FiPlus size={13} /> Create Another
                  </button>
                  <button
                    onClick={(e) => handleDelete(activeRoadmap._id, e)}
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "8px 12px",
                      borderRadius: 10,
                      background: "var(--white)",
                      border: "1px solid rgba(220, 38, 38, 0.2)",
                      color: "#DC2626",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      transition: "all 0.15s ease",
                    }}
                    title="Delete Roadmap"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div
                style={{
                  background: "var(--parchment)",
                  border: "1px solid var(--rule)",
                  borderRadius: 14,
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                    Overall Milestone Completion
                  </span>
                  <span
                    className={progressPct === 100 ? "saas-badge saas-badge-emerald" : "saas-badge saas-badge-indigo"}
                    style={{ fontSize: 11, fontWeight: 700 }}
                  >
                    {completedModules} of {totalModules} Modules ({progressPct}%)
                  </span>
                </div>
                <div
                  style={{
                    height: 10,
                    background: "var(--cream)",
                    borderRadius: 10,
                    border: "1px solid var(--rule)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    style={{
                      height: "100%",
                      borderRadius: 10,
                      background:
                        progressPct === 100
                          ? "linear-gradient(90deg, #10B981, #059669)"
                          : "linear-gradient(90deg, #6366F1, #8B5CF6)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Modules Section Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FiLayers size={16} style={{ color: "var(--sienna)" }} />
                Curriculum Modules ({totalModules})
              </h2>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => setExpandedIndex(expandedIndex === -1 ? 0 : -1)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 12,
                    color: "var(--stone)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {expandedIndex === -1 ? "Expand First" : "Collapse All"}
                </button>
              </div>
            </div>

            {/* Modules List */}
            {activeRoadmap.modules && activeRoadmap.modules.length > 0 ? (
              <div>
                {activeRoadmap.modules.map((module, idx) => (
                  <ModuleCard
                    key={module._id || idx}
                    module={module}
                    index={idx}
                    isOpen={expandedIndex === idx}
                    onToggle={() =>
                      setExpandedIndex((prev) => (prev === idx ? -1 : idx))
                    }
                    onStatusChange={(newStatus) =>
                      handleStatusChange(module._id, newStatus)
                    }
                    isUpdating={updatingModuleId === module._id}
                  />
                ))}
              </div>
            ) : (
              <div
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--rule)",
                  padding: 40,
                  textAlign: "center",
                  color: "var(--stone)",
                  fontSize: 13,
                }}
              >
                No modules found in this roadmap.
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* ─────────────────────────────────────────────
          5. SLIDING ROADMAP HISTORY DRAWER
      ───────────────────────────────────────────── */}
      <AnimatePresence>
        {historyOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(2px)",
                zIndex: 50,
              }}
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 240 }}
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                maxWidth: 400,
                background: "var(--white)",
                borderLeft: "1px solid var(--rule)",
                zIndex: 60,
                display: "flex",
                flexDirection: "column",
                boxShadow: "-10px 0 30px rgba(0,0,0,0.1)",
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--rule)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "var(--cream)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FiFolder size={16} style={{ color: "var(--sienna)" }} />
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "var(--ink)",
                    }}
                  >
                    Saved Roadmaps ({roadmapsList.length})
                  </span>
                </div>
                <button
                  onClick={() => setHistoryOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--stone)",
                  }}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                {loadingRoadmaps ? (
                  <div style={{ textAlign: "center", padding: 30, color: "var(--stone)", fontSize: 13 }}>
                    <FiRefreshCw size={18} className="animate-spin" style={{ margin: "0 auto 8px" }} />
                    Loading saved roadmaps...
                  </div>
                ) : roadmapsList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 40, color: "var(--stone)", fontSize: 13 }}>
                    <FiMap size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                    <p style={{ margin: "0 0 12px" }}>No roadmaps saved yet.</p>
                    <button
                      onClick={() => {
                        setActiveRoadmap(null);
                        setHistoryOpen(false);
                      }}
                      className="btn-primary"
                      style={{
                        padding: "8px 16px",
                        fontSize: 12,
                        cursor: "pointer",
                        borderRadius: "var(--radius-sm)",
                        border: "none",
                      }}
                    >
                      Generate Your First Roadmap
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {roadmapsList.map((rm) => {
                      const isSelected = activeRoadmap?._id === rm._id;
                      const done = rm.modules?.filter((m) => m.status === "completed").length || 0;
                      const total = rm.modules?.length || 0;
                      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                      return (
                        <div
                          key={rm._id}
                          onClick={() => {
                            setActiveRoadmap(rm);
                            setExpandedIndex(0);
                            setHistoryOpen(false);
                          }}
                          style={{
                            padding: "14px 16px",
                            border: `1px solid ${isSelected ? "var(--sienna)" : "var(--rule)"}`,
                            background: isSelected ? "var(--cream)" : "var(--white)",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "var(--ink)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                marginBottom: 4,
                              }}
                            >
                              {rm.targetRole}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--stone)" }}>
                              <span>{rm.duration}</span>
                              <span>•</span>
                              <span>{done}/{total} done ({pct}%)</span>
                            </div>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button
                              onClick={(e) => handleDelete(rm._id, e)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--stone)",
                                cursor: "pointer",
                                padding: 4,
                              }}
                              title="Delete"
                            >
                              <FiTrash2 size={13} />
                            </button>
                            <FiChevronRight size={14} style={{ color: "var(--stone)" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              <div style={{ padding: "14px 20px", borderTop: "1px solid var(--rule)", background: "var(--parchment)" }}>
                <button
                  onClick={() => {
                    setActiveRoadmap(null);
                    setHistoryOpen(false);
                  }}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    border: "none",
                  }}
                >
                  <FiPlus size={14} /> New Roadmap
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
