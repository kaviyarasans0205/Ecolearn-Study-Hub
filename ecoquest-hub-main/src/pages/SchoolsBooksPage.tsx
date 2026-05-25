import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

const classPageUrl = (cls: string) => {
  const num = cls.replace("Class ", "");
  const suffix = num === "1" ? "1st" : num === "2" ? "2nd" : num === "3" ? "3rd" : `${num}th`;
  return `https://tntextbooks.online/${suffix}-std-tntextbook/`;
};

const getPaperUrl = (cls: string, year: number, subject: string) => {
  const classNum = cls.replace("Class ", "");
  const subjectSlug = subject.toLowerCase().replace(/\s+/g, "-");
  return `https://www.learncbse.in/samacheer-kalvi-${classNum}th-standard-${subjectSlug}-question-papers/`;
};

type BookEntry = {
  subject: string;
  title: string;
  titleTamil?: string;
  publisher: string;
  links: { label: string; url: string }[];
};

const makeBooks = (cls: string, subjects: { subject: string; title: string; titleTamil?: string; labels: string[] }[]): BookEntry[] =>
  subjects.map((s) => ({
    subject: s.subject,
    title: s.title,
    titleTamil: s.titleTamil,
    publisher: "TN Textbook Corporation",
    links: s.labels.map((label) => ({ label, url: classPageUrl(cls) })),
  }));

