import React from "react";
import { Link } from "react-router-dom";
import { POLICIES } from "../components/layout/Footer";
import type { PolicyType } from "../components/layout/Footer";
import { ArrowLeft } from "lucide-react";

interface PolicyPageProps {
  type: Exclude<PolicyType, null>;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({ type }) => {
  const policy = POLICIES[type];

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", color: "#e8d5a3", padding: "6rem 1rem 4rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Back Link */}
        <Link 
          to="/" 
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "0.5rem", 
            color: "#c9a227", 
            textDecoration: "none", 
            fontSize: "0.9rem",
            marginBottom: "2rem",
            transition: "color 0.2s"
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#e8d5a3")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#c9a227")}
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          {policy.icon}
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#e8d5a3", margin: 0 }}>
            {policy.title}
          </h1>
        </div>
        <p style={{ color: "#666", fontSize: "0.85rem", margin: "0 0 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "1rem" }}>
          {policy.subtitle}
        </p>

        {/* Content Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {policy.sections.map((section, idx) => (
            <div 
              key={idx} 
              style={{ 
                padding: "1.5rem", 
                borderRadius: "1rem", 
                background: "rgba(255,255,255,0.01)", 
                border: "1px solid rgba(201,162,39,0.15)" 
              }}
            >
              <h2 style={{ fontSize: "1.15rem", color: "#c9a227", fontWeight: 600, marginTop: 0, marginBottom: "1rem" }}>
                {section.heading}
              </h2>
              <div style={{ color: "#aaa", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {section.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
