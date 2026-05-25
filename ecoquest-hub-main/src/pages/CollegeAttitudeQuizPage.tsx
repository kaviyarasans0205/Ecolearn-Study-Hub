import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, XCircle, RotateCcw, ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  type Question,
  NUMBER_SYSTEM_QUESTIONS,
  PROBLEMS_ON_NUMBERS_QUESTIONS,
  PERCENTAGE_QUESTIONS,
  PROFIT_LOSS_QUESTIONS,
} from "@/data/aptitudeQuestions";

const MATH_QUESTIONS: Question[] = [
  { question: "If x² - 5x + 6 = 0, what are the roots?", options: ["2 and 3", "1 and 6", "-2 and -3", "3 and -2"], correct: 0 },
  { question: "What is the derivative of sin(2x)?", options: ["cos(2x)", "2cos(2x)", "-2cos(2x)", "2sin(2x)"], correct: 1 },
  { question: "∫ 2x dx = ?", options: ["x²", "x² + C", "2x² + C", "x + C"], correct: 1 },
  { question: "What is log₁₀(1000)?", options: ["2", "3", "4", "10"], correct: 1 },
  { question: "The sum of first 10 natural numbers is:", options: ["45", "55", "50", "60"], correct: 1 },
  { question: "If P(A) = 0.3 and P(B) = 0.4, P(A∩B) = 0.12, are A and B independent?", options: ["Yes", "No", "Cannot determine", "Always dependent"], correct: 0 },
  { question: "What is the determinant of [[1,2],[3,4]]?", options: ["-2", "2", "10", "-10"], correct: 0 },
  { question: "The value of lim(x→0) sin(x)/x is:", options: ["0", "1", "∞", "undefined"], correct: 1 },
  { question: "How many permutations of 5 objects taken 3 at a time?", options: ["60", "10", "120", "20"], correct: 0 },
  { question: "What is the standard deviation of {2, 4, 4, 4, 5, 5, 7, 9}?", options: ["2", "4", "3", "5"], correct: 0 },
  { question: "The equation of a circle with center (0,0) and radius 5 is:", options: ["x²+y²=25", "x²+y²=5", "x+y=5", "x²-y²=25"], correct: 0 },
  { question: "What is 15! / 13!?", options: ["210", "15", "30", "105"], correct: 0 },
  { question: "The HCF of 12 and 18 is:", options: ["6", "3", "12", "36"], correct: 0 },
  { question: "What is the slope of the line 3x + 4y = 12?", options: ["-3/4", "3/4", "-4/3", "4/3"], correct: 0 },
  { question: "If f(x) = x³, then f''(2) = ?", options: ["12", "6", "8", "24"], correct: 0 },
];

const GRAMMAR_QUESTIONS: Question[] = [
  { question: "Choose the correct sentence:", options: ["He don't know", "He doesn't know", "He didn't knew", "He not know"], correct: 1 },
  { question: "Identify the passive voice:", options: ["She wrote a letter", "A letter was written by her", "She is writing", "She writes letters"], correct: 1 },
  { question: "The synonym of 'Benevolent' is:", options: ["Kind", "Cruel", "Angry", "Lazy"], correct: 0 },
  { question: "Which is a compound sentence?", options: ["I ran fast.", "I ran fast, but I missed the bus.", "Running fast.", "The fast runner."], correct: 1 },
  { question: "The antonym of 'Verbose' is:", options: ["Concise", "Wordy", "Lengthy", "Detailed"], correct: 0 },
  { question: "'She has been working since morning.' The tense is:", options: ["Present Perfect", "Present Perfect Continuous", "Past Continuous", "Simple Present"], correct: 1 },
  { question: "Identify the correct indirect speech: He said, 'I am tired.'", options: ["He said that he is tired", "He said that he was tired", "He said that he were tired", "He said he am tired"], correct: 1 },
  { question: "A word that modifies a verb is called:", options: ["Adjective", "Adverb", "Noun", "Pronoun"], correct: 1 },
  { question: "'Break the ice' means:", options: ["Shatter ice", "Start a conversation", "Cool down", "Freeze"], correct: 1 },
  { question: "Which sentence uses the correct article?", options: ["An university", "A university", "The university of", "University a"], correct: 1 },
  { question: "The plural of 'analysis' is:", options: ["Analysises", "Analyses", "Analysi", "Analysis"], correct: 1 },
  { question: "'Despite the rain, they played.' — 'Despite' is a:", options: ["Conjunction", "Preposition", "Adverb", "Adjective"], correct: 1 },
  { question: "Choose the correctly punctuated sentence:", options: ["Its a good day.", "It's a good day.", "Its' a good day.", "It,s a good day."], correct: 1 },
  { question: "The figure of speech in 'The wind howled' is:", options: ["Simile", "Metaphor", "Personification", "Hyperbole"], correct: 2 },
  { question: "Which word is a conjunction?", options: ["Quickly", "Although", "Beautiful", "Running"], correct: 1 },
];

