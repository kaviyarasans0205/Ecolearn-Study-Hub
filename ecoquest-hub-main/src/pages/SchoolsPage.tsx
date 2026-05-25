import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Gamepad2, TreePine, Recycle, Droplets, Wind, Flower2 } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 } as const,
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const activities = [
  { icon: TreePine, title: "Plant a Virtual Tree", desc: "Learn about tree species and plant your own virtual forest!", xp: 50, color: "bg-primary/10 text-primary" },
  { icon: Recycle, title: "Waste Sorting Challenge", desc: "Sort waste items into correct bins as fast as you can.", xp: 75, color: "bg-eco-leaf/10 text-eco-leaf" },
  { icon: Droplets, title: "Water Conservation", desc: "Discover ways to save water through interactive scenarios.", xp: 60, color: "bg-eco-sky/10 text-eco-sky" },
  { icon: Wind, title: "Renewable Energy Lab", desc: "Build and test virtual wind turbines and solar panels.", xp: 80, color: "bg-eco-water/10 text-eco-water" },
  { icon: Flower2, title: "Biodiversity Explorer", desc: "Identify plants and animals in different ecosystems.", xp: 65, color: "bg-secondary/10 text-secondary" },
  { icon: Gamepad2, title: "Eco Quiz Blitz", desc: "Fast-paced quiz rounds on environmental topics!", xp: 100, color: "bg-eco-earth/10 text-eco-earth" },
];

const games = [
  { title: "🌊 Ocean Cleanup", desc: "Remove plastic from the ocean in this timed challenge.", difficulty: "Easy", xp: 100 },
  { title: "🌳 Forest Builder", desc: "Strategically plant trees to restore a damaged forest.", difficulty: "Medium", xp: 200 },
  { title: "♻️ Recycle Rush", desc: "Sort recycling items on a conveyor belt before time runs out!", difficulty: "Hard", xp: 300 },
  { title: "🔋 Energy Grid", desc: "Balance renewable energy sources to power a city.", difficulty: "Expert", xp: 500 },
];

export default function SchoolsPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Header */}
      <section className="gradient-school py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-display font-black text-primary-foreground">
            🏫 Schools Portal
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 text-primary-foreground/80 text-lg max-w-xl mx-auto">
            Fun, interactive activities and games to learn about our environment!
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link to="/schools/study" className="px-6 py-3 rounded-xl bg-card text-foreground font-display font-bold text-sm shadow-elevated hover:shadow-card transition-shadow">
              📚 Study Hub
            </Link>
            <Link to="/schools/quiz" className="px-6 py-3 rounded-xl bg-card text-foreground font-display font-bold text-sm shadow-elevated hover:shadow-card transition-shadow">
              📝 Take Quiz
            </Link>
            <Link to="/schools/exam" className="px-6 py-3 rounded-xl bg-card text-foreground font-display font-bold text-sm shadow-elevated hover:shadow-card transition-shadow">
              ✍️ Written Exam
            </Link>
            <Link to="/schools/books" className="px-6 py-3 rounded-xl bg-card text-foreground font-display font-bold text-sm shadow-elevated hover:shadow-card transition-shadow">
              📖 Books
            </Link>
            <Link to="/schools/games" className="px-6 py-3 rounded-xl bg-primary-foreground/20 text-primary-foreground font-display font-bold text-sm backdrop-blur-sm hover:bg-primary-foreground/30 transition-colors">
              🎮 Play Games
            </Link>
            <Link to="/leaderboard" className="px-6 py-3 rounded-xl bg-primary-foreground/20 text-primary-foreground font-display font-bold text-sm backdrop-blur-sm hover:bg-primary-foreground/30 transition-colors">
              🏆 Leaderboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Activities */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold text-foreground mb-8">📚 Learning Activities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((a, i) => (
              <motion.div
                key={a.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-elevated transition-shadow cursor-pointer group"
              >
                <div className={`w-12 h-12 rounded-xl ${a.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <a.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-foreground">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs font-display font-bold text-secondary">+{a.xp} XP</span>
                  <span className="text-xs text-primary font-semibold">Start →</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Preview */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold text-foreground mb-8">🎮 Eco Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.map((g, i) => (
              <motion.div
                key={g.title} initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
                className="bg-card rounded-xl p-6 shadow-card border border-border flex items-start gap-4 hover:shadow-elevated transition-shadow cursor-pointer"
              >
                <div className="text-4xl">{g.title.slice(0, 2)}</div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-foreground">{g.title.slice(2).trim()}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{g.desc}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      g.difficulty === "Easy" ? "bg-primary/10 text-primary" :
                      g.difficulty === "Medium" ? "bg-secondary/10 text-secondary" :
                      g.difficulty === "Hard" ? "bg-eco-earth/10 text-eco-earth" :
                      "bg-destructive/10 text-destructive"
                    }`}>{g.difficulty}</span>
                    <span className="text-xs font-display font-bold text-secondary">+{g.xp} XP</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
