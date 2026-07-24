import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowRight, BriefcaseBusiness, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { useAuth } from "./context/AuthContext";
import "./sign_up.css";

const initialForm = {
  name: "",
  age: "",
  email: "",
  password: "",
  location: "",
  preferredLanguage: "English",
  reasonForJoining: "",
  emergencyContact: "",
};

export default function SignUp() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ busy: false, error: "" });
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const update = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ busy: true, error: "" });

    try {
      const credential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(credential.user, { displayName: form.name });
      await setDoc(doc(db, "users", credential.user.uid), {
        uid: credential.user.uid,
        role: "user",
        name: form.name,
        Name: form.name,
        age: Number(form.age),
        Age: Number(form.age),
        email: form.email.toLowerCase(),
        location: form.location,
        preferredLanguage: form.preferredLanguage,
        reasonForJoining: form.reasonForJoining,
        "Reason for Joining": form.reasonForJoining,
        emergencyContact: form.emergencyContact,
        anonymousInCommunity: true,
        createdAt: serverTimestamp(),
      });
      await refreshProfile(credential.user);
      navigate("/talk-to-someone", { replace: true });
    } catch (error) {
      setStatus({
        busy: false,
        error:
          error.code === "auth/email-already-in-use"
            ? "That email already has an account. Try signing in."
            : error.code === "auth/weak-password"
              ? "Use a password with at least 6 characters."
              : "We could not create your account. Check the form and try again.",
      });
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link to="/" className="auth-home-link">Social Welfare Namibia</Link>
        <div>
          <p className="auth-kicker">A private path to support</p>
          <h1>Join as a community member.</h1>
          <p>
            Your identity stays anonymous in public community spaces. Your account is used only
            when you choose to speak privately with a professional.
          </p>
        </div>
        <div className="auth-trust"><ShieldCheck size={18} /> Public posts never show your name.</div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-title-row">
            <div>
              <p className="auth-kicker">Create account</p>
              <h2>Tell us about you</h2>
            </div>
            <Link to="/sign-up/professional" className="professional-switch">
              <BriefcaseBusiness size={16} /> I’m a professional
            </Link>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="form-grid">
              <label>
                Full name
                <input name="name" value={form.name} onChange={update} required autoComplete="name" />
              </label>
              <label>
                Age
                <input name="age" type="number" min="13" max="120" value={form.age} onChange={update} required />
              </label>
              <label>
                Email
                <input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" />
              </label>
              <label>
                Password
                <input name="password" type="password" minLength="6" value={form.password} onChange={update} required autoComplete="new-password" />
              </label>
              <label>
                Town or region
                <input name="location" value={form.location} onChange={update} required placeholder="e.g. Windhoek" />
              </label>
              <label>
                Preferred language
                <select name="preferredLanguage" value={form.preferredLanguage} onChange={update}>
                  <option>English</option>
                  <option>Afrikaans</option>
                  <option>Oshiwambo</option>
                  <option>Otjiherero</option>
                  <option>Khoekhoegowab</option>
                </select>
              </label>
              <label className="full-field">
                Reason for joining
                <textarea name="reasonForJoining" value={form.reasonForJoining} onChange={update} rows="3" placeholder="What kind of support are you looking for?" />
              </label>
              <label className="full-field">
                Emergency contact (optional)
                <input name="emergencyContact" value={form.emergencyContact} onChange={update} placeholder="Name and phone number" />
              </label>
            </div>
            {status.error && <p className="form-error" role="alert">{status.error}</p>}
            <button className="auth-submit" disabled={status.busy}>
              {status.busy ? "Creating account…" : "Create member account"} <ArrowRight size={17} />
            </button>
          </form>

          <p className="auth-alt">Already registered? <Link to="/sign-in">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
