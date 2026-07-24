import { ArrowLeft, LogIn, LogOut, UserRoundPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";
import "./PageShell.css";

export default function PageShell({ eyebrow, title, description, actions, children }) {
  const { user, profile, logout } = useAuth();

  return (
    <div className="app-page">
      <header className="app-nav">
        <Link to="/" className="app-brand" aria-label="Back to home">
          <img src={logo} alt="" />
          <span>Social Welfare Namibia</span>
        </Link>
        <nav>
          <Link to="/campaigns">Campaigns</Link>
          <Link to="/better-together">Better Together</Link>
          {user ? (
            <>
              <span className="nav-identity">
                {profile?.role === "professional" ? profile?.name : "Anonymous member"}
              </span>
              <button className="nav-button" onClick={logout}>
                <LogOut size={16} /> Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="nav-button">
                <LogIn size={16} /> Sign in
              </Link>
              <Link to="/sign-up" className="nav-button nav-button-primary">
                <UserRoundPlus size={16} /> Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Home
        </Link>
        <section className="page-heading">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1>{title}</h1>
            {description && <p className="page-description">{description}</p>}
          </div>
          {actions && <div className="page-actions">{actions}</div>}
        </section>
        {children}
      </main>
    </div>
  );
}
