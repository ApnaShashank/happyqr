"use client";

import { QRHistoryEntry } from "@/types";
import { Toast } from "@/hooks/useToast";
import { ActiveTab } from "@/app/page";

interface HistoryPanelProps {
  history: QRHistoryEntry[];
  onClear: () => void;
  onRemove: (id: string) => void;
  showToast: (message: string, type?: Toast["type"]) => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export default function HistoryPanel({
  history,
  onClear,
  onRemove,
  showToast,
  setActiveTab,
}: HistoryPanelProps) {
  const handleDownload = (entry: QRHistoryEntry) => {
    if (!entry.dataUrl) return;
    const a = document.createElement("a");
    a.href = entry.dataUrl;
    const safeContent = entry.content.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
    a.download = `happyqr-${safeContent}-${Date.now()}.png`;
    a.click();
    showToast("Downloaded from history!", "success");
  };

  const handleCopy = async (entry: QRHistoryEntry) => {
    if (!entry.dataUrl) return;
    try {
      const res = await fetch(entry.dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast("Copied QR to clipboard!", "success");
    } catch {
      showToast("Failed to copy image.", "error");
    }
  };

  return (
    <div className="card fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div className="card-header">
        <div>
          <div className="card-title">Generation History</div>
          <div className="card-subtitle">Your recently created QR codes (stored locally)</div>
        </div>
        {history.length > 0 && (
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              onClear();
              showToast("History cleared!", "info");
            }}
          >
            Clear All
          </button>
        )}
      </div>
      <div className="card-body">
        {history.length === 0 ? (
          <div className="qr-empty-state" style={{ padding: "48px 24px" }}>
            <svg
              className="qr-empty-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: 48, height: 48 }}
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 8 12 12 14 14" />
            </svg>
            <p className="qr-empty-text" style={{ maxWidth: "260px" }}>
              No QR codes in your history yet. Start by generating one!
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 12 }}
              onClick={() => setActiveTab("generate")}
            >
              Create QR Now
            </button>
          </div>
        ) : (
          <div className="history-list">
            {history.map((entry) => (
              <div key={entry.id} className="history-item">
                <div className="history-qr-thumb">
                  {entry.dataUrl ? (
                    <img src={entry.dataUrl} alt="QR Thumbnail" />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "var(--border-subtle)",
                      }}
                    />
                  )}
                </div>

                <div className="history-meta">
                  <div className="history-text">
                    {entry.label ? `${entry.label} (${entry.content})` : entry.content}
                  </div>
                  <div className="history-time">
                    {new Date(entry.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · {new Date(entry.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    className={`history-type-badge ${
                      entry.type === "url"
                        ? "badge-url"
                        : entry.type === "bulk"
                        ? "badge-bulk"
                        : "badge-text"
                    }`}
                  >
                    {entry.type}
                  </span>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleCopy(entry)}
                    data-tooltip="Copy Image"
                    style={{ padding: "0 8px" }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDownload(entry)}
                    style={{ padding: "0 10px" }}
                  >
                    Download
                  </button>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      onRemove(entry.id);
                      showToast("Item removed.", "info");
                    }}
                    style={{ padding: "0 8px", color: "var(--accent-red)" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
