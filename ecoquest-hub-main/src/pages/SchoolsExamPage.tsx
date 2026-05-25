import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Loader2, BookOpen, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ExamQuestion {
  question: string;
  marks: number;
  type: "short" | "long";
}

interface EvalResult {
  questionIndex: number;
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
}

const DEFAULT_QUESTIONS: ExamQuestion[] = [
  { question: "Define photosynthesis and explain its importance to the ecosystem.", marks: 5, type: "short" },
  { question: "Describe the water cycle with a neat diagram explanation.", marks: 10, type: "long" },
  { question: "What are renewable energy sources? Give three examples with their advantages.", marks: 5, type: "short" },
  { question: "Explain Newton's three laws of motion with real-life examples.", marks: 10, type: "long" },
  { question: "What is the difference between physical and chemical changes? Give examples.", marks: 5, type: "short" },
];

export default function SchoolsExamPage() {
  const [searchParams] = useSearchParams();
  const cls = searchParams.get("class") || "Class 10";
  const subject = searchParams.get("subject") || "Science";
  const topic = searchParams.get("topic") || "General";

  const { user, refreshProfile } = useAuth();
  const [questions] = useState<ExamQuestion[]>(DEFAULT_QUESTIONS);
  const [answers, setAnswers] = useState<string[]>(new Array(DEFAULT_QUESTIONS.length).fill(""));
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<EvalResult[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [customQuestions, setCustomQuestions] = useState(false);

  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const generateQuestions = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-school-quiz", {
        body: {
          type: "generate_exam",
          prompt: `Generate 5 written exam questions for TN State Board ${cls}, Subject: ${subject}, Topic: ${topic}. Mix short answer (5 marks) and long answer (10 marks) questions.`,
        },
      });
      if (error) throw error;
      if (data?.questions) {
        setCustomQuestions(true);
        setAnswers(new Array(data.questions.length).fill(""));
      }
    } catch {
      toast.error("Using default questions");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    const unanswered = answers.filter((a) => a.trim().length < 5).length;
    if (unanswered > 0) {
      toast.error(`Please answer all questions (${unanswered} remaining)`);
      return;
    }
    if (!user) {
      toast.error("Please sign in to submit your exam");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-school-quiz", {
        body: {
          type: "evaluate_answers",
          classLevel: cls,
          subject,
          topic,
          questions: questions.map((q, i) => ({
            question: q.question,
            answer: answers[i],
            maxMarks: q.marks,
            type: q.type,
          })),
        },
      });

      if (error) throw error;

      const evalResults: EvalResult[] = data.results;
      setResults(evalResults);

      const totalScore = evalResults.reduce((s, r) => s + r.marksAwarded, 0);
      const xpEarned = Math.round((totalScore / totalMarks) * 50);

      await supabase.from("quiz_results").insert({
        user_id: user.id,
        quiz_name: `${cls} - ${subject} - Written Exam`,
        score: totalScore,
        total_questions: questions.length,
        xp_earned: xpEarned,
      });

      const { data: profile } = await supabase.from("profiles").select("total_xp").eq("user_id", user.id).single();
      if (profile) {
        await supabase.from("profiles").update({ total_xp: profile.total_xp + xpEarned }).eq("user_id", user.id);
      }
      refreshProfile();
      toast.success(`Exam evaluated! +${xpEarned} XP 🌱`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to evaluate. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalScored = results?.reduce((s, r) => s + r.marksAwarded, 0) ?? 0;

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/schools/study" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="text-sm font-display text-muted-foreground">{cls} • {subject} • {topic}</div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-card rounded-2xl p-6 shadow-elevated border border-border mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-display font-black text-foreground flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-primary" /> Written Exam
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Total Marks: {totalMarks} • Answer all questions</p>
              </div>
              {results && (
                <div className="text-center">
                  <div className={`text-3xl font-display font-black ${totalScored / totalMarks >= 0.7 ? "text-primary" : totalScored / totalMarks >= 0.4 ? "text-secondary" : "text-destructive"}`}>
                    {totalScored}/{totalMarks}
                  </div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              )}
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {questions.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-5 border border-border shadow-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-display font-bold text-foreground flex-1">
                    <span className="text-primary mr-2">Q{i + 1}.</span>
                    {q.question}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold shrink-0 ml-3 ${
                    q.type === "long" ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                  }`}>
                    {q.marks} marks
                  </span>
                </div>

                <textarea
                  value={answers[i]}
                  onChange={(e) => {
                    const updated = [...answers];
                    updated[i] = e.target.value;
                    setAnswers(updated);
                  }}
                  disabled={!!results}
                  rows={q.type === "long" ? 8 : 4}
                  placeholder={q.type === "long" ? "Write a detailed answer..." : "Write your answer..."}
                  className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                />

                {/* Evaluation Result */}
                {results && results[i] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-display font-bold text-foreground flex items-center gap-1">
                        <Award className="w-4 h-4 text-primary" /> Marks Awarded
                      </span>
                      <span className={`text-lg font-display font-black ${
                        results[i].marksAwarded / results[i].maxMarks >= 0.7 ? "text-primary" : results[i].marksAwarded / results[i].maxMarks >= 0.4 ? "text-secondary" : "text-destructive"
                      }`}>
                        {results[i].marksAwarded}/{results[i].maxMarks}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{results[i].feedback}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Submit */}
          {!results && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-6 w-full py-4 rounded-xl gradient-hero text-primary-foreground font-display font-bold text-sm shadow-elevated hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Answers...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Exam
                </>
              )}
            </button>
          )}

          {results && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setResults(null);
                  setAnswers(new Array(questions.length).fill(""));
                }}
                className="flex-1 py-3 rounded-xl gradient-hero text-primary-foreground font-display font-bold text-sm hover:opacity-90"
              >
                Try Again
              </button>
              <Link to="/schools/study" className="flex-1 py-3 rounded-xl bg-muted text-foreground font-display font-bold text-sm text-center hover:bg-muted/80">
                Back to Study
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
