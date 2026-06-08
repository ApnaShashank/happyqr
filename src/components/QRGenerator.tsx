"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import QRCode from "qrcode";
import { QRHistoryEntry, QRSettings } from "@/types";
import { Toast } from "@/hooks/useToast";
import { 
  Link as LinkIcon, 
  FileText, 
  Mail, 
  Phone as PhoneIcon, 
  Wifi as WifiIcon, 
  User as UserIcon, 
  File as FileIcon, 
  Music,
  Settings,
  AlertCircle,
  CheckCircle2,
  Layers,
  Shapes,
  Palette,
  Image as ImageIcon,
  Frame,
  Copy,
  Download,
  Share2
} from "lucide-react";


interface SharedConfig {
  c: string; // content (text)
  ct: string; // contentType
  m: string; // moduleType
  co: string; // cornerOuter
  ci: string; // cornerInner
  fg: string; // fgColor
  bg: string; // bgColor
  fgs: string; // fgStyle
  gs: string; // gradientStart
  ge: string; // gradientEnd
  gt: string; // gradientType
  gd: string; // gradientDir
  fs: string; // frameStyle
  fc: string; // frameColor
  lt: string; // labelText
  lc: string; // labelColor
  bt: string; // qrBorderType
  bc: string; // qrBorderColor
  bs: number; // qrBorderSize
  br: number; // qrBorderRadius
}

interface QRGeneratorProps {
  onGenerate: (entry: QRHistoryEntry) => void;
  showToast: (message: string, type?: Toast["type"]) => void;
  userEmail: string | null;
  onLoginClick: () => void;
}

interface CustomQRStyle {
  moduleType: "squares" | "dots" | "rounded" | "diamonds" | "stars" | "lines" | "crosses" | "fluid" | "heart";
  cornerOuter: "squares" | "rounded" | "circle" | "leaf" | "shield" | "flower";
  cornerInner: "squares" | "rounded" | "circle" | "leaf" | "diamond";
  logoFile: string | null;
  logoScale: number;
  logoPadding: number;
  logoBgColor: string;
  logoRadius?: number;
  bgImageRadius?: number;
  labelText: string;
  labelPosition: "top" | "bottom" | "left" | "right";
  labelFontSize: number;
  labelColor: string;
  labelFont: string;
  labelOrientation: "horizontal" | "vertical";
  
  fgStyle: "solid" | "gradient";
  gradientStart: string;
  gradientEnd: string;
  gradientType: "linear" | "radial";
  gradientDir: "horizontal" | "vertical" | "diagonal";
  isTransparent: boolean;
  bgImageOpacity: number;
  frameStyle: "none" | "banner-bottom" | "banner-top" | "bubble-bottom" | "bubble-top" | "elegant-border" | "corners-only" | "phone-bezel" | "clipboard" | "shopping-bag" | "tag-pendant" | "circular-ring" | "dashed-border" | "double-border" | "book-cover" | "coffee-cup" | "envelope-mail" | "shield-badge" | "ticket-coupon" | "laptop-monitor" | "heart-love" | "star-sparkle" | "gift-box" | "neon-glow" | "gradient-burst" | "polaroid" | "ornamental" | "sunburst" | "circuit-board" | "floral-wreath" | "retro-tv" | "paint-splash" | "trophy";
  frameColor: string;
  marginSize: number;
  downloadSize: 256 | 512 | 1024 | 2048;
  errorCorrection: "L" | "M" | "Q" | "H";

