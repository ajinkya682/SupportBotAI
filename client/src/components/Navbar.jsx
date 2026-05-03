import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Bot, LogOut, LayoutDashboard, X, Menu } from "lucide-react";

// We are commenting these out because the files don't exist yet
// import { useSelector, useDispatch } from 'react-redux';
// import { logout, reset } from '../slices/authSlice';

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Temporary: We will pretend there is no user logged in for now
  // Later, when you build your backend, you can turn this back on.
  const user = null;

  const onLogout = () => {
    console.log("Logout clicked");
  };

  // Don't show main navbar on dashboard/admin pages
  if (
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/admin")
  ) {
    return null;
  }

  const navLinks = [
    { to: "/product", label: "Product" },
    { to: "/pricing", label: "Pricing" },
    { to: "/docs", label: "Docs" },
  ];

  return (
    <>
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur)",
          WebkitBackdropFilter: "var(--glass-blur)",
          boxShadow: "var(--shadow-sm)",
          borderBottom: "1px solid var(--color-surface-container-low)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "72px",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: "var(--weight-extrabold)",
              fontSize: "var(--text-xl)",
              color: "var(--color-primary)",
              letterSpacing: "var(--tracking-tight)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "var(--color-primary-light)",
                borderRadius: "var(--radius-full)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bot size={18} style={{ color: "var(--color-primary)" }} />
            </div>
            SupportBot
            <span style={{ color: "var(--color-on-surface)" }}>AI</span>
          </Link>

          {/* Desktop Nav */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-8)",
              alignItems: "center",
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: "var(--text-sm)",
                  fontWeight: "var(--weight-semibold)",
                  color:
                    location.pathname === link.to
                      ? "var(--color-primary)"
                      : "var(--color-on-surface-variant)",
                  transition: "color var(--duration-base)",
                }}
              >
                {link.label}
              </Link>
            ))}

            <div
              style={{
                height: "20px",
                width: "1px",
                background: "var(--color-surface-container-high)",
              }}
            ></div>

            <Link
              to="/login"
              className="btn btn-ghost"
              style={{ fontSize: "var(--text-sm)" }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="btn btn-primary"
              style={{
                padding: "var(--space-2) var(--space-6)",
                fontSize: "var(--text-sm)",
              }}
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: "var(--color-on-surface)",
              cursor: "pointer",
            }}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "280px",
          background: "var(--color-surface-container-lowest)",
          zIndex: 1000,
          padding: "var(--space-8)",
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-6)",
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform var(--duration-slow) var(--ease-decelerate)",
        }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          style={{
            alignSelf: "flex-end",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <X size={24} />
        </button>

        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={() => setMobileOpen(false)}
            style={{
              fontSize: "var(--text-lg)",
              fontWeight: "var(--weight-bold)",
            }}
          >
            {link.label}
          </Link>
        ))}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <Link
            to="/login"
            className="btn btn-secondary"
            style={{ width: "100%" }}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="btn btn-primary"
            style={{ width: "100%" }}
          >
            Get Started
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}
