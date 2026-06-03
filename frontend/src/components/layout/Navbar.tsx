import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Phone, Clock, User, X } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../../context/AuthContext";
import { CrownLogo } from "./CrownLogo";

const navItems = [
  { label: "Home",     to: "/" },
  { label: "Services", to: "/#services" },
  { label: "Booking",  to: "/dashboard" },
  { label: "Contact",  to: "/#contact" },
];

export const Navbar = () => {
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    if (to.startsWith("/#")) {
      e.preventDefault();
      const targetId = to.substring(2);
      setMobileOpen(false);
      
      if (window.location.pathname === "/") {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate("/");
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      }
    } else {
      e.preventDefault();
      setMobileOpen(false);
      navigate(to);
    }
  };

  const onSignOut = async () => {
    await signOut();
    navigate("/");
    setMobileOpen(false);
  };

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>

      {/* ── Announcement Bar ── */}
      <div
        style={{
          background: "linear-gradient(90deg, #0a0a0a 0%, #1a1400 40%, #0a0a0a 100%)",
          borderBottom: "1px solid rgba(201,162,39,0.3)",
          padding: "0.35rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          overflow: "hidden",
        }}
      >
        <span style={{ fontSize: "0.65rem", color: "#888", flexShrink: 0 }}>✦</span>
        <p
          className="text-gold-gradient announce-text"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(0.6rem, 2vw, 0.75rem)",
            fontWeight: 600,
            letterSpacing: "clamp(0.05em, 1vw, 0.2em)",
            margin: 0,
          }}
        >
          MANI'S ELITE MAKEOVER STUDIO — Premium Beauty Services
        </p>
        <span style={{ fontSize: "0.65rem", color: "#888", flexShrink: 0 }}>✦</span>
      </div>

      {/* ── Main Navbar ── */}
      <header
        style={{
          background: "linear-gradient(90deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)",
          borderBottom: "1px solid rgba(201,162,39,0.25)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.8)",
        }}
      >
        <div
          className="section-shell"
          style={{
            display: "flex",
            height: "clamp(56px, 8vw, 72px)",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <CrownLogo />

          {/* Desktop nav — hidden on mobile via CSS class */}
          <nav className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: "clamp(1rem, 2.5vw, 2rem)" }}>
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.to}
                onClick={(e) => handleNavClick(e, item.to)}
                style={{
                  color: "#a08040",
                  textDecoration: "none",
                  fontSize: "clamp(0.78rem, 1.5vw, 0.875rem)",
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  transition: "color 0.2s",
                  position: "relative",
                  padding: "0.25rem 0",
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
              <div style={{ display: "flex", gap: "0.65rem", marginLeft: "0.5rem" }}>
                <Link
                  to="/auth/signin"
                  style={{
                    padding: "0.45rem 1rem",
                    border: "1px solid rgba(201,162,39,0.5)",
                    borderRadius: "0.75rem",
                    color: "#c9a227",
                    textDecoration: "none",
                    fontSize: "0.825rem",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    background: "transparent",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(201,162,39,0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  Sign In
                </Link>
                <Link
                  className="btn-primary"
                  to="/auth/signup"
                  style={{ padding: "0.45rem 1.1rem", borderRadius: "0.75rem", fontSize: "0.825rem" }}
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginLeft: "0.5rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.72rem", color: "#666" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Phone size={11} /> 24/7 Support
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <Clock size={11} /> Quick Booking
                  </span>
                </div>
                <Link
                  to="/dashboard"
                  title="My Profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.4rem 0.875rem",
                    border: "1px solid rgba(201,162,39,0.4)",
                    borderRadius: "2rem",
                    background: "rgba(201,162,39,0.08)",
                    color: "#c9a227",
                    textDecoration: "none",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  <User size={15} />
                  <span>{profile.name?.split(" ")[0]}</span>
                </Link>
                <button
                  style={{
                    padding: "0.4rem 0.875rem",
                    border: "1px solid #2a2a2a",
                    borderRadius: "0.75rem",
                    background: "transparent",
                    color: "#777",
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    transition: "color 0.2s, border-color 0.2s",
                    whiteSpace: "nowrap",
                    fontFamily: "Poppins, sans-serif",
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

          {/* Mobile hamburger — shown on mobile via CSS class */}
          <button
            style={{
              background: "rgba(201,162,39,0.08)",
              border: "1px solid rgba(201,162,39,0.3)",
              borderRadius: "0.625rem",
              padding: "0.55rem",
              cursor: "pointer",
              color: "#c9a227",
              minWidth: "44px",
              minHeight: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
            className="show-mobile"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* ── Mobile Menu Drawer ── */}
        {mobileOpen && (
          <div
            style={{
              borderTop: "1px solid rgba(201,162,39,0.2)",
              background: "#0d0d0d",
              padding: "1rem",
              maxHeight: "calc(100vh - 120px)",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.to}
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "0.75rem",
                    color: "#c9a227",
                    textDecoration: "none",
                    fontSize: "0.925rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(201,162,39,0.05)",
                    border: "1px solid rgba(201,162,39,0.1)",
                    minHeight: "48px",
                  }}
                  onClick={(e) => handleNavClick(e, item.to)}
                >
                  <span>{item.label}</span>
                  <span style={{ fontSize: "0.6rem" }}>✦</span>
                </a>
              ))}

              {profile?.role === "admin" && (
                <a
                  href="/admin"
                  style={{
                    padding: "0.875rem 1rem",
                    borderRadius: "0.75rem",
                    color: "#c9a227",
                    textDecoration: "none",
                    fontSize: "0.925rem",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(201,162,39,0.1)",
                    border: "1px solid rgba(201,162,39,0.3)",
                    minHeight: "48px",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  <span>Admin Dashboard</span>
                  <span style={{ fontSize: "0.6rem" }}>✦</span>
                </a>
              )}

              <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: "0.75rem", marginTop: "0.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {!profile ? (
                  <>
                    <Link
                      to="/auth/signin"
                      style={{
                        padding: "0.875rem 1rem",
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(201,162,39,0.4)",
                        color: "#c9a227",
                        textDecoration: "none",
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: "0.925rem",
                        minHeight: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      className="btn-primary"
                      to="/auth/signup"
                      style={{ borderRadius: "0.75rem", textAlign: "center", textDecoration: "none", minHeight: "48px" }}
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign Up — Create Account
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      style={{
                        padding: "0.875rem 1rem",
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(201,162,39,0.3)",
                        color: "#c9a227",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.925rem",
                        minHeight: "48px",
                      }}
                      onClick={() => setMobileOpen(false)}
                    >
                      <User size={16} /> My Profile &amp; Bookings
                    </Link>
                    <button
                      style={{
                        padding: "0.875rem 1rem",
                        borderRadius: "0.75rem",
                        border: "1px solid rgba(239,68,68,0.3)",
                        background: "transparent",
                        color: "#ef4444",
                        cursor: "pointer",
                        width: "100%",
                        textAlign: "left",
                        fontSize: "0.925rem",
                        fontFamily: "Poppins, sans-serif",
                        minHeight: "48px",
                      }}
                      type="button"
                      onClick={() => { void onSignOut(); }}
                    >
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
};
