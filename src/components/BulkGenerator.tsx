"use client";

import { useState, useRef, useCallback } from "react";
import QRCode from "qrcode";
import { QRHistoryEntry, QRSettings } from "@/types";
import { Toast } from "@/hooks/useToast";

interface BulkGeneratorProps {
  onGenerate: (entries: QRHistoryEntry[]) => void;
  showToast: (message: string, type?: Toast["type"]) => void;
}

const defaultSettings: QRSettings = {
  fgColor: "#000000",
  bgColor: "#ffffff",
  size: 300,
  level: "M",
  includeMargin: true,
  style: "squares",
};

interface BulkItem {
  id: string;
  content: string;
  dataUrl: string | null;
  status: "pending" | "done" | "error";
}

export default function BulkGenerator({ onGenerate, showToast }: BulkGeneratorProps) {
  const [rawInput, setRawInput] = useState("");
  const [settings, setSettings] = useState<QRSettings>(defaultSettings);
  const [items, setItems] = useState<BulkItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const parsedLines = rawInput.split("\n").map((l) => l.trim()).filter(Boolean);

  // Ensure offscreen canvas exists
  const getCanvas = () => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
    return offscreenCanvasRef.current;
  };

  const handleGenerate = useCallback(async () => {
    if (!parsedLines.length) {
      showToast("Add at least one URL or text per line.", "error");
      return;
    }
    if (parsedLines.length > 100) {
      showToast("Maximum 100 items per bulk batch.", "error");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setItems(parsedLines.map((c) => ({ id: Math.random().toString(36).slice(2), content: c, dataUrl: null, status: "pending" })));

    const canvas = getCanvas();
    const results: BulkItem[] = [];

    for (let i = 0; i < parsedLines.length; i++) {
      const content = parsedLines[i];
      try {
        await QRCode.toCanvas(canvas, content, {
          width: settings.size,
          margin: settings.includeMargin ? 4 : 1,
          color: { dark: settings.fgColor, light: settings.bgColor },
          errorCorrectionLevel: settings.level,
        });
        const dataUrl = canvas.toDataURL("image/png");
        results.push({ id: Math.random().toString(36).slice(2), content, dataUrl, status: "done" });
      } catch {
        results.push({ id: Math.random().toString(36).slice(2), content, dataUrl: null, status: "error" });
      }
      setProgress(Math.round(((i + 1) / parsedLines.length) * 100));
      setItems([...results]);
      // Yield to browser
      await new Promise((r) => setTimeout(r, 10));
    }

    setIsGenerating(false);
    const successCount = results.filter((r) => r.status === "done").length;
    showToast(`Generated ${successCount} / ${parsedLines.length} QR codes!`, "success");

    // Save to history
    const entries: QRHistoryEntry[] = results
      .filter((r) => r.status === "done" && r.dataUrl)
      .map((r) => ({
        id: r.id,
        type: "bulk" as const,
        content: r.content,
        dataUrl: r.dataUrl!,
        settings,
        createdAt: new Date(),
      }));
    onGenerate(entries);
  }, [parsedLines, settings, onGenerate, showToast]);

  const handleDownloadAll = async () => {
    const done = items.filter((i) => i.status === "done" && i.dataUrl);
    if (!done.length) return;

    // Download each PNG
    for (const item of done) {
      const a = document.createElement("a");
      a.href = item.dataUrl!;
      const safeName = item.content.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 30);
      a.download = `qr-${safeName}.png`;
      a.click();
      await new Promise((r) => setTimeout(r, 100));
    }
    showToast(`Downloaded ${done.length} QR codes!`, "success");
  };

  const updateSetting = <K extends keyof QRSettings>(key: K, value: QRSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fade-in">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        {/* Left: Input */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Bulk QR Generator</div>
              <div className="card-subtitle">One QR per line — up to 100 items</div>
            </div>
            {items.length > 0 && (
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                {items.filter((i) => i.status === "done").length}/{items.length} done
              </span>
            )}
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label" htmlFor="bulk-input">URLs / Texts (one per line)</label>
              <textarea
                id="bulk-input"
                className="form-textarea"
                rows={10}
                placeholder={`https://example.com/page-1\nhttps://example.com/page-2\nhttps://example.com/page-3\nProduct SKU-001\nProduct SKU-002`}
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}
              />
              <div className="form-hint">
                {parsedLines.length} item{parsedLines.length !== 1 ? "s" : ""} detected
                {parsedLines.length > 100 && (
                  <span style={{ color: "var(--accent-red)", marginLeft: 8 }}>⚠ Max 100</span>
                )}
              </div>
            </div>

            {/* Progress */}
            {isGenerating && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>Generating...</span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{progress}%</span>
                </div>
                <div className="progress-bar-wrapper">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                id="bulk-generate"
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={handleGenerate}
                disabled={isGenerating || !parsedLines.length || parsedLines.length > 100}
              >
                {isGenerating ? (
                  <><div className="spinner" /> Generating {progress}%</>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    Generate {parsedLines.length > 0 ? parsedLines.length : ""} QR Codes
                  </>
                )}
              </button>
              {items.some((i) => i.status === "done") && (
                <button
                  id="bulk-download-all"
                  className="btn btn-secondary btn-lg"
                  onClick={handleDownloadAll}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Settings */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Bulk Settings</div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label" htmlFor="bulk-fg">QR Color</label>
              <div className="color-picker-row">
                <input
                  type="color"
                  id="bulk-fg"
                  className="color-swatch-input"
                  value={settings.fgColor}
                  onChange={(e) => updateSetting("fgColor", e.target.value)}
                />
                <input
                  type="text"
                  className="form-input color-hex-input"
                  value={settings.fgColor}
                  onChange={(e) => {
                    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) updateSetting("fgColor", e.target.value);
                  }}
                  maxLength={7}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="bulk-bg">Background</label>
              <div className="color-picker-row">
                <input
                  type="color"
                  id="bulk-bg"
                  className="color-swatch-input"
                  value={settings.bgColor}
                  onChange={(e) => updateSetting("bgColor", e.target.value)}
                />
                <input
                  type="text"
                  className="form-input color-hex-input"
                  value={settings.bgColor}
                  onChange={(e) => {
                    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) updateSetting("bgColor", e.target.value);
                  }}
                  maxLength={7}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Size</label>
              <div className="slider-row">
                <input
                  type="range"
                  className="form-slider"
                  min={128}
                  max={512}
                  step={32}
                  value={settings.size}
                  onChange={(e) => updateSetting("size", Number(e.target.value))}
                />
                <span className="slider-value">{settings.size}px</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Error Correction</label>
              <select
                className="form-select"
                value={settings.level}
                onChange={(e) => updateSetting("level", e.target.value as QRSettings["level"])}
              >
                <option value="L">L — Low (7%)</option>
                <option value="M">M — Medium (15%)</option>
                <option value="Q">Q — Quartile (25%)</option>
                <option value="H">H — High (30%)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {items.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
              Generated QR Codes
              <span style={{ marginLeft: 10, fontSize: 12, color: "var(--text-tertiary)", fontWeight: 500 }}>
                {items.filter((i) => i.status === "done").length} of {items.length}
              </span>
            </h2>
          </div>
          <div className="bulk-result-grid">
            {items.map((item) => (
              <div key={item.id} className="bulk-result-item">
                {item.status === "done" && item.dataUrl ? (
                  <>
                    <img
                      src={item.dataUrl}
                      alt={item.content}
                      width={settings.size > 200 ? 120 : 80}
                      height={settings.size > 200 ? 120 : 80}
                      style={{ borderRadius: 4, border: "1px solid var(--border-subtle)" }}
                    />
                    <div className="bulk-item-label">{item.content.slice(0, 35)}{item.content.length > 35 ? "…" : ""}</div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = item.dataUrl!;
                        a.download = `qr-${item.content.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20)}.png`;
                        a.click();
                      }}
                    >
                      ↓ PNG
                    </button>
                  </>
                ) : item.status === "pending" ? (
                  <div className="spinner" />
                ) : (
                  <div style={{ color: "var(--accent-red)", fontSize: 12 }}>Error</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
