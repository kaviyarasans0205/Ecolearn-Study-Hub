import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface Props { onFinish: (score: number, total: number) => void; }

const WORDS = [
  { word: "ECOSYSTEM", hint: "A community of living organisms" },
  { word: "PHOTOSYNTHESIS", hint: "How plants make food" },
  { word: "BIODIVERSITY", hint: "Variety of life in an area" },
  { word: "POLLUTION", hint: "Contamination of the environment" },
  { word: "RECYCLING", hint: "Converting waste into reusable material" },
  { word: "RENEWABLE", hint: "Energy that won't run out" },
  { word: "ATMOSPHERE", hint: "Layer of gases around Earth" },
  { word: "CONSERVATION", hint: "Protection of natural resources" },
];

const MAX_WRONG = 6;

export default function HangmanGame({ onFinish }: Props) {
  const [wordIdx, setWordIdx] = useState(() => Math.floor(Math.random() * WORDS.length));
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);

  const { word, hint } = WORDS[wordIdx];
  const wrongGuesses = [...guessed].filter(l => !word.includes(l));
  const wrongCount = wrongGuesses.length;
  const isLost = wrongCount >= MAX_WRONG;
  const isWon = word.split("").every(l => guessed.has(l));

  const handleGuess = (letter: string) => {
    if (finished || guessed.has(letter) || isLost || isWon) return;
    const next = new Set(guessed);
    next.add(letter);
    setGuessed(next);

    const won = word.split("").every(l => next.has(l));
    const lost = [...next].filter(l => !word.includes(l)).length >= MAX_WRONG;
    if (won || lost) {
      setFinished(true);
      onFinish(won ? word.length : 0, word.length);
    }
  };

  const reset = () => {
    setWordIdx(Math.floor(Math.random() * WORDS.length));
    setGuessed(new Set());
    setFinished(false);
  };

  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-2">💡 Hint: {hint}</p>
      {/* Hangman figure */}
      <div className="mb-4 flex justify-center">
        <svg width="120" height="120" className="text-foreground">
          <line x1="20" y1="110" x2="80" y2="110" stroke="currentColor" strokeWidth="2" />
          <line x1="40" y1="110" x2="40" y2="20" stroke="currentColor" strokeWidth="2" />
          <line x1="40" y1="20" x2="80" y2="20" stroke="currentColor" strokeWidth="2" />
          <line x1="80" y1="20" x2="80" y2="35" stroke="currentColor" strokeWidth="2" />
          {wrongCount > 0 && <circle cx="80" cy="45" r="10" stroke="currentColor" strokeWidth="2" fill="none" />}
          {wrongCount > 1 && <line x1="80" y1="55" x2="80" y2="80" stroke="currentColor" strokeWidth="2" />}
          {wrongCount > 2 && <line x1="80" y1="60" x2="65" y2="72" stroke="currentColor" strokeWidth="2" />}
          {wrongCount > 3 && <line x1="80" y1="60" x2="95" y2="72" stroke="currentColor" strokeWidth="2" />}
          {wrongCount > 4 && <line x1="80" y1="80" x2="65" y2="100" stroke="currentColor" strokeWidth="2" />}
          {wrongCount > 5 && <line x1="80" y1="80" x2="95" y2="100" stroke="currentColor" strokeWidth="2" />}
        </svg>
      </div>
      {/* Word display */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {word.split("").map((l, i) => (
          <span key={i} className={`w-8 h-10 border-b-2 flex items-center justify-center font-display font-bold text-lg ${
            guessed.has(l) ? "text-primary border-primary" : isLost ? "text-destructive border-destructive" : "border-muted-foreground"
          }`}>
            {guessed.has(l) || isLost ? l : ""}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mb-3">Wrong: {wrongCount}/{MAX_WRONG}</p>
      {/* Keyboard */}
      <div className="flex flex-wrap justify-center gap-1.5 max-w-[320px] mx-auto mb-4">
        {ALPHA.map(l => {
          const used = guessed.has(l);
          const isWrongLetter = used && !word.includes(l);
          const isRightLetter = used && word.includes(l);
          return (
            <button key={l} onClick={() => handleGuess(l)} disabled={used || finished}
              className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${
                isRightLetter ? "bg-primary/20 text-primary border border-primary" :
                isWrongLetter ? "bg-destructive/10 text-destructive/50 border border-destructive/30" :
                "bg-muted/50 text-foreground border border-border hover:bg-primary/10"
              } disabled:cursor-not-allowed`}>
              {l}
            </button>
          );
        })}
      </div>
      {finished && (
        <div>
          <p className="font-display font-bold text-foreground text-lg">{isWon ? "🏆 You got it!" : "💀 Game Over!"}</p>
          {isLost && <p className="text-sm text-muted-foreground">The word was: <span className="font-bold text-primary">{word}</span></p>}
          <button onClick={reset} className="mt-3 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}
