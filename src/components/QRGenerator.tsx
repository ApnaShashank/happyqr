"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import QRCode from "qrcode";
import { QRHistoryEntry, QRSettings } from "@/types";
import { Toast } from "@/hooks/useToast";

interface QRGeneratorProps {
  onGenerate: (entry: QRHistoryEntry) => void;
  showToast: (message: string, type?: Toast["type"]) => void;
  userEmail: string | null;
  onLoginClick: () => void;
}

interface CustomQRStyle {
  moduleType: "squares" | "dots" | "rounded";
  cornerOuter: "squares" | "rounded" | "circle";
  cornerInner: "squares" | "rounded" | "circle";
  logoFile: string | null;
  logoScale: number;
  logoPadding: number;
  logoBgColor: string;
  labelText: string;
  labelPosition: "top" | "bottom" | "left" | "right";
  labelFontSize: number;
  labelColor: string;
  labelFont: string;
  labelOrientation: "horizontal" | "vertical";
  
  // Premium features states
  fgStyle: "solid" | "gradient";
  gradientStart: string;
  gradientEnd: string;
  gradientType: "linear" | "radial";
  gradientDir: "horizontal" | "vertical" | "diagonal";
  isTransparent: boolean;
  bgImageOpacity: number;
  frameStyle: "none" | "banner-bottom" | "bubble" | "elegant-border";
  frameColor: string;
  marginSize: number;
  downloadSize: 256 | 512 | 1024 | 2048;
  errorCorrection: "L" | "M" | "Q" | "H";
}

const defaultStyles: CustomQRStyle = {
  moduleType: "squares",
  cornerOuter: "squares",
  cornerInner: "squares",
  logoFile: null,
  logoScale: 20,
  logoPadding: 6,
  logoBgColor: "#ffffff",
  labelText: "",
  labelPosition: "bottom",
  labelFontSize: 24,
  labelColor: "#000000",
  labelFont: "sans-serif",
  labelOrientation: "horizontal",
  
  fgStyle: "solid",
  gradientStart: "#7c3aed",
  gradientEnd: "#2563eb",
  gradientType: "linear",
  gradientDir: "horizontal",
  isTransparent: false,
  bgImageOpacity: 0.7,
  frameStyle: "none",
  frameColor: "#7c3aed",
  marginSize: 16,
  downloadSize: 512,
  errorCorrection: "H",
};

const defaultSettings: QRSettings = {
  fgColor: "#000000",
  bgColor: "#ffffff",
  size: 512,
  level: "H",
  includeMargin: true,
  style: "squares",
};

// Reusable Premium Custom Dropdown Component
interface DropdownOption {
  value: any;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface CustomDropdownProps {
  label: string;
  value: any;
  options: DropdownOption[];
  onChange: (val: any) => void;
  direction?: "down" | "up";
  align?: "left" | "right";
}

function CustomDropdown({ label, value, options, onChange, direction = "down", align = "left" }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];
  const menuStyle: React.CSSProperties = direction === "up"
    ? { bottom: "calc(100% + 6px)", top: "auto" }
    : { top: "calc(100% + 6px)", bottom: "auto" };

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <label className="form-label">{label}</label>
      <div className="custom-dropdown-wrapper">
        <button
          type="button"
          className={`custom-dropdown-trigger ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="custom-dropdown-trigger-content">
            {selectedOption.icon && <span className="custom-dropdown-icon">{selectedOption.icon}</span>}
            <span className="custom-dropdown-label">{selectedOption.label}</span>
          </span>
          <svg className="custom-dropdown-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {isOpen && (
          <div className={`custom-dropdown-menu ${align === "right" ? "align-right" : ""}`} style={menuStyle}>
            {options.map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                className={`custom-dropdown-item ${opt.value === value ? "selected" : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span className="custom-dropdown-item-content">
                  {opt.icon && <span className="custom-dropdown-icon">{opt.icon}</span>}
                  <span style={{ display: "flex", flexDirection: "column", gap: "2px", textAlign: "left" }}>
                    <span className="custom-dropdown-item-title">{opt.label}</span>
                    {opt.description && <span className="custom-dropdown-item-desc">{opt.description}</span>}
                  </span>
                </span>
                {opt.value === value && (
                  <svg className="custom-dropdown-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QRGenerator({ onGenerate, showToast, userEmail, onLoginClick }: QRGeneratorProps) {
  // Main encoded text state
  const [text, setText] = useState("https://happyqr.vercel.app");
  const [settings, setSettings] = useState<QRSettings>(defaultSettings);
  const [customStyle, setCustomStyle] = useState<CustomQRStyle>(defaultStyles);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fgHex, setFgHex] = useState("#000000");
  const [bgHex, setBgHex] = useState("#ffffff");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bgImagePreview, setBgImagePreview] = useState<string | null>(null);

  // Content formats inputs states
  const [contentType, setContentType] = useState<"url" | "text" | "email" | "phone" | "wifi" | "vcard" | "pdf" | "audio">("url");
  const [urlVal, setUrlVal] = useState("https://happyqr.vercel.app");
  const [textVal, setTextVal] = useState("Hello from HappyQR!");
  
  // Email states
  const [emailVal, setEmailVal] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  
  // Phone state
  const [phoneVal, setPhoneVal] = useState("");
  
  // WiFi states
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState("WPA");
  
  // vCard states
  const [vFirstName, setVFirstName] = useState("");
  const [vLastName, setVLastName] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vOrg, setVOrg] = useState("");
  const [vWebsite, setVWebsite] = useState("");
  
  // File variables
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfName, setPdfName] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioName, setAudioName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Accordion state
  const [openSection, setOpenSection] = useState<"content" | "shapes" | "colors" | "logo" | "frame" | null>("content");