  // QR Outer Border settings
  qrBorderType: "none" | "solid" | "dashed" | "dotted" | "double";
  qrBorderColor: string;
  qrBorderSize: number;
  qrBorderRadius: number;
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

const defaultStyles: CustomQRStyle = {
  moduleType: "squares",
  cornerOuter: "squares",
  cornerInner: "squares",
  logoFile: null,
  logoScale: 20,
  logoPadding: 6,
  logoBgColor: "#ffffff",
  logoRadius: 8,
  bgImageRadius: 0,
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

  qrBorderType: "none",
  qrBorderColor: "#7c3aed",
  qrBorderSize: 4,
  qrBorderRadius: 12,
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
  category?: string;
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

  // Group options while preserving contiguous category ordering
  const groups: { category?: string; items: DropdownOption[] }[] = [];
  options.forEach((opt) => {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.category === opt.category) {
      lastGroup.items.push(opt);
    } else {
      groups.push({ category: opt.category, items: [opt] });
    }
  });

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
            {groups.map((group, gIdx) => (
              <div key={group.category || `group-${gIdx}`} className="custom-dropdown-group" style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {group.category && (
                  <div className="custom-dropdown-group-header">
                    {group.category}
                  </div>
                )}
                {group.items.map((opt) => (
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

  // Logo backing shape
  const [logoShape, setLogoShape] = useState<"square" | "rounded" | "circle">("square");
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

  // Mobile floating preview state
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(true);
  const [previewScale, setPreviewScale] = useState<"sm" | "md" | "lg">("sm");
  const [previewWidth, setPreviewWidth] = useState(170);
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktopQualityOpen, setIsDesktopQualityOpen] = useState(false);
  const [isMobileQualityOpen, setIsMobileQualityOpen] = useState(false);
  const dragStartRef = useRef<{ x: number; width: number } | null>(null);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default touch scrolling when dragging to resize
    if (e.cancelable) e.preventDefault();
    setIsDragging(true);
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    dragStartRef.current = { x: clientX, width: previewWidth };
  }, [previewWidth]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!dragStartRef.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const deltaX = dragStartRef.current.x - clientX;
      const newWidth = Math.min(320, Math.max(130, dragStartRef.current.width + deltaX));
      setPreviewWidth(newWidth);
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  const PNG_SIZES = [256, 512, 1024, 2048] as const;
  const handleQualitySelect = useCallback((size: typeof PNG_SIZES[number], isMobile: boolean) => {
    setCustomStyle(prev => ({ ...prev, downloadSize: size }));
    if (isMobile) {
      setIsMobileQualityOpen(false);
    } else {
      setIsDesktopQualityOpen(false);
    }
    showToast(`Resolution set to ${size}x${size}px`, "success");
  }, [showToast]);

  const toggleSection = (section: "content" | "shapes" | "colors" | "logo" | "frame") => {
    setOpenSection(openSection === section ? null : section);
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mobile view detection for floating preview
  useEffect(() => {
    const check = () => setIsMobileView(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Load limits from localStorage
  const getUserRole = useCallback((): "anon" | "free" | "pro" => {
    if (!userEmail) return "anon";
    if (typeof window === "undefined") return "free";
    try {
      const rolesMap = JSON.parse(localStorage.getItem("happyqr_user_roles") || "{}");
      return rolesMap[userEmail] || "free";
    } catch {
      return "free";
    }
  }, [userEmail]);

  const getLimit = useCallback((role: "anon" | "free" | "pro", type: "single" | "bulk" | "poster"): number => {
    if (typeof window === "undefined") {
      if (role === "anon") return type === "single" ? 3 : 0;
      if (role === "free") return type === "single" ? 10 : type === "bulk" ? 5 : 2;
      return type === "single" ? 100 : type === "bulk" ? 100 : 10;
    }
    const key = `happyqr_limit_${type}_${role}`;
    const val = localStorage.getItem(key);
    if (val !== null) return Number(val);
    
    // Fallbacks
    if (role === "anon") {
      if (type === "single") {
        return Number(localStorage.getItem("happyqr_limit_anon") || "3");
      }
      return 0;
    }
    if (role === "free") {
      return type === "single" ? 10 : type === "bulk" ? 5 : 2;
    }
    return type === "single" ? 100 : type === "bulk" ? 100 : 10;
  }, []);

  const getDailyUsage = useCallback((type: "single" | "bulk" | "poster"): number => {
    if (!userEmail || typeof window === "undefined") return 0;
    try {
      const today = new Date().toISOString().split("T")[0];
      const usageObj = JSON.parse(localStorage.getItem("happyqr_daily_usage") || "{}");
      return usageObj[userEmail]?.[today]?.[type] || 0;
    } catch {
      return 0;
    }
  }, [userEmail]);

  const incrementDailyUsage = useCallback((type: "single" | "bulk" | "poster", amount: number = 1) => {
    if (!userEmail || typeof window === "undefined") return;
    try {
      const today = new Date().toISOString().split("T")[0];
      const usageObj = JSON.parse(localStorage.getItem("happyqr_daily_usage") || "{}");
      if (!usageObj[userEmail]) usageObj[userEmail] = {};
      if (!usageObj[userEmail][today]) usageObj[userEmail][today] = {};
      const current = usageObj[userEmail][today][type] || 0;
      usageObj[userEmail][today][type] = current + amount;
      localStorage.setItem("happyqr_daily_usage", JSON.stringify(usageObj));
    } catch (e) {
      console.error(e);
    }
  }, [userEmail]);

  const getAnonGenCount = (): number => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem("happyqr_anon_generations") || "0");
  };

  const incrementAnonGenCount = () => {
    localStorage.setItem("happyqr_anon_generations", String(getAnonGenCount() + 1));
  };

  const currentRole = getUserRole();
  const limitMax = getLimit(currentRole, "single");
  const currentGenCount = currentRole === "anon" ? getAnonGenCount() : getDailyUsage("single");
  const isLimitReached = currentGenCount >= limitMax;

  const getLimitToastMessage = (): string => {
    const role = getUserRole();
    if (role === "anon") {
      return "Anonymous limit reached. Please login to generate more QR codes.";
    }
    if (role === "free") {
      return `Daily limit reached for Free users (${getLimit("free", "single")} per day). Please upgrade to PRO.`;
    }
    return `Daily limit reached for PRO users (${getLimit("pro", "single")} per day).`;
  };

  const handleUpgradeToProDirectly = () => {
    if (!userEmail) return;
    try {
      const rolesMap = JSON.parse(localStorage.getItem("happyqr_user_roles") || "{}");
      rolesMap[userEmail] = "pro";
      localStorage.setItem("happyqr_user_roles", JSON.stringify(rolesMap));
      showToast("Upgraded to PRO! Daily limits updated.", "success");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch {
      showToast("Upgrade failed.", "error");
    }
  };

  // Handle PDF/Audio Uploads using secure backend ImageKit api
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

      // Secure upload to ImageKit
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.url) {
        const directUrl = json.url;
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

  const getShareLink = () => {
    const configObj: Partial<SharedConfig> = {
      c: text,
      ct: contentType,
      m: customStyle.moduleType,
      co: customStyle.cornerOuter,
      ci: customStyle.cornerInner,
      fg: settings.fgColor,
      bg: settings.bgColor,
      fgs: customStyle.fgStyle,
      gs: customStyle.gradientStart,
      ge: customStyle.gradientEnd,
      gt: customStyle.gradientType,
      gd: customStyle.gradientDir,
      fs: customStyle.frameStyle,
      fc: customStyle.frameColor,
      lt: customStyle.labelText,
      lc: customStyle.labelColor,
      bt: customStyle.qrBorderType,
      bc: customStyle.qrBorderColor,
      bs: customStyle.qrBorderSize,
      br: customStyle.qrBorderRadius,
    };
    try {
      const jsonStr = JSON.stringify(configObj);
      const b64 = btoa(encodeURIComponent(jsonStr));
      return `${window.location.origin}${window.location.pathname}?qr=${b64}`;
    } catch (e) {
      return window.location.href;
    }
  };

  const handleShareQR = async () => {
    if (!qrDataUrl) return;
    const shareLink = getShareLink();
    const title = "My Custom QR Code | HappyQR";
    const shareText = "Create customized QR codes with logo, frames, shapes and colors at HappyQR!";
    
    if (navigator.share) {
      try {
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        const file = new File([blob], "happyqr.png", { type: "image/png" });
        
        const shareData: ShareData = {
          title,
          text: shareText,
          url: shareLink,
        };
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        }
        
        await navigator.share(shareData);
        showToast("Shared successfully!", "success");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          showToast("Sharing failed.", "error");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareLink);
        showToast("Share link copied to clipboard!", "success");
      } catch {
        showToast("Failed to copy share link.", "error");
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlParams = new URLSearchParams(window.location.search);
    const qrParam = urlParams.get("qr");
    if (qrParam) {
      try {
        const decoded = decodeURIComponent(atob(qrParam));
        const config: Partial<SharedConfig> = JSON.parse(decoded);
        
        if (config.c !== undefined) setText(config.c);
        if (config.ct !== undefined) setContentType(config.ct as any);
        
        // Update input field values based on type
        if (config.ct === "url") {
          setUrlVal(config.c || "");
        } else if (config.ct === "text") {
          setTextVal(config.c || "");
        } else if (config.ct === "phone") {
          const matched = config.c?.match(/^tel:(.*)$/);
          if (matched) setPhoneVal(matched[1]);
        } else if (config.ct === "email") {
          const matched = config.c?.match(/^mailto:([^?]*)(?:\?subject=([^&]*))?(?:&body=(.*))?$/);
          if (matched) {
            setEmailVal(matched[1] || "");
            setEmailSubject(matched[2] ? decodeURIComponent(matched[2]) : "");
            setEmailBody(matched[3] ? decodeURIComponent(matched[3]) : "");
          }
        } else if (config.ct === "wifi") {
          const matched = config.c?.match(/^WIFI:T:([^;]*);S:([^;]*);P:([^;]*);;$/);
          if (matched) {
            setWifiSecurity(matched[1] || "WPA");
            setWifiSsid(matched[2] || "");
            setWifiPassword(matched[3] || "");
          }
        } else if (config.ct === "vcard") {
          const lines = config.c?.split("\n") || [];
          lines.forEach(line => {
            if (line.startsWith("N:")) {
              const parts = line.substring(2).split(";");
              setVLastName(parts[0] || "");
              setVFirstName(parts[1] || "");
            } else if (line.startsWith("ORG:")) {
              setVOrg(line.substring(4));
            } else if (line.startsWith("TEL;TYPE=CELL:")) {
              setVPhone(line.substring(14));
            } else if (line.startsWith("EMAIL:")) {
              setVEmail(line.substring(6));
            } else if (line.startsWith("URL:")) {
              setVWebsite(line.substring(4));
            }
          });
        } else if (config.ct === "pdf") {
          setPdfUrl(config.c || "");
          setPdfName("Shared Document.pdf");
        } else if (config.ct === "audio") {
          setAudioUrl(config.c || "");
          setAudioName("Shared Audio.mp3");
        }
        
        // Update settings
        setSettings(prev => ({
          ...prev,
          fgColor: config.fg || prev.fgColor,
          bgColor: config.bg || prev.bgColor,
        }));
        
        if (config.fg) setFgHex(config.fg);
        if (config.bg) setBgHex(config.bg);
        
        // Update customStyle
        setCustomStyle(prev => ({
          ...prev,
          moduleType: (config.m || prev.moduleType) as any,
          cornerOuter: (config.co || prev.cornerOuter) as any,
          cornerInner: (config.ci || prev.cornerInner) as any,
          fgStyle: (config.fgs || prev.fgStyle) as any,
          gradientStart: config.gs || prev.gradientStart,
          gradientEnd: config.ge || prev.gradientEnd,
          gradientType: (config.gt || prev.gradientType) as any,
          gradientDir: (config.gd || prev.gradientDir) as any,
          frameStyle: (config.fs || prev.frameStyle) as any,
          frameColor: config.fc || prev.frameColor,
          labelText: config.lt || prev.labelText,
          labelColor: config.lc || prev.labelColor,
          qrBorderType: (config.bt || prev.qrBorderType) as any,
          qrBorderColor: config.bc || prev.qrBorderColor,
          qrBorderSize: config.bs !== undefined ? config.bs : prev.qrBorderSize,
          qrBorderRadius: config.br !== undefined ? config.br : prev.qrBorderRadius,
        }));
        
        showToast("Custom QR design loaded from link!", "success");
      } catch (e) {
        console.error("Failed to parse shared QR config:", e);
      }
    }
  }, []);

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
      } else if (customStyle.frameStyle === "banner-top") {
        extraTop = baseQRSize * 0.16;
      } else if (customStyle.frameStyle === "bubble-bottom") {
        extraTop = baseQRSize * 0.04;
        extraBottom = baseQRSize * 0.18;
        extraLeft = baseQRSize * 0.04;
        extraRight = baseQRSize * 0.04;
      } else if (customStyle.frameStyle === "bubble-top") {
        extraTop = baseQRSize * 0.18;
        extraBottom = baseQRSize * 0.04;
        extraLeft = baseQRSize * 0.04;
        extraRight = baseQRSize * 0.04;
      } else if (customStyle.frameStyle === "elegant-border" || customStyle.frameStyle === "corners-only" || customStyle.frameStyle === "dashed-border" || customStyle.frameStyle === "double-border") {
        extraTop = baseQRSize * 0.06;
        extraBottom = baseQRSize * 0.12;
        extraLeft = baseQRSize * 0.06;
        extraRight = baseQRSize * 0.06;
      } else if (customStyle.frameStyle === "phone-bezel") {
        extraTop = baseQRSize * 0.12;
        extraBottom = baseQRSize * 0.14;
        extraLeft = baseQRSize * 0.06;
        extraRight = baseQRSize * 0.06;
      } else if (customStyle.frameStyle === "clipboard") {
        extraTop = baseQRSize * 0.15;
        extraBottom = baseQRSize * 0.10;
        extraLeft = baseQRSize * 0.06;
        extraRight = baseQRSize * 0.06;
      } else if (customStyle.frameStyle === "shopping-bag") {
        extraTop = baseQRSize * 0.16;
        extraBottom = baseQRSize * 0.10;
        extraLeft = baseQRSize * 0.06;
        extraRight = baseQRSize * 0.06;
      } else if (customStyle.frameStyle === "tag-pendant") {
        extraTop = baseQRSize * 0.16;
        extraBottom = baseQRSize * 0.10;
        extraLeft = baseQRSize * 0.08;
        extraRight = baseQRSize * 0.08;
      } else if (customStyle.frameStyle === "circular-ring") {
        extraTop = baseQRSize * 0.10;
        extraBottom = baseQRSize * 0.16;
        extraLeft = baseQRSize * 0.10;
        extraRight = baseQRSize * 0.10;
      } else if (customStyle.frameStyle === "book-cover") {
        extraTop = baseQRSize * 0.06;
        extraBottom = baseQRSize * 0.12;
        extraLeft = baseQRSize * 0.14;
        extraRight = baseQRSize * 0.06;
      } else if (customStyle.frameStyle === "coffee-cup") {
        extraTop = baseQRSize * 0.08;
        extraBottom = baseQRSize * 0.10;
        extraLeft = baseQRSize * 0.06;
        extraRight = baseQRSize * 0.15;
      } else if (customStyle.frameStyle === "envelope-mail" || customStyle.frameStyle === "shield-badge" || customStyle.frameStyle === "ticket-coupon" || customStyle.frameStyle === "heart-love" || customStyle.frameStyle === "star-sparkle") {
        extraTop = baseQRSize * 0.08;
        extraBottom = baseQRSize * 0.12;
        extraLeft = baseQRSize * 0.08;
        extraRight = baseQRSize * 0.08;
      } else if (customStyle.frameStyle === "laptop-monitor") {
        extraTop = baseQRSize * 0.08;
        extraBottom = baseQRSize * 0.16;
        extraLeft = baseQRSize * 0.08;
        extraRight = baseQRSize * 0.08;
      } else if (customStyle.frameStyle === "gift-box") {
        extraTop = baseQRSize * 0.16;
        extraBottom = baseQRSize * 0.10;
        extraLeft = baseQRSize * 0.06;
        extraRight = baseQRSize * 0.06;
      } else if (customStyle.frameStyle === "neon-glow") {
        extraTop = baseQRSize * 0.06;
        extraBottom = baseQRSize * 0.14;
        extraLeft = baseQRSize * 0.06;
        extraRight = baseQRSize * 0.06;
      } else if (customStyle.frameStyle === "gradient-burst") {
        extraTop = baseQRSize * 0.08;
        extraBottom = baseQRSize * 0.14;
        extraLeft = baseQRSize * 0.08;
        extraRight = baseQRSize * 0.08;
      } else if (customStyle.frameStyle === "polaroid") {
        extraTop = baseQRSize * 0.06;
        extraBottom = baseQRSize * 0.22;
        extraLeft = baseQRSize * 0.06;
        extraRight = baseQRSize * 0.06;
      } else if (customStyle.frameStyle === "ornamental") {
        extraTop = baseQRSize * 0.12;
        extraBottom = baseQRSize * 0.14;
        extraLeft = baseQRSize * 0.12;
        extraRight = baseQRSize * 0.12;
      } else if (customStyle.frameStyle === "sunburst") {
        extraTop = baseQRSize * 0.12;
        extraBottom = baseQRSize * 0.16;
        extraLeft = baseQRSize * 0.12;
        extraRight = baseQRSize * 0.12;
      } else if (customStyle.frameStyle === "circuit-board") {
        extraTop = baseQRSize * 0.08;
        extraBottom = baseQRSize * 0.14;
        extraLeft = baseQRSize * 0.08;
        extraRight = baseQRSize * 0.08;
      } else if (customStyle.frameStyle === "floral-wreath") {
        extraTop = baseQRSize * 0.12;
        extraBottom = baseQRSize * 0.16;
        extraLeft = baseQRSize * 0.12;
        extraRight = baseQRSize * 0.12;
      } else if (customStyle.frameStyle === "retro-tv") {
        extraTop = baseQRSize * 0.12;
        extraBottom = baseQRSize * 0.18;
        extraLeft = baseQRSize * 0.10;
        extraRight = baseQRSize * 0.10;
      } else if (customStyle.frameStyle === "paint-splash") {
        extraTop = baseQRSize * 0.10;
        extraBottom = baseQRSize * 0.14;
        extraLeft = baseQRSize * 0.10;
        extraRight = baseQRSize * 0.10;
      } else if (customStyle.frameStyle === "trophy") {
        extraTop = baseQRSize * 0.16;
        extraBottom = baseQRSize * 0.14;
        extraLeft = baseQRSize * 0.08;
        extraRight = baseQRSize * 0.08;
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
        const bgRadius = customStyle.bgImageRadius ?? 0;
        if (bgRadius > 0) {
          ctx.beginPath();
          ctx.roundRect(extraLeft, extraTop, baseQRSize, baseQRSize, bgRadius);
          ctx.clip();
        }
        ctx.drawImage(bgImg, extraLeft, extraTop, baseQRSize, baseQRSize);
        ctx.restore();
      }

      // Draw Custom QR Border
      if (customStyle.qrBorderType && customStyle.qrBorderType !== "none") {
        ctx.save();
        ctx.strokeStyle = customStyle.qrBorderColor;
        ctx.lineWidth = customStyle.qrBorderSize;
        
        const strokeOffset = customStyle.qrBorderSize / 2;
        const bx = extraLeft + strokeOffset;
        const by = extraTop + strokeOffset;
        const bw = baseQRSize - customStyle.qrBorderSize;
        const bh = baseQRSize - customStyle.qrBorderSize;
        const br = customStyle.qrBorderRadius;

        if (customStyle.qrBorderType === "dashed") {
          ctx.setLineDash([customStyle.qrBorderSize * 3, customStyle.qrBorderSize * 1.5]);
        } else if (customStyle.qrBorderType === "dotted") {
          ctx.setLineDash([customStyle.qrBorderSize, customStyle.qrBorderSize]);
        } else if (customStyle.qrBorderType === "double") {
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, br);
          ctx.stroke();
          
          const innerOffset = Math.max(3, customStyle.qrBorderSize);
          ctx.lineWidth = Math.max(1, customStyle.qrBorderSize / 2.5);
          ctx.beginPath();
          ctx.roundRect(
            bx + innerOffset, 
            by + innerOffset, 
            bw - 2 * innerOffset, 
            bh - 2 * innerOffset, 
            Math.max(0, br - innerOffset)
          );
          ctx.stroke();
          ctx.restore();
        } else {
          // Solid
          ctx.beginPath();
          ctx.roundRect(bx, by, bw, bh, br);
          ctx.stroke();
          ctx.restore();
        }
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
            } else if (customStyle.moduleType === "diamonds") {
              ctx.beginPath();
              ctx.moveTo(x + cellSize / 2, y);
              ctx.lineTo(x + cellSize, y + cellSize / 2);
              ctx.lineTo(x + cellSize / 2, y + cellSize);
              ctx.lineTo(x, y + cellSize / 2);
              ctx.closePath();
              ctx.fill();
            } else if (customStyle.moduleType === "stars") {
              drawStar(ctx, x + cellSize / 2, y + cellSize / 2, 5, cellSize * 0.48, cellSize * 0.2);
            } else if (customStyle.moduleType === "lines") {
              ctx.fillRect(x + cellSize * 0.15, y, cellSize * 0.7, cellSize);
            } else if (customStyle.moduleType === "crosses") {
              ctx.fillRect(x + cellSize * 0.375, y, cellSize * 0.25, cellSize);
              ctx.fillRect(x, y + cellSize * 0.375, cellSize, cellSize * 0.25);
            } else if (customStyle.moduleType === "fluid") {
              ctx.beginPath();
              ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.58, 0, 2 * Math.PI);
              ctx.fill();
            } else if (customStyle.moduleType === "heart") {
              ctx.beginPath();
              const hx = x + cellSize / 2;
              const hy = y + cellSize * 0.15;
              const hW = cellSize * 0.8;
              const hH = cellSize * 0.85;
              ctx.moveTo(hx, hy + hH * 0.3);
              ctx.bezierCurveTo(hx - hW * 0.45, hy - hH * 0.15, hx - hW * 0.65, hy + hH * 0.45, hx, hy + hH);
              ctx.bezierCurveTo(hx + hW * 0.65, hy + hH * 0.45, hx + hW * 0.45, hy - hH * 0.15, hx, hy + hH * 0.3);
              ctx.closePath();
              ctx.fill();
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
        } else if (customStyle.cornerOuter === "leaf") {
          ctx.beginPath();
          const r = size - cellSize;
          ctx.roundRect(x + cellSize / 2, y + cellSize / 2, r, r, [cellSize * 2.5, 0, cellSize * 2.5, 0]);
          ctx.stroke();
        } else if (customStyle.cornerOuter === "shield") {
          const r = size - cellSize;
          const left = x + cellSize / 2;
          const top = y + cellSize / 2;
          const cx = left + r / 2;
          ctx.beginPath();
          ctx.moveTo(left, top);
          ctx.lineTo(left + r, top);
          ctx.lineTo(left + r, top + r * 0.5);
          ctx.quadraticCurveTo(left + r, top + r * 0.85, cx, top + r);
          ctx.quadraticCurveTo(left, top + r * 0.85, left, top + r * 0.5);
          ctx.closePath();
          ctx.stroke();
        } else if (customStyle.cornerOuter === "flower") {
          const r = size - cellSize;
          const left = x + cellSize / 2;
          const top = y + cellSize / 2;
          const cx = left + r / 2;
          const cy = top + r / 2;
          const outerR = r / 2;
          ctx.beginPath();
          for (let angle = 0; angle < 2 * Math.PI + 0.05; angle += 0.05) {
            const petalFactor = 0.15;
            const currentR = outerR * (1 - petalFactor + petalFactor * Math.cos(8 * angle));
            const px = cx + currentR * Math.cos(angle);
            const py = cy + currentR * Math.sin(angle);
            if (angle === 0) {
              ctx.moveTo(px, py);
            } else {
              ctx.lineTo(px, py);
            }
          }
          ctx.closePath();
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
        } else if (customStyle.cornerInner === "leaf") {
          ctx.beginPath();
          ctx.roundRect(x + dotOffset, y + dotOffset, dotSize, dotSize, [cellSize * 1.2, 0, cellSize * 1.2, 0]);
          ctx.fill();
        } else if (customStyle.cornerInner === "diamond") {
          ctx.beginPath();
          ctx.moveTo(x + size / 2, y + dotOffset);
          ctx.lineTo(x + dotOffset + dotSize, y + size / 2);
          ctx.lineTo(x + size / 2, y + dotOffset + dotSize);
          ctx.lineTo(x + dotOffset, y + size / 2);
          ctx.closePath();
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

        ctx.save();
        ctx.fillStyle = customStyle.logoBgColor;
        const pad = customStyle.logoPadding;
        const radius = customStyle.logoRadius ?? 8;
        
        ctx.beginPath();
        ctx.roundRect(logoX - pad, logoY - pad, logoWidth + pad * 2, logoHeight + pad * 2, radius);
        ctx.fill();

        // Clip the logo image concentric to the outer background
        ctx.beginPath();
        ctx.roundRect(logoX, logoY, logoWidth, logoHeight, Math.max(0, radius - pad));
        ctx.clip();
        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
        ctx.restore();
      }

      if (customStyle.frameStyle !== "none" && customStyle.labelText.trim()) {
        ctx.fillStyle = customStyle.frameColor;
        ctx.strokeStyle = customStyle.frameColor;

        if (customStyle.frameStyle === "banner-bottom") {
          ctx.beginPath();
          ctx.roundRect(0, baseQRSize, baseQRSize, extraBottom, [0, 0, 16, 16]);
          ctx.fill();

          ctx.fillStyle = customStyle.labelColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, baseQRSize / 2, baseQRSize + extraBottom / 2);
        } else if (customStyle.frameStyle === "banner-top") {
          ctx.beginPath();
          ctx.roundRect(0, 0, baseQRSize, extraTop, [16, 16, 0, 0]);
          ctx.fill();

          ctx.fillStyle = customStyle.labelColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, baseQRSize / 2, extraTop / 2);
        } else if (customStyle.frameStyle === "bubble-bottom") {
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
          ctx.fillText(customStyle.labelText, canvasW / 2, baseQRSize + extraTop + (extraBottom - 20) / 2);
        } else if (customStyle.frameStyle === "bubble-top") {
          ctx.beginPath();
          ctx.roundRect(4, 24, canvasW - 8, canvasH - 28, 24);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(canvasW / 2 + 12, 24);
          ctx.lineTo(canvasW / 2 - 12, 24);
          ctx.lineTo(canvasW / 2, 4);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = customStyle.labelColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, 24 + (extraTop - 24) / 2);
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
        } else if (customStyle.frameStyle === "corners-only") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 8;
          const len = 40;
          const pad = 12;
          
          ctx.beginPath();
          ctx.moveTo(pad, pad + len);
          ctx.lineTo(pad, pad);
          ctx.lineTo(pad + len, pad);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(canvasW - pad - len, pad);
          ctx.lineTo(canvasW - pad, pad);
          ctx.lineTo(canvasW - pad, pad + len);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(pad, canvasH - pad - len);
          ctx.lineTo(pad, canvasH - pad);
          ctx.lineTo(pad + len, canvasH - pad);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(canvasW - pad - len, canvasH - pad);
          ctx.lineTo(canvasW - pad, canvasH - pad);
          ctx.lineTo(canvasW - pad, canvasH - pad - len);
          ctx.stroke();

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2);
        } else if (customStyle.frameStyle === "phone-bezel") {
          ctx.lineWidth = 14;
          ctx.strokeStyle = customStyle.frameColor;
          ctx.beginPath();
          ctx.roundRect(8, 8, canvasW - 16, canvasH - 16, 28);
          ctx.stroke();

          ctx.fillStyle = customStyle.frameColor;
          ctx.beginPath();
          ctx.roundRect(canvasW / 2 - 40, 15, 80, 10, 5);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(canvasW / 2, canvasH - 25, 12, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom + 12);
        } else if (customStyle.frameStyle === "clipboard") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.roundRect(10, 25, canvasW - 20, canvasH - 35, 14);
          ctx.stroke();

          ctx.fillStyle = customStyle.frameColor;
          ctx.beginPath();
          ctx.roundRect(canvasW / 2 - 35, 5, 70, 25, 6);
          ctx.fill();
          
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(canvasW / 2, 12, 4, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 - 5);
        } else if (customStyle.frameStyle === "shopping-bag") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.roundRect(10, extraTop - 10, canvasW - 20, canvasH - extraTop, 12);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(canvasW / 2, extraTop - 10, 35, Math.PI, 0);
          ctx.stroke();

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 - 5);
        } else if (customStyle.frameStyle === "tag-pendant") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 8;
          
          const pad = 12;
          const topH = extraTop - 10;
          ctx.beginPath();
          ctx.moveTo(canvasW / 2, pad);
          ctx.lineTo(canvasW - pad, topH);
          ctx.lineTo(canvasW - pad, canvasH - pad);
          ctx.lineTo(pad, canvasH - pad);
          ctx.lineTo(pad, topH);
          ctx.closePath();
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(canvasW / 2, topH - 20, 8, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 - 5);
        } else if (customStyle.frameStyle === "circular-ring") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.arc(canvasW / 2, canvasH / 2 - 15, Math.min(canvasW, canvasH) / 2 - 15, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(canvasW / 2, canvasH / 2 - 15, Math.min(canvasW, canvasH) / 2 - 25, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 - 10);
        } else if (customStyle.frameStyle === "dashed-border") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 8;
          ctx.setLineDash([16, 8]);
          ctx.strokeRect(10, 10, canvasW - 20, canvasH - 20);
          ctx.setLineDash([]);

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 - 5);
        } else if (customStyle.frameStyle === "double-border") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 6;
          ctx.strokeRect(10, 10, canvasW - 20, canvasH - 20);
          ctx.lineWidth = 2;
          ctx.strokeRect(18, 18, canvasW - 36, canvasH - 36);

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 - 5);
        } else if (customStyle.frameStyle === "book-cover") {
          ctx.fillStyle = customStyle.frameColor;
          ctx.fillRect(5, 5, extraLeft - 10, canvasH - 10);

          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 6;
          ctx.strokeRect(extraLeft - 5, 5, canvasW - extraLeft, canvasH - 10);

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, (canvasW + extraLeft) / 2 - 5, canvasH - extraBottom / 2 - 5);
        } else if (customStyle.frameStyle === "coffee-cup") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.roundRect(10, 10, canvasW - extraRight + 10, canvasH - 20, [4, 4, 30, 30]);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(canvasW - extraRight + 20, canvasH / 2, 30, -Math.PI / 2, Math.PI / 2);
          ctx.stroke();

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, (canvasW - extraRight) / 2 + 10, canvasH - extraBottom / 2 - 5);
        } else if (customStyle.frameStyle === "envelope-mail") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 8;
          ctx.strokeRect(10, 10, canvasW - 20, canvasH - 20);

          ctx.beginPath();
          ctx.moveTo(10, 10);
          ctx.lineTo(canvasW / 2, canvasH / 2 - 10);
          ctx.lineTo(canvasW - 10, 10);
          ctx.stroke();

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 - 5);
        } else if (customStyle.frameStyle === "shield-badge") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 8;
          const r = canvasW - 20;
          const left = 10;
          const top = 10;
          ctx.beginPath();
          ctx.moveTo(left, top + r * 0.2);
          ctx.quadraticCurveTo(left + r / 2, top, left + r, top + r * 0.2);
          ctx.lineTo(left + r, top + r * 0.7);
          ctx.quadraticCurveTo(left + r, canvasH - 10, left + r / 2, canvasH - 10);
          ctx.quadraticCurveTo(left, canvasH - 10, left, top + r * 0.7);
          ctx.closePath();
          ctx.stroke();

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 - 5);
        } else if (customStyle.frameStyle === "ticket-coupon") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 8;
          
          const pad = 12;
          const notchY = canvasH / 2;
          const notchR = 16;
          
          ctx.beginPath();
          ctx.moveTo(pad, pad);
          ctx.lineTo(canvasW - pad, pad);
          ctx.lineTo(canvasW - pad, notchY - notchR);
          ctx.arc(canvasW - pad, notchY, notchR, -Math.PI / 2, Math.PI / 2, true);
          ctx.lineTo(canvasW - pad, canvasH - pad);
          ctx.lineTo(pad, canvasH - pad);
          ctx.lineTo(pad, notchY + notchR);
          ctx.arc(pad, notchY, notchR, Math.PI / 2, -Math.PI / 2, true);
          ctx.closePath();
          ctx.stroke();

          ctx.save();
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(pad + notchR, canvasH - extraBottom);
          ctx.lineTo(canvasW - pad - notchR, canvasH - extraBottom);
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2);
        } else if (customStyle.frameStyle === "laptop-monitor") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 10;
          ctx.strokeRect(15, 15, canvasW - 30, canvasH - extraBottom);

          ctx.fillStyle = customStyle.frameColor;
          ctx.beginPath();
          ctx.moveTo(canvasW / 2 - 50, canvasH - extraBottom + 15);
          ctx.lineTo(canvasW / 2 - 70, canvasH - 15);
          ctx.lineTo(canvasW / 2 + 70, canvasH - 15);
          ctx.lineTo(canvasW / 2 + 50, canvasH - extraBottom + 15);
          ctx.closePath();
          ctx.fill();

          ctx.fillRect(20, canvasH - 15, canvasW - 40, 6);

          ctx.fillStyle = customStyle.labelColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom + 10);
        } else if (customStyle.frameStyle === "heart-love") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 8;
          
          const pad = 12;
          const hW = canvasW - 24;
          const hH = canvasH - 24;
          
          ctx.beginPath();
          ctx.moveTo(canvasW / 2, pad + hH * 0.25);
          ctx.bezierCurveTo(canvasW / 2 - hW * 0.4, pad, pad, pad + hH * 0.4, canvasW / 2, canvasH - pad);
          ctx.bezierCurveTo(canvasW - pad, pad + hH * 0.4, canvasW / 2 + hW * 0.4, pad, canvasW / 2, pad + hH * 0.25);
          ctx.stroke();

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 - 5);
        } else if (customStyle.frameStyle === "star-sparkle") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 6;
          ctx.strokeRect(15, 15, canvasW - 30, canvasH - 30);
          
          const drawStarDecal = (cx: number, cy: number) => {
            ctx.fillStyle = customStyle.frameColor;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 12);
            ctx.quadraticCurveTo(cx, cy, cx + 12, cy);
            ctx.quadraticCurveTo(cx, cy, cx, cy + 12);
            ctx.quadraticCurveTo(cx, cy, cx - 12, cy);
            ctx.quadraticCurveTo(cx, cy, cx, cy - 12);
            ctx.fill();
          }

          drawStarDecal(15, 15);
          drawStarDecal(canvasW - 15, 15);
          drawStarDecal(15, canvasH - 30);
          drawStarDecal(canvasW - 15, canvasH - 30);

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 - 5);
        } else if (customStyle.frameStyle === "gift-box") {
          ctx.strokeStyle = customStyle.frameColor;
          ctx.lineWidth = 8;
          ctx.strokeRect(10, extraTop - 5, canvasW - 20, canvasH - extraTop - 5);

          ctx.beginPath();
          ctx.moveTo(canvasW / 2, extraTop - 5);
          ctx.lineTo(canvasW / 2, canvasH - 10);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(canvasW / 2 - 20, extraTop - 15, 15, 0, 2 * Math.PI);
          ctx.arc(canvasW / 2 + 20, extraTop - 15, 15, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 - 5);

        } else if (customStyle.frameStyle === "neon-glow") {
          // Multi-layer neon glow border
          const neonColor = customStyle.frameColor;
          const glowLayers = [
            { blur: 32, alpha: 0.15, width: 24 },
            { blur: 16, alpha: 0.3, width: 16 },
            { blur: 8, alpha: 0.6, width: 8 },
            { blur: 0, alpha: 1.0, width: 4 },
          ];
          for (const layer of glowLayers) {
            ctx.save();
            ctx.shadowBlur = layer.blur;
            ctx.shadowColor = neonColor;
            ctx.globalAlpha = layer.alpha;
            ctx.strokeStyle = neonColor;
            ctx.lineWidth = layer.width;
            ctx.beginPath();
            ctx.roundRect(layer.width / 2 + 4, layer.width / 2 + 4, canvasW - layer.width - 8, canvasH - layer.width - 8, 18);
            ctx.stroke();
            ctx.restore();
          }
          // Solid white inner shine
          ctx.save();
          ctx.strokeStyle = "#ffffff";
          ctx.globalAlpha = 0.7;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(12, 12, canvasW - 24, canvasH - 24, 14);
          ctx.stroke();
          ctx.restore();
          // Bottom label banner
          const neonBannerGrad = ctx.createLinearGradient(0, canvasH - extraBottom, canvasW, canvasH);
          neonBannerGrad.addColorStop(0, customStyle.frameColor);
          neonBannerGrad.addColorStop(0.5, "#ffffff22");
          neonBannerGrad.addColorStop(1, customStyle.frameColor);
          ctx.save();
          ctx.fillStyle = neonBannerGrad;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.roundRect(12, canvasH - extraBottom + 4, canvasW - 24, extraBottom - 10, [0, 0, 12, 12]);
          ctx.fill();
          ctx.restore();
          ctx.save();
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#ffffff";
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 + 4);
          ctx.restore();

        } else if (customStyle.frameStyle === "gradient-burst") {
          // Radial burst gradient background for frame area
          const burstGrad = ctx.createRadialGradient(canvasW / 2, canvasH / 2, baseQRSize * 0.3, canvasW / 2, canvasH / 2, canvasW * 0.8);
          burstGrad.addColorStop(0, customStyle.frameColor + "00");
          burstGrad.addColorStop(0.6, customStyle.frameColor + "55");
          burstGrad.addColorStop(1, customStyle.frameColor + "cc");
          ctx.fillStyle = burstGrad;
          ctx.fillRect(0, 0, canvasW, canvasH);
          // Gradient border ring
          const ringGrad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
          ringGrad.addColorStop(0, "#ff6b6b");
          ringGrad.addColorStop(0.33, customStyle.frameColor);
          ringGrad.addColorStop(0.66, "#a855f7");
          ringGrad.addColorStop(1, "#2563eb");
          ctx.strokeStyle = ringGrad;
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.roundRect(8, 8, canvasW - 16, canvasH - 16, 20);
          ctx.stroke();
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#ffffff55";
          ctx.beginPath();
          ctx.roundRect(16, 16, canvasW - 32, canvasH - 32, 14);
          ctx.stroke();
          // Label banner with gradient
          const labelGrad2 = ctx.createLinearGradient(0, canvasH - extraBottom, canvasW, canvasH);
          labelGrad2.addColorStop(0, "#7c3aed");
          labelGrad2.addColorStop(1, "#2563eb");
          ctx.fillStyle = labelGrad2;
          ctx.beginPath();
          ctx.roundRect(8, canvasH - extraBottom + 2, canvasW - 16, extraBottom - 10, [0, 0, 14, 14]);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 + 2);

        } else if (customStyle.frameStyle === "polaroid") {
          // Polaroid white frame
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.roundRect(6, 6, canvasW - 12, canvasH - 12, 8);
          ctx.fill();
          // Subtle gray shadow inset
          ctx.strokeStyle = "#e2e8f0";
          ctx.lineWidth = 2;
          ctx.strokeRect(6, 6, canvasW - 12, canvasH - 12);
          // Tape strip top
          const tapeGrad = ctx.createLinearGradient(canvasW / 2 - 50, 0, canvasW / 2 + 50, 0);
          tapeGrad.addColorStop(0, customStyle.frameColor + "99");
          tapeGrad.addColorStop(0.5, customStyle.frameColor + "cc");
          tapeGrad.addColorStop(1, customStyle.frameColor + "99");
          ctx.fillStyle = tapeGrad;
          ctx.save();
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.roundRect(canvasW / 2 - 48, 0, 96, 20, 3);
          ctx.fill();
          ctx.restore();
          // Large bottom photo caption area with colored stripe
          ctx.fillStyle = customStyle.frameColor;
          ctx.globalAlpha = 0.12;
          ctx.fillRect(6, canvasH - extraBottom + 4, canvasW - 12, extraBottom - 10);
          ctx.globalAlpha = 1;
          // Handwriting-style label
          ctx.fillStyle = customStyle.frameColor;
          ctx.font = `italic bold ${customStyle.labelFontSize}px Georgia, serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 + 4);
          // Bottom signature line
          ctx.strokeStyle = customStyle.frameColor;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(canvasW * 0.2, canvasH - 16);
          ctx.lineTo(canvasW * 0.8, canvasH - 16);
          ctx.stroke();
          ctx.globalAlpha = 1;

        } else if (customStyle.frameStyle === "ornamental") {
          // Rich ornamental frame with decorative corners
          const orn = customStyle.frameColor;
          // Outer thick border
          ctx.strokeStyle = orn;
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.roundRect(8, 8, canvasW - 16, canvasH - 16, 6);
          ctx.stroke();
          // Inner thin border
          ctx.lineWidth = 3;
          ctx.strokeStyle = orn + "99";
          ctx.beginPath();
          ctx.roundRect(20, 20, canvasW - 40, canvasH - 40, 4);
          ctx.stroke();
          // Decorative corner rosettes
          const drawRosette = (cx: number, cy: number, r: number) => {
            for (let i = 0; i < 8; i++) {
              const angle = (i * Math.PI * 2) / 8;
              ctx.beginPath();
              ctx.arc(cx + Math.cos(angle) * r * 0.5, cy + Math.sin(angle) * r * 0.5, r * 0.35, 0, Math.PI * 2);
              ctx.fillStyle = orn;
              ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = orn;
            ctx.fill();
          };
          const rosetteR = 14;
          drawRosette(rosetteR + 8, rosetteR + 8, rosetteR);
          drawRosette(canvasW - rosetteR - 8, rosetteR + 8, rosetteR);
          drawRosette(rosetteR + 8, canvasH - rosetteR - 8, rosetteR);
          drawRosette(canvasW - rosetteR - 8, canvasH - rosetteR - 8, rosetteR);
          // Decorative side dots
          for (let i = 0; i < 5; i++) {
            const yy = canvasH * (0.2 + i * 0.15);
            ctx.beginPath(); ctx.arc(14, yy, 4, 0, Math.PI * 2); ctx.fillStyle = orn; ctx.fill();
            ctx.beginPath(); ctx.arc(canvasW - 14, yy, 4, 0, Math.PI * 2); ctx.fill();
          }
          // Label banner
          const ornGrad = ctx.createLinearGradient(0, canvasH - extraBottom, canvasW, canvasH);
          ornGrad.addColorStop(0, orn);
          ornGrad.addColorStop(0.5, orn + "cc");
          ornGrad.addColorStop(1, orn);
          ctx.fillStyle = ornGrad;
          ctx.beginPath();
          ctx.roundRect(20, canvasH - extraBottom + 4, canvasW - 40, extraBottom - 14, [0, 0, 4, 4]);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 + 4);

        } else if (customStyle.frameStyle === "sunburst") {
          // Sunburst rays behind QR
          const sunCX = canvasW / 2;
          const sunCY = canvasH / 2 - extraBottom / 4;
          const rayCount = 18;
          const outerRay = Math.max(canvasW, canvasH) * 0.72;
          const innerRay = Math.max(canvasW, canvasH) * 0.35;
          ctx.save();
          for (let i = 0; i < rayCount; i++) {
            const angle1 = (i / rayCount) * Math.PI * 2;
            const angle2 = ((i + 0.5) / rayCount) * Math.PI * 2;
            const angle3 = ((i + 1) / rayCount) * Math.PI * 2;
            const rayGrad = ctx.createLinearGradient(sunCX, sunCY, sunCX + Math.cos(angle2) * outerRay, sunCY + Math.sin(angle2) * outerRay);
            rayGrad.addColorStop(0, customStyle.frameColor + "cc");
            rayGrad.addColorStop(1, customStyle.frameColor + "00");
            ctx.fillStyle = rayGrad;
            ctx.beginPath();
            ctx.moveTo(sunCX + Math.cos(angle1) * innerRay, sunCY + Math.sin(angle1) * innerRay);
            ctx.lineTo(sunCX + Math.cos(angle2) * outerRay, sunCY + Math.sin(angle2) * outerRay);
            ctx.lineTo(sunCX + Math.cos(angle3) * innerRay, sunCY + Math.sin(angle3) * innerRay);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
          // Golden ring
          const sunRingGrad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
          sunRingGrad.addColorStop(0, "#f59e0b");
          sunRingGrad.addColorStop(0.5, customStyle.frameColor);
          sunRingGrad.addColorStop(1, "#fbbf24");
          ctx.strokeStyle = sunRingGrad;
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.roundRect(8, 8, canvasW - 16, canvasH - 16, 16);
          ctx.stroke();
          ctx.strokeStyle = "#ffffff55";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(18, 18, canvasW - 36, canvasH - 36, 10);
          ctx.stroke();
          // Label
          const sunLabelGrad = ctx.createLinearGradient(0, canvasH - extraBottom, canvasW, canvasH);
          sunLabelGrad.addColorStop(0, "#f59e0b");
          sunLabelGrad.addColorStop(1, "#d97706");
          ctx.fillStyle = sunLabelGrad;
          ctx.beginPath();
          ctx.roundRect(10, canvasH - extraBottom + 2, canvasW - 20, extraBottom - 12, [0, 0, 10, 10]);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 + 2);

        } else if (customStyle.frameStyle === "circuit-board") {
          // Circuit board tech frame
          const cColor = customStyle.frameColor;
          // Base border
          ctx.strokeStyle = cColor;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.roundRect(8, 8, canvasW - 16, canvasH - 16, 4);
          ctx.stroke();
          ctx.lineWidth = 2;
          ctx.strokeStyle = cColor + "77";
          ctx.beginPath();
          ctx.roundRect(16, 16, canvasW - 32, canvasH - 32, 2);
          ctx.stroke();
          // Circuit traces - horizontal/vertical lines
          const traces = [
            { x1: 8, y1: 40, x2: 40, y2: 40 },
            { x1: 8, y1: 70, x2: 30, y2: 70 },
            { x1: canvasW - 8, y1: 40, x2: canvasW - 40, y2: 40 },
            { x1: canvasW - 8, y1: 70, x2: canvasW - 30, y2: 70 },
            { x1: 40, y1: 8, x2: 40, y2: 40 },
            { x1: 70, y1: 8, x2: 70, y2: 30 },
            { x1: canvasW - 40, y1: 8, x2: canvasW - 40, y2: 40 },
            { x1: canvasW - 70, y1: 8, x2: canvasW - 70, y2: 30 },
            { x1: 8, y1: canvasH - extraBottom - 20, x2: 40, y2: canvasH - extraBottom - 20 },
            { x1: canvasW - 8, y1: canvasH - extraBottom - 20, x2: canvasW - 40, y2: canvasH - extraBottom - 20 },
          ];
          ctx.strokeStyle = cColor;
          ctx.lineWidth = 3;
          traces.forEach(tr => {
            ctx.beginPath();
            ctx.moveTo(tr.x1, tr.y1);
            ctx.lineTo(tr.x2, tr.y2);
            ctx.stroke();
          });
          // Solder dots at trace ends
          const dots = [[40,40],[30,70],[canvasW-40,40],[canvasW-30,70],[40,8],[70,30],[canvasW-40,8],[canvasW-70,30]];
          ctx.fillStyle = cColor;
          dots.forEach(d => {
            ctx.beginPath(); ctx.arc(d[0], d[1], 5, 0, Math.PI * 2); ctx.fill();
          });
          // Label PCB style
          ctx.fillStyle = cColor;
          ctx.beginPath();
          ctx.roundRect(10, canvasH - extraBottom + 2, canvasW - 20, extraBottom - 12, 2);
          ctx.fill();
          ctx.fillStyle = "#00ff88";
          ctx.font = `bold ${customStyle.labelFontSize}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 + 2);

        } else if (customStyle.frameStyle === "floral-wreath") {
          // Floral wreath frame
          const flColor = customStyle.frameColor;
          const petalColors = ["#f43f5e", "#f59e0b", "#10b981", "#8b5cf6", "#3b82f6"];
          const flCX = canvasW / 2;
          const flCY = canvasH / 2 - extraBottom / 4;
          const wreathR = Math.min(canvasW, canvasH) * 0.5 - 12;
          // Draw petals/flowers around the ring
          const flowerCount = 12;
          for (let i = 0; i < flowerCount; i++) {
            const angle = (i / flowerCount) * Math.PI * 2;
            const fx = flCX + Math.cos(angle) * wreathR;
            const fy = flCY + Math.sin(angle) * wreathR;
            const petalColor = petalColors[i % petalColors.length];
            // Draw 5-petal flower
            for (let p = 0; p < 5; p++) {
              const pa = (p / 5) * Math.PI * 2;
              ctx.beginPath();
              ctx.arc(fx + Math.cos(pa) * 8, fy + Math.sin(pa) * 8, 7, 0, Math.PI * 2);
              ctx.fillStyle = petalColor + "cc";
              ctx.fill();
            }
            ctx.beginPath();
            ctx.arc(fx, fy, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#fbbf24";
            ctx.fill();
          }
          // Wreath ring
          ctx.strokeStyle = "#16a34a";
          ctx.lineWidth = 4;
          ctx.setLineDash([8, 6]);
          ctx.beginPath();
          ctx.arc(flCX, flCY, wreathR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          // Label
          const wreathLabelGrad = ctx.createLinearGradient(0, canvasH - extraBottom, canvasW, canvasH);
          wreathLabelGrad.addColorStop(0, "#16a34a");
          wreathLabelGrad.addColorStop(1, "#15803d");
          ctx.fillStyle = wreathLabelGrad;
          ctx.beginPath();
          ctx.roundRect(16, canvasH - extraBottom + 2, canvasW - 32, extraBottom - 12, [0, 0, 12, 12]);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 + 2);

        } else if (customStyle.frameStyle === "retro-tv") {
          // Retro TV / arcade cabinet frame
          const rtColor = customStyle.frameColor;
          // TV outer shell (rounded trapezoid-ish)
          ctx.fillStyle = rtColor;
          ctx.beginPath();
          ctx.roundRect(5, 5, canvasW - 10, canvasH - 10, [20, 20, 8, 8]);
          ctx.fill();
          // Screen inset (white)
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.roundRect(extraLeft - 4, extraTop - 4, baseQRSize + 8, baseQRSize + 8, 8);
          ctx.fill();
          // Scanlines on screen
          ctx.save();
          ctx.globalAlpha = 0.05;
          ctx.fillStyle = "#000000";
          for (let sl = extraTop - 4; sl < extraTop + baseQRSize + 4; sl += 4) {
            ctx.fillRect(extraLeft - 4, sl, baseQRSize + 8, 2);
          }
          ctx.restore();
          // Knob decorations
          const knobY = canvasH - extraBottom / 2;
          const knobPositions = [canvasW * 0.25, canvasW * 0.5, canvasW * 0.75];
          knobPositions.forEach((kx) => {
            ctx.beginPath();
            ctx.arc(kx, knobY, 10, 0, Math.PI * 2);
            ctx.fillStyle = "#1e293b";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(kx, knobY, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#64748b";
            ctx.fill();
          });
          // Brand label above knobs
          ctx.fillStyle = "#ffffff";
          ctx.globalAlpha = 0.9;
          ctx.font = `bold ${Math.round(customStyle.labelFontSize * 0.85)}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom + extraBottom * 0.25);
          ctx.globalAlpha = 1;
          // Antenna top
          ctx.strokeStyle = "#1e293b";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(canvasW / 2 - 20, extraTop - 8);
          ctx.lineTo(canvasW / 2, 8);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(canvasW / 2 + 20, extraTop - 8);
          ctx.lineTo(canvasW / 2, 8);
          ctx.stroke();

        } else if (customStyle.frameStyle === "paint-splash") {
          // Paint splash artistic border
          const ps = customStyle.frameColor;
          const splashColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", ps];
          // Draw paint blobs around the edges
          const blobs = [
            { x: 0, y: 0, r: 55 }, { x: canvasW, y: 0, r: 50 }, { x: 0, y: canvasH, r: 50 },
            { x: canvasW, y: canvasH, r: 55 }, { x: canvasW / 2, y: 0, r: 40 },
            { x: canvasW / 2, y: canvasH, r: 40 }, { x: 0, y: canvasH / 2, r: 40 },
            { x: canvasW, y: canvasH / 2, r: 40 },
          ];
          blobs.forEach((blob, i) => {
            const gc = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
            gc.addColorStop(0, splashColors[i % splashColors.length] + "dd");
            gc.addColorStop(1, splashColors[i % splashColors.length] + "00");
            ctx.fillStyle = gc;
            ctx.beginPath();
            ctx.arc(blob.x, blob.y, blob.r, 0, Math.PI * 2);
            ctx.fill();
          });
          // White center safe zone
          ctx.fillStyle = settings.bgColor;
          ctx.beginPath();
          ctx.roundRect(extraLeft - 8, extraTop - 8, baseQRSize + 16, baseQRSize + 16, 8);
          ctx.fill();
          // Label
          ctx.fillStyle = ps;
          ctx.beginPath();
          ctx.roundRect(extraLeft, canvasH - extraBottom + 4, baseQRSize, extraBottom - 14, 8);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 + 4);

        } else if (customStyle.frameStyle === "trophy") {
          // Trophy / award frame
          const tColor = customStyle.frameColor;
          const goldGrad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
          goldGrad.addColorStop(0, "#fbbf24");
          goldGrad.addColorStop(0.3, tColor);
          goldGrad.addColorStop(0.7, "#f59e0b");
          goldGrad.addColorStop(1, "#fbbf24");
          // Outer golden border
          ctx.strokeStyle = goldGrad;
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.roundRect(8, 8, canvasW - 16, canvasH - 16, 12);
          ctx.stroke();
          // Double ring inner
          ctx.lineWidth = 4;
          ctx.strokeStyle = "#fef3c7";
          ctx.beginPath();
          ctx.roundRect(20, 20, canvasW - 40, canvasH - 40, 8);
          ctx.stroke();
          // Star accents at top-left and top-right
          const drawSmallStar = (cx: number, cy: number, sz: number, color: string) => {
            ctx.save();
            ctx.fillStyle = color;
            ctx.beginPath();
            for (let pt = 0; pt < 5; pt++) {
              const a1 = ((pt * 2 - 0.5) / 5) * Math.PI * 2;
              const a2 = ((pt * 2 + 0.5) / 5) * Math.PI * 2;
              if (pt === 0) ctx.moveTo(cx + Math.cos(a1) * sz, cy + Math.sin(a1) * sz);
              else ctx.lineTo(cx + Math.cos(a1) * sz, cy + Math.sin(a1) * sz);
              ctx.lineTo(cx + Math.cos(a2) * (sz * 0.4), cy + Math.sin(a2) * (sz * 0.4));
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          };
          drawSmallStar(22, 22, 12, "#fbbf24");
          drawSmallStar(canvasW - 22, 22, 12, "#fbbf24");
          drawSmallStar(22, canvasH - extraBottom - 10, 10, "#fbbf24");
          drawSmallStar(canvasW - 22, canvasH - extraBottom - 10, 10, "#fbbf24");
          // Trophy icon at top center
          const tx = canvasW / 2;
          const ty = 18;
          ctx.fillStyle = goldGrad;
          ctx.beginPath();
          ctx.roundRect(tx - 20, ty - 12, 40, 24, 4);
          ctx.fill();
          // Cup shape
          ctx.fillStyle = "#fbbf24";
          ctx.beginPath();
          ctx.moveTo(tx - 12, ty - 6);
          ctx.lineTo(tx + 12, ty - 6);
          ctx.lineTo(tx + 10, ty + 6);
          ctx.lineTo(tx - 10, ty + 6);
          ctx.closePath();
          ctx.fill();
          // Handle arcs
          ctx.strokeStyle = "#fbbf24";
          ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(tx - 14, ty, 6, Math.PI * 0.3, Math.PI * 1.7); ctx.stroke();
          ctx.beginPath(); ctx.arc(tx + 14, ty, 6, Math.PI * 1.3 - Math.PI, Math.PI * 0.7); ctx.stroke();
          // Label banner with gold gradient
          const tBanner = ctx.createLinearGradient(0, canvasH - extraBottom, canvasW, canvasH);
          tBanner.addColorStop(0, "#f59e0b");
          tBanner.addColorStop(0.5, tColor);
          tBanner.addColorStop(1, "#f59e0b");
          ctx.fillStyle = tBanner;
          ctx.beginPath();
          ctx.roundRect(20, canvasH - extraBottom + 4, canvasW - 40, extraBottom - 14, [0, 0, 8, 8]);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = `bold ${customStyle.labelFontSize}px ${customStyle.labelFont}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(customStyle.labelText, canvasW / 2, canvasH - extraBottom / 2 + 4);
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

  const handleSwapColors = () => {
    const prevFg = settings.fgColor;
    const prevBg = settings.bgColor;
    setSettings((p) => ({ ...p, fgColor: prevBg, bgColor: prevFg }));
    setFgHex(prevBg);
    setBgHex(prevFg);
  };

  const colorPresets = [
    "#000000", "#ffffff", "#7c3aed", "#2563eb", "#0891b2",
    "#059669", "#d97706", "#dc2626", "#db2777", "#a855f7",
    "#1e293b", "#374151"
  ];


  const handleColorPreset = (color: string) => {
    setSettings((p) => ({ ...p, fgColor: color }));
    setFgHex(color);
  };

  const handleCopyText = async () => {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Content copied to clipboard!", "success");
    } catch {
      showToast("Could not copy text.", "error");
    }
  };

  const handleDownloadPNG = () => {
    if (isLimitReached) {
      showToast(getLimitToastMessage(), "error");
      if (getUserRole() === "anon") onLoginClick();
      return;
    }

    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `happyqr-${Date.now()}.png`;
    a.click();
    showToast("PNG downloaded!", "success");

    if (!userEmail) incrementAnonGenCount();
    else incrementDailyUsage("single");
    saveToHistory();
  };

  const handleDownloadSVG = async () => {
    if (isLimitReached) {
      showToast(getLimitToastMessage(), "error");
      if (getUserRole() === "anon") onLoginClick();
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
      else incrementDailyUsage("single");
      saveToHistory("svg", svgStr);
    } catch {
      showToast("SVG export failed.", "error");
    }
  };

  const handleCopyPNG = async () => {
    if (isLimitReached) {
      showToast(getLimitToastMessage(), "error");
      if (getUserRole() === "anon") onLoginClick();
      return;
    }

    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      showToast("QR image copied to clipboard!", "success");
      
      if (!userEmail) incrementAnonGenCount();
      else incrementDailyUsage("single");
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

  // ── Shape Picker Data ──
  const moduleShapes: { value: CustomQRStyle["moduleType"]; label: string; preview: React.ReactNode }[] = [
    {
      value: "squares", label: "Squares",
      preview: (
        <svg width="42" height="42" viewBox="0 0 42 42" fill="currentColor">
          <rect x="2" y="2" width="8" height="8" rx="0.5"/><rect x="12" y="2" width="8" height="8" rx="0.5"/><rect x="22" y="2" width="8" height="8" rx="0.5"/><rect x="32" y="2" width="8" height="8" rx="0.5"/>
          <rect x="2" y="12" width="8" height="8" rx="0.5"/><rect x="22" y="12" width="8" height="8" rx="0.5"/>
          <rect x="2" y="22" width="8" height="8" rx="0.5"/><rect x="12" y="22" width="8" height="8" rx="0.5"/><rect x="32" y="22" width="8" height="8" rx="0.5"/>
          <rect x="12" y="32" width="8" height="8" rx="0.5"/><rect x="22" y="32" width="8" height="8" rx="0.5"/><rect x="32" y="32" width="8" height="8" rx="0.5"/>
        </svg>
      ),
    },
    {
      value: "rounded", label: "Rounded",
      preview: (
        <svg width="42" height="42" viewBox="0 0 42 42" fill="currentColor">
          <rect x="2" y="2" width="8" height="8" rx="3"/><rect x="12" y="2" width="8" height="8" rx="3"/><rect x="22" y="2" width="8" height="8" rx="3"/><rect x="32" y="2" width="8" height="8" rx="3"/>
          <rect x="2" y="12" width="8" height="8" rx="3"/><rect x="22" y="12" width="8" height="8" rx="3"/>
          <rect x="2" y="22" width="8" height="8" rx="3"/><rect x="12" y="22" width="8" height="8" rx="3"/><rect x="32" y="22" width="8" height="8" rx="3"/>
          <rect x="12" y="32" width="8" height="8" rx="3"/><rect x="22" y="32" width="8" height="8" rx="3"/><rect x="32" y="32" width="8" height="8" rx="3"/>
        </svg>
      ),
    },
    {
      value: "dots", label: "Dots",
      preview: (
        <svg width="42" height="42" viewBox="0 0 42 42" fill="currentColor">
          <circle cx="6" cy="6" r="4"/><circle cx="16" cy="6" r="4"/><circle cx="26" cy="6" r="4"/><circle cx="36" cy="6" r="4"/>
          <circle cx="6" cy="16" r="4"/><circle cx="26" cy="16" r="4"/>
          <circle cx="6" cy="26" r="4"/><circle cx="16" cy="26" r="4"/><circle cx="36" cy="26" r="4"/>
          <circle cx="16" cy="36" r="4"/><circle cx="26" cy="36" r="4"/><circle cx="36" cy="36" r="4"/>
        </svg>
      ),
    },
    {
      value: "diamonds", label: "Diamonds",
      preview: (
        <svg width="42" height="42" viewBox="0 0 42 42" fill="currentColor">
          <path d="M6 2L10 6L6 10L2 6Z"/><path d="M16 2L20 6L16 10L12 6Z"/><path d="M26 2L30 6L26 10L22 6Z"/><path d="M36 2L40 6L36 10L32 6Z"/>
          <path d="M6 12L10 16L6 20L2 16Z"/><path d="M26 12L30 16L26 20L22 16Z"/>
          <path d="M6 22L10 26L6 30L2 26Z"/><path d="M16 22L20 26L16 30L12 26Z"/><path d="M36 22L40 26L36 30L32 26Z"/>
          <path d="M16 32L20 36L16 40L12 36Z"/><path d="M26 32L30 36L26 40L22 36Z"/>
        </svg>
      ),
    },
    {
      value: "stars", label: "Stars",
      preview: (
        <svg width="42" height="42" viewBox="0 0 42 42" fill="currentColor">
          <path d="M6 2L7 5H10L8 7L9 10L6 8L3 10L4 7L2 5H5Z"/>
          <path d="M16 2L17 5H20L18 7L19 10L16 8L13 10L14 7L12 5H15Z"/>
          <path d="M26 2L27 5H30L28 7L29 10L26 8L23 10L24 7L22 5H25Z"/>
          <path d="M6 22L7 25H10L8 27L9 30L6 28L3 30L4 27L2 25H5Z"/>
          <path d="M36 22L37 25H40L38 27L39 30L36 28L33 30L34 27L32 25H35Z"/>
          <path d="M16 32L17 35H20L18 37L19 40L16 38L13 40L14 37L12 35H15Z"/>
          <path d="M36 2L37 5H40L38 7L39 10L36 8L33 10L34 7L32 5H35Z"/>
        </svg>
      ),
    },
    {
      value: "lines", label: "Stripes",
      preview: (
        <svg width="42" height="42" viewBox="0 0 42 42" fill="currentColor">
          <rect x="2" y="2" width="7" height="38" rx="1.5"/>
          <rect x="13" y="2" width="7" height="38" rx="1.5"/>
          <rect x="24" y="2" width="7" height="38" rx="1.5"/>
          <rect x="35" y="2" width="7" height="38" rx="1.5"/>
        </svg>
      ),
    },
    {
      value: "crosses", label: "Crosses",
      preview: (
        <svg width="42" height="42" viewBox="0 0 42 42" fill="currentColor">
          <rect x="5" y="2" width="2" height="8"/><rect x="2" y="5" width="8" height="2"/>
          <rect x="15" y="2" width="2" height="8"/><rect x="12" y="5" width="8" height="2"/>
          <rect x="25" y="2" width="2" height="8"/><rect x="22" y="5" width="8" height="2"/>
          <rect x="35" y="2" width="2" height="8"/><rect x="32" y="5" width="8" height="2"/>
          <rect x="5" y="12" width="2" height="8"/><rect x="2" y="15" width="8" height="2"/>
          <rect x="25" y="12" width="2" height="8"/><rect x="22" y="15" width="8" height="2"/>
        </svg>
      ),
    },
    {
      value: "fluid", label: "Fluid",
      preview: (
        <svg width="42" height="42" viewBox="0 0 42 42" fill="currentColor">
          <circle cx="6" cy="6" r="5.8"/><circle cx="15" cy="6" r="5.8"/><circle cx="24" cy="6" r="5.8"/><circle cx="33" cy="6" r="5.8"/>
          <circle cx="6" cy="15" r="5.8"/><circle cx="24" cy="15" r="5.8"/>
          <circle cx="6" cy="24" r="5.8"/><circle cx="15" cy="24" r="5.8"/><circle cx="33" cy="24" r="5.8"/>
        </svg>
      ),
    },
    {
      value: "heart", label: "Heart",
      preview: (
        <svg width="42" height="42" viewBox="0 0 42 42" fill="currentColor">
          <path d="M10 4 C9 2, 7 2, 5 4 C3.5 5.5, 3.5 8, 6 10 L10 14 L14 10 C16.5 8, 16.5 5.5, 15 4 C13 2, 11 2, 10 4 Z"/>
          <path d="M26 4 C25 2, 23 2, 21 4 C19.5 5.5, 19.5 8, 22 10 L26 14 L30 10 C32.5 8, 32.5 5.5, 31 4 C29 2, 27 2, 26 4 Z"/>
          <path d="M10 20 C9 18, 7 18, 5 20 C3.5 21.5, 3.5 24, 6 26 L10 30 L14 26 C16.5 24, 16.5 21.5, 15 20 C13 18, 11 18, 10 20 Z"/>
        </svg>
      ),
    },
  ];

  const outerShapes: { value: CustomQRStyle["cornerOuter"]; label: string; preview: React.ReactNode }[] = [
    {
      value: "squares", label: "Sharp",
      preview: (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="3">
          <rect x="4" y="4" width="30" height="30" rx="1"/>
          <rect x="9" y="9" width="20" height="20" rx="1"/>
        </svg>
      ),
    },
    {
      value: "rounded", label: "Rounded",
      preview: (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="3">
          <rect x="4" y="4" width="30" height="30" rx="7"/>
          <rect x="9" y="9" width="20" height="20" rx="4"/>
        </svg>
      ),
    },
    {
      value: "circle", label: "Circle",
      preview: (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="3">
          <circle cx="19" cy="19" r="15"/>
          <circle cx="19" cy="19" r="10"/>
        </svg>
      ),
    },
    {
      value: "leaf", label: "Leaf",
      preview: (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M4 4 Q4 34 34 34 Q34 4 4 4Z"/>
          <path d="M10 10 Q10 28 28 28 Q28 10 10 10Z"/>
        </svg>
      ),
    },
    {
      value: "shield", label: "Shield",
      preview: (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M19 4L4 10V22C4 30 19 36 19 36C19 36 34 30 34 22V10Z"/>
        </svg>
      ),
    },
    {
      value: "flower", label: "Flower",
      preview: (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M19 4Q26 4 34 12Q34 26 19 34Q4 26 4 12Q12 4 19 4Z"/>
        </svg>
      ),
    },
  ];

  const innerDots: { value: CustomQRStyle["cornerInner"]; label: string; preview: React.ReactNode }[] = [
    {
      value: "squares", label: "Square",
      preview: (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="currentColor">
          <rect x="9" y="9" width="20" height="20" rx="1"/>
        </svg>
      ),
    },
    {
      value: "rounded", label: "Rounded",
      preview: (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="currentColor">
          <rect x="9" y="9" width="20" height="20" rx="5"/>
        </svg>
      ),
    },
    {
      value: "circle", label: "Circle",
      preview: (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="currentColor">
          <circle cx="19" cy="19" r="10"/>
        </svg>
      ),
    },
    {
      value: "leaf", label: "Leaf",
      preview: (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="currentColor">
          <path d="M9 9 Q9 29 29 29 Q29 9 9 9Z"/>
        </svg>
      ),
    },
    {
      value: "diamond", label: "Diamond",
      preview: (
        <svg width="38" height="38" viewBox="0 0 38 38" fill="currentColor">
          <path d="M19 8L30 19L19 30L8 19Z"/>
        </svg>
      ),
    },
  ];


  // -- Frame Picker Data --
  type FrameValue = CustomQRStyle["frameStyle"];
  const frameCategories: { category: string; frames: { value: FrameValue; label: string; preview: React.ReactNode }[] }[] = [
    {
      category: "No Frame",
      frames: [
        {
          value: "none", label: "Clean",
          preview: (
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <rect x="8" y="8" width="34" height="34" rx="3" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3"/>
              <rect x="14" y="14" width="10" height="10" rx="1" fill="#94a3b8" opacity="0.4"/>
              <rect x="26" y="14" width="10" height="10" rx="1" fill="#94a3b8" opacity="0.4"/>
              <rect x="14" y="26" width="10" height="10" rx="1" fill="#94a3b8" opacity="0.4"/>
              <rect x="27" y="27" width="4" height="4" fill="#94a3b8" opacity="0.4"/>
              <rect x="32" y="27" width="4" height="4" fill="#94a3b8" opacity="0.4"/>
              <rect x="27" y="32" width="4" height="4" fill="#94a3b8" opacity="0.4"/>
              <rect x="32" y="32" width="4" height="4" fill="#94a3b8" opacity="0.4"/>
            </svg>
          ),
        },
      ],
    },
    {
      category: "Premium Effects",
      frames: [
        {
          value: "neon-glow", label: "Neon Glow",
          preview: (
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
              <rect x="3" y="3" width="46" height="46" rx="8" stroke="#a855f7" strokeWidth="5" opacity="0.35"/>
              <rect x="3" y="3" width="46" height="46" rx="8" stroke="#a855f7" strokeWidth="3" opacity="0.65"/>
              <rect x="3" y="3" width="46" height="46" rx="8" stroke="#e879f9" strokeWidth="1.5"/>
              <rect x="6" y="6" width="40" height="40" rx="5" stroke="#ffffff" strokeWidth="0.5" opacity="0.5"/>
              <rect x="4" y="50" width="44" height="8" rx="3" fill="#a855f7" opacity="0.9"/>
              <line x1="13" y1="54" x2="38" y2="54" stroke="#e879f9" strokeWidth="1.5" opacity="0.8"/>
            </svg>
          ),
        },
        {
          value: "gradient-burst", label: "Gradient Burst",
          preview: (
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
              <defs>
                <radialGradient id="f-burst-bg" cx="50%" cy="45%" r="60%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0"/>
                  <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.3"/>
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.7"/>
                </radialGradient>
                <linearGradient id="f-burst-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff6b6b"/>
                  <stop offset="33%" stopColor="#7c3aed"/>
                  <stop offset="66%" stopColor="#a855f7"/>
                  <stop offset="100%" stopColor="#2563eb"/>
                </linearGradient>
              </defs>
              <rect width="52" height="52" rx="10" fill="url(#f-burst-bg)"/>
              <rect x="2" y="2" width="48" height="48" rx="9" stroke="url(#f-burst-ring)" strokeWidth="3.5"/>
              <rect x="7" y="7" width="38" height="38" rx="5" stroke="#ffffff" strokeWidth="0.8" opacity="0.4"/>
              <rect x="3" y="52" width="46" height="6" rx="2" fill="url(#f-burst-ring)"/>
            </svg>
          ),
        },
        {
          value: "sunburst", label: "Sunburst",
          preview: (
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
              <defs>
                <linearGradient id="f-sun-label" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#d97706"/>
                </linearGradient>
              </defs>
              <line x1="26" y1="26" x2="52" y2="26" stroke="#fbbf24" strokeWidth="1.5" opacity="0.35"/>
              <line x1="26" y1="26" x2="44" y2="8" stroke="#fbbf24" strokeWidth="1.5" opacity="0.35"/>
              <line x1="26" y1="26" x2="26" y2="0" stroke="#fbbf24" strokeWidth="1.5" opacity="0.35"/>
              <line x1="26" y1="26" x2="8" y2="8" stroke="#fbbf24" strokeWidth="1.5" opacity="0.35"/>
              <line x1="26" y1="26" x2="0" y2="26" stroke="#fbbf24" strokeWidth="1.5" opacity="0.35"/>
              <line x1="26" y1="26" x2="8" y2="44" stroke="#fbbf24" strokeWidth="1.5" opacity="0.35"/>
              <line x1="26" y1="26" x2="26" y2="50" stroke="#fbbf24" strokeWidth="1.5" opacity="0.35"/>
              <line x1="26" y1="26" x2="44" y2="44" stroke="#fbbf24" strokeWidth="1.5" opacity="0.35"/>
              <rect x="8" y="8" width="36" height="36" rx="4" fill="white" fillOpacity="0.85"/>
              <rect x="2" y="2" width="48" height="48" rx="7" stroke="#f59e0b" strokeWidth="3"/>
              <rect x="6" y="6" width="40" height="40" rx="4" stroke="#fbbf24" strokeWidth="1" opacity="0.6"/>
              <rect x="3" y="52" width="46" height="6" rx="2" fill="url(#f-sun-label)"/>
            </svg>
          ),
        },
        {
          value: "paint-splash", label: "Paint Splash",
          preview: (
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
              <circle cx="0" cy="0" r="22" fill="#ef4444" opacity="0.6"/>
              <circle cx="52" cy="0" r="22" fill="#f97316" opacity="0.6"/>
              <circle cx="0" cy="52" r="22" fill="#22c55e" opacity="0.6"/>
              <circle cx="52" cy="52" r="22" fill="#8b5cf6" opacity="0.6"/>
              <circle cx="26" cy="0" r="16" fill="#eab308" opacity="0.5"/>
              <circle cx="26" cy="52" r="16" fill="#3b82f6" opacity="0.5"/>
              <rect x="10" y="8" width="32" height="36" rx="4" fill="white" opacity="0.9"/>
              <rect x="5" y="50" width="42" height="8" rx="3" fill="#7c3aed"/>
            </svg>
          ),
        },
      ],
    },
    {
      category: "Artistic",
      frames: [
        {
          value: "polaroid", label: "Polaroid",
          preview: (
            <svg width="50" height="62" viewBox="0 0 50 62" fill="none">
              <rect x="3" y="3" width="44" height="56" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5"/>
              <rect x="8" y="8" width="34" height="34" rx="2" fill="#ddd6fe" opacity="0.4"/>
              <rect x="8" y="8" width="34" height="34" rx="2" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
              <rect x="18" y="0" width="14" height="8" rx="2" fill="#a78bfa" opacity="0.7"/>
              <line x1="10" y1="56" x2="40" y2="56" stroke="#c4b5fd" strokeWidth="0.8" opacity="0.6"/>
            </svg>
          ),
        },
        {
          value: "ornamental", label: "Ornamental",
          preview: (
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
              <defs>
                <linearGradient id="f-orn-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#2563eb"/>
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="46" height="46" rx="3" stroke="url(#f-orn-grad)" strokeWidth="4"/>
              <rect x="9" y="9" width="34" height="34" rx="2" stroke="#7c3aed" strokeWidth="1" opacity="0.5"/>
              <circle cx="3" cy="3" r="5" fill="#7c3aed"/>
              <circle cx="49" cy="3" r="5" fill="#7c3aed"/>
              <circle cx="3" cy="49" r="5" fill="#7c3aed"/>
              <circle cx="49" cy="49" r="5" fill="#7c3aed"/>
              <circle cx="3" cy="3" r="2.5" fill="white"/>
              <circle cx="49" cy="3" r="2.5" fill="white"/>
              <circle cx="3" cy="49" r="2.5" fill="white"/>
              <circle cx="49" cy="49" r="2.5" fill="white"/>
              <circle cx="3" cy="18" r="2" fill="#7c3aed"/>
              <circle cx="3" cy="34" r="2" fill="#7c3aed"/>
              <circle cx="49" cy="18" r="2" fill="#7c3aed"/>
              <circle cx="49" cy="34" r="2" fill="#7c3aed"/>
              <rect x="4" y="52" width="44" height="6" rx="2" fill="url(#f-orn-grad)"/>
            </svg>
          ),
        },
        {
          value: "floral-wreath", label: "Floral Wreath",
          preview: (
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
              <circle cx="46" cy="25" r="6" fill="#f43f5e" opacity="0.8"/>
              <circle cx="38" cy="8" r="6" fill="#f59e0b" opacity="0.8"/>
              <circle cx="26" cy="4" r="6" fill="#10b981" opacity="0.8"/>
              <circle cx="14" cy="8" r="6" fill="#8b5cf6" opacity="0.8"/>
              <circle cx="6" cy="25" r="6" fill="#3b82f6" opacity="0.8"/>
              <circle cx="14" cy="42" r="6" fill="#f43f5e" opacity="0.8"/>
              <circle cx="26" cy="46" r="6" fill="#f59e0b" opacity="0.8"/>
              <circle cx="38" cy="42" r="6" fill="#10b981" opacity="0.8"/>
              <circle cx="46" cy="25" r="2.5" fill="#fbbf24"/>
              <circle cx="38" cy="8" r="2.5" fill="#fbbf24"/>
              <circle cx="26" cy="4" r="2.5" fill="#fbbf24"/>
              <circle cx="14" cy="8" r="2.5" fill="#fbbf24"/>
              <circle cx="6" cy="25" r="2.5" fill="#fbbf24"/>
              <circle cx="14" cy="42" r="2.5" fill="#fbbf24"/>
              <circle cx="26" cy="46" r="2.5" fill="#fbbf24"/>
              <circle cx="38" cy="42" r="2.5" fill="#fbbf24"/>
              <circle cx="26" cy="25" r="16" fill="white" opacity="0.9"/>
              <circle cx="26" cy="25" r="16" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4 3" fill="none"/>
              <rect x="4" y="52" width="44" height="6" rx="2" fill="#16a34a"/>
            </svg>
          ),
        },
      ],
    },
    {
      category: "Banners & Bubbles",
      frames: [
        {
          value: "banner-bottom", label: "Bottom Banner",
          preview: (
            <svg width="50" height="60" viewBox="0 0 50 60" fill="none">
              <defs>
                <linearGradient id="f-banner-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#2563eb"/>
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="44" height="44" rx="4" stroke="#64748b" strokeWidth="1.5"/>
              <rect x="8" y="8" width="12" height="12" rx="1" fill="#94a3b8" opacity="0.4"/>
              <rect x="22" y="8" width="12" height="12" rx="1" fill="#94a3b8" opacity="0.4"/>
              <rect x="8" y="22" width="12" height="12" rx="1" fill="#94a3b8" opacity="0.4"/>
              <rect x="3" y="49" width="44" height="9" rx="3" fill="url(#f-banner-grad)"/>
              <line x1="14" y1="54" x2="36" y2="54" stroke="white" strokeWidth="1.5" opacity="0.8"/>
            </svg>
          ),
        },
        {
          value: "banner-top", label: "Top Banner",
          preview: (
            <svg width="50" height="60" viewBox="0 0 50 60" fill="none">
              <defs>
                <linearGradient id="f-topbanner-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0891b2"/>
                  <stop offset="100%" stopColor="#7c3aed"/>
                </linearGradient>
              </defs>
              <rect x="3" y="2" width="44" height="9" rx="3" fill="url(#f-topbanner-grad)"/>
              <line x1="14" y1="7" x2="36" y2="7" stroke="white" strokeWidth="1.5" opacity="0.8"/>
              <rect x="3" y="13" width="44" height="44" rx="4" stroke="#64748b" strokeWidth="1.5"/>
              <rect x="8" y="18" width="12" height="12" rx="1" fill="#94a3b8" opacity="0.4"/>
              <rect x="22" y="18" width="12" height="12" rx="1" fill="#94a3b8" opacity="0.4"/>
              <rect x="8" y="32" width="12" height="12" rx="1" fill="#94a3b8" opacity="0.4"/>
            </svg>
          ),
        },
        {
          value: "bubble-bottom", label: "Bubble Down",
          preview: (
            <svg width="52" height="64" viewBox="0 0 52 64" fill="none">
              <defs>
                <linearGradient id="f-bubble-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="46" height="46" rx="10" stroke="url(#f-bubble-grad)" strokeWidth="2.5" fill="none"/>
              <rect x="3" y="3" width="46" height="46" rx="10" fill="url(#f-bubble-grad)" opacity="0.08"/>
              <path d="M20 49L26 60L32 49Z" fill="url(#f-bubble-grad)"/>
            </svg>
          ),
        },
        {
          value: "bubble-top", label: "Bubble Up",
          preview: (
            <svg width="52" height="64" viewBox="0 0 52 64" fill="none">
              <defs>
                <linearGradient id="f-bubbletop-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316"/>
                  <stop offset="100%" stopColor="#ef4444"/>
                </linearGradient>
              </defs>
              <path d="M20 15L26 4L32 15Z" fill="url(#f-bubbletop-grad)"/>
              <rect x="3" y="15" width="46" height="46" rx="10" stroke="url(#f-bubbletop-grad)" strokeWidth="2.5" fill="none"/>
              <rect x="3" y="15" width="46" height="46" rx="10" fill="url(#f-bubbletop-grad)" opacity="0.08"/>
            </svg>
          ),
        },
        {
          value: "elegant-border", label: "Elegant",
          preview: (
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
              <defs>
                <linearGradient id="f-elegant-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b"/>
                  <stop offset="100%" stopColor="#475569"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="48" height="48" rx="2" stroke="url(#f-elegant-grad)" strokeWidth="4"/>
              <rect x="8" y="8" width="36" height="36" rx="1" stroke="#94a3b8" strokeWidth="1" opacity="0.4"/>
              <rect x="2" y="50" width="48" height="8" rx="2" fill="url(#f-elegant-grad)"/>
              <line x1="12" y1="54" x2="40" y2="54" stroke="#94a3b8" strokeWidth="1" opacity="0.6"/>
            </svg>
          ),
        },
        {
          value: "corners-only", label: "Brackets",
          preview: (
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
              <defs>
                <linearGradient id="f-corners-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4"/>
                  <stop offset="100%" stopColor="#2563eb"/>
                </linearGradient>
              </defs>
              <path d="M4 18V4H18" stroke="url(#f-corners-grad)" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M34 4H48V18" stroke="url(#f-corners-grad)" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M4 34V48H18" stroke="url(#f-corners-grad)" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M34 48H48V34" stroke="url(#f-corners-grad)" strokeWidth="3.5" strokeLinecap="round"/>
              <rect x="16" y="16" width="20" height="20" rx="2" fill="#06b6d4" opacity="0.1"/>
              <rect x="5" y="52" width="42" height="6" rx="2" fill="url(#f-corners-grad)"/>
            </svg>
          ),
        },
      ],
    },
    {
      category: "Device Mockups",
      frames: [
        {
          value: "phone-bezel", label: "Phone",
          preview: (
            <svg width="44" height="64" viewBox="0 0 44 64" fill="none">
              <defs>
                <linearGradient id="f-phone-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b"/>
                  <stop offset="100%" stopColor="#334155"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="40" height="60" rx="8" fill="url(#f-phone-grad)"/>
              <rect x="5" y="10" width="34" height="44" rx="3" fill="#f8fafc"/>
              <rect x="16" y="4.5" width="12" height="3" rx="1.5" fill="#64748b"/>
              <circle cx="22" cy="59" r="2.5" stroke="#475569" strokeWidth="1.5" fill="none"/>
            </svg>
          ),
        },
        {
          value: "clipboard", label: "Clipboard",
          preview: (
            <svg width="48" height="60" viewBox="0 0 48 60" fill="none">
              <defs>
                <linearGradient id="f-clip-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706"/>
                  <stop offset="100%" stopColor="#f59e0b"/>
                </linearGradient>
              </defs>
              <rect x="4" y="10" width="40" height="48" rx="4" fill="white" stroke="url(#f-clip-grad)" strokeWidth="2"/>
              <rect x="14" y="3" width="20" height="12" rx="3" fill="url(#f-clip-grad)"/>
              <circle cx="24" cy="9" r="2.5" fill="white"/>
              <rect x="10" y="50" width="28" height="5" rx="2" fill="url(#f-clip-grad)" opacity="0.8"/>
            </svg>
          ),
        },
        {
          value: "laptop-monitor", label: "Laptop",
          preview: (
            <svg width="58" height="52" viewBox="0 0 58 52" fill="none">
              <defs>
                <linearGradient id="f-laptop-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155"/>
                  <stop offset="100%" stopColor="#1e293b"/>
                </linearGradient>
              </defs>
              <rect x="6" y="3" width="46" height="32" rx="4" fill="url(#f-laptop-grad)"/>
              <rect x="9" y="6" width="40" height="26" rx="2" fill="#f1f5f9"/>
              <path d="M2 38H56L52 50H6Z" fill="url(#f-laptop-grad)"/>
              <rect x="20" y="43" width="18" height="3" rx="1.5" fill="#64748b"/>
            </svg>
          ),
        },
        {
          value: "retro-tv", label: "Retro TV",
          preview: (
            <svg width="52" height="64" viewBox="0 0 52 64" fill="none">
              <defs>
                <linearGradient id="f-tv-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#4c1d95"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="48" height="60" rx="10" fill="url(#f-tv-grad)"/>
              <rect x="7" y="8" width="38" height="36" rx="4" fill="#f8fafc"/>
              <line x1="26" y1="8" x2="18" y2="2" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round"/>
              <line x1="26" y1="8" x2="34" y2="2" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="15" cy="55" r="5" fill="#1e293b"/>
              <circle cx="26" cy="55" r="5" fill="#1e293b"/>
              <circle cx="37" cy="55" r="5" fill="#1e293b"/>
              <circle cx="15" cy="55" r="2" fill="#64748b"/>
              <circle cx="26" cy="55" r="2" fill="#64748b"/>
              <circle cx="37" cy="55" r="2" fill="#64748b"/>
            </svg>
          ),
        },
      ],
    },
    {
      category: "E-Commerce",
      frames: [
        {
          value: "shopping-bag", label: "Shop Bag",
          preview: (
            <svg width="50" height="60" viewBox="0 0 50 60" fill="none">
              <defs>
                <linearGradient id="f-bag-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899"/>
                  <stop offset="100%" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
              <path d="M8 16H42L38 56H12Z" fill="white" stroke="url(#f-bag-grad)" strokeWidth="2"/>
              <path d="M18 16C18 10 20 5 25 5C30 5 32 10 32 16" stroke="url(#f-bag-grad)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <rect x="12" y="46" width="26" height="7" rx="2" fill="url(#f-bag-grad)" opacity="0.85"/>
              <line x1="18" y1="50" x2="32" y2="50" stroke="white" strokeWidth="1" opacity="0.8"/>
            </svg>
          ),
        },
        {
          value: "tag-pendant", label: "Price Tag",
          preview: (
            <svg width="46" height="62" viewBox="0 0 46 62" fill="none">
              <defs>
                <linearGradient id="f-tag-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#059669"/>
                  <stop offset="100%" stopColor="#0891b2"/>
                </linearGradient>
              </defs>
              <circle cx="23" cy="7" r="5" stroke="url(#f-tag-grad)" strokeWidth="2" fill="none"/>
              <circle cx="23" cy="7" r="2" fill="#059669"/>
              <rect x="3" y="11" width="40" height="48" rx="6" fill="white" stroke="url(#f-tag-grad)" strokeWidth="2"/>
              <line x1="23" y1="7" x2="23" y2="11" stroke="url(#f-tag-grad)" strokeWidth="2"/>
              <rect x="6" y="50" width="34" height="7" rx="3" fill="url(#f-tag-grad)"/>
            </svg>
          ),
        },
        {
          value: "ticket-coupon", label: "Coupon",
          preview: (
            <svg width="62" height="44" viewBox="0 0 62 44" fill="none">
              <defs>
                <linearGradient id="f-ticket-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316"/>
                  <stop offset="100%" stopColor="#eab308"/>
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="56" height="38" rx="4" fill="white" stroke="url(#f-ticket-grad)" strokeWidth="2"/>
              <circle cx="3" cy="22" r="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
              <circle cx="59" cy="22" r="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
              <line x1="31" y1="3" x2="31" y2="41" stroke="#fed7aa" strokeWidth="1.5" strokeDasharray="3 3"/>
              <rect x="8" y="32" width="20" height="7" rx="2" fill="url(#f-ticket-grad)" opacity="0.8"/>
              <rect x="34" y="32" width="20" height="7" rx="2" fill="url(#f-ticket-grad)" opacity="0.8"/>
            </svg>
          ),
        },
        {
          value: "gift-box", label: "Gift Box",
          preview: (
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
              <defs>
                <linearGradient id="f-gift-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444"/>
                  <stop offset="100%" stopColor="#f97316"/>
                </linearGradient>
              </defs>
              <rect x="4" y="16" width="44" height="40" rx="3" fill="white" stroke="url(#f-gift-grad)" strokeWidth="2"/>
              <rect x="4" y="8" width="44" height="10" rx="2" fill="url(#f-gift-grad)" opacity="0.9"/>
              <path d="M26 8C26 8 20 2 16 4C13 6 15 8 26 8" fill="#ef4444"/>
              <path d="M26 8C26 8 32 2 36 4C39 6 37 8 26 8" fill="#f97316"/>
              <line x1="26" y1="8" x2="26" y2="56" stroke="url(#f-gift-grad)" strokeWidth="2"/>
              <rect x="6" y="50" width="40" height="6" rx="2" fill="url(#f-gift-grad)" opacity="0.8"/>
            </svg>
          ),
        },
      ],
    },
    {
      category: "Borders & Shapes",
      frames: [
        {
          value: "circular-ring", label: "Ring",
          preview: (
            <svg width="56" height="64" viewBox="0 0 56 64" fill="none">
              <defs>
                <linearGradient id="f-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="50%" stopColor="#ec4899"/>
                  <stop offset="100%" stopColor="#2563eb"/>
                </linearGradient>
              </defs>
              <circle cx="28" cy="26" r="23" stroke="url(#f-ring-grad)" strokeWidth="4" fill="none"/>
              <circle cx="28" cy="26" r="17" stroke="url(#f-ring-grad)" strokeWidth="1.5" fill="none" opacity="0.5"/>
              <rect x="10" y="52" width="36" height="8" rx="3" fill="url(#f-ring-grad)"/>
            </svg>
          ),
        },
        {
          value: "dashed-border", label: "Dashed",
          preview: (
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
              <defs>
                <linearGradient id="f-dash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0891b2"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="46" height="46" rx="4" stroke="url(#f-dash-grad)" strokeWidth="3" strokeDasharray="5 4"/>
              <rect x="10" y="10" width="32" height="32" rx="2" fill="#cffafe" opacity="0.3"/>
              <rect x="4" y="51" width="44" height="7" rx="3" fill="url(#f-dash-grad)"/>
            </svg>
          ),
        },
        {
          value: "double-border", label: "Double",
          preview: (
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
              <defs>
                <linearGradient id="f-double-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b"/>
                  <stop offset="100%" stopColor="#475569"/>
                </linearGradient>
              </defs>
              <rect x="2" y="2" width="48" height="48" rx="3" stroke="url(#f-double-grad)" strokeWidth="3"/>
              <rect x="8" y="8" width="36" height="36" rx="2" stroke="url(#f-double-grad)" strokeWidth="1.5"/>
              <rect x="3" y="52" width="46" height="6" rx="2" fill="url(#f-double-grad)"/>
            </svg>
          ),
        },
        {
          value: "heart-love", label: "Heart",
          preview: (
            <svg width="54" height="60" viewBox="0 0 54 60" fill="none">
              <defs>
                <linearGradient id="f-heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e"/>
                  <stop offset="100%" stopColor="#ec4899"/>
                </linearGradient>
              </defs>
              <path d="M27 46C27 46 4 32 4 18C4 9 10 5 17 7C21 8 25 11 27 15C29 11 33 8 37 7C44 5 50 9 50 18C50 32 27 46 27 46Z" stroke="url(#f-heart-grad)" strokeWidth="2.5" fill="none"/>
              <path d="M27 46C27 46 4 32 4 18C4 9 10 5 17 7C21 8 25 11 27 15C29 11 33 8 37 7C44 5 50 9 50 18C50 32 27 46 27 46Z" fill="url(#f-heart-grad)" opacity="0.12"/>
              <rect x="8" y="52" width="38" height="6" rx="2" fill="url(#f-heart-grad)"/>
            </svg>
          ),
        },
        {
          value: "star-sparkle", label: "Star",
          preview: (
            <svg width="54" height="62" viewBox="0 0 54 62" fill="none">
              <defs>
                <linearGradient id="f-star-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b"/>
                  <stop offset="100%" stopColor="#f97316"/>
                </linearGradient>
              </defs>
              <path d="M27 3L32 18H48L35 28L40 43L27 33L14 43L19 28L6 18H22Z" stroke="url(#f-star-grad)" strokeWidth="2" fill="none"/>
              <path d="M27 3L32 18H48L35 28L40 43L27 33L14 43L19 28L6 18H22Z" fill="url(#f-star-grad)" opacity="0.15"/>
              <path d="M5 5Q5 5 5 8Q5 5 8 5Q5 5 5 2Q5 5 2 5Z" fill="#f59e0b"/>
              <path d="M49 5Q49 5 49 8Q49 5 52 5Q49 5 49 2Q49 5 46 5Z" fill="#f59e0b"/>
              <rect x="7" y="54" width="40" height="6" rx="2" fill="url(#f-star-grad)"/>
            </svg>
          ),
        },
      ],
    },
    {
      category: "Thematic",
      frames: [
        {
          value: "book-cover", label: "Book",
          preview: (
            <svg width="48" height="60" viewBox="0 0 48 60" fill="none">
              <defs>
                <linearGradient id="f-book-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#4c1d95"/>
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="42" height="54" rx="3" fill="url(#f-book-grad)"/>
              <rect x="10" y="3" width="35" height="54" rx="2" fill="white" stroke="#e2e8f0" strokeWidth="1"/>
              <rect x="3" y="3" width="8" height="54" rx="2" fill="url(#f-book-grad)"/>
              <line x1="3" y1="12" x2="11" y2="12" stroke="#a78bfa" strokeWidth="1" opacity="0.5"/>
              <line x1="3" y1="26" x2="11" y2="26" stroke="#a78bfa" strokeWidth="1" opacity="0.5"/>
              <line x1="3" y1="40" x2="11" y2="40" stroke="#a78bfa" strokeWidth="1" opacity="0.5"/>
              <rect x="14" y="48" width="28" height="6" rx="2" fill="url(#f-book-grad)" opacity="0.8"/>
            </svg>
          ),
        },
        {
          value: "coffee-cup", label: "Mug",
          preview: (
            <svg width="54" height="60" viewBox="0 0 54 60" fill="none">
              <defs>
                <linearGradient id="f-mug-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#78350f"/>
                  <stop offset="100%" stopColor="#92400e"/>
                </linearGradient>
              </defs>
              <path d="M8 6H40L36 52H12Z" fill="#fef3c7" stroke="url(#f-mug-grad)" strokeWidth="2"/>
              <path d="M40 16C40 16 50 16 50 26C50 36 40 36 40 36" stroke="url(#f-mug-grad)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <rect x="10" y="44" width="28" height="7" rx="2" fill="url(#f-mug-grad)" opacity="0.85"/>
              <path d="M17 3C17 3 17 0 19 3C19 6 17 9 19 12" stroke="#94a3b8" strokeWidth="1" fill="none" strokeLinecap="round"/>
              <path d="M24 2C24 2 24 -1 26 2C26 5 24 8 26 11" stroke="#94a3b8" strokeWidth="1" fill="none" strokeLinecap="round"/>
            </svg>
          ),
        },
        {
          value: "envelope-mail", label: "Envelope",
          preview: (
            <svg width="58" height="50" viewBox="0 0 58 50" fill="none">
              <defs>
                <linearGradient id="f-env-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb"/>
                  <stop offset="100%" stopColor="#0891b2"/>
                </linearGradient>
              </defs>
              <rect x="3" y="8" width="52" height="38" rx="4" fill="white" stroke="url(#f-env-grad)" strokeWidth="2"/>
              <path d="M3 10L29 26L55 10" stroke="url(#f-env-grad)" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <rect x="6" y="40" width="46" height="5" rx="2" fill="url(#f-env-grad)" opacity="0.8"/>
            </svg>
          ),
        },
        {
          value: "shield-badge", label: "Shield",
          preview: (
            <svg width="52" height="62" viewBox="0 0 52 62" fill="none">
              <defs>
                <linearGradient id="f-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#059669"/>
                  <stop offset="100%" stopColor="#0891b2"/>
                </linearGradient>
              </defs>
              <path d="M26 3L4 11V28C4 44 26 56 26 56C26 56 48 44 48 28V11Z" fill="white" stroke="url(#f-shield-grad)" strokeWidth="2.5"/>
              <path d="M26 3L4 11V28C4 44 26 56 26 56C26 56 48 44 48 28V11Z" fill="url(#f-shield-grad)" opacity="0.1"/>
              <rect x="8" y="54" width="36" height="6" rx="2" fill="url(#f-shield-grad)"/>
            </svg>
          ),
        },
      ],
    },
    {
      category: "Tech & Gaming",
      frames: [
        {
          value: "circuit-board", label: "Circuit",
          preview: (
            <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
              <defs>
                <linearGradient id="f-circuit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#059669"/>
                  <stop offset="100%" stopColor="#047857"/>
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="46" height="46" rx="2" stroke="url(#f-circuit-grad)" strokeWidth="3"/>
              <rect x="9" y="9" width="34" height="34" rx="1" stroke="#059669" strokeWidth="1" opacity="0.4"/>
              <line x1="3" y1="15" x2="16" y2="15" stroke="#059669" strokeWidth="2"/>
              <line x1="3" y1="27" x2="12" y2="27" stroke="#059669" strokeWidth="2"/>
              <line x1="49" y1="15" x2="36" y2="15" stroke="#059669" strokeWidth="2"/>
              <line x1="49" y1="27" x2="38" y2="27" stroke="#059669" strokeWidth="2"/>
              <line x1="15" y1="3" x2="15" y2="14" stroke="#059669" strokeWidth="2"/>
              <line x1="27" y1="3" x2="27" y2="12" stroke="#059669" strokeWidth="2"/>
              <circle cx="16" cy="15" r="3" fill="#059669"/>
              <circle cx="12" cy="27" r="3" fill="#059669"/>
              <circle cx="36" cy="15" r="3" fill="#059669"/>
              <circle cx="38" cy="27" r="3" fill="#059669"/>
              <circle cx="15" cy="14" r="3" fill="#059669"/>
              <circle cx="27" cy="12" r="3" fill="#059669"/>
              <rect x="4" y="51" width="44" height="7" rx="1" fill="url(#f-circuit-grad)"/>
              <line x1="12" y1="55" x2="40" y2="55" stroke="#00ff88" strokeWidth="1.5" opacity="0.8"/>
            </svg>
          ),
        },
        {
          value: "trophy", label: "Trophy",
          preview: (
            <svg width="52" height="64" viewBox="0 0 52 64" fill="none">
              <defs>
                <linearGradient id="f-trophy-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24"/>
                  <stop offset="50%" stopColor="#d97706"/>
                  <stop offset="100%" stopColor="#fbbf24"/>
                </linearGradient>
              </defs>
              <rect x="3" y="3" width="46" height="50" rx="6" stroke="url(#f-trophy-ring)" strokeWidth="5"/>
              <rect x="11" y="11" width="30" height="30" rx="3" stroke="#fef3c7" strokeWidth="2"/>
              <path d="M12 12L14 15H17L15 17L16 20L12 18L8 20L9 17L7 15H10Z" fill="#fbbf24"/>
              <path d="M40 12L42 15H45L43 17L44 20L40 18L36 20L37 17L35 15H38Z" fill="#fbbf24"/>
              <rect x="19" y="4" width="14" height="8" rx="2" fill="url(#f-trophy-ring)"/>
              <path d="M21 6H31L30 10H22Z" fill="#fbbf24"/>
              <rect x="4" y="56" width="44" height="6" rx="3" fill="url(#f-trophy-ring)"/>
              <line x1="12" y1="59" x2="40" y2="59" stroke="#fef3c7" strokeWidth="1.2" opacity="0.8"/>
            </svg>
          ),
        },
      ],
    },
  ];

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
    diamond: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L22 12L12 22L2 12Z" />
      </svg>
    ),
    star: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L15 9H22L17 14L19 21L12 17L5 21L7 14L2 9H9Z" />
      </svg>
    ),
    lines: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="2" width="6" height="20" rx="1" />
        <rect x="14" y="2" width="6" height="20" rx="1" />
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
    outlineLeaf: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M12 2C6 2 2 6 2 12C2 18 6 22 12 22C18 22 22 18 22 12C22 6 18 2 12 2Z" />
        <path d="M2 12C2 6 12 2 12 2" />
        <path d="M12 22C12 22 22 18 22 12" />
      </svg>
    ),
    outlineShield: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    outlineFlower: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
        <rect x="4" y="4" width="16" height="16" rx="3" />
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

  const contentStatus = 
    contentType === "url" ? "Link" :
    contentType === "text" ? "Text" :
    contentType === "email" ? "Email" :
    contentType === "phone" ? "Phone" :
    contentType === "wifi" ? "WiFi" :
    contentType === "vcard" ? "Contact" :
    contentType === "pdf" ? "PDF File" :
    contentType === "audio" ? "Audio" : "";

  const shapesStatus = `${customStyle.moduleType.charAt(0).toUpperCase() + customStyle.moduleType.slice(1)}`;

  const colorsStatus = customStyle.isTransparent 
    ? "Transparent" 
    : customStyle.fgStyle === "solid" 
      ? settings.fgColor.toUpperCase() 
      : "Gradient";

  const logoStatus = logoPreview && bgImagePreview 
    ? "Logo + Wallpaper" 
    : logoPreview 
      ? "Logo Active" 
      : bgImagePreview 
        ? "Wallpaper Active" 
        : "None";

  const frameStatus = customStyle.frameStyle === "none" 
    ? "No Frame" 
    : "Frame Active";

  return (
    <>
      {/* ── Mobile Floating QR Preview ── */}
      {isMobileView && (
        <div className={`qr-float-preview ${mobilePreviewOpen ? "qr-float-preview--open" : ""}`}>
          {/* Always hidden canvas for generating — stays in DOM */}
          <canvas
            ref={canvasRef}
            style={{ display: "none" }}
            aria-hidden="true"
          />

          {/* Collapsed: small floating button */}
          {!mobilePreviewOpen && (
            <button
              className="qr-float-thumb"
              onClick={() => setMobilePreviewOpen(true)}
              title="View QR Preview"
              aria-label="Open QR Preview"
            >
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Preview" className="qr-float-img" />
              ) : (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.6">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/>
                  <rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/>
                </svg>
              )}
              {isGenerating && <div className="qr-float-spinner" />}
            </button>
          )}

          {/* Expanded: full preview panel */}
          {mobilePreviewOpen && (
            <div 
              className={`qr-float-panel ${isDragging ? "is-dragging" : ""}`} 
              style={{ width: `${previewWidth}px` }}
            >
              {/* Resize handle in the top-left corner */}
              <div 
                className="qr-float-resize-handle" 
                onMouseDown={handleResizeStart} 
                onTouchStart={handleResizeStart}
                title="Drag to resize"
              />

              <div className="qr-float-panel-header">
                <span className="qr-float-panel-title" style={{ paddingLeft: "14px" }}>QR Preview</span>
                <div className="qr-float-size-control">
                  <button
                    type="button"
                    className={`size-btn ${previewWidth === 170 ? "active" : ""}`}
                    onClick={() => { setPreviewScale("sm"); setPreviewWidth(170); }}
                    title="Small Size"
                  >
                    S
                  </button>
                  <button
                    type="button"
                    className={`size-btn ${previewWidth === 220 ? "active" : ""}`}
                    onClick={() => { setPreviewScale("md"); setPreviewWidth(220); }}
                    title="Medium Size"
                  >
                    M
                  </button>
                  <button
                    type="button"
                    className={`size-btn ${previewWidth === 270 ? "active" : ""}`}
                    onClick={() => { setPreviewScale("lg"); setPreviewWidth(270); }}
                    title="Large Size"
                  >
                    L
                  </button>
                </div>
                <button
                  type="button"
                  className="qr-float-close"
                  onClick={() => setMobilePreviewOpen(false)}
                  title="Minimize Preview"
                  aria-label="Minimize preview"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
              <div style={{ padding: "12px" }}>
                <div className={`qr-canvas-wrapper ${customStyle.isTransparent ? "checkerboard-bg" : ""}`} style={{ minHeight: "auto", aspectRatio: "1/1", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  {isGenerating && (
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
                      <div className="spinner" />
                    </div>
                  )}
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "var(--radius-sm)" }} />
                  ) : (
                    <div className="qr-empty-state">
                      <span className="qr-empty-text">Type to generate QR</span>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: "8px", position: "relative", width: "100%" }}>
                  {/* First row: Copy Button and PNG Button with quality dropdown */}
                  <div style={{ display: "flex", flexDirection: "row", gap: "8px", position: "relative", width: "100%" }}>
                    
                    {/* Copy Button */}
                    <button
                      id="btn-qr-copy-mobile"
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        fontSize: "12px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px"
                      }}
                      disabled={!qrDataUrl}
                      onClick={handleCopyPNG}
                    >
                      <Copy size={13} />
                      <span>Copy</span>
                    </button>

                    {/* PNG split dropdown button */}
                    <div style={{ display: "flex", flex: 1, position: "relative" }}>
                      <button 
                        id="btn-qr-dl-png-mobile"
                        className="btn btn-primary" 
                        style={{ 
                          flex: 1, 
                          padding: "6px 8px", 
                          fontSize: "12px", 
                          height: "32px", 
                          borderTopRightRadius: 0, 
                          borderBottomRightRadius: 0,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }} 
                        disabled={!qrDataUrl} 
                        onClick={handleDownloadPNG}
                      >
                        PNG
                      </button>
                      <button
                        id="btn-qr-dl-toggle-mobile"
                        type="button"
                        className="btn btn-primary"
                        style={{
                          padding: "0 8px",
                          height: "32px",
                          borderTopLeftRadius: 0,
                          borderBottomLeftRadius: 0,
                          borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
                          flexShrink: 0
                        }}
                        disabled={!qrDataUrl}
                        onClick={() => setIsMobileQualityOpen(!isMobileQualityOpen)}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      {isMobileQualityOpen && (
                        <div
                          className="custom-dropdown-menu"
                          style={{
                            position: "absolute",
                            bottom: "calc(100% + 6px)",
                            top: "auto",
                            right: 0,
                            zIndex: 1000,
                            width: "160px",
                            background: "var(--bg-card)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "var(--radius-md)",
                            padding: "4px",
                            boxShadow: "var(--shadow-lg)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          <div style={{ fontSize: "9px", fontWeight: 700, color: "var(--text-tertiary)", padding: "4px 8px", textTransform: "uppercase" }}>PNG Quality</div>
                          {PNG_SIZES.map((size) => (
                            <button
                              key={size}
                              type="button"
                              className={`custom-dropdown-item ${customStyle.downloadSize === size ? "selected" : ""}`}
                              style={{
                                padding: "6px 8px",
                                fontSize: "11px",
                                textAlign: "left",
                                width: "100%",
                                background: customStyle.downloadSize === size ? "var(--bg-elevated)" : "transparent",
                                color: "var(--text-primary)",
                                border: "none",
                                borderRadius: "var(--radius-sm)",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                              }}
                              onClick={() => handleQualitySelect(size, true)}
                            >
                              <span>{size} x {size} px</span>
                              {size === 2048 && <span style={{ fontSize: "8px", background: "var(--accent-blue-muted)", color: "var(--accent-blue)", padding: "1px 4px", borderRadius: "3px" }}>Pro</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Second row: SVG Download Button and Share Button */}
                  <div style={{ display: "flex", flexDirection: "row", gap: "8px", width: "100%" }}>
                    <button
                      id="btn-qr-dl-svg-mobile"
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        fontSize: "12px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px"
                      }}
                      disabled={!text.trim()}
                      onClick={handleDownloadSVG}
                    >
                      <Download size={13} />
                      <span>SVG</span>
                    </button>
                    <button
                      id="btn-qr-share-mobile"
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        padding: "6px 8px",
                        fontSize: "12px",
                        height: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "4px"
                      }}
                      disabled={!qrDataUrl}
                      onClick={handleShareQR}
                    >
                      <Share2 size={13} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Main Generator Grid ── */}
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
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {currentRole === "anon" && "Anonymous limit reached. Sign in for more QR codes!"}
              {currentRole === "free" && `Daily generation limit reached for Free users (${limitMax} per day). Upgrade to PRO!`}
              {currentRole === "pro" && `Daily generation limit reached for PRO users (${limitMax} per day).`}
            </span>
            {currentRole === "anon" && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={onLoginClick}
                style={{ height: "26px", fontSize: "11px", padding: "0 10px" }}
              >
                Sign In
              </button>
            )}
            {currentRole === "free" && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleUpgradeToProDirectly}
                style={{ height: "26px", fontSize: "11px", padding: "0 10px", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", border: "none" }}
              >
                Upgrade to PRO
              </button>
            )}
          </div>
        )}

        {/* Accordion Section 1: Content Input */}
        <div className={`collapsible-section ${openSection === "content" ? "is-open" : ""}`}>
          <button
            className={`collapsible-trigger ${openSection === "content" ? "expanded" : ""}`}
            onClick={() => toggleSection("content")}
          >
            <div className="collapsible-trigger-left">
              <div className="section-icon-badge section-badge-content">
                <Layers size={18} />
                <span className="badge-number">1</span>
              </div>
              <div className="section-text-block">
                <div className="collapsible-trigger-title-row">
                  <span className="collapsible-trigger-title">1. Content & Formats</span>
                  <span className={`section-status-chip ${openSection === "content" ? "chip-active" : "chip-default"}`}>
                    {contentStatus}
                  </span>
                </div>
                <span className="collapsible-trigger-desc">Choose your input type (URL, WiFi, Contact) or upload PDF/Audio documents to auto-host online.</span>
              </div>
            </div>
            <svg className="collapsible-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {openSection === "content" && (
            <div className="collapsible-content" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              {/* Content Formats Selector Grid */}
              <div>
                <label className="form-label">Select QR Format Type</label>
                <div className="format-switcher-grid">
                  {[
                    { id: "url", label: "Link", icon: <LinkIcon size={20} /> },
                    { id: "text", label: "Text", icon: <FileText size={20} /> },
                    { id: "email", label: "Email", icon: <Mail size={20} /> },
                    { id: "phone", label: "Phone", icon: <PhoneIcon size={20} /> },
                    { id: "wifi", label: "WiFi", icon: <WifiIcon size={20} /> },
                    { id: "vcard", label: "Contact", icon: <UserIcon size={20} /> },
                    { id: "pdf", label: "PDF File", icon: <FileIcon size={20} /> },
                    { id: "audio", label: "Audio", icon: <Music size={20} /> },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`format-switcher-btn ${contentType === item.id ? "active" : ""}`}
                      onClick={() => setContentType(item.id as any)}
                    >
                      <span className="format-switcher-icon">{item.icon}</span>
                      <span className="format-switcher-label">{item.label}</span>
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
                    <div className="responsive-grid-2" style={{ gap: 10 }}>
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
                    <div className="responsive-grid-2" style={{ gap: 10 }}>
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
                    <div className="responsive-grid-2" style={{ gap: 10 }}>
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
                      <div style={{ marginTop: 12, fontSize: 12, color: "var(--accent-green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                        Active: {pdfName || "Document uploaded successfully"}
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
                      <div style={{ marginTop: 12, fontSize: 12, color: "var(--accent-green)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                        Active: {audioName || "Audio track uploaded successfully"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Accordion Section 2: Pattern & Shapes */}
        <div className={`collapsible-section ${openSection === "shapes" ? "is-open" : ""}`}>
          <button
            className={`collapsible-trigger ${openSection === "shapes" ? "expanded" : ""}`}
            onClick={() => toggleSection("shapes")}
          >
            <div className="collapsible-trigger-left">
              <div className="section-icon-badge section-badge-shapes">
                <Shapes size={18} />
                <span className="badge-number">2</span>
              </div>
              <div className="section-text-block">
                <div className="collapsible-trigger-title-row">
                  <span className="collapsible-trigger-title">2. Pattern &amp; Shapes</span>
                  <span className={`section-status-chip ${openSection === "shapes" ? "chip-active" : "chip-default"}`}>
                    {shapesStatus}
                  </span>
                </div>
                <span className="collapsible-trigger-desc">Pick QR module shape, outer finder frame, and inner eye dot from visual previews.</span>
              </div>
            </div>
            <svg className="collapsible-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {openSection === "shapes" && (
            <div className="collapsible-content" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Module Shape Tiles */}
              <div className="shape-picker-section">
                <div className="section-sub-header">
                  <span className="section-sub-title">Module Body Style</span>
                  <div className="section-sub-line" />
                </div>
                <div className="shape-picker-grid">
                  {moduleShapes.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      className={`shape-tile ${customStyle.moduleType === s.value ? "selected" : ""}`}
                      onClick={() => setCustomStyle((p) => ({ ...p, moduleType: s.value }))}
                      title={s.label}
                    >
                      <div className="shape-tile-preview">{s.preview}</div>
                      <span className="shape-tile-label">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Outer Corner Tiles */}
              <div className="shape-picker-section">
                <div className="section-sub-header">
                  <span className="section-sub-title">Outer Finder Frame</span>
                  <div className="section-sub-line" />
                </div>
                <div className="shape-picker-grid">
                  {outerShapes.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      className={`shape-tile ${customStyle.cornerOuter === s.value ? "selected" : ""}`}
                      onClick={() => setCustomStyle((p) => ({ ...p, cornerOuter: s.value }))}
                      title={s.label}
                    >
                      <div className="shape-tile-preview">{s.preview}</div>
                      <span className="shape-tile-label">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inner Eye Dot Tiles */}
              <div className="shape-picker-section">
                <div className="section-sub-header">
                  <span className="section-sub-title">Inner Eye Dot</span>
                  <div className="section-sub-line" />
                </div>
                <div className="shape-picker-grid">
                  {innerDots.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      className={`shape-tile ${customStyle.cornerInner === s.value ? "selected" : ""}`}
                      onClick={() => setCustomStyle((p) => ({ ...p, cornerInner: s.value }))}
                      title={s.label}
                    >
                      <div className="shape-tile-preview">{s.preview}</div>
                      <span className="shape-tile-label">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Accordion Section 3: Colors & Transparency */}
        <div className={`collapsible-section ${openSection === "colors" ? "is-open" : ""}`}>
          <button
            className={`collapsible-trigger ${openSection === "colors" ? "expanded" : ""}`}
            onClick={() => toggleSection("colors")}
          >
            <div className="collapsible-trigger-left">
              <div className="section-icon-badge section-badge-colors">
                <Palette size={18} />
                <span className="badge-number">3</span>
              </div>
              <div className="section-text-block">
                <div className="collapsible-trigger-title-row">
                  <span className="collapsible-trigger-title">3. Colors & Transparency</span>
                  <span className={`section-status-chip ${openSection === "colors" ? "chip-active" : "chip-default"}`}>
                    {colorsStatus}
                  </span>
                </div>
                <span className="collapsible-trigger-desc">Set solid colors, linear/radial gradients, custom background colors, or enable alpha transparency.</span>
              </div>
            </div>
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
                /* Solid Color Input with Presets */
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="fg-color">QR Foreground Color</label>
                    <div className="color-presets-row">
                      {colorPresets.map((c) => (
                        <button
                          key={c}
                          type="button"
                          className={`color-preset-swatch${settings.fgColor === c ? " active-swatch" : ""}`}
                          style={{ background: c }}
                          onClick={() => handleColorPreset(c)}
                          title={c}
                        />
                      ))}
                    </div>
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
                      <button
                        type="button"
                        className="color-swap-btn"
                        onClick={handleSwapColors}
                        title="Swap FG / BG colors"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Gradient Color Inputs */
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="responsive-grid-2">
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

                  <div className="responsive-grid-2">
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

              {/* QR Border Styling sub-section */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
                <div className="section-sub-header" style={{ marginBottom: 6 }}>
                  <span className="section-sub-title">QR Code Border Outline</span>
                  <div className="section-sub-line" />
                </div>
                
                <CustomDropdown
                  label="QR Border Type"
                  value={customStyle.qrBorderType}
                  onChange={(val) => setCustomStyle((p) => ({ ...p, qrBorderType: val }))}
                  direction="up"
                  options={[
                    { value: "none", label: "No Border", description: "Default layout, no outer boundary outline wraps the QR matrix." },
                    { value: "solid", label: "Solid Border", description: "Wraps the QR code in a clean, solid color outline." },
                    { value: "dashed", label: "Dashed Border", description: "Outline with dash segments." },
                    { value: "dotted", label: "Dotted Border", description: "Outline composed of dotted elements." },
                    { value: "double", label: "Double Border", description: "Elegant double-ring outline wrapping the QR." },
                  ]}
                />

                {customStyle.qrBorderType !== "none" && (
                  <>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Border Outline Color</label>
                      <div className="color-picker-row">
                        <input
                          type="color"
                          className="color-swatch-input"
                          value={customStyle.qrBorderColor}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, qrBorderColor: e.target.value }))}
                        />
                        <input
                          type="text"
                          className="form-input color-hex-input"
                          value={customStyle.qrBorderColor}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, qrBorderColor: e.target.value }))}
                          maxLength={7}
                        />
                      </div>
                    </div>

                    <div className="responsive-grid-2">
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Border Thickness ({customStyle.qrBorderSize}px)</label>
                        <div className="slider-row">
                          <input
                            type="range"
                            className="form-slider"
                            min={2}
                            max={20}
                            step={1}
                            value={customStyle.qrBorderSize}
                            onChange={(e) => setCustomStyle((p) => ({ ...p, qrBorderSize: Number(e.target.value) }))}
                          />
                          <span className="slider-value">{customStyle.qrBorderSize}px</span>
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Border Corner Radius ({customStyle.qrBorderRadius}px)</label>
                        <div className="slider-row">
                          <input
                            type="range"
                            className="form-slider"
                            min={0}
                            max={40}
                            step={2}
                            value={customStyle.qrBorderRadius}
                            onChange={(e) => setCustomStyle((p) => ({ ...p, qrBorderRadius: Number(e.target.value) }))}
                          />
                          <span className="slider-value">{customStyle.qrBorderRadius}px</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Accordion Section 4: Logo & Background Images */}
        <div className={`collapsible-section ${openSection === "logo" ? "is-open" : ""}`}>
          <button
            className={`collapsible-trigger ${openSection === "logo" ? "expanded" : ""}`}
            onClick={() => toggleSection("logo")}
          >
            <div className="collapsible-trigger-left">
              <div className="section-icon-badge section-badge-logo">
                <ImageIcon size={18} />
                <span className="badge-number">4</span>
              </div>
              <div className="section-text-block">
                <div className="collapsible-trigger-title-row">
                  <span className="collapsible-trigger-title">4. Logo & Background Images</span>
                  <span className={`section-status-chip ${openSection === "logo" ? "chip-active" : "chip-default"}`}>
                    {logoStatus}
                  </span>
                </div>
                <span className="collapsible-trigger-desc">Embed center branding logos with safe margins, or upload custom background wallpaper images.</span>
              </div>
            </div>
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
                      <label className="form-label">Logo Corner Radius ({customStyle.logoRadius ?? 8}px)</label>
                      <div className="slider-row">
                        <input
                          type="range"
                          className="form-slider"
                          min={0}
                          max={24}
                          step={1}
                          value={customStyle.logoRadius ?? 8}
                          onChange={(e) => setCustomStyle((p) => ({ ...p, logoRadius: Number(e.target.value) }))}
                        />
                        <span className="slider-value">{customStyle.logoRadius ?? 8}px</span>
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

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Background Image Corner Radius ({customStyle.bgImageRadius ?? 0}px)</label>
                        <div className="slider-row">
                          <input
                            type="range"
                            className="form-slider"
                            min={0}
                            max={40}
                            step={1}
                            value={customStyle.bgImageRadius ?? 0}
                            onChange={(e) => setCustomStyle((p) => ({ ...p, bgImageRadius: Number(e.target.value) }))}
                          />
                          <span className="slider-value">{customStyle.bgImageRadius ?? 0}px</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

        {/* Accordion Section 5: Frames, Labels & Layout */}
        <div className={`collapsible-section ${openSection === "frame" ? "is-open" : ""}`}>
          <button
            className={`collapsible-trigger ${openSection === "frame" ? "expanded" : ""}`}
            onClick={() => toggleSection("frame")}
          >
            <div className="collapsible-trigger-left">
              <div className="section-icon-badge section-badge-frames">
                <Frame size={18} />
                <span className="badge-number">5</span>
              </div>
              <div className="section-text-block">
                <div className="collapsible-trigger-title-row">
                  <span className="collapsible-trigger-title">5. Frames, Labels &amp; Layout</span>
                  <span className={`section-status-chip ${openSection === "frame" ? "chip-active" : "chip-default"}`}>
                    {frameStatus}
                  </span>
                </div>
                <span className="collapsible-trigger-desc">Wrap your QR code in 20+ design frame CTAs, adjust quiet zone margins, and configure high-res quality exports.</span>
              </div>
            </div>
            <svg className="collapsible-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {openSection === "frame" && (
            <div className="collapsible-content" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              
              {/* Visual Frame Tile Picker */}
              <div className="frame-picker-outer">
                <label className="form-label">Select Frame Style</label>
                <div className="frame-picker-scroll">
                  {frameCategories.map((cat) => (
                    <div key={cat.category}>
                      <div className="frame-category-header">{cat.category}</div>
                      <div className="frame-picker-grid">
                        {cat.frames.map((f) => (
                          <button
                            key={f.value}
                            type="button"
                            className={`frame-tile ${customStyle.frameStyle === f.value ? "selected" : ""}`}
                            onClick={() => setCustomStyle((p) => ({ ...p, frameStyle: f.value }))}
                            title={f.label}
                          >
                            <div className="frame-tile-preview">{f.preview}</div>
                            <span className="frame-tile-label">{f.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
                    <div className="responsive-grid-2">
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

                    <div className="responsive-grid-2">
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
              <div className="responsive-grid-2" style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
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
      {!isMobileView && (
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
                  <div style={{ display: "flex", flex: 1, position: "relative" }}>
                    <button
                      id="btn-qr-dl-png"
                      className="btn btn-primary"
                      style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                      disabled={!qrDataUrl}
                      onClick={handleDownloadPNG}
                    >
                      Download PNG ({customStyle.downloadSize}px)
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{
                        padding: "0 10px",
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
                      }}
                      disabled={!qrDataUrl}
                      onClick={() => setIsDesktopQualityOpen(!isDesktopQualityOpen)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                    
                    {isDesktopQualityOpen && (
                      <div
                        className="custom-dropdown-menu"
                        style={{
                          position: "absolute",
                          bottom: "calc(100% + 6px)",
                          top: "auto",
                          right: 0,
                          zIndex: 1000,
                          width: "180px",
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius-md)",
                          padding: "4px",
                          boxShadow: "var(--shadow-lg)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        <div style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-tertiary)", padding: "6px 8px", textTransform: "uppercase" }}>PNG Quality</div>
                        {PNG_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            className={`custom-dropdown-item ${customStyle.downloadSize === size ? "selected" : ""}`}
                            style={{
                              padding: "6px 12px",
                              fontSize: "12px",
                              textAlign: "left",
                              width: "100%",
                              background: customStyle.downloadSize === size ? "var(--bg-elevated)" : "transparent",
                              color: "var(--text-primary)",
                              border: "none",
                              borderRadius: "var(--radius-sm)",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}
                            onClick={() => handleQualitySelect(size, false)}
                          >
                            <span>{size} x {size} px</span>
                            {size === 2048 && <span style={{ fontSize: "8px", background: "var(--accent-blue-muted)", color: "var(--accent-blue)", padding: "1px 4px", borderRadius: "3px" }}>Pro</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
                    id="btn-qr-share"
                    className="btn btn-secondary"
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                    disabled={!qrDataUrl}
                    onClick={handleShareQR}
                    title="Share QR Link & Image"
                  >
                    <Share2 size={14} />
                    <span>Share</span>
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

                {/* Content preview & copy text */}
                {text.trim() && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="copy-text-row" style={{ flex: 1 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.5 }}>
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                      </svg>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {text.length > 60 ? text.slice(0, 60) + "…" : text}
                      </span>
                    </div>
                    <button
                      id="btn-copy-text"
                      className="btn btn-ghost btn-sm"
                      onClick={handleCopyText}
                      data-tooltip="Copy Content"
                      style={{ flexShrink: 0, height: 36 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
