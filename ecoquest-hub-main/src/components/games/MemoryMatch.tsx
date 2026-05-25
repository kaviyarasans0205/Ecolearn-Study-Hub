import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

const PAIRS = ["🌍", "🌱", "♻️", "🌊", "🌳", "🦋", "☀️", "🐝"];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Props { onFinish: (score: number, total: number) => void; }

export default function MemoryMatch({ onFinish }: Props) {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => { setCards(shuffle([...PAIRS, ...PAIRS])); }, []);

  const handleFlip = (i: number) => {
    if (flipped.length >= 2 || flipped.includes(i) || matched.has(i)) return;
    const next = [...flipped, i];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      if (cards[next[0]] === cards[next[1]]) {
        const newMatched = new Set(matched);
        newMatched.add(next[0]);
        newMatched.add(next[1]);
        setMatched(newMatched);
        setFlipped([]);
        if (newMatched.size === cards.length) {
          setFinished(true);
          const score = Math.max(1, PAIRS.length - Math.floor((moves + 1 - PAIRS.length) / 3));
          onFinish(score, PAIRS.length);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const reset = () => {
    setCards(shuffle([...PAIRS, ...PAIRS]));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setFinished(false);
  };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-4">Moves: {moves} • Pairs found: {matched.size / 2}/{PAIRS.length}</p>
      <div className="grid grid-cols-4 gap-2 max-w-[320px] mx-auto mb-4">
        {cards.map((card, i) => {
          const isOpen = flipped.includes(i) || matched.has(i);
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFlip(i)}
              className={`w-[72px] h-[72px] rounded-xl border-2 flex items-center justify-center text-2xl transition-all ${
                matched.has(i) ? "border-primary bg-primary/10" :
                isOpen ? "border-accent bg-accent/10" :
                "border-border bg-muted/30 hover:bg-muted/50"
              }`}
            >
              {isOpen ? card : "❓"}
            </motion.button>
          );
        })}
      </div>
      {finished && (
        <div>
          <p className="font-display font-bold text-foreground text-lg mb-1">
            {moves <= PAIRS.length + 2 ? "🏆 Amazing!" : moves <= PAIRS.length + 6 ? "👏 Well done!" : "💪 Good try!"}
          </p>
          <p className="text-sm text-muted-foreground">Completed in {moves} moves</p>
          <button onClick={reset} className="mt-3 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}