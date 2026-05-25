import { useState } from "react";
import { motion } from "framer-motion";
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

interface GameQuestion {
  question: string;
  code?: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUIZ_GAMES: {
  id: string; title: string; emoji: string; desc: string; difficulty: string; xp: number; questions: GameQuestion[];
}[] = [
  {
    id: "code-puzzle", title: "Code Puzzle", emoji: "🧩", desc: "Solve programming logic puzzles!", difficulty: "Easy", xp: 100,
    questions: [
      { question: "What is the output of: print(2 ** 3)?", code: "print(2 ** 3)", options: ["6", "8", "9", "5"], correct: 1, explanation: "** is exponentiation. 2^3 = 8" },
      { question: "What does len('hello') return?", options: ["4", "5", "6", "Error"], correct: 1, explanation: "'hello' has 5 characters" },
      { question: "Which keyword defines a function in Python?", options: ["func", "define", "def", "function"], correct: 2, explanation: "Python uses 'def' to define functions" },
      { question: "What is 10 % 3 in most languages?", options: ["3", "1", "0", "3.33"], correct: 1, explanation: "% is modulo. 10 divided by 3 leaves remainder 1" },
      { question: "What data type is True in Python?", options: ["int", "str", "bool", "float"], correct: 2, explanation: "True and False are boolean values" },
    ],
  },
  {
    id: "algo-challenge", title: "Algorithm Challenge", emoji: "🎯", desc: "Test your algorithm knowledge!", difficulty: "Medium", xp: 200,
    questions: [
      { question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], correct: 1, explanation: "Binary search halves the search space each step → O(log n)" },
      { question: "Which sorting algorithm is best for nearly sorted data?", options: ["Quick Sort", "Merge Sort", "Insertion Sort", "Bubble Sort"], correct: 2, explanation: "Insertion sort runs in O(n) on nearly sorted arrays" },
      { question: "A stack follows which principle?", options: ["FIFO", "LIFO", "LILO", "Random"], correct: 1, explanation: "Stack = Last In, First Out (LIFO)" },
      { question: "What is the space complexity of merge sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correct: 2, explanation: "Merge sort needs O(n) extra space for merging" },
      { question: "Which data structure uses a hash function?", options: ["Array", "HashMap", "LinkedList", "Stack"], correct: 1, explanation: "HashMap uses hash functions to map keys to indices" },
    ],
  },
  {
    id: "debug-detective", title: "Debug Detective", emoji: "🔍", desc: "Find and fix bugs in code!", difficulty: "Easy", xp: 150,
    questions: [
      { question: "What's wrong?\nfor i in range(5)\n  print(i)", options: ["Missing colon after range(5)", "Wrong indentation", "range() needs 2 args", "print is not a function"], correct: 0, explanation: "Python for loops need a colon: for i in range(5):" },
      { question: "Bug in Java:\nint[] arr = new int[5];\narr[5] = 10;", options: ["Wrong type", "ArrayIndexOutOfBounds", "Null pointer", "Syntax error"], correct: 1, explanation: "Array of size 5 has indices 0-4. arr[5] is out of bounds." },
      { question: "What's the issue?\nx = '5'\ny = x + 3", options: ["Nothing wrong", "TypeError: can't add str and int", "NameError", "SyntaxError"], correct: 1, explanation: "Can't concatenate string '5' with integer 3 directly" },
      { question: "Bug?\ndef greet(name):\n  return 'Hello ' + name\ngreet()", options: ["Missing return", "TypeError: missing argument", "IndentationError", "Nothing wrong"], correct: 1, explanation: "greet() requires 1 argument 'name' but none was given" },
      { question: "Issue in SQL?\nSELECT * FORM users;", options: ["Missing WHERE", "FORM should be FROM", "Missing semicolon", "Wrong wildcard"], correct: 1, explanation: "Typo: FORM should be FROM" },
    ],
  },
  {
    id: "security-quest", title: "Security Quest", emoji: "🔐", desc: "Find vulnerabilities in code!", difficulty: "Hard", xp: 350,
    questions: [
      { question: "Which attack does SQL injection exploit?", options: ["Buffer overflow", "Unsanitized user input in queries", "Cross-site scripting", "Man in the middle"], correct: 1, explanation: "SQL injection exploits unsanitized input in database queries" },
      { question: "What does HTTPS provide over HTTP?", options: ["Speed", "Encryption", "Caching", "Compression"], correct: 1, explanation: "HTTPS encrypts data in transit using TLS/SSL" },
      { question: "What is XSS?", options: ["Server crash", "Injecting scripts into web pages", "Password cracking", "DNS spoofing"], correct: 1, explanation: "Cross-Site Scripting injects malicious scripts into web pages" },
      { question: "Best practice for storing passwords?", options: ["Plain text", "Base64 encoding", "Hashing with salt", "Encryption"], correct: 2, explanation: "Passwords should be hashed with a unique salt (e.g., bcrypt)" },
      { question: "What does CORS protect against?", options: ["SQL injection", "Unauthorized cross-origin requests", "XSS", "DDoS"], correct: 1, explanation: "CORS controls which origins can access a resource" },
    ],
  },
  {
    id: "ai-trainer", title: "AI Trainer", emoji: "🤖", desc: "Test your AI & ML knowledge!", difficulty: "Hard", xp: 400,
    questions: [
      { question: "What type of learning uses labeled data?", options: ["Unsupervised", "Supervised", "Reinforcement", "Transfer"], correct: 1, explanation: "Supervised learning trains on labeled input-output pairs" },
      { question: "What does overfitting mean?", options: ["Model too simple", "Model memorizes training data", "Model is perfect", "Model can't learn"], correct: 1, explanation: "Overfitting: model performs well on training data but poorly on new data" },
      { question: "Which activation function outputs 0 to 1?", options: ["ReLU", "Sigmoid", "Tanh", "Linear"], correct: 1, explanation: "Sigmoid function maps any input to a value between 0 and 1" },
      { question: "K-means is which type of learning?", options: ["Supervised", "Unsupervised", "Reinforcement", "Semi-supervised"], correct: 1, explanation: "K-means clustering is an unsupervised learning algorithm" },
      { question: "What is a neural network 'epoch'?", options: ["Single data point", "One pass through entire dataset", "A layer", "A weight update"], correct: 1, explanation: "An epoch is one complete pass through the entire training dataset" },
    ],
  },
];

const FUN_GAMES = [
  { id: "tic-tac-toe", emoji: "❌", title: "Tic Tac Toe", desc: "Play against AI!", difficulty: "Easy", xp: 150 },
  { id: "memory", emoji: "🧠", title: "Memory Match", desc: "Find matching pairs!", difficulty: "Easy", xp: 200 },
  { id: "word-scramble", emoji: "🔤", title: "Word Scramble", desc: "Unscramble words!", difficulty: "Medium", xp: 250 },
  { id: "snake", emoji: "🐍", title: "Snake", desc: "Classic snake game!", difficulty: "Medium", xp: 300 },
  { id: "chess", emoji: "♟️", title: "Chess", desc: "2-player chess!", difficulty: "Hard", xp: 400 },
  { id: "carrom", emoji: "🏏", title: "Carrom", desc: "Flick coins to pockets!", difficulty: "Medium", xp: 250 },
  { id: "sudoku", emoji: "🔢", title: "Sudoku", desc: "Logic number puzzle!", difficulty: "Medium", xp: 300 },
  { id: "2048", emoji: "🎲", title: "2048", desc: "Slide tiles to win!", difficulty: "Medium", xp: 300 },
  { id: "hangman", emoji: "💀", title: "Hangman", desc: "Guess the word!", difficulty: "Easy", xp: 200 },
  { id: "math-sprint", emoji: "🧮", title: "Math Sprint", desc: "Speed math challenge!", difficulty: "Medium", xp: 250 },
  { id: "typing", emoji: "⌨️", title: "Typing Speed", desc: "Test your typing speed!", difficulty: "Easy", xp: 200 },
  { id: "simon", emoji: "🎵", title: "Simon Says", desc: "Memorize color sequences!", difficulty: "Medium", xp: 250 },
  { id: "connect4", emoji: "🔴", title: "Connect Four", desc: "Beat AI in 4-in-a-row!", difficulty: "Medium", xp: 300 },
  { id: "whack", emoji: "🌱", title: "Whack-A-Sprout", desc: "Reflex tapping game!", difficulty: "Easy", xp: 200 },
];

const ALL_GAMES = [
  ...QUIZ_GAMES.map(g => ({ ...g, type: "quiz" as const })),
  ...FUN_GAMES.map(g => ({ ...g, type: "fun" as const })),
];

type TabType = "all" | "quiz" | "fun";

export default function CollegeGamesPage() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>("all");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const playtime = usePlaytimeLimit(activeGame !== null);

