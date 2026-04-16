/**
 * MobileWelcome.jsx
 * Mobile-only opening/splash screen
 * Matches the first screen in the design image:
 *   - Dark blue gradient background with 3D floating orbs
 *   - "Welcome Back!" heading + subtitle
 *   - "Sign in" and "Sign up" buttons at the bottom
 *
 * USAGE:
 *   Import in your router and render only on mobile:
 *   <Route path="/welcome" element={<MobileWelcome />} />
 *
 *   Or conditionally render based on screen width:
 *   {isMobile && <MobileWelcome />}
 */

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const MobileWelcome = () => {
  const navigate = useNavigate();

  return (
    <div className="mobile-welcome-root">
      {/* ── Background Image ── */}
      <div className="mw-bg-image" />
      <div className="mw-overlay" />

      {/* ── Content ── */}
      <motion.div
        className="mw-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mw-logo-container">
          <motion.img 
            src="/logo.png" 
            alt="Samvaad Logo" 
            className="mw-logo"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          />
        </div>

        <div className="mw-text">
          <motion.h1 
            className="mw-title"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Samvaad
          </motion.h1>
          <motion.p 
            className="mw-subtitle"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            Connect, Converse, and Collaborate<br />in a secure, premium space.
          </motion.p>
        </div>

        <motion.div 
          className="mw-actions"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <button
            className="mw-btn-ghost"
            onClick={() => navigate("/login")}
          >
            Sign in
          </button>
          <button
            className="mw-btn-primary"
            onClick={() => navigate("/register")}
          >
            Sign up
          </button>
        </motion.div>
      </motion.div>

      {/* ── Inline Styles ── */}
      <style>{`
        .mobile-welcome-root {
          position: relative;
          width: 100%;
          min-height: 100svh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          font-family: 'SF Pro Display', system-ui, sans-serif;
        }

        .mw-bg-image {
          position: absolute;
          inset: 0;
          background-image: url('/splash-bg.png');
          background-size: cover;
          background-position: center;
          z-index: 0;
          transform: scale(1.1);
          animation: slowZoom 20s infinite alternate;
        }

        @keyframes slowZoom {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }

        .mw-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, 
            rgba(6, 10, 13, 0.2) 0%, 
            rgba(6, 10, 13, 0.5) 40%, 
            rgba(6, 10, 13, 0.95) 100%);
          z-index: 1;
        }

        .mw-content {
          position: relative;
          z-index: 10;
          padding: 0 28px 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        .mw-logo-container {
          margin-bottom: -10px;
        }

        .mw-logo {
          width: 100px;
          height: 100px;
          object-fit: contain;
          filter: drop-shadow(0 0 20px rgba(0, 230, 118, 0.3));
        }

        .mw-text {
          text-align: center;
        }

        .mw-title {
          font-size: 42px;
          font-weight: 900;
          color: #ffffff;
          margin: 0 0 8px;
          letter-spacing: -1.5px;
          line-height: 1;
          text-transform: lowercase;
          font-family: 'Syne', sans-serif;
        }

        .mw-subtitle {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          line-height: 1.6;
          font-weight: 400;
        }

        .mw-actions {
          display: flex;
          gap: 14px;
          width: 100%;
          max-width: 320px;
        }

        .mw-btn-ghost {
          flex: 1;
          padding: 16px 0;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .mw-btn-primary {
          flex: 1;
          padding: 16px 0;
          border-radius: 16px;
          background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
          border: none;
          color: #050e07;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(0, 230, 118, 0.3);
          transition: all 0.3s ease;
        }

        .mw-btn-primary:active, .mw-btn-ghost:active {
          transform: scale(0.96);
        }

        @media (min-width: 768px) {
          .mobile-welcome-root {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileWelcome;