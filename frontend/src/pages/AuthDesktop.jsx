import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  MessageSquare, Sparkles, Check, Phone, Smartphone,
  ShieldCheck, Globe, Zap, Heart
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const passwordChecks = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase", test: (p) => /[A-Z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
];

const AuthDesktop = ({ initialMode = "login" }) => {
  const { login, register, sendOTP, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode state: "login" or "register"
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  
  // Sync state with URL if it changes
  useEffect(() => {
    setIsLogin(location.pathname === "/login");
  }, [location.pathname]);

  // Shared state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Login specific state
  const [loginMode, setLoginMode] = useState("email"); // "email", "phone", "email-otp"
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Register specific state
  const [regData, setRegData] = useState({ name: "", email: "", password: "", phone: "" });
  const [regAgreed, setRegAgreed] = useState(false);
  const [regShowPassword, setRegShowPassword] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setOtpSent(false);
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
        // Phone/Email OTP logic
        if (!otpSent) {
          const result = await sendOTP(loginMode === "phone" ? { phone: loginPhone } : { email: loginEmail });
          if (result.success) setOtpSent(true);
          else setError(result.message || "Failed to send OTP.");
        } else {
          const result = await verifyOTP(
            loginMode === "phone" ? { phone: loginPhone, otp: loginOtp } : { email: loginEmail, otp: loginOtp }
          );
          if (result.success) navigate("/chat", { replace: true });
          else setError(result.message || "Invalid OTP.");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regAgreed) { setError("Please accept the terms to continue."); return; }
    setIsLoading(true);
    setError("");

    try {
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(regData.name)}`;
      const result = await register({ ...regData, avatar: avatarUrl });
      if (result.success) navigate("/chat", { replace: true });
      else setError(result.message || "Registration failed.");
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/google`;
  };

  const pwStrength = passwordChecks.filter((c) => c.test(regData.password)).length;

  return (
    <div className="min-h-screen bg-[#080a0f] flex items-center justify-center p-6 selection:bg-purple-500/30 overflow-hidden font-outfit">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#4f46e5]/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#06b6d4]/10 rounded-full blur-[120px] animation-delay-2000 animate-pulse" />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-[1000px] h-[650px] bg-[#11141d]/80 backdrop-blur-3xl border border-white/5 rounded-[32px] shadow-2xl overflow-hidden flex shadow-purple-500/5">
        
        {/* Forms Container */}
        <div className="relative w-full h-full flex">
          
          {/* Login Form Section */}
          <div className="w-1/2 h-full flex flex-col p-12 justify-center">
            <motion.div
              animate={{ 
                opacity: isLogin ? 1 : 0.3,
                x: isLogin ? 0 : -20,
                filter: isLogin ? 'blur(0px)' : 'blur(4px)',
                pointerEvents: isLogin ? 'auto' : 'none'
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    Welcome Back
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Login</h1>
                <p className="text-white/40 text-sm">Enter your credentials to continue the conversation.</p>
              </div>

              {isLogin && error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Login Mode Toggle */}
                <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-4">
                  {["email", "email-otp", "phone"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => { setLoginMode(mode); setOtpSent(false); setError(""); }}
                      className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${loginMode === mode ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"}`}
                    >
                      {mode === "email" ? "Password" : mode === "email-otp" ? "E-OTP" : "Phone"}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
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
                    <>
                      {!otpSent ? (
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
                      )}
                    </>
                  ) : (
                    <>
                      {!otpSent ? (
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
                    </>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      {loginMode === "email" ? "Sign In" : (otpSent ? "Verify & Enter" : "Send Code")}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Or login with</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                
                <div className="flex gap-3">
                  <button onClick={handleGoogleLogin} className="flex-1 h-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all group active:scale-[0.98]">
                    <svg className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  </button>
                  <Link to="/qr-login" className="flex-1 h-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all group active:scale-[0.98]">
                    <Smartphone className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity text-white" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Register Form Section */}
          <div className="w-1/2 h-full flex flex-col p-12 justify-center">
            <motion.div
              animate={{ 
                opacity: !isLogin ? 1 : 0.3,
                x: !isLogin ? 0 : 20,
                filter: !isLogin ? 'blur(0px)' : 'blur(4px)',
                pointerEvents: !isLogin ? 'auto' : 'none'
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <div className="mb-8 text-right">
                <div className="flex items-center justify-end gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/50 uppercase tracking-widest">
                    Start Your Journey
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Sign Up</h1>
                <p className="text-white/40 text-sm">Create an account to join the world of Samvaad.</p>
              </div>

              {!isLogin && error && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <AuthInput 
                  icon={<User className="w-4 h-4" />} 
                  placeholder="Full name" 
                  type="text" 
                  value={regData.name} 
                  onChange={(e) => setRegData({...regData, name: e.target.value})}
                  required
                />
                <AuthInput 
                  icon={<Mail className="w-4 h-4" />} 
                  placeholder="Email address" 
                  type="email" 
                  value={regData.email} 
                  onChange={(e) => setRegData({...regData, email: e.target.value})}
                  required
                />
                <AuthInput 
                  icon={<Lock className="w-4 h-4" />} 
                  placeholder="Password" 
                  type={regShowPassword ? "text" : "password"} 
                  value={regData.password} 
                  onChange={(e) => setRegData({...regData, password: e.target.value})}
                  required
                  togglePassword={() => setRegShowPassword(!regShowPassword)}
                  showPassword={regShowPassword}
                />

                {/* Password Strength Indicator */}
                {regData.password && (
                  <div className="px-2 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= pwStrength ? (pwStrength === 1 ? 'bg-red-500' : pwStrength === 2 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-white/5'}`} />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 p-2">
                  <button 
                    type="button" 
                    onClick={() => setRegAgreed(!regAgreed)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${regAgreed ? 'bg-white border-white text-black' : 'border-white/10 bg-white/5'}`}
                  >
                    {regAgreed && <Check className="w-3 h-3" />}
                  </button>
                  <p className="text-[11px] text-white/30 leading-relaxed">
                    I agree to the <span className="text-white hover:underline cursor-pointer">Terms of Service</span> and <span className="text-white hover:underline cursor-pointer">Privacy Policy</span>.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || !regAgreed}
                  className="w-full h-12 bg-white text-black hover:bg-white/90 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 active:scale-[0.98] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Free Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/5" />
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Or sign up with</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                
                <button onClick={handleGoogleLogin} className="w-full h-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all group active:scale-[0.98]">
                  <svg className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-sm font-bold text-white/50 group-hover:text-white transition-colors">Continue with Google</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Sliding Overlay Panel */}
        <motion.div
          animate={{ x: isLogin ? '100%' : '0%' }}
          transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
          className="absolute inset-y-0 left-0 w-1/2 bg-[#1a1f2e] z-50 overflow-hidden border-x border-white/5"
        >
          {/* Animated Background inside Overlay */}
          <div className="absolute inset-0">
             <img 
               src="/auth-bg.png" 
               className="w-full h-full object-cover opacity-40 mix-blend-overlay"
               alt="Background"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-[#1a1f2e]/20 via-[#1a1f2e]/80 to-[#1a1f2e]" />
          </div>

          <div className="relative h-full flex flex-col p-16 justify-between items-center text-center">
            {/* Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center rotate-3 shadow-xl">
                 <MessageSquare className="w-5 h-5 text-black" fill="currentColor" />
              </div>
              <span className="text-2xl font-black text-white tracking-widest uppercase">Samvaad</span>
            </div>

            {/* Dynamic Content */}
            <div className="max-w-xs">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="reg-text"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-center gap-3 mb-4">
                       <Zap className="w-6 h-6 text-yellow-400" />
                       <Globe className="w-6 h-6 text-blue-400" />
                       <ShieldCheck className="w-6 h-6 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">New here?</h2>
                    <p className="text-white/50 text-base leading-relaxed">
                      Join thousands of users communicating securely and seamlessly across the globe.
                    </p>
                    <button 
                      onClick={toggleMode}
                      className="group relative px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl overflow-hidden transition-all active:scale-[0.95]"
                    >
                      <span className="relative z-10 text-white font-bold text-sm tracking-widest uppercase">Register Now</span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="login-text"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-center gap-3 mb-4">
                       <Heart className="w-6 h-6 text-red-400" />
                       <Sparkles className="w-6 h-6 text-purple-400" />
                       <Lock className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back!</h2>
                    <p className="text-white/50 text-base leading-relaxed">
                      To keep connected with your community please login with your personal info.
                    </p>
                    <button 
                      onClick={toggleMode}
                      className="group relative px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl overflow-hidden transition-all active:scale-[0.95]"
                    >
                      <span className="relative z-10 text-white font-bold text-sm tracking-widest uppercase">Go to Login</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">End-to-End Encrypted</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const AuthInput = ({ icon, togglePassword, showPassword, ...props }) => (
  <div className="relative group">
    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white/60 transition-colors">
      {icon}
    </div>
    <input 
      {...props}
      className={`w-full h-14 bg-white/5 border border-white/10 group-hover:border-white/20 focus:border-white/30 focus:bg-white/[0.08] transition-all rounded-2xl pl-14 pr-12 text-sm text-white placeholder:text-white/20 outline-none ${props.className || ''}`}
    />
    {togglePassword && (
      <button 
        type="button" 
        onClick={togglePassword} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/20 hover:text-white/60 transition-colors"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    )}
  </div>
);

export default AuthDesktop;
