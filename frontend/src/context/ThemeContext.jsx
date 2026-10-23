import React, { createContext, useContext, useEffect, useState } from "react";
import { motion } from "motion/react";
import { FiSun, FiMoon } from "react-icons/fi";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  isDark: false,
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("apexpath-theme") || localStorage.getItem("nexcareer-theme");
      if (saved === "dark" || saved === "light") return saved;
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    } catch (e) {}
    return "light";
  });

  useEffect(() => {
    try {
      localStorage.setItem("apexpath-theme", theme);
    } catch (e) {}

    const root = document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

/**
 * Interactive toggle switch with Moon in night mode and Sun in light mode
 */
export const ThemeToggle = ({ compact = false, showLabel = true, className = "" }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        role="switch"
        aria-checked={isDark}
        title={isDark ? "Switch to Light Mode" : "Switch to Night Mode"}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all cursor-pointer ${className}`}
        style={{
          background: isDark ? "var(--cream)" : "var(--cream)",
          border: "1px solid var(--rule)",
          color: isDark ? "var(--amber)" : "var(--sienna)",
        }}
      >
        <motion.div
          key={theme}
          initial={{ rotate: -45, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 45, scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? <FiMoon size={16} /> : <FiSun size={16} />}
        </motion.div>
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {showLabel && (
        <span
          className="text-xs font-medium cursor-pointer select-none transition-colors"
          onClick={toggleTheme}
          style={{ color: "var(--stone)" }}
        >
          {isDark ? "Night Mode" : "Light Mode"}
        </span>
      )}
      <button
        onClick={toggleTheme}
        type="button"
        role="switch"
        aria-checked={isDark}
        title={isDark ? "Switch to Light Mode" : "Switch to Night Mode"}
        className="relative flex items-center cursor-pointer select-none transition-all"
        style={{
          width: 52,
          height: 28,
          borderRadius: 9999,
          background: isDark ? "var(--rule)" : "var(--cream)",
          border: "1.5px solid var(--rule)",
          padding: 2,
        }}
      >
        {/* Track Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          <FiSun
            size={12}
            style={{
              color: isDark ? "var(--stone)" : "var(--amber)",
              opacity: isDark ? 0.35 : 0.9,
              transition: "opacity 0.2s, color 0.2s",
            }}
          />
          <FiMoon
            size={12}
            style={{
              color: isDark ? "var(--indigo)" : "var(--stone)",
              opacity: isDark ? 0.95 : 0.35,
              transition: "opacity 0.2s, color 0.2s",
            }}
          />
        </div>

        {/* Sliding Thumb Knob */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            width: 22,
            height: 22,
            borderRadius: 9999,
            background: isDark ? "var(--ink)" : "var(--white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isDark
              ? "0 2px 6px rgba(0,0,0,0.5)"
              : "0 2px 6px rgba(0,0,0,0.15)",
            zIndex: 1,
            marginLeft: isDark ? "auto" : 0,
          }}
        >
          <motion.div
            key={theme}
            initial={{ scale: 0.5, rotate: isDark ? -30 : 30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isDark ? (
              <FiMoon size={12} color="#F59E0B" />
            ) : (
              <FiSun size={12} color="#D97706" />
            )}
          </motion.div>
        </motion.div>
      </button>
    </div>
  );
};

export default ThemeContext;
