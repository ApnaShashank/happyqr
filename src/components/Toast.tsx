"use client";

import { Toast } from "@/hooks/useToast";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface ToastContainerProps {
  toasts: Toast[];
}

const icons: Record<Toast["type"], React.ReactNode> = {
  success: <CheckCircle2 size={16} />,
  error: <AlertCircle size={16} />,
  info: <Info size={16} />,
};

export default function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          <span style={{ display: "flex", alignItems: "center" }}>{icons[toast.type]}</span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
