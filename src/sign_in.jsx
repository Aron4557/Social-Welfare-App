import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import "./sign-in.css";

export default function SignIn() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState({ busy: false, error: "" });
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ busy: true, error: "" });
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate(location.state?.from || "/talk-to-someone", { replace: true });
    } catch {
      setStatus({ busy: false, error: "The email or password is incorrect." });
    }
  };

  return (
    <main className="auth-page signin-page">
      <section className="auth-story">
        <Link to="/" className="auth-home-link">Social Welfare Namibia</Link>
        <div>
          <p className="auth-kicker">Welcome back</p>
          <h1>Your private support space.</h1>
          <p>
            Sign-in protects conversations with professionals. Campaigns, community stories,
            the Info Hub, and SOFI remain open to everyone.
          </p>
        </div>
        <div className="auth-trust"><LockKeyhole size={18} /> Email and password protected.</div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-inner auth-panel-compact">
          <p className="auth-kicker">Secure access</p>
          <h2>Sign in</h2>
          <form className="auth-form" onSubmit={submit}>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" /></label>
            <label>Password<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required autoComplete="current-password" /></label>
            {status.error && <p className="form-error" role="alert">{status.error}</p>}
            <button className="auth-submit" disabled={status.busy}>
              {status.busy ? "Signing in…" : "Sign in"} <ArrowRight size={17} />
            </button>
          </form>
          <div className="signin-options">
            <p>New member? <Link to="/sign-up">Create an account</Link></p>
            <p>Qualified professional? <Link to="/sign-up/professional">Register here</Link></p>
          </div>
        </div>
      </section>
    </main>
  );
}