const TN_BOOKS: Record<string, BookEntry[]> = {
  "Class 1": makeBooks("Class 1", [
    { subject: "Tamil", title: "Tamil Mozhi Payirchi", titleTamil: "தமிழ் மொழி பயிற்சி", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "English", title: "My English World", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "Maths", title: "Mathematics", labels: ["Term 1 (EM)", "Term 1 (TM)", "Term 2 (EM)", "Term 2 (TM)", "Term 3 (EM)", "Term 3 (TM)"] },
    { subject: "EVS", title: "Environmental Studies", labels: ["Term 1 (EM)", "Term 1 (TM)", "Term 2 (EM)", "Term 2 (TM)", "Term 3 (EM)", "Term 3 (TM)"] },
  ]),
  "Class 2": makeBooks("Class 2", [
    { subject: "Tamil", title: "Tamil Kalvi", titleTamil: "தமிழ் கல்வி", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "English", title: "My English World – II", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "Maths", title: "Mathematics – II", labels: ["Term 1 (EM)", "Term 1 (TM)", "Term 2 (EM)", "Term 2 (TM)", "Term 3 (EM)", "Term 3 (TM)"] },
    { subject: "EVS", title: "Environmental Studies – II", labels: ["Term 1 (EM)", "Term 1 (TM)", "Term 2 (EM)", "Term 2 (TM)", "Term 3 (EM)", "Term 3 (TM)"] },
  ]),
  "Class 3": makeBooks("Class 3", [
    { subject: "Tamil", title: "Tamil Ilakkanam & Ilakkiyam", titleTamil: "தமிழ் இலக்கணம் & இலக்கியம்", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "English", title: "English Reader – III", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "Maths", title: "Mathematics – III", labels: ["Term 1 (EM)", "Term 1 (TM)"] },
    { subject: "Science", title: "Science – III", labels: ["Term 1 (EM)", "Term 1 (TM)"] },
    { subject: "Social Science", title: "Social Science – III", labels: ["Term 1 (EM)", "Term 1 (TM)"] },
  ]),
  "Class 4": makeBooks("Class 4", [
    { subject: "Tamil", title: "Tamil – IV", titleTamil: "தமிழ்", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "English", title: "English – IV", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "Maths", title: "Mathematics – IV", labels: ["Textbook (EM)", "Textbook (TM)"] },
    { subject: "Science", title: "Science – IV", labels: ["Textbook (EM)", "Textbook (TM)"] },
    { subject: "Social Science", title: "Social Science – IV", labels: ["Textbook (EM)", "Textbook (TM)"] },
  ]),
  "Class 5": makeBooks("Class 5", [
    { subject: "Tamil", title: "Tamil – V", titleTamil: "தமிழ்", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "English", title: "English – V", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "Maths", title: "Mathematics – V", labels: ["Textbook (EM)", "Textbook (TM)"] },
    { subject: "Science", title: "Science – V", labels: ["Textbook (EM)", "Textbook (TM)"] },
    { subject: "Social Science", title: "Social Science – V", labels: ["Textbook (EM)", "Textbook (TM)"] },
  ]),
  "Class 6": makeBooks("Class 6", [
    { subject: "Tamil", title: "Tamil – Term 1, 2, 3", titleTamil: "தமிழ்", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "English", title: "English – Term 1, 2, 3", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "Maths", title: "Mathematics – Term 1, 2, 3", labels: ["Term 1 (EM)", "Term 2 (EM)", "Term 3 (EM)"] },
    { subject: "Science", title: "Science – Term 1, 2, 3", labels: ["Term 1 (EM)", "Term 2 (EM)", "Term 3 (EM)"] },
    { subject: "Social Science", title: "Social Science – Term 1, 2, 3", labels: ["Term 1 (EM)", "Term 2 (EM)", "Term 3 (EM)"] },
    { subject: "Computer Science", title: "Computer Applications", labels: ["Textbook (EM)"] },
  ]),
  "Class 7": makeBooks("Class 7", [
    { subject: "Tamil", title: "Tamil – Term 1, 2, 3", titleTamil: "தமிழ்", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "English", title: "English – Term 1, 2, 3", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "Maths", title: "Mathematics – Term 1, 2, 3", labels: ["Term 1 (EM)", "Term 2 (EM)", "Term 3 (EM)"] },
    { subject: "Science", title: "Science – Term 1, 2, 3", labels: ["Term 1 (EM)", "Term 2 (EM)", "Term 3 (EM)"] },
    { subject: "Social Science", title: "Social Science – Term 1, 2, 3", labels: ["Term 1 (EM)", "Term 2 (EM)", "Term 3 (EM)"] },
    { subject: "Computer Science", title: "Computer Applications", labels: ["Textbook (EM)"] },
  ]),
  "Class 8": makeBooks("Class 8", [
    { subject: "Tamil", title: "Tamil – Term 1, 2, 3", titleTamil: "தமிழ்", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "English", title: "English – Term 1, 2, 3", labels: ["Term 1", "Term 2", "Term 3"] },
    { subject: "Maths", title: "Mathematics – Term 1, 2, 3", labels: ["Term 1 (EM)", "Term 2 (EM)", "Term 3 (EM)"] },
    { subject: "Science", title: "Science – Term 1, 2, 3", labels: ["Term 1 (EM)", "Term 2 (EM)", "Term 3 (EM)"] },
    { subject: "Social Science", title: "Social Science – Term 1, 2, 3", labels: ["Term 1 (EM)", "Term 2 (EM)", "Term 3 (EM)"] },
    { subject: "Computer Science", title: "Computer Applications", labels: ["Textbook (EM)"] },
  ]),
  "Class 9": makeBooks("Class 9", [
    { subject: "Tamil", title: "Tamil", titleTamil: "தமிழ்", labels: ["Textbook PDF"] },
    { subject: "English", title: "English", labels: ["Textbook PDF"] },
    { subject: "Maths", title: "Mathematics", labels: ["Textbook (EM)", "Textbook (TM)"] },
    { subject: "Science", title: "Science", labels: ["Textbook (EM)", "Textbook (TM)"] },
    { subject: "Social Science", title: "Social Science", labels: ["Textbook (EM)", "Textbook (TM)"] },
    { subject: "Computer Science", title: "Computer Applications", labels: ["Textbook (EM)"] },
  ]),
  "Class 10": makeBooks("Class 10", [
    { subject: "Tamil", title: "Tamil", titleTamil: "தமிழ்", labels: ["Textbook PDF"] },
    { subject: "English", title: "English", labels: ["Textbook PDF"] },
    { subject: "Maths", title: "Mathematics", labels: ["Textbook (EM)", "Textbook (TM)"] },
    { subject: "Science", title: "Science", labels: ["Textbook (EM)", "Textbook (TM)"] },
    { subject: "Social Science", title: "Social Science", labels: ["Textbook (EM)", "Textbook (TM)"] },
    { subject: "Computer Science", title: "Computer Applications", labels: ["Textbook (EM)"] },
  ]),
  "Class 11": makeBooks("Class 11", [
    { subject: "Tamil", title: "Tamil", titleTamil: "தமிழ்", labels: ["Textbook PDF"] },
    { subject: "English", title: "English", labels: ["Textbook PDF"] },
    { subject: "Maths", title: "Mathematics (Vol 1 & 2)", labels: ["Vol 1 (EM)", "Vol 2 (EM)"] },
    { subject: "Physics", title: "Physics (Vol 1 & 2)", labels: ["Vol 1 (EM)", "Vol 2 (EM)"] },
    { subject: "Chemistry", title: "Chemistry (Vol 1 & 2)", labels: ["Vol 1 (EM)", "Vol 2 (EM)"] },
    { subject: "Biology", title: "Biology (Vol 1 & 2)", labels: ["Vol 1 (EM)", "Vol 2 (EM)"] },
    { subject: "Computer Science", title: "Computer Science", labels: ["Textbook (EM)"] },
    { subject: "Commerce", title: "Accountancy", labels: ["Textbook (EM)"] },
    { subject: "Economics", title: "Economics", labels: ["Textbook (EM)"] },
  ]),
  "Class 12": makeBooks("Class 12", [
    { subject: "Tamil", title: "Tamil", titleTamil: "தமிழ்", labels: ["Textbook PDF"] },
    { subject: "English", title: "English", labels: ["Textbook PDF"] },
    { subject: "Maths", title: "Mathematics (Vol 1 & 2)", labels: ["Vol 1 (EM)", "Vol 2 (EM)"] },
    { subject: "Physics", title: "Physics (Vol 1 & 2)", labels: ["Vol 1 (EM)", "Vol 2 (EM)"] },
    { subject: "Chemistry", title: "Chemistry (Vol 1 & 2)", labels: ["Vol 1 (EM)", "Vol 2 (EM)"] },
    { subject: "Biology", title: "Biology (Vol 1 & 2)", labels: ["Vol 1 (EM)", "Vol 2 (EM)"] },
    { subject: "Computer Science", title: "Computer Science", labels: ["Textbook (EM)"] },
    { subject: "Commerce", title: "Accountancy", labels: ["Textbook (EM)"] },
    { subject: "Economics", title: "Economics", labels: ["Textbook (EM)"] },
  ]),
};

