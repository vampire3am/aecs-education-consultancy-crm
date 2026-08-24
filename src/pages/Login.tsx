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
import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
            <p>Enter the credentials issued to your authorized staff account.</p>
          </div>

          {!isSupabaseConfigured && (
            <div className="login-error-banner" role="alert">
              <ShieldAlert size={16} />
              <span>This deployment is not connected to the AECS authentication service.</span>
            </div>
          )}

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
                  placeholder="name@aecsnepal.com"
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

            <div style={{ marginBottom: "18px", fontSize: "11.5px", color: "#64748B" }}>
              Sessions are encrypted, automatically refreshed, and can be revoked by an administrator.
            </div>

            {/* Error Alert */}
            {error && (
              <div className="login-error-banner">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="login-submit-btn" disabled={busy || !isSupabaseConfigured}>
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
          </form>

        </div>
      </div>
    </div>
  );
}

export default Login;
