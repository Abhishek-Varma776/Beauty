import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Heart, Code2, X, Shield, FileText, RefreshCcw, ChevronRight } from "lucide-react";

export type PolicyType = "privacy" | "terms" | "refund" | null;

// ─── Policy Content ────────────────────────────────────────────────────────────
export const POLICIES: Record<
  Exclude<PolicyType, null>,
  { icon: React.ReactNode; title: string; subtitle: string; sections: { heading: string; body: React.ReactNode }[] }
> = {
  refund: {
    icon: <RefreshCcw size={22} style={{ color: "#c9a227" }} />,
    title: "Refund & Cancellation Policy",
    subtitle: "Last updated: June 2026",
    sections: [
      {
        heading: "📋 Cancellation Timeframes",
        body: (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { badge: "100% Refund", badgeColor: "#22c55e", label: "Cancel 24+ hours before appointment", desc: "Full refund — no questions asked." },
              { badge: "50% Refund", badgeColor: "#f59e0b", label: "Cancel 12–24 hours before appointment", desc: "Partial refund of 50% of the total amount." },
              { badge: "No Refund", badgeColor: "#ef4444", label: "Cancel less than 12 hours before", desc: "Unfortunately no refund is applicable for last-minute cancellations." },
            ].map(({ badge, badgeColor, label, desc }) => (
              <div key={badge} style={{ display: "flex", alignItems: "flex-start", gap: "0.875rem", padding: "0.875rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ padding: "0.15rem 0.6rem", borderRadius: "9999px", background: badgeColor + "18", border: `1px solid ${badgeColor}40`, color: badgeColor, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em", whiteSpace: "nowrap", flexShrink: 0, marginTop: "2px" }}>{badge}</span>
                <div>
                  <p style={{ color: "#e8d5a3", fontWeight: 600, margin: "0 0 2px", fontSize: "0.85rem" }}>{label}</p>
                  <p style={{ color: "#888", margin: 0, fontSize: "0.78rem" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        heading: "⏱️ Refund Processing Timeline",
        body: (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              ["Step 1 — Request Submitted", "Contact us via phone or email with your booking ID to initiate a refund."],
              ["Step 2 — Review (1–2 Business Days)", "Our team reviews your cancellation request and confirms eligibility."],
              ["Step 3 — Refund Initiated (2–3 Business Days)", "Approved refunds are initiated via the original payment method (PhonePe / bank transfer)."],
              ["Step 4 — Amount Credited (3–5 Business Days)", "Funds appear in your account. Total timeline: 5–7 business days end-to-end."],
            ].map(([title, desc], i) => (
              <div key={i} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(201,162,39,0.15)", border: "1px solid rgba(201,162,39,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.65rem", fontWeight: 700, color: "#c9a227" }}>{i + 1}</div>
                <div>
                  <p style={{ color: "#c9a227", fontWeight: 600, margin: "0 0 2px", fontSize: "0.82rem" }}>{title}</p>
                  <p style={{ color: "#888", margin: 0, fontSize: "0.78rem" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        heading: "📞 How to Request a Refund",
        body: (
          <p style={{ color: "#aaa", fontSize: "0.85rem", lineHeight: 1.65, margin: 0 }}>
            Call us at <strong style={{ color: "#e8d5a3" }}>+91 96404 49896</strong> or email{" "}
            <strong style={{ color: "#e8d5a3" }}>maniselitepujulamakeover@gmail.com</strong> with your booking ID and reason for cancellation. Our support team will assist you within 24 hours.
          </p>
        ),
      },
    ],
  },

  privacy: {
    icon: <Shield size={22} style={{ color: "#c9a227" }} />,
    title: "Privacy Policy",
    subtitle: "Last updated: June 2026",
    sections: [
      {
        heading: "📝 Information We Collect",
        body: (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              ["Full Name & Contact", "Used to personalise your booking and communicate appointment updates."],
              ["Delivery Address (Home Visits)", "Used exclusively for dispatching our professional to your location. Never shared with third parties."],
              ["Phone Number & Email", "Used for booking confirmations, reminders, and support communication."],
              ["Payment Details", "All payments are processed via PhonePe's PCI-DSS-compliant gateway. We do NOT store your card details or UPI credentials."],
            ].map(([title, desc]) => (
              <div key={title as string} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", padding: "0.75rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <ChevronRight size={14} style={{ color: "#c9a227", flexShrink: 0, marginTop: "3px" }} />
                <div>
                  <p style={{ color: "#e8d5a3", fontWeight: 600, margin: "0 0 2px", fontSize: "0.83rem" }}>{title as string}</p>
                  <p style={{ color: "#888", margin: 0, fontSize: "0.78rem" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        heading: "🔐 How We Protect Your Data",
        body: (
          <p style={{ color: "#aaa", fontSize: "0.85rem", lineHeight: 1.65, margin: 0 }}>
            Your data is encrypted in transit using <strong style={{ color: "#e8d5a3" }}>256-bit TLS/SSL encryption</strong>. Our backend is hosted on secure cloud infrastructure with restricted access controls. We conduct regular security audits and do not sell, rent, or share your personal information with advertising networks.
          </p>
        ),
      },
      {
        heading: "🗂️ Data Retention & Your Rights",
        body: (
          <p style={{ color: "#aaa", fontSize: "0.85rem", lineHeight: 1.65, margin: 0 }}>
            Your data is retained for the period necessary to provide services and comply with legal obligations (typically up to 3 years for booking records). You may request deletion of your account and personal data at any time by contacting us via email. We will process all deletion requests within 30 days.
          </p>
        ),
      },
      {
        heading: "🍪 Cookies & Analytics",
        body: (
          <p style={{ color: "#aaa", fontSize: "0.85rem", lineHeight: 1.65, margin: 0 }}>
            We use session cookies exclusively for authentication purposes. We do not use tracking or advertising cookies. No third-party analytics tools that share data externally are employed on this platform.
          </p>
        ),
      },
    ],
  },

  terms: {
    icon: <FileText size={22} style={{ color: "#c9a227" }} />,
    title: "Terms of Service",
    subtitle: "Last updated: June 2026",
    sections: [
      {
        heading: "📌 Booking & Appointments",
        body: (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {[
              "All bookings must be made by a registered and verified user.",
              "Slots are allocated on a first-come, first-served basis.",
              "Please arrive or be ready at least 5 minutes before your appointment.",
              "Repeated no-shows (3+) may result in account suspension.",
              "Home visit bookings are available within a 25 km radius of our salon.",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start" }}>
                <ChevronRight size={14} style={{ color: "#c9a227", flexShrink: 0, marginTop: "3px" }} />
                <p style={{ color: "#aaa", margin: 0, fontSize: "0.82rem", lineHeight: 1.55 }}>{item}</p>
              </div>
            ))}
          </div>
        ),
      },
      {
        heading: "💳 Payments",
        body: (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {[
              "Online payments are processed securely via PhonePe Payment Gateway.",
              "Cash payments are collected by the service professional at the time of the appointment.",
              "Prices displayed are inclusive of all applicable service charges. GST may apply.",
              "Mani's Elite Makeover Studio reserves the right to modify pricing at any time with prior notice.",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "0.65rem", alignItems: "flex-start" }}>
                <ChevronRight size={14} style={{ color: "#c9a227", flexShrink: 0, marginTop: "3px" }} />
                <p style={{ color: "#aaa", margin: 0, fontSize: "0.82rem", lineHeight: 1.55 }}>{item}</p>
              </div>
            ))}
          </div>
        ),
      },
      {
        heading: "🤝 Client & Professional Conduct",
        body: (
          <p style={{ color: "#aaa", fontSize: "0.85rem", lineHeight: 1.65, margin: 0 }}>
            Our professionals follow strict hygiene and safety protocols. Clients are expected to treat our staff with respect. Any form of misconduct, harassment, or abuse toward professionals will result in immediate booking cancellation and potential permanent account ban without refund.
          </p>
        ),
      },
      {
        heading: "⚖️ Liability & Limitations",
        body: (
          <p style={{ color: "#aaa", fontSize: "0.85rem", lineHeight: 1.65, margin: 0 }}>
            Mani's Elite Makeover Studio shall not be held liable for any adverse reactions due to undisclosed skin conditions or allergies. Please inform your professional of any allergies before the service begins. Our maximum liability in any dispute is limited to the amount paid for the specific service in question.
          </p>
        ),
      },
      {
        heading: "📄 Changes to Terms",
        body: (
          <p style={{ color: "#aaa", fontSize: "0.85rem", lineHeight: 1.65, margin: 0 }}>
            These Terms of Service may be updated periodically. Continued use of the platform after changes constitutes acceptance of the revised terms. We recommend reviewing this page periodically. Significant changes will be communicated via email.
          </p>
        ),
      },
    ],
  },
};

// ─── Policy Modal ──────────────────────────────────────────────────────────────
const PolicyModal = ({ type, onClose }: { type: Exclude<PolicyType, null>; onClose: () => void }) => {
  const policy = POLICIES[type];

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100000,
        backgroundColor: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: "620px",
          maxHeight: "88vh",
          background: "linear-gradient(145deg, #111 0%, #0c0b00 100%)",
          border: "1px solid rgba(201,162,39,0.3)",
          borderRadius: "1.5rem",
          boxShadow: "0 25px 70px rgba(0,0,0,0.8), 0 0 40px rgba(201,162,39,0.06)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: "1.75rem 2rem 1.5rem",
          borderBottom: "1px solid rgba(201,162,39,0.15)",
          background: "linear-gradient(135deg, rgba(201,162,39,0.07) 0%, transparent 100%)",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(201,162,39,0.12)", border: "1px solid rgba(201,162,39,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {policy.icon}
            </div>
            <div>
              <h2 style={{ fontFamily: "'Cinzel', 'Playfair Display', serif", color: "#e8d5a3", fontSize: "1.15rem", fontWeight: 700, margin: "0 0 3px" }}>
                {policy.title}
              </h2>
              <p style={{ color: "#666", fontSize: "0.72rem", margin: 0, letterSpacing: "0.04em" }}>{policy.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#777", transition: "all 0.2s", flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.15)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; e.currentTarget.style.color = "#ef4444"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#777"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ overflowY: "auto", padding: "1.75rem 2rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {policy.sections.map((section, i) => (
            <div key={i}>
              <h3 style={{ color: "#c9a227", fontSize: "0.88rem", fontWeight: 700, letterSpacing: "0.03em", margin: "0 0 0.875rem" }}>
                {section.heading}
              </h3>
              {section.body}
            </div>
          ))}

          {/* Contact footer strip */}
          <div style={{ padding: "1rem", borderRadius: "0.875rem", background: "rgba(201,162,39,0.05)", border: "1px solid rgba(201,162,39,0.18)", marginTop: "0.5rem" }}>
            <p style={{ color: "#888", fontSize: "0.8rem", margin: "0 0 4px" }}>Questions about this policy?</p>
            <p style={{ color: "#c9a227", fontWeight: 600, fontSize: "0.85rem", margin: 0 }}>
              📧 maniselitepujulamakeover@gmail.com &nbsp;·&nbsp; 📞 +91 96404 49896
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Footer ────────────────────────────────────────────────────────────────────
export const Footer = () => {
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  return (
    <>
      {activePolicy && <PolicyModal type={activePolicy} onClose={() => setActivePolicy(null)} />}

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
                  <p style={{ color: "#888", fontSize: "0.7rem", letterSpacing: "0.2em", margin: 0 }}>MAKEOVER STUDIO</p>
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
        </div>

        {/* Bottom bar */}
        <div className="section-shell" style={{ paddingBottom: "clamp(1.5rem, 3vw, 2rem)" }}>
          <div
            style={{
              borderTop: "1px solid rgba(201,162,39,0.15)",
              paddingTop: "2rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* Copyright + Policy Links row */}
            <div className="footer-bottom-row">
              <p style={{ color: "#777", fontSize: "0.8rem", margin: 0 }}>
                © {new Date().getFullYear()} Mani's Elite Makeover Studio. All rights reserved.
              </p>
              <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8rem", color: "#777", flexWrap: "wrap" }}>
                <button
                  onClick={() => setActivePolicy("privacy")}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#777", transition: "color 0.2s", fontSize: "0.8rem", fontFamily: "inherit" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a227")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#777")}
                >
                  Privacy Policy
                </button>
                <span style={{ color: "#333" }}>•</span>
                <button
                  onClick={() => setActivePolicy("terms")}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#777", transition: "color 0.2s", fontSize: "0.8rem", fontFamily: "inherit" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a227")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#777")}
                >
                  Terms of Service
                </button>
                <span style={{ color: "#333" }}>•</span>
                <button
                  onClick={() => setActivePolicy("refund")}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#777", transition: "color 0.2s", fontSize: "0.8rem", fontFamily: "inherit" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a227")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#777")}
                >
                  Refund Policy
                </button>
              </div>
            </div>

            {/* Designer Credit */}
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

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 300% center; }
        }
      `}</style>
    </>
  );
};
