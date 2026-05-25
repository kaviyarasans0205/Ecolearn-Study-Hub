import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Loader2, CheckCircle2, AlertTriangle, Code, RotateCcw, Lightbulb, ChevronDown, ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TestCase {
  input: string;
  output: string;
}

interface Problem {
  title: string;
  desc: string;
  difficulty: string;
  xp: number;
  category: string;
  hints?: string[];
  testCases?: TestCase[];
}

interface TestRunResult {
  input: string;
  expected: string;
  actual: string;
  error?: string;
  passed: boolean;
}

interface Feedback {
  score: number;
  maxScore: number;
  passed: boolean;
  summary: string;
  strengths: string[];
  improvements: string[];
  xpEarned: number;
}

const LANGUAGE_MAP: Record<string, { lang: string; template: string }> = {
  "Java": {
    lang: "java",
    template: `public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n        System.out.println("Hello, World!");\n    }\n}`,
  },
  "Python": {
    lang: "python",
    template: `# Write your solution here\n\ndef solve():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    solve()`,
  },
  "C": {
    lang: "c",
    template: `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    printf("Hello, World!\\n");\n    return 0;\n}`,
  },
  "C++": {
    lang: "cpp",
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    cout << "Hello, World!" << endl;\n    return 0;\n}`,
  },
  "Basics": {
    lang: "python",
    template: `# Beginner challenge — write your solution here\n\ndef solve():\n    pass\n\nsolve()`,
  },
  "Debugging": {
    lang: "python",
    template: `# Read the code carefully and fix the bug\n\ndef solve():\n    pass\n\nsolve()`,
  },
};

function getLanguageConfig(category: string) {
  return LANGUAGE_MAP[category] || LANGUAGE_MAP["Python"];
}

