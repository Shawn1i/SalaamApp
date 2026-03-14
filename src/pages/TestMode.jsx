import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import EmojiNav from "../components/EmojiNav";
import TestCard from "../components/TestCard";

export default function TestMode() {
  const [testCards, setTestCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    loadTestCards();
  }, []);

  const loadTestCards = async () => {
    const me = await base44.auth.me();
    setUser(me);

    const progress = await base44.entities.UserCardProgress.filter({
      user_id: me.email,
      status: "learned",
    });

    if (progress.length === 0) {
      setTestCards([]);
      return;
    }

    const allCards = await base44.entities.Card.list();
    const pMap = {};
    progress.forEach((p) => {
      pMap[p.card_id] = p;
    });
    setProgressMap(pMap);

    const learnedCards = allCards.filter((c) => pMap[c.id]);
    // Shuffle
    const shuffled = [...learnedCards].sort(() => Math.random() - 0.5);
    setTestCards(shuffled);
  };

  const handleResult = async (isCorrect) => {
    const card = testCards[currentIndex];
    const prog = progressMap[card.id];

    if (prog) {
      await base44.entities.UserCardProgress.update(prog.id, {
        times_correct: (prog.times_correct || 0) + (isCorrect ? 1 : 0),
      });
    }

    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));

    // Auto advance after delay
    setTimeout(() => {
      const next = currentIndex + 1;
      if (next >= testCards.length) {
        setIsComplete(true);
      } else {
        setCurrentIndex(next);
      }
    }, 2000);
  };

  const currentCard = testCards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
      <EmojiNav />
      <div className="pt-20 pb-8 max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="text-5xl">🧪</span>
        </div>

        {/* Score bar */}
        {testCards.length > 0 && (
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex items-center gap-1 text-2xl">
              <span>✅</span>
              <span className="font-bold text-green-600">{score.correct}</span>
            </div>
            <div className="text-xl text-slate-400">
              {currentIndex + 1} / {testCards.length}
            </div>
            <div className="flex items-center gap-1 text-2xl">
              <span>🔄</span>
              <span className="font-bold text-amber-600">
                {score.total - score.correct}
              </span>
            </div>
          </div>
        )}

        {/* Test card */}
        <AnimatePresence mode="wait">
          {currentCard && !isComplete && (
            <TestCard
              key={currentCard.id + "-" + currentIndex}
              card={currentCard}
              onResult={handleResult}
            />
          )}
        </AnimatePresence>

        {/* Complete screen */}
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 mt-12"
          >
            <span className="text-8xl block">🏆</span>
            <div className="text-6xl font-bold text-indigo-600">
              {score.total > 0
                ? Math.round((score.correct / score.total) * 100)
                : 0}
              %
            </div>
            <div className="flex items-center justify-center gap-4 text-3xl">
              <span>✅ {score.correct}</span>
              <span className="text-slate-300">|</span>
              <span>🔄 {score.total - score.correct}</span>
            </div>
            <a href="/Home">
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="mt-4 inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-5"
              >
                <span className="text-4xl">🏠</span>
              </motion.div>
            </a>
          </motion.div>
        )}

        {/* No cards state */}
        {testCards.length === 0 && !isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4 mt-16"
          >
            <span className="text-8xl block">📭</span>
            <span className="text-5xl block">⬅️ 📚</span>
            <a href="/Home">
              <motion.div
                whileTap={{ scale: 0.92 }}
                className="mt-6 inline-flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-5"
              >
                <span className="text-4xl">🏠</span>
              </motion.div>
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}