import React, { useState } from "react";
import { motion } from "motion/react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiBriefcase,
  FiCheck,
  FiCheckCircle,
  FiFileText,
  FiUploadCloud,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiUserCheck,
  FiVideo,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useCoins } from "../../apis/user.api";
import api from "../../utils/axios";
import { setResume } from "../../redux/resumeSlice";
import { startInterview } from "../../apis/interview.api";

function Step1setup({ user, setUser }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { resume } = useSelector((state) => state.resume);

  const [role, setRole] = useState("Embedded Engineer");
  const [type, setType] = useState("mixed");
  const [length, setLength] = useState("full");
  const [useResume, setUseResume] = useState(!!resume);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [starting, setStarting] = useState(false);

  // Interviewer Persona (Male by default as requested)
  const [interviewerGender, setInterviewerGender] = useState(
    localStorage.getItem("preferredInterviewerGender") || "male"
  );

  const handleGenderChange = (gender) => {
    setInterviewerGender(gender);
    localStorage.setItem("preferredInterviewerGender", gender);
  };

  const setupTotalCount = length === "quick" ? 8 : length === "full" ? 16 : 12;
  const setupHrCount = Math.max(1, Math.round(setupTotalCount / 3));
  const setupTechCount = setupTotalCount - setupHrCount;

  const uploadResume = async () => {
    if (!file) {
      alert("Please select a PDF");
      return;
    }
    try {
      setUploading(true);
      try {
        const coinResponse = await useCoins({ coins: 10, action: "resume-scorer" });
        setUser((prev) => ({
          ...prev,
          interviewCoin: coinResponse?.interviewCoin,
        }));
      } catch (error) {
        setUploading(false);
        alert("Failed to use coins.");
        return;
      }

      const formData = new FormData();
      formData.append("resume", file);

      const response = await api.post("/api/resume/upload", formData);
      const uploadedData = response?.data?.data;
      dispatch(setResume(uploadedData));
      if (!role && uploadedData?.suggestedRole) {
        setRole(uploadedData.suggestedRole);
      }
      setUploading(false);
      setFile(null);
    } catch (error) {
      console.log(error);
      alert("Upload failed");
      setUploading(false);
    }
  };

  const start = async () => {
    if (!role?.trim()) {
      alert("Please specify your target role before starting.");
      return;
    }

    setStarting(true);
    // Ensure gender preference is saved for step 2
    localStorage.setItem("preferredInterviewerGender", interviewerGender);

    try {
      const response = await startInterview({
        role: role.trim(),
        type,
        length,
        useResume,
        resume,
      });

      if (response && response.interviewId) {
        try {
          const coinResponse = await useCoins({
            coins: 50,
            action: "start-interview",
          });
          if (coinResponse?.interviewCoin !== undefined) {
            setUser((prev) => ({
              ...prev,
              interviewCoin: coinResponse.interviewCoin,
            }));
          }
        } catch (coinError) {
          console.warn("Coin deduction warning:", coinError);
        }

        setStarting(false);
        navigate(`/interview/${response.interviewId}`);
        return;
      } else {
        setStarting(false);
        alert(response?.message || "Failed to start interview. Please try again.");
      }
    } catch (err) {
      console.error("Start interview error:", err);
      setStarting(false);
      alert("An error occurred starting the interview. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#07080B] text-zinc-100 flex items-center justify-center p-3 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient background glow accents */}
      <div className="absolute -top-36 left-1/4 w-[480px] h-[480px] bg-orange-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-36 right-1/4 w-[480px] h-[480px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-5xl bg-[#0D0F15]/95 backdrop-blur-2xl border border-white/10 rounded-3xl overflow-hidden grid lg:grid-cols-[38%_62%] shadow-[0_24px_80px_rgba(0,0,0,0.85)] relative z-10"
      >
        {/* LEFT COLUMN: Candidate Profile & Protocol Briefing */}
        <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between gap-6 bg-gradient-to-b from-white/[0.02] to-transparent">
          <div className="space-y-5">
            {/* Top Bar: Back Button & Coin Badge */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <FiArrowLeft size={13} className="text-zinc-400 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-xs font-medium text-zinc-300">Back</span>
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <span>🪙</span>
                <span>{user?.interviewCoin ?? 150} Coins</span>
              </div>
            </div>

            {/* Greeting */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium tracking-wide uppercase">
                <FiUserCheck size={11} />
                <span>Verified Candidate</span>
              </div>

              <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Welcome back,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                  {user?.name || "Candidate"}
                </span>
              </h2>

              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-zinc-400">
                Experience realistic AI technical &amp; behavioral interviews with real-time speech, instant feedback, and comprehensive rubrics.
              </p>
            </div>

            {/* 4 Feature Highlights */}
            <div className="space-y-2.5 pt-2">
              {[
                {
                  title: "Role-Specific Scenarios",
                  desc: "Tailored rubrics & adaptive difficulty",
                  icon: <FiTarget size={14} className="text-orange-400" />,
                  bg: "bg-orange-500/10 border-orange-500/20",
                },
                {
                  title: "Resume-Grounded Questions",
                  desc: "Evaluates your authentic projects & stack",
                  icon: <FiFileText size={14} className="text-cyan-400" />,
                  bg: "bg-cyan-500/10 border-cyan-500/20",
                },
                {
                  title: "In-Depth Performance Report",
                  desc: "STAR grading, strengths & skill gaps",
                  icon: <FiAward size={14} className="text-purple-400" />,
                  bg: "bg-purple-500/10 border-purple-500/20",
                },
                {
                  title: "Interactive AI Video Avatar",
                  desc: "Male interviewer with dynamic voice",
                  icon: <FiVideo size={14} className="text-emerald-400" />,
                  bg: "bg-emerald-500/10 border-emerald-500/20",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 transition-colors hover:border-white/10"
                >
                  <div className={`w-8 h-8 shrink-0 rounded-lg ${item.bg} border flex items-center justify-center`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm font-semibold text-zinc-200">{item.title}</div>
                    <div className="text-[11px] text-zinc-500 truncate">{item.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-[11px] text-zinc-500 flex items-center justify-between">
            <span>Powered by ApexPath Multi-Agent AI</span>
            <span className="text-emerald-400 font-medium">Ready 🟢</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Configuration Parameters */}
        <div className="p-6 sm:p-8 flex flex-col justify-between bg-[#0A0C11]">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-orange-400 tracking-wider uppercase">
                  Simulation Parameters
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                  Start Interview
                </h3>
              </div>
              <span className="text-xs text-zinc-500">Step 1 of 2</span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Configure your interview persona, duration, and question distribution.
            </p>

            <div className="mt-5 space-y-4">
              {/* AI Interviewer Persona (Male AI Standard) */}
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-lg shrink-0">
                  👨‍💼
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Male AI Interviewer</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      Standard
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">
                    Interactive male persona with speech &amp; video synthesis
                  </div>
                </div>
              </div>


              {/* Target Role Input & Quick Suggestions */}
              <div>
                <label className="text-xs font-semibold text-zinc-300">Target Role</label>
                <div className="mt-1.5 relative">
                  <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={15} />
                  <input
                    type="text"
                    onChange={(e) => setRole(e.target.value)}
                    value={role}
                    placeholder="e.g. Embedded Engineer, VLSI Engineer, Backend Developer"
                    className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/10 pl-10 pr-4 text-sm text-white outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition placeholder:text-zinc-600"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[
                    "Embedded Engineer",
                    "VLSI Engineer",
                    "Electronics Engineer",
                    "Backend Developer",
                    "Full Stack Developer",
                  ].map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setRole(item)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        role === item
                          ? "bg-orange-500 text-white font-semibold shadow-sm"
                          : "bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08] border border-white/5"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview Length */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">Interview Length</label>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {length === "quick" && "8 Questions • ~15-20 min"}
                    {length === "standard" && "12 Questions • ~25-35 min"}
                    {length === "full" && "16 Questions • ~40-50 min"}
                  </span>
                </div>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10">
                  {[
                    { id: "quick", label: "Quick (8 Qs)" },
                    { id: "standard", label: "Standard (12 Qs)" },
                    { id: "full", label: "Full (16 Qs)" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLength(item.id)}
                      className={`h-9 rounded-lg text-xs font-medium transition-all ${
                        length === item.id
                          ? "bg-white text-black font-bold shadow-md"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview Focus Type */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">Interview Focus</label>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {type === "mixed" && `${setupTechCount} Technical + ${setupHrCount} Behavioral`}
                    {type === "technical" && `${setupTotalCount} Technical Questions`}
                    {type === "hr" && `${setupTotalCount} HR / Behavioral Questions`}
                  </span>
                </div>
                <div className="mt-1.5 grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10">
                  {[
                    { id: "mixed", label: "Mixed Focus" },
                    { id: "technical", label: "Technical Only" },
                    { id: "hr", label: "HR / Behavioral" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id)}
                      className={`h-9 rounded-lg text-xs font-medium transition-all ${
                        type === item.id
                          ? "bg-white text-black font-bold shadow-md"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Use Resume Card */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-white">Tailor to Resume</h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Ground adaptive questions in your uploaded projects &amp; experience.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUseResume(!useResume)}
                    className={`relative shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer ${
                      useResume ? "bg-orange-500" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
                        useResume ? "left-5.5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {resume && useResume && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-300"
                  >
                    <div className="flex items-center gap-2">
                      <FiCheckCircle size={14} className="text-emerald-400" />
                      <span>Resume Active: <b className="text-white">{resume.suggestedRole || "Detected"}</b></span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-5 mt-4 border-t border-white/5">
            <motion.button
              type="button"
              onClick={start}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={!role || starting}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:opacity-95 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 transition shadow-[0_4px_24px_rgba(249,115,22,0.3)] cursor-pointer"
            >
              {starting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Launching Simulation...</span>
                </>
              ) : (
                <>
                  <span>Start Interview</span>
                  <FiArrowRight size={16} />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Step1setup;
