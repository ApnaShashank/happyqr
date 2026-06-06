"use client";

import { useState, useRef, useEffect } from "react";
import QRCode from "qrcode";
import { Toast } from "@/hooks/useToast";
import { Lock, AlertCircle } from "lucide-react";

interface PosterGeneratorProps {
  showToast: (message: string, type?: Toast["type"]) => void;
  userEmail: string | null;
  onLoginClick: () => void;
}

interface TemplatePreset {
  id: string;
  name: string;
  prompt: string;
  borderHex: string;
  qrFill: string;
  qrBack: string;
  panelBack: string;
  textHex: string;
  fallbackColors: [string, string];
  scanMe: string;
}

const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: "minimalist",
    name: "Modern Minimalist",
    prompt: "Ultra clean minimalist line art background, soft beige and warm cream color palette, elegant abstract geometric shapes, organic forms, high resolution, 4K quality, gallery design aesthetic",
    borderHex: "#4a3b32",
    qrFill: "#2a1e17",
    qrBack: "#faf6f0",
    panelBack: "#faf6f0",
    textHex: "#4a3b32",
    fallbackColors: ["#faf6f0", "#ebdcd0"],
    scanMe: "DISCOVER LINK",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Grid",
    prompt: "High-tech cyberpunk interface background, digital grids, hologram elements, dark obsidian surface with glowing pink and cyan details, high resolution, 4K quality, futuristic aesthetic",
    borderHex: "#ec4899",
    qrFill: "#ec4899",
    qrBack: "#09090b",
    panelBack: "#09090b",
    textHex: "#ec4899",
    fallbackColors: ["#09090b", "#1e1b4b"],
    scanMe: "SCAN INTERFACE",
  },
  {
    id: "botanical",
    name: "Botanical Spa",
    prompt: "Soothing wellness botanical background, soft sage green, eucalyptus leaves, organic textures, calm spa aesthetic, high resolution, 4K quality, elegant leaf outline illustration",
    borderHex: "#2d4a36",
    qrFill: "#1b2e21",
    qrBack: "#f4f7f5",
    panelBack: "#f4f7f5",
    textHex: "#2d4a36",
    fallbackColors: ["#f4f7f5", "#d1e2d3"],
    scanMe: "VISIT WELLNESS",
  },
  {
    id: "retrowave",
    name: "Retrowave Sunset",
    prompt: "80s outrun retrowave grid sunset landscape, synthwave wireframe grids, neon magenta sun against purple sky, high resolution, 4K quality, nostalgic vector line art",
    borderHex: "#a855f7",
    qrFill: "#a855f7",
    qrBack: "#120524",
    panelBack: "#120524",
    textHex: "#f472b6",
    fallbackColors: ["#120524", "#3b0764"],
    scanMe: "SCAN THE BEAT",
  },
  {
    id: "abstract",
    name: "Abstract Art",
    prompt: "Premium organic abstract brushstrokes, terracotta, mustard yellow and carbon grey shapes, canvas texture background, high resolution, 4K quality, contemporary artistic illustration",
    borderHex: "#b45309",
    qrFill: "#78350f",
    qrBack: "#fefaf6",
    panelBack: "#fefaf6",
    textHex: "#78350f",
    fallbackColors: ["#fefaf6", "#fed7aa"],
    scanMe: "EXPLORE ART",
  },
  {
    id: "vintage",
    name: "Vintage Chic",
    prompt: "Warm sepia vintage journal paper background, retro border framing, classy aged texture, elegant calligraphy backdrop, high resolution, 4K quality, nostalgic aesthetic",
    borderHex: "#78350f",
    qrFill: "#451a03",
    qrBack: "#fcf8f2",
    panelBack: "#fcf8f2",
    textHex: "#451a03",
    fallbackColors: ["#fcf8f2", "#f5e6d3"],
    scanMe: "CONNECT RETRO",
  },
];

