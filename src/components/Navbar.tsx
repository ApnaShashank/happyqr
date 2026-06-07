"use client";

import { useState, useRef, useEffect } from "react";
import { ActiveTab } from "@/app/page";
import { Settings } from "lucide-react";

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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userRole, setUserRole] = useState<"free" | "pro">("free");
  const menuRef = useRef<HTMLDivElement>(null);

  const loadUserRole = () => {
    if (!userEmail) return;
    try {
      const rolesMap = JSON.parse(localStorage.getItem("happyqr_user_roles") || "{}");
      setUserRole(rolesMap[userEmail] || "free");
    } catch {
      setUserRole("free");
    }
  };

  useEffect(() => {
    loadUserRole();
  }, [userEmail]);

  useEffect(() => {
    const handleStorageChange = () => {
      loadUserRole();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [userEmail]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  return (
    <nav className="navbar">
      {/* Left side actions (logo + optional Admin button) */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          onClick={() => setActiveTab("generate")}
        >
          <img
            src="/logo.png"
            alt="HappyQR Logo"
            style={{ height: "36px", width: "auto", objectFit: "contain" }}
          />
        </div>
        {isAdmin && (
          <button
            className={`btn btn-sm ${activeTab === "admin" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("admin")}
            style={{ fontSize: "11px", height: "28px", padding: "0 10px", display: "flex", alignItems: "center", gap: "5px" }}
            id="nav-admin-btn"
          >
            <Settings size={14} />
            Admin
          </button>
        )}
      </div>

      {/* Absolutely centered Website Name */}
      <div
        className="navbar-brand-centered"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          cursor: "pointer",
        }}
        onClick={() => setActiveTab("generate")}
      >
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
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }} ref={menuRef}>
            <span className={`role-badge role-badge-${userRole}`}>
              {userRole}
            </span>
            <button
              className="user-menu-avatar-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={`${userEmail} (${userRole.toUpperCase()})`}
            >
              {userEmail[0].toUpperCase()}
            </button>
            {showUserMenu && (
              <div className="user-dropdown-menu">
                <div className="user-dropdown-header" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span className="user-dropdown-email">{userEmail}</span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>Account Tier:</span>
                    <span className={`role-badge role-badge-${userRole}`} style={{ margin: 0 }}>
                      {userRole}
                    </span>
                  </div>
                </div>
                <div className="user-dropdown-divider" />
                <button
                  type="button"
                  className="user-dropdown-item"
                  style={{ color: "var(--accent-blue)" }}
                  onClick={() => {
                    const nextRole = userRole === "free" ? "pro" : "free";
                    try {
                      const rolesMap = JSON.parse(localStorage.getItem("happyqr_user_roles") || "{}");
                      rolesMap[userEmail] = nextRole;
                      localStorage.setItem("happyqr_user_roles", JSON.stringify(rolesMap));
                      setUserRole(nextRole);
                      window.dispatchEvent(new Event("storage"));
                      setTimeout(() => {
                        window.location.reload();
                      }, 500);
                    } catch {
                      /* ignore */
                    }
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {userRole === "free" ? "Upgrade to PRO" : "Revert to Free"}
                </button>
                <div className="user-dropdown-divider" />
                <button
                  className="user-dropdown-item logout-btn"
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
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
