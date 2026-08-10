import { type FormEvent, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";
import { isSupabaseConfigured } from "../lib/supabase";

export function Login() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to="/dashboard" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in");
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-page">
    <section className="login-card">
      <div className="login-brand">
        <span className="login-logo-frame"><img src="/abroad-logo-new.png" alt="Abroad Education Consultancy Services" /></span>
        <strong>Abroad Education Consultancy Services</strong>
        <span>Choose Abroad to Study Abroad</span>
      </div>
      <div className="login-copy"><p className="eyebrow">Staff workspace</p><h1>Welcome back</h1><p>Sign in to continue to the Abroad Education Consultancy Services workspace.</p></div>
      <form onSubmit={submit}>
        <label>Email address<div className="input-wrap"><Mail size={17} /><input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@abroad.edu.np" required /></div></label>
        <label>Password<div className="input-wrap"><LockKeyhole size={17} /><input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" required /></div></label>
        {error && <p className="form-error">{error}</p>}
        <button className="login-button" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        {!isSupabaseConfigured && <button type="button" className="dev-entry" onClick={() => navigate("/dashboard")}>Open local interface preview</button>}
      </form>
      <small>Authorized staff only</small>
    </section>
    <p className="login-footer">© 2026 Abroad Education Consultancy Services Pvt. Ltd.</p>
  </main>;
}
