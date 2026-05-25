import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

type Cell = "X" | "O" | null;
const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function getWinner(board: Cell[]): Cell {
  for (const [a,b,c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function minimax(board: Cell[], isMax: boolean): number {
  const w = getWinner(board);
  if (w === "O") return 10;
  if (w === "X") return -10;
  if (board.every(c => c !== null)) return 0;
  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) { board[i] = "O"; best = Math.max(best, minimax(board, false)); board[i] = null; }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) { board[i] = "X"; best = Math.min(best, minimax(board, true)); board[i] = null; }
    }
    return best;
  }
}

function bestMove(board: Cell[]): number {
  let best = -Infinity, move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      const score = minimax(board, false);
      board[i] = null;
      if (score > best) { best = score; move = i; }
    }
  }
  return move;
}

interface Props { onFinish: (score: number, total: number) => void; }

export default function TicTacToe({ onFinish }: Props) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [gameOver, setGameOver] = useState(false);
  const [wins, setWins] = useState(0);
  const [games, setGames] = useState(0);

  const winner = getWinner(board);
  const isDraw = !winner && board.every(c => c !== null);

  const handleClick = (i: number) => {
    if (board[i] || winner || isDraw || gameOver) return;
    const next = [...board];
    next[i] = "X";
    const w = getWinner(next);
    if (w || next.every(c => c !== null)) {
      setBoard(next);
      return;
    }
    const ai = bestMove([...next]);
    if (ai >= 0) next[ai] = "O";
    setBoard(next);
  };

  const handleNext = () => {
    const newGames = games + 1;
    const newWins = winner === "X" ? wins + 1 : wins;
    if (newGames >= 3) {
      setGameOver(true);
      onFinish(newWins, 3);
      return;
    }
    setWins(newWins);
    setGames(newGames);
    setBoard(Array(9).fill(null));
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setWins(0);
    setGames(0);
    setGameOver(false);
  };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-2">Best of 3 vs AI • Round {games + 1}/3</p>
      <p className="text-xs text-muted-foreground mb-4">You are ❌ • AI is ⭕</p>
      <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-4">
        {board.map((cell, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(i)}
            className="w-20 h-20 rounded-xl border-2 border-border bg-muted/30 flex items-center justify-center text-3xl font-bold hover:bg-muted/50 transition-colors"
          >
            {cell === "X" ? "❌" : cell === "O" ? "⭕" : ""}
          </motion.button>
        ))}
      </div>
      {(winner || isDraw) && !gameOver && (
        <div className="mb-4">
          <p className="font-display font-bold text-foreground">
            {winner === "X" ? "You won! 🎉" : winner === "O" ? "AI wins! 🤖" : "Draw! 🤝"}
          </p>
          <button onClick={handleNext} className="mt-2 px-5 py-2 rounded-xl gradient-school text-primary-foreground font-display font-bold text-sm">
            {games >= 2 ? "See Results" : "Next Round →"}
          </button>
        </div>
      )}
      {gameOver && (
        <div>
          <p className="font-display font-bold text-foreground text-lg">Final: {wins}/3 wins!</p>
          <button onClick={reset} className="mt-3 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}