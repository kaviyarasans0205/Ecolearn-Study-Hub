import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, ChevronDown, ChevronRight, GraduationCap, FileText, PenTool, Gamepad2 } from "lucide-react";

const TN_SYLLABUS: Record<string, Record<string, string[]>> = {
  "Class 1": {
    Tamil: ["எழுத்துகள் (Letters)", "உயிர் எழுத்துகள்", "மெய் எழுத்துகள்", "சொற்கள் (Words)", "வாக்கியங்கள் (Sentences)"],
    English: ["Alphabet & Phonics", "Simple Words", "Basic Sentences", "Rhymes & Poems"],
    Maths: ["Numbers 1-100", "Addition", "Subtraction", "Shapes", "Patterns"],
    "EVS (Environmental Studies)": ["My Family", "My School", "Animals Around Us", "Plants", "Food We Eat"],
  },
  "Class 2": {
    Tamil: ["கதை படித்தல்", "கவிதை", "எளிய இலக்கணம்", "பொருள் கூறுதல்"],
    English: ["Reading Comprehension", "Grammar Basics", "Vocabulary", "Short Stories"],
    Maths: ["Numbers up to 1000", "Multiplication Tables", "Division Basics", "Time", "Money"],
    "EVS (Environmental Studies)": ["Water", "Air", "Seasons", "Our Helpers", "Transport"],
  },
  "Class 3": {
    Tamil: ["உரைநடை", "கவிதை புரிதல்", "இலக்கணம் - பெயர்ச்சொல்", "கட்டுரை எழுதுதல்"],
    English: ["Parts of Speech", "Tenses - Present", "Story Writing", "Letter Writing"],
    Maths: ["Fractions", "Geometry Basics", "Measurement", "Data Handling", "Multiplication & Division"],
    Science: ["Living & Non-living Things", "Human Body", "Matter", "Force & Energy"],
    "Social Science": ["Our District", "Maps & Directions", "Our State Tamil Nadu", "Festivals"],
  },
  "Class 4": {
    Tamil: ["இலக்கணம் - வினைச்சொல்", "திருக்குறள்", "நாடகம்", "கடிதம் எழுதுதல்"],
    English: ["Tenses - Past & Future", "Adjectives & Adverbs", "Paragraph Writing", "Comprehension"],
    Maths: ["Large Numbers", "Factors & Multiples", "Decimals", "Perimeter & Area", "Symmetry"],
    Science: ["Adaptations", "Food Chain", "Rocks & Soil", "Simple Machines"],
    "Social Science": ["History of Tamil Nadu", "Indian States", "Natural Resources", "Government"],
  },
  "Class 5": {
    Tamil: ["உரைநடை & கவிதை", "இலக்கணம் - அணி இலக்கணம்", "கட்டுரை & கடிதம்"],
    English: ["Active & Passive Voice", "Direct & Indirect Speech", "Essay Writing", "Poetry"],
    Maths: ["HCF & LCM", "Profit & Loss", "Volume", "Percentage Basics", "Graphs"],
    Science: ["Nervous System", "Reproduction in Plants", "Acids & Bases", "Weather & Climate"],
    "Social Science": ["Ancient India", "Indian Freedom Movement", "Indian Constitution", "Natural Disasters"],
  },
  "Class 6": {
    Tamil: ["பாடல்கள்", "கதைகள்", "இலக்கணம்", "மொழியாக்கம்"],
    English: ["Prose & Poetry", "Grammar - Tenses", "Vocabulary Building", "Composition"],
    Maths: ["Number System", "Algebra Introduction", "Ratio & Proportion", "Geometry", "Statistics"],
    Science: ["Measurements", "Forces & Motion", "Chemistry of Daily Life", "Biology of Living World"],
    "Social Science": ["Ancient Civilizations", "Geography of India", "Civics - Democracy", "Economics Basics"],
    "Computer Science": ["Introduction to Computers", "MS Paint", "MS Word Basics"],
  },
  "Class 7": {
    Tamil: ["செய்யுள்", "உரைநடை", "இலக்கணம் - சொல்லிலக்கணம்"],
    English: ["Prose & Poetry", "Grammar - Clauses", "Writing Skills", "Reading Comprehension"],
    Maths: ["Integers", "Algebraic Expressions", "Triangles", "Data Handling", "Simple Interest"],
    Science: ["Atomic Structure", "Solutions", "Electricity", "Reproduction", "Ecology"],
    "Social Science": ["Medieval India", "World Geography", "Civics - State Government", "Economy"],
    "Computer Science": ["MS Excel", "Internet Basics", "HTML Introduction"],
  },
  "Class 8": {
    Tamil: ["பாடல் & உரை", "இலக்கணம் - யாப்பிலக்கணம்"],
    English: ["Prose & Poetry", "Grammar - Advanced", "Report Writing", "Debate"],
    Maths: ["Rational Numbers", "Linear Equations", "Quadrilaterals", "Compound Interest", "Graphs"],
    Science: ["Friction", "Sound", "Chemical Reactions", "Cell Biology", "Metals & Non-metals"],
    "Social Science": ["Modern India", "Resources & Development", "Civics - Central Government", "Globalisation"],
    "Computer Science": ["Scratch Programming", "MS PowerPoint", "Cyber Safety"],
  },
  "Class 9": {
    Tamil: ["செய்யுள் & உரைநடை", "நாடகம்", "இலக்கணம்"],
    English: ["Prose", "Poetry", "Supplementary Reader", "Grammar & Composition"],
    Maths: ["Set Language", "Real Numbers", "Algebra", "Coordinate Geometry", "Trigonometry", "Statistics"],
    Science: ["Physics - Motion & Laws", "Chemistry - Atomic Structure", "Biology - Organization of Life"],
    "Social Science": ["History - World Wars", "Geography - Lithosphere", "Civics - Rights", "Economics - Money & Banking"],
    "Computer Science": ["Scratch Advanced", "Introduction to Python", "Database Concepts"],
  },
  "Class 10": {
    Tamil: ["செய்யுள்", "உரைநடை", "இலக்கணம்", "மொழிபெயர்ப்பு"],
    English: ["Prose", "Poetry", "Supplementary", "Grammar", "Composition"],
    Maths: ["Relations & Functions", "Numbers & Sequences", "Algebra", "Geometry", "Trigonometry", "Statistics & Probability"],
    Science: ["Physics - Laws of Motion, Light", "Chemistry - Solutions, Chemical Bonding", "Biology - Heredity, Plant & Animal Hormones"],
    "Social Science": ["History - Indian National Movement", "Geography - India Resources", "Civics - Indian Constitution", "Economics - Consumer Rights"],
    "Computer Science": ["Python Programming", "HTML & CSS", "Introduction to AI"],
  },
  "Class 11": {
    Tamil: ["செய்யுள் & உரைநடை", "புதினம்", "இலக்கணம்"],
    English: ["Prose", "Poetry", "Short Stories", "Grammar", "Essay & Letter"],
    Maths: ["Sets, Relations & Functions", "Trigonometry", "Algebra", "Combinatorics", "Differential Calculus", "Probability"],
    Physics: ["Nature of Physical World", "Kinematics", "Laws of Motion", "Gravitation", "Oscillations & Waves"],
    Chemistry: ["Basic Concepts", "Quantum Mechanical Model", "Chemical Bonding", "Thermodynamics", "Solutions"],
    Biology: ["Living World", "Plant Kingdom", "Cell Biology", "Biomolecules", "Human Physiology"],
    "Computer Science": ["Python Fundamentals", "Data Abstraction", "Flow of Control", "Functions", "Strings"],
    Commerce: ["Introduction to Accounting", "Books of Accounts", "Trial Balance", "Financial Statements"],
    Economics: ["Micro Economics", "Demand & Supply", "Production", "Market Structure"],
  },
  "Class 12": {
    Tamil: ["செய்யுள் & உரைநடை", "நாடகம்", "சிறுகதை"],
    English: ["Prose", "Poetry", "Short Stories", "Grammar", "Composition"],
    Maths: ["Applications of Matrices", "Complex Numbers", "Differential Calculus", "Integral Calculus", "Probability Distributions"],
    Physics: ["Electrostatics", "Current Electricity", "Magnetism", "Electromagnetic Induction", "Optics", "Nuclear Physics"],
    Chemistry: ["Metallurgy", "p-Block Elements", "Coordination Chemistry", "Organic Chemistry", "Biomolecules"],
    Biology: ["Reproduction", "Genetics", "Evolution", "Human Health", "Biotechnology", "Ecology"],
    "Computer Science": ["Functions Advanced", "Data Structures", "Database Concepts", "Web Application Development"],
    Commerce: ["Accounting for Partnership", "Company Accounts", "Financial Statement Analysis"],
    Economics: ["Macro Economics", "National Income", "Banking", "International Trade"],
  },
};

