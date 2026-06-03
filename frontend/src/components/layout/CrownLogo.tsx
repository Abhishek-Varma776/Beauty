import { useNavigate } from "react-router-dom";

export const CrownLogo = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      title="Mani's Elite Makeover Studio — Home"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {/* 3D Gold Crown SVG */}
      <span
        className="animate-crown-idle animate-gold-glow"
        style={{ display: "inline-block", transformStyle: "preserve-3d" }}
      >
        <svg
          width="40"
          height="36"
          viewBox="0 0 80 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 0 8px rgba(201,162,39,0.9))" }}
        >
          {/* Crown base */}
          <defs>
            <linearGradient id="crownGold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c9a227" />
              <stop offset="30%" stopColor="#ffe57a" />
              <stop offset="60%" stopColor="#f0c94e" />
              <stop offset="100%" stopColor="#8a6e1a" />
            </linearGradient>
            <linearGradient id="crownShine" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffe57a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c9a227" stopOpacity="0.3" />
            </linearGradient>
            <filter id="crownGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Crown body */}
          <path
            d="M8 56 L12 24 L28 40 L40 8 L52 40 L68 24 L72 56 Z"
            fill="url(#crownGold)"
            stroke="#ffe57a"
            strokeWidth="1.5"
            strokeLinejoin="round"
            filter="url(#crownGlow)"
          />

          {/* Shine overlay on crown */}
          <path
            d="M8 56 L12 24 L28 40 L40 8 L52 40 L68 24 L72 56 Z"
            fill="url(#crownShine)"
            opacity="0.4"
          />

          {/* Crown base band */}
          <rect x="8" y="55" width="64" height="10" rx="3"
            fill="url(#crownGold)" stroke="#ffe57a" strokeWidth="1" />
          <rect x="8" y="55" width="64" height="4" rx="2"
            fill="#ffe57a" opacity="0.3" />

          {/* Gems on crown peaks */}
          <circle cx="40" cy="9" r="5" fill="#ff4d94" stroke="#ffe57a" strokeWidth="1.5" />
          <circle cx="40" cy="9" r="2.5" fill="#ffb3d1" opacity="0.8" />

          <circle cx="12.5" cy="24.5" r="4" fill="#4db8ff" stroke="#ffe57a" strokeWidth="1.2" />
          <circle cx="12.5" cy="24.5" r="2" fill="#b3e0ff" opacity="0.8" />

          <circle cx="67.5" cy="24.5" r="4" fill="#4db8ff" stroke="#ffe57a" strokeWidth="1.2" />
          <circle cx="67.5" cy="24.5" r="2" fill="#b3e0ff" opacity="0.8" />

          {/* Gem on base */}
          <circle cx="40" cy="60" r="4" fill="#c9a227" stroke="#ffe57a" strokeWidth="1" />
          <circle cx="25" cy="60" r="3" fill="#c9a227" stroke="#ffe57a" strokeWidth="1" />
          <circle cx="55" cy="60" r="3" fill="#c9a227" stroke="#ffe57a" strokeWidth="1" />

          {/* Highlight lines for 3D effect */}
          <line x1="40" y1="8" x2="40" y2="55" stroke="#ffe57a" strokeWidth="0.5" opacity="0.3" />
        </svg>
      </span>

      {/* Brand text */}
      <span
        style={{
          fontFamily: "'Cinzel', 'Playfair Display', serif",
          fontWeight: 700,
          fontSize: "1.1rem",
          lineHeight: 1.2,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        <span className="text-gold-gradient" style={{ fontSize: "1.15rem", letterSpacing: "0.04em" }}>
          Mani's Elite
        </span>
        <span style={{ color: "#e8d5a3", fontSize: "0.7rem", letterSpacing: "0.18em", fontWeight: 400 }}>
          MAKEOVER STUDIO
        </span>
      </span>
    </button>
  );
};
