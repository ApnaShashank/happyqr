"use client";

import { Toast } from "@/hooks/useToast";

interface ToastContainerProps {
  toasts: Toast[];
}

const icons: Record<Toast["type"], string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export default function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{icons[toast.type]}</span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
