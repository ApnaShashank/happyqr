"use client";

import { useState, useCallback, useEffect } from "react";
import { QRHistoryEntry } from "@/types";

const STORAGE_KEY = "happyqr_history";
const MAX_HISTORY = 50;

function loadHistory(): QRHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((e: QRHistoryEntry) => ({
      ...e,
      createdAt: new Date(e.createdAt),
    }));
  } catch {
    return [];
  }
}

function saveHistory(history: QRHistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    /* ignore */
  }
}

export function useQRHistory() {
  const [history, setHistory] = useState<QRHistoryEntry[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    setIsMounted(true);
  }, []);

  const addToHistory = useCallback((entry: QRHistoryEntry) => {
    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const totalGenerated = isMounted ? history.length : 0;

  return { history, addToHistory, removeFromHistory, clearHistory, totalGenerated, isMounted };
}
