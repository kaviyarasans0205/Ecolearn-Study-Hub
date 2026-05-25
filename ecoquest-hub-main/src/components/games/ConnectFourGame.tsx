import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface Props { onFinish: (score: number, total: number) => void; }

const ROWS = 6;
const COLS = 7;
type Cell = 0 | 1 | 2; // 0 empty, 1 player, 2 AI

const empty = (): Cell[][] => Array.from({ length: ROWS }, () => Array(COLS).fill(0) as Cell[]);

function checkWin(b: Cell[][], p: Cell): boolean {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (b[r][c] !== p) continue;
    // 4 directions
    const dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (const [dr, dc] of dirs) {
      let cnt = 0;
      for (let k = 0; k < 4; k++) {
        const nr = r + dr*k, nc = c + dc*k;
        if (nr<0||nr>=ROWS||nc<0||nc>=COLS||b[nr][nc]!==p) break;
        cnt++;
      }
      if (cnt === 4) return true;
    }
  }
  return false;
}

function dropInto(b: Cell[][], col: number, p: Cell): Cell[][] | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (b[r][col] === 0) {
      const nb = b.map(row => [...row]);
      nb[r][col] = p;
      return nb;
    }
  }
  return null;
}

function aiMove(b: Cell[][]): number {
  // Try to win, then block, else random
  for (const p of [2, 1] as Cell[]) {
    for (let c = 0; c < COLS; c++) {
      const nb = dropInto(b, c, p);
      if (nb && checkWin(nb, p)) return c;
    }
  }
  const valid = [];
  for (let c = 0; c < COLS; c++) if (b[0][c] === 0) valid.push(c);
  return valid[Math.floor(Math.random() * valid.length)] ?? 0;
}

export default function ConnectFourGame({ onFinish }: Props) {
  const [board, setBoard] = useState<Cell[][]>(empty);
  const [winner, setWinner] = useState<0 | 1 | 2 | 3>(0); // 3 = draw
  const [busy, setBusy] = useState(false);

  const isFull = (b: Cell[][]) => b[0].every(c => c !== 0);

  const handleCol = (col: number) => {
    if (winner || busy) return;
    const nb = dropInto(board, col, 1);
    if (!nb) return;
    setBoard(nb);
    if (checkWin(nb, 1)) { setWinner(1); onFinish(1, 1); return; }
    if (isFull(nb)) { setWinner(3); onFinish(0, 1); return; }
    setBusy(true);
    setTimeout(() => {
      const aiCol = aiMove(nb);
      const nb2 = dropInto(nb, aiCol, 2) ?? nb;
      setBoard(nb2);
      if (checkWin(nb2, 2)) { setWinner(2); onFinish(0, 1); }
      else if (isFull(nb2)) { setWinner(3); onFinish(0, 1); }
      setBusy(false);
    }, 500);
  };

  const reset = () => { setBoard(empty()); setWinner(0); setBusy(false); };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-4">Drop discs to connect 4 in a row! You: 🔴 AI: 🟡</p>
      <div className="inline-block bg-accent/20 p-2 rounded-xl">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <button key={c} onClick={() => handleCol(c)} disabled={!!winner || busy}
                className="w-9 h-9 sm:w-11 sm:h-11 m-0.5 rounded-full bg-card border-2 border-border flex items-center justify-center hover:bg-muted disabled:cursor-not-allowed">
                {cell !== 0 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full ${cell === 1 ? "bg-destructive" : "bg-secondary"}`} />
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
      {winner > 0 && (
        <div className="mt-4">
          <p className="font-display font-bold text-foreground text-lg">
            {winner === 1 ? "🏆 You Win!" : winner === 2 ? "🤖 AI Wins!" : "🤝 Draw!"}
          </p>
          <button onClick={reset} className="mt-3 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}
