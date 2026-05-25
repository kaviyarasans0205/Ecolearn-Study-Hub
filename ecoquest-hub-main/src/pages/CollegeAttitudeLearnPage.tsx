import { motion } from "framer-motion";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { APTITUDE_UNITS } from "@/data/aptitudeTopics";

export default function CollegeAttitudeLearnPage() {
  return (
    <div className="min-h-screen pt-16">
      <section className="gradient-college py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-display font-black text-accent-foreground"
          >
            📚 Aptitude Learning Hub
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-2 text-accent-foreground/80"
          >
            Master Number System, Problems on Numbers, Percentage & Profit/Loss
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <Link
              to="/colleges/attitude-quiz"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card text-foreground font-display font-bold text-sm shadow-elevated hover:scale-105 transition-transform"
            >
              <BookOpen className="w-4 h-4" />
              Practice Quiz <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
        {APTITUDE_UNITS.map((unit, idx) => (
          <motion.div
            key={unit.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated border border-border"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <span className="text-4xl">{unit.emoji}</span>
              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-wider">
                  {unit.unit}
                </p>
                <h2 className="text-2xl font-display font-black text-foreground">
                  {unit.title}
                </h2>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              {unit.topics.map((topic, tIdx) => (
                <AccordionItem key={tIdx} value={`${unit.key}-${tIdx}`}>
                  <AccordionTrigger className="text-left font-display font-bold text-foreground hover:text-primary">
                    {topic.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/80 leading-relaxed space-y-2">
                    <p>{topic.content}</p>
                    {topic.example && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50 border-l-4 border-primary">
                        <p className="text-xs font-bold text-primary uppercase mb-1">
                          Example
                        </p>
                        <p className="text-sm font-mono text-foreground">
                          {topic.example}
                        </p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        ))}

        <div className="text-center pt-4">
          <Link
            to="/colleges/attitude-quiz"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-college text-accent-foreground font-display font-bold text-sm shadow-elevated hover:scale-105 transition-transform"
          >
            Test Your Knowledge <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
