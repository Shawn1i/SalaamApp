import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AudioButton from "./AudioButton";

export default function TestCard({ card, onResult }) {
  const [result, setResult] = useState(null); // 'correct' | 'incorrect' | null
  const [isListening, setIsListening] = useState(false);
  const [spokenWord, setSpokenWord] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const blankSentence = card.sentence.replace(
    new RegExp(`\\b${card.keyword}\\b`, "gi"),
    "______"
  );

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback: just reveal answer
      handleReveal();
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onresult = (event) => {
      const results = Array.from(event.results[0]);
      const spoken = results.map((r) => r.transcript.toLowerCase().trim());
      setSpokenWord(spoken[0] || "");

      const isCorrect = spoken.some((s) =>
        s.includes(card.keyword.toLowerCase())
      );

      if (isCorrect) {
        setResult("correct");
        onResult(true);
      } else {
        setResult("incorrect");
        // Speak the correct word
        const utterance = new SpeechSynthesisUtterance(card.keyword);
        utterance.rate = 0.7;
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
        onResult(false);
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  const handleReveal = () => {
    setResult("incorrect");
    const utterance = new SpeechSynthesisUtterance(card.keyword);
    utterance.rate = 0.7;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
    onResult(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-full max-w-sm mx-auto"
    >
      <div
        className={`bg-white rounded-3xl shadow-xl overflow-hidden border-2 transition-colors ${
          result === "correct"
            ? "border-green-400 bg-green-50"
            : result === "incorrect"
            ? "border-amber-400 bg-amber-50"
            : "border-slate-100"
        }`}
      >
        {/* Image placeholder (hidden in test) */}
        <div className="w-full aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <span className="text-7xl">❓</span>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-xl font-semibold text-slate-800 text-center leading-relaxed">
            {blankSentence}
          </p>

          <AnimatePresence mode="wait">
            {result === null && (
              <motion.div
                key="actions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-4"
              >
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  animate={isListening ? { scale: [1, 1.2, 1] } : {}}
                  transition={isListening ? { repeat: Infinity, duration: 0.8 } : {}}
                  onClick={startListening}
                  className={`text-5xl p-5 rounded-full transition-colors ${
                    isListening
                      ? "bg-red-100 ring-4 ring-red-300"
                      : "bg-indigo-100 hover:bg-indigo-200"
                  }`}
                >
                  🎤
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={handleReveal}
                  className="text-4xl p-4 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  👁️
                </motion.button>
              </motion.div>
            )}

            {result === "correct" && (
              <motion.div
                key="correct"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-7xl">✅</span>
                <p className="text-lg font-bold text-green-700">{card.keyword}</p>
              </motion.div>
            )}

            {result === "incorrect" && (
              <motion.div
                key="incorrect"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <span className="text-7xl">🔄</span>
                <p className="text-lg font-bold text-amber-700">{card.keyword}</p>
                <AudioButton text={card.keyword} size="md" />
              </motion.div>
            )}
          </AnimatePresence>

          {spokenWord && result && (
            <p className="text-center text-sm text-slate-400">
              🗣️ "{spokenWord}"
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}