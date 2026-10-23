import React, { useRef } from 'react'
import { motion } from "motion/react"
import { FiArrowLeft, FiAward, FiCheck, FiTarget, FiTrendingUp, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import DownloadBtn from '../resume/DownloadBtn'
import { ThemeToggle } from '../../context/ThemeContext'

function Step3report({ report, user, setUser }) {
  const navigate = useNavigate()
  const reportRef = useRef(null)

  return (
    <div className="min-h-screen bg-[var(--parchment)] text-[var(--ink)] flex items-center justify-center p-4 md:p-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl rounded-[24px] bg-[var(--white)] border border-[var(--rule)] shadow-[var(--card-shadow)] overflow-hidden"
      >
        {/* Top Bar */}
        <div className="border-b border-[var(--rule)] px-8 py-6 flex flex-wrap items-center justify-between gap-4 bg-[var(--white)]">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="btn-ghost"
                style={{ padding: "6px 14px", fontSize: 12, borderRadius: 10, gap: 6 }}
              >
                <FiArrowLeft size={13} />
                <span>Dashboard</span>
              </button>
              <ThemeToggle showLabel={false} compact={true} />
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)] font-['Space_Grotesk',sans-serif] tracking-tight">
              Interview Evaluation Report
            </h1>

            <p className="text-xs text-[var(--stone)] mt-1 mb-3">
              Comprehensive Performance Diagnostics, Rubrics & Career Improvements
            </p>

            <DownloadBtn
              docRef={reportRef}
              user={user}
              setUser={setUser}
            />
          </div>

          <div className="flex items-center gap-2.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-emerald-500 font-semibold text-xs">
            <FiAward size={16} />
            <span>Completed & Evaluated</span>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="p-6 md:p-8" ref={reportRef}>
          {/* Executive Metrics Overview */}
          <div className="grid md:grid-cols-3 gap-5">
            <div className="rounded-2xl bg-[var(--cream)] border border-[var(--rule)] p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[var(--white)] text-[var(--indigo)] border border-[var(--rule)] flex items-center justify-center shadow-xs">
                <FiTarget size={18} />
              </div>
              <p className="mt-4 text-[var(--stone)] text-xs font-semibold uppercase tracking-wider">Overall Score</p>
              <h2 className="mt-1 text-4xl font-extrabold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                {report.overallScore ?? 0}
                <span className="text-lg text-[var(--stone)] font-medium ml-1">/ 100</span>
              </h2>
            </div>

            <div className="rounded-2xl bg-[var(--cream)] border border-[var(--rule)] p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[var(--white)] text-[var(--blue)] border border-[var(--rule)] flex items-center justify-center shadow-xs">
                <FiTrendingUp size={18} />
              </div>
              <p className="mt-4 text-[var(--stone)] text-xs font-semibold uppercase tracking-wider">Total Questions</p>
              <h2 className="mt-1 text-4xl font-extrabold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                {report.totalQuestions ?? report.questions?.length ?? 0}
              </h2>
            </div>

            <div className="rounded-2xl bg-[var(--cream)] border border-[var(--rule)] p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[var(--white)] text-[var(--emerald)] border border-[var(--rule)] flex items-center justify-center shadow-xs">
                <FiAward size={18} />
              </div>
              <p className="mt-4 text-[var(--stone)] text-xs font-semibold uppercase tracking-wider">Evaluation Status</p>
              <h2 className="mt-1 text-3xl font-extrabold text-[var(--emerald)] font-['Space_Grotesk',sans-serif]">
                Verified
              </h2>
            </div>
          </div>

          {/* Phase Performance Breakdown */}
          {report.phaseScores && Object.values(report.phaseScores).some((val) => typeof val === "number") && (
            <div className="mt-6 rounded-2xl bg-[var(--cream)] border border-[var(--rule)] p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <h3 className="text-lg font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                    Phase Performance Breakdown
                  </h3>
                  <p className="text-xs text-[var(--stone)] mt-0.5">
                    Weighted evaluation rubric calculated across interview stages
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="saas-badge" style={{ fontSize: 10 }}>
                    Warmup (0.5x)
                  </span>
                  <span className="saas-badge saas-badge-indigo" style={{ fontSize: 10 }}>
                    Core (1.0x)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {report.phaseScores.warmup !== null && report.phaseScores.warmup !== undefined && (
                  <div className="rounded-xl bg-[var(--white)] border border-[var(--rule)] p-4 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[var(--stone)] mb-1">
                      <span className="font-semibold">Warmup</span>
                      <span className="text-[10px] bg-[var(--cream)] px-1.5 py-0.5 rounded text-[var(--stone)]">0.5x</span>
                    </div>
                    <div className="text-3xl font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                      {report.phaseScores.warmup}%
                    </div>
                    <p className="text-[11px] text-[var(--stone)] mt-1">Clarity & Communication</p>
                  </div>
                )}

                {report.phaseScores.resume !== null && report.phaseScores.resume !== undefined && (
                  <div className="rounded-xl bg-[var(--white)] border border-[var(--rule)] p-4 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[var(--stone)] mb-1">
                      <span className="font-semibold">Resume</span>
                      <span className="text-[10px] bg-[var(--cream)] px-1.5 py-0.5 rounded text-[var(--stone)]">1.0x</span>
                    </div>
                    <div className="text-3xl font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                      {report.phaseScores.resume}%
                    </div>
                    <p className="text-[11px] text-[var(--stone)] mt-1">Projects & Tech Stack</p>
                  </div>
                )}

                {report.phaseScores.technical !== null && report.phaseScores.technical !== undefined && (
                  <div className="rounded-xl bg-[var(--white)] border border-[var(--rule)] p-4 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[var(--stone)] mb-1">
                      <span className="font-semibold">Technical</span>
                      <span className="text-[10px] bg-[var(--cream)] px-1.5 py-0.5 rounded text-[var(--stone)]">1.0x</span>
                    </div>
                    <div className="text-3xl font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                      {report.phaseScores.technical}%
                    </div>
                    <p className="text-[11px] text-[var(--stone)] mt-1">Core Systems & Architecture</p>
                  </div>
                )}

                {report.phaseScores.behavioral !== null && report.phaseScores.behavioral !== undefined && (
                  <div className="rounded-xl bg-[var(--white)] border border-[var(--rule)] p-4 shadow-xs">
                    <div className="flex items-center justify-between text-xs text-[var(--stone)] mb-1">
                      <span className="font-semibold">Behavioral</span>
                      <span className="text-[10px] bg-[var(--cream)] px-1.5 py-0.5 rounded text-[var(--stone)]">1.0x</span>
                    </div>
                    <div className="text-3xl font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                      {report.phaseScores.behavioral}%
                    </div>
                    <p className="text-[11px] text-[var(--stone)] mt-1">STAR & Team Leadership</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interview Summary */}
          <div className="mt-6 rounded-2xl bg-[var(--cream)] border border-[var(--rule)] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
              Executive Summary
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--ink)] opacity-90 font-medium">
              {report.summary}
            </p>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid lg:grid-cols-2 gap-5 mt-6">
            <div className="rounded-2xl bg-[var(--cream)] border border-emerald-500/20 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <FiCheckCircle size={18} />
                </div>
                <h2 className="text-lg font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                  Observed Strengths
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                {report.strengths?.length > 0 ? (
                  report.strengths.map((s, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-xl bg-[var(--white)] border border-emerald-500/20 p-3.5 shadow-xs">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                        <FiCheck size={13} />
                      </div>
                      <p className="text-sm text-[var(--ink)] leading-6 font-medium">{s}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[var(--stone)] text-sm">No specific strengths documented.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-[var(--cream)] border border-amber-500/20 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <FiAlertCircle size={18} />
                </div>
                <h2 className="text-lg font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                  Areas for Improvement
                </h2>
              </div>

              <div className="mt-5 space-y-3">
                {report.weaknesses?.length > 0 ? (
                  report.weaknesses.map((w, idx) => (
                    <div key={idx} className="flex items-start gap-3 rounded-xl bg-[var(--white)] border border-amber-500/20 p-3.5 shadow-xs">
                      <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                        !
                      </div>
                      <p className="text-sm text-[var(--ink)] leading-6 font-medium">{w}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[var(--stone)] text-sm">No weaknesses detected.</p>
                )}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6 rounded-2xl bg-[var(--cream)] border border-[var(--rule)] p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
              Actionable Recommendations
            </h3>

            <div className="mt-4 space-y-3">
              {report.recommendations?.length > 0 ? (
                report.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-3.5 rounded-xl border border-[var(--rule)] bg-[var(--white)] p-4 shadow-xs">
                    <div className="w-7 h-7 rounded-full bg-[var(--indigo)] text-white flex items-center justify-center font-bold flex-shrink-0 text-xs shadow-xs">
                      {i + 1}
                    </div>
                    <p className="text-sm text-[var(--ink)] leading-6 font-medium">{r}</p>
                  </div>
                ))
              ) : (
                <p className="text-[var(--stone)] text-sm">No recommendations available.</p>
              )}
            </div>
          </div>

          {/* Question Wise Analysis */}
          <div className="mt-8">
            <h3 className="text-xl font-extrabold text-[var(--ink)] font-['Space_Grotesk',sans-serif] mb-5 tracking-tight">
              Question-by-Question Diagnostics
            </h3>

            <div className="space-y-5">
              {report.questions?.map((item, index) => {
                const isFollowUp = Boolean(item.isFollowUp);
                const parentDisplayNum = item.parentIndex !== null && item.parentIndex !== undefined ? item.parentIndex + 1 : null;

                return (
                  <div
                    key={index}
                    className={`rounded-2xl border p-6 transition-all ${
                      isFollowUp
                        ? "bg-[var(--cream)] border-amber-500/30 ml-3 sm:ml-6 border-l-4 border-l-amber-500"
                        : "bg-[var(--cream)] border-[var(--rule)]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] uppercase tracking-wider font-bold ${isFollowUp ? "text-amber-500" : "text-[var(--stone)]"}`}>
                          {isFollowUp ? `Follow-Up ${parentDisplayNum ? `(Parent: Q${parentDisplayNum})` : ""}` : `Question ${index + 1}`}
                        </span>
                        {isFollowUp && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30">
                            Probing Follow-Up (Weight: 0.5)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {item.phase && (
                          <span className="saas-badge" style={{ fontSize: 10 }}>
                            {item.phase}
                          </span>
                        )}
                        {item.topic && (
                          <span className="saas-badge saas-badge-indigo" style={{ fontSize: 10 }}>
                            {item.topic}
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif] leading-7">
                      {item.question}
                    </h4>

                    {item.feedback?.reaction && (
                      <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-[var(--white)] border border-[var(--rule)] text-xs text-[var(--indigo)] italic font-medium">
                        Interviewer Reaction: "{item.feedback.reaction}"
                      </div>
                    )}

                    <div className="mt-5">
                      <p className="text-[11px] uppercase tracking-wider text-[var(--stone)] font-bold">Your Response</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink)] font-medium bg-[var(--white)] p-4 rounded-xl border border-[var(--rule)]">
                        {item.userAnswer || "No verbal or written answer recorded"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                      <div className="rounded-xl bg-[var(--white)] border border-[var(--rule)] p-3.5">
                        <p className="text-xs text-[var(--stone)] font-semibold">Score</p>
                        <h5 className="mt-1 text-xl font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                          {item.feedback?.score !== null && item.feedback?.score !== undefined
                            ? `${item.feedback.score}%`
                            : (item.phase === "greeting" || item.phase === "closing" ? "Unscored" : "—")}
                        </h5>
                      </div>

                      <div className="rounded-xl bg-[var(--white)] border border-[var(--rule)] p-3.5">
                        <p className="text-xs text-[var(--stone)] font-semibold">Clarity</p>
                        <h5 className="mt-1 text-xl font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                          {item.feedback?.clarity !== null && item.feedback?.clarity !== undefined ? item.feedback.clarity : "—"}
                        </h5>
                      </div>

                      <div className="rounded-xl bg-[var(--white)] border border-[var(--rule)] p-3.5">
                        <p className="text-xs text-[var(--stone)] font-semibold">Relevance</p>
                        <h5 className="mt-1 text-xl font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                          {item.feedback?.relevance !== null && item.feedback?.relevance !== undefined ? item.feedback.relevance : "—"}
                        </h5>
                      </div>

                      <div className="rounded-xl bg-[var(--white)] border border-[var(--rule)] p-3.5">
                        <p className="text-xs text-[var(--stone)] font-semibold">Communication</p>
                        <h5 className="mt-1 text-xl font-bold text-[var(--ink)] font-['Space_Grotesk',sans-serif]">
                          {item.feedback?.communication !== null && item.feedback?.communication !== undefined ? item.feedback.communication : "—"}
                        </h5>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                      <p className="text-[11px] uppercase tracking-wider text-emerald-600 font-bold">Interviewer Rubric Assessment</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--ink)] font-medium">
                        {item.feedback?.feedback || "No feedback available."}
                      </p>
                    </div>

                    {item.feedback?.improvements?.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-xs uppercase tracking-wider font-bold text-[var(--stone)] mb-2">
                          Specific Improvement Pointers
                        </h5>
                        <div className="space-y-2">
                          {item.feedback.improvements.map((imp, i) => (
                            <div key={i} className="rounded-lg border border-[var(--rule)] bg-[var(--white)] px-3.5 py-2.5 text-xs text-[var(--ink)] font-medium">
                              • {imp}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Step3report