export default function PosterGenerator({ showToast, userEmail, onLoginClick }: PosterGeneratorProps) {
  const [url, setUrl] = useState("https://happyqr.com");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePreset>(TEMPLATE_PRESETS[0]);
  const [prompt, setPrompt] = useState(TEMPLATE_PRESETS[0].prompt);
  const [title, setTitle] = useState(TEMPLATE_PRESETS[0].name);
  const [scanMeText, setScanMeText] = useState(TEMPLATE_PRESETS[0].scanMe);
  const [generating, setGenerating] = useState(false);
  const [bgImageSrc, setBgImageSrc] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Daily poster limit state (defaults to 2 per day)
  const [dailyCount, setDailyCount] = useState(0);

  const todayStr = new Date().toISOString().split("T")[0];
  const storageKey = userEmail ? `happyqr_poster_count_${userEmail}_${todayStr}` : "";

  const getPosterLimit = (): number => {
    if (typeof window === "undefined") return 2;
    return Number(localStorage.getItem("happyqr_limit_poster") || "2");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && storageKey) {
      setDailyCount(Number(localStorage.getItem(storageKey) || "0"));
    }
  }, [storageKey]);

  const incrementDailyCount = () => {
    if (storageKey) {
      const nextCount = dailyCount + 1;
      localStorage.setItem(storageKey, String(nextCount));
      setDailyCount(nextCount);
    }
  };

  const isLimitReached = dailyCount >= getPosterLimit();

  // When selected template changes, update inputs
  const selectTemplate = (tpl: TemplatePreset) => {
    setSelectedTemplate(tpl);
    setPrompt(tpl.prompt);
    setTitle(tpl.name);
    setScanMeText(tpl.scanMe);
    setBgImageSrc(null); // Clear previous AI background
  };

  // Generate background using API
  const handleGenerateAIBackground = async () => {
    if (isLimitReached) {
      showToast("Daily Poster Art limit reached (max 2 per day). Come back tomorrow!", "error");
      return;
    }

    setGenerating(true);
    showToast("Generating background image via AI. Please wait...", "info");
    try {
      const res = await fetch("/api/generate-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.image) {
        setBgImageSrc(data.image);
        incrementDailyCount();
        showToast("AI background generated successfully!", "success");
      } else {
        throw new Error(data.error || "AI background generation failed");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "AI API failed, rendering gradient fallback...", "error");
      setBgImageSrc(null); // Will draw gradient
    } finally {
      setGenerating(false);
    }
  };

  // Redraw poster on inputs change
  useEffect(() => {
    const drawPoster = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // HD resolution setup (3:4 aspect ratio)
      const width = 1200;
      const height = 1600;
      canvas.width = width;
      canvas.height = height;

      // 1. Draw top background art panel (68% height)
      const splitY = Math.floor(height * 0.68);
      const artHeight = splitY;

      if (bgImageSrc) {
        // AI image background
        try {
          const img = new Image();
          img.src = bgImageSrc;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          ctx.drawImage(img, 0, 0, width, artHeight);
        } catch {
          drawGradientFallback(ctx, width, artHeight, selectedTemplate.fallbackColors);
        }
      } else {
        // Fallback Gradient
        drawGradientFallback(ctx, width, artHeight, selectedTemplate.fallbackColors);
      }

      // 2. Draw bottom panel (32% height)
      const panelHeight = height - splitY;
      ctx.fillStyle = selectedTemplate.panelBack;
      ctx.fillRect(0, splitY, width, panelHeight);

      // Panel top border line
      ctx.fillStyle = selectedTemplate.borderHex;
      ctx.fillRect(0, splitY, width, 5);

      // 3. Category/Title text
      ctx.fillStyle = selectedTemplate.textHex;
      ctx.textAlign = "center";
      ctx.font = "bold 44px sans-serif";
      const titleY = splitY + 70;
      ctx.fillText(title.toUpperCase(), width / 2, titleY);

      // Decorative line under title
      ctx.strokeStyle = selectedTemplate.borderHex;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width / 4, titleY + 20);
      ctx.lineTo((3 * width) / 4, titleY + 20);
      ctx.stroke();

      // 4. Generate QR code onto an offscreen canvas
      const qrSize = 320;
      const qrX = (width - qrSize) / 2;
      const qrY = titleY + 50;

      try {
        const offscreenCanvas = document.createElement("canvas");
        await QRCode.toCanvas(offscreenCanvas, url, {
          width: qrSize,
          margin: 2,
          color: {
            dark: selectedTemplate.qrFill,
            light: selectedTemplate.qrBack,
          },
          errorCorrectionLevel: "H",
        });

        // Draw QR code image onto main poster canvas
        ctx.drawImage(offscreenCanvas, qrX, qrY, qrSize, qrSize);
      } catch (e) {
        console.error("QR Draw Error:", e);
      }

      // 5. Scan Me text
      ctx.fillStyle = selectedTemplate.borderHex;
      ctx.font = "bold 30px sans-serif";
      ctx.fillText(`▼  ${scanMeText.toUpperCase()}  ▼`, width / 2, qrY + qrSize + 50);

      // 6. Draw elegant double borders around poster edge
      ctx.strokeStyle = selectedTemplate.borderHex;
      ctx.lineWidth = 6;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      ctx.lineWidth = 2;
      ctx.strokeRect(32, 32, width - 64, height - 64);
    };

    // Only draw if logged in
    if (userEmail) {
      drawPoster();
    }
  }, [url, selectedTemplate, title, scanMeText, bgImageSrc, userEmail]);

  const drawGradientFallback = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    colors: [string, string]
  ) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const handleDownloadPoster = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `happyqr-poster-${selectedTemplate.id}-${Date.now()}.png`;
    link.click();
    showToast("Premium Poster downloaded!", "success");
  };

  // Block screen if not logged in
  if (!userEmail) {
    return (
      <div className="fade-in" style={{ maxWidth: "600px", margin: "64px auto", textAlign: "center" }}>
        <div className="card">
          <div className="card-body" style={{ padding: "48px 32px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", color: "var(--accent-blue)" }}>
              <Lock size={56} />
            </div>
            <h2 className="modal-title" style={{ fontSize: "22px", marginBottom: "8px" }}>
              Sign In Required
            </h2>
            <p className="modal-desc" style={{ maxWidth: "420px", margin: "0 auto 28px" }}>
              Poster Art template generation requires a registered account. Sign in now to get 2 high-res poster generations per day!
            </p>
            <button className="btn btn-primary btn-lg" onClick={onLoginClick}>
              Sign In to HappyQR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="generator-grid fade-in">
      {/* Left Column: Form Controls */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">QR Art Templates</div>
            <div className="card-subtitle">Generate beautiful QR poster templates with AI background art</div>
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: isLimitReached ? "var(--accent-red)" : "var(--accent-green)",
            }}
          >
            {getPosterLimit() - dailyCount} generations left today
          </span>
        </div>
        <div className="card-body">
          {isLimitReached && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                color: "var(--accent-red)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>Daily limit reached. You have generated {getPosterLimit()} AI backgrounds today. Come back tomorrow!</span>
              </div>
            </div>
          )}

          {/* URL/Content input */}
          <div className="form-group">
            <label className="form-label" htmlFor="poster-url">Target URL / Text</label>
            <input
              id="poster-url"
              type="text"
              className="form-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          {/* Template presets selection */}
          <div className="form-group">
            <label className="form-label">Select Template Theme</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
              {TEMPLATE_PRESETS.map((tpl) => (
                <button
                  key={tpl.id}
                  id={`tpl-${tpl.id}`}
                  className={`qr-style-option ${selectedTemplate.id === tpl.id ? "selected" : ""}`}
                  onClick={() => selectTemplate(tpl)}
                >
                  <div
                    className="qr-style-preview"
                    style={{
                      background: `linear-gradient(135deg, ${tpl.fallbackColors[0]}, ${tpl.fallbackColors[1]})`,
                      border: `2px solid ${tpl.borderHex}`,
                    }}
                  />
                  <span className="qr-style-label">{tpl.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom title */}
          <div className="form-group">
            <label className="form-label" htmlFor="poster-title">Poster Title Text</label>
            <input
              id="poster-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. LUXURY DESIGN"
            />
          </div>

          {/* Scan Me label */}
          <div className="form-group">
            <label className="form-label" htmlFor="poster-scan-text">Footer Text</label>
            <input
              id="poster-scan-text"
              type="text"
              className="form-input"
              value={scanMeText}
              onChange={(e) => setScanMeText(e.target.value)}
              placeholder="▼ SCAN ME ▼"
            />
          </div>

          {/* Prompt Editor for AI */}
          <div className="form-group">
            <label className="form-label" htmlFor="poster-prompt">AI Prompt for Background</label>
            <textarea
              id="poster-prompt"
              className="form-textarea"
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              id="btn-gen-ai"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleGenerateAIBackground}
              disabled={generating || isLimitReached}
            >
              {generating ? (
                <>
                  <div className="spinner" /> Generating AI Art...
                </>
              ) : (
                "Generate AI Background"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: High-Res Poster Preview */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Poster Art Preview</div>
              <div className="card-subtitle">Aspect ratio 3:4 (Ready for download)</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: "16px" }}>
            <div className="poster-preview-card">
              <canvas ref={canvasRef} className="poster-canvas" />
            </div>

            <button
              id="btn-download-poster"
              className="btn btn-secondary btn-full btn-lg"
              style={{ marginTop: "16px" }}
              onClick={handleDownloadPoster}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download High-Res Poster
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
