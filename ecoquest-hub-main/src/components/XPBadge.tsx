import { motion } from "framer-motion";

interface XPBadgeProps {
  xp: number;
  label?: string;
}

export default function XPBadge({ xp, label = "XP Earned" }: XPBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-warm font-display font-bold text-secondary-foreground text-sm shadow-card"
    >
      ⭐ +{xp} {label}
    </motion.div>
  );
}
