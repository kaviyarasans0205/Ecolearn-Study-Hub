import { useState, useEffect, useCallback, useRef } from "react";
import { RotateCcw } from "lucide-react";

const GRID = 15;
const CELL = 22;
const SPEED = 150;

type Pos = { x: number; y: number };
type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";

const FOOD_EMOJIS = ["🌱", "🍎", "🌻", "♻️", "🌿"];

interface Props { onFinish: (score: number, total: number) => void; }

export default function SnakeGame({ onFinish }: Props) {
  const [snake, setSnake] = useState<Pos[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Pos>({ x: 3, y: 3 });
  const [foodEmoji, setFoodEmoji] = useState("🌱");
  const [dir, setDir] = useState<Dir>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const dirRef = useRef(dir);
  dirRef.current = dir;

  const spawnFood = useCallback((s: Pos[]) => {
    let pos: Pos;
    do { pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }; }
    while (s.some(p => p.x === pos.x && p.y === pos.y));
    setFood(pos);
    setFoodEmoji(FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)]);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!started) setStarted(true);
      const map: Record<string, Dir> = { ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT", w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT" };
      const newDir = map[e.key];
      if (!newDir) return;
      e.preventDefault();
      const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
      if (newDir !== opp[dirRef.current]) setDir(newDir);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [started]);

  useEffect(() => {
    if (!started || gameOver) return;
    const tick = setInterval(() => {
      setSnake(prev => {
        const head = { ...prev[0] };
        if (dirRef.current === "UP") head.y--;
        if (dirRef.current === "DOWN") head.y++;
        if (dirRef.current === "LEFT") head.x--;
        if (dirRef.current === "RIGHT") head.x++;
        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || prev.some(p => p.x === head.x && p.y === head.y)) {
          setGameOver(true);
          onFinish(score, 10);
          return prev;
        }
        const next = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          spawnFood(next);
        } else {
          next.pop();
        }
        return next;
      });
    }, SPEED);
    return () => clearInterval(tick);
  }, [started, gameOver, food, spawnFood, score, onFinish]);

  const reset = () => {
    setSnake([{ x: 7, y: 7 }]);
    setDir("RIGHT");
    setFood({ x: 3, y: 3 });
    setScore(0);
    setGameOver(false);
    setStarted(false);
  };

  const handleTouch = (d: Dir) => {
    if (!started) setStarted(true);
    const opp: Record<Dir, Dir> = { UP: "DOWN", DOWN: "UP", LEFT: "RIGHT", RIGHT: "LEFT" };
    if (d !== opp[dirRef.current]) setDir(d);
  };

  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground mb-2">Score: {score} 🌱</p>
      <div className="relative mx-auto border-2 border-border rounded-xl overflow-hidden bg-muted/20" style={{ width: GRID * CELL, height: GRID * CELL }}>
        {!started && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 z-10">
            <p className="font-display font-bold text-foreground text-sm">Press arrow keys or WASD to start</p>
          </div>
        )}
        {snake.map((p, i) => (
          <div key={i} className={`absolute rounded-sm ${i === 0 ? "bg-primary" : "bg-primary/60"}`} style={{ left: p.x * CELL, top: p.y * CELL, width: CELL - 1, height: CELL - 1 }} />
        ))}
        <div className="absolute flex items-center justify-center text-sm" style={{ left: food.x * CELL, top: food.y * CELL, width: CELL, height: CELL }}>
          {foodEmoji}
        </div>
      </div>
      {/* Mobile controls */}
      <div className="mt-4 grid grid-cols-3 gap-1 max-w-[150px] mx-auto md:hidden">
        <div />
        <button onClick={() => handleTouch("UP")} className="py-2 rounded-lg bg-muted text-foreground font-bold">▲</button>
        <div />
        <button onClick={() => handleTouch("LEFT")} className="py-2 rounded-lg bg-muted text-foreground font-bold">◀</button>
        <button onClick={() => handleTouch("DOWN")} className="py-2 rounded-lg bg-muted text-foreground font-bold">▼</button>
        <button onClick={() => handleTouch("RIGHT")} className="py-2 rounded-lg bg-muted text-foreground font-bold">▶</button>
      </div>
      {gameOver && (
        <div className="mt-4">
          <p className="font-display font-bold text-foreground text-lg">Game Over! Score: {score}</p>
          <button onClick={reset} className="mt-3 px-5 py-2 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
}