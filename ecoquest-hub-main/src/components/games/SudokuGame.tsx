import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface Props { onFinish: (score: number, total: number) => void; }

const PUZZLES = [
  {
    grid: [
      [5,3,0,0,7,0,0,0,0],
      [6,0,0,1,9,5,0,0,0],
      [0,9,8,0,0,0,0,6,0],
      [8,0,0,0,6,0,0,0,3],
      [4,0,0,8,0,3,0,0,1],
      [7,0,0,0,2,0,0,0,6],
      [0,6,0,0,0,0,2,8,0],
      [0,0,0,4,1,9,0,0,5],
      [0,0,0,0,8,0,0,7,9],
    ],
    solution: [
      [5,3,4,6,7,8,9,1,2],
      [6,7,2,1,9,5,3,4,8],
      [1,9,8,3,4,2,5,6,7],
      [8,5,9,7,6,1,4,2,3],
      [4,2,6,8,5,3,7,9,1],
      [7,1,3,9,2,4,8,5,6],
      [9,6,1,5,3,7,2,8,4],
      [2,8,7,4,1,9,6,3,5],
      [3,4,5,2,8,6,1,7,9],
    ],
  },
];

export default function SudokuGame({ onFinish }: Props) {
  const [puzzle] = useState(PUZZLES[0]);
  const [grid, setGrid] = useState<number[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setGrid(puzzle.grid.map(r => [...r]));
  }, [puzzle]);

  const isOriginal = (r: number, c: number) => puzzle.grid[r][c] !== 0;

  const handleInput = (num: number) => {
    if (!selected || finished) return;
    const [r, c] = selected;
    if (isOriginal(r, c)) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[r][c] = num;
    setGrid(newGrid);

    if (num !== puzzle.solution[r][c] && num !== 0) {
      setErrors(e => e + 1);
    }

    // Check completion
    const allFilled = newGrid.every(row => row.every(cell => cell !== 0));
    if (allFilled) {
      const correct = newGrid.every((row, ri) => row.every((cell, ci) => cell === puzzle.solution[ri][ci]));
      if (correct) {
        setFinished(true);
        const score = Math.max(1, 9 - errors);
        onFinish(score, 9);
      }
    }
  };

  const reset = () => {
    setGrid(puzzle.grid.map(r => [...r]));
    setSelected(null);
    setErrors(0);
    setFinished(false);
  };

  const filledCount = grid.flat().filter(c => c !== 0).length;
  const totalCells = 81;
  const emptyCount = puzzle.grid.flat().filter(c => c === 0).length;

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-3">Fill all cells • Errors: <span className="text-destructive font-bold">{errors}</span> • Filled: {filledCount}/{totalCells}</p>
      <div className="inline-grid grid-cols-9 gap-0 border-2 border-foreground/30 rounded-lg overflow-hidden mb-4">
        {grid.map((row, ri) =>
          row.map((cell, ci) => {
            const isSelected = selected?.[0] === ri && selected?.[1] === ci;
            const isOrig = isOriginal(ri, ci);
            const isWrong = !isOrig && cell !== 0 && cell !== puzzle.solution[ri][ci];
            return (
              <button
                key={`${ri}-${ci}`}
                onClick={() => !isOrig && setSelected([ri, ci])}
                className={`w-8 h-8 text-xs font-bold flex items-center justify-center transition-colors
                  ${ri % 3 === 2 && ri < 8 ? "border-b-2 border-b-foreground/20" : "border-b border-b-border"}
                  ${ci % 3 === 2 && ci < 8 ? "border-r-2 border-r-foreground/20" : "border-r border-r-border"}
                  ${isSelected ? "bg-primary/20" : isOrig ? "bg-muted/50" : "bg-card"}
                  ${isWrong ? "text-destructive" : isOrig ? "text-foreground" : "text-primary"}
                `}
              >
                {cell || ""}
              </button>
            );
          })
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => handleInput(n)}
            className="w-9 h-9 rounded-lg border-2 border-border bg-muted/30 font-bold text-sm text-foreground hover:bg-primary/10 hover:border-primary transition-colors">
            {n}
          </button>
        ))}
        <button onClick={() => handleInput(0)}
          className="w-9 h-9 rounded-lg border-2 border-border bg-muted/30 font-bold text-xs text-muted-foreground hover:bg-destructive/10 transition-colors">
          ✕
        </button>
      </div>
      {finished && (
        <div>
          <p className="font-display font-bold text-foreground text-lg mb-1">🏆 Puzzle Complete!</p>
          <p className="text-sm text-muted-foreground">Solved with {errors} errors</p>
          <button onClick={reset} className="mt-3 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}
