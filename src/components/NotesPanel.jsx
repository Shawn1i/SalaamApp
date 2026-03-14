import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function NotesPanel({ isOpen, onClose, cardId, userId }) {
  const [note, setNote] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existingNote, setExistingNote] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (isOpen && cardId && userId) {
      loadNote();
    }
  }, [isOpen, cardId, userId]);

  const loadNote = async () => {
    const notes = await base44.entities.CardNote.filter({ user_id: userId, card_id: cardId });
    if (notes.length > 0) {
      setExistingNote(notes[0]);
      setNote(notes[0].note_text || "");
    } else {
      setExistingNote(null);
      setNote("");
    }
  };

  const saveNote = async () => {
    if (existingNote) {
      await base44.entities.CardNote.update(existingNote.id, { note_text: note });
    } else {
      await base44.entities.CardNote.create({ user_id: userId, card_id: cardId, note_text: note });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const file = new File([blob], "voice_note.webm", { type: "audio/webm" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (existingNote) {
        await base44.entities.CardNote.update(existingNote.id, { audio_note_url: file_url });
      } else {
        const created = await base44.entities.CardNote.create({ user_id: userId, card_id: cardId, audio_note_url: file_url });
        setExistingNote(created);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 p-6 max-w-lg mx-auto"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-3xl">📝</span>
            <motion.button whileTap={{ scale: 0.85 }} onClick={onClose} className="text-3xl p-2">
              ✖️
            </motion.button>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-28 rounded-2xl border-2 border-slate-200 p-4 text-lg focus:border-indigo-400 focus:outline-none resize-none"
            placeholder="..."
          />

          <div className="flex items-center justify-between mt-4 gap-3">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={toggleRecording}
              className={`text-3xl p-4 rounded-full transition-colors ${
                isRecording ? "bg-red-100 ring-4 ring-red-200" : "bg-slate-100"
              }`}
            >
              {isRecording ? "⏹️" : "🎤"}
            </motion.button>

            {existingNote?.audio_note_url && (
              <audio controls src={existingNote.audio_note_url} className="flex-1 h-10" />
            )}

            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={saveNote}
              className="text-3xl p-4 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
            >
              {saved ? "✅" : "💾"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}