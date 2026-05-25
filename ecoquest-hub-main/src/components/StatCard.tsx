import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle: string;
  gradient?: string;
}

export default function StatCard({ icon: Icon, title, value, subtitle, gradient = "gradient-hero" }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-card rounded-xl p-6 shadow-card border border-border"
    >
      <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">{title}</p>
      <p className="text-3xl font-display font-bold text-foreground mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
    </motion.div>
  );
}
