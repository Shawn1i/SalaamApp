import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import EmojiNav from "../components/EmojiNav";
import CategoryGrid from "../components/CategoryGrid";

export default function Home() {
  const [progressData, setProgressData] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const me = await base44.auth.me();
    setUser(me);

    const cards = await base44.entities.Card.list();
    const progress = await base44.entities.UserCardProgress.filter({ user_id: me.email });

    const data = {};
    cards.forEach((card) => {
      if (!data[card.category]) {
        data[card.category] = { total: 0, learned: 0 };
      }
      data[card.category].total++;
    });

    progress.forEach((p) => {
      const card = cards.find((c) => c.id === p.card_id);
      if (card && p.status === "learned") {
        data[card.category].learned++;
      }
    });

    setProgressData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-violet-50">
      <EmojiNav />
      <div className="pt-20 pb-8 max-w-lg mx-auto">
        {/* Welcome emoji header */}
        <div className="text-center py-8">
          <span className="text-7xl">📚</span>
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-4xl">👋</span>
            {user && (
              <span className="text-lg text-slate-500 font-medium">
                {user.full_name}
              </span>
            )}
          </div>
        </div>

        <CategoryGrid progressData={progressData} />

        {/* Test mode CTA */}
        <div className="px-4 mt-6">
          <a href="/TestMode">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 rounded-3xl p-6 flex items-center justify-center gap-4 shadow-lg">
              <span className="text-5xl">🧪</span>
              <span className="text-5xl">🎯</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}