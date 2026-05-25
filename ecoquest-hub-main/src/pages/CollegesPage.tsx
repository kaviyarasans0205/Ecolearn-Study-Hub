import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, BookOpen, Lightbulb, CheckCircle2, XCircle, ChevronRight, Clock, Beaker, Code } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChallengeEditor from "@/components/ChallengeEditor";

const fadeUp = {
  hidden: { opacity: 0, y: 20 } as const,
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

// Step-by-step progression across Java, Python, C, C++.
// Beginner (Steps 1-8), Medium (Steps 9-11), Hard (Steps 12-14).
const problemCategories = [
  {
    label: "☕ Java",
    problems: [
      { title: "Step 1 · Hello, World!", desc: "Print 'Hello, World!' using System.out.println. Your very first Java program.", difficulty: "Beginner", xp: 30, category: "Java", hints: ["Use public static void main(String[] args)", "System.out.println(\"Hello, World!\");", "Class name should match file name"] },
      { title: "Step 2 · Variables & Print", desc: "Declare an int and a String variable, then print both on separate lines.", difficulty: "Beginner", xp: 40, category: "Java", hints: ["int age = 18;", "String name = \"Eco\";", "Use System.out.println for each"] },
      { title: "Step 3 · Add Two Numbers", desc: "Take two integers a and b, then print their sum.", difficulty: "Beginner", xp: 50, category: "Java", hints: ["int sum = a + b;", "Print sum with System.out.println(sum);", "You can hardcode a and b for now"] },
      { title: "Step 4 · Even or Odd", desc: "Read a number and print 'Even' or 'Odd' using the modulo operator.", difficulty: "Beginner", xp: 60, category: "Java", hints: ["Use n % 2 == 0", "if / else block", "Print the result with println"] },
      { title: "Step 5 · Loop 1 to 10", desc: "Print numbers from 1 to 10 using a for loop.", difficulty: "Beginner", xp: 70, category: "Java", hints: ["for (int i = 1; i <= 10; i++)", "System.out.println(i);", "Watch your loop bounds"] },
      { title: "Step 6 · Sum of First N Numbers", desc: "Read N and print the sum 1+2+...+N using a loop.", difficulty: "Beginner", xp: 80, category: "Java", hints: ["int sum = 0; loop and add i", "Or use formula N*(N+1)/2", "Initialize sum before the loop"] },
      { title: "Step 7 · Reverse a String", desc: "Take a string and print it in reverse order.", difficulty: "Beginner", xp: 90, category: "Java", hints: ["Use a StringBuilder and .reverse()", "Or loop from last index to 0", "Build the reversed string char by char"] },
      { title: "Step 8 · Find the Bug: Swap", desc: "Fix this swap so a and b actually exchange values: a = b; b = a;", difficulty: "Beginner", xp: 100, category: "Java", hints: ["You overwrote a before saving it", "Use a temp variable", "int temp = a; a = b; b = temp;"] },
      { title: "Step 9 · Factorial of N", desc: "Compute N! (1×2×…×N) using a loop or recursion and print it.", difficulty: "Medium", xp: 120, category: "Java", hints: ["long fact = 1;", "Multiply fact *= i in a loop", "Use long for larger N"] },
      { title: "Step 10 · Prime Check", desc: "Check if a number N is prime. Print 'Prime' or 'Not Prime'.", difficulty: "Medium", xp: 140, category: "Java", hints: ["Loop i from 2 to sqrt(n)", "If n % i == 0 -> not prime", "Handle n <= 1 separately"] },
      { title: "Step 11 · Fibonacci Series", desc: "Print the first N Fibonacci numbers (0, 1, 1, 2, 3, 5, ...).", difficulty: "Medium", xp: 160, category: "Java", hints: ["Use two variables a=0, b=1", "Next = a + b; shift", "Loop N times"] },
      { title: "Step 12 · Palindrome String", desc: "Check whether a string reads the same forwards and backwards.", difficulty: "Hard", xp: 180, category: "Java", hints: ["Use two pointers (left, right)", "Or compare s with reverse(s)", "Ignore case if you want a stricter version"] },
      { title: "Step 13 · Binary Search", desc: "Implement binary search on a sorted int[] and print the index of the target (or -1).", difficulty: "Hard", xp: 220, category: "Java", hints: ["Use lo, hi, mid pointers", "mid = lo + (hi - lo) / 2", "Adjust lo/hi based on comparison"] },
      { title: "Step 14 · Sort an Array", desc: "Sort an integer array in ascending order and print it (use Arrays.sort or implement bubble sort).", difficulty: "Hard", xp: 260, category: "Java", hints: ["Arrays.sort(arr); is the simplest", "Bubble sort: nested loops, swap adjacent", "Print with Arrays.toString(arr)"] },
    ],
  },
  {
    label: "🐍 Python",
    problems: [
      { title: "Step 1 · Hello, World!", desc: "Print 'Hello, World!' using the print() function.", difficulty: "Beginner", xp: 30, category: "Python", hints: ["print(\"Hello, World!\")", "No semicolons needed", "Indentation matters in Python"] },
      { title: "Step 2 · Variables & f-strings", desc: "Create a name and age variable, then print 'Hi NAME, you are AGE'.", difficulty: "Beginner", xp: 40, category: "Python", hints: ["name = \"Eco\"", "age = 18", "print(f\"Hi {name}, you are {age}\")"] },
      { title: "Step 3 · Add Two Numbers", desc: "Add two numbers and print the result.", difficulty: "Beginner", xp: 50, category: "Python", hints: ["a = 3; b = 5", "print(a + b)", "Try with input() too"] },
      { title: "Step 4 · Even or Odd", desc: "Print whether a number is even or odd.", difficulty: "Beginner", xp: 60, category: "Python", hints: ["if n % 2 == 0:", "print(\"Even\") else print(\"Odd\")", "Indent the body of if/else"] },
      { title: "Step 5 · Loop with range()", desc: "Print numbers 1 to 10 using a for loop and range().", difficulty: "Beginner", xp: 70, category: "Python", hints: ["for i in range(1, 11):", "range stop is exclusive", "print(i) inside the loop"] },
      { title: "Step 6 · Sum of First N Numbers", desc: "Compute the sum of 1..N with a loop and print it.", difficulty: "Beginner", xp: 80, category: "Python", hints: ["total = 0", "for i in range(1, n+1): total += i", "Or use sum(range(1, n+1))"] },
      { title: "Step 7 · Reverse a String", desc: "Reverse a string and print it.", difficulty: "Beginner", xp: 90, category: "Python", hints: ["s[::-1] is the easy way", "Or loop in reverse and concatenate", "Strings are immutable"] },
      { title: "Step 8 · Count Vowels", desc: "Count how many vowels (a,e,i,o,u) appear in a string.", difficulty: "Beginner", xp: 100, category: "Python", hints: ["vowels = \"aeiou\"", "Use a counter and a for loop", "Don't forget to lowercase the string"] },
      { title: "Step 9 · Factorial (Recursion)", desc: "Write a recursive function factorial(n) and print factorial(6).", difficulty: "Medium", xp: 120, category: "Python", hints: ["Base case: n == 0 or 1", "return n * factorial(n-1)", "Mind the recursion depth"] },
      { title: "Step 10 · Prime Check", desc: "Print 'Prime' or 'Not Prime' for a given number n.", difficulty: "Medium", xp: 140, category: "Python", hints: ["Loop i in range(2, int(n**0.5)+1)", "If n % i == 0 -> not prime", "Handle n < 2 as not prime"] },
      { title: "Step 11 · Fibonacci List", desc: "Return a list of the first N Fibonacci numbers and print it.", difficulty: "Medium", xp: 160, category: "Python", hints: ["fib = [0, 1]", "Append fib[-1] + fib[-2] in a loop", "Slice to length N"] },
      { title: "Step 12 · Palindrome Check", desc: "Function is_palindrome(s) returning True/False, ignoring case.", difficulty: "Hard", xp: 180, category: "Python", hints: ["s = s.lower()", "return s == s[::-1]", "Optional: strip non-alphanumerics"] },
      { title: "Step 13 · Word Frequency", desc: "Given a sentence, print each unique word and its count.", difficulty: "Hard", xp: 220, category: "Python", hints: ["Use sentence.split()", "from collections import Counter", "Counter(words).items()"] },
      { title: "Step 14 · Sort with Custom Key", desc: "Sort a list of tuples (name, score) by score descending.", difficulty: "Hard", xp: 260, category: "Python", hints: ["sorted(items, key=lambda x: x[1], reverse=True)", "lambda picks the second element", "Print the sorted list"] },
    ],
  },
  {
    label: "💻 C",
    problems: [
      { title: "Step 1 · Hello, World!", desc: "Use printf to print 'Hello, World!' from main().", difficulty: "Beginner", xp: 30, category: "C", hints: ["#include <stdio.h>", "printf(\"Hello, World!\\n\");", "return 0; from main"] },
      { title: "Step 2 · Variables & printf", desc: "Declare an int and print it using %d format specifier.", difficulty: "Beginner", xp: 40, category: "C", hints: ["int x = 7;", "printf(\"%d\\n\", x);", "Use %d for int, %f for float"] },
      { title: "Step 3 · Add Two Numbers", desc: "Add two ints and print the result.", difficulty: "Beginner", xp: 50, category: "C", hints: ["int a = 3, b = 4;", "int sum = a + b;", "printf(\"%d\\n\", sum);"] },
      { title: "Step 4 · Even or Odd", desc: "Print 'Even' or 'Odd' for a number using if/else.", difficulty: "Beginner", xp: 60, category: "C", hints: ["if (n % 2 == 0)", "printf(\"Even\\n\");", "else printf(\"Odd\\n\");"] },
      { title: "Step 5 · for Loop 1 to 10", desc: "Print 1..10 using a for loop.", difficulty: "Beginner", xp: 70, category: "C", hints: ["for (int i = 1; i <= 10; i++)", "printf(\"%d \", i);", "End with a newline"] },
      { title: "Step 6 · Sum of First N Numbers", desc: "Use a loop to sum 1..N and print the result.", difficulty: "Beginner", xp: 80, category: "C", hints: ["int sum = 0;", "for (int i = 1; i <= n; i++) sum += i;", "printf(\"%d\\n\", sum);"] },
      { title: "Step 7 · Multiplication Table", desc: "Print the multiplication table of N (N x 1 to N x 10).", difficulty: "Beginner", xp: 90, category: "C", hints: ["Loop i from 1 to 10", "printf(\"%d x %d = %d\\n\", n, i, n*i);", "Use \\n for new line"] },
      { title: "Step 8 · Reverse a Number", desc: "Reverse the digits of an integer (e.g. 1234 -> 4321).", difficulty: "Beginner", xp: 100, category: "C", hints: ["Use n % 10 to get last digit", "Build rev = rev*10 + digit", "Then n = n / 10"] },
      { title: "Step 9 · Factorial of N", desc: "Compute factorial of N using a loop and print it.", difficulty: "Medium", xp: 120, category: "C", hints: ["long fact = 1;", "for (int i = 1; i <= n; i++) fact *= i;", "printf(\"%ld\\n\", fact);"] },
      { title: "Step 10 · Prime Check", desc: "Print 'Prime' or 'Not Prime' for a given int n.", difficulty: "Medium", xp: 140, category: "C", hints: ["Loop i from 2 to sqrt(n)", "If n % i == 0 -> not prime", "Handle n <= 1 separately"] },
      { title: "Step 11 · Fibonacci Series", desc: "Print the first N Fibonacci numbers space-separated.", difficulty: "Medium", xp: 160, category: "C", hints: ["int a = 0, b = 1;", "Print a; then int t = a + b; a = b; b = t;", "Loop N times"] },
      { title: "Step 12 · Palindrome Number", desc: "Check whether an integer reads the same forwards and backwards.", difficulty: "Hard", xp: 180, category: "C", hints: ["Reverse the digits into a new int", "Compare reversed value with original", "Watch out for overflow on large n"] },
      { title: "Step 13 · Bubble Sort", desc: "Sort an int array of size N in ascending order using bubble sort.", difficulty: "Hard", xp: 220, category: "C", hints: ["Two nested for loops", "Swap if arr[j] > arr[j+1]", "Print the sorted array"] },
      { title: "Step 14 · Linear & Binary Search", desc: "Implement both linear and binary search on a sorted array, print indices.", difficulty: "Hard", xp: 260, category: "C", hints: ["Linear: scan one by one", "Binary: lo, hi, mid pointers", "Return -1 if not found"] },
    ],
  },
  {
    label: "➕ C++",
    problems: [
      { title: "Step 1 · Hello, World!", desc: "Use cout to print 'Hello, World!'.", difficulty: "Beginner", xp: 30, category: "C++", hints: ["#include <iostream>", "using namespace std;", "cout << \"Hello, World!\" << endl;"] },
      { title: "Step 2 · Variables & cout", desc: "Declare an int and a string, print both with cout.", difficulty: "Beginner", xp: 40, category: "C++", hints: ["#include <string>", "string name = \"Eco\";", "cout << name << \" \" << age << endl;"] },
      { title: "Step 3 · Add Two Numbers", desc: "Read or hardcode two ints and print the sum.", difficulty: "Beginner", xp: 50, category: "C++", hints: ["int a = 3, b = 4;", "cout << a + b << endl;", "cin >> a >> b; for input"] },
      { title: "Step 4 · Even or Odd", desc: "Use if/else and modulo to print Even or Odd.", difficulty: "Beginner", xp: 60, category: "C++", hints: ["if (n % 2 == 0)", "cout << \"Even\";", "else cout << \"Odd\";"] },
      { title: "Step 5 · for Loop 1 to 10", desc: "Print 1..10 using a for loop.", difficulty: "Beginner", xp: 70, category: "C++", hints: ["for (int i = 1; i <= 10; ++i)", "cout << i << ' ';", "End with endl;"] },
      { title: "Step 6 · Sum of First N Numbers", desc: "Sum numbers from 1 to N using a loop.", difficulty: "Beginner", xp: 80, category: "C++", hints: ["int sum = 0;", "for (int i = 1; i <= n; ++i) sum += i;", "cout << sum << endl;"] },
      { title: "Step 7 · Reverse a String", desc: "Reverse a std::string and print it.", difficulty: "Beginner", xp: 90, category: "C++", hints: ["#include <algorithm>", "reverse(s.begin(), s.end());", "cout << s;"] },
      { title: "Step 8 · Largest of Three", desc: "Read 3 numbers and print the largest using if/else (or std::max).", difficulty: "Beginner", xp: 100, category: "C++", hints: ["max(a, max(b, c)) works", "Or chain if/else if", "Don't forget to print the result"] },
      { title: "Step 9 · Factorial of N", desc: "Compute N! using a loop and print it.", difficulty: "Medium", xp: 120, category: "C++", hints: ["long long fact = 1;", "for (int i = 1; i <= n; ++i) fact *= i;", "cout << fact;"] },
      { title: "Step 10 · Prime Check", desc: "Print 'Prime' or 'Not Prime' for a number n.", difficulty: "Medium", xp: 140, category: "C++", hints: ["Loop i from 2 to sqrt(n)", "If n % i == 0 -> not prime", "Handle n <= 1"] },
      { title: "Step 11 · Vector & Sum", desc: "Push 5 numbers into a vector<int> and print their sum.", difficulty: "Medium", xp: 160, category: "C++", hints: ["#include <vector>", "v.push_back(x);", "Loop with range-for to sum"] },
      { title: "Step 12 · Palindrome String", desc: "Check whether a std::string is a palindrome.", difficulty: "Hard", xp: 180, category: "C++", hints: ["Compare s with its reverse", "Or two pointers from both ends", "Lowercase first if needed"] },
      { title: "Step 13 · Sort with sort()", desc: "Sort a vector<int> ascending and descending using std::sort.", difficulty: "Hard", xp: 220, category: "C++", hints: ["sort(v.begin(), v.end());", "sort(v.begin(), v.end(), greater<int>());", "Print before and after"] },
      { title: "Step 14 · Word Count with map", desc: "Count occurrences of each word in a sentence using map<string,int>.", difficulty: "Hard", xp: 260, category: "C++", hints: ["#include <map> and <sstream>", "istringstream iss(sentence); iss >> word;", "++count[word];"] },
    ],
  },
];

// Test cases keyed by step number (1-14). Each language's Step N shares the same
// expected I/O so learners can verify their solution against the same examples.
const TEST_CASES_BY_STEP: Record<number, { input: string; output: string }[]> = {
  1: [{ input: "", output: "Hello, World!" }],
  2: [{ input: "name = Eco, age = 18", output: "Eco\n18" }],
  3: [
    { input: "a = 3, b = 5", output: "8" },
    { input: "a = 10, b = 20", output: "30" },
  ],
  4: [
    { input: "n = 4", output: "Even" },
    { input: "n = 7", output: "Odd" },
  ],
  5: [{ input: "", output: "1 2 3 4 5 6 7 8 9 10" }],
  6: [
    { input: "n = 5", output: "15" },
    { input: "n = 10", output: "55" },
  ],
  7: [
    { input: "s = \"hello\"", output: "olleh" },
    { input: "s = \"EcoLearn\"", output: "nraeLocE" },
  ],
  8: [
    { input: "a = 5, b = 9 (Java/C/C++ swap)", output: "a = 9, b = 5" },
    { input: "s = \"banana\" (Python count vowels)", output: "3" },
    { input: "a=4, b=9, c=7 (C++ largest of three)", output: "9" },
    { input: "n = 1234 (C reverse number)", output: "4321" },
  ],
  9: [
    { input: "n = 5", output: "120" },
    { input: "n = 6", output: "720" },
  ],
  10: [
    { input: "n = 7", output: "Prime" },
    { input: "n = 9", output: "Not Prime" },
  ],
  11: [
    { input: "n = 7", output: "0 1 1 2 3 5 8" },
    { input: "n = 5 (Python list)", output: "[0, 1, 1, 2, 3]" },
    { input: "5 numbers = 1 2 3 4 5 (C++ vector sum)", output: "15" },
  ],
  12: [
    { input: "s = \"madam\"", output: "true" },
    { input: "s = \"hello\"", output: "false" },
    { input: "n = 121 (C palindrome number)", output: "true" },
  ],
  13: [
    { input: "arr = [1,3,5,7,9], target = 7 (Java binary search)", output: "3" },
    { input: "sentence = \"the cat and the dog\" (Python word freq)", output: "the:2, cat:1, and:1, dog:1" },
    { input: "arr = [5,2,4,1,3] (C bubble sort)", output: "1 2 3 4 5" },
    { input: "v = [3,1,2] (C++ sort asc/desc)", output: "1 2 3 / 3 2 1" },
  ],
  14: [
    { input: "arr = [3,1,4,1,5,9,2,6]", output: "1 1 2 3 4 5 6 9" },
    { input: "[(\"a\",10),(\"b\",30),(\"c\",20)] (Python sort by score desc)", output: "[(\"b\",30),(\"c\",20),(\"a\",10)]" },
    { input: "arr=[2,4,6,8], target=6 (C linear+binary search)", output: "2 / 2" },
    { input: "sentence = \"to be or not to be\" (C++ word count)", output: "to:2, be:2, or:1, not:1" },
  ],
};

function extractStep(title: string): number | null {
  const m = title.match(/Step\s+(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

const enrichedCategories = problemCategories.map(c => ({
  ...c,
  problems: c.problems.map(p => {
    const step = extractStep(p.title);
    const testCases = step !== null ? TEST_CASES_BY_STEP[step] : undefined;
    return testCases ? { ...p, testCases } : p;
  }),
}));

const problems = enrichedCategories.flatMap(c => c.problems);

const quizQuestions = [
  {
    question: "What percentage of Earth's water is freshwater?",
    options: ["3%", "10%", "25%", "50%"],
    correct: 0,
  },
  {
    question: "Which gas is the primary contributor to the greenhouse effect?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correct: 2,
  },
  {
    question: "What is the main cause of ocean acidification?",
    options: ["Oil spills", "Absorption of CO₂", "Plastic pollution", "Overfishing"],
    correct: 1,
  },
];

const attributeQuestions = [
  { question: "Rate the sustainability of solar energy vs. nuclear energy for a small island nation.", type: "Analysis", xp: 200 },
  { question: "Compare the environmental impact of electric vehicles vs. hydrogen fuel cell vehicles.", type: "Comparison", xp: 250 },
  { question: "Evaluate the effectiveness of carbon trading schemes in reducing global emissions.", type: "Critical Thinking", xp: 300 },
  { question: "Assess the role of indigenous knowledge in modern conservation practices.", type: "Research", xp: 200 },
];

export default function CollegesPage() {
  const [activeChallenge, setActiveChallenge] = useState<null | { list: typeof problems; index: number }>(null);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    if (idx === quizQuestions[currentQuiz].correct) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      if (currentQuiz < quizQuestions.length - 1) {
        setCurrentQuiz(c => c + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1200);
  };

  const saveQuizResult = async (finalScore: number) => {
    if (!user || saved) return;
    const xpEarned = finalScore * 50;
    try {
      await supabase.from("quiz_results").insert({
        user_id: user.id,
        quiz_name: "Environmental Quick Quiz",
        score: finalScore,
        total_questions: quizQuestions.length,
        xp_earned: xpEarned,
      });
      await supabase.from("profiles").update({
        total_xp: (await supabase.from("profiles").select("total_xp").eq("user_id", user.id).single()).data!.total_xp + xpEarned,
      }).eq("user_id", user.id);
      setSaved(true);
      toast.success(`+${xpEarned} XP saved! 🎓`);
    } catch {
      toast.error("Failed to save result");
    }
  };

  useEffect(() => {
    if (showResult && user && !saved) {
      saveQuizResult(score);
    }
  }, [showResult]);

  const resetQuiz = () => {
    setCurrentQuiz(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setSaved(false);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <section className="gradient-college py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-display font-black text-accent-foreground">
            🎓 Colleges Portal
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 text-accent-foreground/80 text-lg max-w-xl mx-auto">
            Advanced problem-solving, quizzes, and critical thinking challenges.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/colleges/attitude-quiz" className="px-6 py-3 rounded-xl bg-card text-foreground font-display font-bold text-sm shadow-elevated hover:shadow-card transition-shadow">
              🧠 Attitude Quiz
            </Link>
            <Link to="/colleges/books" className="px-6 py-3 rounded-xl bg-card text-foreground font-display font-bold text-sm shadow-elevated hover:shadow-card transition-shadow">
              📚 Books & Games
            </Link>
            <Link to="/leaderboard" className="px-6 py-3 rounded-xl bg-accent-foreground/20 text-accent-foreground font-display font-bold text-sm backdrop-blur-sm hover:bg-accent-foreground/30 transition-colors">
              🏆 Leaderboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Problem Solving */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Beaker className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-display font-bold text-foreground">Problem Solving Challenges</h2>
          </div>
          <Tabs defaultValue="☕ Java" className="w-full">
            <TabsList className="mb-6 flex flex-wrap h-auto gap-2 bg-transparent p-0">
              {enrichedCategories.map((cat) => (
                <TabsTrigger
                  key={cat.label}
                  value={cat.label}
                  className="px-4 py-2 rounded-lg text-sm font-display font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-border"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {enrichedCategories.map((cat) => (
              <TabsContent key={cat.label} value={cat.label}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cat.problems.map((p, i) => (
                    <motion.div
                      key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
                      variants={fadeUp} custom={i}
                      onClick={() => setActiveChallenge({ list: cat.problems, index: i })}
                      className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold">{p.category}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                          p.difficulty === "Beginner" ? "bg-primary/10 text-primary" :
                          p.difficulty === "Intermediate" ? "bg-secondary/10 text-secondary" :
                          p.difficulty === "Advanced" ? "bg-eco-earth/10 text-eco-earth" :
                          "bg-destructive/10 text-destructive"
                        }`}>{p.difficulty}</span>
                      </div>
                      <h3 className="font-display font-bold text-foreground text-lg">{p.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs font-display font-bold text-secondary">+{p.xp} XP</span>
                        <span className="flex items-center gap-1 text-xs text-accent font-semibold group-hover:gap-2 transition-all">
                          Start Challenge <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Interactive Quiz */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-display font-bold text-foreground">Quick Quiz</h2>
          </div>
          <div className="bg-card rounded-2xl p-8 shadow-elevated border border-border">
            {!showResult ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-semibold text-muted-foreground">Question {currentQuiz + 1}/{quizQuestions.length}</span>
                  <div className="flex gap-1">
                    {quizQuestions.map((_, i) => (
                      <div key={i} className={`w-8 h-1.5 rounded-full ${i <= currentQuiz ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-6">{quizQuestions[currentQuiz].question}</h3>
                <div className="space-y-3">
                  {quizQuestions[currentQuiz].options.map((opt, idx) => {
                    const isCorrect = idx === quizQuestions[currentQuiz].correct;
                    const isSelected = selectedAnswer === idx;
                    let style = "bg-muted/50 border-border hover:border-primary/50";
                    if (selectedAnswer !== null) {
                      if (isCorrect) style = "bg-primary/10 border-primary";
                      else if (isSelected) style = "bg-destructive/10 border-destructive";
                    }
                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all flex items-center justify-between ${style}`}
                      >
                        <span className="font-medium text-foreground">{opt}</span>
                        {selectedAnswer !== null && isCorrect && <CheckCircle2 className="w-5 h-5 text-primary" />}
                        {selectedAnswer !== null && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive" />}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-4">
                  {score === quizQuestions.length ? "🏆" : score >= quizQuestions.length / 2 ? "👏" : "📚"}
                </motion.div>
                <h3 className="text-2xl font-display font-bold text-foreground">
                  {score}/{quizQuestions.length} Correct!
                </h3>
                <p className="mt-2 text-muted-foreground">
                  You earned <span className="font-bold text-secondary">+{score * 50} XP</span>
                </p>
                {!user && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <button onClick={() => navigate("/auth")} className="text-primary font-semibold hover:underline">Sign in</button> to save your results!
                  </p>
                )}
                {saved && <p className="mt-1 text-xs text-primary font-semibold">✓ Result saved!</p>}
                <button onClick={resetQuiz} className="mt-6 px-6 py-3 rounded-xl gradient-college text-accent-foreground font-display font-bold text-sm">
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Attribute Questions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Lightbulb className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl font-display font-bold text-foreground">Attribute-Based Questions</h2>
          </div>
          <div className="space-y-4">
            {attributeQuestions.map((q, i) => (
              <motion.div
                key={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow cursor-pointer flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">{q.type}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> 15 min</span>
                  </div>
                  <p className="font-medium text-foreground">{q.question}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-display font-bold text-secondary">+{q.xp} XP</span>
                    <span className="text-xs text-primary font-semibold">Answer →</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Challenge Editor Modal */}
      {activeChallenge && (
        <ChallengeEditor
          problem={activeChallenge.list[activeChallenge.index]}
          hasPrev={activeChallenge.index > 0}
          hasNext={activeChallenge.index < activeChallenge.list.length - 1}
          onPrev={() => setActiveChallenge((c) => c ? { ...c, index: c.index - 1 } : c)}
          onNext={() => setActiveChallenge((c) => c ? { ...c, index: c.index + 1 } : c)}
          onClose={() => setActiveChallenge(null)}
        />
      )}
    </div>
  );
}