export default function ChallengeEditor({
  problem,
  onClose,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: {
  problem: Problem;
  onClose: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const config = getLanguageConfig(problem.category);
  const [code, setCode] = useState(config.template);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [xpSaved, setXpSaved] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestRunResult[] | null>(null);
  const { user } = useAuth();

  // Reset editor state whenever the active problem changes (e.g. via prev/next arrows).
  useEffect(() => {
    setCode(config.template);
    setFeedback(null);
    setXpSaved(false);
    setShowHints(false);
    setTestResults(null);
  }, [problem.title, problem.category]);

  const handleRunTests = async () => {
    if (!problem.testCases || problem.testCases.length === 0) {
      toast.error("No test cases for this challenge.");
      return;
    }
    if (code.trim().length < 5) {
      toast.error("Write some code first.");
      return;
    }
    setRunningTests(true);
    setTestResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("run-test-cases", {
        body: { code, language: config.lang, testCases: problem.testCases },
      });
      if (error) throw error;
      if ((data as any).error) throw new Error((data as any).error);
      const results = (data as any).results as TestRunResult[];
      setTestResults(results);
      const passed = results.filter((r) => r.passed).length;
      if (passed === results.length) toast.success(`All ${results.length} test cases passed! ✅`);
      else toast(`${passed}/${results.length} test cases passed`);
    } catch (e) {
      toast.error("Failed to run test cases.");
    } finally {
      setRunningTests(false);
    }
  };

  const handleSubmit = async () => {
    if (code.trim().length < 20) {
      toast.error("Please write more code before submitting.");
      return;
    }
    setEvaluating(true);
    setFeedback(null);

    try {
      const { data, error } = await supabase.functions.invoke("evaluate-code", {
        body: {
          code,
          language: config.lang,
          challengeTitle: problem.title,
          challengeDescription: problem.desc,
          difficulty: problem.difficulty,
          maxXp: problem.xp,
        },
      });

      if (error) throw error;
      setFeedback(data as Feedback);

      // Save XP if logged in
      if (user && data.xpEarned > 0 && !xpSaved) {
        await supabase.from("quiz_results").insert({
          user_id: user.id,
          quiz_name: `Challenge: ${problem.title}`,
          score: data.score,
          total_questions: data.maxScore,
          xp_earned: data.xpEarned,
        });
        const profileRes = await supabase.from("profiles").select("total_xp").eq("user_id", user.id).single();
        if (profileRes.data) {
          await supabase.from("profiles").update({
            total_xp: profileRes.data.total_xp + data.xpEarned,
          }).eq("user_id", user.id);
        }
        setXpSaved(true);
        toast.success(`+${data.xpEarned} XP earned! 🎓`);
      }
    } catch {
      toast.error("Failed to evaluate. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleReset = () => {
    setCode(config.template);
    setFeedback(null);
    setXpSaved(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-2xl shadow-elevated border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Code className="w-4 h-4 text-accent" />
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">{problem.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  problem.difficulty === "Beginner" ? "bg-primary/10 text-primary" :
                  problem.difficulty === "Intermediate" ? "bg-secondary/10 text-secondary" :
                  problem.difficulty === "Advanced" ? "bg-eco-earth/10 text-eco-earth" :
                  "bg-destructive/10 text-destructive"
                }`}>{problem.difficulty}</span>
              </div>
              <h2 className="font-display font-bold text-foreground text-lg truncate">{problem.title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{problem.desc}</p>
              {/* Hints Toggle */}
              {problem.hints && problem.hints.length > 0 && (
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="mt-2 flex items-center gap-1.5 text-xs text-secondary font-semibold hover:text-secondary/80 transition-colors"
                >
                  <Lightbulb className="w-3 h-3" />
                  {showHints ? "Hide Hints" : "Show Hints"}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showHints ? "rotate-180" : ""}`} />
                </button>
              )}
              {showHints && problem.hints && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-2 space-y-1.5 pl-1"
                >
                  {problem.hints.map((hint, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="text-secondary font-bold mt-0.5">💡</span>
                      {hint}
                    </div>
                  ))}
                </motion.div>
              )}
              {/* Test Cases */}
              {problem.testCases && problem.testCases.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider mb-1.5">
                    <FlaskConical className="w-3 h-3" /> Test Cases
                  </div>
                  <div className="space-y-1.5">
                    {problem.testCases.map((tc, i) => (
                      <div key={i} className="rounded-lg border border-border bg-muted/40 p-2 text-xs font-mono">
                        <div className="text-muted-foreground">
                          <span className="text-accent font-semibold">Input:</span>{" "}
                          <span className="text-foreground whitespace-pre-wrap break-all">{tc.input || "—"}</span>
                        </div>
                        <div className="text-muted-foreground mt-0.5">
                          <span className="text-primary font-semibold">Expected:</span>{" "}
                          <span className="text-foreground whitespace-pre-wrap break-all">{tc.output}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="ml-4 p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Editor + Feedback */}
          <div className="flex-1 overflow-auto flex flex-col md:flex-row">
            {/* Code Editor */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {config.lang} editor
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={handleReset} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                  <span className="text-xs font-display font-bold text-secondary">+{problem.xp} XP</span>
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full min-h-[300px] p-4 bg-background font-mono text-sm text-foreground resize-none focus:outline-none border-none"
                spellCheck={false}
                placeholder="Write your code here..."
              />
              {testResults && (
                <div className="border-t border-border bg-muted/30 p-4 max-h-60 overflow-auto">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <FlaskConical className="w-3 h-3 text-accent" /> Test Results
                    </h4>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {testResults.filter((r) => r.passed).length}/{testResults.length} passed
                    </span>
                  </div>
                  <div className="space-y-2">
                    {testResults.map((r, i) => (
                      <div
                        key={i}
                        className={`rounded-lg border p-2 text-xs font-mono ${
                          r.passed ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-sans font-semibold mb-1">
                          {r.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                          )}
                          <span className={r.passed ? "text-primary" : "text-destructive"}>
                            Test {i + 1} — {r.passed ? "Passed" : "Failed"}
                          </span>
                        </div>
                        {r.input && (
                          <div className="text-muted-foreground">
                            <span className="text-accent">Input:</span>{" "}
                            <span className="text-foreground whitespace-pre-wrap break-all">{r.input}</span>
                          </div>
                        )}
                        <div className="text-muted-foreground">
                          <span className="text-primary">Expected:</span>{" "}
                          <span className="text-foreground whitespace-pre-wrap break-all">{r.expected}</span>
                        </div>
                        <div className="text-muted-foreground">
                          <span className="text-secondary">Got:</span>{" "}
                          <span className="text-foreground whitespace-pre-wrap break-all">{r.actual || "—"}</span>
                        </div>
                        {r.error && (
                          <div className="text-destructive mt-0.5">⚠ {r.error}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Feedback Panel */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border bg-muted/30 p-5 overflow-auto"
              >
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{feedback.passed ? "✅" : "🔄"}</div>
                  <h3 className="font-display font-bold text-foreground text-lg">
                    {feedback.score}/{feedback.maxScore} Points
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {feedback.passed ? (
                      <span className="text-primary font-semibold">Challenge Passed!</span>
                    ) : (
                      <span className="text-secondary font-semibold">Keep Improving!</span>
                    )}
                  </p>
                  {feedback.xpEarned > 0 && (
                    <p className="text-xs font-display font-bold text-secondary mt-1">+{feedback.xpEarned} XP</p>
                  )}
                </div>

                <p className="text-sm text-foreground mb-4">{feedback.summary}</p>

                {feedback.strengths.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Strengths
                    </h4>
                    <ul className="space-y-1">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-primary mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.improvements.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> To Improve
                    </h4>
                    <ul className="space-y-1">
                      {feedback.improvements.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <span className="text-secondary mt-0.5">•</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {!user && (
                  <p className="mt-4 text-xs text-muted-foreground text-center">
                    Sign in to save your XP!
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={onPrev}
                disabled={!hasPrev}
                aria-label="Previous challenge"
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNext}
                disabled={!hasNext}
                aria-label="Next challenge"
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="hidden sm:inline text-xs text-muted-foreground ml-2">
                {code.split("\n").length} lines
              </span>
            </div>
            <div className="flex items-center gap-2">
              {problem.testCases && problem.testCases.length > 0 && (
                <button
                  onClick={handleRunTests}
                  disabled={runningTests || evaluating}
                  className="px-4 py-2.5 rounded-xl border border-accent/40 bg-accent/10 text-accent font-display font-bold text-sm hover:bg-accent/20 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {runningTests ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
                  ) : (
                    <><FlaskConical className="w-4 h-4" /> Run My Test Cases</>
                  )}
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={evaluating || runningTests}
                className="px-6 py-2.5 rounded-xl gradient-hero text-primary-foreground font-display font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {evaluating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</>
                ) : (
                  <><Play className="w-4 h-4" /> Submit Solution</>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
