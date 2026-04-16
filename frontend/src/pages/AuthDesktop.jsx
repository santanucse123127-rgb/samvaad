import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Check,
  Phone,
  Smartphone,
  ShieldCheck,
  Globe,
  Zap,
  Heart,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * Faster motion tokens (reduced durations = less perceived lag)
 */
const EASE = [0.22, 1, 0.36, 1];
const DUR = {
  fast: 0.16,
  normal: 0.32,
  slow: 0.55,
};

const passwordChecks = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase", test: (p) => /[A-Z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
];

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
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: DUR.fast, ease: EASE },
  },
};

const fieldItem = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.normal, ease: EASE } },
};

const overlayTextVariants = {
  enter: { opacity: 0, y: 14 },
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: DUR.normal, ease: EASE },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: DUR.fast, ease: EASE },
  },
};

const AuthDesktop = ({ initialMode = "login" }) => {
  const { login, register, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(initialMode === "login");

  useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location.pathname]);

  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Login state
  const [loginMode, setLoginMode] = useState("email");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Register state
  const [regData, setRegData] = useState({ name: "", email: "", password: "", phone: "" });
  const [regAgreed, setRegAgreed] = useState(false);
  const [regShowPassword, setRegShowPassword] = useState(false);

  const pwStrength = useMemo(
    () => passwordChecks.filter((c) => c.test(regData.password)).length,
    [regData.password]
  );

  const toggleMode = () => {
    setIsLogin((prev) => !prev);
    setError("");
    setOtpSent(false);
    setLoginOtp("");
    setIsLoading(false);
    navigate(!isLogin ? "/login" : "/register");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (loginMode === "email") {
        const result = await login({ email: loginEmail, password: loginPassword });
        if (result.success) navigate("/chat", { replace: true });
        else setError(result.message || "Login failed.");
      } else {
        if (!otpSent) {
          const result = await sendOTP(
            loginMode === "phone" ? { phone: loginPhone } : { email: loginEmail }
          );
          if (result.success) setOtpSent(true);
          else setError(result.message || "Failed to send OTP.");
        } else {
          const result = await verifyOTP(
            loginMode === "phone"
              ? { phone: loginPhone, otp: loginOtp }
              : { email: loginEmail, otp: loginOtp }
          );
          if (result.success) navigate("/chat", { replace: true });
          else setError(result.message || "Invalid OTP.");
        }
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regAgreed) {
      setError("Please accept the terms to continue.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        regData.name
      )}`;
      const result = await register({ ...regData, avatar: avatarUrl });
      if (result.success) navigate("/chat", { replace: true });
      else setError(result.message || "Registration failed.");
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"
    }/api/auth/google`;
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative min-h-screen bg-[#070910] font-outfit selection:bg-purple-500/30 overflow-hidden">
        {/* Lighter ambient bg (less heavy than previous) */}
        <div className="pointer-events-none absolute inset-0">
          <m.div
            className="absolute -top-[18%] -left-[10%] w-[52vw] h-[52vw] rounded-full bg-indigo-500/10 blur-[90px] transform-gpu will-change-transform"
            animate={{ x: [0, 16, 0], y: [0, -12, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <m.div
            className="absolute -bottom-[20%] -right-[12%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/10 blur-[90px] transform-gpu will-change-transform"
            animate={{ x: [0, -14, 0], y: [0, 10, 0] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <m.div
            className="relative w-full max-w-[1120px] min-h-[680px] lg:h-[78vh] lg:max-h-[760px] rounded-[32px] overflow-hidden border border-white/10 bg-[#0f1420]/75 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.42)]"
            initial={false}
          >
            <div className="pointer-events-none absolute inset-[1px] rounded-[31px] border border-white/5" />

            <div className="relative w-full h-full flex">
              {/* Login */}
              <div className="w-1/2 h-full flex flex-col justify-center p-8 lg:p-12">
                <m.div
                  animate={{
                    opacity: isLogin ? 1 : 0.48,
                    x: isLogin ? 0 : -14,
                  }}
                  transition={{ duration: DUR.normal, ease: EASE }}
                  className="w-full transform-gpu will-change-[transform,opacity]"
                  style={{ pointerEvents: isLogin ? "auto" : "none" }}
                >
                  <div className="mb-8">
                    <span className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/50 uppercase tracking-widest">
                      Welcome Back
                    </span>
                    <h1 className="mt-4 text-4xl font-bold text-white tracking-tight">Login</h1>
                    <p className="mt-2 text-white/40 text-sm">
                      Enter your credentials to continue the conversation.
                    </p>
                  </div>

                  <AnimatePresence>
                    {isLogin && error && (
                      <m.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm font-medium"
                      >
                        {error}
                      </m.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait" initial={false}>
                    <m.form
                      key={`login-${loginMode}-${otpSent ? "otp" : "base"}`}
                      onSubmit={handleLogin}
                      variants={formStagger}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="space-y-4"
                    >
                      <m.div variants={fieldItem} className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-2">
                        {["email", "email-otp", "phone"].map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => {
                              setLoginMode(mode);
                              setOtpSent(false);
                              setLoginOtp("");
                              setError("");
                            }}
                            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                              loginMode === mode
                                ? "bg-white/12 text-white"
                                : "text-white/35 hover:text-white/60"
                            }`}
                          >
                            {mode === "email" ? "Password" : mode === "email-otp" ? "E-OTP" : "Phone"}
                          </button>
                        ))}
                      </m.div>

                      <m.div variants={fieldItem} className="space-y-4">
                        {loginMode === "email" ? (
                          <>
                            <AuthInput
                              icon={<Mail className="w-4 h-4" />}
                              placeholder="Email address"
                              type="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                            />
                            <AuthInput
                              icon={<Lock className="w-4 h-4" />}
                              placeholder="Password"
                              type={showPassword ? "text" : "password"}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                              togglePassword={() => setShowPassword(!showPassword)}
                              showPassword={showPassword}
                            />
                          </>
                        ) : loginMode === "phone" ? (
                          !otpSent ? (
                            <AuthInput
                              icon={<Phone className="w-4 h-4" />}
                              placeholder="Phone number (+91...)"
                              type="tel"
                              value={loginPhone}
                              onChange={(e) => setLoginPhone(e.target.value)}
                              required
                            />
                          ) : (
                            <AuthInput
                              icon={<Smartphone className="w-4 h-4" />}
                              placeholder="6-digit OTP"
                              type="text"
                              maxLength={6}
                              value={loginOtp}
                              onChange={(e) => setLoginOtp(e.target.value)}
                              required
                            />
                          )
                        ) : !otpSent ? (
                          <AuthInput
                            icon={<Mail className="w-4 h-4" />}
                            placeholder="Email for OTP"
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                        ) : (
                          <AuthInput
                            icon={<Smartphone className="w-4 h-4" />}
                            placeholder="6-digit OTP"
                            type="text"
                            maxLength={6}
                            value={loginOtp}
                            onChange={(e) => setLoginOtp(e.target.value)}
                            required
                          />
                        )}
                      </m.div>

                      <m.button
                        variants={fieldItem}
                        whileTap={{ scale: 0.986 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-4"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            {loginMode === "email" ? "Sign In" : otpSent ? "Verify & Enter" : "Send Code"}
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </m.button>
                    </m.form>
                  </AnimatePresence>

                  <div className="mt-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/8" />
                      <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
                        Or login with
                      </span>
                      <div className="h-px flex-1 bg-white/8" />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleGoogleLogin}
                        className="flex-1 h-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all group active:scale-[0.98]"
                      >
                        <svg className="w-5 h-5 opacity-55 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </button>

                      <Link
                        to="/qr-login"
                        className="flex-1 h-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all group active:scale-[0.98]"
                      >
                        <Smartphone className="w-5 h-5 opacity-45 group-hover:opacity-100 transition-opacity text-white" />
                      </Link>
                    </div>
                  </div>
                </m.div>
              </div>

              {/* Register */}
              <div className="w-1/2 h-full flex flex-col justify-center p-8 lg:p-12">
                <m.div
                  animate={{
                    opacity: !isLogin ? 1 : 0.48,
                    x: !isLogin ? 0 : 14,
                  }}
                  transition={{ duration: DUR.normal, ease: EASE }}
                  className="w-full transform-gpu will-change-[transform,opacity]"
                  style={{ pointerEvents: !isLogin ? "auto" : "none" }}
                >
                  <div className="mb-8 text-right">
                    <span className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/50 uppercase tracking-widest">
                      Start Your Journey
                    </span>
                    <h1 className="mt-4 text-4xl font-bold text-white tracking-tight">Sign Up</h1>
                    <p className="mt-2 text-white/40 text-sm">
                      Create an account to join the world of Samvaad.
                    </p>
                  </div>

                  <AnimatePresence>
                    {!isLogin && error && (
                      <m.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-300 text-sm font-medium"
                      >
                        {error}
                      </m.div>
                    )}
                  </AnimatePresence>

                  <m.form
                    onSubmit={handleRegister}
                    variants={formStagger}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                  >
                    <m.div variants={fieldItem}>
                      <AuthInput
                        icon={<User className="w-4 h-4" />}
                        placeholder="Full name"
                        type="text"
                        value={regData.name}
                        onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                        required
                      />
                    </m.div>
                    <m.div variants={fieldItem}>
                      <AuthInput
                        icon={<Mail className="w-4 h-4" />}
                        placeholder="Email address"
                        type="email"
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                        required
                      />
                    </m.div>
                    <m.div variants={fieldItem}>
                      <AuthInput
                        icon={<Lock className="w-4 h-4" />}
                        placeholder="Password"
                        type={regShowPassword ? "text" : "password"}
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                        required
                        togglePassword={() => setRegShowPassword(!regShowPassword)}
                        showPassword={regShowPassword}
                      />
                    </m.div>

                    <AnimatePresence>
                      {regData.password && (
                        <m.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="px-2 space-y-2"
                        >
                          <div className="flex gap-1">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                  i <= pwStrength
                                    ? pwStrength === 1
                                      ? "bg-red-500"
                                      : pwStrength === 2
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                    : "bg-white/10"
                                }`}
                              />
                            ))}
                          </div>
                        </m.div>
                      )}
                    </AnimatePresence>

                    <m.div variants={fieldItem} className="flex items-start gap-3 p-2">
                      <button
                        type="button"
                        onClick={() => setRegAgreed(!regAgreed)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          regAgreed ? "bg-white border-white text-black" : "border-white/15 bg-white/5"
                        }`}
                      >
                        {regAgreed && <Check className="w-3 h-3" />}
                      </button>
                      <p className="text-[11px] text-white/35 leading-relaxed">
                        I agree to the{" "}
                        <span className="text-white hover:underline cursor-pointer">Terms of Service</span> and{" "}
                        <span className="text-white hover:underline cursor-pointer">Privacy Policy</span>.
                      </p>
                    </m.div>

                    <m.button
                      variants={fieldItem}
                      whileTap={{ scale: 0.986 }}
                      type="submit"
                      disabled={isLoading || !regAgreed}
                      className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          Create Free Account
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </m.button>
                  </m.form>

                  <div className="mt-6 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-white/8" />
                      <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">
                        Or sign up with
                      </span>
                      <div className="h-px flex-1 bg-white/8" />
                    </div>

                    <button
                      onClick={handleGoogleLogin}
                      className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all group active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5 opacity-55 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span className="text-sm font-bold text-white/55 group-hover:text-white transition-colors">
                        Continue with Google
                      </span>
                    </button>
                  </div>
                </m.div>
              </div>
            </div>

            {/* Sliding overlay (optimized) */}
            <m.div
              animate={{ x: isLogin ? "100%" : "0%" }}
              transition={{ duration: DUR.slow, ease: [0.65, 0, 0.35, 1] }}
              className="absolute inset-y-0 left-0 w-1/2 z-50 overflow-hidden border-x border-white/10 bg-[#171d2b] transform-gpu will-change-transform"
            >
              <div className="absolute inset-0">
                <img
                  src="/auth-bg.png"
                  className="w-full h-full object-cover opacity-35" // removed mix-blend-overlay for perf
                  alt="Background"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f2e]/25 via-[#1a1f2e]/78 to-[#1a1f2e]" />
              </div>

              <div className="relative h-full flex flex-col p-10 lg:p-14 justify-between items-center text-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center rotate-3 shadow-xl">
                    <MessageSquare className="w-5 h-5 text-black" fill="currentColor" />
                  </div>
                  <span className="text-2xl font-black text-white tracking-widest uppercase">Samvaad</span>
                </div>

                <div className="max-w-xs">
                  <AnimatePresence mode="wait">
                    {isLogin ? (
                      <m.div
                        key="reg-text"
                        variants={overlayTextVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="space-y-6"
                      >
                        <div className="flex justify-center gap-3 mb-4">
                          <Zap className="w-6 h-6 text-yellow-400" />
                          <Globe className="w-6 h-6 text-blue-400" />
                          <ShieldCheck className="w-6 h-6 text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">New here?</h2>
                        <p className="text-white/55 text-base leading-relaxed">
                          Join thousands of users communicating securely and seamlessly across the globe.
                        </p>
                        <button
                          onClick={toggleMode}
                          className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/15 rounded-2xl transition-all active:scale-[0.97]"
                        >
                          <span className="text-white font-bold text-sm tracking-widest uppercase">
                            Register Now
                          </span>
                        </button>
                      </m.div>
                    ) : (
                      <m.div
                        key="login-text"
                        variants={overlayTextVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="space-y-6"
                      >
                        <div className="flex justify-center gap-3 mb-4">
                          <Heart className="w-6 h-6 text-red-400" />
                          <Sparkles className="w-6 h-6 text-purple-400" />
                          <Lock className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back!</h2>
                        <p className="text-white/55 text-base leading-relaxed">
                          To keep connected with your community please login with your personal info.
                        </p>
                        <button
                          onClick={toggleMode}
                          className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/15 rounded-2xl transition-all active:scale-[0.97]"
                        >
                          <span className="text-white font-bold text-sm tracking-widest uppercase">
                            Go to Login
                          </span>
                        </button>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-white/45" />
                  <span className="text-[10px] font-bold text-white/45 uppercase tracking-[0.2em]">
                    End-to-End Encrypted
                  </span>
                </div>
              </div>
            </m.div>
          </m.div>
        </div>
      </div>
    </LazyMotion>
  );
};

const AuthInput = ({ icon, togglePassword, showPassword, ...props }) => {
  const [focused, setFocused] = useState(false);

  return (
    <m.div
      className="relative group transform-gpu will-change-[transform,opacity]"
      animate={{ scale: focused ? 1.003 : 1 }}
      transition={{ duration: 0.14 }}
    >
      <m.div
        className="absolute left-5 top-1/2 -translate-y-1/2 text-white/25"
        animate={{ x: focused ? 1 : 0, opacity: focused ? 0.85 : 0.55 }}
        transition={{ duration: 0.14 }}
      >
        {icon}
      </m.div>

      <input
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={`w-full h-14 bg-white/5 border border-white/12 group-hover:border-white/20 focus:border-white/35 focus:bg-white/[0.08] transition-all rounded-2xl pl-14 pr-12 text-sm text-white placeholder:text-white/25 outline-none ${
          props.className || ""
        }`}
      />

      {togglePassword && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/25 hover:text-white/65 transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </m.div>
  );
};

export default AuthDesktop;