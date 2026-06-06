"use client";

import { ActiveTab } from "@/app/page";
import { QrCode, FileStack, Sparkles, History } from "lucide-react";

interface HeroProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  totalGenerated: number;
}

const tabs = [
  {
    id: "generate" as ActiveTab,
    label: "QR Generator",
    icon: <QrCode size={16} />,
  },
  {
    id: "bulk" as ActiveTab,
    label: "Bulk Generate",
    icon: <FileStack size={16} />,
  },
  {
    id: "poster" as ActiveTab,
    label: "Poster Art",
    icon: <Sparkles size={16} />,
  },
  {
    id: "history" as ActiveTab,
    label: "History",
    icon: <History size={16} />,
  },
];

const HEADER_CONTENT: Record<ActiveTab, { title: React.ReactNode; subtitle: string }> = {
  generate: {
    title: (
      <>
        Generate <span className="highlight">QR Codes</span>
        <br />That Actually Work
      </>
    ),
    subtitle: "Create customizable, high-quality QR codes with logo uploads, custom modules, text labels and corner designs.",
  },
  bulk: {
    title: (
      <>
        Bulk Generate <span className="highlight">QR Codes</span>
        <br />Instantly In Parallel
      </>
    ),
    subtitle: "Generate up to 100 QR codes simultaneously in seconds. Download all creations in a single click.",
  },
  poster: {
    title: (
      <>
        Generate <span className="highlight">AI QR Art</span>
        <br />In Premium Templates
      </>
    ),
    subtitle: "Turn URLs into scannable art posters using AI models and premium split-layout layouts. Max 2 per day.",
  },
  history: {
    title: (
      <>
        Local <span className="highlight">QR History</span>
        <br />Access Stored Codes
      </>
    ),
    subtitle: "Review, copy, or re-download up to 50 of your previously generated custom QR codes.",
  },
  admin: {
    title: (
      <>
        HappyQR <span className="highlight">Admin Panel</span>
        <br />System Administration
      </>
    ),
    subtitle: "Inspect real-time system metrics, modify anonymous/daily generation limits, and audit logs.",
  },
};

export default function Hero({ activeTab, setActiveTab, totalGenerated }: HeroProps) {
  const content = HEADER_CONTENT[activeTab] || HEADER_CONTENT.generate;

  return (
    <div className="hero">
      <h1 className="hero-title">{content.title}</h1>
      <p className="hero-subtitle">{content.subtitle}</p>

      <div className="tab-switcher">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {totalGenerated > 0 && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{totalGenerated}</span>
            <span className="stat-label">QRs Created Local</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">Cloud Live</span>
            <span className="stat-label">Audio & PDF Hosting</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">Print Ready</span>
            <span className="stat-label">SVG Vector & 300 DPI</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">Level H</span>
            <span className="stat-label">30% Damage Recovery</span>
          </div>
        </div>
      )}
    </div>
  );
}
