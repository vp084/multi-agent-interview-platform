import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import {
  FiUploadCloud,
  FiUser,
  FiAlertCircle,
  FiZap,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowLeft,
  FiFileText,
  FiStar,
  FiCheck,
  FiRefreshCw,
  FiX,
  FiFile,
  FiLayers,
  FiCompass,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import api from "../utils/axios";
import { setResume } from "../redux/resumeSlice";
import BrandLogo from "../components/BrandLogo";
import LoginModel from "../components/LoginModel";
import { ThemeToggle } from "../context/ThemeContext";

const Navbar = ({ label }) => {
  const navigate = useNavigate();
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--rule)",
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
      }}
    >
      <div
        onClick={() => navigate("/dashboard")}
        style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
      >
        <BrandLogo size="sm" />
        <span style={{ color: "var(--rule)", fontSize: 13 }}>/</span>
        <span className="saas-badge saas-badge-indigo" style={{ fontSize: 10 }}>
          {label}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <ThemeToggle showLabel={false} compact={true} />
        <button
          onClick={() => navigate("/dashboard")}
          className="btn-ghost"
          style={{
            padding: "7px 14px",
            fontSize: 12,
            gap: 6,
          }}
        >
          <FiArrowLeft size={14} />
          <span>Dashboard</span>
        </button>
      </div>
    </nav>
  );
};

const ScoreRing = ({ score }) => {
  const barColor =
    score >= 75
      ? "#10B981"
      : score >= 60
      ? "#6366F1"
      : score >= 45
      ? "#F59E0B"
      : "#EF4444";

  const data = [
    {
      name: "score",
      value: score,
      fill: barColor,
    },
  ];

  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <RadialBarChart
        width={140}
        height={140}
        cx={70}
        cy={70}
        innerRadius={50}
        outerRadius={60}
        barSize={10}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar background={{ fill: "var(--cream)" }} dataKey="value" cornerRadius={10} />
      </RadialBarChart>
      <div
        style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 32,
            fontWeight: 800,
            color: "var(--ink)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {score}
        </span>
        <span style={{ fontSize: 11, color: "var(--stone)", fontWeight: 700, marginTop: 3 }}>/ 100</span>
      </div>
    </div>
  );
};