const CLASSES = Object.keys(TN_SYLLABUS);

export default function SchoolsStudyPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  return (
    <div className="min-h-screen pt-16">
      <section className="gradient-school py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-display font-black text-primary-foreground">
            📚 TN State Board Study Hub
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Classes 1-12 • All Subjects • Previous Year Papers • Practice Exams
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: PenTool, label: "MCQ Quiz", to: "/schools/quiz", color: "bg-primary/10 text-primary" },
            { icon: FileText, label: "Written Exam", to: "/schools/exam", color: "bg-secondary/10 text-secondary" },
            { icon: Gamepad2, label: "Eco Games", to: "/schools/games", color: "bg-eco-sky/10 text-accent" },
            { icon: GraduationCap, label: "Leaderboard", to: "/leaderboard", color: "bg-eco-earth/10 text-eco-earth" },
          ].map((a) => (
            <Link key={a.label} to={a.to} className="bg-card rounded-xl p-4 border border-border shadow-card hover:shadow-elevated transition-shadow flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${a.color} flex items-center justify-center`}>
                <a.icon className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-foreground text-sm">{a.label}</span>
            </Link>
          ))}
        </div>

        {/* Class Selector */}
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Select Your Class</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8">
          {CLASSES.map((cls) => (
            <button
              key={cls}
              onClick={() => { setSelectedClass(cls === selectedClass ? null : cls); setExpandedSubject(null); }}
              className={`py-3 rounded-xl border-2 font-display font-bold text-sm transition-all ${
                selectedClass === cls ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* Subjects & Topics */}
        <AnimatePresence mode="wait">
          {selectedClass && (
            <motion.div
              key={selectedClass}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <h2 className="text-xl font-display font-bold text-foreground mb-4">
                {selectedClass} — Subjects & Topics
              </h2>
              {Object.entries(TN_SYLLABUS[selectedClass]).map(([subject, topics]) => (
                <div key={subject} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                  <button
                    onClick={() => setExpandedSubject(expandedSubject === subject ? null : subject)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-primary" />
                      <span className="font-display font-bold text-foreground">{subject}</span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{topics.length} topics</span>
                    </div>
                    {expandedSubject === subject ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
                  </button>
                  <AnimatePresence>
                    {expandedSubject === subject && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border"
                      >
                        <div className="p-4 space-y-2">
                          {topics.map((topic, i) => (
                            <div key={topic} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors">
                              <span className="text-sm text-foreground">
                                <span className="text-muted-foreground mr-2">{i + 1}.</span>
                                {topic}
                              </span>
                              <div className="flex gap-2">
                                <Link
                                  to={`/schools/quiz?class=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`}
                                  className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
                                >
                                  Quiz
                                </Link>
                                <Link
                                  to={`/schools/exam?class=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(subject)}&topic=${encodeURIComponent(topic)}`}
                                  className="text-xs px-3 py-1 rounded-full bg-secondary/10 text-secondary font-semibold hover:bg-secondary/20 transition-colors"
                                >
                                  Exam
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {/* Previous Year Papers Section */}
              <div className="mt-8 bg-card rounded-xl border border-border shadow-card p-6">
                <h3 className="font-display font-bold text-foreground text-lg mb-3">📄 Previous Year Question Papers (2015-2024)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Practice with actual TN State Board exam papers from the last 10 years.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {Array.from({ length: 10 }, (_, i) => 2024 - i).map((year) => (
                    <Link
                      key={year}
                      to={`/schools/quiz?class=${encodeURIComponent(selectedClass)}&type=previous_year&year=${year}`}
                      className="py-3 rounded-xl border border-border bg-muted/30 text-center font-display font-bold text-sm text-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all"
                    >
                      {year}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
