/**
 * MobileLogin.jsx
 * Mobile-only login screen
 * Matches the third screen in the design image:
 *   - Dark blue orb background (same as Welcome)
 *   - White rounded card slides up with "Welcome Back" heading
 *   - Email / Password fields
 *   - Remember me + Forgot password
 *   - Blue "Sign up" button (primary CTA)
 *   - Social login row: Facebook, Twitter, Google, Apple
 *
 * USAGE:
 *   Wrap your existing <Login /> with a mobile check:
 *
 *   import { useMediaQuery } from "@/hooks/useMediaQuery"; // or your own hook
 *   const isMobile = useMediaQuery("(max-width: 767px)");
 *   return isMobile ? <MobileLogin /> : <Login />;
 *
 *   OR add this as a separate route and redirect mobile users:
 *   <Route path="/login" element={<ResponsiveLogin />} />
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
const MobileLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const result = await login({ email, password });
    setIsLoading(false);
    if (result.success) {
      navigate("/chat", { replace: true });
    } else {
      setError(result.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/api/auth/google`;
  };

  return (
    <div className="ml-root">
      {/* ── Background ── */}
      <div className="ml-bg" />
      <div className="ml-bg-overlay" />

      {/* ── Back button ── */}
      <button className="ml-back" onClick={() => navigate(-1)}>
        <ChevronLeft size={18} />
        <span>Back</span>
      </button>

      {/* ── White Card ── */}
      <motion.div
        className="ml-card"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <img src="/logo.png" alt="Samvaad" style={{ width: 50, height: 50, marginBottom: 8 }} />
          <h2 className="ml-heading">Welcome Back</h2>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            className="ml-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="ml-form">
          {/* Email */}
          <div className="ml-field">
            <label className="ml-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kris.adams@gamil.com"
              className="ml-input"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="ml-field">
            <label className="ml-label">Password</label>
            <div className="ml-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="ml-input"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="ml-eye"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot password */}
          <div className="ml-row-opts">
            <label className="ml-remember">
              <span
                className={`ml-checkbox ${rememberMe ? "ml-checkbox--checked" : ""}`}
                onClick={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && (
                  <svg viewBox="0 0 12 10" width="10" height="10" fill="none">
                    <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="ml-remember-text">Remember me</span>
            </label>
            <Link to="/forgot-password" className="ml-forgot">Forgot password?</Link>
          </div>

          {/* Submit */}
          <button type="submit" className="ml-btn-primary" disabled={isLoading}>
            {isLoading ? (
              <span className="ml-spinner" />
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="ml-divider">
          <span className="ml-divider-line" />
          <span className="ml-divider-text">Sign up with</span>
          <span className="ml-divider-line" />
        </div>

        {/* Social row */}
        <div className="ml-social-row">
          <button className="ml-social-btn" aria-label="Facebook">
            <FacebookIcon />
          </button>
          <button className="ml-social-btn" aria-label="Twitter">
            <TwitterIcon />
          </button>
          <button className="ml-social-btn" onClick={handleGoogleLogin} aria-label="Google">
            <GoogleIcon />
          </button>
          <button className="ml-social-btn" aria-label="Apple">
            <AppleIcon />
          </button>
        </div>
      </motion.div>

      {/* ── Styles ── */}
      <style>{`
        /* root */
        .ml-root {
          position: relative;
          width: 100%;
          min-height: 100svh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          font-family: 'SF Pro Display', system-ui, sans-serif;
        }

        .ml-bg {
          position: absolute; inset: 0;
          background-image: url('/splash-bg.png');
          background-size: cover;
          background-position: center;
          z-index: 0;
        }

        .ml-bg-overlay {
          position: absolute; inset: 0;
          background: rgba(6, 10, 13, 0.4);
          z-index: 0;
        }

        .ml-back {
          position: absolute;
          top: 20px; left: 16px;
          z-index: 20;
          display: flex; align-items: center; gap: 4px;
          background: rgba(255,255,255,0.12);
          border: none;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 14px 8px 10px;
          border-radius: 20px;
          cursor: pointer;
          font-family: inherit;
          backdrop-filter: blur(6px);
        }

        .ml-card {
          position: relative;
          z-index: 10;
          background: #ffffff;
          border-radius: 30px 30px 0 0;
          padding: 32px 24px 40px;
          box-shadow: 0 -8px 40px rgba(0,0,0,0.18);
        }

        .ml-heading {
          font-size: 26px;
          font-weight: 800;
          color: #050e07;
          margin: 0;
          letter-spacing: -0.4px;
        }

        /* error */
        .ml-error {
          background: #fff0f0;
          color: #d32f2f;
          border: 1px solid #ffcdd2;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          margin-bottom: 14px;
        }

        /* form */
        .ml-form { display: flex; flex-direction: column; gap: 14px; }

        .ml-field { display: flex; flex-direction: column; gap: 5px; }

        .ml-label {
          font-size: 11px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.6px;
        }

        .ml-input-wrap { position: relative; }

        .ml-input {
          width: 100%;
          padding: 13px 14px;
          border: 1.5px solid #e8eaf0;
          border-radius: 12px;
          font-size: 14px;
          color: #1a1a2e;
          background: #f8f9fc;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .ml-input::placeholder { color: #b0b4c4; }
        .ml-input:focus { border-color: #2554e8; background: #fff; }

        .ml-eye {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; color: #aab0c0; cursor: pointer; padding: 0;
          display: flex; align-items: center;
        }

        /* row options */
        .ml-row-opts {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: -4px;
        }

        .ml-remember { display: flex; align-items: center; gap: 8px; cursor: pointer; }

        .ml-checkbox {
          width: 18px; height: 18px;
          border-radius: 5px;
          border: 1.5px solid #2554e8;
          background: transparent;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.15s;
        }
        .ml-checkbox--checked { background: #2554e8; border-color: #2554e8; }

        .ml-remember-text { font-size: 13px; color: #555; }

        .ml-forgot { font-size: 13px; color: #2554e8; font-weight: 600; text-decoration: none; }
        .ml-forgot:hover { text-decoration: underline; }

        /* primary button */
        .ml-btn-primary {
          margin-top: 6px;
          width: 100%;
          padding: 15px;
          border-radius: 14px;
          background: linear-gradient(135deg, #4a7cf8 0%, #2554e8 100%);
          border: none;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(37,84,232,0.38);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          font-family: inherit;
        }
        .ml-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(37,84,232,0.5); }
        .ml-btn-primary:active { transform: scale(0.97); }
        .ml-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        /* spinner */
        .ml-spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: ml-spin 0.7s linear infinite;
        }
        @keyframes ml-spin { to { transform: rotate(360deg); } }

        /* divider */
        .ml-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 20px 0;
        }
        .ml-divider-line { flex: 1; height: 1px; background: #e8eaf0; }
        .ml-divider-text { font-size: 12px; color: #aab0c0; white-space: nowrap; font-weight: 500; }

        /* social row */
        .ml-social-row {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .ml-social-btn {
          width: 48px; height: 48px;
          border-radius: 12px;
          border: 1.5px solid #e8eaf0;
          background: #fff;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .ml-social-btn:hover { border-color: #b0b8d8; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }

        /* hide on desktop */
        @media (min-width: 768px) {
          .ml-root { display: none; }
        }
      `}</style>
    </div>
  );
};

export default MobileLogin;