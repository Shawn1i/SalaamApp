import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import EmojiNav from "../components/EmojiNav";
import SwipeCard from "../components/SwipeCard";
import NotesPanel from "../components/NotesPanel";
import AISuggestPanel from "../components/AISuggestPanel";

export default function CardDeck() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get("category") || "doctor";

  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const [showAISuggest, setShowAISuggest] = useState(false);
  const [deckComplete, setDeckComplete] = useState(false);
  const [stats, setStats] = useState({ learned: 0, reviewing: 0 });

  useEffect(() => {
    loadData();
  }, [category]);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);

    const allCards = await base44.entities.Card.filter({ category });
    const progress = await base44.entities.UserCardProgress.filter({ user_id: me.email });

    const pMap = {};
    progress.forEach((p) => {
      pMap[p.card_id] = p;
    });
    setProgressMap(pMap);

    // Show unlearned cards first, then shuffle recycled ones in
    const unlearned = allCards.filter((c) => !pMap[c.id] || pMap[c.id].status !== "learned");
    setCards(unlearned.length > 0 ? unlearned : []);
    setCurrentIndex(0);
    setDeckComplete(unlearned.length === 0);

    const learnedCount = allCards.filter((c) => pMap[c.id]?.status === "learned").length;
    setStats({ learned: learnedCount, reviewing: allCards.length - learnedCount });
  };

  const handleSwipe = async (direction) => {
    const card = cards[currentIndex];
    if (!card || !user) return;

    const existing = progressMap[card.id];

    if (direction === "right") {
      if (existing) {
        await base44.entities.UserCardProgress.update(existing.id, {
          status: "learned",
          times_seen: (existing.times_seen || 0) + 1,
        });
      } else {
        await base44.entities.UserCardProgress.create({
          user_id: user.email,
          card_id: card.id,
          status: "learned",
          times_seen: 1,
          times_correct: 0,
        });
      }
      setStats((s) => ({ learned: s.learned + 1, reviewing: s.reviewing - 1 }));
    } else {
      if (existing) {
        await base44.entities.UserCardProgress.update(existing.id, {
          times_seen: (existing.times_seen || 0) + 1,
        });
      } else {
        await base44.entities.UserCardProgress.create({
          user_id: user.email,
          card_id: card.id,
          status: "learning",
          times_seen: 1,
          times_correct: 0,
        });
      }
      // Recycle card to end of deck
      setCards((prev) => [...prev, card]);
    }

    // Move to next card
    setTimeout(() => {
      setCurrentIndex((i) => {
        const next = i + 1;
        if (next >= cards.length && direction === "right") {
          setDeckComplete(true);
        }
        return next;
      });
    }, 300);
  };

  const currentCard = cards[currentIndex];
  const categoryEmojis = {
    doctor: "🏥",
    school: "🏫",
    store: "🛒",
    work: "💼",
    conversation: "💬",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-violet-50">
      <EmojiNav />
      <div className="pt-20 pb-8 max-w-lg mx-auto px-4">
        {/* Category header */}
        <div className="text-center mb-4">
          <span className="text-5xl">{categoryEmojis[category] || "📚"}</span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xl">✅ {stats.learned}</span>
          <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
            <motion.div
              animate={{
                width: `${
                  stats.learned + stats.reviewing > 0
                    ? (stats.learned / (stats.learned + stats.reviewing)) * 100
                    : 0
                }%`,
              }}
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
            />
          </div>
          <span className="text-xl">🔄 {stats.reviewing}</span>
        </div>

        {/* Card stack */}
        <div className="relative h-[520px] flex items-center justify-center">
          <AnimatePresence>
            {currentCard && !deckComplete && (
              <SwipeCard
                key={currentCard.id + "-" + currentIndex}
                card={currentCard}
                onSwipe={handleSwipe}
                onNotesOpen={() => setShowNotes(true)}
              />
            )}
          </AnimatePresence>

          {deckComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <span className="text-8xl block">🎉</span>
              <span className="text-6xl block">✅</span>
              <a href="/TestMode">
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  className="mt-6 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl p-5 inline-flex items-center gap-3"
                >
                  <span className="text-4xl">🧪</span>
                  <span className="text-4xl">➡️</span>
                </motion.div>
              </a>
            </motion.div>
          )}

          {!currentCard && !deckComplete && cards.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <span className="text-8xl block">📭</span>
            </motion.div>
          )}
        </div>

        {/* AI Suggest button */}
        {currentCard && !deckComplete && (
          <div className="flex justify-center mt-4">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowAISuggest(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-2xl px-6 py-4 shadow-lg text-2xl"
            >
              <span>🤖</span>
              <span>✨</span>
            </motion.button>
          </div>
        )}

        {/* AI Suggest panel */}
        <AISuggestPanel
          keyword={currentCard?.keyword}
          isOpen={showAISuggest}
          onClose={() => setShowAISuggest(false)}
        />

        {/* Notes panel */}
        <NotesPanel
          isOpen={showNotes}
          onClose={() => setShowNotes(false)}
          cardId={currentCard?.id}
          userId={user?.email}
        />
      </div>
    </div>
  );
}