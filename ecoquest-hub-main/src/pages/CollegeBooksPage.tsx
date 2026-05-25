import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ExternalLink, Search } from "lucide-react";

const BRANCHES: Record<string, { subject: string; title: string; semester: string; pdfUrl: string }[]> = {
  "Computer Science": [
    { subject: "Programming in C", title: "Let Us C – Yashavant Kanetkar", semester: "Sem 1", pdfUrl: "https://archive.org/search?query=let+us+c+yashavant+kanetkar" },
    { subject: "Data Structures", title: "Data Structures using C – Reema Thareja", semester: "Sem 2", pdfUrl: "https://archive.org/search?query=data+structures+reema+thareja" },
    { subject: "DBMS", title: "Database System Concepts – Korth", semester: "Sem 3", pdfUrl: "https://archive.org/search?query=database+system+concepts+korth" },
    { subject: "Operating Systems", title: "Operating System Concepts – Silberschatz", semester: "Sem 4", pdfUrl: "https://archive.org/search?query=operating+system+concepts+silberschatz" },
    { subject: "Computer Networks", title: "Data Communications – Forouzan", semester: "Sem 5", pdfUrl: "https://archive.org/search?query=data+communications+forouzan" },
    { subject: "Machine Learning", title: "Pattern Recognition – Bishop", semester: "Sem 6", pdfUrl: "https://archive.org/search?query=pattern+recognition+bishop" },
    { subject: "Web Technology", title: "Web Technologies – Uttam K Roy", semester: "Sem 5", pdfUrl: "https://archive.org/search?query=web+technologies+uttam+k+roy" },
    { subject: "Java Programming", title: "Java: The Complete Reference – Schildt", semester: "Sem 3", pdfUrl: "https://archive.org/search?query=java+complete+reference+schildt" },
    { subject: "Python Programming", title: "Python Crash Course – Eric Matthes", semester: "Sem 2", pdfUrl: "https://archive.org/search?query=python+crash+course+eric+matthes" },
    { subject: "Software Engineering", title: "Software Engineering – Pressman", semester: "Sem 5", pdfUrl: "https://archive.org/search?query=software+engineering+pressman" },
  ],
  "Electronics & Communication": [
    { subject: "Circuit Theory", title: "Engineering Circuit Analysis – Hayt", semester: "Sem 1", pdfUrl: "https://archive.org/search?query=engineering+circuit+analysis+hayt" },
    { subject: "Signals & Systems", title: "Signals and Systems – Oppenheim", semester: "Sem 3", pdfUrl: "https://archive.org/search?query=signals+and+systems+oppenheim" },
    { subject: "Digital Electronics", title: "Digital Design – Morris Mano", semester: "Sem 2", pdfUrl: "https://archive.org/search?query=digital+design+morris+mano" },
    { subject: "Analog Communication", title: "Communication Systems – Haykin", semester: "Sem 4", pdfUrl: "https://archive.org/search?query=communication+systems+haykin" },
    { subject: "Microprocessors", title: "The 8086 Microprocessor – Brey", semester: "Sem 4", pdfUrl: "https://archive.org/search?query=8086+microprocessor+brey" },
    { subject: "VLSI Design", title: "CMOS VLSI Design – Weste & Harris", semester: "Sem 6", pdfUrl: "https://archive.org/search?query=cmos+vlsi+design+weste+harris" },
    { subject: "Embedded Systems", title: "Embedded Systems – Raj Kamal", semester: "Sem 5", pdfUrl: "https://archive.org/search?query=embedded+systems+raj+kamal" },
    { subject: "Antenna & Wave Propagation", title: "Antennas – Balanis", semester: "Sem 6", pdfUrl: "https://archive.org/search?query=antennas+balanis" },
  ],
  "Mechanical": [
    { subject: "Engineering Mechanics", title: "Engineering Mechanics – Timoshenko", semester: "Sem 1", pdfUrl: "https://archive.org/search?query=engineering+mechanics+timoshenko" },
    { subject: "Thermodynamics", title: "Engineering Thermodynamics – P.K. Nag", semester: "Sem 2", pdfUrl: "https://archive.org/search?query=engineering+thermodynamics+pk+nag" },
    { subject: "Fluid Mechanics", title: "Fluid Mechanics – R.K. Bansal", semester: "Sem 3", pdfUrl: "https://archive.org/search?query=fluid+mechanics+rk+bansal" },
    { subject: "Manufacturing Technology", title: "Manufacturing Technology – P.N. Rao", semester: "Sem 4", pdfUrl: "https://archive.org/search?query=manufacturing+technology+pn+rao" },
    { subject: "Machine Design", title: "Machine Design – V.B. Bhandari", semester: "Sem 5", pdfUrl: "https://archive.org/search?query=machine+design+vb+bhandari" },
    { subject: "Heat Transfer", title: "Heat Transfer – J.P. Holman", semester: "Sem 5", pdfUrl: "https://archive.org/search?query=heat+transfer+jp+holman" },
    { subject: "Automobile Engineering", title: "Automobile Engineering – Kirpal Singh", semester: "Sem 6", pdfUrl: "https://archive.org/search?query=automobile+engineering+kirpal+singh" },
    { subject: "CAD/CAM", title: "CAD/CAM – Groover & Zimmers", semester: "Sem 6", pdfUrl: "https://archive.org/search?query=cad+cam+groover+zimmers" },
  ],
  "Civil": [
    { subject: "Surveying", title: "Surveying – B.C. Punmia", semester: "Sem 1", pdfUrl: "https://archive.org/search?query=surveying+bc+punmia" },
    { subject: "Strength of Materials", title: "Strength of Materials – R.K. Rajput", semester: "Sem 2", pdfUrl: "https://archive.org/search?query=strength+of+materials+rk+rajput" },
    { subject: "Structural Analysis", title: "Structural Analysis – Bhavikatti", semester: "Sem 4", pdfUrl: "https://archive.org/search?query=structural+analysis+bhavikatti" },
    { subject: "Geotechnical Engineering", title: "Soil Mechanics – B.M. Das", semester: "Sem 3", pdfUrl: "https://archive.org/search?query=soil+mechanics+bm+das" },
    { subject: "Environmental Engineering", title: "Environmental Engineering – S.K. Garg", semester: "Sem 5", pdfUrl: "https://archive.org/search?query=environmental+engineering+sk+garg" },
    { subject: "Transportation Engineering", title: "Highway Engineering – Khanna & Justo", semester: "Sem 5", pdfUrl: "https://archive.org/search?query=highway+engineering+khanna+justo" },
    { subject: "Concrete Technology", title: "Concrete Technology – M.S. Shetty", semester: "Sem 4", pdfUrl: "https://archive.org/search?query=concrete+technology+ms+shetty" },
    { subject: "Estimation & Costing", title: "Estimating & Costing – B.N. Dutta", semester: "Sem 6", pdfUrl: "https://archive.org/search?query=estimating+costing+bn+dutta" },
  ],
  "Electrical": [
    { subject: "Basic Electrical", title: "Basic Electrical Engineering – D.P. Kothari", semester: "Sem 1", pdfUrl: "https://archive.org/search?query=basic+electrical+engineering+kothari" },
    { subject: "Electrical Machines", title: "Electrical Machinery – Fitzgerald", semester: "Sem 3", pdfUrl: "https://archive.org/search?query=electrical+machinery+fitzgerald" },
    { subject: "Power Systems", title: "Power System Engineering – Nagrath & Kothari", semester: "Sem 4", pdfUrl: "https://archive.org/search?query=power+system+engineering+nagrath" },
    { subject: "Control Systems", title: "Control Systems – Nagrath & Gopal", semester: "Sem 4", pdfUrl: "https://archive.org/search?query=control+systems+nagrath+gopal" },
    { subject: "Power Electronics", title: "Power Electronics – P.S. Bimbhra", semester: "Sem 5", pdfUrl: "https://archive.org/search?query=power+electronics+ps+bimbhra" },
    { subject: "Electrical Measurements", title: "Electrical Measurements – Sawhney", semester: "Sem 3", pdfUrl: "https://archive.org/search?query=electrical+measurements+sawhney" },
    { subject: "Renewable Energy", title: "Renewable Energy Sources – Chetan Singh Solanki", semester: "Sem 6", pdfUrl: "https://archive.org/search?query=renewable+energy+sources+solanki" },
  ],
  "MBA / Management": [
    { subject: "Financial Accounting", title: "Financial Accounting – Tulsian", semester: "Sem 1", pdfUrl: "https://archive.org/search?query=financial+accounting+tulsian" },
    { subject: "Marketing Management", title: "Marketing Management – Philip Kotler", semester: "Sem 1", pdfUrl: "https://archive.org/search?query=marketing+management+philip+kotler" },
    { subject: "Human Resource", title: "HRM – Gary Dessler", semester: "Sem 2", pdfUrl: "https://archive.org/search?query=human+resource+management+gary+dessler" },
    { subject: "Operations Management", title: "Operations Management – Heizer & Render", semester: "Sem 2", pdfUrl: "https://archive.org/search?query=operations+management+heizer+render" },
    { subject: "Business Analytics", title: "Business Analytics – James Evans", semester: "Sem 3", pdfUrl: "https://archive.org/search?query=business+analytics+james+evans" },
    { subject: "Strategic Management", title: "Strategic Management – Fred David", semester: "Sem 4", pdfUrl: "https://archive.org/search?query=strategic+management+fred+david" },
    { subject: "Organizational Behavior", title: "Organizational Behavior – Stephen Robbins", semester: "Sem 1", pdfUrl: "https://archive.org/search?query=organizational+behavior+stephen+robbins" },
    { subject: "International Business", title: "International Business – Charles Hill", semester: "Sem 3", pdfUrl: "https://archive.org/search?query=international+business+charles+hill" },
  ],
};

