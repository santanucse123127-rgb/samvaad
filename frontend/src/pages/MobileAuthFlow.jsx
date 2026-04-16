import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  ChevronLeft,
  MessageSquare,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/* ──────────────────────────────────────────────────────────────
   Motion tokens (same feel as desktop, optimized for mobile)
────────────────────────────────────────────────────────────── */
const EASE = [0.22, 1, 0.36, 1];
const DUR = { fast: 0.16, normal: 0.3, slow: 0.5 };

const formStagger = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DUR.normal,
      ease: EASE,
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },
  exit: { opacity: 0, y: -6, transition: { duration: DUR.fast, ease: EASE } },
};

const fieldItem = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE } },
};

const cardSlide = {
  enter: (dir) => ({ x: dir > 0 ? 24 : -24, opacity: 0.0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: DUR.normal, ease: EASE },
  },
  exit: (dir) => ({
    x: dir > 0 ? -20 : 20,
    opacity: 0,
    transition: { duration: DUR.fast, ease: EASE },
  }),
};

const passwordChecks = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase", test: (p) => /[A-Z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
];

/* ──────────────────────────────────────────────────────────────
   Main component
────────────────────────────────────────────────────────────── */
const MobileAuthFlow = ({ initialMode = "login" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState(initialMode === "register" ? "register" : "login");
  const direction = mode === "register" ? 1 : -1;

  useEffect(() => {
    if (location.pathname === "/register") setMode("register");
    else if (location.pathname === "/login") setMode("login");
  }, [location.pathname]);

  const switchMode = (next) => {
    if (next === mode) return;
    setMode(next);
    navigate(`/${next}`);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"}/api/auth/google`;
  };

  // Shared form states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Login
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register
  const [regData, setRegData] = useState({ name: "", email: "", password: "" });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regAgreed, setRegAgreed] = useState(false);

  const pwStrength = useMemo(
    () => passwordChecks.filter((c) => c.test(regData.password)).length,
    [regData.password]
  );

  const submitLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(loginData);
      if (result.success) navigate("/chat", { replace: true });
      else setError(result.message || "Login failed. Please try again.");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    if (!regAgreed) return setError("Please accept terms to continue.");
    setError("");
    setIsLoading(true);

    try {
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(regData.name)}`;
      const result = await register({ ...regData, avatar: avatarUrl });
      if (result.success) navigate("/chat", { replace: true });
      else setError(result.message || "Registration failed. Please try again.");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="maf-root">
        {/* Ambient background like desktop */}
        <div className="maf-bg-orb maf-bg-orb-a" />
        <div className="maf-bg-orb maf-bg-orb-b" />

        {/* Top hero */}
        <section className="maf-hero">
          <img src="/auth-bg.png" alt="Background" className="maf-hero-bg" />
          <div className="maf-hero-gradient" />

          <button className="maf-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <ChevronLeft size={20} />
          </button>

          <div className="maf-brand">
            <div className="maf-brand-logo">
              <MessageSquare className="w-4 h-4 text-black" fill="currentColor" />
            </div>
            <span className="maf-brand-text">Samvaad</span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { duration: DUR.normal, ease: EASE } }}
              exit={{ opacity: 0, y: -8, transition: { duration: DUR.fast, ease: EASE } }}
              className="maf-hero-copy"
            >
              <span className="maf-pill">
                <Sparkles size={12} />
                {mode === "login" ? "Welcome Back" : "Start Your Journey"}
              </span>
              <h1>{mode === "login" ? "Login" : "Sign Up"}</h1>
              <p>
                {mode === "login"
                  ? "Enter your credentials to continue the conversation."
                  : "Create an account to join the world of Samvaad."}
              </p>
            </m.div>
          </AnimatePresence>
        </section>

        {/* Bottom card */}
        <section className="maf-card-wrap">
          <m.div layout className="maf-card transform-gpu">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              {mode === "login" ? (
                <m.div
                  key="login-card"
                  custom={direction}
                  variants={cardSlide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="transform-gpu will-change-transform"
                >
                  <AnimatePresence>
                    {error && (
                      <m.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="maf-error"
                      >
                        {error}
                      </m.div>
                    )}
                  </AnimatePresence>

                  <m.form
                    onSubmit={submitLogin}
                    variants={formStagger}
                    initial="hidden"
                    animate="show"
                    className="maf-form"
                  >
                    <AuthInput
                      variants={fieldItem}
                      icon={<Mail size={16} />}
                      placeholder="Email address"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                    <AuthInput
                      variants={fieldItem}
                      icon={<Lock size={16} />}
                      placeholder="Password"
                      type={showLoginPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
                      togglePassword={() => setShowLoginPassword((p) => !p)}
                      showPassword={showLoginPassword}
                      required
                    />

                    <m.button variants={fieldItem} className="maf-btn-primary" type="submit" disabled={isLoading}>
                      {isLoading ? <span className="maf-spinner" /> : <>Sign In <ArrowRight size={16} /></>}
                    </m.button>
                  </m.form>

                  <div className="maf-divider"><span>or continue with</span></div>

                  <div className="maf-social-row">
                    <button type="button" className="maf-social-btn" onClick={handleGoogleLogin}>
                      Continue with Google
                    </button>
                  </div>

                  <div className="maf-switch">
                    Don&apos;t have an account?
                    <button type="button" onClick={() => { setError(""); switchMode("register"); }}>
                      Sign up
                    </button>
                  </div>
                </m.div>
              ) : (
                <m.div
                  key="register-card"
                  custom={direction}
                  variants={cardSlide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="transform-gpu will-change-transform"
                >
                  <AnimatePresence>
                    {error && (
                      <m.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="maf-error"
                      >
                        {error}
                      </m.div>
                    )}
                  </AnimatePresence>

                  <m.form
                    onSubmit={submitRegister}
                    variants={formStagger}
                    initial="hidden"
                    animate="show"
                    className="maf-form"
                  >
                    <AuthInput
                      variants={fieldItem}
                      icon={<User size={16} />}
                      placeholder="Full name"
                      type="text"
                      value={regData.name}
                      onChange={(e) => setRegData((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                    <AuthInput
                      variants={fieldItem}
                      icon={<Mail size={16} />}
                      placeholder="Email address"
                      type="email"
                      value={regData.email}
                      onChange={(e) => setRegData((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                    <AuthInput
                      variants={fieldItem}
                      icon={<Lock size={16} />}
                      placeholder="Password"
                      type={showRegPassword ? "text" : "password"}
                      value={regData.password}
                      onChange={(e) => setRegData((p) => ({ ...p, password: e.target.value }))}
                      togglePassword={() => setShowRegPassword((p) => !p)}
                      showPassword={showRegPassword}
                      required
                    />

                    {!!regData.password && (
                      <div className="maf-pw-meter">
                        {[1, 2, 3].map((i) => (
                          <span
                            key={i}
                            className={`bar ${
                              i <= pwStrength ? (pwStrength === 1 ? "r" : pwStrength === 2 ? "y" : "g") : ""
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <label className="maf-check">
                      <input
                        type="checkbox"
                        checked={regAgreed}
                        onChange={() => setRegAgreed((p) => !p)}
                      />
                      <span>I agree to Terms & Privacy Policy</span>
                    </label>

                    <m.button
                      variants={fieldItem}
                      className="maf-btn-primary"
                      type="submit"
                      disabled={isLoading || !regAgreed}
                    >
                      {isLoading ? <span className="maf-spinner" /> : <>Create Account <ArrowRight size={16} /></>}
                    </m.button>
                  </m.form>

                  <div className="maf-divider"><span>or continue with</span></div>

                  <div className="maf-social-row">
                    <button type="button" className="maf-social-btn" onClick={handleGoogleLogin}>
                      Continue with Google
                    </button>
                  </div>

                  <div className="maf-switch">
                    Already have an account?
                    <button type="button" onClick={() => { setError(""); switchMode("login"); }}>
                      Sign in
                    </button>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>

          <div className="maf-footer-pill">
            <ShieldCheck size={13} />
            <span>End-to-End Encrypted</span>
          </div>
        </section>

        <style>{`
          .maf-root{
            min-height:100svh;
            background:#080a0f;
            color:#fff;
            overflow-x:hidden;
            font-family:'Outfit','Inter',system-ui,-apple-system,sans-serif;
            position:relative;
          }

          .maf-bg-orb{
            position:absolute;
            border-radius:999px;
            filter:blur(90px);
            opacity:.22;
            pointer-events:none;
          }
          .maf-bg-orb-a{width:54vw;height:54vw;left:-18vw;top:-10vw;background:#4f46e5;}
          .maf-bg-orb-b{width:48vw;height:48vw;right:-16vw;bottom:24vh;background:#06b6d4;}

          .maf-hero{
            position:relative;
            height:42svh;
            min-height:290px;
            padding:18px 16px 18px;
            display:flex;
            flex-direction:column;
            justify-content:flex-end;
          }

          .maf-hero-bg{
            position:absolute;inset:0;width:100%;height:100%;
            object-fit:cover;opacity:.4;
          }
          .maf-hero-gradient{
            position:absolute;inset:0;
            background:linear-gradient(to bottom, rgba(8,10,15,.2), rgba(8,10,15,.86) 62%, rgba(8,10,15,1));
          }

          .maf-back-btn{
            position:absolute;top:16px;left:12px;z-index:5;
            width:38px;height:38px;border-radius:999px;
            border:1px solid rgba(255,255,255,.16);
            background:rgba(255,255,255,.09);color:#fff;
            display:flex;align-items:center;justify-content:center;
          }

          .maf-brand{
            position:absolute;top:16px;left:56px;z-index:5;
            display:flex;align-items:center;gap:8px;
          }
          .maf-brand-logo{
            width:28px;height:28px;border-radius:10px;
            background:#fff;display:flex;align-items:center;justify-content:center;
          }
          .maf-brand-text{
            font-weight:800;letter-spacing:.08em;text-transform:uppercase;font-size:12px;color:#fff;
          }

          .maf-hero-copy{position:relative;z-index:3;}
          .maf-pill{
            display:inline-flex;align-items:center;gap:6px;
            padding:6px 10px;border-radius:999px;
            border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.10);
            font-size:11px;color:rgba(255,255,255,.86);font-weight:700;letter-spacing:.05em;text-transform:uppercase;
            margin-bottom:12px;
          }
          .maf-hero-copy h1{margin:0;font-size:34px;line-height:1.02;letter-spacing:-.4px;font-weight:800;}
          .maf-hero-copy p{margin:8px 0 0;color:rgba(255,255,255,.58);font-size:14px;line-height:1.4;max-width:90%;}

          .maf-card-wrap{margin-top:-14px;position:relative;z-index:6;padding:0 0 18px;}
          .maf-card{
            background:rgba(17,20,29,.92);
            backdrop-filter:blur(8px);
            border-top:1px solid rgba(255,255,255,.08);
            border-radius:28px 28px 0 0;
            padding:22px 16px 24px;
            min-height:58svh;
            box-shadow:0 -16px 45px rgba(0,0,0,.35);
          }

          .maf-form{display:flex;flex-direction:column;gap:12px;}
          .maf-input-wrap{position:relative;}
          .maf-input-icon{
            position:absolute;left:14px;top:50%;transform:translateY(-50%);opacity:.45;color:#fff;
          }

          .maf-input{
            width:100%;height:50px;border-radius:14px;
            border:1px solid rgba(255,255,255,.12);
            background:rgba(255,255,255,.05);
            color:#fff;font-size:14px;outline:none;
            padding:0 14px 0 42px;box-sizing:border-box;
            transition:border-color .16s ease, background .16s ease, box-shadow .16s ease;
          }
          .maf-input::placeholder{color:rgba(255,255,255,.3);}
          .maf-input:focus{
            border-color:rgba(255,255,255,.28);
            background:rgba(255,255,255,.08);
            box-shadow:0 0 0 3px rgba(255,255,255,.06);
          }

          .maf-eye{
            position:absolute;right:10px;top:50%;transform:translateY(-50%);
            width:30px;height:30px;border:none;background:transparent;color:rgba(255,255,255,.45);
            display:flex;align-items:center;justify-content:center;
          }

          .maf-btn-primary{
            height:50px;border:none;border-radius:14px;cursor:pointer;
            background:#fff;color:#000;font-weight:700;font-size:14px;
            display:flex;align-items:center;justify-content:center;gap:8px;margin-top:4px;
          }
          .maf-btn-primary:disabled{opacity:.55;}

          .maf-spinner{
            width:18px;height:18px;border-radius:999px;
            border:2px solid rgba(0,0,0,.2);border-top-color:#000;
            animation:spin .75s linear infinite;
          }
          @keyframes spin{to{transform:rotate(360deg)}}

          .maf-error{
            margin-bottom:10px;padding:10px 12px;border-radius:12px;
            background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.22);
            color:#fca5a5;font-size:13px;
          }

          .maf-divider{
            display:flex;align-items:center;gap:10px;margin:16px 0 12px;
          }
          .maf-divider:before,.maf-divider:after{
            content:"";flex:1;height:1px;background:rgba(255,255,255,.08);
          }
          .maf-divider span{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.36);font-weight:700;}

          .maf-social-row{display:flex;gap:10px;}
          .maf-social-btn{
            width:100%;height:48px;border-radius:14px;
            border:1px solid rgba(255,255,255,.12);
            background:rgba(255,255,255,.05);color:#fff;font-weight:600;font-size:13px;
          }

          .maf-switch{
            text-align:center;margin-top:14px;color:rgba(255,255,255,.45);font-size:13px;
          }
          .maf-switch button{
            border:none;background:none;color:#fff;font-weight:700;margin-left:6px;font-size:13px;
          }

          .maf-check{
            display:flex;align-items:center;gap:8px;margin-top:2px;color:rgba(255,255,255,.45);font-size:12px;
          }
          .maf-check input{accent-color:#fff;}

          .maf-pw-meter{display:flex;gap:6px;padding:2px 2px 0;}
          .maf-pw-meter .bar{flex:1;height:4px;border-radius:999px;background:rgba(255,255,255,.08);}
          .maf-pw-meter .bar.r{background:#ef4444;}
          .maf-pw-meter .bar.y{background:#f59e0b;}
          .maf-pw-meter .bar.g{background:#22c55e;}

          .maf-footer-pill{
            margin:10px auto 0;
            width:max-content;
            display:flex;align-items:center;gap:6px;
            padding:6px 10px;border-radius:999px;
            border:1px solid rgba(255,255,255,.08);
            background:rgba(255,255,255,.04);
            color:rgba(255,255,255,.42);
            font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;
          }

          @media (min-width:768px){ .maf-root{display:none;} }

          @media (prefers-reduced-motion: reduce){
            *{
              animation-duration:.01ms !important;
              animation-iteration-count:1 !important;
              transition-duration:.01ms !important;
              scroll-behavior:auto !important;
            }
          }
        `}</style>
      </div>
    </LazyMotion>
  );
};

const AuthInput = ({ icon, togglePassword, showPassword, variants, ...props }) => (
  <m.div variants={variants} className="maf-input-wrap">
    <span className="maf-input-icon">{icon}</span>
    <input {...props} className="maf-input" />
    {togglePassword && (
      <button type="button" className="maf-eye" onClick={togglePassword}>
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    )}
  </m.div>
);

export default MobileAuthFlow;