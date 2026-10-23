import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  FiArrowLeft,
  FiEye,
  FiEdit3,
  FiChevronLeft,
  FiChevronRight,
  FiDownload,
  FiCheck,
  FiPhone,
  FiMail,
} from "react-icons/fi";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import BrandLogo from "../components/BrandLogo";
import { initialData } from "../components/resume/initialData";
import ResumeForm from "../components/resume/ResumeForm";
import { ThemeToggle } from "../context/ThemeContext";

const stepTitles = {
  1: "Personal Information",
  2: "Education & Academics",
  3: "Technical Skills",
  4: "Work Experience",
  5: "Projects & Timelines",
  6: "Certifications & Additional Sections",
};

function ResumeBuilder({ user }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState(initialData);
  const [previewMode, setPreviewMode] = useState(false);
  const navigate = useNavigate();

  const progressPercent = Math.round(((currentStep - 1) / 5) * 100);

  const handlePrint = () => {
    window.print();
  };

  const schooling = data.schooling || {};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--parchment)",
        color: "var(--ink)",
        fontFamily: "'Space Grotesk', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Navbar */}
      <header
        className="print:hidden"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "var(--nav-bg)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--rule)",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--white)",
              border: "1px solid var(--rule)",
              borderRadius: 10,
              padding: "7px 12px",
              color: "var(--ink)",
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease",
            }}
          >
            <FiArrowLeft size={15} />
            <BrandLogo size="sm" />
          </button>
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
            ATS Resume Builder
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle showLabel={false} />
          <button
            onClick={() => setPreviewMode(!previewMode)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              background: "var(--white)",
              border: "1px solid var(--rule)",
              color: "var(--ink)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease",
            }}
          >
            {previewMode ? (
              <>
                <FiEdit3 size={13} style={{ color: "var(--indigo)" }} />
                <span>Editor</span>
              </>
            ) : (
              <>
                <FiEye size={13} style={{ color: "var(--indigo)" }} />
                <span>Live Preview</span>
              </>
            )}
          </button>

          {previewMode && (
            <button
              onClick={handlePrint}
              className="btn-primary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                border: "none",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <FiDownload size={14} />
              <span>Download PDF</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "36px 16px 60px",
        }}
      >
        <AnimatePresence mode="wait">
          {!previewMode ? (
            /* Multi-step Form View */
            <motion.div
              key="form-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="saas-card"
              style={{
                width: "100%",
                maxWidth: 740,
                borderRadius: 22,
                border: "1px solid var(--rule)",
                padding: "36px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Step Tracker & Header */}
              <div style={{ marginBottom: 26 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span
                    className="saas-badge saas-badge-indigo"
                    style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em" }}
                  >
                    STEP {currentStep} OF 6
                  </span>
                  <span
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 700,
                      fontSize: 12,
                      color: "var(--indigo)",
                    }}
                  >
                    {progressPercent}% Complete
                  </span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: "100%", height: 6, background: "var(--cream)", borderRadius: 6, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${progressPercent}%`,
                      background: "linear-gradient(90deg, #6366F1, #8B5CF6)",
                      borderRadius: 6,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                {/* Step Indicators */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 18,
                  }}
                >
                  {[1, 2, 3, 4, 5, 6].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCurrentStep(st)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "'Space Grotesk', sans-serif",
                          border:
                            st === currentStep
                              ? "2px solid var(--indigo)"
                              : st < currentStep
                              ? "1px solid var(--emerald)"
                              : "1px solid var(--rule)",
                          background:
                            st === currentStep
                              ? "var(--indigo)"
                              : st < currentStep
                              ? "rgba(16, 185, 129, 0.12)"
                              : "var(--white)",
                          color:
                            st === currentStep
                              ? "#FFFFFF"
                              : st < currentStep
                              ? "var(--emerald)"
                              : "var(--stone)",
                          boxShadow:
                            st === currentStep
                              ? "var(--shadow-sm)"
                              : "none",
                          transition: "all 0.18s ease",
                        }}
                      >
                        {st < currentStep ? <FiCheck size={13} style={{ color: "var(--emerald)" }} /> : st}
                      </span>
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--rule)" }}>
                  <h2
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 22,
                      fontWeight: 800,
                      letterSpacing: "-0.01em",
                      color: "var(--ink)",
                      margin: 0,
                    }}
                  >
                    {stepTitles[currentStep]}
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--stone)", marginTop: 6, lineHeight: 1.5, margin: "6px 0 0" }}>
                    {currentStep === 1 &&
                      "Fill in your personal identity, location, and verified links for recruiter ATS parsing."}
                    {currentStep === 2 &&
                      "Add your college degree, CGPA, and your Class XII (HSC) & Class X (SSC) percentages."}
                    {currentStep === 3 &&
                      "List your technical skills organized into clear categories (Languages, Frontend, Backend, etc.)."}
                    {currentStep === 4 &&
                      "Detail your internships, engineering roles, and work experience with quantified impact."}
                    {currentStep === 5 &&
                      "Showcase your engineering projects with tech stack, repository links, and completion timelines."}
                    {currentStep === 6 &&
                      "Add custom sections such as Certifications, Achievements, or Positions of Responsibility."}
                  </p>
                </div>
              </div>

              {/* Form Body */}
              <div style={{ minHeight: 280 }}>
                <ResumeForm step={currentStep} data={data} setData={setData} />
              </div>

              {/* Step Navigation Controls */}
              <div
                style={{
                  marginTop: 32,
                  paddingTop: 18,
                  borderTop: "1px solid var(--rule)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="button"
                  disabled={currentStep === 1}
                  onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    opacity: currentStep === 1 ? 0.3 : 1,
                    cursor: currentStep === 1 ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "var(--white)",
                    border: "1px solid var(--rule)",
                    color: "var(--ink)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <FiChevronLeft size={15} />
                  <span>Previous</span>
                </button>

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => Math.min(6, prev + 1))}
                    className="btn-primary"
                    style={{
                      padding: "9px 20px",
                      borderRadius: "var(--radius-md)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      border: "none",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <span>Next</span>
                    <FiChevronRight size={15} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className="btn-primary"
                    style={{
                      padding: "9px 22px",
                      borderRadius: "var(--radius-md)",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      border: "none",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <FiEye size={15} />
                    <span>Preview Resume</span>
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            /* ATS Authentic Academic/LaTeX Resume Preview Paper */
            <motion.div
              key="preview-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              {/* Top Action Bar above paper */}
              <div
                className="print:hidden"
                style={{
                  width: "100%",
                  maxWidth: 794,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPreviewMode(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--ink)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <FiArrowLeft size={14} />
                  <span>Back to Form Editor</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn-primary"
                  style={{
                    padding: "8px 18px",
                    fontSize: 12,
                    cursor: "pointer",
                    gap: 6,
                  }}
                >
                  <FiDownload size={13} />
                  <span>Download PDF / Print</span>
                </button>
              </div>

              {/* A4 Paper Template: Classical LaTeX Academic Overleaf Style */}
              <div
                id="resume-preview-document"
                style={{
                  width: "100%",
                  maxWidth: 794,
                  minHeight: 1123,
                  background: "#FFFFFF",
                  color: "#000000",
                  padding: "44px 50px",
                  boxShadow: "0 4px 25px rgba(0,0,0,0.08)",
                  border: "1px solid #D1D5DB",
                  fontFamily: "'STIX Two Text', 'EB Garamond', 'Computer Modern Roman', 'Times New Roman', Times, serif",
                  fontSize: "9.5pt",
                  lineHeight: 1.35,
                  boxSizing: "border-box",
                }}
                className="print:border-none print:shadow-none print:m-0 print:p-8"
              >
                {/* Header (Personal Info) */}
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <h1
                    style={{
                      fontSize: "22pt",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#000000",
                      margin: "0 0 2px",
                      lineHeight: 1.1,
                      fontFamily: "'STIX Two Text', 'EB Garamond', 'Times New Roman', serif",
                    }}
                  >
                    {data.name || "Your Name"}
                  </h1>

                  {data.location && (
                    <div style={{ fontSize: "9.5pt", color: "#111827", marginBottom: 4 }}>
                      {data.location}
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px 14px",
                      fontSize: "9pt",
                      color: "#111827",
                    }}
                  >
                    {data.phone && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <FiPhone size={11} /> {data.phone}
                      </span>
                    )}
                    {data.email && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <FiMail size={11} />
                        <a
                          href={`mailto:${data.email}`}
                          style={{ color: "#000000", textDecoration: "underline" }}
                        >
                          {data.email}
                        </a>
                      </span>
                    )}
                    {data.linkedin && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <FaLinkedin size={11} />
                        <a
                          href={data.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#000000", textDecoration: "underline" }}
                        >
                          LinkedIn
                        </a>
                      </span>
                    )}
                    {data.github && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <FaGithub size={11} />
                        <a
                          href={data.github}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: "#000000", textDecoration: "underline" }}
                        >
                          GitHub
                        </a>
                      </span>
                    )}
                  </div>
                </div>

                {/* 1. Education (AT THE TOP) */}
                <div style={{ marginBottom: 12 }}>
                  <h2
                    style={{
                      fontSize: "11pt",
                      fontWeight: 700,
                      borderBottom: "1px solid #000000",
                      paddingBottom: 1,
                      marginBottom: 5,
                      color: "#000000",
                    }}
                  >
                    Education
                  </h2>

                  {/* College Degrees */}
                  {data.education &&
                    data.education.map((edu, idx) => (
                      <div key={idx} style={{ marginBottom: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <span style={{ fontWeight: 700, fontSize: "9.5pt", color: "#000000" }}>
                            {edu.college}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: "9.5pt", color: "#000000" }}>
                            {edu.location}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontStyle: "italic", fontSize: "9pt", color: "#111827" }}>
                          <span>
                            {edu.degree}
                            {edu.cgpa ? ` | CGPA: ${edu.cgpa}` : ""}
                          </span>
                          <span>{edu.year}</span>
                        </div>
                      </div>
                    ))}

                  {/* Class XII (HSC) */}
                  {schooling.class12?.institution && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "9pt", marginBottom: 2 }}>
                      <span>
                        <span style={{ fontWeight: 700 }}>
                          {schooling.class12.stream || "Class XII (HSC)"}
                        </span>{" "}
                        | {schooling.class12.institution}
                      </span>
                      <span style={{ fontWeight: 700 }}>
                        {schooling.class12.score}
                        {schooling.class12.year ? ` | ${schooling.class12.year}` : ""}
                      </span>
                    </div>
                  )}

                  {/* Class X (SSC) */}
                  {schooling.class10?.institution && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: "9pt" }}>
                      <span>
                        <span style={{ fontWeight: 700 }}>
                          {schooling.class10.stream || "Class X (SSC)"}
                        </span>{" "}
                        | {schooling.class10.institution}
                      </span>
                      <span style={{ fontWeight: 700 }}>
                        {schooling.class10.score}
                        {schooling.class10.year ? ` | ${schooling.class10.year}` : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Technical Skills */}
                {data.skills && (
                  <div style={{ marginBottom: 12 }}>
                    <h2
                      style={{
                        fontSize: "11pt",
                        fontWeight: 700,
                        borderBottom: "1px solid #000000",
                        paddingBottom: 1,
                        marginBottom: 5,
                        color: "#000000",
                      }}
                    >
                      Technical Skills
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2, fontSize: "9pt" }}>
                      {data.skills
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((line, idx) => {
                          const colonIndex = line.indexOf(":");
                          if (colonIndex > 0) {
                            const category = line.slice(0, colonIndex);
                            const items = line.slice(colonIndex + 1);
                            return (
                              <div key={idx} style={{ lineHeight: 1.35 }}>
                                <span style={{ fontWeight: 700 }}>{category}:</span>
                                <span>{items}</span>
                              </div>
                            );
                          }
                          return (
                            <div key={idx} style={{ lineHeight: 1.35 }}>
                              {line}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* 3. Work Experience */}
                {data.experience && data.experience.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <h2
                      style={{
                        fontSize: "11pt",
                        fontWeight: 700,
                        borderBottom: "1px solid #000000",
                        paddingBottom: 1,
                        marginBottom: 5,
                        color: "#000000",
                      }}
                    >
                      Experience
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {data.experience.map((exp, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <span style={{ fontWeight: 700, fontSize: "9.5pt", color: "#000000" }}>
                              {exp.company}
                            </span>
                            <span style={{ fontWeight: 700, fontSize: "9.5pt", color: "#000000" }}>
                              {exp.duration}
                            </span>
                          </div>
                          {(exp.role || exp.location) && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontStyle: "italic", fontSize: "9pt", color: "#111827", marginBottom: 2 }}>
                              <span>{exp.role}</span>
                              <span>{exp.location}</span>
                            </div>
                          )}
                          {exp.description && (
                            <ul
                              style={{
                                listStyleType: "disc",
                                paddingLeft: 16,
                                margin: "2px 0 0",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                fontSize: "9pt",
                                lineHeight: 1.3,
                                color: "#000000",
                              }}
                            >
                              {exp.description
                                .split("\n")
                                .filter((line) => line.trim())
                                .map((line, idx) => (
                                  <li key={idx}>{line.replace(/^[•\-\*]\s*/, "")}</li>
                                ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Projects (with Project Timelines) */}
                {data.projects && data.projects.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <h2
                      style={{
                        fontSize: "11pt",
                        fontWeight: 700,
                        borderBottom: "1px solid #000000",
                        paddingBottom: 1,
                        marginBottom: 5,
                        color: "#000000",
                      }}
                    >
                      Projects
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {data.projects.map((pro, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <div style={{ fontSize: "9.5pt" }}>
                              <span style={{ fontWeight: 700, color: "#000000" }}>
                                {pro.name}
                              </span>
                              {pro.subtitle && (
                                <span style={{ fontWeight: 700, color: "#000000" }}>
                                  {" "}
                                  | {pro.subtitle}
                                </span>
                              )}
                              {pro.techStack && (
                                <span style={{ fontStyle: "italic", fontSize: "9pt", color: "#111827" }}>
                                  {" "}
                                  | {pro.techStack}
                                </span>
                              )}
                            </div>
                            {pro.timeline && (
                              <span style={{ fontWeight: 700, fontSize: "9.5pt", color: "#000000", whiteSpace: "nowrap", marginLeft: 12 }}>
                                {pro.timeline}
                              </span>
                            )}
                          </div>
                          {pro.description && (
                            <ul
                              style={{
                                listStyleType: "disc",
                                paddingLeft: 16,
                                margin: "2px 0 0",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                fontSize: "9pt",
                                lineHeight: 1.3,
                                color: "#000000",
                              }}
                            >
                              {pro.description
                                .split("\n")
                                .filter((line) => line.trim())
                                .map((line, idx) => (
                                  <li key={idx}>{line.replace(/^[•\-\*]\s*/, "")}</li>
                                ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Custom / Additional Sections (Certifications, Achievements, Positions of Responsibility) */}
                {data.customSections &&
                  data.customSections.map((sec, idx) => {
                    if (!sec.title && !sec.content) return null;
                    return (
                      <div key={sec.id || idx} style={{ marginBottom: 12 }}>
                        <h2
                          style={{
                            fontSize: "11pt",
                            fontWeight: 700,
                            borderBottom: "1px solid #000000",
                            paddingBottom: 1,
                            marginBottom: 5,
                            color: "#000000",
                          }}
                        >
                          {sec.title || "Additional Section"}
                        </h2>
                        <div style={{ fontSize: "9pt", lineHeight: 1.35, color: "#000000" }}>
                          {sec.content
                            .split("\n")
                            .filter((line) => line.trim())
                            .map((line, lineIdx) => {
                              const isBullet = /^[•\-\*]/.test(line.trim());
                              if (isBullet) {
                                return (
                                  <div key={lineIdx} style={{ paddingLeft: 16, textIndent: -12, margin: "1px 0" }}>
                                    • {line.replace(/^[•\-\*]\s*/, "")}
                                  </div>
                                );
                              }
                              return (
                                <div key={lineIdx} style={{ margin: "1px 0" }}>
                                  {line}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default ResumeBuilder;
