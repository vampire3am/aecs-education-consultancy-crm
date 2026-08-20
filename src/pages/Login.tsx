import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building,
  Check,
  CreditCard,
  Eye,
  EyeOff,
  Globe,
  GraduationCap,
  HelpCircle,
  KeyRound,
  Lock,
  Mail,
  PlaneTakeoff,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import { isSupabaseConfigured } from "../lib/supabase";

interface QuickRolePreset {
  id: string;
  name: string;
  department: string;
  email: string;
  defaultPass: string;
  icon: any;
  tone: string;
}

const STAFF_ROLE_PRESETS: QuickRolePreset[] = [
  {
    id: "admin",
    name: "Owner / Director",
    department: "Executive Management",
    email: "admin@abroad.edu.np",
    defaultPass: "aecs2026",
    icon: ShieldCheck,
    tone: "#3B82F6",
  },
  {
    id: "counsellor",
    name: "Senior Counsellor",
    department: "Admissions & UK/Aus Placements",
    email: "counsellor@abroad.edu.np",
    defaultPass: "counsellor2026",
    icon: Globe,
    tone: "#8B5CF6",
  },
  {
    id: "visa",
    name: "Visa Compliance Officer",
    department: "Embassy Lodgement & VFS",
    email: "visa@abroad.edu.np",
    defaultPass: "aecs2026",
    icon: PlaneTakeoff,
    tone: "#10B981",
  },
  {
    id: "faculty",
    name: "Test Prep Faculty Lead",
    department: "IELTS, PTE & Language Lab",
    email: "faculty@abroad.edu.np",
    defaultPass: "aecs2026",
    icon: GraduationCap,
    tone: "#F59E0B",
  },
  {
    id: "accounts",
    name: "Finance & Accounts",
    department: "Ledger, Invoices & Commissions",
    email: "accounts@abroad.edu.np",
    defaultPass: "aecs2026",
    icon: CreditCard,
    tone: "#06B6D4",
  },
  {
    id: "frontdesk",
    name: "Front Desk & Intake",
    department: "Reception & Walk-in Inquiries",
    email: "frontdesk@abroad.edu.np",
    defaultPass: "aecs2026",
    icon: Users,
    tone: "#EC4899",
  },
];

export function Login() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>("admin");
  const [email, setEmail] = useState("admin@abroad.edu.np");
  const [password, setPassword] = useState("aecs2026");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // If already authenticated, redirect immediately to dashboard
  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSelectPreset = (preset: QuickRolePreset) => {
    setActiveTab(preset.id);
    setEmail(preset.email);
    setPassword(preset.defaultPass);
    setError("");
  };

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
                  <span>UK, Australia, Canada, USA, Germany, Japan, New Zealand</span>
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
              <span>Kathmandu Central Hub · 256-Bit Encrypted</span>
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
            <p>Select your authorized department or enter your official credentials to access the CRM.</p>
          </div>

          {/* Quick Department Role Tabs */}
          <div className="login-role-tabs">
            {STAFF_ROLE_PRESETS.map(preset => {
              const Icon = preset.icon;
              const isActive = activeTab === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`login-role-tab-btn ${isActive ? "active" : ""}`}
                  onClick={() => handleSelectPreset(preset)}
                >
                  <Icon size={13} style={{ color: isActive ? preset.tone : "inherit" }} />
                  <span>{preset.name}</span>
                </button>
              );
            })}
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
                <span style={{ fontSize: "11px", color: "#64748B" }}>Default: aecs2026</span>
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

            {/* Remember Me Checkbox */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px", fontSize: "12px", color: "#94A3B8" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "7px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: "#3B82F6" }}
                />
                <span>Remember this terminal</span>
              </label>
              <span style={{ fontSize: "11.5px", color: "#64748B" }}>AECS Auth v2.4</span>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="login-error-banner">
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
