import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  { id: "doctor", emoji: "🏥", color: "from-red-100 to-pink-100", border: "border-red-200" },
  { id: "school", emoji: "🏫", color: "from-blue-100 to-cyan-100", border: "border-blue-200" },
  { id: "store", emoji: "🛒", color: "from-green-100 to-emerald-100", border: "border-green-200" },
  { id: "work", emoji: "💼", color: "from-amber-100 to-yellow-100", border: "border-amber-200" },
  { id: "conversation", emoji: "💬", color: "from-violet-100 to-purple-100", border: "border-violet-200" },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 15 } },
};

export default function CategoryGrid({ progressData }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 p-4"
    >
      {categories.map((cat) => {
        const progress = progressData?.[cat.id] || { total: 0, learned: 0 };
        const pct = progress.total > 0 ? Math.round((progress.learned / progress.total) * 100) : 0;

        return (
          <motion.div key={cat.id} variants={itemVariants}>
            <Link to={`/CardDeck?category=${cat.id}`}>
              <motion.div
                whileTap={{ scale: 0.92 }}
                className={`bg-gradient-to-br ${cat.color} ${cat.border} border-2 rounded-3xl p-6 flex flex-col items-center gap-3 shadow-sm hover:shadow-md transition-shadow`}
              >
                <span className="text-6xl">{cat.emoji}</span>
                {progress.total > 0 && (
                  <div className="w-full bg-white/60 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                )}
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}