const BRANCH_NAMES = Object.keys(BRANCHES);

export default function CollegeBooksPage() {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const books = selectedBranch ? BRANCHES[selectedBranch] : [];
  const filtered = search
    ? books.filter(b => b.subject.toLowerCase().includes(search.toLowerCase()) || b.title.toLowerCase().includes(search.toLowerCase()))
    : books;

  return (
    <div className="min-h-screen pt-16">
      <section className="gradient-college py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-display font-black text-accent-foreground">
            📚 College Library
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-2 text-accent-foreground/80">
            Branch-wise textbooks with direct links to find PDFs
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Select Your Branch</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {BRANCH_NAMES.map(b => (
            <button key={b} onClick={() => { setSelectedBranch(b === selectedBranch ? null : b); setSearch(""); }}
              className={`py-3 px-2 rounded-xl border-2 font-display font-bold text-xs transition-all ${selectedBranch === b ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"}`}>
              {b}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedBranch && (
            <motion.div key={selectedBranch} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="text-xl font-display font-bold text-foreground">{selectedBranch} — Textbooks</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" placeholder="Search books..." value={search} onChange={e => setSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:border-primary outline-none w-48" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(book => (
                  <a key={book.subject} href={book.pdfUrl} target="_blank" rel="noopener noreferrer"
                    className="bg-card rounded-xl p-5 border border-border shadow-card hover:shadow-elevated transition-shadow group block">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold text-foreground text-sm">{book.subject}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{book.title}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold">{book.semester}</span>
                          <span className="text-xs text-primary font-semibold flex items-center gap-1 group-hover:underline">
                            Find PDF <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No books match "{search}"</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedBranch && (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-display font-bold text-lg">Select a branch above to view textbooks</p>
            <p className="text-sm mt-1">Each book links to a searchable PDF archive</p>
          </div>
        )}
      </div>
    </div>
  );
}