  const quizGame = QUIZ_GAMES.find(g => g.id === activeGame);

  const saveScore = async (gameName: string, gameScore: number, xpBase: number, total: number) => {
    if (!user || saved) return;
    const xpEarned = Math.round((gameScore / Math.max(total, 1)) * xpBase);
    try {
      await supabase.from("game_scores").insert({ user_id: user.id, game_name: gameName, score: gameScore, xp_earned: xpEarned });
      const { data } = await supabase.from("profiles").select("total_xp").eq("user_id", user.id).single();
      if (data) await supabase.from("profiles").update({ total_xp: data.total_xp + xpEarned }).eq("user_id", user.id);
      setSaved(true);
      toast.success(`+${xpEarned} XP saved! 🎮`);
    } catch { toast.error("Failed to save score"); }
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null || !quizGame) return;
    setSelected(idx);
    if (idx === quizGame.questions[currentQ].correct) setScore(s => s + 1);
    setTimeout(() => {
      if (currentQ < quizGame.questions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
      } else {
        setFinished(true);
      }
    }, 1000);
  };

  if (finished && user && !saved && quizGame) {
    saveScore(quizGame.title, score, quizGame.xp, quizGame.questions.length);
  }

  const reset = () => { setActiveGame(null); setCurrentQ(0); setSelected(null); setScore(0); setFinished(false); setSaved(false); };
  const handleGameFinish = (gameName: string, xpBase: number) => (gameScore: number, total: number) => { saveScore(gameName, gameScore, xpBase, total); };

  const filteredGames = tab === "all" ? ALL_GAMES : ALL_GAMES.filter(g => g.type === tab);
  const activeGameInfo = ALL_GAMES.find(g => g.id === activeGame);
  const isFunGame = FUN_GAMES.some(g => g.id === activeGame);

  return (
    <div className="min-h-screen pt-16">
      <section className="gradient-college py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-display font-black text-accent-foreground flex items-center justify-center gap-3">
            <Gamepad2 className="w-8 h-8" /> College Game Hub
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2 text-accent-foreground/80">
            Quiz challenges + fun arcade games — all with XP rewards! 🎮
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <PlaytimeBanner remainingMs={playtime.remainingMs} resetInMs={playtime.resetInMs} isLocked={playtime.isLocked} dailyLimitMs={playtime.DAILY_LIMIT_MS} usedMs={playtime.usedMs} />
        {playtime.isLocked ? (
          <LockedScreen resetInMs={playtime.resetInMs} />
        ) : !activeGame ? (
          <>
            <div className="flex gap-2 mb-6">
              {(["all", "quiz", "fun"] as TabType[]).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-display font-bold border transition-colors ${
                    tab === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"
                  }`}>
                  {t === "all" ? "🎮 All Games" : t === "quiz" ? "🧩 Quiz Games" : "🕹️ Fun Games"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredGames.map((g, i) => (
                <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  onClick={() => { reset(); setActiveGame(g.id); }}
                  className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-elevated transition-shadow cursor-pointer group">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl mb-3">{g.emoji}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${g.type === "quiz" ? "bg-accent/10 text-accent" : "bg-secondary/10 text-secondary"}`}>
                      {g.type === "quiz" ? "QUIZ" : "FUN"}
                    </span>
                  </div>
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
                  <div className="mt-3 text-xs text-accent font-semibold group-hover:translate-x-1 transition-transform">Play Now →</div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="max-w-xl mx-auto">
            <button onClick={reset} className="text-sm text-muted-foreground hover:text-foreground mb-4 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Back to Games
            </button>
            <div className="bg-card rounded-2xl p-8 shadow-elevated border border-border">
              <h2 className="text-xl font-display font-bold text-foreground mb-2 text-center">
                {activeGameInfo?.emoji} {activeGameInfo?.title}
              </h2>

              {/* Quiz game rendering */}
              {quizGame && !isFunGame && !finished && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Q{currentQ + 1}/{quizGame.questions.length}</span>
                  </div>
                  <div className="flex gap-1 mb-6">
                    {quizGame.questions.map((_, i) => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= currentQ ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                  <h3 className="text-lg font-display font-bold text-foreground mb-1 whitespace-pre-line">{quizGame.questions[currentQ].question}</h3>
                  {quizGame.questions[currentQ].code && (
                    <pre className="bg-muted rounded-lg p-3 text-sm font-mono text-foreground mb-4 overflow-x-auto">{quizGame.questions[currentQ].code}</pre>
                  )}
                  <div className="space-y-3 mt-4">
                    {quizGame.questions[currentQ].options.map((opt, idx) => {
                      const isCorrect = idx === quizGame.questions[currentQ].correct;
                      const isSelected = selected === idx;
                      let style = "bg-muted/50 border-border hover:border-primary/50";
                      if (selected !== null) {
                        if (isCorrect) style = "bg-primary/10 border-primary";
                        else if (isSelected) style = "bg-destructive/10 border-destructive";
                      }
                      return (
                        <button key={idx} onClick={() => handleAnswer(idx)}
                          className={`w-full text-left px-5 py-3 rounded-xl border-2 transition-all flex items-center justify-between ${style}`}>
                          <span className="font-medium text-foreground text-sm">{opt}</span>
                          {selected !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-primary" />}
                          {selected !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive" />}
                        </button>
                      );
                    })}
                  </div>
                  {selected !== null && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
                      💡 {quizGame.questions[currentQ].explanation}
                    </motion.p>
                  )}
                </>
              )}

              {/* Quiz finished */}
              {quizGame && !isFunGame && finished && (
                <div className="text-center py-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
                    {score === quizGame.questions.length ? "🏆" : score >= quizGame.questions.length / 2 ? "👏" : "💪"}
                  </motion.div>
                  <h3 className="text-2xl font-display font-bold text-foreground">{score}/{quizGame.questions.length} Correct!</h3>
                  <p className="mt-2 text-muted-foreground">You earned <span className="font-bold text-secondary">+{Math.round((score / quizGame.questions.length) * quizGame.xp)} XP</span></p>
                  {!user && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      <button onClick={() => navigate("/auth")} className="text-primary font-semibold hover:underline">Sign in</button> to save!
                    </p>
                  )}
                  {saved && <p className="mt-1 text-xs text-primary font-semibold">✓ Score saved!</p>}
                  <div className="mt-6 flex gap-3 justify-center">
                    <button onClick={() => { setCurrentQ(0); setSelected(null); setScore(0); setFinished(false); setSaved(false); }}
                      className="px-5 py-2.5 rounded-xl border-2 border-border font-display font-bold text-sm text-foreground flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" /> Replay
                    </button>
                    <button onClick={reset} className="px-5 py-2.5 rounded-xl gradient-college text-accent-foreground font-display font-bold text-sm">All Games</button>
                  </div>
                </div>
              )}

              {/* Fun games */}
              {activeGame === "tic-tac-toe" && <TicTacToe onFinish={handleGameFinish("Tic Tac Toe", 150)} />}
              {activeGame === "memory" && <MemoryMatch onFinish={handleGameFinish("Memory Match", 200)} />}
              {activeGame === "word-scramble" && <WordScramble onFinish={handleGameFinish("Word Scramble", 250)} />}
              {activeGame === "snake" && <SnakeGame onFinish={handleGameFinish("Snake", 300)} />}
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