  const toggleSection = (section: "content" | "shapes" | "colors" | "logo" | "frame") => {
    setOpenSection(openSection === section ? null : section);
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load limits from localStorage
  const getAnonGenCount = (): number => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem("happyqr_anon_generations") || "0");
  };

  const getAnonLimit = (): number => {
    if (typeof window === "undefined") return 1;
    return Number(localStorage.getItem("happyqr_limit_anon") || "1");
  };

  const incrementAnonGenCount = () => {
    localStorage.setItem("happyqr_anon_generations", String(getAnonGenCount() + 1));
  };

  const isLimitReached = !userEmail && getAnonGenCount() >= getAnonLimit();

  // Handle PDF/Audio Uploads using tmpfiles.org
  const handleCloudFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "pdf" | "audio") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "pdf" && file.type !== "application/pdf") {
      showToast("Please select a valid PDF file.", "error");
      return;
    }
    if (type === "audio" && !file.type.startsWith("audio/")) {
      showToast("Please select a valid audio file.", "error");
      return;
    }

    setIsUploading(true);
    showToast(`Uploading ${file.name} to cloud...`, "info");

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Free anonymous upload
      const res = await fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.data?.url) {
        // Direct download file link transformation
        const directUrl = json.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
        if (type === "pdf") {
          setPdfUrl(directUrl);
          setPdfName(file.name);
        } else {
          setAudioUrl(directUrl);
          setAudioName(file.name);
        }
        showToast("File uploaded and QR Code generated!", "success");
      } else {
        throw new Error(json.error || "Upload response error");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Upload failed. Try a smaller file size.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Compile inputs states into the main text string reactively
  useEffect(() => {
    if (contentType === "url") {
      setText(urlVal || "https://happyqr.vercel.app");
    } else if (contentType === "text") {
      setText(textVal || "HappyQR Code");
    } else if (contentType === "email") {
      if (emailVal) {
        setText(`mailto:${emailVal}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
      } else {
        setText("");
      }
    } else if (contentType === "phone") {
      setText(phoneVal ? `tel:${phoneVal}` : "");
    } else if (contentType === "wifi") {
      if (wifiSsid) {
        setText(`WIFI:T:${wifiSecurity};S:${wifiSsid};P:${wifiPassword};;`);
      } else {
        setText("");
      }
    } else if (contentType === "vcard") {
      if (vFirstName || vLastName) {
        const card = `BEGIN:VCARD\nVERSION:3.0\nN:${vLastName};${vFirstName};;;\nFN:${vFirstName} ${vLastName}\nORG:${vOrg}\nTEL;TYPE=CELL:${vPhone}\nEMAIL:${vEmail}\nURL:${vWebsite}\nEND:VCARD`;
        setText(card);
      } else {
        setText("");
      }
    } else if (contentType === "pdf") {
      setText(pdfUrl || "https://happyqr.vercel.app/mock-pdf");
    } else if (contentType === "audio") {
      setText(audioUrl || "https://happyqr.vercel.app/mock-audio");
    }
  }, [
    contentType,
    urlVal,
    textVal,
    emailVal,
    emailSubject,
    emailBody,
    phoneVal,
    wifiSsid,
    wifiPassword,
    wifiSecurity,
    vFirstName,
    vLastName,
    vPhone,
    vEmail,
    vOrg,
    vWebsite,
    pdfUrl,
    audioUrl
  ]);

  // Canvas Compositor Drawing Logic
  const generateStyledQR = useCallback(async () => {
    if (!text.trim()) {
      setQrDataUrl(null);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    try {
      const qr = QRCode.create(text, { errorCorrectionLevel: customStyle.errorCorrection });
      const { modules } = qr;
      const N = modules.size;

      const baseQRSize = customStyle.downloadSize;
      
      let extraTop = 0;
      let extraBottom = 0;
      let extraLeft = 0;
      let extraRight = 0;

      if (customStyle.frameStyle === "banner-bottom") {
        extraBottom = baseQRSize * 0.16;
      } else if (customStyle.frameStyle === "bubble") {
        extraTop = baseQRSize * 0.04;
        extraBottom = baseQRSize * 0.16;
        extraLeft = baseQRSize * 0.04;
        extraRight = baseQRSize * 0.04;
      } else if (customStyle.frameStyle === "elegant-border") {
        extraTop = baseQRSize * 0.06;
        extraBottom = baseQRSize * 0.12;
        extraLeft = baseQRSize * 0.06;
        extraRight = baseQRSize * 0.06;
      }

      let textSpacing = 0;
      if (customStyle.frameStyle === "none" && customStyle.labelText.trim()) {
        textSpacing = customStyle.labelFontSize * 2;
        if (customStyle.labelPosition === "top") extraTop = textSpacing;
        else if (customStyle.labelPosition === "bottom") extraBottom = textSpacing;
        else if (customStyle.labelPosition === "left") extraLeft = textSpacing;
        else if (customStyle.labelPosition === "right") extraRight = textSpacing;
      }

      const canvasW = baseQRSize + extraLeft + extraRight;
      const canvasH = baseQRSize + extraTop + extraBottom;

      canvas.width = canvasW;
      canvas.height = canvasH;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (customStyle.isTransparent) {
        ctx.clearRect(0, 0, canvasW, canvasH);
      } else {
        ctx.fillStyle = settings.bgColor;
        ctx.fillRect(0, 0, canvasW, canvasH);
      }

      if (bgImagePreview && !customStyle.isTransparent) {
        const bgImg = new Image();
        bgImg.src = bgImagePreview;
        await new Promise((resolve) => {
          bgImg.onload = resolve;
        });
        ctx.save();
        ctx.globalAlpha = customStyle.bgImageOpacity;
        ctx.drawImage(bgImg, extraLeft, extraTop, baseQRSize, baseQRSize);
        ctx.restore();
      }

      const qrOffsetX = extraLeft;
      const qrOffsetY = extraTop;
      const qrGridSize = baseQRSize - 2 * customStyle.marginSize;
      const cellSize = qrGridSize / N;
      const startX = qrOffsetX + customStyle.marginSize;
      const startY = qrOffsetY + customStyle.marginSize;

      let fgStyle: string | CanvasGradient = settings.fgColor;
      if (customStyle.fgStyle === "gradient") {
        if (customStyle.gradientType === "radial") {
          const cx = startX + qrGridSize / 2;
          const cy = startY + qrGridSize / 2;
          const r = qrGridSize / 2;
          const radialGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
          radialGrad.addColorStop(0, customStyle.gradientStart);
          radialGrad.addColorStop(1, customStyle.gradientEnd);
          fgStyle = radialGrad;
        } else {
          let x0 = startX;
          let y0 = startY;
          let x1 = startX + qrGridSize;
          let y1 = startY + qrGridSize;
          
          if (customStyle.gradientDir === "horizontal") {
            x0 = startX;
            y0 = startY + qrGridSize / 2;
            x1 = startX + qrGridSize;
            y1 = startY + qrGridSize / 2;
          } else if (customStyle.gradientDir === "vertical") {
            x0 = startX + qrGridSize / 2;
            y0 = startY;
            x1 = startX + qrGridSize / 2;
            y1 = startY + qrGridSize;
          }
          const linearGrad = ctx.createLinearGradient(x0, y0, x1, y1);
          linearGrad.addColorStop(0, customStyle.gradientStart);
          linearGrad.addColorStop(1, customStyle.gradientEnd);
          fgStyle = linearGrad;
        }
      }

      ctx.fillStyle = fgStyle;
      ctx.strokeStyle = fgStyle;

      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const isTopLeft = r < 7 && c < 7;
          const isTopRight = r < 7 && c >= N - 7;
          const isBottomLeft = r >= N - 7 && c < 7;
          if (isTopLeft || isTopRight || isBottomLeft) continue;

          if (logoPreview) {
            const centerStart = Math.floor(N / 2) - 3;
            const centerEnd = Math.floor(N / 2) + 3;
            if (r >= centerStart && r <= centerEnd && c >= centerStart && c <= centerEnd) {
              continue;
            }
          }

          if (modules.get(r, c)) {
            const x = startX + c * cellSize;
            const y = startY + r * cellSize;

            if (customStyle.moduleType === "squares") {
              ctx.fillRect(x, y, cellSize + 0.5, cellSize + 0.5);
            } else if (customStyle.moduleType === "dots") {
              ctx.beginPath();
              ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.4, 0, 2 * Math.PI);
              ctx.fill();
            } else if (customStyle.moduleType === "rounded") {
              drawRoundedRect(ctx, x, y, cellSize, cellSize, cellSize * 0.28);
            }
          }
        }
      }

      function drawRoundedRect(
        c: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        r: number
      ) {
        c.beginPath();
        c.moveTo(x + r, y);
        c.lineTo(x + w - r, y);
        c.quadraticCurveTo(x + w, y, x + w, y + r);
        c.lineTo(x + w, y + h - r);
        c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        c.lineTo(x + r, y + h);
        c.quadraticCurveTo(x, y + h, x, y + h - r);
        c.lineTo(x, y + r);
        c.quadraticCurveTo(x, y, x + r, y);
        c.closePath();
        c.fill();
      }

      const finders = [
        { r: 0, c: 0 },
        { r: 0, c: N - 7 },
        { r: N - 7, c: 0 },
      ];

      finders.forEach((f) => {
        const x = startX + f.c * cellSize;
        const y = startY + f.r * cellSize;
        const size = 7 * cellSize;

        ctx.lineWidth = cellSize;
        ctx.strokeStyle = fgStyle;

        if (customStyle.cornerOuter === "squares") {
          ctx.strokeRect(x + cellSize / 2, y + cellSize / 2, size - cellSize, size - cellSize);
        } else if (customStyle.cornerOuter === "rounded") {
          ctx.beginPath();
          const r = cellSize * 1.5;
          ctx.roundRect(x + cellSize / 2, y + cellSize / 2, size - cellSize, size - cellSize, r);
          ctx.stroke();
        } else if (customStyle.cornerOuter === "circle") {
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, size / 2 - cellSize / 2, 0, 2 * Math.PI);
          ctx.stroke();
        }

        ctx.fillStyle = fgStyle;
        const dotOffset = 2 * cellSize;
        const dotSize = 3 * cellSize;

        if (customStyle.cornerInner === "squares") {
          ctx.fillRect(x + dotOffset, y + dotOffset, dotSize, dotSize);
        } else if (customStyle.cornerInner === "rounded") {
          ctx.beginPath();
          ctx.roundRect(x + dotOffset, y + dotOffset, dotSize, dotSize, cellSize * 0.75);
          ctx.fill();
        } else if (customStyle.cornerInner === "circle") {
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, dotSize / 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      if (logoPreview) {
        const logoImg = new Image();
        logoImg.src = logoPreview;
        await new Promise((resolve) => {
          logoImg.onload = resolve;
        });

        const logoWidth = (baseQRSize * customStyle.logoScale) / 100;
        const logoHeight = (logoWidth * logoImg.height) / logoImg.width;
        const logoX = startX + qrGridSize / 2 - logoWidth / 2;
        const logoY = startY + qrGridSize / 2 - logoHeight / 2;

        ctx.fillStyle = customStyle.logoBgColor;
        const pad = customStyle.logoPadding;
        ctx.beginPath();
        ctx.roundRect(logoX - pad, logoY - pad, logoWidth + pad * 2, logoHeight + pad * 2, 8);
        ctx.fill();

        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
      }

      if (customStyle.frameStyle !== "none" && customStyle.labelText.trim()) {
        ctx.fillStyle = customStyle.frameColor;

        if (customStyle.frameStyle === "banner-bottom") {
          ctx.beginPath();
          ctx.roundRect(0, baseQRSize, baseQRSize, extraBottom, [0, 0, 16, 16]);
          ctx.fill();

          ctx.fillStyle = customStyle.labelColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, baseQRSize / 2, baseQRSize + extraBottom / 2);
        } else if (customStyle.frameStyle === "bubble") {
          ctx.beginPath();
          ctx.roundRect(4, 4, canvasW - 8, canvasH - 24, 24);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(canvasW / 2 + 12, canvasH - 24);
          ctx.lineTo(canvasW / 2 - 12, canvasH - 24);
          ctx.lineTo(canvasW / 2, canvasH - 4);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = customStyle.labelColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, baseQRSize + extraTop + extraBottom / 2);
        } else if (customStyle.frameStyle === "elegant-border") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 14;
          ctx.strokeRect(7, 7, canvasW - 14, canvasH - 14);

          ctx.beginPath();
          ctx.fillRect(7, canvasH - extraBottom - 7, canvasW - 14, extraBottom);

          ctx.fillStyle = customStyle.labelColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 - 7);
        }
      }

      if (customStyle.frameStyle === "none" && customStyle.labelText.trim()) {
        ctx.fillStyle = customStyle.labelColor;
        ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        let textX = canvasW / 2;
        let textY = canvasH / 2;

        if (customStyle.labelPosition === "top") {
          textY = textSpacing / 2;
        } else if (customStyle.labelPosition === "bottom") {
          textY = canvasH - textSpacing / 2;
        } else if (customStyle.labelPosition === "left") {
          textX = textSpacing / 2;
        } else if (customStyle.labelPosition === "right") {
          textX = canvasW - textSpacing / 2;
        }

        if (customStyle.labelOrientation === "vertical") {
          ctx.save();
          ctx.translate(textX, textY);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(customStyle.labelText, 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(customStyle.labelText, textX, textY);
        }
      }

      setQrDataUrl(canvas.toDataURL("image/png"));
    } catch (err) {
      console.error(err);
      showToast("Design drawing failed", "error");
    } finally {
      setIsGenerating(false);
    }
  }, [text, settings, customStyle, logoPreview, bgImagePreview, showToast]);

  // Debounced rendering hook
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      generateStyledQR();
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, settings, customStyle, logoPreview, bgImagePreview, generateStyledQR]);

  // File uploading handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result as string);
      showToast("Logo uploaded!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    showToast("Logo removed.", "info");
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid background image.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setBgImagePreview(event.target?.result as string);
      showToast("Background image uploaded!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBgImage = () => {
    setBgImagePreview(null);
    if (bgImageInputRef.current) bgImageInputRef.current.value = "";
    showToast("Background image removed.", "info");
  };

  const handleFgChange = (val: string) => {
    setFgHex(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setSettings((p) => ({ ...p, fgColor: val }));
  };

  const handleBgChange = (val: string) => {
    setBgHex(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setSettings((p) => ({ ...p, bgColor: val }));
  };

  const handleDownloadPNG = () => {
    if (isLimitReached) {
      showToast("Anon limit reached. Please Login to generate unlimited QR codes.", "error");
      onLoginClick();
      return;
    }

    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `happyqr-${Date.now()}.png`;
    a.click();
    showToast("PNG downloaded!", "success");

    if (!userEmail) incrementAnonGenCount();
    saveToHistory();
  };

  const handleDownloadSVG = async () => {
    if (isLimitReached) {
      showToast("Anon limit reached. Please Login to generate unlimited QR codes.", "error");
      onLoginClick();
      return;
    }

    if (!text.trim()) return;
    try {
      const svgStr = await QRCode.toString(text, {
        type: "svg",
        width: customStyle.downloadSize,
        margin: Math.round(customStyle.marginSize / 10),
        color: { dark: settings.fgColor, light: customStyle.isTransparent ? "#00000000" : settings.bgColor },
        errorCorrectionLevel: customStyle.errorCorrection,
      });
      const blob = new Blob([svgStr], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `happyqr-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("SVG downloaded!", "success");

      if (!userEmail) incrementAnonGenCount();
      saveToHistory("svg", svgStr);
    } catch {
      showToast("SVG export failed.", "error");
    }
  };

  const handleCopyPNG = async () => {
    if (isLimitReached) {
      showToast("Anon limit reached. Please Login to copy QR image.", "error");
      onLoginClick();
      return;
    }

    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast("QR image copied to clipboard!", "success");
    } catch {
      showToast("Copy failed — use download instead.", "error");
    }
  };

  const saveToHistory = (format?: string, svgString?: string) => {
    if (!text.trim() || !qrDataUrl) return;
    const entry: QRHistoryEntry = {
      id: Math.random().toString(36).slice(2),
      type: text.startsWith("http") ? "url" : "text",
      content: text,
      dataUrl: qrDataUrl,
      svgString,
      settings,
      createdAt: new Date(),
    };
    onGenerate(entry);
  };

  // Pre-drawn Option Icons
  const icons = {
    square: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="0.5" />
        <rect x="14" y="3" width="7" height="7" rx="0.5" />
        <rect x="3" y="14" width="7" height="7" rx="0.5" />
        <rect x="14" y="14" width="7" height="7" rx="0.5" />
      </svg>
    ),
    dot: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6.5" cy="6.5" r="3.5" />
        <circle cx="17.5" cy="6.5" r="3.5" />
        <circle cx="6.5" cy="17.5" r="3.5" />
        <circle cx="17.5" cy="17.5" r="3.5" />
      </svg>
    ),
    rounded: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="2.5" />
        <rect x="14" y="3" width="7" height="7" rx="2.5" />
        <rect x="3" y="14" width="7" height="7" rx="2.5" />
        <rect x="14" y="14" width="7" height="7" rx="2.5" />
      </svg>
    ),
    outlineSquare: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="4" y="4" width="16" height="16" rx="1" />
      </svg>
    ),
    outlineRounded: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="4" y="4" width="16" height="16" rx="5" />
      </svg>
    ),
    outlineCircle: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
    arrowUp: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 19V5M12 5l-6 6M12 5l6 6" />
      </svg>
    ),
    arrowDown: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 5v14M12 19l-6-6M12 19l6-6" />
      </svg>
    ),
    arrowLeft: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M19 12H5M5 12l6-6M5 12l6 6" />
      </svg>
    ),
    arrowRight: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 12h14M19 12l-6-6M19 12l6 6" />
      </svg>
    ),
    gradient: (
      <svg width="14" height="14" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="grad-icon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="4" fill="url(#grad-icon)" />
      </svg>
    ),
    solid: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <rect width="24" height="24" rx="4" />
      </svg>
    ),
  };

  return (
    <div className="generator-grid fade-in">
      {/* Left controls panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        
        {/* Limitation Notification if reached */}
        {isLimitReached && (
          <div
            style={{
              background: "var(--accent-red)",
              color: "#ffffff",
              padding: "12px 18px",
              borderRadius: "var(--radius-md)",
              fontSize: "12px",
              fontWeight: 600,
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <span>⚠ Anonymous limit reached. Sign in for unlimited QR codes!</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={onLoginClick}
              style={{ height: "26px", fontSize: "11px", padding: "0 10px" }}
            >
              Sign In
            </button>
          </div>
        )}

        {/* Accordion Section 1: Content Input */}
        <div className="collapsible-section">
          <button
            className={`collapsible-trigger ${openSection === "content" ? "expanded" : ""}`}
            onClick={() => toggleSection("content")}
          >
            <span>1. Content Input Formats</span>
            <svg className="collapsible-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {openSection === "content" && (
            <div className="collapsible-content" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              {/* Content Formats Selector Grid */}
              <div>
                <label className="form-label">Select QR Format Type</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                  {[
                    { id: "url", label: "🔗 Link" },
                    { id: "text", label: "💬 Text" },
                    { id: "email", label: "📧 Email" },
                    { id: "phone", label: "📞 Phone" },
                    { id: "wifi", label: "📶 WiFi" },
                    { id: "vcard", label: "👤 Contact" },
                    { id: "pdf", label: "📄 PDF File" },
                    { id: "audio", label: "🎵 Audio" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`preset-chip ${contentType === item.id ? "active" : ""}`}
                      onClick={() => setContentType(item.id as any)}
                      style={{ justifyContent: "center", fontSize: "11px", padding: "6px 4px" }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
                {/* 1. URL LINK */}
                {contentType === "url" && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="url-input">Website URL Link</label>
                    <input
                      id="url-input"
                      type="url"
                      className="form-input"
                      value={urlVal}
                      onChange={(e) => setUrlVal(e.target.value)}
                      placeholder="e.g. https://happyqr.vercel.app"
                    />
                  </div>
                )}

                {/* 2. TEXT */}
                {contentType === "text" && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="text-input">Plain Text Message</label>
                    <textarea
                      id="text-input"
                      className="form-textarea"
                      value={textVal}
                      onChange={(e) => setTextVal(e.target.value)}
                      placeholder="Type your message text here..."
                    />
                  </div>
                )}

                {/* 3. EMAIL */}
                {contentType === "email" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="email-address">Recipient Email</label>
                      <input
                        id="email-address"
                        type="email"
                        className="form-input"
                        placeholder="recipient@example.com"
                        value={emailVal}
                        onChange={(e) => setEmailVal(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="email-subject">Subject</label>
                      <input
                        id="email-subject"
                        type="text"
                        className="form-input"
                        placeholder="Subject title"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="email-body">Message Body</label>
                      <textarea
                        id="email-body"
                        className="form-textarea"
                        placeholder="Write your email body message here..."
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* 4. PHONE */}
                {contentType === "phone" && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="phone-number">Phone Number</label>
                    <input
                      id="phone-number"
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +91 9999999999"
                      value={phoneVal}
                      onChange={(e) => setPhoneVal(e.target.value)}
                    />
                  </div>
                )}

                {/* 5. WIFI */}
                {contentType === "wifi" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="wifi-ssid">Network SSID (Name)</label>
                      <input
                        id="wifi-ssid"
                        type="text"
                        className="form-input"
                        placeholder="SSID Name"
                        value={wifiSsid}
                        onChange={(e) => setWifiSsid(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="wifi-password">Password</label>
                      <input
                        id="wifi-password"
                        type="password"
                        className="form-input"
                        placeholder="Security Password"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                      />
                    </div>
                    <CustomDropdown
                      label="Security Type"
                      value={wifiSecurity}
                      onChange={(val) => setWifiSecurity(val)}
                      options={[
                        { value: "WPA", label: "WPA/WPA2" },
                        { value: "WEP", label: "WEP Security" },
                        { value: "nopass", label: "Open Network (No Password)" },
                      ]}
                    />
                  </div>
                )}

                {/* 6. VCARD CONTACT */}
                {contentType === "vcard" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="first-name">First Name</label>
                        <input
                          id="first-name"
                          type="text"
                          className="form-input"
                          value={vFirstName}
                          onChange={(e) => setVFirstName(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="last-name">Last Name</label>
                        <input
                          id="last-name"
                          type="text"
                          className="form-input"
                          value={vLastName}
                          onChange={(e) => setVLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="contact-phone">Phone</label>
                        <input
                          id="contact-phone"
                          type="tel"
                          className="form-input"
                          value={vPhone}
                          onChange={(e) => setVPhone(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="contact-email">Email</label>
                        <input
                          id="contact-email"
                          type="email"
                          className="form-input"
                          value={vEmail}
                          onChange={(e) => setVEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="contact-org">Organization</label>
                        <input
                          id="contact-org"
                          type="text"
                          className="form-input"
                          value={vOrg}
                          onChange={(e) => setVOrg(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" htmlFor="contact-web">Website</label>
                        <input
                          id="contact-web"
                          type="url"
                          className="form-input"
                          value={vWebsite}
                          onChange={(e) => setVWebsite(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 7. PDF FILE UPLOAD */}
                {contentType === "pdf" && (
                  <div>
                    <label className="form-label" htmlFor="pdf-file-upload">Upload PDF Document</label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input
                        id="pdf-file-upload"
                        ref={pdfInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handleCloudFileUpload(e, "pdf")}
                        style={{ display: "none" }}
                      />
                      <button
                        className="btn btn-secondary"
                        onClick={() => pdfInputRef.current?.click()}
                        style={{ flex: 1 }}
                        disabled={isUploading}
                      >
                        {isUploading ? <div className="spinner" /> : "Choose PDF File"}
                      </button>
                    </div>
                    {pdfUrl && (
                      <div style={{ marginTop: 12, fontSize: 12, color: "var(--accent-green)", fontWeight: 600 }}>
                        ✔ Active: {pdfName || "Document uploaded successfully"}
                      </div>
                    )}
                  </div>
                )}

                {/* 8. AUDIO FILE UPLOAD */}
                {contentType === "audio" && (
                  <div>
                    <label className="form-label" htmlFor="audio-file-upload">Upload Audio Track</label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input
                        id="audio-file-upload"
                        ref={audioInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={(e) => handleCloudFileUpload(e, "audio")}
                        style={{ display: "none" }}
                      />
                      <button
                        className="btn btn-secondary"
                        onClick={() => audioInputRef.current?.click()}
                        style={{ flex: 1 }}
                        disabled={isUploading}
                      >
                        {isUploading ? <div className="spinner" /> : "Choose Audio File"}
                      </button>
                    </div>
                    {audioUrl && (
                      <div style={{ marginTop: 12, fontSize: 12, color: "var(--accent-green)", fontWeight: 600 }}>
                        ✔ Active: {audioName || "Audio track uploaded successfully"}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Accordion Section 2: Patterns & Shapes */}
        <div className="collapsible-section">
          <button
            className={`collapsible-trigger ${openSection === "shapes" ? "expanded" : ""}`}
            onClick={() => toggleSection("shapes")}
          >
            <span>2. Pattern & Shapes</span>
            <svg className="collapsible-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {openSection === "shapes" && (
            <div className="collapsible-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Module Type Custom Dropdown */}
              <CustomDropdown
                label="QR Module Type"
                value={customStyle.moduleType}
                onChange={(val) => setCustomStyle((p) => ({ ...p, moduleType: val }))}
                options={[
                  { value: "squares", label: "Classic Squares", icon: icons.square, description: "Standard blocky pixel matrices, best for high scannability." },
                  { value: "dots", label: "Modern Dots", icon: icons.dot, description: "Sleek circular dot pixels, offers a highly unique and clean design." },
                  { value: "rounded", label: "Rounded Pixels", icon: icons.rounded, description: "Smooth rounded modules, creates a soft and organic tech layout." },
                ]}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* Outer Corner Frame */}
                <CustomDropdown
                  label="Outer Frame Shape"
                  value={customStyle.cornerOuter}
                  onChange={(val) => setCustomStyle((p) => ({ ...p, cornerOuter: val }))}
                  direction="up"
                  options={[
                    { value: "squares", label: "Sharp Squares", icon: icons.outlineSquare, description: "Classic finder patterns with standard hard right-angled borders." },
                    { value: "rounded", label: "Rounded Rect", icon: icons.outlineRounded, description: "Modern soft-cornered frames, balances structure with smooth lines." },
                    { value: "circle", label: "Circular Ring", icon: icons.outlineCircle, description: "Trendy ring-shaped corner finders, gives a premium creative look." },
                  ]}
                />

                {/* Inner Corner Dot */}
                <CustomDropdown
                  label="Inner Dot Shape"
                  value={customStyle.cornerInner}
                  onChange={(val) => setCustomStyle((p) => ({ ...p, cornerInner: val }))}
                  direction="up"
                  align="right"
                  options={[
                    { value: "squares", label: "Sharp Square Dot", icon: icons.square, description: "Standard solid square block in the center of the corner finders." },
                    { value: "rounded", label: "Rounded Center Dot", icon: icons.rounded, description: "Smooth solid rounded block, aligns with curved module styles." },
                    { value: "circle", label: "Circular Center Dot", icon: icons.dot, description: "Solid round sphere center, ideal for circular outer frames." },
                  ]}
                />
              </div>
            </div>
          )}
        </div>

        {/* Accordion Section 3: Colors & Transparency */}
        <div className="collapsible-section">
          <button
            className={`collapsible-trigger ${openSection === "colors" ? "expanded" : ""}`}
            onClick={() => toggleSection("colors")}
          >
            <span>3. Colors & Transparency</span>
            <svg className="collapsible-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {openSection === "colors" && (
            <div className="collapsible-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Foreground Coloring Style */}
              <CustomDropdown
                label="QR Foreground Fill Style"
                value={customStyle.fgStyle}
                onChange={(val) => setCustomStyle((p) => ({ ...p, fgStyle: val }))}
                options={[
                  { value: "solid", label: "Solid Fill Color", icon: icons.solid, description: "Applies a single custom solid flat shade across the entire QR matrix." },
                  { value: "gradient", label: "Linear & Radial Gradient", icon: icons.gradient, description: "Blends two custom colors dynamically for an artistic, modern effect." },
                ]}
              />

              {customStyle.fgStyle === "solid" ? (
                /* Solid Color Input */
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="fg-color">QR Color</label>
                  <div className="color-picker-row">
                    <input
                      type="color"
                      id="fg-color"
                      className="color-swatch-input"
                      value={settings.fgColor}
                      onChange={(e) => { setSettings((p) => ({ ...p, fgColor: e.target.value })); setFgHex(e.target.value); }}
                    />
                    <input
                      type="text"
                      className="form-input color-hex-input"
                      value={fgHex}
                      onChange={(e) => handleFgChange(e.target.value)}
                      maxLength={7}
                    />
                  </div>
                </div>
              ) : (
                /* Gradient Color Inputs */
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Gradient Start</label>
                      <div className="color-picker-row">
                        <input
                          type="color"
                          className="color-swatch-input"
                          value={customStyle.gradientStart}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, gradientStart: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="form-input color-hex-input"
                          value={customStyle.gradientStart}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, gradientStart: e.target.value }))}
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Gradient End</label>
                      <div className="color-picker-row">
                        <input
                          type="color"
                          className="color-swatch-input"
                          value={customStyle.gradientEnd}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, gradientEnd: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="form-input color-hex-input"
                          value={customStyle.gradientEnd}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, gradientEnd: e.target.value }))}
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <CustomDropdown
                      label="Gradient Type"
                      value={customStyle.gradientType}
                      onChange={(val) => setCustomStyle((p) => ({ ...p, gradientType: val }))}
                      direction="up"
                      options={[
                        { value: "linear", label: "Linear Gradient Flow", description: "Colors transition along a straight path (horizontal, vertical, diagonal)." },
                        { value: "radial", label: "Radial Gradient Glow", description: "Colors blend in a circular fashion radiating outward from the center." },
                      ]}
                    />

                    {customStyle.gradientType === "linear" && (
                      <CustomDropdown
                        label="Gradient Direction"
                        value={customStyle.gradientDir}
                        onChange={(val) => setCustomStyle((p) => ({ ...p, gradientDir: val }))}
                        direction="up"
                        align="right"
                        options={[
                          { value: "horizontal", label: "Horizontal Flow", icon: icons.arrowRight, description: "Gradient transitions smoothly from left to right." },
                          { value: "vertical", label: "Vertical Flow", icon: icons.arrowDown, description: "Gradient transitions smoothly from top to bottom." },
                          { value: "diagonal", label: "Diagonal Flow", icon: icons.arrowRight, description: "Gradient slides across the canvas from top-left to bottom-right." },
                        ]}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Background Color & Transparent Toggles */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span className="form-label" style={{ marginBottom: 0 }}>Transparent Background</span>
                  <label className="switch-toggle-label" style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 8 }}>
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={customStyle.isTransparent}
                      onChange={(e) => setCustomStyle((p) => ({ ...p, isTransparent: e.target.checked }))}
                    />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>Enable Alpha</span>
                  </label>
                </div>

                {!customStyle.isTransparent && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="bg-color">Background Color</label>
                    <div className="color-picker-row">
                      <input
                        type="color"
                        id="bg-color"
                        className="color-swatch-input"
                        value={settings.bgColor}
                        onChange={(e) => { setSettings((p) => ({ ...p, bgColor: e.target.value })); setBgHex(e.target.value); }}
                      />
                      <input
                        type="text"
                        className="form-input color-hex-input"
                        value={bgHex}
                        onChange={(e) => handleBgChange(e.target.value)}
                        maxLength={7}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Accordion Section 4: Logo & Background Image */}
        <div className="collapsible-section">
          <button
            className={`collapsible-trigger ${openSection === "logo" ? "expanded" : ""}`}
            onClick={() => toggleSection("logo")}
          >
            <span>4. Logo & Background Images</span>
            <svg className="collapsible-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {openSection === "logo" && (
            <div className="collapsible-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Logo upload control */}
              <div>
                <label className="form-label" htmlFor="logo-upload">Center Branding Icon</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    id="logo-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ flex: 1 }}
                  >
                    Choose Logo Icon
                  </button>
                  {logoPreview && (
                    <button className="btn btn-danger" onClick={handleRemoveLogo}>
                      Remove
                    </button>
                  )}
                </div>

                {logoPreview && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Logo Scale Size ({customStyle.logoScale}%)</label>
                      <div className="slider-row">
                        <input
                          type="range"
                          className="form-slider"
                          min={10}
                          max={26}
                          step={1}
                          value={customStyle.logoScale}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, logoScale: Number(e.target.value) }))}
                        />
                        <span className="slider-value">{customStyle.logoScale}%</span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Logo Margin Spacing ({customStyle.logoPadding}px)</label>
                      <div className="slider-row">
                        <input
                          type="range"
                          className="form-slider"
                          min={0}
                          max={16}
                          step={1}
                          value={customStyle.logoPadding}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, logoPadding: Number(e.target.value) }))}
                        />
                        <span className="slider-value">{customStyle.logoPadding}px</span>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="logo-bg-color">Logo Backing Cover Color</label>
                      <div className="color-picker-row">
                        <input
                          type="color"
                          id="logo-bg-color"
                          className="color-swatch-input"
                          value={customStyle.logoBgColor}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, logoBgColor: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="form-input color-hex-input"
                          value={customStyle.logoBgColor}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, logoBgColor: e.target.value }))}
                          maxLength={7}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Background Image Upload */}
              {!customStyle.isTransparent && (
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
                  <label className="form-label" htmlFor="bg-image-upload">QR Matrix Background Image</label>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <input
                      id="bg-image-upload"
                      ref={bgImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleBgImageUpload}
                      style={{ display: "none" }}
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={() => bgImageInputRef.current?.click()}
                      style={{ flex: 1 }}
                    >
                      Choose Wallpaper Photo
                    </button>
                    {bgImagePreview && (
                      <button className="btn btn-danger" onClick={handleRemoveBgImage}>
                        Remove
                      </button>
                    )}
                  </div>

                  {bgImagePreview && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Wallpaper Opacity ({Math.round(customStyle.bgImageOpacity * 100)}%)</label>
                        <div className="slider-row">
                          <input
                            type="range"
                            className="form-slider"
                            min={0.1}
                            max={1.0}
                            step={0.05}
                            value={customStyle.bgImageOpacity}
                            onChange={(e) => setCustomStyle((p) => ({ ...p, bgImageOpacity: Number(e.target.value) }))}
                          />
                          <span className="slider-value">{Math.round(customStyle.bgImageOpacity * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Accordion Section 5: Frames, Labels & Margins */}
        <div className="collapsible-section">
          <button
            className={`collapsible-trigger ${openSection === "frame" ? "expanded" : ""}`}
            onClick={() => toggleSection("frame")}
          >
            <span>5. Frames, Labels & Layout</span>
            <svg className="collapsible-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {openSection === "frame" && (
            <div className="collapsible-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Custom Frame Dropdown */}
              <CustomDropdown
                label="Custom Frame Layout"
                value={customStyle.frameStyle}
                onChange={(val) => setCustomStyle((p) => ({ ...p, frameStyle: val }))}
                options={[
                  { value: "none", label: "No Frame Layout", description: "Clean raw QR code matrix, suitable for minimalist designs." },
                  { value: "banner-bottom", label: "Bottom Text Banner", description: "Encloses the QR code with a colored call-to-action bar at the bottom." },
                  { value: "bubble", label: "Creative Speech Bubble", description: "Wraps the QR code in an interactive message bubble with a bottom pointer." },
                  { value: "elegant-border", label: "Elegant Frame Outline", description: "Surrounds the canvas with a thick border outline and a bottom label bar." },
                ]}
              />

              {/* Quiet Zone/Margin Slider */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Quiet Zone Margin ({customStyle.marginSize}px)</label>
                <div className="slider-row">
                  <input
                    type="range"
                    className="form-slider"
                    min={0}
                    max={48}
                    step={2}
                    value={customStyle.marginSize}
                    onChange={(e) => setCustomStyle((p) => ({ ...p, marginSize: Number(e.target.value) }))}
                  />
                  <span className="slider-value">{customStyle.marginSize}px</span>
                </div>
              </div>

              {/* Frame Color picker if custom frame active */}
              {customStyle.frameStyle !== "none" && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Frame/Bubble Color</label>
                  <div className="color-picker-row">
                    <input
                      type="color"
                      className="color-swatch-input"
                      value={customStyle.frameColor}
                      onChange={(e) => setCustomStyle((p) => ({ ...p, frameColor: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="form-input color-hex-input"
                      value={customStyle.frameColor}
                      onChange={(e) => setCustomStyle((p) => ({ ...p, frameColor: e.target.value }))}
                      maxLength={7}
                    />
                  </div>
                </div>
              )}

              {/* Text Label configuration */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label className="form-label" htmlFor="label-text-input">CTA Label Text</label>
                  <input
                    id="label-text-input"
                    type="text"
                    className="form-input"
                    value={customStyle.labelText}
                    onChange={(e) => setCustomStyle((p) => ({ ...p, labelText: e.target.value }))}
                    placeholder="e.g. SCAN TO DOWNLOAD / PAY HERE"
                  />
                </div>

                {customStyle.labelText.trim() && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    
                    {/* Font & Color selection */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <CustomDropdown
                        label="Label Text Font"
                        value={customStyle.labelFont}
                        onChange={(val) => setCustomStyle((p) => ({ ...p, labelFont: val }))}
                        options={[
                          { value: "sans-serif", label: "Sans-Serif Geometric", description: "Clean, modern typography without serifs, ideal for tech brands." },
                          { value: "serif", label: "Classic Serif Type", description: "Traditional editorial typeface with decorative strokes, looks elegant." },
                          { value: "monospace", label: "Technical Monospace", description: "Fixed-width terminal fonts, excellent for coding and developer aesthetics." },
                        ]}
                      />
                      <CustomDropdown
                        label="Label Font Size"
                        value={customStyle.labelFontSize}
                        onChange={(val) => setCustomStyle((p) => ({ ...p, labelFontSize: val }))}
                        direction="up"
                        align="right"
                        options={[
                          { value: 16, label: "Small Font (16px)", description: "Discreet and compact lettering, keeps the layout subtle." },
                          { value: 20, label: "Compact Font (20px)", description: "Balanced text sizing, fits short CTA prompts perfectly." },
                          { value: 24, label: "Standard Font (24px)", description: "Standard lettering, readable from average scanning distances." },
                          { value: 28, label: "Medium Font (28px)", description: "Prominent text sizing, stands out clearly around the QR." },
                          { value: 32, label: "Large Font (32px)", description: "Bold and oversized lettering, emphasizes call-to-actions strongly." },
                        ]}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      {/* Hide positions if Custom Frame is wrapping the labels */}
                      {customStyle.frameStyle === "none" ? (
                        <>
                          <CustomDropdown
                            label="Text Placement Side"
                            value={customStyle.labelPosition}
                            onChange={(val) => setCustomStyle((p) => ({ ...p, labelPosition: val }))}
                            direction="up"
                            options={[
                              { value: "top", label: "Top Alignment", icon: icons.arrowUp, description: "Places the custom text prompt directly above the QR code matrix." },
                              { value: "bottom", label: "Bottom Alignment", icon: icons.arrowDown, description: "Places the custom text prompt directly below the QR code matrix." },
                              { value: "left", label: "Left Side Alignment", icon: icons.arrowLeft, description: "Places the custom text prompt vertically on the left side of the QR." },
                              { value: "right", label: "Right Side Alignment", icon: icons.arrowRight, description: "Places the custom text prompt vertically on the right side of the QR." },
                            ]}
                          />
                          <CustomDropdown
                            label="Label Text Direction"
                            value={customStyle.labelOrientation}
                            onChange={(val) => setCustomStyle((p) => ({ ...p, labelOrientation: val }))}
                            direction="up"
                            align="right"
                            options={[
                              { value: "horizontal", label: "Horizontal Text Layout", description: "Standard reading alignment, letters read left to right." },
                              { value: "vertical", label: "Vertical Text Layout", description: "Rotates the label text vertically, ideal for side-aligned prompts." },
                            ]}
                          />
                        </>
                      ) : null}
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Label Text Color</label>
                      <div className="color-picker-row">
                        <input
                          type="color"
                          className="color-swatch-input"
                          value={customStyle.labelColor}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, labelColor: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="form-input color-hex-input"
                          value={customStyle.labelColor}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, labelColor: e.target.value }))}
                          maxLength={7}
                        />
                      </div>
                    </div>

                  </div>
                )}
              </div>

              {/* Advanced settings row (EC level and resolution size) */}
              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <CustomDropdown
                  label="Download Quality Size"
                  value={customStyle.downloadSize}
                  onChange={(val) => setCustomStyle((p) => ({ ...p, downloadSize: val }))}
                  direction="up"
                  options={[
                    { value: 256, label: "Standard (256px)", description: "Compact image size, optimal for lightweight web layouts." },
                    { value: 512, label: "High Definition (512px)", description: "Sharp standard resolution, suitable for digital screens and cards." },
                    { value: 1024, label: "Ultra HD (1024px)", description: "Super high resolution, perfect for medium print sizes." },
                    { value: 2048, label: "Print Quality (2048px)", description: "Max-resolution layout, ideal for billboard posters and large prints." },
                  ]}
                />
                <CustomDropdown
                  label="Error Correction Level"
                  value={customStyle.errorCorrection}
                  onChange={(val) => setCustomStyle((p) => ({ ...p, errorCorrection: val }))}
                  direction="up"
                  align="right"
                  options={[
                    { value: "L", label: "Low Correction (7%)", description: "Fastest scanner response, best if the QR code is plain text." },
                    { value: "M", label: "Medium Correction (15%)", description: "Standard safety buffer, recommended for simple URL links." },
                    { value: "Q", label: "Quartile Correction (25%)", description: "High resilience, remains scannable even with minor scratches." },
                    { value: "H", label: "High Correction (30%)", description: "Maximum safety buffer, essential when overlaying center branding logos." },
                  ]}
                />
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Right side canvas display panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Premium Styled QR Studio</div>
              <div className="card-subtitle">Aspect ratio 1:1 preview canvas</div>
            </div>
          </div>
          <div className="card-body">
            <div className="qr-preview-container">
              {/* Preview Wrapper Container */}
              <div className={`qr-canvas-wrapper ${customStyle.isTransparent ? "checkerboard-bg" : ""}`}>
                {isGenerating && (
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                    <div className="spinner" />
                  </div>
                )}
                <canvas
                  ref={canvasRef}
                  style={{
                    display: qrDataUrl ? "block" : "none",
                    borderRadius: "var(--radius-sm)",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>

              {/* Action buttons */}
              <div className="qr-actions">
                <button
                  id="btn-qr-dl-png"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={!qrDataUrl}
                  onClick={handleDownloadPNG}
                >
                  Download PNG
                </button>
                <button
                  id="btn-qr-dl-svg"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  disabled={!text.trim()}
                  onClick={handleDownloadSVG}
                >
                  Download SVG
                </button>
                <button
                  id="btn-qr-copy"
                  className="btn btn-ghost"
                  disabled={!qrDataUrl}
                  onClick={handleCopyPNG}
                  data-tooltip="Copy Image"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
