import React from "react";

/**
 * ApexPath Brand Logo Icon
 * Refined peak-vertex monolith mark representing ascending career trajectory
 */
export function BrandLogoIcon({ size = 28, className = "" }) {
  const iconPixel = Math.round(size * 0.62);

  return (
    <div
      style={{
        width: size,
        height: size,
        border: "1.5px solid var(--ink, #1C1917)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ink, #1C1917)",
        flexShrink: 0,
        borderRadius: "var(--radius-sm, 6px)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
      className={className}
    >
      <svg
        width={iconPixel}
        height={iconPixel}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Monolith base & outer ascending peak */}
        <path
          d="M12 2.5L3.5 20H8.5L12 13L15.5 20H20.5L12 2.5Z"
          fill="var(--white, #FFFFFF)"
          fillOpacity="0.12"
          stroke="var(--white, #FFFFFF)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Central ascending career conduit path */}
        <path
          d="M12 4.5V13M12 13L9.5 18M12 13L14.5 18"
          stroke="var(--accent, #C2410C)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Apex summit vertex beacon */}
        <circle cx="12" cy="2.5" r="1.6" fill="var(--accent, #C2410C)" />
      </svg>
    </div>
  );
}

/**
 * Full ApexPath Brand Logo with typography and AI badge
 */
export default function BrandLogo({ size = "md", collapsed = false, className = "" }) {
  const iconSize = size === "sm" ? 22 : size === "lg" ? 34 : 26;
  const textSize = size === "sm" ? 14 : size === "lg" ? 20 : 16;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }} className={className}>
      <BrandLogoIcon size={iconSize} />
      {!collapsed && (
        <span
          style={{
            fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)",
            fontWeight: 800,
            fontSize: textSize,
            color: "var(--ink, #1C1917)",
            letterSpacing: "-0.02em",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span>Apex</span>
          <span style={{ fontWeight: 400, color: "var(--accent, #C2410C)", marginLeft: 1 }}>
            Path
          </span>
        </span>
      )}
    </div>
  );
}
