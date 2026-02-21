import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, MessageSquare, Sparkles, Check, Phone } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const passwordChecks = [
  { label: "8+ characters", test: (p) => p.length >= 8 },
  { label: "Uppercase", test: (p) => /[A-Z]/.test(p) },
  { label: "Number", test: (p) => /\d/.test(p) },
];

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });

  const set = (field) => (e) => setFormData((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) { setError("Please accept the terms to continue."); return; }
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
    window.location.href = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/api/auth/google`;
  };

  const pwStrength = passwordChecks.filter((c) => c.test(formData.password)).length;

  return (
    <div className="min-h-screen sv-animated-bg flex items-center justify-center relative overflow-hidden px-4 py-10">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, hsl(199 89% 48%), transparent 70%)' }} />
      <div className="pointer-events-none absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, hsl(217 91% 60%), transparent 70%)' }} />

      <motion.div
        className="w-full max-w-[420px] relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl sv-gradient flex items-center justify-center shadow-lg shadow-blue-500/30">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight" style={{ color: 'hsl(var(--sv-text))' }}>
            Samvaad
          </span>
        </div>

        <div className="sv-auth-card">
          <div className="mb-7">
            <h1 className="text-2xl font-bold mb-1.5" style={{ color: 'hsl(var(--sv-text))' }}>
              Create account ✨
            </h1>
            <p className="text-sm" style={{ color: 'hsl(var(--sv-text-2))' }}>
              Join Samvaad — chat with anyone, anywhere
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ background: 'hsl(var(--sv-danger) / 0.12)', color: 'hsl(var(--sv-danger))', border: '1px solid hsl(var(--sv-danger) / 0.25)' }}>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--sv-text-2))' }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--sv-text-3))' }} />
                <input id="name" type="text" value={formData.name} onChange={set("name")} className="sv-input pl-10" placeholder="John Doe" required autoComplete="name" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--sv-text-2))' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--sv-text-3))' }} />
                <input id="reg-email" type="email" value={formData.email} onChange={set("email")} className="sv-input pl-10" placeholder="you@example.com" required autoComplete="email" />
              </div>
            </div>

            {/* Phone (optional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--sv-text-2))' }}>
                Phone <span style={{ color: 'hsl(var(--sv-text-3))' }}>(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--sv-text-3))' }} />
                <input id="phone" type="tel" value={formData.phone} onChange={set("phone")} className="sv-input pl-10" placeholder="+91 98765 43210" autoComplete="tel" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'hsl(var(--sv-text-2))' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--sv-text-3))' }} />
                <input id="reg-password" type={showPassword ? "text" : "password"} value={formData.password} onChange={set("password")} className="sv-input pl-10 pr-10" placeholder="Min. 8 characters" required autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors" style={{ color: 'hsl(var(--sv-text-3))' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {formData.password && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{
                          background: i <= pwStrength
                            ? pwStrength === 1 ? 'hsl(var(--sv-danger))'
                              : pwStrength === 2 ? '#f59e0b'
                                : 'hsl(var(--sv-online))'
                            : 'hsl(var(--sv-border))'
                        }} />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {passwordChecks.map((c, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs transition-all"
                        style={{ color: c.test(formData.password) ? 'hsl(var(--sv-online))' : 'hsl(var(--sv-text-3))' }}>
                        {c.test(formData.password) ? <Check className="w-3 h-3" /> : <span className="w-3 h-3 inline-block text-center">·</span>}
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <button type="button" id="agree-checkbox" onClick={() => setAgreed(!agreed)}
                className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: agreed ? 'linear-gradient(135deg, hsl(var(--sv-accent)), hsl(var(--sv-accent-2)))' : 'hsl(var(--sv-surface-2))', border: `1.5px solid ${agreed ? 'hsl(var(--sv-accent))' : 'hsl(var(--sv-border))'}` }}>
                {agreed && <Check className="w-3 h-3 text-white" />}
              </button>
              <span className="text-xs leading-relaxed" style={{ color: 'hsl(var(--sv-text-2))' }}>
                I agree to the{" "}
                <Link to="/terms" className="font-semibold hover:underline" style={{ color: 'hsl(var(--sv-accent))' }}>Terms</Link>
                {" "}and{" "}
                <Link to="/privacy" className="font-semibold hover:underline" style={{ color: 'hsl(var(--sv-accent))' }}>Privacy Policy</Link>
              </span>
            </div>

            <button id="register-submit" type="submit" className="sv-btn-primary w-full mt-1" disabled={isLoading || !agreed}>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'hsl(var(--sv-border))' }} />
            <span className="text-xs font-medium" style={{ color: 'hsl(var(--sv-text-3))' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'hsl(var(--sv-border))' }} />
          </div>

          {/* Google */}
          <button type="button" onClick={handleGoogleLogin} className="sv-btn-ghost w-full gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="font-medium text-sm">Continue with Google</span>
          </button>

          <p className="text-center text-sm mt-6" style={{ color: 'hsl(var(--sv-text-2))' }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: 'hsl(var(--sv-accent))' }}>Sign in</Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'hsl(var(--sv-text-3))' }} />
          <span className="text-xs" style={{ color: 'hsl(var(--sv-text-3))' }}>End-to-end encrypted messaging</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
