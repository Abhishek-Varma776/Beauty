import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Eye, EyeOff, Phone, Lock, User } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  forgotPassword as requestResetCodeApi,
  verifyResetCode as verifyCodeApi,
  resetPassword as resetPasswordApi,
} from "../services/authservice";

const draftKey = "manis_signup_draft";

const validatePassword = (pass: string) => {
  return {
    length: pass.length >= 8,
    uppercase: /[A-Z]/.test(pass),
    lowercase: /[a-z]/.test(pass),
    digit: /\d/.test(pass),
    special: /[@$!%*?&#]/.test(pass),
  };
};

const PasswordChecklist = ({ pass }: { pass: string }) => {
  const checks = validatePassword(pass);
  return (
    <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem", textAlign: "left", paddingLeft: "0.5rem" }}>
      <div style={{ color: checks.length ? "#22c55e" : "#666", display: "flex", alignItems: "center", gap: "6px" }}>
        <span>{checks.length ? "✓" : "○"}</span> At least 8 characters
      </div>
      <div style={{ color: checks.uppercase ? "#22c55e" : "#666", display: "flex", alignItems: "center", gap: "6px" }}>
        <span>{checks.uppercase ? "✓" : "○"}</span> One uppercase letter (A-Z)
      </div>
      <div style={{ color: checks.lowercase ? "#22c55e" : "#666", display: "flex", alignItems: "center", gap: "6px" }}>
        <span>{checks.lowercase ? "✓" : "○"}</span> One lowercase letter (a-z)
      </div>
      <div style={{ color: checks.digit ? "#22c55e" : "#666", display: "flex", alignItems: "center", gap: "6px" }}>
        <span>{checks.digit ? "✓" : "○"}</span> One number (0-9)
      </div>
      <div style={{ color: checks.special ? "#22c55e" : "#666", display: "flex", alignItems: "center", gap: "6px" }}>
        <span>{checks.special ? "✓" : "○"}</span> One special character (@$!%*?&#)
      </div>
    </div>
  );
};

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

  // Forgot password flow states
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = Enter Phone, 2 = Verify Code, 3 = Reset Password
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [receivedOtp, setReceivedOtp] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleRequestCode = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await requestResetCodeApi(phone.trim());
      setSuccessMessage(res.message);
      if (res.otp) {
        setReceivedOtp(res.otp);
      }
      setResetStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request reset code");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const res = await verifyCodeApi(phone.trim(), resetCode.trim());
      setSuccessMessage(res.message);
      setResetStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired verification code");
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await resetPasswordApi({
        phone: phone.trim(),
        code: resetCode.trim(),
        newPassword: newPassword,
      });
      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        setForgotMode(false);
        setResetStep(1);
        setPhone("");
        setPassword("");
        setNewPassword("");
        setResetCode("");
        setReceivedOtp("");
        setSuccessMessage(null);
        setError(null);
        navigate("/auth/signin");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset password");
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
        {!forgotMode && (
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
        )}

        {/* Sign Up Form */}
        {mode === "signup" && !forgotMode && (
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
                placeholder="Strong Password"
                name="password"
                id="signup-password"
                autoComplete="new-password"
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

            <PasswordChecklist pass={password} />

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
              disabled={busy || !phone.trim() || !name.trim() || !password.trim() || !Object.values(validatePassword(password)).every(Boolean)}
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
        {mode === "signin" && !forgotMode && (
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

            {/* Forgot Password Link */}
            <div style={{ textAlign: "right", marginTop: "-0.5rem" }}>
              <button
                type="button"
                style={{ background: "none", border: "none", color: "#a08040", cursor: "pointer", fontSize: "0.8rem", padding: 0 }}
                onClick={() => {
                  setForgotMode(true);
                  setResetStep(1);
                  setError(null);
                  setSuccessMessage(null);
                }}
              >
                Forgot Password?
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

        {/* Forgot Password Form */}
        {forgotMode && (
          <div>
            {/* Forgot Password Header */}
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔑</div>
              <span className="badge" style={{ marginBottom: "0.75rem", display: "inline-block" }}>
                Password Recovery
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
                Reset Password
              </h1>
              <p style={{ color: "#555", fontSize: "0.85rem", margin: 0 }}>
                {resetStep === 1 && "Step 1: Enter your registered mobile number"}
                {resetStep === 2 && "Step 2: Enter the 6-digit reset code"}
                {resetStep === 3 && "Step 3: Choose a new strong password"}
              </p>
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#ef4444", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {error}
              </div>
            )}
            {successMessage && (
              <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "#22c55e", fontSize: "0.85rem", marginBottom: "1rem" }}>
                {successMessage}
              </div>
            )}

            {/* STEP 1: Enter Phone Number */}
            {resetStep === 1 && (
              <form onSubmit={handleRequestCode} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#c9a227", pointerEvents: "none" }}>
                    <Phone size={16} />
                  </div>
                  <input
                    className="input"
                    style={{ paddingLeft: "2.75rem" }}
                    type="tel"
                    placeholder="Mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <button className="btn-primary" type="submit" disabled={busy || !phone.trim()}>
                  {busy ? "Sending code..." : "Get Reset Code"}
                </button>
              </form>
            )}

            {/* STEP 2: Enter Verification Code */}
            {resetStep === 2 && (
              <form onSubmit={handleVerifyCode} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {receivedOtp && (
                  <div style={{ background: "rgba(201,162,39,0.08)", border: "1px solid rgba(201,162,39,0.3)", borderRadius: "0.75rem", padding: "0.75rem 1rem", fontSize: "0.825rem", color: "#e8d5a3", textAlign: "left" }}>
                    <strong>Test Sandbox Reset Code:</strong> <span style={{ color: "#c9a227", fontSize: "1.1rem", fontWeight: "700" }}>{receivedOtp}</span> (Simulated SMS OTP)
                  </div>
                )}
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#c9a227", pointerEvents: "none" }}>
                    <Lock size={16} />
                  </div>
                  <input
                    className="input"
                    style={{ paddingLeft: "2.75rem" }}
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                  />
                </div>
                <button className="btn-primary" type="submit" disabled={busy || !resetCode.trim()}>
                  {busy ? "Verifying..." : "Verify Code"}
                </button>
              </form>
            )}

            {/* STEP 3: Enter New Password */}
            {resetStep === 3 && (
              <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#c9a227", pointerEvents: "none" }}>
                    <Lock size={16} />
                  </div>
                  <input
                    className="input"
                    style={{ paddingLeft: "2.75rem", paddingRight: "2.75rem" }}
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", padding: 0 }}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <PasswordChecklist pass={newPassword} />

                <button
                  className="btn-primary"
                  type="submit"
                  disabled={busy || !newPassword.trim() || !Object.values(validatePassword(newPassword)).every(Boolean)}
                >
                  {busy ? "Resetting password..." : "Set New Password"}
                </button>
              </form>
            )}

            {/* Back to Login link */}
            <p style={{ textAlign: "center", color: "#555", fontSize: "0.85rem", margin: "1.5rem 0 0" }}>
              Remember your password?{" "}
              <button
                type="button"
                style={{ background: "none", border: "none", color: "#c9a227", cursor: "pointer", fontWeight: 600, padding: 0 }}
                onClick={() => {
                  setForgotMode(false);
                  setError(null);
                  setSuccessMessage(null);
                }}
              >
                Sign In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
