"use client";

import { ActiveTab } from "@/app/page";

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  userEmail: string | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  userEmail,
  onLoginClick,
  onLogout,
}: NavbarProps) {
  const isAdmin = userEmail === "shashank8808108802@gmail.com";

  return (
    <nav className="navbar">
      {/* Left side actions (or empty spacer to balance layout) */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {isAdmin && (
          <button
            className={`btn btn-sm ${activeTab === "admin" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("admin")}
            style={{ fontSize: "11px", height: "28px", padding: "0 10px" }}
            id="nav-admin-btn"
          >
            ⚙ Admin
          </button>
        )}
      </div>

      {/* Absolutely centered Logo + Website Name */}
      <div
        className="navbar-brand-centered"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          cursor: "pointer",
        }}
        onClick={() => setActiveTab("generate")}
      >
        <img
          src="/logo.png"
          alt="HappyQR Logo"
          style={{ height: "36px", width: "auto", objectFit: "contain" }}
        />
        <span
          style={{
            fontSize: "19px",
            fontWeight: 850,
            color: "var(--text-primary)",
            letterSpacing: "-0.5px",
          }}
        >
          Happy<span style={{ color: "var(--accent-blue)" }}>QR</span>
        </span>
      </div>

      {/* Right side actions */}
      <div className="navbar-actions">
        {/* Theme Toggler */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{ height: "30px", width: "30px" }}
        >
          {theme === "dark" ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* User Session buttons */}
        {userEmail ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="user-menu-trigger" style={{ padding: "4px 8px" }}>
              <div className="avatar" style={{ width: "20px", height: "20px", fontSize: "10px" }}>
                {userEmail[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>
                {userEmail.split("@")[0].slice(0, 10)}
              </span>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={onLogout}
              style={{ color: "var(--accent-red)", padding: "0 6px", fontSize: "11px" }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={onLoginClick}
            style={{ fontSize: "11px", height: "28px" }}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
