import { MapPin, Phone, Mail, Clock, Heart, Code2 } from "lucide-react";

export const Footer = () => (
  <footer
    id="contact"
    style={{
      background: "linear-gradient(135deg, #080808 0%, #0d0b00 50%, #080808 100%)",
      borderTop: "1px solid rgba(201,162,39,0.25)",
      color: "#e8d5a3",
    }}
  >
    <div className="section-shell" style={{ paddingBlock: "clamp(2.5rem, 5vw, 4.5rem) clamp(1.5rem, 3vw, 2rem)" }}>
      <div className="footer-grid">

        {/* Brand Panel */}
        <div 
          style={{
            background: "rgba(201, 162, 39, 0.02)",
            border: "1px solid rgba(201, 162, 39, 0.15)",
            borderRadius: "1.25rem",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "1.25rem",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02), 0 4px 15px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(201, 162, 39, 0.4)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(201, 162, 39, 0.12)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(201, 162, 39, 0.15)";
            e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.02), 0 4px 15px rgba(0,0,0,0.3)";
            e.currentTarget.style.transform = "none";
          }}
        >
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
            <p style={{ color: "#aaa", lineHeight: 1.7, fontSize: "0.9rem", margin: "0 0 1rem" }}>
              Premium beauty services with verified professionals. Home visits &amp; luxury salon experience — bringing out the best in you.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Heart size={14} style={{ color: "#c9a227", fill: "#c9a227" }} />
            <span style={{ color: "#777", fontSize: "0.8rem" }}>Made with love for your beauty</span>
          </div>
        </div>

        {/* Contact Panel */}
        <div 
          style={{
            background: "rgba(201, 162, 39, 0.02)",
            border: "1px solid rgba(201, 162, 39, 0.15)",
            borderRadius: "1.25rem",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02), 0 4px 15px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(201, 162, 39, 0.4)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(201, 162, 39, 0.12)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(201, 162, 39, 0.15)";
            e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.02), 0 4px 15px rgba(0,0,0,0.3)";
            e.currentTarget.style.transform = "none";
          }}
        >
          <h3 style={{ color: "#c9a227", fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem", letterSpacing: "0.05em" }}>
            Contact &amp; Location
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
              <div style={{ background: "rgba(201,162,39,0.1)", borderRadius: "50%", padding: "0.45rem", flexShrink: 0 }}>
                <MapPin size={14} style={{ color: "#c9a227" }} />
              </div>
              <span style={{ color: "#aaa", fontSize: "0.875rem", lineHeight: 1.5 }}>
                Hyderabad, Telangana<br />
                Home service: 25 km radius
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "rgba(201,162,39,0.1)", borderRadius: "50%", padding: "0.45rem", flexShrink: 0 }}>
                <Phone size={14} style={{ color: "#c9a227" }} />
              </div>
              <span style={{ color: "#aaa", fontSize: "0.875rem" }}>+91 96404 49896</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "rgba(201,162,39,0.1)", borderRadius: "50%", padding: "0.45rem", flexShrink: 0 }}>
                <Mail size={14} style={{ color: "#c9a227" }} />
              </div>
              <span style={{ color: "#aaa", fontSize: "0.875rem", wordBreak: "break-all" }}>maniselitepujulamakeover@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Hours Panel */}
        <div 
          style={{
            background: "rgba(201, 162, 39, 0.02)",
            border: "1px solid rgba(201, 162, 39, 0.15)",
            borderRadius: "1.25rem",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02), 0 4px 15px rgba(0,0,0,0.3)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(201, 162, 39, 0.4)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(201, 162, 39, 0.12)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(201, 162, 39, 0.15)";
            e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.02), 0 4px 15px rgba(0,0,0,0.3)";
            e.currentTarget.style.transform = "none";
          }}
        >
          <h3 style={{ color: "#c9a227", fontWeight: 600, fontSize: "1rem", marginBottom: "0.25rem", letterSpacing: "0.05em" }}>
            Studio Hours
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ background: "rgba(201,162,39,0.1)", borderRadius: "50%", padding: "0.45rem", flexShrink: 0 }}>
                <Clock size={14} style={{ color: "#c9a227" }} />
              </div>
              <div>
                <p style={{ color: "#e8d5a3", fontWeight: 600, margin: "0 0 2px", fontSize: "0.875rem" }}>Daily Service</p>
                <p style={{ color: "#aaa", margin: 0, fontSize: "0.8rem" }}>10:00 AM – 8:00 PM</p>
              </div>
            </div>
            <div
              style={{
                marginTop: "0.25rem",
                padding: "0.875rem",
                background: "rgba(201,162,39,0.06)",
                border: "1px solid rgba(201,162,39,0.2)",
                borderRadius: "0.75rem",
              }}
            >
              <p style={{ color: "#aaa", fontSize: "0.8rem", lineHeight: 1.5, margin: 0 }}>
                🏠 Home visits — by appointment<br />
                🏪 Salon — walk-in &amp; appointments<br />
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
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Copyright + Links row */}
        <div className="footer-bottom-row">
          <p style={{ color: "#777", fontSize: "0.8rem", margin: 0 }}>
            © {new Date().getFullYear()} Mani's Elite Makeover. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "#777", flexWrap: "wrap" }}>
            <span style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a227")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#777")}
            >Privacy Policy</span>
            <span style={{ color: "#333" }}>•</span>
            <span style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a227")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#777")}
            >Terms of Service</span>
            <span style={{ color: "#333" }}>•</span>
            <span style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a227")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#777")}
            >Refund Policy</span>
          </div>
        </div>

        {/* Designer Credit — full width bottom strip */}
        <div
          style={{
            borderTop: "1px solid rgba(201,162,39,0.1)",
            paddingTop: "1.5rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.4rem",
            textAlign: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Code2 size={14} style={{ color: "#c9a227" }} />
            <span style={{ color: "#777", fontSize: "0.78rem", letterSpacing: "0.04em" }}>
              Designed &amp; Developed by
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              fontSize: "0.95rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #c9a227, #f0c94e, #ffe57a, #c9a227)",
              backgroundSize: "300% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "shimmer 4s linear infinite",
              letterSpacing: "0.06em",
            }}
          >
            Pujala Shiva Naga Abhishek Varma
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Phone size={12} style={{ color: "#555" }} />
            <span style={{ color: "#777", fontSize: "0.78rem" }}>
              Contact: <a href="tel:9491874221" style={{ color: "#aaa", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a227")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#aaa")}
              >9491874221</a>
            </span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);
