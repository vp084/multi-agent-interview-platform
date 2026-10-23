import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FiClock,
  FiChevronDown,
  FiCheckCircle,
  FiCircle,
  FiPlay,
  FiExternalLink,
  FiBookOpen,
  FiFileText,
  FiAward,
  FiZap,
} from "react-icons/fi";
import { FaYoutube } from "react-icons/fa";

const difficultyColors = {
  Beginner: {
    badge: "var(--emerald)",
    bg: "var(--emerald-bg)",
    border: "#A7F3D0",
  },
  Intermediate: {
    badge: "var(--amber)",
    bg: "var(--amber-bg)",
    border: "#FDE68A",
  },
  Advanced: {
    badge: "var(--sienna)",
    bg: "#FFF1EC",
    border: "#FFC5B2",
  },
};

const statusConfig = {
  pending: {
    label: "Not Started",
    color: "var(--stone)",
    bg: "var(--cream)",
    icon: <FiCircle size={13} />,
  },
  in_progress: {
    label: "In Progress",
    color: "var(--sienna)",
    bg: "#FFF1EC",
    icon: <FiClock size={13} className="animate-spin-slow" />,
  },
  completed: {
    label: "Completed",
    color: "var(--emerald)",
    bg: "var(--emerald-bg)",
    icon: <FiCheckCircle size={13} />,
  },
};

