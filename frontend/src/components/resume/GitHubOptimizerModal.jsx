import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FiX,
  FiCheck,
  FiArrowRight,
  FiAlertCircle,
  FiLoader,
  FiTarget,
  FiZap,
  FiCode,
  FiStar,
  FiShield,
  FiHelpCircle,
  FiRefreshCw,
  FiEdit2,
  FiTrendingUp,
  FiDatabase,
  FiLayers,
  FiGitCommit,
} from "react-icons/fi";
import { FaGithub } from "react-icons/fa";
import {
  analyzeGithubProjectApi,
  generateProjectBulletsApi,
  polishBulletApi,
} from "../../apis/resume.api";

export default function GitHubOptimizerModal({
  isOpen,
  onClose,
  initialRepoUrl = "",
  onApply,
  onSyncSkills,
  projectIndex,
}) {
  const [step, setStep] = useState(1); // 1: Inputs, 2: Clarify & Mini-Interview, 3: Bullets Review & Polish
  const [repoUrl, setRepoUrl] = useState(initialRepoUrl);
  const [targetRole, setTargetRole] = useState("Software Engineer / Full Stack Developer");
  const [targetJD, setTargetJD] = useState("");
  const [bulletStyle, setBulletStyle] = useState("xyz"); // "xyz" | "star" | "concise"
  const [loading, setLoading] = useState(false);
  const [polishingIndex, setPolishingIndex] = useState(null);
  const [error, setError] = useState("");
  const [skillsSynced, setSkillsSynced] = useState(false);

  // Step 2 Data
  const [analysisData, setAnalysisData] = useState(null);
  const [interviewAnswers, setInterviewAnswers] = useState({});
  const [customAnswers, setCustomAnswers] = useState({});

  // Step 3 Data
  const [generatedResult, setGeneratedResult] = useState(null);
  const [editableBullets, setEditableBullets] = useState([]);

  if (!isOpen) return null;

  const handleScanRepo = async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await analyzeGithubProjectApi({
        repoUrl: repoUrl.trim(),
        targetRole: targetRole.trim(),
        targetJD: targetJD.trim(),
      });

      if (res.success && res.data) {
        setAnalysisData(res.data);
        const initialAns = {};
        if (res.data.questions && Array.isArray(res.data.questions)) {
          res.data.questions.forEach((q, i) => {
            initialAns[q.id || `q${i + 1}`] = q.options?.[0] || "";
          });
        }
        setInterviewAnswers(initialAns);
        setStep(2);
      } else {
        setError(res.message || "Failed to analyze repository.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Could not analyze this repository. Please make sure the URL is public and valid."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBullets = async (overrideStyle = null) => {
    setError("");
    setLoading(true);

    const activeStyle = overrideStyle || bulletStyle;

    try {
      const finalAnswers = {};
      Object.keys(interviewAnswers).forEach((key) => {
        const val = interviewAnswers[key];
        if (val === "__custom__") {
          finalAnswers[key] = customAnswers[key] || "Custom implementation";
        } else {
          finalAnswers[key] = val;
        }
      });

      const res = await generateProjectBulletsApi({
        repoData: {
          name: analysisData.repoInfo.name,
          description: analysisData.repoInfo.description,
          dependencies: analysisData.repoDataSummary?.dependencies || [],
          architectureBreadcrumbs:
            analysisData.repoDataSummary?.architectureBreadcrumbs || [],
          domainModels: analysisData.repoDataSummary?.domainModels || [],
          recentCommits: analysisData.repoDataSummary?.recentCommits || [],
        },
        targetRole,
        targetJD,
        detectedTech: analysisData.detectedTech,
        interviewAnswers: finalAnswers,
        bulletStyle: activeStyle,
      });

      if (res.success && res.data) {
        setGeneratedResult(res.data);
        setEditableBullets(res.data.bullets || []);
        setStep(3);
      } else {
        setError(res.message || "Failed to generate bullets.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to generate resume bullets."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePolishSingleBullet = async (index, instruction) => {
    setPolishingIndex(index);
    try {
      const res = await polishBulletApi({
        originalBullet: editableBullets[index],
        instruction,
        techStack: generatedResult?.formattedTechStack,
        targetRole,
      });

      if (res.success && res.data?.polishedBullet) {
        const next = [...editableBullets];
        next[index] = res.data.polishedBullet;
        setEditableBullets(next);
      }
    } catch (err) {
      console.error("Polishing error:", err);
    } finally {
      setPolishingIndex(null);
    }
  };

  const handleApplyToResume = () => {
    if (!generatedResult) return;

    const formattedDescription = editableBullets
      .map((b) => (b.startsWith("•") ? b : `• ${b}`))
      .join("\n");

    onApply({
      name: generatedResult.title || analysisData?.repoInfo?.name || "",
      subtitle: generatedResult.subtitle || analysisData?.repoInfo?.description || "",
      techStack:
        generatedResult.formattedTechStack ||
        (analysisData?.detectedTech || []).join(", "),
      github: repoUrl.trim(),
      timeline: generatedResult.timeline || "Present",
      description: formattedDescription,
    });

    onClose();
  };

  const handleSyncSkillsClick = () => {
    if (!analysisData?.categorizedSkills || !onSyncSkills) return;
    onSyncSkills(analysisData.categorizedSkills);
    setSkillsSynced(true);
    setTimeout(() => setSkillsSynced(false), 3000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2 }}
        style={{
          width: "100%",
          maxWidth: "820px",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--cream, #1A1815)",
          color: "var(--ink, #F4EFE6)",
          border: "1px solid var(--rule, #2A2621)",
          boxShadow: "var(--card-shadow)",
          fontFamily: "'Space Grotesk', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--rule)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--parchment)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: "var(--ink)",
                color: "var(--parchment)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaGithub size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>
                AI ATS Project Analyzer & Grounded Bullet Synthesizer
              </div>
              <div style={{ fontSize: 11, color: "var(--stone)" }}>
                Verified AST code parsing • Zero hallucinations • Google X-Y-Z formula
              </div>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <span style={{ fontWeight: 600, color: step >= 1 ? "var(--sienna)" : "var(--stone)" }}>
                1. Ingest
              </span>
              <span style={{ color: "var(--stone)" }}>→</span>
              <span style={{ fontWeight: 600, color: step >= 2 ? "var(--sienna)" : "var(--stone)" }}>
                2. Clarify
              </span>
              <span style={{ color: "var(--stone)" }}>→</span>
              <span style={{ fontWeight: 600, color: step >= 3 ? "var(--sienna)" : "var(--stone)" }}>
                3. Polish
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--stone)",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "20px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            flex: 1,
          }}
        >
          {error && (
            <div
              style={{
                padding: "10px 14px",
                background: "rgba(220, 38, 38, 0.1)",
                border: "1px solid #DC2626",
                color: "#DC2626",
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FiAlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: REPOSITORY & TARGET ROLE INPUTS */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--sienna)",
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  GitHub Repository URL *
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "var(--parchment)",
                    border: "1px solid var(--rule)",
                    color: "var(--ink)",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                />
                <div style={{ fontSize: 11, color: "var(--stone)", marginTop: 4 }}>
                  Supports monorepos (`client/`, `server/`, `frontend/`, `backend/`), Dockerfiles, and Prisma schemas.
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--stone)",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Target Role / Job Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Engineer, Backend Developer, Systems Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "var(--parchment)",
                    border: "1px solid var(--rule)",
                    color: "var(--ink)",
                    fontSize: 13,
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "var(--stone)",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Target Job Description (JD) (Optional, for precise ATS keyword injection)
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste candidate job requirements, responsibilities, or stack qualifications..."
                  value={targetJD}
                  onChange={(e) => setTargetJD(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "var(--parchment)",
                    border: "1px solid var(--rule)",
                    color: "var(--ink)",
                    fontSize: 12,
                    fontFamily: "inherit",
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  padding: "12px",
                  background: "var(--parchment)",
                  border: "1px solid var(--rule)",
                  fontSize: 11,
                  color: "var(--stone)",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <FiShield size={18} style={{ color: "var(--emerald)", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <b style={{ color: "var(--ink)" }}>Verified Code Grounding:</b> Unlike generic prompts that invent metrics (e.g. &quot;increased sales by 40%&quot;), our AI only utilizes tools found in your commits &amp; manifests.
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CLARIFICATION & MINI INTERVIEW */}
          {step === 2 && analysisData && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* ATS Score & Repository Health Bar */}
              <div
                style={{
                  padding: "14px 16px",
                  background: "var(--parchment)",
                  border: "1px solid var(--rule)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Score Dial */}
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      border: "3px solid var(--emerald)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(5, 150, 105, 0.08)",
                      color: "var(--emerald)",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>
                      {analysisData.atsScore || 85}%
                    </span>
                    <span style={{ fontSize: 8, fontWeight: 600, textTransform: "uppercase" }}>
                      ATS Fit
                    </span>
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>
                        {analysisData.repoInfo?.name}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          padding: "2px 6px",
                          background: "var(--cream)",
                          border: "1px solid var(--rule)",
                          color: "var(--stone)",
                        }}
                      >
                        {analysisData.repoInfo?.language}
                      </span>
                      {analysisData.repoInfo?.stars > 0 && (
                        <span style={{ fontSize: 11, color: "var(--stone)", display: "flex", alignItems: "center", gap: 3 }}>
                          <FiStar size={11} /> {analysisData.repoInfo?.stars}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--stone)", marginTop: 2 }}>
                      {analysisData.targetRoleAlignment}
                    </div>
                  </div>
                </div>

                {onSyncSkills && analysisData.categorizedSkills && (
                  <button
                    type="button"
                    onClick={handleSyncSkillsClick}
                    style={{
                      padding: "6px 12px",
                      fontSize: 11,
                      fontWeight: 600,
                      background: skillsSynced ? "var(--emerald)" : "var(--cream)",
                      border: "1px solid var(--rule)",
                      color: skillsSynced ? "#FFF" : "var(--ink)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FiLayers size={13} />
                    <span>{skillsSynced ? "✓ Synced to Skills!" : "Sync Skills to Step 3"}</span>
                  </button>
                )}
              </div>

              {/* Categorized Technical Breadcrumbs */}
              <div
                style={{
                  padding: "12px 14px",
                  background: "var(--parchment)",
                  border: "1px solid var(--rule)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: "var(--stone)", fontWeight: 600 }}>
                    Detected Stack:
                  </span>
                  {analysisData.detectedTech?.map((tech, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        background: "var(--cream)",
                        border: "1px solid var(--rule)",
                        fontWeight: 500,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                  {analysisData.repoInfo?.breadcrumbs?.map((bc, i) => (
                    <span
                      key={`bc-${i}`}
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        background: "rgba(5, 150, 105, 0.1)",
                        border: "1px solid var(--emerald)",
                        color: "var(--emerald)",
                        fontWeight: 500,
                      }}
                    >
                      ✓ {bc}
                    </span>
                  ))}
                  {analysisData.repoInfo?.domainModels?.length > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        background: "rgba(67, 56, 202, 0.1)",
                        border: "1px solid var(--indigo)",
                        color: "var(--indigo)",
                        fontWeight: 500,
                      }}
                    >
                      Models: {analysisData.repoInfo.domainModels.slice(0, 4).join(", ")}
                    </span>
                  )}
                </div>

                {/* ATS Keywords matched */}
                {analysisData.atsMatchedKeywords && analysisData.atsMatchedKeywords.length > 0 && (
                  <div style={{ fontSize: 11, color: "var(--emerald)", display: "flex", alignItems: "center", gap: 5 }}>
                    <FiTarget size={12} />
                    <span>
                      <b>ATS Keywords Matched:</b> {analysisData.atsMatchedKeywords.join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Bullet Style Picker */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--stone)" }}>
                  Bullet Style:
                </span>
                <div style={{ display: "flex", gap: 6 }}>
                  {[
                    { id: "xyz", label: "🎯 Google X-Y-Z", desc: "Action + Metric + Tooling" },
                    { id: "star", label: "📖 STAR Method", desc: "Situation + Action + Result" },
                    { id: "concise", label: "⚡ Dense 1-Liner", desc: "High-density technical punch" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setBulletStyle(st.id)}
                      style={{
                        padding: "5px 10px",
                        fontSize: 11,
                        border: bulletStyle === st.id ? "1px solid var(--sienna)" : "1px solid var(--rule)",
                        background: bulletStyle === st.id ? "rgba(196, 84, 29, 0.1)" : "var(--parchment)",
                        color: bulletStyle === st.id ? "var(--sienna)" : "var(--ink)",
                        fontWeight: bulletStyle === st.id ? 700 : 400,
                        cursor: "pointer",
                      }}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* The Mini-Interview Questions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--sienna)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FiHelpCircle size={14} />
                  <span>1-Minute Engineering Clarification</span>
                </div>

                {analysisData.questions?.map((q, idx) => {
                  const qKey = q.id || `q${idx + 1}`;
                  const currentAnswer = interviewAnswers[qKey];
                  const isCustom = currentAnswer === "__custom__";

                  return (
                    <div
                      key={qKey}
                      style={{
                        padding: "12px 14px",
                        background: "var(--parchment)",
                        border: "1px solid var(--rule)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        <span style={{ color: "var(--sienna)", fontWeight: 700, marginRight: 6 }}>
                          Q{idx + 1}:
                        </span>
                        {q.question}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {q.options?.map((opt, optIdx) => {
                          const selected = currentAnswer === opt;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                setInterviewAnswers({
                                  ...interviewAnswers,
                                  [qKey]: opt,
                                });
                              }}
                              style={{
                                padding: "6px 12px",
                                fontSize: 11,
                                border: selected
                                  ? "1px solid var(--sienna)"
                                  : "1px solid var(--rule)",
                                background: selected
                                  ? "rgba(196, 84, 29, 0.1)"
                                  : "var(--cream)",
                                color: selected ? "var(--sienna)" : "var(--ink)",
                                fontWeight: selected ? 600 : 400,
                                cursor: "pointer",
                                textAlign: "left",
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              {selected && <FiCheck size={12} />}
                              <span>{opt}</span>
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => {
                            setInterviewAnswers({
                              ...interviewAnswers,
                              [qKey]: "__custom__",
                            });
                          }}
                          style={{
                            padding: "6px 12px",
                            fontSize: 11,
                            border: isCustom
                              ? "1px solid var(--sienna)"
                              : "1px dashed var(--stone)",
                            background: isCustom
                              ? "rgba(196, 84, 29, 0.1)"
                              : "transparent",
                            color: isCustom ? "var(--sienna)" : "var(--stone)",
                            fontWeight: isCustom ? 600 : 400,
                            cursor: "pointer",
                          }}
                        >
                          ✎ Type custom answer...
                        </button>
                      </div>

                      {isCustom && (
                        <input
                          type="text"
                          placeholder="Briefly describe what you did or the impact achieved..."
                          value={customAnswers[qKey] || ""}
                          onChange={(e) =>
                            setCustomAnswers({
                              ...customAnswers,
                              [qKey]: e.target.value,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "8px 10px",
                            background: "var(--cream)",
                            border: "1px solid var(--rule)",
                            color: "var(--ink)",
                            fontSize: 12,
                            fontFamily: "inherit",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: BULLETS REVIEW & LIVE POLISHER */}
          {step === 3 && generatedResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Header preview */}
              <div
                style={{
                  padding: "12px",
                  background: "var(--parchment)",
                  border: "1px solid var(--rule)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {generatedResult.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--stone)" }}>
                    {generatedResult.timeline}
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "var(--sienna)", fontWeight: 500 }}>
                  {generatedResult.subtitle}
                </div>

                <div style={{ fontSize: 11, color: "var(--stone)" }}>
                  <b>Technologies:</b> {generatedResult.formattedTechStack}
                </div>
              </div>

              {/* Style Switcher Bar in Step 3 */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    fontWeight: 700,
                    color: "var(--sienna)",
                  }}
                >
                  ATS Project Bullets (Editable)
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 10, color: "var(--stone)" }}>Regenerate in style:</span>
                  {["xyz", "star", "concise"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setBulletStyle(st);
                        handleGenerateBullets(st);
                      }}
                      disabled={loading}
                      style={{
                        padding: "3px 8px",
                        fontSize: 10,
                        border: bulletStyle === st ? "1px solid var(--sienna)" : "1px solid var(--rule)",
                        background: bulletStyle === st ? "rgba(196, 84, 29, 0.1)" : "transparent",
                        color: bulletStyle === st ? "var(--sienna)" : "var(--stone)",
                        cursor: "pointer",
                        fontWeight: 600,
                        textTransform: "uppercase",
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Bullets with Individual Polish Chips */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {editableBullets.map((bullet, bIdx) => (
                  <div
                    key={bIdx}
                    style={{
                      padding: "12px 14px",
                      background: "var(--parchment)",
                      border: "1px solid var(--rule)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span style={{ color: "var(--sienna)", fontWeight: 700, marginTop: 4 }}>•</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => {
                          const next = [...editableBullets];
                          next[bIdx] = e.target.value;
                          setEditableBullets(next);
                        }}
                        style={{
                          width: "100%",
                          background: "var(--cream)",
                          border: "1px solid var(--rule)",
                          color: "var(--ink)",
                          fontSize: 12,
                          lineHeight: "1.5",
                          padding: "6px 8px",
                          fontFamily: "inherit",
                          resize: "vertical",
                        }}
                      />
                    </div>

                    {/* Polish Action Chips */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", paddingLeft: 16 }}>
                      <span style={{ fontSize: 10, color: "var(--stone)", display: "flex", alignItems: "center", gap: 3 }}>
                        <FiEdit2 size={10} /> Polish:
                      </span>
                      {[
                        { label: "+ Add Metric Placeholder", inst: "Add bracketed metric placeholder like [reduced latency by ~X%]" },
                        { label: "Make More Technical", inst: "Deepen technical phrasing and architectural rigor" },
                        { label: "Make More Concise", inst: "Trim wordiness while preserving core impact" },
                      ].map((chip, cIdx) => (
                        <button
                          key={cIdx}
                          type="button"
                          disabled={polishingIndex === bIdx}
                          onClick={() => handlePolishSingleBullet(bIdx, chip.inst)}
                          style={{
                            fontSize: 10,
                            padding: "2px 7px",
                            background: "transparent",
                            border: "1px solid var(--rule)",
                            color: "var(--stone)",
                            cursor: polishingIndex === bIdx ? "not-allowed" : "pointer",
                          }}
                        >
                          {polishingIndex === bIdx ? "Polishing..." : chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* ATS Keywords Embedded */}
              {generatedResult.atsKeywordsIncluded && generatedResult.atsKeywordsIncluded.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "var(--stone)", fontWeight: 600 }}>
                    Keywords Embedded:
                  </span>
                  {generatedResult.atsKeywordsIncluded.map((kw, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 10,
                        padding: "2px 7px",
                        background: "rgba(5, 150, 105, 0.1)",
                        border: "1px solid var(--emerald)",
                        color: "var(--emerald)",
                        fontWeight: 600,
                      }}
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Interview Tip */}
              {generatedResult.interviewTip && (
                <div
                  style={{
                    padding: "10px 12px",
                    background: "rgba(217, 119, 6, 0.08)",
                    border: "1px solid var(--amber)",
                    fontSize: 11,
                    color: "var(--ink)",
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <FiZap size={14} style={{ color: "var(--amber)", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <b>Interview Talking Point:</b> {generatedResult.interviewTip}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Bottom Action Bar */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--rule)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--parchment)",
          }}
        >
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={loading}
                style={{
                  background: "transparent",
                  border: "1px solid var(--rule)",
                  color: "var(--ink)",
                  padding: "8px 14px",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Back
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {step === 1 && (
              <button
                type="button"
                onClick={handleScanRepo}
                disabled={loading}
                style={{
                  padding: "9px 18px",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: loading ? "not-allowed" : "pointer",
                  background: "var(--sienna)",
                  color: "#FFF",
                  border: "none",
                }}
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={14} />
                    <span>Inspecting Repo &amp; Code...</span>
                  </>
                ) : (
                  <>
                    <span>Deep Scan for ATS</span>
                    <FiArrowRight size={14} />
                  </>
                )}
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => handleGenerateBullets()}
                disabled={loading}
                style={{
                  padding: "9px 18px",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: loading ? "not-allowed" : "pointer",
                  background: "var(--sienna)",
                  color: "#FFF",
                  border: "none",
                }}
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin" size={14} />
                    <span>Synthesizing ATS Bullets...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Grounded Bullets</span>
                    <FiArrowRight size={14} />
                  </>
                )}
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={handleApplyToResume}
                style={{
                  padding: "9px 20px",
                  fontSize: 12,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  background: "var(--emerald)",
                  color: "#FFF",
                  border: "none",
                }}
              >
                <FiCheck size={14} />
                <span>Apply to Project #{projectIndex + 1}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
