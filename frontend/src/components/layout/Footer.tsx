import { MapPin, Phone, Mail, Clock, Heart } from "lucide-react";

export const Footer = () => (
  <footer
    id="contact"
    style={{
      background: "linear-gradient(135deg, #080808 0%, #0d0b00 50%, #080808 100%)",
      borderTop: "1px solid rgba(201,162,39,0.25)",
      color: "#e8d5a3",
    }}
  >
    <div className="section-shell" style={{ padding: "4rem 0 2rem" }}>
      <div style={{ display: "grid", gap: "2.5rem", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>

        {/* Brand */}
        <div>
          <div style={{ marginBottom: "1rem" }}>
            <h2
              style={{
                fontFamily: "'Cinzel', 'Playfair Display', serif",
                fontSize: "1.4rem",
                fontWeight: 700,
                margin: "0 0 0.25rem",
                background: "linear-gradient(135deg, #c9a227, #f0c94e, #c9a227)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Mani's Elite
            </h2>
            <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.2em", margin: 0 }}>MAKEOVER</p>
          </div>
          <p style={{ color: "#666", lineHeight: 1.7, fontSize: "0.9rem", margin: "0 0 1rem" }}>
            Premium beauty services with verified professionals. Home visits & luxury salon experience — bringing out the best in you.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Heart size={14} style={{ color: "#c9a227", fill: "#c9a227" }} />
            <span style={{ color: "#555", fontSize: "0.8rem" }}>Made with love for your beauty</span>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 style={{ color: "#c9a227", fontWeight: 600, fontSize: "1rem", marginBottom: "1rem", letterSpacing: "0.05em" }}>
            Contact & Location
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <div style={{ background: "rgba(201,162,39,0.1)", borderRadius: "50%", padding: "0.4rem", flexShrink: 0 }}>
                <MapPin size={14} style={{ color: "#c9a227" }} />
              </div>
              <span style={{ color: "#888", fontSize: "0.875rem", lineHeight: 1.5 }}>
                Hyderabad, Telangana<br />
                Home service: 25 km radius
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "rgba(201,162,39,0.1)", borderRadius: "50%", padding: "0.4rem" }}>
                <Phone size={14} style={{ color: "#c9a227" }} />
              </div>
              <span style={{ color: "#888", fontSize: "0.875rem" }}>+91 96404 49896</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "rgba(201,162,39,0.1)", borderRadius: "50%", padding: "0.4rem" }}>
                <Mail size={14} style={{ color: "#c9a227" }} />
              </div>
              <span style={{ color: "#888", fontSize: "0.875rem" }}>maniselitepujulamakeover@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Hours */}
        <div>
          <h3 style={{ color: "#c9a227", fontWeight: 600, fontSize: "1rem", marginBottom: "1rem", letterSpacing: "0.05em" }}>
            Studio Hours
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "rgba(201,162,39,0.1)", borderRadius: "50%", padding: "0.4rem" }}>
                <Clock size={14} style={{ color: "#c9a227" }} />
              </div>
              <div>
                <p style={{ color: "#e8d5a3", fontWeight: 600, margin: "0 0 2px", fontSize: "0.875rem" }}>Daily Service</p>
                <p style={{ color: "#888", margin: 0, fontSize: "0.8rem" }}>10:00 AM – 8:00 PM</p>
              </div>
            </div>
            <div
              style={{
                marginTop: "0.5rem",
                padding: "0.875rem",
                background: "rgba(201,162,39,0.06)",
                border: "1px solid rgba(201,162,39,0.2)",
                borderRadius: "0.75rem",
              }}
            >
              <p style={{ color: "#888", fontSize: "0.8rem", lineHeight: 1.5, margin: 0 }}>
                🏠 Home visits — by appointment<br />
                🏪 Salon — walk-in & appointments<br />
                📞 24/7 customer support
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid rgba(201,162,39,0.15)",
          marginTop: "3rem",
          paddingTop: "2rem",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <p style={{ color: "#444", fontSize: "0.8rem", margin: 0 }}>
          © {new Date().getFullYear()} Mani's Elite Makeover. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "#444" }}>
          <span style={{ cursor: "pointer", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a227")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
          >Privacy Policy</span>
          <span style={{ color: "#2a2a2a" }}>•</span>
          <span style={{ cursor: "pointer", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a227")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
          >Terms of Service</span>
          <span style={{ color: "#2a2a2a" }}>•</span>
          <span style={{ cursor: "pointer", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a227")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#444")}
          >Refund Policy</span>
        </div>
      </div>
    </div>
  </footer>
);
