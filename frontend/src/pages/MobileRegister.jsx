/**
 * MobileRegister.jsx
 * Mobile-only registration screen
 * Matches the second screen in the design image:
 *   - Dark blue orb background (same as Welcome)
 *   - White rounded card with "Get Started" heading
 *   - Full Name / Email / Password fields
 *   - "I agree to the processing of Personal data" checkbox
 *   - Blue "Sign up" button
 *   - Social login row: Facebook, Twitter, Google, Apple
 *
 * USAGE:
 *   Same responsive swap approach as MobileLogin:
 *
 *   const isMobile = useMediaQuery("(max-width: 767px)");
 *   return isMobile ? <MobileRegister /> : <Register />;
 *
 *   Or add as a separate route and redirect mobile users there.
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* ─── Social icon SVGs ─────────────────────────────────────────── */
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <circle cx="12" cy="12" r="12" fill="#1877F2" />
    <path fill="#fff" d="M15.5 8H13.5V6.5c0-.55.45-1 1-1h1V3h-2c-1.93 0-3 1.07-3 3v2H8.5v2.5H10.5V21h3V10.5h2l.5-2.5z" />
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <circle cx="12" cy="12" r="12" fill="#1DA1F2" />
    <path fill="#fff" d="M19 8.5c-.5.2-1 .35-1.6.42a2.8 2.8 0 001.22-1.55c-.54.32-1.13.54-1.76.67a2.78 2.78 0 00-4.74 2.54A7.9 7.9 0 015.8 7.6a2.78 2.78 0 00.86 3.72c-.46-.01-.9-.14-1.27-.35v.03c0 1.35.96 2.47 2.23 2.73-.23.06-.48.1-.73.1-.18 0-.35-.02-.52-.05a2.79 2.79 0 002.6 1.93A5.58 5.58 0 015 17.03a7.88 7.88 0 004.27 1.25c5.12 0 7.92-4.25 7.92-7.93l-.01-.36A5.65 5.65 0 0019 8.5z" />
  </svg>
);
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <circle cx="12" cy="12" r="12" fill="#fff" stroke="#e0e0e0" strokeWidth="1" />
    <path fill="#4285F4" d="M21.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22">
    <circle cx="12" cy="12" r="12" fill="#000" />
    <path fill="#fff" d="M15.77 12.18c-.02-2 1.63-2.97 1.7-3.02-0.93-1.36-2.37-1.55-2.88-1.57-1.23-.13-2.4.73-3.02.73-.63 0-1.6-.71-2.63-.69-1.35.02-2.6.79-3.29 2-1.41 2.44-.36 6.07 1.01 8.05.67.97 1.47 2.06 2.52 2.02 1.01-.04 1.39-.65 2.61-.65 1.22 0 1.56.65 2.62.63 1.09-.02 1.77-.99 2.43-1.97.77-1.12 1.08-2.21 1.1-2.27-.02-.01-2.17-.84-2.19-3.26zm-2.04-6.01c.56-.68.93-1.62.83-2.56-.8.03-1.77.53-2.34 1.2-.51.59-.96 1.55-.84 2.46.89.07 1.79-.45 2.35-1.1z" />
  </svg>
);

