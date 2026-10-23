import { useState } from "react";
import { FiX, FiShield } from "react-icons/fi";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import api from "../utils/axios";
import { BrandLogoIcon } from "./BrandLogo";

import { useDispatch } from "react-redux";
import { setResume } from "../redux/resumeSlice";
import { getResume } from "../apis/resume.api";

function LoginModel({ onClose, setUser }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleAuth = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      // Force account selection so switching Google accounts is immediate and clean
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      const response = await api.post("/api/auth/login", { token });
      const loggedUser = response?.data?.user;
      setUser(loggedUser);

      // Close modal immediately so resume fetch doesn't block UI
      onClose();

      // Reset and fetch fresh resume for this specific logged-in user in background
      dispatch(setResume(null));
      getResume()
        .then((resumeResult) => dispatch(setResume(resumeResult?.data || null)))
        .catch(() => {});
    } catch (err) {
      console.error("Google authentication failed:", err);
      setError(err?.response?.data?.message || err?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(10, 12, 18, 0.65)",
        backdropFilter: "blur(10px)",
        padding: "16px",
      }}
    >
      {/* Click outside backdrop */}
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="saas-card"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          borderRadius: 24,
          border: "1px solid var(--rule)",
          overflow: "hidden",
          zIndex: 10,
          boxShadow: "0 25px 70px rgba(0,0,0,0.25)",
        }}
      >
        {/* Main content */}
        <div style={{ padding: "40px 32px 32px" }}>
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "1px solid var(--rule)",
              background: "var(--white)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--stone)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              transition: "all 0.15s ease",
            }}
          >
            <FiX size={16} />
          </button>

          {/* Brand & Heading */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 26 }}>
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 20 }}
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: "var(--radius-full)",
                background: "var(--cream)",
              }}
            >
              <BrandLogoIcon size={44} />
            </motion.div>

            <span className="saas-badge saas-badge-indigo" style={{ marginBottom: 12, fontSize: 10 }}>
              Autonomous Career Agent
            </span>

            <h2
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--ink)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Sign in to ApexPath
            </h2>
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13,
                color: "var(--stone)",
                marginTop: 8,
                lineHeight: 1.55,
                maxWidth: 290,
              }}
            >
              Accelerate your engineering journey with ATS-verified resumes and mock interviews.
            </p>
          </div>

          {/* Google login button */}
          <div style={{ marginTop: 20 }}>
            {error && (
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 12,
                  color: "#dc2626",
                  marginBottom: 12,
                  textAlign: "center",
                  lineHeight: 1.4,
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "rgba(220, 38, 38, 0.08)",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                }}
              >
                {error}
              </p>
            )}
            <motion.button
              type="button"
              disabled={loading}
              onClick={handleGoogleAuth}
              whileHover={{ y: loading ? 0 : -2 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: "13px 18px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--rule)",
                background: "var(--white)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--ink)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "var(--shadow-sm)",
                transition: "all 0.15s ease",
              }}
            >
              <FcGoogle size={20} />
              <span>{loading ? "Signing in..." : "Continue with Google"}</span>
            </motion.button>
          </div>

          <div
            style={{
              marginTop: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              color: "var(--stone)",
            }}
          >
            <FiShield size={13} color="var(--indigo)" />
            <span>Encrypted ATS & Profile storage</span>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid var(--rule)",
            background: "var(--cream)",
            padding: "14px 24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              color: "var(--stone)",
              margin: 0,
            }}
          >
            Powered by Firebase Auth & Google Cloud
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginModel;