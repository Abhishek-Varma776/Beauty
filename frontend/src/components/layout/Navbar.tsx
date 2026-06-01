import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Phone, Clock, User, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { CrownLogo } from "./CrownLogo";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/#services" },
  { label: "Booking", to: "/dashboard" },
  { label: "Contact", to: "/#contact" },
];

export const Navbar = () => {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const onSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>
      {/* ── Announcement bar above navbar ── */}
      <div
        style={{
          background: "linear-gradient(90deg, #0a0a0a 0%, #1a1400 40%, #0a0a0a 100%)",
          borderBottom: "1px solid rgba(201,162,39,0.3)",
          padding: "0.4rem 1rem",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
        }}
      >
        <span style={{ fontSize: "0.7rem", color: "#888", letterSpacing: "0.1em" }}>✦</span>
        <p
          className="text-gold-gradient"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.2em",
            margin: 0,
          }}
        >
          MANI'S ELITE MAKEOVER — Premium Beauty Services
        </p>
        <span style={{ fontSize: "0.7rem", color: "#888", letterSpacing: "0.1em" }}>✦</span>
      </div>

      {/* ── Main Navbar ── */}
      <header
        style={{
          background: "linear-gradient(90deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)",
          borderBottom: "1px solid rgba(201,162,39,0.25)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.8)",
        }}
      >
        <div className="section-shell" style={{ display: "flex", height: "70px", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <CrownLogo />

          {/* Desktop nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="hidden-mobile">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.to}
                style={{
                  color: "#a08040",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  transition: "color 0.2s",
                  position: "relative",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a227")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#a08040")}
              >
                {item.label}
              </a>
            ))}

            {profile?.role === "admin" && (
              <NavLink
                style={{ color: "#c9a227", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}
                to="/admin"
              >
                Admin
              </NavLink>
            )}

            {!profile ? (
              <div style={{ display: "flex", gap: "0.75rem", marginLeft: "1rem" }}>
                <Link
                  to="/auth/signin"
                  style={{
                    padding: "0.5rem 1.2rem",
                    border: "1px solid rgba(201,162,39,0.5)",
                    borderRadius: "0.75rem",
                    color: "#c9a227",
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,162,39,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  Sign In
                </Link>
                <Link
                  className="btn-primary"
                  to="/auth/signup"
                  style={{ padding: "0.5rem 1.25rem", borderRadius: "0.75rem", fontSize: "0.875rem" }}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "1rem" }}>
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "#666" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Phone size={12} /> 24/7 Support
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={12} /> Quick Booking
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  title="My Profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    border: "1px solid rgba(201,162,39,0.4)",
                    borderRadius: "2rem",
                    background: "rgba(201,162,39,0.08)",
                    color: "#c9a227",
                    textDecoration: "none",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                >
                  <User size={16} />
                  <span>{profile.name?.split(" ")[0]}</span>
                </Link>
                <button
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #2a2a2a",
                    borderRadius: "0.75rem",
                    background: "transparent",
                    color: "#777",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "color 0.2s, border-color 0.2s",
                  }}
                  type="button"
                  onClick={() => void onSignOut()}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#777"; e.currentTarget.style.borderColor = "#2a2a2a"; }}
                >
                  Logout
                </button>
              </div>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            style={{
              background: "rgba(201,162,39,0.08)",
              border: "1px solid rgba(201,162,39,0.3)",
              borderRadius: "0.625rem",
              padding: "0.6rem",
              cursor: "pointer",
              color: "#c9a227",
            }}
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open navigation"
            className="show-mobile"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            style={{
              borderTop: "1px solid rgba(201,162,39,0.2)",
              background: "#0d0d0d",
              padding: "1rem",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.to}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.75rem",
                    color: "#c9a227",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(201,162,39,0.05)",
                    border: "1px solid rgba(201,162,39,0.1)",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{item.label}</span>
                  <span style={{ fontSize: "0.6rem" }}>✦</span>
                </a>
              ))}
              <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                {!profile ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Link
                      to="/auth/signin"
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(201,162,39,0.4)",
                        color: "#c9a227",
                        textDecoration: "none",
                        textAlign: "center",
                        fontWeight: 600,
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      className="btn-primary"
                      to="/auth/signup"
                      style={{ borderRadius: "0.75rem", textAlign: "center", textDecoration: "none" }}
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <Link
                      to="/dashboard"
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(201,162,39,0.3)",
                        color: "#c9a227",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
                      <User size={16} /> My Profile & Bookings
                    </Link>
                    <button
                      style={{
                        padding: "0.75rem 1rem",
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(239,68,68,0.3)",
                        background: "transparent",
                        color: "#ef4444",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                      }}
                      type="button"
                      onClick={() => { void onSignOut(); setMobileOpen(false); }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <style>{`
        @media (min-width: 768px) { .show-mobile { display: none !important; } }
        @media (max-width: 767px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </div>
  );
};
