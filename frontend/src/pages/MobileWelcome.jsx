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
      {/* ── Animated Background ── */}
      <div className="mw-bg" />

      {/* ── Floating 3-D Orbs (CSS only, no images needed) ── */}
      <div className="mw-orb mw-orb-1" />
      <div className="mw-orb mw-orb-2" />
      <div className="mw-orb mw-orb-3" />
      <div className="mw-orb mw-orb-4" />
      <div className="mw-orb mw-orb-5" />

      {/* ── Content ── */}
      <motion.div
        className="mw-content"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="mw-text">
          <h1 className="mw-title">Welcome Back!</h1>
          <p className="mw-subtitle">
            Enter personal details to access<br />your employee account
          </p>
        </div>

        <div className="mw-actions">
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
        </div>
      </motion.div>

      {/* ── Inline Styles ── */}
      <style>{`
        /* ---------- root ---------- */
        .mobile-welcome-root {
          position: relative;
          width: 100%;
          min-height: 100svh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* ---------- background gradient ---------- */
        .mw-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg,
            #0a1628 0%,
            #0d2044 30%,
            #0f2f6e 60%,
            #1a3a8a 100%);
          z-index: 0;
        }

        /* ---------- orbs ---------- */
        .mw-orb {
          position: absolute;
          border-radius: 50%;
          z-index: 1;
        }

        /* large bottom-left deep orb */
        .mw-orb-1 {
          width: 300px; height: 300px;
          bottom: -60px; left: -60px;
          background: radial-gradient(circle at 35% 35%,
            #3b68e8 0%,
            #1a3fa6 40%,
            #0d2566 100%);
          box-shadow: inset -20px -20px 40px rgba(0,0,20,0.5),
                      inset 10px 10px 30px rgba(120,160,255,0.15);
          filter: blur(0px);
        }

        /* medium mid-right orb */
        .mw-orb-2 {
          width: 200px; height: 200px;
          top: 100px; right: -40px;
          background: radial-gradient(circle at 30% 30%,
            #6b94f5 0%,
            #2a52c9 45%,
            #0e2060 100%);
          box-shadow: inset -14px -14px 28px rgba(0,0,30,0.45),
                      inset 8px 8px 20px rgba(160,190,255,0.12);
        }

        /* small top-left accent orb */
        .mw-orb-3 {
          width: 100px; height: 100px;
          top: 60px; left: 40px;
          background: radial-gradient(circle at 35% 30%,
            #a0b8ff 0%,
            #4a72e8 50%,
            #1530a0 100%);
          box-shadow: inset -8px -8px 16px rgba(0,0,20,0.4),
                      inset 4px 4px 10px rgba(200,210,255,0.2);
        }

        /* tiny top-right dot */
        .mw-orb-4 {
          width: 60px; height: 60px;
          top: 200px; right: 80px;
          background: radial-gradient(circle at 35% 30%,
            #c5d3ff 0%,
            #7090ee 50%,
            #2040b0 100%);
          box-shadow: inset -5px -5px 10px rgba(0,0,20,0.35),
                      inset 3px 3px 7px rgba(200,210,255,0.25);
        }

        /* mid orb centre */
        .mw-orb-5 {
          width: 140px; height: 140px;
          top: 40%; left: 50%;
          transform: translateX(-50%);
          background: radial-gradient(circle at 30% 28%,
            #8aaeff 0%,
            #3058d8 50%,
            #0c1e7a 100%);
          box-shadow: inset -10px -10px 22px rgba(0,0,30,0.5),
                      inset 6px 6px 14px rgba(160,185,255,0.15);
          opacity: 0.7;
        }

        /* ---------- content ---------- */
        .mw-content {
          position: relative;
          z-index: 10;
          padding: 0 28px 48px;
          display: flex;
          flex-direction: column;
          gap: 36px;
        }

        .mw-text {
          text-align: left;
        }

        .mw-title {
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 10px;
          letter-spacing: -0.5px;
          line-height: 1.15;
        }

        .mw-subtitle {
          font-size: 14px;
          color: rgba(180, 200, 255, 0.75);
          margin: 0;
          line-height: 1.6;
        }

        .mw-actions {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .mw-btn-ghost {
          flex: 1;
          padding: 15px 0;
          border-radius: 14px;
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.25);
          color: rgba(220,230,255,0.9);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .mw-btn-ghost:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.5);
        }
        .mw-btn-ghost:active {
          transform: scale(0.97);
        }

        .mw-btn-primary {
          flex: 1;
          padding: 15px 0;
          border-radius: 14px;
          background: linear-gradient(135deg, #4a7cf8 0%, #2554e8 100%);
          border: none;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(37, 84, 232, 0.45);
          transition: all 0.2s ease;
          font-family: inherit;
        }
        .mw-btn-primary:hover {
          background: linear-gradient(135deg, #5c8afb 0%, #3a66f5 100%);
          box-shadow: 0 10px 28px rgba(37, 84, 232, 0.55);
          transform: translateY(-1px);
        }
        .mw-btn-primary:active {
          transform: scale(0.97) translateY(0);
        }

        /* ---------- hide on desktop ---------- */
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