export default function ModuleCard({
  module,
  index,
  isOpen,
  onToggle,
  onStatusChange,
  isUpdating = false,
}) {
  const diffStyle =
    difficultyColors[module.difficulty] || difficultyColors.Intermediate;
  const currentStatus = statusConfig[module.status] || statusConfig.pending;

  const paddedIndex = String(index + 1).padStart(2, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="saas-card"
      style={{
        background: "var(--white)",
        border: `1px solid ${module.status === "completed" ? "rgba(16, 185, 129, 0.5)" : "var(--rule)"}`,
        borderRadius: 18,
        marginBottom: 16,
        overflow: "hidden",
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        boxShadow: isOpen ? "var(--card-shadow)" : "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      {/* Header bar */}
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 22px",
          cursor: "pointer",
          userSelect: "none",
          background:
            module.status === "completed"
              ? "rgba(16, 185, 129, 0.04)"
              : isOpen
              ? "var(--cream)"
              : "var(--white)",
          borderBottom: isOpen ? "1px solid var(--rule)" : "none",
          gap: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
          {/* Index counter */}
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 14,
              fontWeight: 800,
              color: module.status === "completed" ? "var(--emerald)" : "var(--indigo)",
              background: module.status === "completed" ? "var(--emerald-bg)" : "var(--indigo-bg)",
              border: `1px solid ${module.status === "completed" ? "var(--success)" : "var(--rule)"}`,
              padding: "4px 8px",
              borderRadius: "var(--radius-sm)",
              minWidth: 32,
              textAlign: "center",
            }}
          >
            {paddedIndex}
          </span>

          {/* Module title & metadata */}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--ink)",
                  margin: 0,
                  textDecoration: module.status === "completed" ? "line-through" : "none",
                  opacity: module.status === "completed" ? 0.75 : 1,
                  letterSpacing: "-0.01em",
                }}
              >
                {module.title}
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {/* Duration badge */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "var(--stone)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 500,
                }}
              >
                <FiClock size={12} /> {module.duration || "1-2 Weeks"}
              </span>

              <span style={{ color: "var(--rule)", fontSize: 10 }}>•</span>

              {/* Difficulty badge */}
              <span
                className="saas-badge"
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  background: diffStyle.bg,
                  color: diffStyle.badge,
                  borderColor: `${diffStyle.badge}44`,
                }}
              >
                {module.difficulty}
              </span>

              <span style={{ color: "var(--rule)", fontSize: 10 }}>•</span>

              {/* Status badge */}
              <span
                className="saas-badge"
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  background: currentStatus.bg,
                  color: currentStatus.color,
                  borderColor: `${currentStatus.color}44`,
                }}
              >
                {currentStatus.icon}
                {currentStatus.label}
              </span>
            </div>
          </div>
        </div>

        {/* Right side chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: "var(--stone)" }}
          >
            <FiChevronDown size={18} />
          </motion.div>
        </div>
      </div>

      {/* Accordion Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "20px 24px", background: "var(--white)" }}>
              {/* Description */}
              {module.description && (
                <div style={{ marginBottom: 18 }}>
                  <p
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 13,
                      lineHeight: "1.65",
                      color: "var(--ink)",
                      opacity: 0.9,
                      margin: 0,
                    }}
                  >
                    {module.description}
                  </p>
                </div>
              )}

              {/* Key Topics pills */}
              {module.topics && module.topics.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--stone)",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FiAward size={12} style={{ color: "var(--sienna)" }} />
                    Core Competencies & Topics
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {module.topics.map((topic, tidx) => (
                      <span
                        key={tidx}
                        className="saas-badge"
                        style={{
                          fontSize: 11,
                          padding: "4px 12px",
                        }}
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Curated Resources Section */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                {/* YouTube Video Tutorials */}
                <div
                  style={{
                    background: "var(--cream)",
                    border: "1px solid var(--rule)",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#EF4444",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FaYoutube size={15} /> Recommended Video Masterclass
                  </div>

                  {module.resources?.youtube && module.resources.youtube.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {module.resources.youtube.map((yt, yidx) => (
                        <div
                          key={yidx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            background: "var(--white)",
                            border: "1px solid var(--rule)",
                            borderRadius: 10,
                            padding: "10px 14px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--ink)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={yt.title}
                            >
                              {yt.title || "Targeted Skill Deep Dive"}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--stone)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                              <FiPlay size={10} style={{ color: "#EF4444" }} /> Video Masterclass
                            </div>
                          </div>

                          <a
                            href={yt.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(module.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#FFFFFF",
                              background: "#EF4444",
                              padding: "6px 12px",
                              textDecoration: "none",
                              borderRadius: 8,
                              whiteSpace: "nowrap",
                              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.25)",
                            }}
                          >
                            Watch <FiExternalLink size={11} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "var(--stone)" }}>
                      Tutorial videos available on YouTube for {module.title}
                    </div>
                  )}
                </div>

                {/* Documentation & Reading Articles */}
                <div
                  style={{
                    background: "var(--cream)",
                    border: "1px solid var(--rule)",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--indigo)",
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FiBookOpen size={15} /> Documentation & Deep Reads
                  </div>

                  {module.resources?.articles && module.resources.articles.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {module.resources.articles.map((art, aidx) => (
                        <div
                          key={aidx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                            background: "var(--white)",
                            border: "1px solid var(--rule)",
                            borderRadius: 10,
                            padding: "10px 14px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                          }}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--ink)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                              title={art.title}
                            >
                              {art.title || "Official Reference Documentation"}
                            </div>
                            <div style={{ fontSize: 11, color: "var(--stone)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                              <FiFileText size={10} style={{ color: "var(--indigo)" }} /> Verified Technical Docs
                            </div>
                          </div>

                          <a
                            href={art.url || `https://duckduckgo.com/?q=${encodeURIComponent(module.title + " documentation tutorial")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#FFFFFF",
                              background: "var(--btn-primary-bg, var(--accent))",
                              padding: "6px 12px",
                              textDecoration: "none",
                              borderRadius: "var(--radius-sm)",
                              whiteSpace: "nowrap",
                              boxShadow: "var(--shadow-sm)",
                            }}
                          >
                            Read Docs <FiExternalLink size={11} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: "var(--stone)" }}>
                      Comprehensive documentation curated for {module.title}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Key Notes / Interview Tips */}
              {module.resources?.notes && (
                <div
                  style={{
                    background: "var(--amber-bg)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    padding: "16px 20px",
                    marginBottom: 20,
                    borderRadius: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--amber)",
                      marginBottom: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <FiZap size={14} /> High-Yield Interview Takeaways & Pro Tips
                  </div>
                  <p
                    style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 13,
                      lineHeight: "1.6",
                      color: "var(--ink)",
                      margin: 0,
                    }}
                  >
                    {module.resources.notes}
                  </p>
                </div>
              )}

              {/* Status Action Buttons Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 16,
                  borderTop: "1px solid var(--rule)",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--stone)", fontWeight: 600 }}>
                    Module Status:
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onStatusChange("pending")}
                      style={{
                        fontSize: 11,
                        padding: "5px 12px",
                        borderRadius: 9999,
                        border: "1px solid var(--rule)",
                        background: module.status === "pending" ? "var(--stone)" : "var(--white)",
                        color: module.status === "pending" ? "var(--white)" : "var(--stone)",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.15s ease",
                      }}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onStatusChange("in_progress")}
                      style={{
                        fontSize: 11,
                        padding: "5px 12px",
                        borderRadius: 9999,
                        border: "1px solid rgba(245, 158, 11, 0.4)",
                        background: module.status === "in_progress" ? "var(--amber)" : "var(--white)",
                        color: module.status === "in_progress" ? "var(--white)" : "var(--amber)",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.15s ease",
                      }}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onStatusChange("completed")}
                      style={{
                        fontSize: 11,
                        padding: "5px 12px",
                        borderRadius: 9999,
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        background: module.status === "completed" ? "var(--emerald)" : "var(--white)",
                        color: module.status === "completed" ? "var(--white)" : "var(--emerald)",
                        cursor: "pointer",
                        fontWeight: 600,
                        transition: "all 0.15s ease",
                      }}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                <div>
                  {module.status !== "completed" ? (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onStatusChange("completed")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "8px 18px",
                        borderRadius: 12,
                        background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                        color: "#FFFFFF",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                        transition: "transform 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
                    >
                      <FiCheckCircle size={14} /> Mark Completed
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => onStatusChange("in_progress")}
                      className="btn-ghost"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        padding: "8px 16px",
                        borderRadius: 12,
                        cursor: "pointer",
                      }}
                    >
                      Revisit Module
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
