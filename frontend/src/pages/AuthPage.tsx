import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Phone, Lock, User } from "lucide-react";

import { useAuth } from "../context/AuthContext";

const draftKey = "manis_signup_draft";

export const AuthPage = () => {
  const { session, profile, signInWithPassword, signUpWithPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const params = new URLSearchParams(location.search);
  const qMode = (params.get("mode") as "signin" | "signup" | null) ?? null;
  const routeParams = useParams();
  const mode = (routeParams.mode as "signin" | "signup" | null) ?? qMode ?? "signup";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);

  // ── Scroll to top whenever this page mounts or mode switches ──
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [mode]);

  useEffect(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as { name?: string; phone?: string };
        setName(parsed.name ?? "");
        setPhone(parsed.phone ?? "");
      } catch {
        localStorage.removeItem(draftKey);
      }
    }
  }, []);

  useEffect(() => {
    if (!session || !profile) return;
    navigate(profile.role === "admin" ? "/admin" : destination, { replace: true });
  }, [destination, navigate, profile, session]);

  const signUp = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setAlreadyExists(false);
    try {
      localStorage.setItem(draftKey, JSON.stringify({ name: name.trim(), phone: phone.trim() }));
      await signUpWithPassword(phone.trim(), password, name.trim(), phone.trim());
      navigate(destination, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to create account";
      // 409 = phone already registered
      const is409 =
        msg.includes("409") ||
        msg.toLowerCase().includes("already registered") ||
        msg.toLowerCase().includes("already exists");
      if (is409) {
        setAlreadyExists(true);
        setError(null);
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signInWithPassword(phone.trim(), password);
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid phone number or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
      }}
    >
      {/* Background glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: "400px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(201,162,39,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#111111",
          border: "1px solid rgba(201,162,39,0.25)",
          borderRadius: "1.5rem",
          padding: "2.5rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(201,162,39,0.05)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>👑</div>
          <span className="badge" style={{ marginBottom: "0.75rem", display: "inline-block" }}>
            {mode === "signin" ? "Welcome Back" : "Join Us"}
          </span>
          <h1
            style={{
              fontFamily: "'Cinzel', 'Playfair Display', serif",
              fontSize: "1.75rem",
              fontWeight: 700,
              margin: "0.5rem 0 0.5rem",
              color: "#e8d5a3",
            }}
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
          </h1>
          <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>
            {mode === "signin"
              ? "Sign in with your mobile number & password"
              : "Sign up with your mobile number"}
          </p>
        </div>

        {/* Sign Up Form */}
        {mode === "signup" && (
          <form onSubmit={signUp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Name */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#c9a227", pointerEvents: "none" }}>
                <User size={16} />
              </div>
              <input
                className="input"
                style={{ paddingLeft: "2.75rem" }}
                placeholder="Full name"
                name="name"
                id="signup-name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Phone */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#c9a227", pointerEvents: "none" }}>
                <Phone size={16} />
              </div>
              <input
                className="input"
                style={{ paddingLeft: "2.75rem" }}
                type="tel"
                placeholder="Mobile number (e.g. 9876543210)"
                name="phone"
                id="signup-phone"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                pattern="[0-9]{10}"
                title="Enter a valid 10-digit mobile number"
              />
            </div>

            {/* Password */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#c9a227", pointerEvents: "none" }}>
                <Lock size={16} />
              </div>
              <input
                className="input"
                style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                type={showPassword ? "text" : "password"}
                placeholder="Password (min. 6 characters)"
                name="password"
                id="signup-password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", padding: 0 }}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {alreadyExists && (
              <div style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.4)", borderRadius: "0.875rem", padding: "1rem 1.125rem" }}>
                <p style={{ color: "#c9a227", fontWeight: 600, margin: "0 0 0.35rem", fontSize: "0.9rem" }}>
                  📱 This number is already registered
                </p>
                <p style={{ color: "#888", fontSize: "0.82rem", margin: "0 0 0.875rem" }}>
                  <strong style={{ color: "#e8d5a3" }}>{phone}</strong> already has an account. Please sign in.
                </p>
                <a href="/auth/signin" className="btn-primary" style={{ display: "inline-flex", fontSize: "0.85rem", padding: "0.5rem 1.25rem", textDecoration: "none" }}>
                  Sign In with this number →
                </a>
              </div>
            )}
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#ef4444", fontSize: "0.85rem" }}>
                {error}
              </div>
            )}


            <button
              className="btn-primary"
              type="submit"
              disabled={busy || !phone.trim() || !name.trim() || !password.trim()}
              style={{ marginTop: "0.5rem" }}
            >
              {busy ? "Creating account..." : "Create Account"}
            </button>

            <p style={{ textAlign: "center", color: "#555", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>
              Already have an account?{" "}
              <a
                href="/auth/signin"
                style={{ color: "#c9a227", textDecoration: "none", fontWeight: 600 }}
              >
                Sign In
              </a>
            </p>
          </form>
        )}

        {/* Sign In Form */}
        {mode === "signin" && (
          <form onSubmit={signIn} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Phone */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#c9a227", pointerEvents: "none" }}>
                <Phone size={16} />
              </div>
              <input
                className="input"
                style={{ paddingLeft: "2.75rem" }}
                type="tel"
                placeholder="Mobile number"
                name="phone"
                id="signin-phone"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#c9a227", pointerEvents: "none" }}>
                <Lock size={16} />
              </div>
              <input
                className="input"
                style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                id="signin-password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", padding: 0 }}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#ef4444", fontSize: "0.85rem" }}>
                {error}
              </div>
            )}

            <button
              className="btn-primary"
              type="submit"
              disabled={busy || !phone.trim() || !password.trim()}
              style={{ marginTop: "0.5rem" }}
            >
              {busy ? "Signing in..." : "Sign In"}
            </button>

            <p style={{ textAlign: "center", color: "#555", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>
              Don't have an account?{" "}
              <a
                href="/auth/signup"
                style={{ color: "#c9a227", textDecoration: "none", fontWeight: 600 }}
              >
                Sign Up
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
