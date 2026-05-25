import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

// Carrom: You vs AI — alternating shots, first to ROUNDS rounds. Score = your pockets.
const ROUNDS = 6;

interface Props { onFinish: (score: number, total: number) => void; }

type Turn = "you" | "ai";

export default function CarromGame({ onFinish }: Props) {
  const [round, setRound] = useState(0);
  const [turn, setTurn] = useState<Turn>("you");
  const [yourScore, setYourScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [power, setPower] = useState(50);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState<"pocket" | "miss" | null>(null);
  const [finished, setFinished] = useState(false);
  const [target, setTarget] = useState(() =>
    Array.from({ length: ROUNDS * 2 }, () => ({
      zone: Math.floor(Math.random() * 4),
      sweetSpot: Math.floor(Math.random() * 60) + 20,
    }))
  );

  const pocketNames = ["↗️ Top-Right", "↖️ Top-Left", "↙️ Bottom-Left", "↘️ Bottom-Right"];
  const shotIndex = round * 2 + (turn === "you" ? 0 : 1);
  const t = target[shotIndex];

  const advance = (pocketed: boolean) => {
    setResult(pocketed ? "pocket" : "miss");
    setTimeout(() => {
      setResult(null);
      if (turn === "you") {
        setTurn("ai");
      } else {
        // both shots done for round
        if (round + 1 >= ROUNDS) {
          setFinished(true);
        } else {
          setRound(r => r + 1);
          setTurn("you");
        }
      }
      setPower(50);
      setAngle(0);
    }, 1000);
  };

  // AI takes its shot automatically
  useEffect(() => {
    if (turn !== "ai" || finished || result) return;
    const timer = setTimeout(() => {
      // AI accuracy: 55% pocket chance
      const pocketed = Math.random() < 0.55;
      if (pocketed) setAiScore(s => s + 1);
      advance(pocketed);
    }, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, finished, result]);

  // When game finishes, report final score
  useEffect(() => {
    if (finished) onFinish(yourScore, ROUNDS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const handleFlick = () => {
    if (result || finished || turn !== "you") return;
    const powerDiff = Math.abs(power - t.sweetSpot);
    const angleDiff = Math.abs(angle - t.zone);
    const isPocket = powerDiff <= 18 && angleDiff === 0;
    if (isPocket) setYourScore(s => s + 1);
    advance(isPocket);
  };

  const reset = () => {
    setRound(0);
    setTurn("you");
    setYourScore(0);
    setAiScore(0);
    setPower(50);
    setAngle(0);
    setResult(null);
    setFinished(false);
    setTarget(Array.from({ length: ROUNDS * 2 }, () => ({
      zone: Math.floor(Math.random() * 4),
      sweetSpot: Math.floor(Math.random() * 60) + 20,
    })));
  };

  if (finished) {
    const youWon = yourScore > aiScore;
    return (
      <div className="text-center">
        <p className="text-5xl mb-3">{youWon ? "🏆" : yourScore === aiScore ? "🤝" : "🤖"}</p>
        <p className="font-display font-bold text-foreground text-lg">
          {youWon ? "You Win!" : yourScore === aiScore ? "It's a Draw!" : "AI Wins!"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">You: {yourScore} • AI: {aiScore}</p>
        <button onClick={reset} className="mt-4 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-1">
        Round {round + 1}/{ROUNDS} • You: {yourScore} 🆚 AI: {aiScore}
      </p>
      <p className="text-xs font-display font-bold text-foreground mb-4">
        {turn === "you" ? "🎯 Your shot — aim & flick!" : "🤖 AI is taking a shot..."}
      </p>

      <div className="relative w-[280px] h-[280px] mx-auto mb-4 bg-secondary/20 border-4 border-secondary/40 rounded-xl">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-lg ${
            t.zone === i ? "bg-primary/30 ring-2 ring-primary animate-pulse" : "bg-muted/30"
          } ${
            i === 0 ? "top-1 right-1" : i === 1 ? "top-1 left-1" : i === 2 ? "bottom-1 left-1" : "bottom-1 right-1"
          }`}>
            🕳️
          </div>
        ))}
        <motion.div
          animate={result === "pocket" ? { scale: 0, opacity: 0 } : result === "miss" ? { x: [0, 10, -10, 0] } : {}}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 shadow-lg ${
            turn === "you" ? "bg-foreground/80 border-foreground" : "bg-destructive/80 border-destructive"
          }`}
        />
        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs font-display font-bold text-foreground">
          🎯 Target: {pocketNames[t.zone]}
        </p>
        {result && (
          <motion.p initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-display font-black ${result === "pocket" ? "text-primary" : "text-destructive"}`}>
            {result === "pocket" ? `${turn === "you" ? "YOU" : "AI"} POCKET! 🎯` : `${turn === "you" ? "YOU" : "AI"} MISS! 💨`}
          </motion.p>
        )}
      </div>

      <div className="max-w-xs mx-auto space-y-3">
        <div>
          <label className="text-xs font-display font-bold text-foreground">🎯 Pocket Aim</label>
          <div className="flex gap-2 mt-1">
            {pocketNames.map((name, i) => (
              <button key={i} onClick={() => setAngle(i)} disabled={turn !== "you"} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                angle === i ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
              }`}>{name.split(" ")[0]}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-display font-bold text-foreground">💪 Power: {power}%</label>
          <input type="range" min={0} max={100} value={power} onChange={e => setPower(Number(e.target.value))}
            disabled={turn !== "you"}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary disabled:opacity-50" />
        </div>
        <button onClick={handleFlick} disabled={!!result || turn !== "you"} className="w-full py-3 rounded-xl gradient-warm text-secondary-foreground font-display font-bold text-sm disabled:opacity-50">
          🏏 Flick!
        </button>
      </div>
    </div>
  );
}
