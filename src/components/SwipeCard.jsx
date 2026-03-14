import { useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import AudioButton from "./AudioButton";

export default function SwipeCard({ card, onSwipe, onNotesOpen }) {
  const [exitX, setExitX] = useState(0);
  const [swipeState, setSwipeState] = useState(null); // 'right' | 'left' | null
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  const bgOverlay = useTransform(
    x,
    [-150, -50, 0, 50, 150],
    [
      "rgba(245, 158, 11, 0.3)",
      "rgba(245, 158, 11, 0.1)",
      "rgba(0,0,0,0)",
      "rgba(16, 185, 129, 0.1)",
      "rgba(16, 185, 129, 0.3)",
    ]
  );

  const handleDragEnd = (_, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setSwipeState("right");
      setExitX(500);
      onSwipe("right");
    } else if (info.offset.x < -threshold) {
      setSwipeState("left");
      setExitX(-500);
      onSwipe("left");
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      animate={swipeState ? { x: exitX, opacity: 0 } : {}}
      transition={{ type: "spring", damping: 20 }}
      className="absolute w-full max-w-sm cursor-grab active:cursor-grabbing touch-none"
    >
      <motion.div
        style={{ backgroundColor: bgOverlay }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
      >
        {/* Swipe indicators */}
        <div className="relative">
          <motion.div
            style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
            className="absolute top-4 right-4 z-10 text-5xl"
          >
            ✅
          </motion.div>
          <motion.div
            style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
            className="absolute top-4 left-4 z-10 text-5xl"
          >
            🔄
          </motion.div>

          {/* Card image */}
          <div className="w-full aspect-square bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center overflow-hidden">
            {card.image_url ? (
              <img
                src={card.image_url}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <span className="text-8xl">
                {card.category === "doctor" && "🏥"}
                {card.category === "school" && "🏫"}
                {card.category === "store" && "🛒"}
                {card.category === "work" && "💼"}
                {card.category === "conversation" && "💬"}
              </span>
            )}
          </div>
        </div>

        {/* Card content */}
        <div className="p-6 space-y-4">
          <p className="text-xl font-semibold text-slate-800 text-center leading-relaxed">
            {card.sentence}
          </p>

          <div className="flex items-center justify-center gap-4">
            <AudioButton text={card.sentence} size="lg" />
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation();
                onNotesOpen();
              }}
              className="text-4xl p-4 rounded-full bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              📝
            </motion.button>
          </div>
        </div>

        {/* Swipe hints */}
        <div className="flex justify-between px-6 pb-4 text-slate-300">
          <div className="flex items-center gap-1 text-sm">
            <span>⬅️</span>
            <span className="text-2xl">🔄</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-2xl">✅</span>
            <span>➡️</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}