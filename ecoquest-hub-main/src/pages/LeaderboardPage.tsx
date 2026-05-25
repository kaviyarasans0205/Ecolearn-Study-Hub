import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 } as const,
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "school" | "college">("all");

  const { data: allLeaders = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, display_name, total_xp, institution_type, institution_name, avatar_url")
        .order("total_xp", { ascending: false })
        .limit(50);
      return (data ?? []).map((p) => ({
        name: p.display_name ?? "Anonymous",
        xp: p.total_xp,
        type: p.institution_type === "college" ? "College" : "School",
        userId: p.user_id,
        institution: p.institution_name,
      }));
    },
  });

  const leaders = allLeaders
    .filter(l => filter === "all" || l.type.toLowerCase() === filter)
    .map((l, i) => ({
      ...l,
      rank: i + 1,
      badge: i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "⭐",
    }));

  const myRank = leaders.find((l) => l.userId === user?.id);

  return (
    <div className="min-h-screen pt-16">
      <section className="gradient-warm py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-display font-black text-secondary-foreground">
            🏆 Leaderboard
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-4 text-secondary-foreground/80 text-lg">
            Top eco-champions across schools and colleges
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-4 flex gap-2 justify-center">
            {(["all", "school", "college"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl font-display font-bold text-sm transition-all ${filter === f ? "bg-card text-foreground shadow-elevated" : "bg-card/30 text-secondary-foreground/70 hover:bg-card/50"}`}>
                {f === "all" ? "🌍 All" : f === "school" ? "🏫 Schools" : "🎓 Colleges"}
              </button>
            ))}
          </motion.div>
          {!user && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Link to="/auth" className="inline-block mt-4 px-6 py-3 rounded-xl bg-card text-foreground font-display font-bold text-sm shadow-elevated hover:shadow-card transition-shadow">
                🔐 Sign in to see your rank
              </Link>
            </motion.div>
          )}
          {myRank && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 text-secondary-foreground font-display font-bold text-lg">
              Your Rank: #{myRank.rank} • {myRank.xp.toLocaleString()} XP
            </motion.p>
          )}
        </div>
      </section>

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Loading leaderboard...</div>
      ) : leaders.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground text-lg mb-4">No students on the leaderboard yet!</p>
          <Link to="/auth" className="text-primary font-semibold hover:underline">Sign up and be the first →</Link>
        </div>
      ) : (
        <>
          {/* Top 3 */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              {leaders.length >= 3 && (
                <div className="flex flex-col md:flex-row items-end justify-center gap-6 mb-16">
                  {[leaders[1], leaders[0], leaders[2]].map((entry, idx) => {
                    if (!entry) return null;
                    const heights = ["h-32", "h-44", "h-24"];
                    const sizes = ["text-5xl", "text-7xl", "text-4xl"];
                    const isMe = entry.userId === user?.id;
                    return (
                      <motion.div
                        key={entry.rank} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className={`flex flex-col items-center ${isMe ? "ring-2 ring-primary rounded-2xl p-3" : ""}`}
                      >
                        <span className={`${sizes[idx]} mb-3`}>{entry.badge}</span>
                        <p className="font-display font-bold text-foreground text-center">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">{entry.type}</p>
                        <p className="text-sm font-bold text-secondary">{entry.xp.toLocaleString()} XP</p>
                        {isMe && <span className="text-xs text-primary font-bold mt-1">← You</span>}
                        <div className={`${heights[idx]} w-28 mt-4 rounded-t-xl ${
                          idx === 1 ? "gradient-warm" : idx === 0 ? "bg-muted" : "bg-muted/70"
                        }`} />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Full list */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
                  <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                    <span>Rank</span><span>Name</span><span>Type</span><span>XP</span>
                  </div>
                  {leaders.map((entry, i) => {
                    const isMe = entry.userId === user?.id;
                    return (
                      <motion.div
                        key={entry.rank} initial="hidden" animate="visible" variants={fadeUp} custom={i}
                        className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-4 border-b border-border last:border-0 items-center hover:bg-muted/30 transition-colors ${isMe ? "bg-primary/5" : ""}`}
                      >
                        <span className="text-lg font-display font-bold text-foreground w-8">{entry.badge}</span>
                        <span className="font-medium text-foreground">
                          {entry.name}
                          {isMe && <span className="ml-2 text-xs text-primary font-bold">(You)</span>}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          entry.type === "School" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                        }`}>{entry.type}</span>
                        <span className="font-display font-bold text-secondary">{entry.xp.toLocaleString()}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