const GROUP_DECISION_QUESTIONS: Question[] = [
  { question: "In a team conflict, the best first step is:", options: ["Ignore it", "Listen to both sides", "Pick a side", "Escalate immediately"], correct: 1 },
  { question: "Effective brainstorming requires:", options: ["Criticizing ideas early", "Building on others' ideas", "Only expert opinions", "Individual work only"], correct: 1 },
  { question: "When a team member disagrees, you should:", options: ["Override them", "Understand their perspective", "Remove them", "Ignore them"], correct: 1 },
  { question: "The best leadership style for creative tasks is:", options: ["Autocratic", "Democratic", "Laissez-faire", "Dictatorial"], correct: 1 },
  { question: "Groupthink can be prevented by:", options: ["Encouraging conformity", "Assigning a devil's advocate", "Limiting discussion", "Avoiding diverse opinions"], correct: 1 },
  { question: "Effective delegation requires:", options: ["Doing everything yourself", "Clear instructions and trust", "Micromanaging", "Random assignment"], correct: 1 },
  { question: "In consensus building, the goal is:", options: ["Everyone agrees 100%", "Majority rules", "Everyone can live with the decision", "Leader decides alone"], correct: 2 },
  { question: "Active listening involves:", options: ["Interrupting with solutions", "Maintaining eye contact and paraphrasing", "Multitasking while listening", "Preparing your response"], correct: 1 },
  { question: "The Delphi technique is used for:", options: ["Speed dating", "Anonymous expert consensus", "Physical exercises", "Cooking"], correct: 1 },
  { question: "A SWOT analysis examines:", options: ["Strengths, Weaknesses, Opportunities, Threats", "Speed, Width, Output, Time", "Sales, Work, Operations, Tasks", "None of these"], correct: 0 },
  { question: "Conflict resolution through compromise means:", options: ["One side wins", "Both sides give up something", "Avoiding the issue", "Fighting it out"], correct: 1 },
  { question: "Which is NOT a stage of team development (Tuckman)?", options: ["Forming", "Storming", "Performing", "Competing"], correct: 3 },
  { question: "Emotional intelligence in leadership includes:", options: ["Suppressing emotions", "Self-awareness and empathy", "Ignoring team feelings", "Being emotionless"], correct: 1 },
  { question: "The best way to handle meeting deadlocks is:", options: ["End the meeting", "Take a break and revisit", "Force a vote", "Give up"], correct: 1 },
  { question: "Effective feedback should be:", options: ["Vague and general", "Specific and constructive", "Only negative", "Given annually"], correct: 1 },
];

const CATEGORIES = [
  { label: "📐 Mathematics", key: "math", questions: MATH_QUESTIONS },
  { label: "📖 Grammar", key: "grammar", questions: GRAMMAR_QUESTIONS },
  { label: "🤝 Group Decision", key: "group", questions: GROUP_DECISION_QUESTIONS },
  { label: "🔢 Number System", key: "numbers", questions: NUMBER_SYSTEM_QUESTIONS },
  { label: "🧮 Problems on Numbers", key: "problems", questions: PROBLEMS_ON_NUMBERS_QUESTIONS },
  { label: "💯 Percentage", key: "percentage", questions: PERCENTAGE_QUESTIONS },
  { label: "💰 Profit & Loss", key: "profitloss", questions: PROFIT_LOSS_QUESTIONS },
];

const QUESTIONS_PER_ROUND = 10;

