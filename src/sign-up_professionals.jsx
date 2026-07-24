import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { ArrowRight, BadgeCheck, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { useAuth } from "./context/AuthContext";
import "./sign-up_professionals.css";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  position: "",
  organization: "",
  location: "",
  registrationNumber: "",
  certification: "",
  qualifications: "",
  yearsExperience: "",
};

export default function ProfessionalSignUp() {
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
      await setDoc(doc(db, "Professionals", credential.user.uid), {
        uid: credential.user.uid,
        role: "professional",
        name: form.name,
        Name: form.name,
        email: form.email.toLowerCase(),
        phone: form.phone,
        position: form.position,
        Position: form.position,
        organization: form.organization,
        location: form.location,
        Location: form.location,
        registrationNumber: form.registrationNumber,
        certification: form.certification,
        Certification: form.certification,
        qualifications: form.qualifications,
        yearsExperience: Number(form.yearsExperience),
        rating: 0,
        Rating: 0,
        verified: false,
        createdAt: serverTimestamp(),
      });
      await refreshProfile(credential.user);
      navigate("/campaigns", { replace: true });
    } catch (error) {
      setStatus({
        busy: false,
        error:
          error.code === "auth/email-already-in-use"
            ? "That email already has an account. Try signing in."
            : "We could not create the professional account. Please check every required field.",
      });
    }
  };

  return (
    <main className="auth-page professional-auth">
      <section className="auth-story">
        <Link to="/" className="auth-home-link">Social Welfare Namibia</Link>
        <div>
          <p className="auth-kicker">Professional network</p>
          <h1>Bring trusted care closer.</h1>
          <p>
            Publish your qualifications, join private support conversations, and organize
            community campaigns from one profile.
          </p>
        </div>
        <div className="auth-trust"><BadgeCheck size={18} /> Profiles can be reviewed before verification.</div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-title-row">
            <div>
              <p className="auth-kicker">Professional registration</p>
              <h2>Create your profile</h2>
            </div>
            <Link to="/sign-up" className="professional-switch">
              <Users size={16} /> Member sign-up
            </Link>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="form-grid">
              <label>Full name<input name="name" value={form.name} onChange={update} required autoComplete="name" /></label>
              <label>Email<input name="email" type="email" value={form.email} onChange={update} required autoComplete="email" /></label>
              <label>Password<input name="password" type="password" minLength="6" value={form.password} onChange={update} required autoComplete="new-password" /></label>
              <label>Phone number<input name="phone" value={form.phone} onChange={update} required autoComplete="tel" /></label>
              <label>Professional position<input name="position" value={form.position} onChange={update} required placeholder="e.g. Mental Health Counsellor" /></label>
              <label>Organization<input name="organization" value={form.organization} onChange={update} required /></label>
              <label>Town or region<input name="location" value={form.location} onChange={update} required /></label>
              <label>Registration number<input name="registrationNumber" value={form.registrationNumber} onChange={update} required /></label>
              <label>Primary certification<input name="certification" value={form.certification} onChange={update} required /></label>
              <label>Years of experience<input name="yearsExperience" type="number" min="0" max="70" value={form.yearsExperience} onChange={update} required /></label>
              <label className="full-field">
                Qualifications and areas of expertise
                <textarea name="qualifications" value={form.qualifications} onChange={update} rows="4" required placeholder="Degrees, certificates, professional bodies, and specializations" />
              </label>
            </div>
            {status.error && <p className="form-error" role="alert">{status.error}</p>}
            <button className="auth-submit" disabled={status.busy}>
              {status.busy ? "Creating profile…" : "Create professional profile"} <ArrowRight size={17} />
            </button>
          </form>
          <p className="auth-alt">Already registered? <Link to="/sign-in">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}
