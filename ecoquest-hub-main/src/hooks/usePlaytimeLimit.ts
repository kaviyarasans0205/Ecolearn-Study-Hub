import { useEffect, useRef, useState, useCallback } from "react";

const DAILY_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 hours
const RESET_MS = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_KEY = "ecolearn_playtime";

interface PlaytimeData {
  usedMs: number;
  windowStart: number; // timestamp when current 24h window began
}

function readData(): PlaytimeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { usedMs: 0, windowStart: Date.now() };
    const parsed = JSON.parse(raw) as PlaytimeData;
    // Reset if window expired
    if (Date.now() - parsed.windowStart >= RESET_MS) {
      return { usedMs: 0, windowStart: Date.now() };
    }
    return parsed;
  } catch {
    return { usedMs: 0, windowStart: Date.now() };
  }
}

function writeData(d: PlaytimeData) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch { /* ignore */ }
}

/**
 * Tracks active time spent on the games page. Locks usage after 2 hours per
 * 24-hour rolling window. Counts time only while `active` is true.
 */
export function usePlaytimeLimit(active: boolean) {
  const [data, setData] = useState<PlaytimeData>(readData);
  const lastTickRef = useRef<number | null>(null);

  const remainingMs = Math.max(0, DAILY_LIMIT_MS - data.usedMs);
  const resetInMs = Math.max(0, RESET_MS - (Date.now() - data.windowStart));
  const isLocked = remainingMs <= 0;

  // Tick every second while active to accumulate playtime
  useEffect(() => {
    if (!active || isLocked) {
      lastTickRef.current = null;
      return;
    }
    lastTickRef.current = Date.now();
    const interval = setInterval(() => {
      setData(prev => {
        // Window expired? reset.
        if (Date.now() - prev.windowStart >= RESET_MS) {
          const fresh = { usedMs: 0, windowStart: Date.now() };
          writeData(fresh);
          lastTickRef.current = Date.now();
          return fresh;
        }
        const now = Date.now();
        const delta = lastTickRef.current ? now - lastTickRef.current : 1000;
        lastTickRef.current = now;
        const next = { ...prev, usedMs: Math.min(DAILY_LIMIT_MS, prev.usedMs + delta) };
        writeData(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [active, isLocked]);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setData(readData());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const reset = useCallback(() => {
    const fresh = { usedMs: 0, windowStart: Date.now() };
    writeData(fresh);
    setData(fresh);
  }, []);

  return { remainingMs, resetInMs, isLocked, usedMs: data.usedMs, reset, DAILY_LIMIT_MS };
}

export function formatDuration(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
