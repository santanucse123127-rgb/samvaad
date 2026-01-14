import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileMenu({ user, logout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className="focus:outline-none"
      >
        <img
          src={user.avatar}
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-slate-600 hover:scale-105 transition"
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-50"
          >
            <div className="px-4 py-3 border-b border-slate-700">
              <p className="text-sm font-medium text-white">
                {user.name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.email}
              </p>
            </div>

            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
