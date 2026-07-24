// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import InfoHub from "./pages/InfoHub";
import FindHelp from "./pages/FindHelp";
import TalkToSomeone from "./pages/TalkToSomeone";
import SignIn from "./sign_in";
import SignUp from "./sign_up";
import ProfessionalSignUp from "./sign-up_professionals";
import Campaigns from "./pages/campaigns";
import BetterTogether from "./pages/better_together";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info-hub" element={<InfoHub />} />
          <Route path="/find-help" element={<FindHelp />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-up/professional" element={<ProfessionalSignUp />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/better-together" element={<BetterTogether />} />
          <Route
            path="/talk-to-someone"
            element={
              <ProtectedRoute>
                <TalkToSomeone />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
