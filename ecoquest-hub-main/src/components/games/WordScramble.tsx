import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw, CheckCircle2, XCircle } from "lucide-react";

const WORDS = [
  { word: "RECYCLE", hint: "Process of converting waste into new materials" },
  { word: "COMPOST", hint: "Organic matter decomposed for fertilizer" },
  { word: "SOLAR", hint: "Energy from the sun" },
  { word: "FOREST", hint: "Large area covered with trees" },
  { word: "OCEAN", hint: "Vast body of salt water" },
  { word: "CLIMATE", hint: "Long-term weather pattern of an area" },
  { word: "HABITAT", hint: "Natural home of an organism" },
  { word: "BIODIVERSITY", hint: "Variety of life in a particular ecosystem" },
  { word: "ECOSYSTEM", hint: "Community of living organisms interacting" },
  { word: "POLLUTION", hint: "Contamination of the environment" },
];

function scramble(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("") === word ? scramble(word) : arr.join("");
}

interface Props { onFinish: (score: number, total: number) => void; }

export default function WordScramble({ onFinish }: Props) {
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [scrambled, setScrambled] = useState("");
  const [finished, setFinished] = useState(false);
  const total = 5;
  const [indices] = useState(() => {
    const all = WORDS.map((_, i) => i);
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all.slice(0, total);
  });

  const current = WORDS[indices[round]];

  useEffect(() => {
    if (current) setScrambled(scramble(current.word));
  }, [round]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback || finished) return;
    const isCorrect = guess.toUpperCase().trim() === current.word;
    if (isCorrect) setScore(s => s + 1);
    setFeedback(isCorrect ? "correct" : "wrong");
    setTimeout(() => {
      setFeedback(null);
      setGuess("");
      if (round < total - 1) {
        setRound(r => r + 1);
      } else {
        setFinished(true);
        onFinish(isCorrect ? score + 1 : score, total);
      }
    }, 1200);
  };

  const reset = () => {
    setRound(0);
    setGuess("");
    setScore(0);
    setFeedback(null);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="text-center">
        <p className="text-5xl mb-3">{score >= 4 ? "🏆" : score >= 2 ? "👏" : "💪"}</p>
        <p className="font-display font-bold text-foreground text-lg">{score}/{total} Correct!</p>
        <button onClick={reset} className="mt-4 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" /> Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-1">Word {round + 1}/{total} • Score: {score}</p>
      <p className="text-xs text-muted-foreground mb-4">💡 {current.hint}</p>
      <motion.p key={round} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-3xl font-display font-black tracking-[0.3em] text-foreground mb-6">
        {scrambled}
      </motion.p>
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-xs mx-auto">
        <input
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="Your answer..."
          className="flex-1 px-4 py-2.5 rounded-xl border-2 border-border bg-muted/30 text-foreground text-sm font-medium focus:border-primary focus:outline-none uppercase tracking-wider"
          autoFocus
        />
        <button type="submit" className="px-5 py-2.5 rounded-xl gradient-school text-primary-foreground font-display font-bold text-sm">
          Go
        </button>
      </form>
      {feedback && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center justify-center gap-1">
          {feedback === "correct" ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <XCircle className="w-4 h-4 text-destructive" />}
          <span className={`text-sm font-semibold ${feedback === "correct" ? "text-primary" : "text-destructive"}`}>
            {feedback === "correct" ? "Correct! 🎉" : `Answer: ${current.word}`}
          </span>
        </motion.div>
      )}
    </div>
  );
}