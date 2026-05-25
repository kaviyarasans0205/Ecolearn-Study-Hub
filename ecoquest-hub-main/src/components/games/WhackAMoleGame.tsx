import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface Props { onFinish: (score: number, total: number) => void; }

const GAME_TIME = 30;
const TOTAL_TARGET = 30;

export default function WhackAMoleGame({ onFinish }: Props) {
  const [activeHole, setActiveHole] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [finished, setFinished] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (finished) return;
    const tick = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          if (!finishedRef.current) {
            finishedRef.current = true;
            setFinished(true);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [finished]);

  useEffect(() => {
    if (finished) { setActiveHole(null); return; }
    const spawn = setInterval(() => {
      setActiveHole(Math.floor(Math.random() * 9));
    }, 800);
    return () => clearInterval(spawn);
  }, [finished]);

  useEffect(() => {
    if (finished) onFinish(Math.min(score, TOTAL_TARGET), TOTAL_TARGET);
  }, [finished]); // eslint-disable-line

  const whack = (i: number) => {
    if (i === activeHole && !finished) {
      setScore(s => s + 1);
      setActiveHole(null);
    }
  };

  const reset = () => { setScore(0); setTimeLeft(GAME_TIME); setFinished(false); finishedRef.current = false; setActiveHole(null); };

  return (
    <div className="text-center">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span className={`font-bold ${timeLeft <= 5 ? "text-destructive" : ""}`}>⏱ {timeLeft}s</span>
        <span className="text-primary font-bold">🌱 {score}</span>
      </div>
      {!finished ? (
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {Array.from({ length: 9 }).map((_, i) => (
            <button key={i} onClick={() => whack(i)}
              className="aspect-square rounded-full bg-muted/40 border-2 border-border flex items-center justify-center text-3xl hover:bg-muted">
              <AnimatePresence>
                {activeHole === i && (
                  <motion.span initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }}>
                    🌱
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-3">
            {score >= 20 ? "🏆" : score >= 10 ? "👏" : "💪"}
          </motion.div>
          <p className="font-display font-bold text-foreground text-lg">Score: {score}</p>
          <button onClick={reset} className="mt-4 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}
