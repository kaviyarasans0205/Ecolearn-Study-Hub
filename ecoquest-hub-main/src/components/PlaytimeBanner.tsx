import { Clock, Lock } from "lucide-react";
import { formatDuration } from "@/hooks/usePlaytimeLimit";

interface Props {
  remainingMs: number;
  resetInMs: number;
  isLocked: boolean;
  dailyLimitMs: number;
  usedMs: number;
}

export function PlaytimeBanner({ remainingMs, resetInMs, isLocked, dailyLimitMs, usedMs }: Props) {
  const pct = Math.min(100, (usedMs / dailyLimitMs) * 100);
  return (
    <div className={`rounded-xl border-2 p-4 mb-6 ${isLocked ? "bg-destructive/5 border-destructive/40" : "bg-card border-border"}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          {isLocked ? <Lock className="w-4 h-4 text-destructive" /> : <Clock className="w-4 h-4 text-primary" />}
          <span className="font-display font-bold text-foreground">
            {isLocked ? "Daily limit reached" : `Time remaining: ${formatDuration(remainingMs)}`}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          Resets in {formatDuration(resetInMs)}
        </span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full transition-all ${isLocked ? "bg-destructive" : "bg-primary"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function LockedScreen({ resetInMs }: { resetInMs: number }) {
  return (
    <div className="max-w-xl mx-auto text-center bg-card rounded-2xl p-10 shadow-elevated border border-border">
      <div className="text-6xl mb-4">⏸️</div>
      <h2 className="text-2xl font-display font-black text-foreground">Take a break! 🌱</h2>
      <p className="mt-2 text-muted-foreground">
        You've played 2 hours of games today. Come back in <span className="font-bold text-primary">{formatDuration(resetInMs)}</span> to play more.
      </p>
      <p className="mt-4 text-xs text-muted-foreground">Healthy screen time helps you learn and grow better! 📚</p>
    </div>
  );
}
