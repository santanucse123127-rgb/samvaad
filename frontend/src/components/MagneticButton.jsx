import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const variantClasses = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 glow-primary",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  ghost: "bg-transparent hover:bg-muted text-foreground",
  outline:
    "bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
};

const sizeClasses = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

const MagneticButton = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  onClick,
  type = "button",
  disabled = false,
}) => {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      className={cn(
        "relative font-semibold rounded-lg overflow-hidden transition-all duration-300 magnetic-btn",
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default MagneticButton;
