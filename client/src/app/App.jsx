import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import Navbar from "../shared/ui/components/Navbar";

import Login from "../features/auth/ui/pages/Login";
import Signup from "../features/auth/ui/pages/Signup";
import ForgotPassword from "../features/auth/ui/pages/ForgotPassword";

import Dashboard from "../features/dashboard/ui/pages/Dashboard";
import AdminPanel from "../features/dashboard/ui/pages/AdminPanel";

import Home from "../features/public/ui/pages/Home";
import Product from "../features/public/ui/pages/Product";
import Pricing from "../features/public/ui/pages/Pricing";
import Docs from "../features/public/ui/pages/Docs";

import ChatWidgetPage from "../features/widget/ui/pages/ChatWidgetPage";

import SuperAdminDashboard from "../features/superadmin/ui/pages/SuperAdminDashboard";
import SAOverview from "../features/superadmin/ui/components/SAOverview";
import SABusinessOwners from "../features/superadmin/ui/components/SABusinessOwners";
import SAAgents from "../features/superadmin/ui/components/SAAgents";
import SAConversations from "../features/superadmin/ui/components/SAConversations";
import SASubscriptions from "../features/superadmin/ui/components/SASubscriptions";
import SANotifications from "../features/superadmin/ui/components/SANotifications";
import SASettings from "../features/superadmin/ui/components/SASettings";
import SuperAdminProtectedRoute from "../features/superadmin/ui/components/SuperAdminProtectedRoute";

function AppContent() {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const isWidgetPage = location.pathname.startsWith("/chat-widget");
  const isSuperAdminPage = location.pathname.startsWith("/super-admin");

  return (
    <div className="app-container">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "var(--inverse-surface)",
            color: "var(--inverse-on-surface)",
            border: "1px solid var(--outline-variant)",
            borderRadius: "var(--radius-md)",
            fontSize: "14px",
            padding: "12px 20px",
          },
          success: {
            iconTheme: { primary: "#10b981", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "var(--error)", secondary: "#fff" },
          },
        }}
      />
      {!isWidgetPage && !isSuperAdminPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product" element={<Product />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/docs" element={<Docs />} />
        <Route
          path="/login"
          element={
            !user ? (
              <Login />
            ) : user.role === "superadmin" ? (
              <Navigate to="/super-admin/dashboard" />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
        <Route
          path="/signup"
          element={!user ? <Signup /> : <Navigate to="/dashboard" />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={
            user && user.role === "admin" ? <AdminPanel /> : <Navigate to="/" />
          }
        />
        <Route path="/chat-widget/:apiKey" element={<ChatWidgetPage />} />

        <Route element={<SuperAdminProtectedRoute />}>
          <Route
            path="/super-admin/dashboard"
            element={<SuperAdminDashboard />}
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<SAOverview />} />
            <Route path="businesses" element={<SABusinessOwners />} />
            <Route path="agents" element={<SAAgents />} />
            <Route path="conversations" element={<SAConversations />} />
            <Route path="subscriptions" element={<SASubscriptions />} />
            <Route path="notifications" element={<SANotifications />} />
            <Route path="settings" element={<SASettings />} />
          </Route>
        </Route>
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
