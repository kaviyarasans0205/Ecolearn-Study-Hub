import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

type Piece = { type: string; color: "w" | "b"; symbol: string } | null;

const SYMBOLS: Record<string, Record<string, string>> = {
  w: { K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙" },
  b: { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟" },
};

const PIECE_VALUE: Record<string, number> = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 100 };

function initBoard(): Piece[] {
  const board: Piece[] = Array(64).fill(null);
  const back = ["R", "N", "B", "Q", "K", "B", "N", "R"];
  for (let i = 0; i < 8; i++) {
    board[i] = { type: back[i], color: "b", symbol: SYMBOLS.b[back[i]] };
    board[8 + i] = { type: "P", color: "b", symbol: SYMBOLS.b.P };
    board[48 + i] = { type: "P", color: "w", symbol: SYMBOLS.w.P };
    board[56 + i] = { type: back[i], color: "w", symbol: SYMBOLS.w[back[i]] };
  }
  return board;
}

function getValidMoves(board: Piece[], from: number): number[] {
  const piece = board[from];
  if (!piece) return [];
  const moves: number[] = [];
  const r = Math.floor(from / 8), c = from % 8;

  const addIfValid = (tr: number, tc: number) => {
    if (tr < 0 || tr > 7 || tc < 0 || tc > 7) return false;
    const idx = tr * 8 + tc;
    const target = board[idx];
    if (target && target.color === piece.color) return false;
    moves.push(idx);
    return !target;
  };

  const slide = (dr: number, dc: number) => {
    for (let i = 1; i < 8; i++) {
      if (!addIfValid(r + dr * i, c + dc * i)) break;
    }
  };

  switch (piece.type) {
    case "P": {
      const dir = piece.color === "w" ? -1 : 1;
      const startRow = piece.color === "w" ? 6 : 1;
      const fwd = r + dir;
      if (fwd >= 0 && fwd <= 7 && !board[fwd * 8 + c]) {
        moves.push(fwd * 8 + c);
        if (r === startRow && !board[(r + 2 * dir) * 8 + c]) moves.push((r + 2 * dir) * 8 + c);
      }
      for (const dc of [-1, 1]) {
        const nc = c + dc;
        if (nc >= 0 && nc <= 7 && fwd >= 0 && fwd <= 7) {
          const target = board[fwd * 8 + nc];
          if (target && target.color !== piece.color) moves.push(fwd * 8 + nc);
        }
      }
      break;
    }
    case "R": slide(0, 1); slide(0, -1); slide(1, 0); slide(-1, 0); break;
    case "B": slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1); break;
    case "Q": slide(0, 1); slide(0, -1); slide(1, 0); slide(-1, 0); slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1); break;
    case "K":
      for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) addIfValid(r + dr, c + dc);
      break;
    case "N":
      for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) addIfValid(r + dr, c + dc);
      break;
  }
  return moves;
}

// Simple AI: pick move with highest immediate capture value, else random
function pickAIMove(board: Piece[]): { from: number; to: number } | null {
  const candidates: { from: number; to: number; score: number }[] = [];
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    if (!p || p.color !== "b") continue;
    const moves = getValidMoves(board, i);
    for (const to of moves) {
      const target = board[to];
      const captureScore = target ? (PIECE_VALUE[target.type] ?? 0) * 10 : 0;
      // bonus for advancing pawns
      const advance = p.type === "P" ? Math.floor(to / 8) : 0;
      candidates.push({ from: i, to, score: captureScore + advance + Math.random() });
    }
  }
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0];
}

interface Props { onFinish: (score: number, total: number) => void; }

