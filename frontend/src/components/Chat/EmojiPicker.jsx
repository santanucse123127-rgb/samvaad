import { motion } from "framer-motion";
import { useState } from "react";

const EmojiPicker = ({ onEmojiSelect }) => {
  const categories = {
    "Smileys": ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥸", "🤩", "🥳"],
    "Gestures": ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
    "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟"],
    "Objects": ["⌚", "📱", "💻", "⌨️", "🖥", "🖨", "🖱", "🖲", "🕹", "🗜", "💾", "💿", "📀", "📼", "📷", "📸", "📹", "🎥", "📽", "🎞", "📞", "☎️", "📟", "📠", "📺", "📻", "🎙", "🎚", "🎛", "🧭"],
  };

  const [selectedCategory, setSelectedCategory] = useState("Smileys");

  return (
    <motion.div
      className="bg-card rounded-[24px] shadow-2xl p-4 border border-border/50 w-72"
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
    >
      {/* Category Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto scrollbar-none p-1 bg-muted/30 rounded-xl">
        {Object.keys(categories).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedCategory === category
                ? "bg-card text-wa-accent shadow-sm"
                : "text-wa-text-secondary hover:text-wa-text-primary"
              }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="grid grid-cols-6 gap-1 max-h-56 overflow-y-auto scrollbar-custom pr-1">
        {categories[selectedCategory].map((emoji, index) => (
          <motion.button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            className="text-2xl hover:bg-wa-accent/10 rounded-xl aspect-square flex items-center justify-center transition-colors"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default EmojiPicker;