import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Gamepad2, Brain, TrendingUp, User, BookOpen, Target, Award } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Link, Navigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const XP_LEVELS = [
  { level: 1, name: "Seedling 🌱", min: 0 },
  { level: 2, name: "Sprout 🌿", min: 100 },
  { level: 3, name: "Sapling 🌳", min: 300 },
  { level: 4, name: "Tree 🏔️", min: 600 },
  { level: 5, name: "Forest Guardian 🌲", min: 1000 },
  { level: 6, name: "Eco Warrior ⚡", min: 2000 },
  { level: 7, name: "Planet Champion 🌍", min: 5000 },
  { level: 8, name: "Eco Legend 👑", min: 10000 },
];

function getLevel(xp: number) {
  let current = XP_LEVELS[0];
  for (const lvl of XP_LEVELS) {
    if (xp >= lvl.min) current = lvl;
    else break;
  }
  const next = XP_LEVELS.find((l) => l.min > xp);
  const progress = next ? ((xp - current.min) / (next.min - current.min)) * 100 : 100;
  return { ...current, progress, nextMin: next?.min ?? current.min, nextName: next?.name };
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();

  const { data: gameScores } = useQuery({
    queryKey: ["game_scores", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("game_scores").select("*").eq("user_id", user!.id).order("played_at", { ascending: false }).limit(10);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: quizResults } = useQuery({
    queryKey: ["quiz_results", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("quiz_results").select("*").eq("user_id", user!.id).order("completed_at", { ascending: false }).limit(10);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: leaderboardRank } = useQuery({
    queryKey: ["my_rank", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, total_xp").order("total_xp", { ascending: false }).limit(100);
      const idx = (data ?? []).findIndex((p) => p.user_id === user!.id);
      return idx >= 0 ? idx + 1 : null;
    },
    enabled: !!user,
  });

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const totalXP = profile?.total_xp ?? 0;
  const level = getLevel(totalXP);
  const totalGameXP = gameScores?.reduce((sum, s) => sum + s.xp_earned, 0) ?? 0;
  const totalQuizXP = quizResults?.reduce((sum, r) => sum + r.xp_earned, 0) ?? 0;

  // Subject-wise quiz breakdown
  const subjectMap: Record<string, { score: number; total: number; count: number }> = {};
  quizResults?.forEach((r) => {
    if (!subjectMap[r.quiz_name]) subjectMap[r.quiz_name] = { score: 0, total: 0, count: 0 };
    subjectMap[r.quiz_name].score += r.score;
    subjectMap[r.quiz_name].total += r.total_questions;
    subjectMap[r.quiz_name].count++;
  });

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="gradient-hero py-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-display font-black text-primary-foreground">
                Hey, {profile?.display_name ?? "Eco Learner"}! 👋
              </h1>
              <p className="text-primary-foreground/70 text-sm mt-1">
                {profile?.institution_type === "college" ? "🎓 College Student" : "🏫 School Student"} • {totalXP} Total XP
                {leaderboardRank && ` • Rank #${leaderboardRank}`}
              </p>
            </div>
          </motion.div>

          {/* Level Progress */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-foreground font-display font-bold text-sm">Level {level.level}: {level.name}</span>
              {level.nextName && (
                <span className="text-primary-foreground/60 text-xs">Next: {level.nextName} ({level.nextMin} XP)</span>
              )}
            </div>
            <Progress value={level.progress} className="h-3 bg-primary-foreground/20" />
            <p className="text-xs text-primary-foreground/50 mt-1">{totalXP} / {level.nextMin} XP</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard icon={Trophy} title="Total XP" value={String(totalXP)} subtitle={`Level ${level.level}`} gradient="gradient-warm" />
            <StatCard icon={Gamepad2} title="Games Played" value={String(gameScores?.length ?? 0)} subtitle={`${totalGameXP} XP earned`} gradient="gradient-school" />
            <StatCard icon={Brain} title="Quizzes Taken" value={String(quizResults?.length ?? 0)} subtitle={`${totalQuizXP} XP earned`} gradient="gradient-college" />
            <StatCard icon={Award} title="Rank" value={leaderboardRank ? `#${leaderboardRank}` : "—"} subtitle="On leaderboard" />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[
              { to: "/schools/study", label: "📚 Study Hub", color: "bg-primary/10 text-primary" },
              { to: "/schools/books", label: "📖 Textbooks", color: "bg-secondary/10 text-secondary" },
              { to: "/schools/quiz", label: "📝 Take Quiz", color: "bg-accent/10 text-accent" },
              { to: "/leaderboard", label: "🏆 Leaderboard", color: "bg-eco-earth/10 text-eco-earth" },
            ].map((a) => (
              <Link key={a.to} to={a.to} className={`rounded-xl p-4 font-display font-bold text-sm text-center hover:opacity-80 transition-opacity ${a.color}`}>
                {a.label}
              </Link>
            ))}
          </div>

          {/* Subject Progress */}
          {Object.keys(subjectMap).length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-display font-bold text-foreground mb-4">📊 Subject-wise Performance</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(subjectMap).map(([subject, data]) => {
                  const pct = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
                  return (
                    <div key={subject} className="bg-card rounded-xl p-5 border border-border shadow-card">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display font-bold text-foreground text-sm truncate">{subject}</span>
                        <span className="text-xs text-muted-foreground">{data.count} quizzes</span>
                      </div>
                      <Progress value={pct} className="h-2 mb-1" />
                      <p className="text-xs text-muted-foreground">{pct}% accuracy • {data.score}/{data.total} correct</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Recent Games */}
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-4">🎮 Recent Games</h2>
              {gameScores && gameScores.length > 0 ? (
                <div className="space-y-3">
                  {gameScores.map((s) => (
                    <div key={s.id} className="bg-card rounded-xl p-4 shadow-card border border-border flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{s.game_name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(s.played_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-foreground">{s.score} pts</p>
                        <p className="text-xs font-bold text-secondary">+{s.xp_earned} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl p-8 shadow-card border border-border text-center">
                  <p className="text-muted-foreground mb-3">No games played yet!</p>
                  <Link to="/schools/games" className="text-primary font-semibold text-sm hover:underline">Play your first game →</Link>
                </div>
              )}
            </div>

            {/* Recent Quizzes */}
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-4">📝 Recent Quizzes</h2>
              {quizResults && quizResults.length > 0 ? (
                <div className="space-y-3">
                  {quizResults.map((r) => (
                    <div key={r.id} className="bg-card rounded-xl p-4 shadow-card border border-border flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{r.quiz_name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(r.completed_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-foreground">{r.score}/{r.total_questions}</p>
                        <p className="text-xs font-bold text-secondary">+{r.xp_earned} XP</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl p-8 shadow-card border border-border text-center">
                  <p className="text-muted-foreground mb-3">No quizzes taken yet!</p>
                  <Link to="/schools/quiz" className="text-primary font-semibold text-sm hover:underline">Take a quiz →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
