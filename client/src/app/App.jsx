import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import Navbar from "../shared/ui/layout/Navbar";

import Home from "../features/landing/ui/pages/HomePage";

import "../App.css";

function AppContent() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  return (
    <div className="app-container">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-surface-container-lowest)",
            color: "var(--color-on-surface)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--text-sm)",
            padding: "var(--space-4) var(--space-5)",
            boxShadow: "var(--shadow-xl)",
            fontFamily: "var(--font-body)",
          },
          success: {
            iconTheme: { primary: "var(--color-secondary)", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "var(--color-error)", secondary: "#fff" },
          },
        }}
      />
      {!isWidgetPage && !isSuperAdminPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/dashboard" />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
