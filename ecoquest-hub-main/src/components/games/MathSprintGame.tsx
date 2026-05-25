import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface Props { onFinish: (score: number, total: number) => void; }

function genProblem(): { q: string; answer: number } {
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a: number, b: number, answer: number;
  if (op === "+") { a = Math.floor(Math.random() * 50) + 5; b = Math.floor(Math.random() * 50) + 5; answer = a + b; }
  else if (op === "-") { a = Math.floor(Math.random() * 50) + 20; b = Math.floor(Math.random() * a); answer = a - b; }
  else { a = Math.floor(Math.random() * 12) + 2; b = Math.floor(Math.random() * 12) + 2; answer = a * b; }
  return { q: `${a} ${op} ${b}`, answer };
}

const TOTAL = 10;
const TIME_LIMIT = 60;

export default function MathSprintGame({ onFinish }: Props) {
  const [problem, setProblem] = useState(genProblem);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [qNum, setQNum] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [finished]);

  const finish = useCallback((finalScore: number) => {
    setFinished(true);
    onFinish(finalScore, TOTAL);
  }, [onFinish]);

  const submit = () => {
    if (finished) return;
    const correct = parseInt(input) === problem.answer;
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    setInput("");
    if (qNum + 1 >= TOTAL) {
      finish(newScore);
    } else {
      setQNum(q => q + 1);
      setProblem(genProblem());
    }
  };

  useEffect(() => {
    if (finished && timeLeft <= 0) {
      onFinish(score, TOTAL);
    }
  }, [finished]);

  const reset = () => { setProblem(genProblem()); setInput(""); setScore(0); setQNum(0); setTimeLeft(TIME_LIMIT); setFinished(false); };

  return (
    <div className="text-center">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <span>Q {qNum + 1}/{TOTAL}</span>
        <span className={`font-bold ${timeLeft <= 10 ? "text-destructive" : ""}`}>⏱ {timeLeft}s</span>
        <span className="text-primary font-bold">✓ {score}</span>
      </div>
      {!finished ? (
        <>
          <motion.div key={qNum} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-muted/30 rounded-xl py-8 mb-4 border-2 border-border">
            <p className="text-3xl font-display font-black text-foreground">{problem.q} = ?</p>
          </motion.div>
          <div className="flex gap-2 justify-center">
            <input type="number" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              className="w-32 px-4 py-3 rounded-xl border-2 border-border bg-card text-center font-display font-bold text-lg text-foreground focus:border-primary outline-none"
              placeholder="?" autoFocus />
            <button onClick={submit}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-bold text-sm">
              Submit
            </button>
          </div>
        </>
      ) : (
        <div>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
            {score >= 8 ? "🏆" : score >= 5 ? "👏" : "💪"}
          </motion.div>
          <p className="font-display font-bold text-foreground text-lg">{score}/{TOTAL} Correct!</p>
          <p className="text-sm text-muted-foreground mt-1">Time remaining: {timeLeft}s</p>
          <button onClick={reset} className="mt-4 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}
