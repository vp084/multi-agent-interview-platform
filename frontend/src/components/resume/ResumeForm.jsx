import { useState } from "react";
import { FiTrash2, FiPlus } from "react-icons/fi";
import { FaGithub } from "react-icons/fa";
import GitHubOptimizerModal from "./GitHubOptimizerModal";

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <label className="label-caps" style={{ fontSize: 10 }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="saas-input"
        style={{
          fontSize: 13,
          padding: "10px 14px",
          width: "100%",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <label className="label-caps" style={{ fontSize: 10 }}>{label}</label>
      <textarea
        rows={rows}
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="saas-input"
        style={{
          fontSize: 13,
          padding: "10px 14px",
          resize: "vertical",
          minHeight: 90,
          width: "100%",
          boxSizing: "border-box",
          lineHeight: 1.5,
        }}
      />
    </div>
  );
}

function EntryCard({ title, children, onRemove }) {
  return (
    <div
      className="saas-card"
      style={{
        position: "relative",
        background: "var(--cream)",
        border: "1px solid var(--rule)",
        borderRadius: 14,
        padding: 18,
        marginBottom: 14,
        boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, borderBottom: "1px solid var(--rule)", paddingBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "var(--ink)" }}>
          {title}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            title="Delete entry"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "1px solid var(--rule)",
              background: "var(--white)",
              color: "var(--stone)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#EF4444";
              e.currentTarget.style.color = "#EF4444";
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--rule)";
              e.currentTarget.style.color = "var(--stone)";
              e.currentTarget.style.background = "var(--white)";
            }}
          >
            <FiTrash2 size={13} />
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function ResumeForm({ step, data, setData }) {
  const [optimizingProjectIndex, setOptimizingProjectIndex] = useState(null);

  const handleApplyOptimizedProject = (projectData) => {
    if (optimizingProjectIndex === null) return;
    const updated = (data.projects || []).map((pro, i) =>
      i === optimizingProjectIndex ? { ...pro, ...projectData } : pro
    );
    setData({ ...data, projects: updated });
  };

  const handleOptimizeNewProject = () => {
    const newIndex = (data.projects || []).length;
    setData({
      ...data,
      projects: [
        ...(data.projects || []),
        { name: "", subtitle: "", techStack: "", timeline: "", github: "", description: "" },
      ],
    });
    setOptimizingProjectIndex(newIndex);
  };

  const handleSyncSkills = (categorizedSkills) => {
    if (!categorizedSkills) return;
    const lines = [];
    if (categorizedSkills.languages?.length) {
      lines.push(`Languages: ${categorizedSkills.languages.join(", ")}`);
    }
    if (categorizedSkills.frameworks?.length) {
      lines.push(`Frontend & Frameworks: ${categorizedSkills.frameworks.join(", ")}`);
    }
    if (categorizedSkills.databases?.length) {
      lines.push(`Databases & Storage: ${categorizedSkills.databases.join(", ")}`);
    }
    if (categorizedSkills.devops?.length) {
      lines.push(`DevOps & Cloud: ${categorizedSkills.devops.join(", ")}`);
    }
    if (categorizedSkills.architecture?.length) {
      lines.push(`Architecture & Concepts: ${categorizedSkills.architecture.join(", ")}`);
    }

    const existing = (data.skills || "").trim();
    if (!existing) {
      setData({ ...data, skills: lines.join("\n") });
    } else {
      setData({ ...data, skills: `${existing}\n${lines.join("\n")}` });
    }
  };

  // Step 2: Education Helpers

  const addEducation = () => {

    setData({
      ...data,
      education: [
        ...(data.education || []),
        { college: "", degree: "", cgpa: "", year: "", location: "" },
      ],
    });
  };

  const removeEducation = (index) => {
    setData({
      ...data,
      education: (data.education || []).filter((_, i) => i !== index),
    });
  };

  const updateEducation = (index, field, val) => {
    const updated = (data.education || []).map((edu, i) =>
      i === index ? { ...edu, [field]: val } : edu
    );
    setData({ ...data, education: updated });
  };

  const updateSchooling = (level, field, val) => {
    const currentSchooling = data.schooling || { class12: {}, class10: {} };
    setData({
      ...data,
      schooling: {
        ...currentSchooling,
        [level]: {
          ...(currentSchooling[level] || {}),
          [field]: val,
        },
      },
    });
  };

  // Step 4: Experience Helpers
  const addExperience = () => {
    setData({
      ...data,
      experience: [
        ...(data.experience || []),
        { company: "", role: "", duration: "", location: "", description: "" },
      ],
    });
  };

  const removeExperience = (index) => {
    setData({
      ...data,
      experience: (data.experience || []).filter((_, i) => i !== index),
    });
  };

  const updateExperience = (index, field, val) => {
    const updated = (data.experience || []).map((exp, i) =>
      i === index ? { ...exp, [field]: val } : exp
    );
    setData({ ...data, experience: updated });
  };

  // Step 5: Project Helpers
  const addPro = () => {
    setData({
      ...data,
      projects: [
        ...(data.projects || []),
        { name: "", subtitle: "", techStack: "", timeline: "", github: "", description: "" },
      ],
    });
  };

  const removePro = (index) => {
    setData({
      ...data,
      projects: (data.projects || []).filter((_, i) => i !== index),
    });
  };

  const updatePro = (index, field, val) => {
    const updated = (data.projects || []).map((pro, i) =>
      i === index ? { ...pro, [field]: val } : pro
    );
    setData({ ...data, projects: updated });
  };

  // Step 6: Custom / Additional Sections Helpers
  const addCustomSection = () => {
    setData({
      ...data,
      customSections: [
        ...(data.customSections || []),
        { id: `sec-${Date.now()}`, title: "Certifications", content: "" },
      ],
    });
  };

  const removeCustomSection = (index) => {
    setData({
      ...data,
      customSections: (data.customSections || []).filter((_, i) => i !== index),
    });
  };

  const updateCustomSection = (index, field, val) => {
    const updated = (data.customSections || []).map((sec, i) =>
      i === index ? { ...sec, [field]: val } : sec
    );
    setData({ ...data, customSections: updated });
  };

  // Step 1: Personal Info
  if (step === 1) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <Input
            label="Full Name"
            placeholder="e.g. ANISH PATANKAR"
            value={data.name}
            onChange={(val) => setData({ ...data, name: val })}
          />
          <Input
            label="Location (City, State, Country)"
            placeholder="e.g. Nagpur, Maharashtra, India"
            value={data.location}
            onChange={(val) => setData({ ...data, location: val })}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <Input
            label="Phone Number"
            placeholder="e.g. +91 8208795203"
            value={data.phone}
            onChange={(val) => setData({ ...data, phone: val })}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. anishpatankar974@gmail.com"
            value={data.email}
            onChange={(val) => setData({ ...data, email: val })}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <Input
            label="LinkedIn URL"
            placeholder="e.g. https://linkedin.com/in/username"
            value={data.linkedin}
            onChange={(val) => setData({ ...data, linkedin: val })}
          />
          <Input
            label="GitHub URL"
            placeholder="e.g. https://github.com/username"
            value={data.github}
            onChange={(val) => setData({ ...data, github: val })}
          />
        </div>
      </div>
    );
  }

  // Step 2: Education (University + Class 12 + Class 10)
  if (step === 2) {
    const schooling = data.schooling || { class12: {}, class10: {} };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {/* University Degrees */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="label-caps" style={{ color: "var(--sienna)" }}>
              University / College Education
            </span>
          </div>

          {(data.education || []).map((edu, idx) => (
            <EntryCard
              key={idx}
              title={`Degree #${idx + 1}`}
              onRemove={data.education.length > 1 ? () => removeEducation(idx) : null}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                <Input
                  label="College / Institution Name"
                  placeholder="e.g. Shri Ramdeobaba College of Engineering and Management"
                  value={edu.college}
                  onChange={(val) => updateEducation(idx, "college", val)}
                />
                <Input
                  label="Location"
                  placeholder="e.g. Nagpur, India"
                  value={edu.location}
                  onChange={(val) => updateEducation(idx, "location", val)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <Input
                  label="Degree & Branch Specialization"
                  placeholder="e.g. B.Tech in Computer Science and Engineering (AI & ML)"
                  value={edu.degree}
                  onChange={(val) => updateEducation(idx, "degree", val)}
                />
                <Input
                  label="CGPA / Percentage"
                  placeholder="e.g. 7.55 or 8.9 CGPA"
                  value={edu.cgpa}
                  onChange={(val) => updateEducation(idx, "cgpa", val)}
                />
                <Input
                  label="Graduation Timeline / Years"
                  placeholder="e.g. 2022 – 2026"
                  value={edu.year}
                  onChange={(val) => updateEducation(idx, "year", val)}
                />
              </div>
            </EntryCard>
          ))}

          <button
            type="button"
            onClick={addEducation}
            className="btn-secondary"
            style={{
              padding: "8px 14px",
              fontSize: 11,
              alignSelf: "flex-start",
              gap: 6,
              cursor: "pointer",
            }}
          >
            <FiPlus size={13} />
            <span>Add Another Degree</span>
          </button>
        </div>

        {/* High School & Intermediate (Class 12th & 10th) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 10, borderTop: "1px solid var(--rule)" }}>
          <span className="label-caps" style={{ color: "var(--sienna)" }}>
            Senior Secondary & Secondary (12th & 10th)
          </span>

          {/* Class XII */}
          <EntryCard title="Class XII (HSC / Senior Secondary)">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <Input
                label="Stream / Examination Label"
                placeholder="e.g. Class XII (HSC)"
                value={schooling.class12?.stream || "Class XII (HSC)"}
                onChange={(val) => updateSchooling("class12", "stream", val)}
              />
              <Input
                label="Junior College / School Name"
                placeholder="e.g. Shankarrao Bande Arts and Science College, Warud"
                value={schooling.class12?.institution || ""}
                onChange={(val) => updateSchooling("class12", "institution", val)}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <Input
                label="Score / Percentage"
                placeholder="e.g. 80.67%"
                value={schooling.class12?.score || ""}
                onChange={(val) => updateSchooling("class12", "score", val)}
              />
              <Input
                label="Passing Year"
                placeholder="e.g. 2022"
                value={schooling.class12?.year || ""}
                onChange={(val) => updateSchooling("class12", "year", val)}
              />
            </div>
          </EntryCard>

          {/* Class X */}
          <EntryCard title="Class X (SSC / Secondary)">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <Input
                label="Examination Label"
                placeholder="e.g. Class X (SSC)"
                value={schooling.class10?.stream || "Class X (SSC)"}
                onChange={(val) => updateSchooling("class10", "stream", val)}
              />
              <Input
                label="School Name"
                placeholder="e.g. NTR High School, Warud"
                value={schooling.class10?.institution || ""}
                onChange={(val) => updateSchooling("class10", "institution", val)}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
              <Input
                label="Score / Percentage"
                placeholder="e.g. 97.20%"
                value={schooling.class10?.score || ""}
                onChange={(val) => updateSchooling("class10", "score", val)}
              />
              <Input
                label="Passing Year"
                placeholder="e.g. 2020"
                value={schooling.class10?.year || ""}
                onChange={(val) => updateSchooling("class10", "year", val)}
              />
            </div>
          </EntryCard>
        </div>
      </div>
    );
  }

  // Step 3: Technical Skills
  if (step === 3) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <TextArea
          label="Categorized Technical Skills (Category: Items)"
          placeholder="Languages: Python, JavaScript, TypeScript, SQL, C, HTML, CSS&#10;Frontend: React.js, Next.js (App Router), Tailwind CSS, Three.js, WebGL, WebAssembly, Electron, Tauri&#10;Backend & APIs: Node.js, Express.js, FastAPI, Flask, REST APIs, WebSockets, MQTT, MAVLink, Microservices, JWT & OAuth&#10;AI & Machine Learning: PyTorch, Scikit-learn, PennyLane (Quantum ML), Deep Learning, CNNs, NumPy, Pandas, LLM APIs (Gemini, Claude), Prompt Engineering&#10;Databases & DevOps: PostgreSQL, MongoDB, Prisma ORM, Supabase, Docker, Vercel (Serverless & Edge), CI/CD, Git, GitHub, Postman, Linux"
          rows={9}
          value={data.skills}
          onChange={(val) => setData({ ...data, skills: val })}
        />
        <div
          style={{
            fontSize: 11,
            color: "var(--stone)",
            padding: "8px 12px",
            background: "var(--parchment)",
            border: "1px solid var(--rule)",
          }}
        >
          💡 Tip: Use the standard <b>Category: Items</b> pattern (e.g. Languages:, Frontend:, Backend & APIs:). Each line will be beautifully typeset with the category in bold on the resume.
        </div>
      </div>
    );
  }

  // Step 4: Work Experience
  if (step === 4) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {data.experience && data.experience.length > 0 ? (
          data.experience.map((exp, idx) => (
            <EntryCard key={idx} title={exp.company || `Experience #${idx + 1}`} onRemove={() => removeExperience(idx)}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <Input
                  label="Company Name"
                  placeholder="e.g. BERAM Pvt. Ltd."
                  value={exp.company}
                  onChange={(val) => updateExperience(idx, "company", val)}
                />
                <Input
                  label="Job Title / Role"
                  placeholder="e.g. Co-Founder and Software Lead"
                  value={exp.role}
                  onChange={(val) => updateExperience(idx, "role", val)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <Input
                  label="Duration / Timeline"
                  placeholder="e.g. Jun 2025 – Present"
                  value={exp.duration}
                  onChange={(val) => updateExperience(idx, "duration", val)}
                />
                <Input
                  label="Location"
                  placeholder="e.g. Nagpur, India"
                  value={exp.location}
                  onChange={(val) => updateExperience(idx, "location", val)}
                />
              </div>
              <TextArea
                label="Responsibilities & Impact (1 bullet per line)"
                placeholder="• Architect a multi-drone Unmanned Traffic Management System (UTMS) in React, Node.js, Python and MongoDB...&#10;• Built a real-time 2Hz telemetry pipeline over WebSockets and QoS-1 MQTT..."
                rows={4}
                value={exp.description}
                onChange={(val) => updateExperience(idx, "description", val)}
              />
            </EntryCard>
          ))
        ) : (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              background: "var(--parchment)",
              border: "1px dashed var(--rule)",
              color: "var(--stone)",
              fontSize: 12,
            }}
          >
            No experience records added yet.
          </div>
        )}

        <button
          type="button"
          onClick={addExperience}
          className="btn-secondary"
          style={{
            padding: "10px 16px",
            fontSize: 12,
            alignSelf: "flex-start",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <FiPlus size={14} />
          <span>Add Work Experience</span>
        </button>
      </div>
    );
  }

  // Step 5: Projects (with Timelines)
  if (step === 5) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* GitHub ATS Optimizer Banner */}
        <div
          style={{
            padding: "14px 16px",
            background: "var(--parchment)",
            border: "1px solid var(--sienna)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: "var(--sienna)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FaGithub size={20} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                AI ATS GitHub Project Analyzer
              </div>
              <div style={{ fontSize: 11, color: "var(--stone)" }}>
                Analyze real GitHub codebases, extract verified dependencies, match target JD keywords & generate interview-safe bullets.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOptimizeNewProject}
            style={{
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 600,
              background: "var(--sienna)",
              color: "#FFF",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
            }}
          >
            <FaGithub size={14} />
            <span>Import & Optimize Repo</span>
          </button>
        </div>

        {data.projects && data.projects.length > 0 ? (
          data.projects.map((pro, idx) => (
            <EntryCard key={idx} title={pro.name || `Project #${idx + 1}`} onRemove={() => removePro(idx)}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <Input
                  label="Project Title"
                  placeholder="e.g. DroSky"
                  value={pro.name}
                  onChange={(val) => updatePro(idx, "name", val)}
                />
                <Input
                  label="Subtitle / Short Description"
                  placeholder="e.g. 3D Multiplayer Drone Racing Game"
                  value={pro.subtitle}
                  onChange={(val) => updatePro(idx, "subtitle", val)}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <Input
                  label="Technologies Used"
                  placeholder="e.g. Three.js, WebGL, Electron, Node.js, WebSockets"
                  value={pro.techStack}
                  onChange={(val) => updatePro(idx, "techStack", val)}
                />
                <Input
                  label="Project Timeline / Date"
                  placeholder="e.g. Jul 2026 or May 2025 – Jul 2025"
                  value={pro.timeline}
                  onChange={(val) => updatePro(idx, "timeline", val)}
                />
              </div>

              {/* GitHub Link with AI Optimize Button */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <label className="label-caps">Project Link / GitHub URL (Optional)</label>
                  <button
                    type="button"
                    onClick={() => setOptimizingProjectIndex(idx)}
                    style={{
                      fontSize: 11,
                      background: "rgba(196, 84, 29, 0.12)",
                      border: "1px solid var(--sienna)",
                      color: "var(--sienna)",
                      padding: "3px 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <FaGithub size={13} />
                    <span>✨ AI ATS Optimize</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. https://github.com/user/project"
                  value={pro.github || ""}
                  onChange={(e) => updatePro(idx, "github", e.target.value)}
                  style={{
                    background: "var(--white)",
                    border: "1px solid var(--rule)",
                    color: "var(--ink)",
                    fontSize: 12,
                    padding: "9px 12px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <TextArea
                label="Bullet Points (1 bullet per line)"
                placeholder="• Built a 3D drone racer in Three.js with no game engine — 4 maps × 20 levels...&#10;• Implemented 6-player real-time multiplayer over a Node/ws relay..."
                rows={3}
                value={pro.description}
                onChange={(val) => updatePro(idx, "description", val)}
              />
            </EntryCard>
          ))
        ) : (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              background: "var(--parchment)",
              border: "1px dashed var(--rule)",
              color: "var(--stone)",
              fontSize: 12,
            }}
          >
            No projects added yet. Click &quot;Import &amp; Optimize Repo&quot; to auto-generate from your GitHub project!
          </div>
        )}

        <button
          type="button"
          onClick={addPro}
          className="btn-secondary"
          style={{
            padding: "10px 16px",
            fontSize: 12,
            alignSelf: "flex-start",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <FiPlus size={14} />
          <span>Add Project Manually</span>
        </button>

        {/* GitHub Optimizer Modal */}
        {optimizingProjectIndex !== null && (
          <GitHubOptimizerModal
            isOpen={optimizingProjectIndex !== null}
            projectIndex={optimizingProjectIndex}
            initialRepoUrl={data.projects?.[optimizingProjectIndex]?.github || ""}
            onClose={() => setOptimizingProjectIndex(null)}
            onApply={(projectData) => handleApplyOptimizedProject(projectData)}
            onSyncSkills={handleSyncSkills}
          />
        )}
      </div>
    );
  }



  // Step 6: Custom / Additional Sections (Certifications, Achievements, Positions of Responsibility)
  if (step === 6) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            fontSize: 11,
            color: "var(--stone)",
            padding: "8px 12px",
            background: "var(--parchment)",
            border: "1px solid var(--rule)",
          }}
        >
          💡 Tip: Add as many additional sections as you need (e.g. <b>Certifications</b>, <b>Achievements</b>, <b>Positions of Responsibility</b>, <b>Extracurricular Activities</b>).
        </div>

        {data.customSections && data.customSections.length > 0 ? (
          data.customSections.map((sec, idx) => (
            <EntryCard key={sec.id || idx} title={sec.title || `Section #${idx + 1}`} onRemove={() => removeCustomSection(idx)}>
              <Input
                label="Section Header Title"
                placeholder="e.g. Certifications, Achievements, Positions of Responsibility"
                value={sec.title}
                onChange={(val) => updateCustomSection(idx, "title", val)}
              />
              <TextArea
                label="Content (Lines or Bullet Points)"
                placeholder="Generative AI Engineering with LLMs | IBM (2025) | DevOps, DataOps, MLOps | Duke University (2025)&#10;AWS Cloud Technical Essentials | AWS (2023) | Programming in Python | Meta (2023)"
                rows={4}
                value={sec.content}
                onChange={(val) => updateCustomSection(idx, "content", val)}
              />
            </EntryCard>
          ))
        ) : (
          <div
            style={{
              padding: 24,
              textAlign: "center",
              background: "var(--parchment)",
              border: "1px dashed var(--rule)",
              color: "var(--stone)",
              fontSize: 12,
            }}
          >
            No custom sections added yet. Click below to add Certifications, Achievements, or Responsibilities.
          </div>
        )}

        <button
          type="button"
          onClick={addCustomSection}
          className="btn-secondary"
          style={{
            padding: "10px 16px",
            fontSize: 12,
            alignSelf: "flex-start",
            gap: 6,
            cursor: "pointer",
          }}
        >
          <FiPlus size={14} />
          <span>Add Custom Section</span>
        </button>
      </div>
    );
  }

  return null;
}

export default ResumeForm;
