import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageSquare, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext"; 
import ProfileMenu from "./ProfileMenu";


const navItems = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About" },
  { path: "/chat", label: "Chat" },
  { path: "/contact", label: "Contact" },
];

const Navbar = ({ isDark, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();


  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 glass"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div
            className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center glow-primary"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </motion.div>
          <span className="font-bold text-xl tracking-tight gradient-text">NEXUS</span>
        </Link>

        {/* Desktop Nav */}
        { !user &&(
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="relative py-2 group"
            >
              <span
                className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                  location.pathname === item.path ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </span>
              {location.pathname === item.path && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="navbar-indicator"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div> )
}

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-lg glass flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-5 h-5 text-primary" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-5 h-5 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Auth Buttons */}
          {/* <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <motion.button
                className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Login
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg glow-primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign Up
              </motion.button>
            </Link>
          </div> */}
          <div className="hidden md:flex items-center gap-3">
  {user ? (
    
      
      <ProfileMenu user={user} logout={logout} />

    
  ) : (
    <>
      <Link to="/login">
        <motion.button
          className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Login
        </motion.button>
      </Link>
      <Link to="/register">
        <motion.button
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg glow-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sign Up
        </motion.button>
      </Link>
    </>
  )}
</div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden w-10 h-10 rounded-lg glass flex items-center justify-center"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden glass border-t border-border"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`block py-2 text-lg font-medium ${
                      location.pathname === item.path ? "text-primary" : "text-foreground"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Link to="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-2 text-sm font-medium border border-border rounded-lg">
                    Login
                  </button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
