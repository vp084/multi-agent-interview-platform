import { motion } from "motion/react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";
import { FiCode, FiUserCheck, FiAward } from "react-icons/fi";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        style={{
          background: "var(--white)",
          color: "var(--ink)",
          padding: "8px 14px",
          border: "1px solid var(--rule)",
          borderRadius: 10,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 12,
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
          backdropFilter: "blur(12px)",
        }}
      >
        <span style={{ fontWeight: 700, display: "block" }}>
          {data.payload.skill}
        </span>
        <span style={{ color: "var(--indigo)", fontWeight: 600, fontSize: 11 }}>
          Score: {data.value}%
        </span>
      </div>
    );
  }
  return null;
};

function InterviewGraph({
  technicalData = [],
  hrData = [],
  technicalCount = 0,
  hrCount = 0,
}) {
  const renderChart = (title, count, data, accentColor, icon) => {
    const hasData = count > 0 && data.some((d) => d.score > 0);

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="saas-card"
        style={{
          padding: "24px 26px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          flex: 1,
          minWidth: 280,
          borderRadius: 18,
          border: "1px solid var(--rule)",
          boxShadow: "var(--card-shadow)",
          background: "var(--white)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            borderBottom: "1px solid var(--rule)",
            paddingBottom: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 36,
                border: `1px solid ${accentColor}33`,
                background: `var(--cream)`,
                color: accentColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            >
              {icon}
            </div>
            <div>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  margin: 0,
                  color: "var(--ink)",
                }}
              >
                {title}
              </h3>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--stone)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {count} {count === 1 ? "Session" : "Sessions"} Evaluated
              </span>
            </div>
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: 9999,
              background: hasData ? "var(--cream)" : "var(--parchment)",
              color: hasData ? accentColor : "var(--stone)",
              border: `1px solid ${hasData ? `${accentColor}44` : "var(--rule)"}`,
            }}
          >
            {hasData ? "Active Radar" : "Needs Session"}
          </span>
        </div>

        {/* Radar Chart */}
        <div
          style={{
            height: 230,
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="75%">
                <PolarGrid stroke="var(--rule)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{
                    fill: "var(--stone)",
                    fontSize: 9,
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name={title}
                  dataKey="score"
                  stroke={accentColor}
                  fill={accentColor}
                  fillOpacity={0.28}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "24px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FiAward size={28} color="var(--stone)" />
              <p
                style={{
                  fontSize: 12,
                  color: "var(--stone)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  margin: 0,
                  maxWidth: 240,
                }}
              >
                No completed {title.toLowerCase()} data yet. Complete an interview to generate your radar.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 18,
      }}
    >
      {renderChart(
        "Technical Intelligence Radar",
        technicalCount,
        technicalData,
        "var(--blue)",
        <FiCode size={16} />
      )}
      {renderChart(
        "Behavioral & HR Competency",
        hrCount,
        hrData,
        "var(--sienna)",
        <FiUserCheck size={16} />
      )}
    </div>
  );
}

export default InterviewGraph;
