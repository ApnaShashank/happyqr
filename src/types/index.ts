// Shared types for the QR app
export interface QRHistoryEntry {
  id: string;
  type: "url" | "text" | "bulk";
  content: string;
  dataUrl?: string;
  svgString?: string;
  settings: QRSettings;
  createdAt: Date;
  label?: string;
}

export interface QRSettings {
  fgColor: string;
  bgColor: string;
  size: number;
  level: "L" | "M" | "Q" | "H";
  includeMargin: boolean;
  style: QRStyle;
  logoUrl?: string;
}

export type QRStyle = "squares" | "dots" | "rounded";

export interface LinkToQRData {
  url: string;
  title?: string;
  description?: string;
  shortUrl?: string;
}
