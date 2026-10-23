import { motion, AnimatePresence } from "motion/react";
import { GiCoins } from "react-icons/gi";
import {
  FiSidebar,
  FiPlus,
  FiFileText,
  FiStar,
  FiMap,
  FiLogOut,
  FiGrid,
  FiCreditCard,
} from "react-icons/fi";
import { FaCirclePlus } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";
import BrandLogo, { BrandLogoIcon } from "./BrandLogo";
import { ThemeToggle } from "../context/ThemeContext";

const navItems = [
  {
    icon: <FiGrid size={14} />,
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <FiFileText size={14} />,
    label: "Resume Builder",
    path: "/resume",
    badge: "ATS",
    badgeColor: "var(--emerald)",
    badgeBg: "var(--emerald-bg)",
  },
  {
    icon: <FiStar size={14} />,
    label: "Resume Scorer",
    path: "/scorer",
    badge: "ATS",
    badgeColor: "var(--sienna)",
    badgeBg: "var(--amber-bg)",
  },
  {
    icon: <FiMap size={14} />,
    label: "Roadmap Builder",
    path: "/roadmap",
    badge: "PATH",
    badgeColor: "var(--indigo)",
    badgeBg: "var(--indigo-bg)",
  },
  {
    icon: <FiCreditCard size={14} />,
    label: "Billing & Plans",
    path: "/billing",
    badge: "TOP-UP",
    badgeColor: "var(--amber)",
    badgeBg: "var(--amber-bg)",
  },
];

function Sidebar({
  user,
  onNewInterview,
  onLogout,
  sidebarOpen,
  setSidebarOpen,
  mobileOpen,
  setMobileOpen,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const avatar = user?.name
    ? user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "U";

  const Inner = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--white)",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "0 14px",
          height: 52,
          borderBottom: "1px solid var(--rule)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarOpen ? "space-between" : "center",
        }}
      >
        {sidebarOpen ? (
          <div onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
            <BrandLogo size="md" />
          </div>
        ) : (
          <div onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
            <BrandLogoIcon size={24} />
          </div>
        )}

        {/* Desktop collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden md:flex"
          style={{
            color: "var(--stone)",
            cursor: "pointer",
            padding: 4,
            background: "none",
            border: "none",
            transition: "color 0.15s",
          }}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          <FiSidebar size={14} />
        </button>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex"
          style={{
            color: "var(--stone)",
            cursor: "pointer",
            padding: 4,
            background: "none",
            border: "none",
          }}
        >
          <FiSidebar size={14} />
        </button>
      </div>

      {/* Primary Action Button */}
      <div style={{ padding: "14px 10px 8px", flexShrink: 0 }}>
        <button
          onClick={onNewInterview}
          className="btn-primary"
          style={{
            width: "100%",
            justifyContent: "center",
            padding: sidebarOpen ? "10px 14px" : "10px 0",
            fontSize: 12,
            gap: 8,
          }}
        >
          <FiPlus size={14} />
          {sidebarOpen && <span>Create Interview</span>}
        </button>
      </div>

      {/* Section Label */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={{
              padding: "14px 14px 6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span className="label-caps">PLATFORM AGENTS</span>
            <span style={{ fontSize: 9, fontFamily: "monospace", color: "var(--stone)" }}>v2.0</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, padding: "8px 12px", flex: 1, overflowY: "auto" }}>
        {navItems.map((nav, index) => {
          const isActive = location.pathname === nav.path;
          return (
            <button
              key={index}
              onClick={() => {
                navigate(nav.path);
                setMobileOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: sidebarOpen ? "10px 14px" : "10px 0",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                cursor: "pointer",
                borderRadius: "var(--radius-md)",
                border: isActive ? "1px solid var(--accent)" : "1px solid transparent",
                background: isActive ? "var(--cream)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--stone)",
                boxShadow: isActive ? "var(--shadow-sm)" : "none",
                transition: "all 0.15s ease",
                textAlign: "left",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--cream)";
                  e.currentTarget.style.color = "var(--ink)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--stone)";
                }
              }}
            >
              <span style={{ flexShrink: 0, fontSize: 16 }}>{nav.icon}</span>
              {sidebarOpen && <span style={{ flex: 1, whiteSpace: "nowrap" }}>{nav.label}</span>}
              {sidebarOpen && nav.badge && (
                <span
                  style={{
                    fontSize: 9,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    background: nav.badgeBg || (isActive ? "var(--indigo-bg)" : "var(--cream)"),
                    color: nav.badgeColor || (isActive ? "var(--indigo)" : "var(--stone)"),
                    border: `1px solid ${nav.badgeColor ? `${nav.badgeColor}33` : "var(--rule)"}`,
                    borderRadius: 9999,
                  }}
                >
                  {nav.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Coins & User Footer */}
      <div style={{ borderTop: "1px solid var(--rule)", padding: "14px 12px", flexShrink: 0, background: "var(--cream)" }}>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={() => navigate("/billing")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                border: "1px solid var(--rule)",
                borderRadius: 14,
                background: "var(--white)",
                padding: "10px 12px",
                marginBottom: 10,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--indigo)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--rule)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--amber-bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                  <GiCoins size={15} color="var(--amber)" />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span className="label-caps" style={{ fontSize: 8, padding: 0, background: "transparent", border: "none" }}>Interview Coins</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: "var(--ink)", lineHeight: 1.2 }}>
                    {user?.interviewCoin ?? user?.interviewCoins ?? 150}
                  </span>
                </div>
              </div>
              <FaCirclePlus size={15} color="var(--indigo)" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Theme Mode Switch */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarOpen ? "space-between" : "center",
            padding: sidebarOpen ? "8px 6px" : "8px 0",
            marginBottom: 8,
            borderBottom: "1px solid var(--rule)",
          }}
        >
          {sidebarOpen ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <span className="label-caps" style={{ fontSize: 9 }}>Theme</span>
              <ThemeToggle showLabel={true} />
            </div>
          ) : (
            <ThemeToggle compact={true} />
          )}
        </div>

        {/* User Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: sidebarOpen ? "flex-start" : "center", padding: sidebarOpen ? "0 4px" : 0 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4F46E5 0%, #38BDF8 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.04em",
              boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
            }}
          >
            {avatar}
          </div>

          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ flex: 1, minWidth: 0 }}
              >
                <p style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                  {user?.name || "User"}
                </p>
                <p style={{ fontSize: 10, color: "var(--stone)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>
                  {user?.email || "user@mail.com"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {sidebarOpen && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onLogout}
                title="Log Out"
                style={{
                  color: "var(--stone)",
                  cursor: "pointer",
                  padding: 4,
                  background: "none",
                  border: "none",
                  marginLeft: "auto",
                  transition: "color 0.15s",
                }}
              >
                <FiLogOut size={13} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 250 : 64 }}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        className="hidden md:flex"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          background: "var(--white)",
          borderRight: "1px solid var(--rule)",
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.02)",
          flexDirection: "column",
          zIndex: 40,
          overflow: "hidden",
        }}
      >
        <Inner />
      </motion.aside>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 40,
            }}
            className="md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              height: "100vh",
              width: 270,
              maxWidth: "85vw",
              background: "var(--white)",
              borderRight: "1px solid var(--rule)",
              boxShadow: "10px 0 30px rgba(0, 0, 0, 0.15)",
              display: "flex",
              flexDirection: "column",
              zIndex: 50,
              overflow: "hidden",
            }}
          >
            <Inner />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
