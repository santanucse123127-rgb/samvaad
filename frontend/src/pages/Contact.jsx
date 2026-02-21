import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mail, MapPin, Phone, CheckCircle } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import MorphingBlob from "@/components/MorphingBlob";
import MagneticButton from "@/components/MagneticButton";

const Contact = () => {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden pt-20 bg-background text-foreground">
        {/* Background */}
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <MorphingBlob className="top-20 -right-48 opacity-40" color="primary" size="xl" />
        <MorphingBlob className="bottom-20 -left-48 opacity-30" color="accent" size="lg" />

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-wa-accent/5 blur-[120px] pointer-events-none" />

        <section className="py-24 px-6 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-20">
              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-wa-accent/20 mb-8"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Phone className="w-4 h-4 text-wa-accent" />
                  <span className="text-sm font-bold text-wa-text-secondary uppercase tracking-widest">Contact Us</span>
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">
                  Let's <span className="text-wa-accent italic">Talk.</span>
                </h1>
                <p className="text-xl text-wa-text-secondary mb-12 font-medium leading-relaxed max-w-lg">
                  Have a question, feedback, or just want to say hello? Our team is always here to listen and help you grow.
                </p>

                <div className="space-y-8">
                  {[
                    { icon: Mail, label: "Email", value: "hello@samvaad.chat" },
                    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                    { icon: MapPin, label: "Location", value: "Cloud City, Digital World" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="flex items-center gap-6 group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="w-16 h-16 rounded-[24px] bg-card border border-border/50 flex items-center justify-center shadow-lg group-hover:border-wa-accent transition-colors">
                        <item.icon className="w-6 h-6 text-wa-accent" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-wa-text-secondary font-bold mb-1">{item.label}</p>
                        <p className="text-lg font-bold text-wa-text-primary">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Decorative particles */}
                <div className="relative mt-24 h-40">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-wa-accent/40"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.5, 1]
                      }}
                      transition={{
                        duration: 3 + Math.random() * 3,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Form */}
              <motion.div
                className="bg-card border border-border/50 p-10 md:p-12 rounded-[48px] shadow-2xl relative overflow-hidden backdrop-blur-xl"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <h2 className="text-3xl font-bold mb-4 tracking-tight">Send a Message</h2>

                      {/* Name */}
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-wa-text-primary ml-1 uppercase tracking-wider">Name</label>
                        <div className="relative">
                          <motion.input
                            type="text"
                            value={formState.name}
                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                            onFocus={() => setFocusedField("name")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-6 py-4 rounded-2xl bg-muted/50 border border-border/50 focus:border-wa-accent focus:ring-1 focus:ring-wa-accent/20 transition-all outline-none font-medium"
                            placeholder="Your full name"
                            required
                            animate={{
                              scale: focusedField === "name" ? 1.01 : 1,
                            }}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-wa-text-primary ml-1 uppercase tracking-wider">Email</label>
                        <div className="relative">
                          <motion.input
                            type="email"
                            value={formState.email}
                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-6 py-4 rounded-2xl bg-muted/50 border border-border/50 focus:border-wa-accent focus:ring-1 focus:ring-wa-accent/20 transition-all outline-none font-medium"
                            placeholder="you@example.com"
                            required
                            animate={{
                              scale: focusedField === "email" ? 1.01 : 1,
                            }}
                          />
                        </div>
                      </div>

                      {/* Message */}
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-wa-text-primary ml-1 uppercase tracking-wider">Message</label>
                        <div className="relative">
                          <motion.textarea
                            value={formState.message}
                            onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                            onFocus={() => setFocusedField("message")}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-6 py-4 rounded-2xl bg-muted/50 border border-border/50 focus:border-wa-accent focus:ring-1 focus:ring-wa-accent/20 transition-all outline-none min-h-[160px] resize-none font-medium"
                            placeholder="How can we help?"
                            required
                            animate={{
                              scale: focusedField === "message" ? 1.01 : 1,
                            }}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-wa-accent text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-wa-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Send Message
                            <Send className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success"
                      className="flex flex-col items-center justify-center py-20"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <motion.div
                        className="w-24 h-24 rounded-[32px] bg-wa-accent/10 border border-wa-accent/20 flex items-center justify-center mb-8"
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", damping: 12, delay: 0.2 }}
                      >
                        <CheckCircle className="w-12 h-12 text-wa-accent" />
                      </motion.div>
                      <h3 className="text-4xl font-extrabold mb-4 tracking-tight">Message Sent!</h3>
                      <p className="text-wa-text-secondary text-center text-lg font-medium max-w-xs mx-auto mb-10">
                        We've received your inquiry and our team will get back to you within 24 hours.
                      </p>
                      <button
                        className="text-wa-accent font-bold text-lg hover:underline decoration-2 underline-offset-4"
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormState({ name: "", email: "", message: "" });
                        }}
                      >
                        Send another message
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Decorative glows */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-wa-accent/10 rounded-full blur-[80px] pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-wa-accent/10 rounded-full blur-[80px] pointer-events-none" />
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Contact;
