import type { ReactNode } from "react";
import { Clock3, IndianRupee, Sparkles, Home } from "lucide-react";

import type { Service } from "../../types/domain";

export const ServiceCard = ({
  service,
  action,
}: {
  service: Service;
  action?: ReactNode;
}) => (
  <article
    style={{
      position: "relative",
      borderRadius: "1.5rem",
      overflow: "hidden",
      border: "1px solid rgba(201,162,39,0.2)",
      background: "linear-gradient(145deg, #111111 0%, #0f0e00 100%)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,162,39,0.06)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
      cursor: "default",
    }}
    onMouseEnter={(e) => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = "translateY(-6px)";
      el.style.boxShadow = "0 20px 48px rgba(201,162,39,0.15), 0 4px 24px rgba(0,0,0,0.5)";
      el.style.borderColor = "rgba(201,162,39,0.5)";
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = "translateY(0)";
      el.style.boxShadow = "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,162,39,0.06)";
      el.style.borderColor = "rgba(201,162,39,0.2)";
    }}
  >
    {/* Image */}
    {service.image_url ? (
      <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
        <img
          src={service.image_url}
          alt={service.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1.08)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"; }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, #111111 0%, rgba(15,14,0,0.3) 60%, transparent 100%)",
        }} />
        {/* Sparkle badge */}
        <div style={{
          position: "absolute",
          top: "0.75rem",
          right: "0.75rem",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "rgba(201,162,39,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(201,162,39,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Sparkles size={14} style={{ color: "#c9a227" }} />
        </div>
      </div>
    ) : (
      <div style={{
        height: "200px",
        background: "linear-gradient(135deg, #1a1500 0%, #0f0d00 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
      }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "rgba(201,162,39,0.1)",
          border: "1px solid rgba(201,162,39,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Sparkles size={28} style={{ color: "#c9a227" }} />
        </div>
      </div>
    )}

    {/* Content */}
    <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      {/* Title row */}
      <div>
        <h3 style={{
          fontFamily: "'Cinzel', 'Playfair Display', serif",
          color: "#e8d5a3",
          fontSize: "1.1rem",
          fontWeight: 700,
          margin: "0 0 0.375rem",
          lineHeight: 1.3,
        }}>
          {service.name}
        </h3>
        <p style={{
          color: "#666",
          fontSize: "0.8rem",
          lineHeight: 1.6,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {service.description}
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, rgba(201,162,39,0.25), transparent)" }} />

      {/* Price & Duration row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <IndianRupee size={16} style={{ color: "#c9a227" }} />
          <span style={{ color: "#c9a227", fontSize: "1.3rem", fontWeight: 700, fontFamily: "'Cinzel', serif" }}>
            {service.price}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#555", fontSize: "0.8rem" }}>
          <Clock3 size={13} />
          <span>{service.duration_min} min</span>
        </div>
      </div>

      {/* Home service badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <Home size={12} style={{ color: "#c9a227" }} />
        <span style={{ color: "#c9a227", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.05em" }}>
          HOME SERVICE AVAILABLE
        </span>
      </div>

      {/* Action */}
      {action && (
        <div style={{ marginTop: "0.25rem" }}>
          {action}
        </div>
      )}
    </div>
  </article>
);
