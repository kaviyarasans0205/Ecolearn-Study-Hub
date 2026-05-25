import { motion } from "framer-motion";
import { useState } from "react";
import { Gamepad2, RotateCcw, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import TicTacToe from "@/components/games/TicTacToe";
import MemoryMatch from "@/components/games/MemoryMatch";
import WordScramble from "@/components/games/WordScramble";
import SnakeGame from "@/components/games/SnakeGame";
import ChessGame from "@/components/games/ChessGame";
import CarromGame from "@/components/games/CarromGame";
import SudokuGame from "@/components/games/SudokuGame";
import Game2048 from "@/components/games/Game2048";
import HangmanGame from "@/components/games/HangmanGame";
import MathSprintGame from "@/components/games/MathSprintGame";
import TypingSpeedGame from "@/components/games/TypingSpeedGame";
import SimonSaysGame from "@/components/games/SimonSaysGame";
import ConnectFourGame from "@/components/games/ConnectFourGame";
import WhackAMoleGame from "@/components/games/WhackAMoleGame";
import { usePlaytimeLimit } from "@/hooks/usePlaytimeLimit";
import { PlaytimeBanner, LockedScreen } from "@/components/PlaytimeBanner";

const wasteItems = [
  { name: "Banana Peel", emoji: "🍌", bin: "organic" },
  { name: "Plastic Bottle", emoji: "🧴", bin: "recyclable" },
  { name: "Old Battery", emoji: "🔋", bin: "hazardous" },
  { name: "Newspaper", emoji: "📰", bin: "recyclable" },
  { name: "Apple Core", emoji: "🍎", bin: "organic" },
  { name: "Glass Jar", emoji: "🫙", bin: "recyclable" },
  { name: "Paint Can", emoji: "🎨", bin: "hazardous" },
  { name: "Tea Leaves", emoji: "🍵", bin: "organic" },
];

const bins = [
  { type: "organic", label: "🟢 Organic", color: "border-primary bg-primary/5" },
  { type: "recyclable", label: "🔵 Recyclable", color: "border-accent bg-accent/5" },
  { type: "hazardous", label: "🔴 Hazardous", color: "border-destructive bg-destructive/5" },
];

const GAME_LIST = [
  { id: "waste-sort", emoji: "♻️", title: "Waste Sorting", desc: "Sort items into the correct bins!", difficulty: "Easy", xp: 200 },
  { id: "tic-tac-toe", emoji: "❌", title: "Tic Tac Toe", desc: "Play against AI in best of 3!", difficulty: "Easy", xp: 150 },
  { id: "memory", emoji: "🧠", title: "Memory Match", desc: "Find all matching eco-themed pairs!", difficulty: "Easy", xp: 200 },
  { id: "word-scramble", emoji: "🔤", title: "Word Scramble", desc: "Unscramble environmental words!", difficulty: "Medium", xp: 250 },
  { id: "snake", emoji: "🐍", title: "Eco Snake", desc: "Collect eco items, grow your snake!", difficulty: "Medium", xp: 300 },
  { id: "chess", emoji: "♟️", title: "Chess", desc: "Classic 2-player chess game!", difficulty: "Hard", xp: 400 },
  { id: "carrom", emoji: "🏏", title: "Carrom", desc: "Flick coins into the right pockets!", difficulty: "Medium", xp: 250 },
  { id: "sudoku", emoji: "🔢", title: "Sudoku", desc: "Fill the 9×9 grid with logic!", difficulty: "Medium", xp: 300 },
  { id: "2048", emoji: "🎲", title: "2048", desc: "Slide tiles and reach 2048!", difficulty: "Medium", xp: 300 },
  { id: "hangman", emoji: "💀", title: "Hangman", desc: "Guess the eco word before time runs out!", difficulty: "Easy", xp: 200 },
  { id: "math-sprint", emoji: "🧮", title: "Math Sprint", desc: "Solve 10 math problems against the clock!", difficulty: "Medium", xp: 250 },
  { id: "typing", emoji: "⌨️", title: "Typing Speed", desc: "How fast can you type eco sentences?", difficulty: "Easy", xp: 200 },
  { id: "simon", emoji: "🎵", title: "Simon Says", desc: "Repeat the color sequence!", difficulty: "Medium", xp: 250 },
  { id: "connect4", emoji: "🔴", title: "Connect Four", desc: "Connect 4 discs in a row vs AI!", difficulty: "Medium", xp: 300 },
  { id: "whack", emoji: "🌱", title: "Whack-A-Sprout", desc: "Tap the sprouts before they hide!", difficulty: "Easy", xp: 200 },
];

export default function SchoolGamesPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const playtime = usePlaytimeLimit(activeGame !== null);

  const saveGameScore = async (gameName: string, gameScore: number, xpBase: number, total: number) => {
    if (!user || saved) return;
    const xpEarned = Math.round((gameScore / Math.max(total, 1)) * xpBase);
    try {
      await supabase.from("game_scores").insert({ user_id: user.id, game_name: gameName, score: gameScore, xp_earned: xpEarned });
      const { data } = await supabase.from("profiles").select("total_xp").eq("user_id", user.id).single();
      if (data) await supabase.from("profiles").update({ total_xp: data.total_xp + xpEarned }).eq("user_id", user.id);
      setSaved(true);
      toast.success(`+${xpEarned} XP saved! 🌱`);
    } catch {
      toast.error("Failed to save score");
    }
  };

  const handleBinClick = (binType: string) => {
    if (feedback || finished) return;
    const isCorrect = wasteItems[currentItem].bin === binType;
    if (isCorrect) setScore(s => s + 1);
    else setWrong(w => w + 1);
    setFeedback(isCorrect ? "correct" : "wrong");
    setTimeout(() => {
      setFeedback(null);
      if (currentItem < wasteItems.length - 1) {
        setCurrentItem(c => c + 1);
      } else {
        setFinished(true);
      }
    }, 800);
  };

  if (finished && !saved && user && activeGame === "waste-sort") {
    saveGameScore("Waste Sorting Challenge", score, 200, wasteItems.length);
  }

  const resetAll = () => {
    setActiveGame(null);
    setCurrentItem(0);
    setScore(0);
    setWrong(0);
    setFeedback(null);
    setFinished(false);
    setSaved(false);
  };

  const gameInfo = GAME_LIST.find(g => g.id === activeGame);

  const handleGameFinish = (gameName: string, xpBase: number) => (gameScore: number, total: number) => {
    saveGameScore(gameName, gameScore, xpBase, total);
  };

  return (
    <div className="min-h-screen pt-16">
      <section className="gradient-school py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-display font-black text-primary-foreground flex items-center justify-center gap-3">
            <Gamepad2 className="w-8 h-8" /> Fun Learning Games
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2 text-primary-foreground/80">
            Play interactive games and earn XP! 🌱
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <PlaytimeBanner remainingMs={playtime.remainingMs} resetInMs={playtime.resetInMs} isLocked={playtime.isLocked} dailyLimitMs={playtime.DAILY_LIMIT_MS} usedMs={playtime.usedMs} />
        {playtime.isLocked ? (
          <LockedScreen resetInMs={playtime.resetInMs} />
        ) : !activeGame ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {GAME_LIST.map((g, i) => (
              <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                onClick={() => { resetAll(); setActiveGame(g.id); }}
                className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-elevated transition-shadow cursor-pointer group">
                <div className="text-4xl mb-3">{g.emoji}</div>
                <h3 className="font-display font-bold text-foreground text-lg">{g.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{g.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    g.difficulty === "Easy" ? "bg-primary/10 text-primary" :
                    g.difficulty === "Medium" ? "bg-secondary/10 text-secondary" :
                    "bg-destructive/10 text-destructive"
                  }`}>{g.difficulty}</span>
                  <span className="text-xs font-display font-bold text-secondary">+{g.xp} XP</span>
                </div>
                <div className="mt-3 text-xs text-accent font-semibold group-hover:translate-x-1 transition-transform">
                  Play Now →
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            <button onClick={resetAll} className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Games
            </button>
            <div className="bg-card rounded-2xl p-8 shadow-elevated border border-border">
              <h2 className="text-xl font-display font-bold text-foreground mb-2 text-center">
                {gameInfo?.emoji} {gameInfo?.title}
              </h2>

              {activeGame === "waste-sort" && (
                <>
                  <p className="text-sm text-muted-foreground mb-6 text-center">Sort each item into the correct bin!</p>
                  {!finished ? (
                    <>
                      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                        <span>Item {currentItem + 1}/{wasteItems.length}</span>
                        <span className="flex items-center gap-3">
                          <span className="text-primary font-bold">✓ {score}</span>
                          <span className="text-destructive font-bold">✗ {wrong}</span>
                        </span>
                      </div>
                      <motion.div key={currentItem} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className={`text-center py-8 rounded-xl mb-6 border-2 transition-colors ${
                          feedback === "correct" ? "border-primary bg-primary/5" :
                          feedback === "wrong" ? "border-destructive bg-destructive/5" :
                          "border-border bg-muted/30"
                        }`}>
                        <span className="text-6xl">{wasteItems[currentItem].emoji}</span>
                        <p className="mt-3 font-display font-bold text-foreground text-lg">{wasteItems[currentItem].name}</p>
                        {feedback && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex items-center justify-center gap-1">
                            {feedback === "correct" ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <XCircle className="w-5 h-5 text-destructive" />}
                            <span className={`text-sm font-semibold ${feedback === "correct" ? "text-primary" : "text-destructive"}`}>
                              {feedback === "correct" ? "Correct!" : `Wrong! → ${wasteItems[currentItem].bin}`}
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                      <div className="grid grid-cols-3 gap-3">
                        {bins.map(bin => (
                          <button key={bin.type} onClick={() => handleBinClick(bin.type)}
                            className={`py-4 rounded-xl border-2 font-display font-bold text-sm transition-all hover:scale-105 ${bin.color}`}>
                            {bin.label}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
                        {score === wasteItems.length ? "🏆" : score >= wasteItems.length / 2 ? "👏" : "💪"}
                      </motion.div>
                      <h3 className="text-2xl font-display font-bold text-foreground">{score}/{wasteItems.length} Correct!</h3>
                      <p className="mt-2 text-muted-foreground">You earned <span className="font-bold text-secondary">+{Math.round((score / wasteItems.length) * 200)} XP</span></p>
                      {!user && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          <button onClick={() => navigate("/auth")} className="text-primary font-semibold hover:underline">Sign in</button> to save your score!
                        </p>
                      )}
                      {saved && <p className="mt-1 text-xs text-primary font-semibold">✓ Score saved!</p>}
                      <button onClick={() => { setCurrentItem(0); setScore(0); setWrong(0); setFeedback(null); setFinished(false); setSaved(false); }}
                        className="mt-6 px-6 py-3 rounded-xl gradient-school text-primary-foreground font-display font-bold text-sm flex items-center gap-2 mx-auto">
                        <RotateCcw className="w-4 h-4" /> Play Again
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeGame === "tic-tac-toe" && <TicTacToe onFinish={handleGameFinish("Tic Tac Toe", 150)} />}
              {activeGame === "memory" && <MemoryMatch onFinish={handleGameFinish("Memory Match", 200)} />}
              {activeGame === "word-scramble" && <WordScramble onFinish={handleGameFinish("Word Scramble", 250)} />}
              {activeGame === "snake" && <SnakeGame onFinish={handleGameFinish("Eco Snake", 300)} />}
              {activeGame === "chess" && <ChessGame onFinish={handleGameFinish("Chess", 400)} />}
              {activeGame === "carrom" && <CarromGame onFinish={handleGameFinish("Carrom", 250)} />}
              {activeGame === "sudoku" && <SudokuGame onFinish={handleGameFinish("Sudoku", 300)} />}
              {activeGame === "2048" && <Game2048 onFinish={handleGameFinish("2048", 300)} />}
              {activeGame === "hangman" && <HangmanGame onFinish={handleGameFinish("Hangman", 200)} />}
              {activeGame === "math-sprint" && <MathSprintGame onFinish={handleGameFinish("Math Sprint", 250)} />}
              {activeGame === "typing" && <TypingSpeedGame onFinish={handleGameFinish("Typing Speed", 200)} />}
              {activeGame === "simon" && <SimonSaysGame onFinish={handleGameFinish("Simon Says", 250)} />}
              {activeGame === "connect4" && <ConnectFourGame onFinish={handleGameFinish("Connect Four", 300)} />}
              {activeGame === "whack" && <WhackAMoleGame onFinish={handleGameFinish("Whack-A-Sprout", 200)} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}