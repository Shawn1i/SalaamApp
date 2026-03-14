import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import EmojiNav from "../components/EmojiNav";

const categoryConfig = [
  { id: "doctor", emoji: "🏥", bg: "from-red-100 to-pink-100" },
  { id: "school", emoji: "🏫", bg: "from-blue-100 to-cyan-100" },
  { id: "store", emoji: "🛒", bg: "from-green-100 to-emerald-100" },
  { id: "work", emoji: "💼", bg: "from-amber-100 to-yellow-100" },
  { id: "conversation", emoji: "💬", bg: "from-violet-100 to-purple-100" },
];

export default function Progress() {
  const [stats, setStats] = useState({
    totalCards: 0,
    learnedCards: 0,
    totalSeen: 0,
    totalCorrect: 0,
    byCategory: {},
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const me = await base44.auth.me();
    const allCards = await base44.entities.Card.list();
    const progress = await base44.entities.UserCardProgress.filter({ user_id: me.email });

    const pMap = {};
    progress.forEach((p) => {
      pMap[p.card_id] = p;
    });

    const byCategory = {};
    allCards.forEach((card) => {
      if (!byCategory[card.category]) {
        byCategory[card.category] = { total: 0, learned: 0, seen: 0, correct: 0 };
      }
      byCategory[card.category].total++;
      const p = pMap[card.id];
      if (p) {
        if (p.status === "learned") byCategory[card.category].learned++;
        byCategory[card.category].seen += p.times_seen || 0;
        byCategory[card.category].correct += p.times_correct || 0;
      }
    });

    const learnedCards = progress.filter((p) => p.status === "learned").length;
    const totalSeen = progress.reduce((s, p) => s + (p.times_seen || 0), 0);
    const totalCorrect = progress.reduce((s, p) => s + (p.times_correct || 0), 0);

    setStats({
      totalCards: allCards.length,
      learnedCards,
      totalSeen,
      totalCorrect,
      byCategory,
    });
  };

  const overallPct = stats.totalCards > 0 ? Math.round((stats.learnedCards / stats.totalCards) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-violet-50">
      <EmojiNav />
      <div className="pt-20 pb-8 max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-5xl">📊</span>
        </div>

        {/* Overall progress circle */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl shadow-lg p-8 text-center mb-6"
        >
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="3"
              />
              <motion.path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${overallPct}, 100` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
              <defs>
                <linearGradient id="gradient">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-indigo-600">{overallPct}%</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 text-2xl">
            <div className="flex items-center gap-1">
              <span>✅</span>
              <span className="font-bold">{stats.learnedCards}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>👁️</span>
              <span className="font-bold">{stats.totalSeen}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🎯</span>
              <span className="font-bold">{stats.totalCorrect}</span>
            </div>
          </div>
        </motion.div>

        {/* Per-category */}
        <div className="space-y-3">
          {categoryConfig.map((cat, i) => {
            const data = stats.byCategory[cat.id] || { total: 0, learned: 0 };
            const pct = data.total > 0 ? Math.round((data.learned / data.total) * 100) : 0;

            return (
              <motion.div
                key={cat.id}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * i }}
                className={`bg-gradient-to-r ${cat.bg} rounded-2xl p-4 flex items-center gap-4`}
              >
                <span className="text-4xl">{cat.emoji}</span>
                <div className="flex-1">
                  <div className="bg-white/60 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.3 + 0.1 * i, duration: 0.8 }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-lg font-bold text-slate-700">
                  {data.learned}/{data.total}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}