export default function CollegeAttitudeQuizPage() {
  const [activeCategory, setActiveCategory] = useState("math");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [roundQuestions, setRoundQuestions] = useState<Question[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const startRound = (catKey: string) => {
    const cat = CATEGORIES.find(c => c.key === catKey)!;
    const shuffled = [...cat.questions].sort(() => Math.random() - 0.5).slice(0, QUESTIONS_PER_ROUND);
    setRoundQuestions(shuffled);
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setSaved(false);
  };

  useEffect(() => {
    startRound(activeCategory);
  }, [activeCategory]);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === roundQuestions[currentQ].correct) setScore(s => s + 1);
    setTimeout(() => {
      if (currentQ < roundQuestions.length - 1) {
        setCurrentQ(c => c + 1);
        setSelected(null);
      } else {
        setFinished(true);
      }
    }, 1000);
  };

  const saveResult = async () => {
    if (!user || saved) return;
    const catLabel = CATEGORIES.find(c => c.key === activeCategory)!.label;
    const xp = score * 30;
    try {
      await supabase.from("quiz_results").insert({
        user_id: user.id, quiz_name: `Attitude Quiz - ${catLabel}`,
        score, total_questions: roundQuestions.length, xp_earned: xp,
      });
      await supabase.from("profiles").update({
        total_xp: (await supabase.from("profiles").select("total_xp").eq("user_id", user.id).single()).data!.total_xp + xp,
      }).eq("user_id", user.id);
      setSaved(true);
      toast.success(`+${xp} XP saved! 🎓`);
    } catch { toast.error("Failed to save"); }
  };

  useEffect(() => { if (finished && user && !saved) saveResult(); }, [finished]);

  const q = roundQuestions[currentQ];

  return (
    <div className="min-h-screen pt-16">
      <section className="gradient-college py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-display font-black text-accent-foreground">
            🧠 Aptitude Quiz
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2 text-accent-foreground/80">
            Math, Grammar, Group Decision, Number System, Percentage, Profit & Loss & more
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6">
            <button
              onClick={() => navigate("/colleges/attitude-learn")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card text-foreground font-display font-bold text-sm shadow-elevated hover:scale-105 transition-transform"
            >
              📚 Learn All Topics
            </button>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v)} className="w-full">
          <TabsList className="mb-6 flex flex-wrap h-auto gap-2 bg-transparent p-0">
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat.key} value={cat.key} className="px-4 py-2 rounded-lg text-sm font-display font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map(cat => (
            <TabsContent key={cat.key} value={cat.key}>
              <div className="bg-card rounded-2xl p-8 shadow-elevated border border-border">
                <AnimatePresence mode="wait">
                  {!finished && q ? (
                    <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-semibold text-muted-foreground">Q {currentQ + 1}/{roundQuestions.length}</span>
                        <span className="text-xs font-bold text-secondary">Score: {score}</span>
                      </div>
                      <h3 className="text-lg font-display font-bold text-foreground mb-6">{q.question}</h3>
                      <div className="space-y-3">
                        {q.options.map((opt, idx) => {
                          const isCorrect = idx === q.correct;
                          const isSel = selected === idx;
                          let style = "bg-muted/50 border-border hover:border-primary/50";
                          if (selected !== null) {
                            if (isCorrect) style = "bg-primary/10 border-primary";
                            else if (isSel) style = "bg-destructive/10 border-destructive";
                          }
                          return (
                            <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between ${style}`}>
                              <span className="font-medium text-foreground">{opt}</span>
                              {selected !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-primary" />}
                              {selected !== null && isSel && !isCorrect && <XCircle className="w-5 h-5 text-destructive" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : finished ? (
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                      <div className="text-6xl mb-4">{score >= 8 ? "🏆" : score >= 5 ? "👏" : "📚"}</div>
                      <h3 className="text-2xl font-display font-bold text-foreground">{score}/{roundQuestions.length} Correct!</h3>
                      <p className="mt-2 text-muted-foreground">You earned <span className="font-bold text-secondary">+{score * 30} XP</span></p>
                      {!user && <p className="mt-2 text-xs text-muted-foreground"><button onClick={() => navigate("/auth")} className="text-primary font-semibold hover:underline">Sign in</button> to save!</p>}
                      {saved && <p className="mt-1 text-xs text-primary font-semibold">✓ Result saved!</p>}
                      <button onClick={() => startRound(activeCategory)} className="mt-6 px-6 py-3 rounded-xl gradient-college text-accent-foreground font-display font-bold text-sm inline-flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> New Round
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
