import { motion } from "framer-motion";

export default function SpeechFeedback({ confidence, spokenText }) {
  const getColor = () => {
    if (confidence >= 75) return { bar: "from-green-400 to-emerald-500", label: "🟢" };
    if (confidence >= 45) return { bar: "from-yellow-400 to-amber-500", label: "🟡" };
    return { bar: "from-red-400 to-rose-500", label: "🔴" };
  };

  const { bar, label } = getColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-2"
    >
      {/* Bar track */}
      <div className="flex items-center gap-2">
        <span className="text-lg">{label}</span>
        <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${confidence}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${bar}`}
          />
        </div>
        <span className="text-sm font-bold text-slate-500 w-10 text-right">
          {confidence}%
        </span>
      </div>

      {/* Spoken text echo */}
      {spokenText && (
        <p className="text-center text-xs text-slate-400 italic truncate px-2">
          🗣️ "{spokenText}"
        </p>
      )}
    </motion.div>
  );
}