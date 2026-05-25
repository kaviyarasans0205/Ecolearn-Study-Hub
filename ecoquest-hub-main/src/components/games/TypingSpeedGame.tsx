import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface Props { onFinish: (score: number, total: number) => void; }

const SENTENCES = [
  "Plant trees to save the planet from climate change.",
  "Recycling reduces waste and protects our environment.",
  "Clean energy from the sun powers a greener future.",
  "Rivers and oceans deserve our care and protection.",
  "Every small eco action makes a big difference today.",
];

export default function TypingSpeedGame({ onFinish }: Props) {
  const [target] = useState(() => SENTENCES[Math.floor(Math.random() * SENTENCES.length)]);
  const [input, setInput] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleChange = (v: string) => {
    if (finished) return;
    if (!startedAt && v.length > 0) setStartedAt(Date.now());
    setInput(v);
    if (v === target) {
      const elapsedMin = (Date.now() - (startedAt ?? Date.now())) / 60000;
      const words = target.split(" ").length;
      const calcWpm = Math.round(words / Math.max(elapsedMin, 0.01));
      let correct = 0;
      for (let i = 0; i < target.length; i++) if (v[i] === target[i]) correct++;
      const acc = Math.round((correct / target.length) * 100);
      setWpm(calcWpm);
      setAccuracy(acc);
      setFinished(true);
      // Score = wpm capped at 100, total = 100
      onFinish(Math.min(calcWpm, 100), 100);
    }
  };

  const reset = () => { setInput(""); setStartedAt(null); setFinished(false); setWpm(0); setAccuracy(0); };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-4">Type the sentence as fast and accurately as you can!</p>
      <div className="bg-muted/30 rounded-xl p-5 mb-4 border-2 border-border text-left">
        <p className="font-mono text-base leading-relaxed">
          {target.split("").map((ch, i) => {
            const typed = input[i];
            const cls = typed == null ? "text-muted-foreground" : typed === ch ? "text-primary" : "text-destructive underline";
            return <span key={i} className={cls}>{ch}</span>;
          })}
        </p>
      </div>
      {!finished ? (
        <input ref={inputRef} type="text" value={input} onChange={e => handleChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border-2 border-border bg-card font-mono text-foreground focus:border-primary outline-none"
          placeholder="Start typing..." />
      ) : (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <div className="text-5xl mb-3">⌨️</div>
          <p className="font-display font-bold text-foreground text-lg">{wpm} WPM</p>
          <p className="text-sm text-muted-foreground">Accuracy: {accuracy}%</p>
          <button onClick={reset} className="mt-4 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </motion.div>
      )}
    </div>
  );
}
