"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import QRGenerator from "@/components/QRGenerator";
import BulkGenerator from "@/components/BulkGenerator";
import PosterGenerator from "@/components/PosterGenerator";
import AdminPanel from "@/components/AdminPanel";
import HistoryPanel from "@/components/HistoryPanel";
import ToastContainer from "@/components/Toast";
import AuthModal from "@/components/AuthModal";
import { useQRHistory } from "@/hooks/useQRHistory";
import { useToast } from "@/hooks/useToast";

export type ActiveTab = "generate" | "bulk" | "poster" | "history" | "admin";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("generate");
  const { history, addToHistory, clearHistory, removeFromHistory, totalGenerated } = useQRHistory();
  const { toasts, showToast } = useToast();
  
  // Theme state (default dark)
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Auth state
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Initialize theme from localStorage on client mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("happyqr_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    const savedUser = localStorage.getItem("happyqr_user");
    if (savedUser) {
      setUserEmail(savedUser);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("happyqr_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    showToast(`Switched to ${nextTheme} mode`, "info");
  };

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    localStorage.setItem("happyqr_user", email);
    showToast(`Logged in as ${email}`, "success");
  };

  const handleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem("happyqr_user");
    showToast("Logged out successfully", "info");
  };

  return (
    <>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        userEmail={userEmail}
        onLoginClick={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />
      <main className="main-content">
        <Hero activeTab={activeTab} setActiveTab={setActiveTab} totalGenerated={totalGenerated} />

        {activeTab === "generate" && (
          <QRGenerator
            onGenerate={(entry) => addToHistory(entry)}
            showToast={showToast}
            userEmail={userEmail}
            onLoginClick={() => setIsAuthOpen(true)}
          />
        )}
        {activeTab === "bulk" && (
          <BulkGenerator
            onGenerate={(entries) => entries.forEach(addToHistory)}
            showToast={showToast}
          />
        )}
        {activeTab === "poster" && (
          <PosterGenerator
            showToast={showToast}
            userEmail={userEmail}
            onLoginClick={() => setIsAuthOpen(true)}
          />
        )}
        {activeTab === "history" && (
          <HistoryPanel
            history={history}
            onClear={clearHistory}
            onRemove={removeFromHistory}
            showToast={showToast}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "admin" && (
          <AdminPanel
            showToast={showToast}
            userEmail={userEmail}
          />
        )}
      </main>
      <ToastContainer toasts={toasts} />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
