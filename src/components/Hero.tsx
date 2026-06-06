"use client";

import { ActiveTab } from "@/app/page";

interface HeroProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  totalGenerated: number;
}

const tabs = [
  {
    id: "generate" as ActiveTab,
    label: "QR Generator",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        <path d="M14 14h.01M14 17h.01M17 14h.01M17 17h.01M17 20h.01M20 14h.01M20 17h.01M20 20h.01" />
      </svg>
    ),
  },

  {
    id: "bulk" as ActiveTab,
    label: "Bulk Generate",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
        <path d="M16 8H8M16 12H8M12 16H8" />
      </svg>
    ),
  },
  {
    id: "poster" as ActiveTab,
    label: "Poster Art",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    id: "history" as ActiveTab,
    label: "History",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
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
            <span className="stat-label">QRs Generated</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">PNG</span>
            <span className="stat-label">Download Format</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">SVG</span>
            <span className="stat-label">Vector Format</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">H</span>
            <span className="stat-label">Error Correction</span>
          </div>
        </div>
      )}
    </div>
  );
}
