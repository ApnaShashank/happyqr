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
  const [anonSingle, setAnonSingle] = useState(3);
  const [anonBulk, setAnonBulk] = useState(0);
  const [anonPoster, setAnonPoster] = useState(0);

  const [freeSingle, setFreeSingle] = useState(10);
  const [freeBulk, setFreeBulk] = useState(5);
  const [freePoster, setFreePoster] = useState(2);

  const [proSingle, setProSingle] = useState(100);
  const [proBulk, setProBulk] = useState(100);
  const [proPoster, setProPoster] = useState(10);

  // Simulated Registered Users list
  const [users, setUsers] = useState<{ email: string; role: "free" | "pro" }[]>([]);

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

  const loadUsers = () => {
    if (typeof window === "undefined") return;
    const defaultMock = ["shashank8808108802@gmail.com", "brijesh@example.com", "jane.doe@example.com", "alex@happyqr.io"];
    let registered = [];
    try {
      registered = JSON.parse(localStorage.getItem("happyqr_registered_users") || "[]");
      if (registered.length === 0) {
        registered = defaultMock;
        localStorage.setItem("happyqr_registered_users", JSON.stringify(registered));
      }
    } catch {
      registered = defaultMock;
    }

    let rolesMap: Record<string, "free" | "pro"> = {};
    try {
      rolesMap = JSON.parse(localStorage.getItem("happyqr_user_roles") || "{}");
      registered.forEach((email: string) => {
        if (!rolesMap[email]) {
          rolesMap[email] = email.includes("shashank") || email.includes("brijesh") ? "pro" : "free";
        }
      });
      localStorage.setItem("happyqr_user_roles", JSON.stringify(rolesMap));
    } catch {
      rolesMap = {
        "shashank8808108802@gmail.com": "pro",
        "brijesh@example.com": "pro",
        "jane.doe@example.com": "free",
        "alex@happyqr.io": "free"
      };
    }

    setUsers(registered.map((email: string) => ({ email, role: rolesMap[email] || "free" })));
    setTotalUsersCount(registered.length);
  };

  // Load limits and stats on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAnonSingle(Number(localStorage.getItem("happyqr_limit_single_anon") || localStorage.getItem("happyqr_limit_anon") || "3"));
      setAnonBulk(Number(localStorage.getItem("happyqr_limit_bulk_anon") || "0"));
      setAnonPoster(Number(localStorage.getItem("happyqr_limit_poster_anon") || "0"));

      setFreeSingle(Number(localStorage.getItem("happyqr_limit_single_free") || "10"));
      setFreeBulk(Number(localStorage.getItem("happyqr_limit_bulk_free") || "5"));
      setFreePoster(Number(localStorage.getItem("happyqr_limit_poster_free") || "2"));

      setProSingle(Number(localStorage.getItem("happyqr_limit_single_pro") || "100"));
      setProBulk(Number(localStorage.getItem("happyqr_limit_bulk_pro") || "100"));
      setProPoster(Number(localStorage.getItem("happyqr_limit_poster_pro") || "10"));

      loadUsers();

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
    }
  }, []);

  const handleSaveConfig = () => {
    localStorage.setItem("happyqr_limit_single_anon", String(anonSingle));
    localStorage.setItem("happyqr_limit_anon", String(anonSingle)); // legacy compatibility
    localStorage.setItem("happyqr_limit_bulk_anon", String(anonBulk));
    localStorage.setItem("happyqr_limit_poster_anon", String(anonPoster));

    localStorage.setItem("happyqr_limit_single_free", String(freeSingle));
    localStorage.setItem("happyqr_limit_bulk_free", String(freeBulk));
    localStorage.setItem("happyqr_limit_poster_free", String(freePoster));

    localStorage.setItem("happyqr_limit_single_pro", String(proSingle));
    localStorage.setItem("happyqr_limit_bulk_pro", String(proBulk));
    localStorage.setItem("happyqr_limit_poster_pro", String(proPoster));
    
    showToast("Role-based configuration limits saved successfully!", "success");
  };

  const handleChangeRole = (email: string, newRole: "free" | "pro") => {
    try {
      const rolesMap = JSON.parse(localStorage.getItem("happyqr_user_roles") || "{}");
      rolesMap[email] = newRole;
      localStorage.setItem("happyqr_user_roles", JSON.stringify(rolesMap));
      showToast(`Role assigned as ${newRole.toUpperCase()} for ${email}`, "success");
      loadUsers();
      window.dispatchEvent(new Event("storage"));
    } catch {
      showToast("Failed to assign role.", "error");
    }
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
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{anonSingle}</span>
                <span className="stat-label">Anon Single QR Limit</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{freeSingle}/day</span>
                <span className="stat-label">Free Daily QR Limit</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              System Health & Telemetry
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
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

            {/* User Roles Management */}
            <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "14px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              User Role Management & Accounts
            </h3>
            <div className="card" style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                      <th style={{ padding: "12px 16px", color: "var(--text-tertiary)" }}>Email Address</th>
                      <th style={{ padding: "12px 16px", color: "var(--text-tertiary)" }}>Account Tier</th>
                      <th style={{ padding: "12px 16px", color: "var(--text-tertiary)", textAlign: "right" }}>Actions / Role Assignment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.email} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{user.email}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span className={user.role === "pro" ? "role-badge role-badge-pro" : "role-badge role-badge-free"} style={{ margin: 0 }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <select
                            value={user.role}
                            className="form-select"
                            style={{ width: "130px", display: "inline-block", height: "30px", fontSize: "12px", padding: "0 8px" }}
                            onChange={(e) => handleChangeRole(user.email, e.target.value as "free" | "pro")}
                          >
                            <option value="free">FREE User</option>
                            <option value="pro">PRO Premium</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "config" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>
              Configure Role-Based Service Limits
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
              
              {/* Anonymous Role limits */}
              <div className="card" style={{ padding: "16px", background: "var(--bg-input)", border: "1px solid var(--border-subtle)" }}>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-blue)", textTransform: "uppercase", marginBottom: "14px" }}>
                  1. Anonymous / Guest Limits
                </h4>
                
                <div className="form-group">
                  <label className="form-label">Single QR Limit (Lifetime)</label>
                  <select className="form-select" value={anonSingle} onChange={(e) => setAnonSingle(Number(e.target.value))}>
                    <option value={1}>1 Generation</option>
                    <option value={2}>2 Generations</option>
                    <option value={3}>3 Generations (Default)</option>
                    <option value={5}>5 Generations</option>
                    <option value={10}>10 Generations</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Bulk QR Limit</label>
                  <select className="form-select" value={anonBulk} onChange={(e) => setAnonBulk(Number(e.target.value))}>
                    <option value={0}>Disabled (Default)</option>
                    <option value={2}>2 items</option>
                    <option value={5}>5 items</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Poster Art Limit (Daily)</label>
                  <select className="form-select" value={anonPoster} onChange={(e) => setAnonPoster(Number(e.target.value))}>
                    <option value={0}>Disabled (Default)</option>
                    <option value={1}>1 per day</option>
                    <option value={2}>2 per day</option>
                  </select>
                </div>
              </div>

              {/* Free Role limits */}
              <div className="card" style={{ padding: "16px", background: "var(--bg-input)", border: "1px solid var(--border-subtle)" }}>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "14px" }}>
                  2. Free Account Limits (Daily)
                </h4>
                
                <div className="form-group">
                  <label className="form-label">Single QR Limit</label>
                  <select className="form-select" value={freeSingle} onChange={(e) => setFreeSingle(Number(e.target.value))}>
                    <option value={5}>5 per day</option>
                    <option value={10}>10 per day (Default)</option>
                    <option value={20}>20 per day</option>
                    <option value={50}>50 per day</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Bulk QR Limit</label>
                  <select className="form-select" value={freeBulk} onChange={(e) => setFreeBulk(Number(e.target.value))}>
                    <option value={2}>2 items</option>
                    <option value={5}>5 items (Default)</option>
                    <option value={10}>10 items</option>
                    <option value={20}>20 items</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Poster Art Limit</label>
                  <select className="form-select" value={freePoster} onChange={(e) => setFreePoster(Number(e.target.value))}>
                    <option value={1}>1 per day</option>
                    <option value={2}>2 per day (Default)</option>
                    <option value={5}>5 per day</option>
                    <option value={10}>10 per day</option>
                  </select>
                </div>
              </div>

              {/* Pro Role limits */}
              <div className="card" style={{ padding: "16px", background: "var(--bg-input)", border: "1px solid var(--border-subtle)" }}>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent-amber)", textTransform: "uppercase", marginBottom: "14px" }}>
                  3. Pro Premium Limits (Daily)
                </h4>
                
                <div className="form-group">
                  <label className="form-label">Single QR Limit</label>
                  <select className="form-select" value={proSingle} onChange={(e) => setProSingle(Number(e.target.value))}>
                    <option value={50}>50 per day</option>
                    <option value={100}>100 per day (Default)</option>
                    <option value={500}>500 per day</option>
                    <option value={1000}>1000 per day</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Bulk QR Limit</label>
                  <select className="form-select" value={proBulk} onChange={(e) => setProBulk(Number(e.target.value))}>
                    <option value={50}>50 items</option>
                    <option value={100}>100 items (Default)</option>
                    <option value={200}>200 items</option>
                    <option value={500}>500 items</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Poster Art Limit</label>
                  <select className="form-select" value={proPoster} onChange={(e) => setProPoster(Number(e.target.value))}>
                    <option value={5}>5 per day</option>
                    <option value={10}>10 per day (Default)</option>
                    <option value={25}>25 per day</option>
                    <option value={50}>50 per day</option>
                  </select>
                </div>
              </div>

            </div>

            <button
              id="btn-save-admin-config"
              className="btn btn-primary"
              style={{ marginTop: "12px", width: "fit-content", padding: "12px 32px" }}
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
