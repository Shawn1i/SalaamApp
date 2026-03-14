import { useState } from "react";
import { motion } from "framer-motion";

export default function AudioButton({ text, size = "lg" }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = (e) => {
    if (e) e.stopPropagation();
    if (isPlaying) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const sizeClasses = {
    sm: "text-2xl p-2",
    md: "text-3xl p-3",
    lg: "text-4xl p-4",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      animate={isPlaying ? { scale: [1, 1.15, 1] } : {}}
      transition={isPlaying ? { repeat: Infinity, duration: 0.6 } : {}}
      onClick={speak}
      className={`${sizeClasses[size]} rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors ${
        isPlaying ? "ring-4 ring-indigo-300 ring-opacity-50" : ""
      }`}
    >
      {isPlaying ? "🔉" : "🔊"}
    </motion.button>
  );
}