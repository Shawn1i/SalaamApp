import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import AudioButton from "./AudioButton";

export default function AISuggestPanel({ keyword, isOpen, onClose }) {
  const [sentences, setSentences] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setSentences([]);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate exactly 3 very short, simple English sentences using the word "${keyword}". 
The sentences should be easy for a beginner English learner. 
Each sentence should be under 10 words. 
Return only the 3 sentences as a JSON array of strings.`,
      response_json_schema: {
        type: "object",
        properties: {
          sentences: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
    });
    setSentences(result.sentences || []);
    setLoading(false);
  };

  const handleOpen = () => {
    generate();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onAnimationComplete={(def) => {
            if (def === "animate" && sentences.length === 0 && !loading) {
              handleOpen();
            }
          }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 p-6 max-w-lg mx-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🤖</span>
              <span className="text-3xl">✨</span>
              <span className="text-xl font-semibold text-slate-700">"{keyword}"</span>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleOpen}
                disabled={loading}
                className="text-2xl p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors disabled:opacity-40"
              >
                🔁
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onClose}
                className="text-2xl p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                ✖️
              </motion.button>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                className="text-5xl inline-block"
              >
                ⚙️
              </motion.span>
              <span className="text-2xl">🤔</span>
            </div>
          )}

          {/* Sentences */}
          {!loading && sentences.length > 0 && (
            <div className="space-y-3">
              {sentences.map((sentence, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl p-4"
                >
                  <span className="text-2xl font-bold text-indigo-400">{i + 1}</span>
                  <p className="flex-1 text-base font-medium text-slate-700 leading-snug">
                    {sentence}
                  </p>
                  <AudioButton text={sentence} size="sm" />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}