export default function ChessGame({ onFinish }: Props) {
  const [board, setBoard] = useState<Piece[]>(initBoard);
  const [selected, setSelected] = useState<number | null>(null);
  const [turn, setTurn] = useState<"w" | "b">("w");
  const [validMoves, setValidMoves] = useState<number[]>([]);
  const [captured, setCaptured] = useState<{ w: string[]; b: string[] }>({ w: [], b: [] });
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  // AI plays Black automatically
  useEffect(() => {
    if (gameOver || turn !== "b") return;
    const timer = setTimeout(() => {
      const move = pickAIMove(board);
      if (!move) return;
      const next = [...board];
      const target = next[move.to];
      if (target) {
        setCaptured(prev => ({ ...prev, b: [...prev.b, target.symbol] }));
        if (target.type === "K") {
          next[move.to] = next[move.from];
          next[move.from] = null;
          setBoard(next);
          setGameOver(true);
          setWinner("AI (Black)");
          onFinish(0, 1);
          return;
        }
      }
      const moving = next[move.from]!;
      if (moving.type === "P" && Math.floor(move.to / 8) === 7) {
        next[move.to] = { type: "Q", color: "b", symbol: SYMBOLS.b.Q };
      } else {
        next[move.to] = moving;
      }
      next[move.from] = null;
      setBoard(next);
      setTurn("w");
    }, 600);
    return () => clearTimeout(timer);
  }, [turn, gameOver, board, onFinish]);

  const handleClick = (i: number) => {
    if (gameOver || turn !== "w") return;
    const piece = board[i];

    if (selected !== null && validMoves.includes(i)) {
      const next = [...board];
      const target = next[i];
      if (target) {
        setCaptured(prev => ({ ...prev, w: [...prev.w, target.symbol] }));
        if (target.type === "K") {
          setGameOver(true);
          setWinner("You (White)");
          onFinish(1, 1);
        }
      }
      const movingPiece = next[selected]!;
      if (movingPiece.type === "P" && (i < 8 || i >= 56)) {
        next[i] = { type: "Q", color: movingPiece.color, symbol: SYMBOLS[movingPiece.color].Q };
      } else {
        next[i] = movingPiece;
      }
      next[selected] = null;
      setBoard(next);
      setSelected(null);
      setValidMoves([]);
      if (!gameOver) setTurn("b");
      return;
    }

    if (piece && piece.color === "w") {
      setSelected(i);
      setValidMoves(getValidMoves(board, i));
    } else {
      setSelected(null);
      setValidMoves([]);
    }
  };

  const reset = () => {
    setBoard(initBoard());
    setSelected(null);
    setTurn("w");
    setValidMoves([]);
    setCaptured({ w: [], b: [] });
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="text-center">
      <div className="flex items-center justify-between max-w-[360px] mx-auto mb-2">
        <p className="text-sm font-display font-bold text-foreground">
          {gameOver ? `${winner} wins! 🎉` : turn === "w" ? "⬜ Your turn" : "🤖 AI thinking..."}
        </p>
        <button onClick={reset} className="text-muted-foreground hover:text-foreground"><RotateCcw className="w-4 h-4" /></button>
      </div>
      {captured.b.length > 0 && <p className="text-xs text-muted-foreground mb-1">🤖 AI captured: {captured.b.join(" ")}</p>}
      <div className="inline-grid grid-cols-8 border-2 border-border rounded-lg overflow-hidden">
        {board.map((piece, i) => {
          const r = Math.floor(i / 8), c = i % 8;
          const isDark = (r + c) % 2 === 1;
          const isSelected = selected === i;
          const isValid = validMoves.includes(i);
          return (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleClick(i)}
              className={`w-[44px] h-[44px] flex items-center justify-center text-2xl relative transition-colors
                ${isDark ? "bg-primary/20" : "bg-card"}
                ${isSelected ? "ring-2 ring-primary ring-inset" : ""}
                ${isValid ? "ring-2 ring-accent ring-inset" : ""}
              `}
            >
              {isValid && !piece && <div className="w-3 h-3 rounded-full bg-accent/40 absolute" />}
              {piece?.symbol}
            </motion.button>
          );
        })}
      </div>
      {captured.w.length > 0 && <p className="text-xs text-muted-foreground mt-1">⬜ You captured: {captured.w.join(" ")}</p>}
      <p className="text-xs text-muted-foreground mt-3">You are White ⬜ • Playing vs AI 🤖 • Capture the King to win</p>
    </div>
  );
}
