import { useState } from "react";
import { motion } from "framer-motion";

const GlitchText = ({ text, className = "" }) => {
  const [isGlitching, setIsGlitching] = useState(false);

  return (
    <motion.span
      className={`relative inline-block cursor-pointer ${className}`}
      onMouseEnter={() => setIsGlitching(true)}
      onMouseLeave={() => setIsGlitching(false)}
    >
      <span className="relative z-10">{text}</span>
      {isGlitching && (
        <>
          <motion.span
            className="absolute inset-0 text-primary z-0"
            animate={{ x: [0, -2, 2, -2, 0] }}
            transition={{ duration: 0.2, repeat: Infinity }}
            style={{ clipPath: "inset(0 0 50% 0)" }}
          >
            {text}
          </motion.span>
          <motion.span
            className="absolute inset-0 text-accent z-0"
            animate={{ x: [0, 2, -2, 2, 0] }}
            transition={{ duration: 0.2, repeat: Infinity }}
            style={{ clipPath: "inset(50% 0 0 0)" }}
          >
            {text}
          </motion.span>
        </>
      )}
    </motion.span>
  );
};

export default GlitchText;
