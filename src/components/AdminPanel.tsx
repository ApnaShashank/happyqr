"use client";

import { useState, useEffect } from "react";
import { QRHistoryEntry } from "@/types";
import { Toast } from "@/hooks/useToast";
import { ShieldAlert } from "lucide-react";

interface AdminPanelProps {
  showToast: (message: string, type?: Toast["type"]) => void;
  userEmail: string | null;
}

interface SystemMetric {
  label: string;
  value: string | number;
  status: "normal" | "warning" | "error";
}

export default function AdminPanel({ showToast, userEmail }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "config" | "logs">("overview");

  // Config Limits state (stored in localStorage)
  const [anonLimit, setAnonLimit] = useState(1);
  const [posterLimit, setPosterLimit] = useState(2);

  // System Stats Simulation
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { label: "API Gateway Latency", value: "84ms", status: "normal" },
    { label: "HuggingFace Flux Schnell Status", value: "Ready (Idle)", status: "normal" },
    { label: "Server Load", value: "14%", status: "normal" },
    { label: "Memory Usage", value: "128MB / 512MB", status: "normal" },
  ]);

  // Loaded stats
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [totalGenerations, setTotalGenerations] = useState(0);
  const [allLogs, setAllLogs] = useState<QRHistoryEntry[]>([]);

  // Load limits and stats on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAnonLimit(Number(localStorage.getItem("happyqr_limit_anon") || "1"));
      setPosterLimit(Number(localStorage.getItem("happyqr_limit_poster") || "2"));

      // Read current history logs for system logging
      try {
        const rawHistory = localStorage.getItem("happyqr_history");
        if (rawHistory) {
          const parsed = JSON.parse(rawHistory);
          setAllLogs(parsed);
          setTotalGenerations(parsed.length);
        }
      } catch {
        /* ignore */
      }

      // Simulate registered users count
      setTotalUsersCount(Math.max(1, Math.floor(Math.random() * 8) + 3));
    }
  }, []);

  const handleSaveConfig = () => {
    localStorage.setItem("happyqr_limit_anon", String(anonLimit));
    localStorage.setItem("happyqr_limit_poster", String(posterLimit));
    showToast("Limits configuration saved successfully!", "success");
  };

  const isAuthorizedAdmin = userEmail === "shashank8808108802@gmail.com";

  if (!isAuthorizedAdmin) {
    return (
      <div className="fade-in" style={{ maxWidth: "600px", margin: "64px auto", textAlign: "center" }}>
        <div className="card">
          <div className="card-body" style={{ padding: "48px 32px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", color: "var(--accent-red)" }}>
              <ShieldAlert size={56} />
            </div>
            <h2 className="modal-title" style={{ fontSize: "22px", marginBottom: "8px" }}>
              Access Denied
            </h2>
            <p className="modal-desc" style={{ maxWidth: "420px", margin: "0 auto" }}>
              You do not have administrative privileges to access the panel. Please sign in with the authorized admin account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card fade-in" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div className="card-header">
        <div>
          <div className="card-title">Admin Dashboard Panel</div>
          <div className="card-subtitle">Manage service limits, inspect system telemetry, and inspect logs</div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            className={`btn btn-sm ${activeSubTab === "overview" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveSubTab("overview")}
          >
            Overview
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === "config" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveSubTab("config")}
          >
            Settings & Limits
          </button>
          <button
            className={`btn btn-sm ${activeSubTab === "logs" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveSubTab("logs")}
          >
            Generation Logs
          </button>
        </div>
      </div>
      <div className="card-body">
        {activeSubTab === "overview" && (
          <div>
            {/* Stat Counters Row */}
            <div className="stats-bar" style={{ marginBottom: "28px" }}>
              <div className="stat-item">
                <span className="stat-value">{totalGenerations}</span>
                <span className="stat-label">Total QRs Logged</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{totalUsersCount}</span>
                <span className="stat-label">Simulated Active Sessions</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{anonLimit}</span>
                <span className="stat-label">Anon Limit Config</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{posterLimit}/day</span>
                <span className="stat-label">Daily Poster Limit</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              System Health & Telemetry
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {metrics.map((metric, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                  }}
                >
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase" }}>
                    {metric.label}
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      marginTop: "8px",
                      color: "var(--text-primary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "var(--accent-green)",
                        display: "inline-block",
                      }}
                    />
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === "config" && (
          <div style={{ maxWidth: "500px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "20px" }}>
              Configure Service Limits
            </h3>

            {/* Anon generation limit */}
            <div className="form-group">
              <label className="form-label" htmlFor="anon-limit-select">Anonymous Generation Limit</label>
              <select
                id="anon-limit-select"
                className="form-select"
                value={anonLimit}
                onChange={(e) => setAnonLimit(Number(e.target.value))}
              >
                <option value={1}>1 QR Code (Default)</option>
                <option value={2}>2 QR Codes</option>
                <option value={5}>5 QR Codes</option>
                <option value={10}>10 QR Codes</option>
              </select>
              <div className="form-hint">Number of QRs generated before registration prompt is triggered</div>
            </div>

            {/* Poster limit per day */}
            <div className="form-group">
              <label className="form-label" htmlFor="poster-limit-select">Poster Art Generations Per Day</label>
              <select
                id="poster-limit-select"
                className="form-select"
                value={posterLimit}
                onChange={(e) => setPosterLimit(Number(e.target.value))}
              >
                <option value={1}>1 Poster Art / Day</option>
                <option value={2}>2 Poster Arts / Day (Default)</option>
                <option value={5}>5 Poster Arts / Day</option>
                <option value={10}>10 Poster Arts / Day</option>
              </select>
              <div className="form-hint">Number of AI-generated backgrounds allowed per user daily</div>
            </div>

            <button
              id="btn-save-admin-config"
              className="btn btn-primary"
              style={{ marginTop: "12px" }}
              onClick={handleSaveConfig}
            >
              Save Configuration Limits
            </button>
          </div>
        )}

        {activeSubTab === "logs" && (
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px" }}>
              Recent Generation Logs
            </h3>
            {allLogs.length === 0 ? (
              <div style={{ color: "var(--text-tertiary)", textAlign: "center", padding: "32px" }}>
                No active QR codes generated in system history.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {allLogs.map((log) => (
                  <div
                    key={log.id}
                    style={{
                      background: "var(--bg-input)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          wordBreak: "break-all",
                        }}
                      >
                        {log.content}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                        ID: {log.id} · Type: {log.type.toUpperCase()} · Error Level: {log.settings.level}
                      </div>
                    </div>
                    <span
                      className="history-type-badge badge-url"
                      style={{ padding: "3px 10px", fontSize: "9px" }}
                    >
                      SUCCESS
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
