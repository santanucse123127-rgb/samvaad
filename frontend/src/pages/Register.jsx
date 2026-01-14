import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, MessageSquare, Check } from "lucide-react";
import MorphingBlob from "@/components/MorphingBlob";
import MagneticButton from "@/components/MagneticButton";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/context/AuthContext";


const passwordRequirements = [
  { text: "At least 8 characters", test: (p) => p.length >= 8 },
  { text: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { text: "One number", test: (p) => /\d/.test(p) },
];

const Register = () => {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    avatar:''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`;
    formData.avatar = avatarUrl
    const result = await register(formData);
    if (result.success) navigate("/chat");
    setIsLoading(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 py-20">
        {/* Background */}
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <MorphingBlob className="top-10 -right-32" color="accent" size="lg" />
        <MorphingBlob className="bottom-10 -left-32" color="primary" size="md" />

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-glow-gradient opacity-30 pointer-events-none" />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-3 mb-8">
            <motion.div
              className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center glow-primary"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <span className="text-2xl font-bold gradient-text">NEXUS</span>
          </Link>

          {/* Card */}
          <div className="glass-card p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create Account</h1>
              <p className="text-muted-foreground">Join NEXUS and start chatting</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none input-glow transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none input-glow transition-all"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-12 pr-12 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none input-glow transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password Requirements */}
                <div className="space-y-1 pt-2">
                  {passwordRequirements.map((req, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2 text-xs"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                          req.test(formData.password) ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        {req.test(formData.password) && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span className={req.test(formData.password) ? "text-foreground" : "text-muted-foreground"}>
                        {req.text}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    agreedToTerms ? "bg-primary border-primary" : "border-border"
                  }`}
                >
                  {agreedToTerms && <Check className="w-3 h-3 text-primary-foreground" />}
                </button>
                <span className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </div>

              {/* Submit */}
              <MagneticButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading || !agreedToTerms}
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </MagneticButton>
            </form>

            {/* Sign in link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Register;
