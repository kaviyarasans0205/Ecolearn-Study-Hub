import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface Props { onFinish: (score: number, total: number) => void; }

const COLORS = [
  { id: 0, bg: "bg-primary", glow: "bg-primary/60" },
  { id: 1, bg: "bg-accent", glow: "bg-accent/60" },
  { id: 2, bg: "bg-secondary", glow: "bg-secondary/60" },
  { id: 3, bg: "bg-destructive", glow: "bg-destructive/60" },
];
const TOTAL_ROUNDS = 10;

export default function SimonSaysGame({ onFinish }: Props) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userIdx, setUserIdx] = useState(0);
  const [showing, setShowing] = useState(false);
  const [activeBtn, setActiveBtn] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);

  const playSequence = useCallback(async (seq: number[]) => {
    setShowing(true);
    for (const n of seq) {
      await new Promise(r => setTimeout(r, 400));
      setActiveBtn(n);
      await new Promise(r => setTimeout(r, 500));
      setActiveBtn(null);
    }
    setShowing(false);
    setUserIdx(0);
  }, []);

  const nextRound = useCallback(() => {
    const next = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(next);
    setRound(r => r + 1);
    setTimeout(() => playSequence(next), 600);
  }, [sequence, playSequence]);

  useEffect(() => {
    if (sequence.length === 0 && !finished) nextRound();
  }, []); // eslint-disable-line

  const handleClick = (id: number) => {
    if (showing || finished) return;
    if (sequence[userIdx] !== id) {
      setFinished(true);
      setWon(false);
      onFinish(round - 1, TOTAL_ROUNDS);
      return;
    }
    if (userIdx + 1 === sequence.length) {
      if (round >= TOTAL_ROUNDS) {
        setFinished(true);
        setWon(true);
        onFinish(TOTAL_ROUNDS, TOTAL_ROUNDS);
      } else {
        nextRound();
      }
    } else {
      setUserIdx(i => i + 1);
    }
  };

  const reset = () => {
    setSequence([]); setUserIdx(0); setRound(0); setFinished(false); setWon(false); setActiveBtn(null);
    setTimeout(() => nextRound(), 100);
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>Round {round}/{TOTAL_ROUNDS}</span>
        <span>{showing ? "👀 Watch..." : finished ? "Done" : "✋ Your turn"}</span>
      </div>
      {!finished ? (
        <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
          {COLORS.map(c => (
            <button key={c.id} disabled={showing} onClick={() => handleClick(c.id)}
              className={`h-28 rounded-2xl transition-all border-2 border-border ${activeBtn === c.id ? c.glow + " scale-95" : c.bg + " hover:opacity-90"} disabled:cursor-not-allowed`} />
          ))}
        </div>
      ) : (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <div className="text-6xl mb-3">{won ? "🏆" : "💪"}</div>
          <p className="font-display font-bold text-foreground text-lg">Reached round {round}</p>
          <button onClick={reset} className="mt-4 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
