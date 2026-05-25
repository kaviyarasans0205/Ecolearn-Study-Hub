import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, ArrowLeft, Trophy, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function SchoolsQuizPage() {
  const [searchParams] = useSearchParams();
  const cls = searchParams.get("class") || "Class 10";
  const subject = searchParams.get("subject") || "Science";
  const topic = searchParams.get("topic") || "";
  const year = searchParams.get("year") || "";
  const type = searchParams.get("type") || "topic";

  const { user, refreshProfile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    generateQuiz();
  }, [cls, subject, topic, year]);

  const generateQuiz = async () => {
    setLoading(true);
    setCurrentQ(0);
    setScore(0);
    setFinished(false);
    setSelectedAnswer(null);
    setAnswered(false);

    try {
      const prompt = type === "previous_year"
        ? `Generate 10 MCQ questions in the style of TN State Board ${cls} ${year} exam. Cover all subjects. Each question should have 4 options.`
        : `Generate 10 MCQ questions for TN State Board ${cls}, Subject: ${subject}, Topic: ${topic}. Each question should be exam-style with 4 options.`;

      const { data, error } = await supabase.functions.invoke("evaluate-school-quiz", {
        body: { prompt, type: "generate_mcq" },
      });

      if (error) throw error;
      if (data?.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error("Failed to generate quiz:", err);
      toast.error("Failed to generate quiz. Using sample questions.");
      setQuestions(getSampleQuestions(cls, subject));
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    if (idx === questions[currentQ].correct) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = async () => {
    if (currentQ + 1 >= questions.length) {
      setFinished(true);
      // Save score
      if (user) {
        const xpEarned = score * 10;
        const quizName = type === "previous_year" ? `${cls} - ${year} Paper` : `${cls} - ${subject} - ${topic}`;
        await supabase.from("quiz_results").insert({
          user_id: user.id,
          quiz_name: quizName,
          score,
          total_questions: questions.length,
          xp_earned: xpEarned,
        });
        await supabase.from("profiles").update({
          total_xp: (await supabase.from("profiles").select("total_xp").eq("user_id", user.id).single()).data?.total_xp! + xpEarned,
        }).eq("user_id", user.id);
        refreshProfile();
        toast.success(`+${xpEarned} XP earned! 🌱`);
      }
    } else {
      setCurrentQ((c) => c + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-display">Generating quiz questions...</p>
        </div>
      </div>
    );
  }

  if (finished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-2xl p-8 shadow-elevated border border-border max-w-md w-full text-center">
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${percentage >= 70 ? "text-secondary" : percentage >= 40 ? "text-accent" : "text-destructive"}`} />
          <h2 className="text-3xl font-display font-black text-foreground">{percentage}%</h2>
          <p className="text-muted-foreground mt-1">
            {score} / {questions.length} correct
          </p>
          <div className="mt-2 text-sm font-display font-bold text-secondary">+{score * 10} XP</div>
          <p className="mt-4 text-sm text-muted-foreground">
            {percentage >= 90 ? "🌟 Outstanding! You've mastered this topic!" :
             percentage >= 70 ? "👏 Great job! Keep practicing!" :
             percentage >= 40 ? "💪 Good effort! Review the topics and try again." :
             "📚 Keep studying! Practice makes perfect."}
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={generateQuiz} className="px-5 py-2.5 rounded-xl gradient-hero text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
            <Link to="/schools/study" className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-display font-bold text-sm hover:bg-muted/80 transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/schools/study" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="text-sm text-muted-foreground font-display">
            {type === "previous_year" ? `${cls} • ${year} Paper` : `${cls} • ${subject}`}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-display font-bold text-foreground">{currentQ + 1}/{questions.length}</span>
        </div>

        {/* Question */}
        <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card rounded-2xl p-6 shadow-elevated border border-border">
          <p className="text-lg font-display font-bold text-foreground mb-6">{q.question}</p>

          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let styles = "border-border bg-muted/30 hover:bg-muted/60 cursor-pointer";
              if (answered) {
                if (i === q.correct) styles = "border-primary bg-primary/10 text-primary";
                else if (i === selectedAnswer) styles = "border-destructive bg-destructive/10 text-destructive";
                else styles = "border-border bg-muted/20 opacity-50";
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={answered}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${styles}`}
                >
                  <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm">{opt}</span>
                  {answered && i === q.correct && <CheckCircle className="w-5 h-5 ml-auto text-primary" />}
                  {answered && i === selectedAnswer && i !== q.correct && <XCircle className="w-5 h-5 ml-auto text-destructive" />}
                </button>
              );
            })}
          </div>

          {answered && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-foreground font-medium">💡 Explanation:</p>
              <p className="text-sm text-muted-foreground mt-1">{q.explanation}</p>
            </motion.div>
          )}

          {answered && (
            <button onClick={nextQuestion} className="mt-4 w-full py-3 rounded-xl gradient-hero text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity">
              {currentQ + 1 >= questions.length ? "See Results" : "Next Question →"}
            </button>
          )}
        </motion.div>

        {/* Score Tracker */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Score: <span className="font-bold text-primary">{score}</span> / {currentQ + (answered ? 1 : 0)}
        </div>
      </div>
    </div>
  );
}

function getSampleQuestions(cls: string, subject: string): Question[] {
  return [
    { question: `What is the capital of Tamil Nadu?`, options: ["Chennai", "Madurai", "Coimbatore", "Salem"], correct: 0, explanation: "Chennai (formerly Madras) is the capital city of Tamil Nadu." },
    { question: `Which river is the longest in Tamil Nadu?`, options: ["Kaveri", "Vaigai", "Palar", "Thamiraparani"], correct: 0, explanation: "The Kaveri (Cauvery) is the longest river flowing through Tamil Nadu." },
    { question: `What is the state animal of Tamil Nadu?`, options: ["Nilgiri Tahr", "Tiger", "Elephant", "Lion"], correct: 0, explanation: "The Nilgiri Tahr is the state animal of Tamil Nadu." },
    { question: `Which is the largest district in Tamil Nadu by area?`, options: ["Villupuram", "Dharmapuri", "Erode", "Tirunelveli"], correct: 0, explanation: "Villupuram is the largest district in Tamil Nadu by area." },
    { question: `The famous Meenakshi Amman Temple is in which city?`, options: ["Madurai", "Thanjavur", "Tiruchirapalli", "Kanchipuram"], correct: 0, explanation: "The Meenakshi Amman Temple is located in Madurai." },
  ];
}
