import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { emoji: "🏠", path: "/Home", label: "home" },
  { emoji: "📊", path: "/Progress", label: "progress" },
  { emoji: "🧪", path: "/TestMode", label: "test" },
];

export default function EmojiNav() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-lg mx-auto flex items-center justify-between px-4 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`text-3xl p-3 rounded-2xl transition-colors ${
                  isActive ? "bg-indigo-100" : "hover:bg-slate-50"
                }`}
              >
                {item.emoji}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}