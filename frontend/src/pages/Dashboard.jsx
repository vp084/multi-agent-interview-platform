import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setResume } from "../redux/resumeSlice";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import { motion } from "motion/react";
import {
  FiSidebar,
  FiFileText,
  FiMic,
  FiArrowRight,
  FiTrendingUp,
  FiCheckCircle,
  FiZap,
  FiLayers,
  FiCheck,
  FiCpu,
  FiExternalLink,
  FiStar,
  FiMap,
  FiClock,
  FiAward,
} from "react-icons/fi";
import { GiCoins } from "react-icons/gi";
import Sidebar from "../components/Sidebar";
import api from "../utils/axios";
import { getAllInterviews } from "../apis/interview.api";
import InterviewGraph from "../components/interview/InterviewGraph";
import { ThemeToggle } from "../context/ThemeContext";

function Dashboard({ user, setUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [interviewData, setInterviewData] = useState({
    interviews: [],
    stats: { totalInterviews: 0, totalQuestions: 0, completed: 0, averageScore: 0 },
    technicalData: [],
    hrData: [],
    technicalCount: 0,
    hrCount: 0,
  });
  const [loadingInterviews, setLoadingInterviews] = useState(true);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const resume = useSelector((state) => state.resume?.resume);
  const atsScore = resume?.score ?? null;

  const handleLogout = async () => {
    try {
      await api.get("/api/auth/logout");
    } catch (error) {
      console.error(error);
    } finally {
      try {
        await signOut(auth);
      } catch (e) {}
      dispatch(setResume(null));
      setUser(null);
      navigate("/");
    }
  };

  const handleNewInterview = () => {
    navigate("/interview");
  };

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await getAllInterviews();
        if (res?.success) {
          setInterviewData(res);
        }
      } catch (err) {
        console.error("Error fetching interviews:", err);
      } finally {
        setLoadingInterviews(false);
      }
    };
    if (user) {
      fetchInterviews();
    }
  }, [user]);

  const actionCards = [
    {
      num: "01",
      title: "ATS Resume Builder",
      description:
        "Craft an ATS-optimized engineering resume with real-time multi-step guidance and A4 PDF export.",
      icon: <FiFileText size={18} />,
      badge: "6 Steps • Live Preview",
      path: "/resume",
      actionText: "Launch Builder",
      accent: "var(--emerald)",
      accentBg: "var(--emerald-bg)",
      graphic: (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "8px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ height: 6, width: "50%", background: "var(--emerald)", opacity: 0.8 }} />
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                color: atsScore !== null ? "var(--emerald)" : "var(--stone)",
                border: "1px solid var(--rule)",
                padding: "1px 6px",
                background: "var(--white)",
              }}
            >
              {atsScore !== null ? `ATS ${atsScore}%` : "Not Scanned"}
            </span>
          </div>
          <div style={{ height: 3, width: "100%", background: "var(--rule)" }} />
          <div style={{ height: 3, width: "75%", background: "var(--rule)" }} />
        </div>
      ),
    },
    {
      num: "02",
      title: "ATS Resume Scorer",
      description:
        "Upload and scan your existing resume to unlock deep ATS metrics, strengths, weaknesses, and missing skills.",
      icon: <FiStar size={18} />,
      badge: "ATS Scanner",
      path: "/scorer",
      actionText: "Analyze Resume",
      accent: "var(--sienna)",
      accentBg: "var(--amber-bg)",
      graphic: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                border: "1.5px solid var(--sienna)",
                background: atsScore !== null ? "var(--sienna)" : "var(--stone-lt)",
                color: "var(--white)",
                fontSize: 13,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {atsScore !== null ? atsScore : "--"}
            </div>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", display: "block", lineHeight: 1.2 }}>
                Overall Score
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: atsScore !== null ? "var(--sienna)" : "var(--stone)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {atsScore !== null ? (
                  <><FiCheck size={10} /> Verified Heuristic</>
                ) : (
                  "Upload to Analyze"
                )}
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
              background: atsScore !== null ? "var(--amber-bg)" : "var(--parchment)",
              color: atsScore !== null ? "var(--sienna)" : "var(--stone)",
              padding: "3px 8px",
              border: "1px solid var(--rule)",
            }}
          >
            {atsScore !== null ? "Scan Ready" : "Pending Scan"}
          </span>
        </div>
      ),
    },
    {
      num: "03",
      title: "Mock Interviews",
      description:
        "Simulate technical, HR, and coding rounds with interactive voice interviewers and real-time audio analytics.",
      icon: <FiMic size={18} />,
      badge: "Voice Rounds",
      path: "/interview",
      actionText: "Start Session",
      accent: "var(--blue)",
      accentBg: "var(--blue-bg)",
      graphic: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 0" }}>
          {[12, 22, 14, 28, 16, 24, 18, 10].map((h, idx) => (
            <div
              key={idx}
              style={{
                height: `${h}px`,
                width: 3,
                background: idx % 2 === 0 ? "var(--blue)" : "var(--ink)",
              }}
            />
          ))}
        </div>
      ),
    },
    {
      num: "04",
      title: "Roadmap Builder",
      description:
        "Generate a tailored career milestones roadmap matching your target company and tech stack.",
      icon: <FiMap size={18} />,
      badge: "Career Intelligence",
      path: "/roadmap",
      actionText: "View Roadmap",
      accent: "var(--indigo)",
      accentBg: "var(--indigo-bg)",
      graphic: (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 4px" }}>
          <div style={{ width: 8, height: 8, background: "var(--indigo)" }} />
          <div style={{ height: 1, flex: 1, background: "var(--indigo)", margin: "0 6px" }} />
          <div style={{ width: 8, height: 8, background: "var(--indigo)" }} />
          <div style={{ height: 1, flex: 1, background: "var(--rule)", margin: "0 6px" }} />
          <div style={{ width: 8, height: 8, border: "1px solid var(--stone-lt)", background: "var(--white)" }} />
        </div>
      ),
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "var(--parchment)",
        minHeight: "100vh",
        color: "var(--ink)",
        fontFamily: "'Space Grotesk', sans-serif",
        display: "flex",
        position: "relative",
      }}
    >
      <Sidebar
        user={user}
        onNewInterview={handleNewInterview}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main
        style={{
          flex: 1,
          minHeight: "100vh",
          padding: "24px 20px 48px",
          transition: "margin-left 0.25s ease",
          position: "relative",
          zIndex: 10,
          marginLeft: sidebarOpen ? 260 : 72,
        }}
        className="main-dashboard-container"
      >
        {/* Top Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            paddingBottom: 20,
            borderBottom: "1px solid var(--rule)",
            background: "var(--white)",
            margin: "-24px -20px 32px",
            padding: "16px 28px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden"
              style={{
                color: "var(--ink)",
                cursor: "pointer",
                padding: "6px 8px",
                border: "1px solid var(--rule)",
                background: "var(--white)",
              }}
            >
              <FiSidebar size={16} />
            </button>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--sienna)",
                    border: "1px solid var(--sienna)",
                    padding: "2px 7px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <FiCpu size={10} /> Candidate Workspace
                </span>
                <span style={{ color: "var(--rule)", fontSize: 11 }}>/</span>
                <span style={{ fontSize: 11, color: "var(--stone)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, background: "var(--sienna)", display: "inline-block" }} />
                  ApexPath Engine v2.0 Active
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(22px, 3vw, 28px)",
                  fontWeight: 700,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                Welcome back, {user?.name?.split(" ")?.[0] || "Candidate"} 👋
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle showLabel={false} className="sm:hidden" compact={true} />
            <div className="hidden sm:flex items-center gap-3">
              <ThemeToggle showLabel={true} />
            </div>
            <button
              onClick={() => navigate("/resume")}
              className="btn-primary hidden sm:inline-flex"
              style={{ padding: "10px 18px", fontSize: 12 }}
            >
              <FiFileText size={14} />
              <span>Build ATS Resume</span>
            </button>
          </div>
        </div>

        {/* Executive Metrics Overview Cards */}
        <section style={{ marginBottom: 36 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 18,
            }}
          >
            {/* Metric 1 */}
            <div
              className="saas-card"
              style={{
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 18,
                border: "1px solid var(--rule)",
                background: "var(--white)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span className="saas-badge saas-badge-emerald">ATS Benchmark</span>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    background: "var(--emerald-bg)",
                    color: "var(--emerald)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  <FiTrendingUp size={15} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 36,
                    fontWeight: 800,
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {atsScore !== null ? atsScore : "--"}
                </span>
                <span style={{ fontSize: 13, color: "var(--stone)", fontWeight: 600 }}>/100</span>
              </div>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: "1px solid var(--rule)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--ink)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                  <FiCheckCircle size={14} color={atsScore !== null ? "var(--emerald)" : "var(--stone)"} /> {atsScore !== null ? "Scored Profile" : "Pending Scan"}
                </span>
                <span className="saas-badge" style={{ fontSize: 10, padding: "2px 8px" }}>
                  {atsScore !== null ? "Calibrated" : "No Resume"}
                </span>
              </div>
            </div>

            {/* Metric 2 */}
            <div
              className="saas-card"
              style={{
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 18,
                border: "1px solid var(--rule)",
                background: "var(--white)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span className="saas-badge saas-badge-indigo">Resumes Managed</span>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    border: "1px solid var(--rule)",
                    background: "var(--indigo-bg)",
                    color: "var(--indigo)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <FiLayers size={15} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 36,
                    fontWeight: 800,
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {resume ? "1" : "0"}
                </span>
                <span style={{ fontSize: 13, color: "var(--stone)", fontWeight: 600 }}>Profile</span>
              </div>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: "1px solid var(--rule)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--ink)", fontWeight: 600 }}>A4 ATS Schema</span>
                <span className={`saas-badge ${resume ? "saas-badge-emerald" : ""}`} style={{ fontSize: 10, padding: "2px 8px" }}>
                  {resume ? "Active" : "None"}
                </span>
              </div>
            </div>

            {/* Metric 3 */}
            <div
              className="saas-card"
              style={{
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 18,
                border: "1px solid var(--rule)",
                background: "var(--white)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span className="saas-badge saas-badge-amber">Interview Credits</span>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    background: "var(--amber-bg)",
                    color: "var(--amber)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  <GiCoins size={16} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 36,
                    fontWeight: 800,
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {user?.interviewCoins ?? 150}
                </span>
                <span style={{ fontSize: 13, color: "var(--stone)", fontWeight: 600 }}>Coins</span>
              </div>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: "1px solid var(--rule)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--stone)", fontWeight: 500 }}>3 Simulations Available</span>
                <span className="saas-badge saas-badge-amber" style={{ fontSize: 10, padding: "2px 8px" }}>Active</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div
              className="saas-card"
              style={{
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                borderRadius: 18,
                border: "1px solid var(--rule)",
                background: "var(--white)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span className="saas-badge saas-badge-blue">Target Readiness</span>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    background: "var(--blue-bg)",
                    color: "var(--blue)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 10,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  <FiZap size={15} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 32,
                    fontWeight: 800,
                    color: "var(--ink)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {resume ? "Active" : "Not Set"}
                </span>
                <span style={{ fontSize: 13, color: "var(--stone)", fontWeight: 600 }}>
                  {resume ? "Profile" : "Pending"}
                </span>
              </div>
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: "1px solid var(--rule)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                  {resume ? "Calibrated" : "Build Resume First"}
                </span>
                <span className={`saas-badge ${resume ? "saas-badge-indigo" : ""}`} style={{ fontSize: 10, padding: "2px 8px" }}>
                  {resume ? "Ready" : "Waiting"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Agent Suite Cards */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="label-caps" style={{ color: "var(--sienna)" }}>
              Core Capabilities
            </span>
            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--ink)",
                margin: "4px 0 2px",
              }}
            >
              Career Acceleration Suite
            </h2>
            <p style={{ fontSize: 12, color: "var(--stone)", margin: 0 }}>
              Specialized tools to format, score, and rehearse for engineering roles.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {actionCards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => navigate(card.path)}
                className="saas-card"
                style={{
                  background: "var(--white)",
                  border: "1px solid var(--rule)",
                  borderRadius: 18,
                  boxShadow: "var(--card-shadow)",
                  padding: 24,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = card.accent;
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = `0 16px 36px -10px ${card.accent}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--rule)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "var(--card-shadow)";
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 16,
                      borderBottom: "1px solid var(--cream)",
                      paddingBottom: 14,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          color: card.accent,
                          background: card.accentBg,
                          padding: "2px 8px",
                          borderRadius: 6,
                          border: `1px solid ${card.accent}33`,
                        }}
                      >
                        {card.num}
                      </span>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          border: `1px solid ${card.accent}44`,
                          background: card.accentBg,
                          color: card.accent,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 10,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                        }}
                      >
                        {card.icon}
                      </div>
                    </div>
                    <span
                      className="saas-badge"
                      style={{
                        background: card.accentBg,
                        color: card.accent,
                        borderColor: `${card.accent}44`,
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  {/* Micro Visualizer */}
                  <div
                    style={{
                      background: "var(--cream)",
                      border: "1px solid var(--rule)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      marginBottom: 16,
                    }}
                  >
                    {card.graphic}
                  </div>

                  <h3
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--ink)",
                      marginBottom: 6,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--stone)", lineHeight: 1.6, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {card.description}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: 20,
                    paddingTop: 14,
                    borderTop: "1px solid var(--rule)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {card.actionText}
                  </span>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #4F46E5 0%, #38BDF8 100%)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.35)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <FiArrowRight size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Performance Radar & Interview Intelligence */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span className="label-caps" style={{ color: "var(--blue)" }}>
                Skill Diagnostics & Competency
              </span>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--ink)",
                  margin: "4px 0 2px",
                }}
              >
                Multi-Dimensional Interview Radar
              </h2>
              <p style={{ fontSize: 12, color: "var(--stone)", margin: 0 }}>
                Granular 8-axis rubric scores computed across your technical & behavioral simulations.
              </p>
            </div>
            <button
              onClick={() => navigate("/interview")}
              className="btn-primary"
              style={{ padding: "8px 16px", fontSize: 12 }}
            >
              <FiMic size={13} />
              <span>New Simulation</span>
            </button>
          </div>

          <InterviewGraph
            technicalData={interviewData?.technicalData || []}
            hrData={interviewData?.hrData || []}
            technicalCount={interviewData?.technicalCount || 0}
            hrCount={interviewData?.hrCount || 0}
          />
        </section>

        {/* Recent Mock Interview Sessions List */}
        {interviewData?.interviews?.length > 0 && (
          <section
            className="saas-card"
            style={{
              marginBottom: 40,
              background: "var(--white)",
              border: "1px solid var(--rule)",
              borderRadius: 18,
              padding: "26px 28px",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: "1px solid var(--rule)",
              }}
            >
              <div>
                <span className="saas-badge saas-badge-indigo" style={{ marginBottom: 6 }}>
                  Session History
                </span>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    margin: "4px 0 0",
                    color: "var(--ink)",
                  }}
                >
                  Recent Interview Evaluations
                </h3>
              </div>
              <span className="saas-badge" style={{ fontSize: 11 }}>
                {interviewData.interviews.length} Total Sessions
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {interviewData.interviews.slice(0, 5).map((item, idx) => (
                <div
                  key={item._id || idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    background: "var(--cream)",
                    border: "1px solid var(--rule)",
                    borderRadius: "var(--radius-md)",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--rule)";
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        border: "1px solid var(--rule)",
                        background: "var(--white)",
                        color:
                          item.type === "technical"
                            ? "var(--blue)"
                            : item.type === "mixed"
                            ? "#7c3aed"
                            : "var(--sienna)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 10,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
                      }}
                    >
                      <FiMic size={18} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink)", fontFamily: "'Space Grotesk', sans-serif" }}>
                          {item.role || "Software Engineer"}
                        </span>
                        <span
                          className="saas-badge"
                          style={{
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            padding: "2px 8px",
                            background:
                              item.type === "technical"
                                ? "var(--blue-bg)"
                                : item.type === "mixed"
                                ? "rgba(124, 58, 237, 0.08)"
                                : "var(--amber-bg)",
                            color:
                              item.type === "technical"
                                ? "var(--blue)"
                                : item.type === "mixed"
                                ? "#7c3aed"
                                : "var(--sienna)",
                            borderColor:
                              item.type === "technical"
                                ? "rgba(56, 189, 248, 0.3)"
                                : item.type === "mixed"
                                ? "rgba(124, 58, 237, 0.3)"
                                : "rgba(245, 158, 11, 0.3)",
                          }}
                        >
                          {item.type || "Technical"}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--stone)", display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        <FiClock size={12} /> {new Date(item.createdAt).toLocaleDateString()} • {(() => {
                          const isCompleted = item.status === "completed";
                          const totalMain = item.totalQuestions ?? item.questions?.filter(q => !q.isFollowUp).length ?? item.questions?.length ?? 12;
                          if (isCompleted) {
                            return `${totalMain} Questions`;
                          }
                          const mainSoFar = item.questions
                            ? item.questions.slice(0, (item.currentQuestion ?? 0) + 1).filter(q => !q.isFollowUp).length
                            : ((item.currentQuestion ?? 0) + 1);
                          const displayMain = Math.min(Math.max(mainSoFar, 1), totalMain);
                          return `Question ${displayMain} of ${totalMain}`;
                        })()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: 10, color: "var(--stone)", display: "block", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                        Score
                      </span>
                      <span
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: 18,
                          fontWeight: 800,
                          color: item.status === "completed" ? "var(--emerald)" : "var(--amber)",
                        }}
                      >
                        {item.status === "completed" ? `${item.overallScore ?? 0}%` : "In Progress"}
                      </span>
                    </div>
                    <button
                      onClick={() => navigate(item.status === "completed" ? `/interview/${item._id}/report` : `/interview/${item._id}`)}
                      className={item.status === "completed" ? "btn-ghost" : "btn-primary"}
                      style={{ padding: "8px 16px", fontSize: 12, borderRadius: 10 }}
                    >
                      <span>{item.status === "completed" ? "Report" : "Resume"}</span>
                      <FiExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Live ATS Diagnostics & Readiness Matrix */}
        <section
          className="saas-card"
          style={{
            marginBottom: 40,
            background: "var(--white)",
            border: "1px solid var(--rule)",
            borderRadius: 18,
            padding: "28px 26px",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 24,
              paddingBottom: 16,
              borderBottom: "1px solid var(--rule)",
            }}
          >
            <div>
              <span className="label-caps" style={{ color: "var(--sienna)" }}>
                Live Heuristic Breakdown
              </span>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--ink)",
                  marginTop: 4,
                  margin: 0,
                }}
              >
                Candidate Profile Quality Breakdown
              </h3>
            </div>
            <button
              onClick={() => navigate("/scorer")}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--sienna)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              <span>Scan New Resume PDF</span>
              <FiExternalLink size={12} />
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            <div style={{ padding: 16, background: "var(--parchment)", border: "1px solid var(--rule)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                <span>Keyword Density</span>
                <span style={{ color: "var(--sienna)" }}>96%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "var(--rule)", marginBottom: 10 }}>
                <div style={{ height: "100%", width: "96%", background: "var(--ink)" }} />
              </div>
              <p style={{ fontSize: 11, color: "var(--stone)", margin: 0, lineHeight: 1.4 }}>
                Matched 18 standard full-stack keywords.
              </p>
            </div>

            <div style={{ padding: 16, background: "var(--parchment)", border: "1px solid var(--rule)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                <span>Quantified Metrics</span>
                <span style={{ color: "var(--sienna)" }}>92%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "var(--rule)", marginBottom: 10 }}>
                <div style={{ height: "100%", width: "92%", background: "var(--sienna)" }} />
              </div>
              <p style={{ fontSize: 11, color: "var(--stone)", margin: 0, lineHeight: 1.4 }}>
                High frequency of percentage and latency metrics.
              </p>
            </div>

            <div style={{ padding: 16, background: "var(--parchment)", border: "1px solid var(--rule)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                <span>ATS Parsing Health</span>
                <span style={{ color: "var(--ink)" }}>100%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "var(--rule)", marginBottom: 10 }}>
                <div style={{ height: "100%", width: "100%", background: "var(--ink)" }} />
              </div>
              <p style={{ fontSize: 11, color: "var(--stone)", margin: 0, lineHeight: 1.4 }}>
                Linear semantic layout without table clutter.
              </p>
            </div>

            <div style={{ padding: 16, background: "var(--parchment)", border: "1px solid var(--rule)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                <span>Interview Readiness</span>
                <span style={{ color: "var(--sienna)" }}>85%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "var(--rule)", marginBottom: 10 }}>
                <div style={{ height: "100%", width: "85%", background: "var(--sienna)" }} />
              </div>
              <p style={{ fontSize: 11, color: "var(--stone)", margin: 0, lineHeight: 1.4 }}>
                Ready for System Design & Coding mock rounds.
              </p>
            </div>
          </div>
        </section>

        {/* ATS Intelligence Pro-Tips Banner */}
        <section
          style={{
            background: "var(--white)",
            border: "1px solid var(--rule)",
            padding: "26px",
          }}
        >
          <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--rule)" }}>
            <span className="label-caps" style={{ color: "var(--sienna)" }}>
              PRO TIPS & ATS HEURISTICS
            </span>
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--ink)",
                margin: "4px 0 0",
              }}
            >
              How ApexPath Optimizes Your Profile For Elite Recruiters
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
            }}
          >
            <div style={{ border: "1px solid var(--cream)", background: "var(--parchment)", padding: 18 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  border: "1px solid var(--ink)",
                  background: "var(--ink)",
                  color: "var(--white)",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                1
              </div>
              <span style={{ fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 4, fontSize: 13 }}>
                Single-Column Clean Hierarchy
              </span>
              <p style={{ color: "var(--stone)", fontSize: 11, lineHeight: 1.6, margin: 0 }}>
                Modern ATS bots fail to parse complex multi-column grids or graphical skill meters. ApexPath builds standard linear templates.
              </p>
            </div>

            <div style={{ border: "1px solid var(--cream)", background: "var(--parchment)", padding: 18 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  border: "1px solid var(--sienna)",
                  background: "var(--sienna)",
                  color: "var(--white)",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                2
              </div>
              <span style={{ fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 4, fontSize: 13 }}>
                Quantified Impact Bullets
              </span>
              <p style={{ color: "var(--stone)", fontSize: 11, lineHeight: 1.6, margin: 0 }}>
                Lead with action verbs and include metrics (e.g. "Reduced API response latency by 35% using Redis caching").
              </p>
            </div>

            <div style={{ border: "1px solid var(--cream)", background: "var(--parchment)", padding: 18 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  border: "1px solid var(--ink)",
                  background: "var(--ink)",
                  color: "var(--white)",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                3
              </div>
              <span style={{ fontWeight: 700, color: "var(--ink)", display: "block", marginBottom: 4, fontSize: 13 }}>
                Direct Keyword Alignment
              </span>
              <p style={{ color: "var(--stone)", fontSize: 11, lineHeight: 1.6, margin: 0 }}>
                Include technology keywords exactly as stated in job postings to pass automated keyword threshold tests.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;