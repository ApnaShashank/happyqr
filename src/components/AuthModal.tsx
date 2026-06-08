"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let intervalId: any;

    const initializeGoogle = () => {
      if (typeof window !== "undefined" && (window as any).google) {
        clearInterval(intervalId);
        try {
          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
          if (!clientId) {
            console.error("Google Client ID is not set. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local");
            return;
          }

          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: any) => {
              const decoded = decodeJwt(response.credential);
              if (decoded && decoded.email) {
                onLoginSuccess(decoded.email);
                onClose();
              }
            },
          });

          const btnContainer = document.getElementById("google-signin-btn");
          if (btnContainer) {
            (window as any).google.accounts.id.renderButton(btnContainer, {
              theme: "outline",
              size: "large",
              width: "100%",
              text: "continue_with",
              shape: "rectangular",
            });
          }
        } catch (err) {
          console.error("Failed to initialize Google Sign-in:", err);
        }
      }
    };

    initializeGoogle();
    intervalId = setInterval(initializeGoogle, 300);

    return () => clearInterval(intervalId);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLoginTab && !name)) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess(email);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>
        <h2 className="modal-title">{isLoginTab ? "Welcome Back" : "Create Account"}</h2>
        <p className="modal-desc">
          {isLoginTab ? "Sign in to access advanced template settings" : "Sign up for HappyQR"}
        </p>

        <div style={{ marginTop: "16px", marginBottom: "16px", minHeight: "40px", display: "flex", justifyContent: "center" }}>
          <div id="google-signin-btn" style={{ width: "100%" }} />
        </div>

        <div className="auth-divider" style={{ display: "flex", alignItems: "center", marginBottom: "16px", color: "var(--text-tertiary)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)", opacity: 0.3 }} />
          <span style={{ padding: "0 10px" }}>Or login with email</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--border-color)", opacity: 0.3 }} />
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLoginTab ? "active" : ""}`}
            onClick={() => setIsLoginTab(true)}
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLoginTab ? "active" : ""}`}
            onClick={() => setIsLoginTab(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {!isLoginTab && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="auth-name">Name</label>
              <input
                id="auth-name"
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            style={{ marginTop: "12px" }}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner" />
            ) : isLoginTab ? (
              "Sign In"
            ) : (
              "Get Started"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
