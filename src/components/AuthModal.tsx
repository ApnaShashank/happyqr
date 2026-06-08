"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

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
