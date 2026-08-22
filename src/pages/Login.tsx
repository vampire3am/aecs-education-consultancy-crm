import {
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AECS_ORGANIZATION } from "../config/organization";
import { type FormEvent, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import { isSupabaseConfigured } from "../lib/supabase";

export function Login() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // If already authenticated, redirect immediately to dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const errorDesc = hashParams.get("error_description");
      if (errorDesc) {
        setError(decodeURIComponent(errorDesc.replace(/\+/g, " ")));
      }
    }
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please provide both your official work email and security password.");
      setBusy(false);
      return;
    }

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Authentication failed. Please verify your staff credentials."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-portal-wrapper">
      <div className="login-ambient-glow-1" />
      <div className="login-ambient-glow-2" />

      <div className="login-card-container">
        {/* =========================================================================
            PANE 1: LEFT HERO & INSTITUTIONAL CREST
            ========================================================================= */}
        <div className="login-brand-pane">
          <div>
            <div className="login-brand-crest">
              <div className="login-logo-box">
                <img src="/abroad-logo-new.png" alt="Abroad Education Consultancy Services" />
              </div>
              <div className="login-brand-text">
                <h2>Abroad Education</h2>
                <span>Consultancy Services</span>
              </div>
            </div>

            <div className="login-hero-points">
              <div className="login-point-item">
                <div className="login-point-icon">
                  <Globe size={16} />
                </div>
                <div className="login-point-text">
                  <strong>Global Placements</strong>
                  <span>{AECS_ORGANIZATION.destinations.join(", ")}</span>
                </div>
              </div>

              <div className="login-point-item">
                <div className="login-point-icon">
                  <Users size={16} />
                </div>
                <div className="login-point-text">
                  <strong>18 Staff Collaboration</strong>
                  <span>Cross-department handoffs, live case tagging & internal chat</span>
                </div>
              </div>

              <div className="login-point-item">
                <div className="login-point-icon">
                  <ShieldCheck size={16} />
                </div>
                <div className="login-point-text">
                  <strong>Role-Based Access Control</strong>
                  <span>Audited financial journals, student dossiers & document vault</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="login-badge-seal">
              <Shield size={13} />
              <span>{AECS_ORGANIZATION.shortAddress} · Secure staff access</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            PANE 2: RIGHT INTERACTIVE LOGIN FORM
            ========================================================================= */}
        <div className="login-form-pane">
          <div className="login-form-header">
            <span className="eyebrow-tag">Operational Portal</span>
            <h1>Staff Sign In</h1>
            <p>Enter your staff credentials or use 1-click quick login below.</p>
          </div>

          <form onSubmit={submit} noValidate>
            {/* Email Field */}
            <div className="login-field-group">
              <label className="login-field-label">
                <span>Official Work Email</span>
                <span style={{ fontSize: "11px", color: "#64748B" }}>Authorized Staff ID</span>
              </label>
              <div className="login-input-wrapper">
                <Mail size={16} className="login-input-icon" />
                <input
                  type="email"
                  className="login-text-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@abroad.edu.np"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="login-field-group">
              <label className="login-field-label">
                <span>Security Password</span>
                <span style={{ fontSize: "11px", color: "#64748B" }}>Managed securely</span>
              </label>
              <div className="login-input-wrapper">
                <Lock size={16} className="login-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-text-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter security password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-toggle-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="login-error-banner" style={{ marginBottom: "16px" }}>
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="login-submit-btn" disabled={busy}>
              {busy ? (
                <>
                  <div style={{ width: "16px", height: "16px", border: "2px solid #FFFFFF", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  <span>Authenticating Staff Profile…</span>
                </>
              ) : (
                <>
                  <span>Sign In to CRM Workspace</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* 1-Click Fast Sign In */}
            <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid #E2E8F0" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#64748B", display: "block", marginBottom: "8px" }}>
                ⚡ 1-Click Fast Sign In:
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@abroad.edu.np");
                    setPassword("Admin@1234");
                    void signIn("admin@abroad.edu.np", "Admin@1234").then(() => navigate("/dashboard"));
                  }}
                  style={{
                    padding: "8px 10px",
                    background: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: "#1E40AF",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>👑</span>
                  <div>
                    <strong style={{ display: "block" }}>Owner / MD</strong>
                    <span style={{ fontSize: "10px", color: "#3B82F6" }}>Arun Sharma</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("counsellor@abroad.edu.np");
                    setPassword("Counsellor@1234");
                    void signIn("counsellor@abroad.edu.np", "Counsellor@1234").then(() => navigate("/dashboard"));
                  }}
                  style={{
                    padding: "8px 10px",
                    background: "#F5F3FF",
                    border: "1px solid #DDD6FE",
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: "#5B21B6",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>👩‍💼</span>
                  <div>
                    <strong style={{ display: "block" }}>Counsellor</strong>
                    <span style={{ fontSize: "10px", color: "#8B5CF6" }}>Sita Adhikari</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("visa@abroad.edu.np");
                    setPassword("Visa@1234");
                    void signIn("visa@abroad.edu.np", "Visa@1234").then(() => navigate("/dashboard"));
                  }}
                  style={{
                    padding: "8px 10px",
                    background: "#ECFDF5",
                    border: "1px solid #A7F3D0",
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: "#065F46",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>🛂</span>
                  <div>
                    <strong style={{ display: "block" }}>Visa Officer</strong>
                    <span style={{ fontSize: "10px", color: "#10B981" }}>Binod Maharjan</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail("accounts@abroad.edu.np");
                    setPassword("Accounts@1234");
                    void signIn("accounts@abroad.edu.np", "Accounts@1234").then(() => navigate("/dashboard"));
                  }}
                  style={{
                    padding: "8px 10px",
                    background: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: "#92400E",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <span>💰</span>
                  <div>
                    <strong style={{ display: "block" }}>Finance Lead</strong>
                    <span style={{ fontSize: "10px", color: "#F59E0B" }}>Ramesh Shrestha</span>
                  </div>
                </button>
              </div>
            </div>
          </form>

          {/* Footer Navigation */}
          <div className="login-footer-links">
            <span>Student walk-in or public inquiry?</span>
            <Link to="/register" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span>Open Student Registration</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