/* ─── Component ─────────────────────────────────────────────────── */
const MobileRegister = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const set = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) { setError("Please agree to the terms to continue."); return; }
    setIsLoading(true);
    setError("");
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formData.name)}`;
    const result = await register({ ...formData, avatar: avatarUrl });
    setIsLoading(false);
    if (result.success) {
      navigate("/chat", { replace: true });
    } else {
      setError(result.message || "Registration failed. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/api/auth/google`;
  };

  return (
    <div className="mr-root">
      {/* ── Background ── */}
      <div className="mr-bg" />
      <div className="mr-orb mr-orb-1" />
      <div className="mr-orb mr-orb-2" />
      <div className="mr-orb mr-orb-3" />
      <div className="mr-orb mr-orb-4" />

      {/* ── Back button ── */}
      <button className="mr-back" onClick={() => navigate(-1)}>
        <ChevronLeft size={18} />
        <span>Back</span>
      </button>

      {/* ── White Card ── */}
      <motion.div
        className="mr-card"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="mr-heading">Get Started</h2>

        {/* Error */}
        {error && (
          <motion.div
            className="mr-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="mr-form">
          {/* Full Name */}
          <div className="mr-field">
            <label className="mr-label">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={set("name")}
              placeholder="Enter Full Name"
              className="mr-input"
              required
              autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="mr-field">
            <label className="mr-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={set("email")}
              placeholder="Enter Email"
              className="mr-input"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="mr-field">
            <label className="mr-label">Password</label>
            <div className="mr-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={set("password")}
                placeholder="Enter Password"
                className="mr-input"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="mr-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="mr-terms">
            <span
              className={`mr-checkbox ${agreed ? "mr-checkbox--checked" : ""}`}
              onClick={() => setAgreed(!agreed)}
            >
              {agreed && (
                <svg viewBox="0 0 12 10" width="10" height="10" fill="none">
                  <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="mr-terms-text">
              I agree to the processing of{" "}
              <Link to="/privacy" className="mr-terms-link">Personal data</Link>
            </span>
          </label>

          {/* Submit */}
          <button type="submit" className="mr-btn-primary" disabled={isLoading || !agreed}>
            {isLoading ? <span className="mr-spinner" /> : "Sign up"}
          </button>
        </form>

        {/* Divider */}
        <div className="mr-divider">
          <span className="mr-divider-line" />
          <span className="mr-divider-text">Sign up with</span>
          <span className="mr-divider-line" />
        </div>

        {/* Social row */}
        <div className="mr-social-row">
          <button className="mr-social-btn" aria-label="Facebook">
            <FacebookIcon />
          </button>
          <button className="mr-social-btn" aria-label="Twitter">
            <TwitterIcon />
          </button>
          <button className="mr-social-btn" onClick={handleGoogleLogin} aria-label="Google">
            <GoogleIcon />
          </button>
          <button className="mr-social-btn" aria-label="Apple">
            <AppleIcon />
          </button>
        </div>
      </motion.div>

      {/* ── Styles ── */}
      <style>{`
        /* root */
        .mr-root {
          position: relative;
          width: 100%;
          min-height: 100svh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* bg */
        .mr-bg {
          position: absolute; inset: 0;
          background: linear-gradient(160deg, #0a1628 0%, #0d2044 30%, #0f2f6e 60%, #1a3a8a 100%);
          z-index: 0;
        }

        /* orbs */
        .mr-orb { position: absolute; border-radius: 50%; z-index: 1; }
        .mr-orb-1 {
          width: 240px; height: 240px;
          top: 20px; left: -60px;
          background: radial-gradient(circle at 35% 35%, #3b68e8 0%, #1a3fa6 40%, #0d2566 100%);
          box-shadow: inset -16px -16px 32px rgba(0,0,20,.5), inset 9px 9px 26px rgba(120,160,255,.15);
        }
        .mr-orb-2 {
          width: 160px; height: 160px;
          top: 60px; right: -40px;
          background: radial-gradient(circle at 30% 30%, #8aaeff 0%, #3058d8 50%, #0c1e7a 100%);
          box-shadow: inset -11px -11px 22px rgba(0,0,30,.45), inset 6px 6px 16px rgba(160,190,255,.12);
          opacity: 0.8;
        }
        .mr-orb-3 {
          width: 80px; height: 80px;
          top: 180px; left: 60px;
          background: radial-gradient(circle at 35% 30%, #a0b8ff 0%, #4a72e8 50%, #1530a0 100%);
          box-shadow: inset -6px -6px 12px rgba(0,0,20,.4), inset 4px 4px 8px rgba(200,210,255,.2);
        }
        .mr-orb-4 {
          width: 50px; height: 50px;
          top: 130px; right: 80px;
          background: radial-gradient(circle at 30% 28%, #c5d3ff 0%, #7090ee 50%, #2040b0 100%);
        }

        /* back */
        .mr-back {
          position: absolute; top: 20px; left: 16px; z-index: 20;
          display: flex; align-items: center; gap: 4px;
          background: rgba(255,255,255,0.12); border: none;
          color: #fff; font-size: 13px; font-weight: 600;
          padding: 8px 14px 8px 10px; border-radius: 20px;
          cursor: pointer; font-family: inherit; backdrop-filter: blur(6px);
        }

        /* card */
        .mr-card {
          position: relative; z-index: 10;
          background: #ffffff;
          border-radius: 30px 30px 0 0;
          padding: 32px 24px 36px;
          box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
        }

        .mr-heading {
          font-size: 26px; font-weight: 800; color: #2554e8;
          margin: 0 0 20px; letter-spacing: -0.4px;
        }

        /* error */
        .mr-error {
          background: #fff0f0; color: #d32f2f;
          border: 1px solid #ffcdd2; border-radius: 10px;
          padding: 10px 14px; font-size: 13px; margin-bottom: 14px;
        }

        /* form */
        .mr-form { display: flex; flex-direction: column; gap: 12px; }
        .mr-field { display: flex; flex-direction: column; gap: 4px; }

        .mr-label {
          font-size: 10px; font-weight: 600; color: #999;
          text-transform: uppercase; letter-spacing: 0.6px;
        }

        .mr-input-wrap { position: relative; }

        .mr-input {
          width: 100%; padding: 12px 14px;
          border: 1.5px solid #e8eaf0; border-radius: 12px;
          font-size: 14px; color: #1a1a2e; background: #f8f9fc;
          outline: none; font-family: inherit; box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .mr-input::placeholder { color: #b8bccc; }
        .mr-input:focus { border-color: #2554e8; background: #fff; }

        .mr-eye {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #aab0c0; cursor: pointer;
          padding: 0; display: flex; align-items: center;
        }

        /* terms */
        .mr-terms {
          display: flex; align-items: center; gap: 10px; cursor: pointer; margin-top: 2px;
        }
        .mr-checkbox {
          width: 18px; height: 18px; border-radius: 5px;
          border: 1.5px solid #2554e8; background: transparent;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.15s;
        }
        .mr-checkbox--checked { background: #2554e8; border-color: #2554e8; }
        .mr-terms-text { font-size: 12px; color: #666; line-height: 1.4; }
        .mr-terms-link { color: #2554e8; font-weight: 600; text-decoration: none; }
        .mr-terms-link:hover { text-decoration: underline; }

        /* primary btn */
        .mr-btn-primary {
          margin-top: 4px; width: 100%; padding: 15px;
          border-radius: 14px;
          background: linear-gradient(135deg, #4a7cf8 0%, #2554e8 100%);
          border: none; color: #fff; font-size: 15px; font-weight: 700;
          cursor: pointer; box-shadow: 0 8px 24px rgba(37,84,232,0.38);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; font-family: inherit;
        }
        .mr-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(37,84,232,0.5); }
        .mr-btn-primary:active { transform: scale(0.97); }
        .mr-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

        .mr-spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: mr-spin 0.7s linear infinite;
        }
        @keyframes mr-spin { to { transform: rotate(360deg); } }

        /* divider */
        .mr-divider { display: flex; align-items: center; gap: 12px; margin: 18px 0; }
        .mr-divider-line { flex: 1; height: 1px; background: #e8eaf0; }
        .mr-divider-text { font-size: 12px; color: #aab0c0; white-space: nowrap; font-weight: 500; }

        /* social */
        .mr-social-row { display: flex; justify-content: center; gap: 16px; }
        .mr-social-btn {
          width: 48px; height: 48px; border-radius: 12px;
          border: 1.5px solid #e8eaf0; background: #fff;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .mr-social-btn:hover { border-color: #b0b8d8; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        /* hide on desktop */
        @media (min-width: 768px) {
          .mr-root { display: none; }
        }
      `}</style>
    </div>
  );
};

export default MobileRegister;