const Tag = ({ text, color = "indigo" }) => {
  const colorStyles = {
    green: "saas-badge-emerald",
    yellow: "saas-badge-amber",
    red: "saas-badge-amber",
    indigo: "saas-badge-indigo",
    blue: "saas-badge-blue",
  };

  const badgeClass = colorStyles[color] || "saas-badge-indigo";

  return (
    <span className={`saas-badge ${badgeClass}`} style={{ fontSize: 12, padding: "5px 12px" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
      {text}
    </span>
  );
};

function Scorer({ user, setUser }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [errorNotice, setErrorNotice] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  const { resume } = useSelector((state) => state.resume);
  const dispatch = useDispatch();

  // Loading animation message rotation
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStep(0);
      const steps = [
        "Ingesting PDF formatting & ATS token stream...",
        "Evaluating single-column layout & heading hierarchies...",
        "Scanning keyword density against recruiter models...",
        "Benchmarking metrics & quantifiable impact points...",
        "Finalizing candidate scorecard & recommendations...",
      ];
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % steps.length);
      }, 2400);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleFileChange = (selected) => {
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setErrorNotice("");
    } else if (selected) {
      setErrorNotice("Please select a standard PDF file.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const uploadResume = async () => {
    if (!file) {
      setErrorNotice("Please select a PDF file first.");
      return;
    }

    if (!user) {
      setShowLogin(true);
      setErrorNotice("Please sign in to upload and evaluate your resume.");
      return;
    }

    try {
      setLoading(true);
      setErrorNotice("");
      const formData = new FormData();
      formData.append("resume", file);

      const response = await api.post("/api/resume/upload", formData);
      if (response.data?.data) {
        dispatch(setResume(response.data.data));
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        setShowLogin(true);
        setErrorNotice("Your session has expired. Please sign in to analyze your resume.");
      } else {
        setErrorNotice(error.response?.data?.message || "Upload failed. Please ensure the backend microservice is active.");
      }
      setLoading(false);
    }
  };

  // Results View
  if (resume) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--parchment)",
          color: "var(--ink)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          position: "relative",
        }}
      >
        <Navbar label="ATS Heuristic Analysis" />

        <section style={{ maxWidth: 980, margin: "0 auto", padding: "88px 24px 60px", display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Header Card */}
          <div
            className="saas-card"
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              background: "var(--white)",
              padding: "24px 28px",
              borderRadius: 18,
            }}
          >
            <div>
              <span className="saas-badge saas-badge-indigo" style={{ marginBottom: 8 }}>
                Profile Verified
              </span>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 24,
                  fontWeight: 800,
                  color: "var(--ink)",
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                {resume?.name || "Candidate Resume"}
              </h2>
            </div>
            <button
              onClick={() => dispatch(setResume(null))}
              className="btn-ghost"
              style={{
                fontSize: 12,
                padding: "9px 16px",
                gap: 8,
                borderRadius: 12,
              }}
            >
              <FiRefreshCw size={13} />
              <span>Analyze Another Resume</span>
            </button>
          </div>

          {/* Primary Score Card */}
          <div
            className="saas-card"
            style={{
              background: "var(--white)",
              borderRadius: 20,
              padding: "32px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 32,
              boxShadow: "var(--card-shadow)",
            }}
          >
            <ScoreRing score={resume?.score || 85} />

            <div style={{ flex: 1, minWidth: 260 }}>
              <span className="saas-badge saas-badge-indigo" style={{ marginBottom: 6 }}>
                Recruiter Screening Diagnostic
              </span>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 26,
                  fontWeight: 800,
                  color: "var(--ink)",
                  margin: "8px 0 12px",
                  letterSpacing: "-0.02em",
                }}
              >
                {resume?.score >= 75
                  ? "Recruiter-Ready (Top Tier)"
                  : resume?.score >= 50
                  ? "Moderate (Needs Keyword Polish)"
                  : "Critical Revisions Required"}
              </h3>
              <div
                className="saas-badge"
                style={{
                  padding: "6px 14px",
                  fontSize: 12,
                  gap: 8,
                }}
              >
                <FiUser size={13} color="var(--indigo)" />
                <span>Target Role: {resume?.suggestedRole || "Full-Stack Software Engineer"}</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, minWidth: 200 }}>
              <div style={{ background: "var(--cream)", borderRadius: 14, border: "1px solid var(--rule)", padding: "14px 18px" }}>
                <span className="saas-badge" style={{ fontSize: 9, padding: "2px 6px" }}>ATS Layout</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--emerald)", display: "block", marginTop: 4 }}>
                  100% Parsed
                </span>
              </div>
              <div style={{ background: "var(--cream)", borderRadius: 14, border: "1px solid var(--rule)", padding: "14px 18px" }}>
                <span className="saas-badge" style={{ fontSize: 9, padding: "2px 6px" }}>Keywords</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--indigo)", display: "block", marginTop: 4 }}>
                  Calibrated
                </span>
              </div>
            </div>
          </div>

          {/* Strengths & Improvements Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
            {/* Strengths */}
            <div
              className="saas-card"
              style={{
                background: "var(--white)",
                borderRadius: 18,
                padding: "26px 28px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, borderBottom: "1px solid var(--rule)", paddingBottom: 14 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: "var(--emerald-bg)",
                    color: "var(--emerald)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FiCheckCircle size={16} />
                </div>
                <h4
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  Profile Strengths
                </h4>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {resume?.strengths?.map((s) => (
                  <Tag key={s} text={s} color="green" />
                ))}
              </div>
            </div>

            {/* Weaknesses / Improvements */}
            <div
              className="saas-card"
              style={{
                background: "var(--white)",
                borderRadius: 18,
                padding: "26px 28px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, borderBottom: "1px solid var(--rule)", paddingBottom: 14 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: "var(--amber-bg)",
                    color: "var(--amber)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FiAlertCircle size={16} />
                </div>
                <h4
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  Areas for Improvement
                </h4>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {resume?.weaknesses?.map((w) => (
                  <Tag key={w} text={w} color="yellow" />
                ))}
              </div>
            </div>
          </div>

          {/* Missing Skills */}
          <div
            className="saas-card"
            style={{
              background: "var(--white)",
              borderRadius: 18,
              padding: "26px 28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-md)",
                  background: "var(--indigo-bg)",
                  color: "var(--indigo)",
                  border: "1px solid var(--rule)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiZap size={16} />
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  Recommended Missing Tech Keywords
                </h4>
                <p style={{ fontSize: 12, color: "var(--stone)", margin: "2px 0 0" }}>
                  Integrate these terms into your skills and project bullets to maximize search visibility.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
              {resume?.missingSkills?.map((skill) => (
                <Tag key={skill} text={skill} color="indigo" />
              ))}
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div
            className="saas-card"
            style={{
              background: "var(--white)",
              borderRadius: 18,
              padding: "26px 28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, borderBottom: "1px solid var(--rule)", paddingBottom: 14 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #4F46E5 0%, #38BDF8 100%)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
                }}
              >
                <FiTrendingUp size={16} />
              </div>
              <h4
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "var(--ink)",
                  margin: 0,
                }}
              >
                Actionable Optimization Steps
              </h4>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {resume?.recommendations?.map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "14px 18px",
                    background: "var(--cream)",
                    borderRadius: 12,
                    border: "1px solid var(--rule)",
                    fontSize: 13,
                    color: "var(--ink)",
                    lineHeight: 1.6,
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: "var(--indigo)",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      fontSize: 11,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <p style={{ margin: 0, fontWeight: 500 }}>{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Upload Screen
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--parchment)",
        color: "var(--ink)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: "relative",
      }}
    >
      <Navbar label="ATS Diagnostic Scanner" />

      {/* Login Modal */}
      {showLogin && <LoginModel setUser={setUser} onClose={() => setShowLogin(false)} />}

      <section
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "90px 20px 48px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          className="saas-card"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            background: "var(--white)",
            borderRadius: 24,
            padding: "40px 36px",
            boxShadow: "var(--card-shadow)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <span className="saas-badge saas-badge-indigo" style={{ marginBottom: 12 }}>
              <FiStar size={12} /> Recruiter Screening Engine
            </span>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 28,
                fontWeight: 800,
                color: "var(--ink)",
                margin: "8px 0 10px",
                letterSpacing: "-0.02em",
              }}
            >
              Scan Your Resume
            </h2>
            <p style={{ color: "var(--stone)", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
              Upload your PDF to run instant ATS compatibility scoring, identify missing technical keywords, and fix layout bottlenecks.
            </p>
          </div>

          {/* Inline Error Notice */}
          {errorNotice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#EF4444",
                fontSize: 12,
                marginBottom: 20,
              }}
            >
              <FiAlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errorNotice}</span>
            </motion.div>
          )}

          {/* Interactive Drag & Drop Area */}
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`dropzone-container ${dragOver ? "is-dragover" : ""}`}
            style={{
              borderColor: file ? "var(--indigo)" : dragOver ? "var(--indigo)" : "var(--rule)",
              background: file ? "var(--indigo-bg)" : dragOver ? "var(--indigo-bg)" : "var(--cream)",
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", padding: "10px 0" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: "3px solid var(--stone-lt)",
                    borderTopColor: "var(--indigo)",
                    animation: "spin 1s linear infinite",
                    marginBottom: 16,
                  }}
                />
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Analyzing ATS Heuristics...
                </span>
                <span style={{ fontSize: 12, color: "var(--stone)", marginTop: 6, minHeight: 18 }}>
                  {loadingStep === 0 && "Parsing PDF formatting & text tokens..."}
                  {loadingStep === 1 && "Evaluating single-column structure & hierarchy..."}
                  {loadingStep === 2 && "Scanning role keywords against industry bars..."}
                  {loadingStep === 3 && "Scoring quantifiable metric bullets..."}
                  {loadingStep === 4 && "Finalizing candidate rubric report..."}
                </span>

                <div
                  className="shimmer-active"
                  style={{
                    width: "80%",
                    height: 6,
                    borderRadius: 9999,
                    background: "var(--stone-lt)",
                    marginTop: 18,
                    overflow: "hidden",
                  }}
                />
              </div>
            ) : file ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--radius-md)",
                    background: "var(--white)",
                    color: "var(--accent)",
                    border: "1px solid var(--rule)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <FiFileText size={26} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--stone)", margin: "4px 0 0" }}>
                    {(file.size / 1024).toFixed(1)} KB • PDF Document Ready
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="saas-badge"
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <FiX size={12} />
                  <span>Remove / Change PDF</span>
                </button>
              </div>
            ) : (
              <>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: "var(--white)",
                    color: "var(--indigo)",
                    border: "1px solid var(--rule)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                  }}
                >
                  <FiUploadCloud size={26} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>
                  Choose PDF or drag & drop here
                </p>
                <p style={{ fontSize: 11, color: "var(--stone)", margin: "6px 0 0" }}>
                  A4 format • Standard text PDF • Up to 20MB
                </p>
              </>
            )}

            <input
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              disabled={loading}
              onChange={(e) => handleFileChange(e.target.files[0])}
            />
          </label>

          {/* Action Button */}
          <button
            disabled={!file || loading}
            onClick={uploadResume}
            className="btn-primary"
            style={{
              marginTop: 24,
              width: "100%",
              justifyContent: "center",
              padding: "13px 20px",
              fontSize: 13,
              borderRadius: 12,
              opacity: !file || loading ? 0.6 : 1,
              cursor: !file || loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span>Evaluating Scorecard...</span>
            ) : (
              <>
                <FiStar size={15} />
                <span>Run Free ATS Diagnostic</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

export default Scorer;