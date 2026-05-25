import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { School, GraduationCap, TreePine, Zap, Users, Target } from "lucide-react";
import heroEarth from "@/assets/hero-earth.png";
import StatCard from "@/components/StatCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

const features = [
  { icon: School, title: "School Activities", desc: "Fun games, sorting challenges, and eco-quests designed for younger learners.", link: "/schools", gradient: "gradient-school" },
  { icon: GraduationCap, title: "College Challenges", desc: "Problem-solving, quizzes, and attribute-based questions for advanced learners.", link: "/colleges", gradient: "gradient-college" },
  { icon: TreePine, title: "Eco Games", desc: "Interactive games that teach about ecosystems, recycling, and sustainability.", link: "/schools/games", gradient: "gradient-hero" },
  { icon: Target, title: "Quizzes & Tests", desc: "Test your knowledge with timed quizzes and earn XP to climb the leaderboard.", link: "/colleges/quizzes", gradient: "gradient-warm" },
];

export default function LandingPage() {
  const { data: stats } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: async () => {
      const [profilesRes, xpRes] = await Promise.all([
        supabase.from("profiles").select("user_id, institution_type", { count: "exact" }),
        supabase.from("profiles").select("total_xp"),
      ]);

      const profiles = profilesRes.data ?? [];
      const totalUsers = profilesRes.count ?? profiles.length;
      const schoolCount = profiles.filter((p) => p.institution_type === "school").length;
      const collegeCount = profiles.filter((p) => p.institution_type === "college").length;
      const totalXP = (xpRes.data ?? []).reduce((sum, p) => sum + (p.total_xp ?? 0), 0);

      return { totalUsers, schoolCount, collegeCount, totalXP };
    },
    staleTime: 60_000,
  });

  const formatNum = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <motion.div
            initial="hidden" animate="visible"
            className="flex-1 text-center md:text-left"
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              🌍 Gamified Eco Education
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-display font-black text-foreground leading-tight">
              Learn to Save<br />
              <span className="text-primary">Our Planet</span> 🌱
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg text-muted-foreground max-w-lg">
              An interactive platform where schools and colleges compete, learn, and earn rewards while solving real environmental challenges.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
              <Link to="/schools" className="px-8 py-3.5 rounded-xl gradient-school text-primary-foreground font-display font-bold text-sm shadow-elevated hover:opacity-90 transition-opacity">
                🏫 Schools Portal
              </Link>
              <Link to="/colleges" className="px-8 py-3.5 rounded-xl gradient-college text-accent-foreground font-display font-bold text-sm shadow-elevated hover:opacity-90 transition-opacity">
                🎓 Colleges Portal
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex justify-center"
          >
            <img src={heroEarth} alt="Green Earth illustration" width={420} height={420} className="animate-float drop-shadow-2xl" />
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} title="Active Learners" value={formatNum(stats?.totalUsers ?? 0)} subtitle="Registered users" />
          <StatCard icon={School} title="School Students" value={String(stats?.schoolCount ?? 0)} subtitle="Learning & growing" gradient="gradient-school" />
          <StatCard icon={GraduationCap} title="College Students" value={String(stats?.collegeCount ?? 0)} subtitle="Participating" gradient="gradient-college" />
          <StatCard icon={Zap} title="XP Earned" value={formatNum(stats?.totalXP ?? 0)} subtitle="Total community XP" gradient="gradient-warm" />
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Explore Learning Paths
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Choose your level and start earning points through interactive environmental challenges.
            </motion.p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} custom={i}
              >
                <Link to={f.link} className="block bg-card rounded-2xl p-8 shadow-card border border-border hover:shadow-elevated transition-shadow group">
                  <div className={`w-14 h-14 rounded-xl ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <f.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-muted-foreground">{f.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 EcoLearn — Gamified Environmental Education Platform</p>
        </div>
      </footer>
    </div>
  );
}