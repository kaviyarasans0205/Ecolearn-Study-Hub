import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface Props { onFinish: (score: number, total: number) => void; }

const SIZE = 4;
type Board = number[][];

function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandom(board: Board): Board {
  const b = board.map(r => [...r]);
  const empty: [number, number][] = [];
  b.forEach((r, ri) => r.forEach((c, ci) => { if (c === 0) empty.push([ri, ci]); }));
  if (empty.length === 0) return b;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  b[r][c] = Math.random() < 0.9 ? 2 : 4;
  return b;
}

function slideRow(row: number[]): { row: number[]; score: number } {
  let filtered = row.filter(x => x !== 0);
  let score = 0;
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      score += filtered[i];
      filtered[i + 1] = 0;
    }
  }
  filtered = filtered.filter(x => x !== 0);
  while (filtered.length < SIZE) filtered.push(0);
  return { row: filtered, score };
}

function move(board: Board, dir: "left" | "right" | "up" | "down"): { board: Board; score: number; moved: boolean } {
  let totalScore = 0;
  let b = board.map(r => [...r]);
  const rotate = (b: Board): Board => b[0].map((_, i) => b.map(r => r[i]).reverse());
  let rotations = dir === "left" ? 0 : dir === "down" ? 1 : dir === "right" ? 2 : 3;
  for (let i = 0; i < rotations; i++) b = rotate(b);
  b = b.map(row => {
    const { row: newRow, score } = slideRow(row);
    totalScore += score;
    return newRow;
  });
  for (let i = 0; i < (4 - rotations) % 4; i++) b = rotate(b);
  const moved = JSON.stringify(b) !== JSON.stringify(board);
  return { board: b, score: totalScore, moved };
}

function canMove(board: Board): boolean {
  for (const dir of ["left", "right", "up", "down"] as const) {
    if (move(board, dir).moved) return true;
  }
  return false;
}

const COLORS: Record<number, string> = {
  0: "bg-muted/30", 2: "bg-primary/10 text-primary", 4: "bg-primary/20 text-primary",
  8: "bg-secondary/30 text-secondary-foreground", 16: "bg-secondary/50 text-secondary-foreground",
  32: "bg-accent/30 text-accent-foreground", 64: "bg-accent/50 text-accent-foreground",
  128: "bg-primary/40 text-primary-foreground", 256: "bg-primary/60 text-primary-foreground",
  512: "bg-primary/70 text-primary-foreground", 1024: "bg-primary/80 text-primary-foreground",
  2048: "bg-primary text-primary-foreground",
};

export default function Game2048({ onFinish }: Props) {
  const [board, setBoard] = useState<Board>(() => addRandom(addRandom(emptyBoard())));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleMove = useCallback((dir: "left" | "right" | "up" | "down") => {
    if (gameOver) return;
    const result = move(board, dir);
    if (!result.moved) return;
    const newBoard = addRandom(result.board);
    setBoard(newBoard);
    setScore(s => s + result.score);
    if (newBoard.flat().includes(2048) && !won) {
      setWon(true);
      onFinish(10, 10);
    }
    if (!canMove(newBoard)) {
      setGameOver(true);
      if (!won) onFinish(Math.min(score + result.score, 500), 500);
    }
  }, [board, gameOver, won, score, onFinish]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
        a: "left", d: "right", w: "up", s: "down",
      };
      if (map[e.key]) { e.preventDefault(); handleMove(map[e.key]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleMove]);

  const reset = () => { setBoard(addRandom(addRandom(emptyBoard()))); setScore(0); setGameOver(false); setWon(false); };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-2">Score: <span className="font-bold text-foreground">{score}</span> • Use arrow keys or swipe</p>
      <div
        className="inline-grid grid-cols-4 gap-2 p-3 bg-muted/20 rounded-xl mb-4"
        onTouchStart={e => setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={e => {
          if (!touchStart) return;
          const dx = e.changedTouches[0].clientX - touchStart.x;
          const dy = e.changedTouches[0].clientY - touchStart.y;
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) handleMove(dx > 0 ? "right" : "left");
          else if (Math.abs(dy) > 30) handleMove(dy > 0 ? "down" : "up");
          setTouchStart(null);
        }}
      >
        {board.flat().map((val, i) => (
          <motion.div key={i} layout
            className={`w-16 h-16 rounded-lg flex items-center justify-center font-display font-bold text-sm ${COLORS[val] || "bg-primary text-primary-foreground"}`}>
            {val || ""}
          </motion.div>
        ))}
      </div>
      {(gameOver || won) && (
        <div>
          <p className="font-display font-bold text-foreground text-lg">{won ? "🏆 You reached 2048!" : "Game Over!"}</p>
          <p className="text-sm text-muted-foreground">Final score: {score}</p>
          <button onClick={reset} className="mt-3 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}
