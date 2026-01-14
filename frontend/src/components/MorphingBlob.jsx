import { motion } from "framer-motion";

const sizeClasses = {
  sm: "w-32 h-32",
  md: "w-64 h-64",
  lg: "w-96 h-96",
  xl: "w-[500px] h-[500px]",
};

const colorClasses = {
  primary: "from-primary/30 to-primary/10",
  accent: "from-accent/30 to-accent/10",
};

const MorphingBlob = ({
  className = "",
  color = "primary",
  size = "md",
  delay = 0,
}) => {
  return (
    <motion.div
      className={`absolute bg-gradient-to-br ${colorClasses[color]} ${sizeClasses[size]} rounded-full blur-3xl animate-morph ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay }}
      style={{
        animation: `morph 8s ease-in-out infinite, blob 7s infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

export default MorphingBlob;