const EXAM_PAPERS: Record<string, { year: number; subjects: string[] }[]> = {
  "Class 10": Array.from({ length: 10 }, (_, i) => ({
    year: 2024 - i,
    subjects: ["Tamil", "English", "Maths", "Science", "Social Science"],
  })),
  "Class 11": Array.from({ length: 10 }, (_, i) => ({
    year: 2024 - i,
    subjects: ["Tamil", "English", "Maths", "Physics", "Chemistry", "Biology", "Computer Science", "Commerce", "Economics"],
  })),
  "Class 12": Array.from({ length: 10 }, (_, i) => ({
    year: 2024 - i,
    subjects: ["Tamil", "English", "Maths", "Physics", "Chemistry", "Biology", "Computer Science", "Commerce", "Economics"],
  })),
};

const CLASSES = Object.keys(TN_BOOKS);

export default function SchoolsBooksPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const activeTab = "books" as const;

  return (
    <div className="min-h-screen pt-16">
      <section className="gradient-school py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-display font-black text-primary-foreground">
            📖 TN State Board Textbooks
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 text-primary-foreground/80 text-lg">
            Official textbooks for Classes 1-12
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        {/* Class Selector */}
        <h2 className="text-xl font-display font-bold text-foreground mb-4">Select Your Class</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8">
          {CLASSES.map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls === selectedClass ? null : cls)}
              className={`py-3 rounded-xl border-2 font-display font-bold text-sm transition-all ${
                selectedClass === cls ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/50"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedClass && TN_BOOKS[selectedClass] && (
            <motion.div key={`books-${selectedClass}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-xl font-display font-bold text-foreground mb-4">{selectedClass} — Prescribed Textbooks</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TN_BOOKS[selectedClass].map((book) => (
                  <div key={book.subject} className="bg-card rounded-xl p-5 border border-border shadow-card hover:shadow-elevated transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-display font-bold text-foreground text-sm">{book.subject}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{book.title}</p>
                        {book.titleTamil && <p className="text-xs text-muted-foreground">{book.titleTamil}</p>}
                        <p className="text-xs text-muted-foreground mt-1">📘 {book.publisher}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {book.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
