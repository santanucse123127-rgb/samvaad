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
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <MorphingBlob className="top-20 -right-48" color="primary" size="xl" />
        <MorphingBlob className="bottom-20 -left-48" color="accent" size="lg" />

        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-glow-gradient opacity-30 pointer-events-none" />

        <section className="py-24 px-6 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-16">
              {/* Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Let's <span className="gradient-text">Connect</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-12">
                  Have a question, feedback, or just want to say hello? We'd love to hear from you.
                  Our team is always ready to help.
                </p>

                <div className="space-y-6">
                  {[
                    { icon: Mail, label: "Email", value: "hello@nexus.chat" },
                    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
                    { icon: MapPin, label: "Location", value: "San Francisco, CA" },
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{item.label}</p>
                        <p className="font-medium">{item.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Decorative particles */}
                <div className="relative mt-16 h-32">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-primary/50"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>

              {/* Form */}
              <motion.div
                className="glass-card p-8 relative overflow-hidden"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="space-y-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <motion.input
                          type="text"
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          onFocus={() => setFocusedField("name")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none transition-all"
                          placeholder="Your name"
                          required
                          animate={{
                            scale: focusedField === "name" ? 1.02 : 1,
                          }}
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <motion.input
                          type="email"
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          onFocus={() => setFocusedField("email")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none transition-all"
                          placeholder="you@example.com"
                          required
                          animate={{
                            scale: focusedField === "email" ? 1.02 : 1,
                          }}
                        />
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Message</label>
                        <motion.textarea
                          value={formState.message}
                          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                          onFocus={() => setFocusedField("message")}
                          onBlur={() => setFocusedField(null)}
                          className="w-full px-4 py-3 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none transition-all min-h-[150px] resize-none"
                          placeholder="Your message..."
                          required
                          animate={{
                            scale: focusedField === "message" ? 1.02 : 1,
                          }}
                        />
                      </div>

                      <MagneticButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <motion.div
                            className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            Send Message
                            <Send className="w-5 h-5" />
                          </span>
                        )}
                      </MagneticButton>
                    </motion.form>
                  ) : (
                    <motion.div
                      key="success"
                      className="flex flex-col items-center justify-center py-12"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <motion.div
                        className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                      >
                        <CheckCircle className="w-10 h-10 text-primary" />
                      </motion.div>
                      <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                      <p className="text-muted-foreground text-center">
                        We've received your message and will get back to you soon.
                      </p>
                      <motion.button
                        className="mt-6 text-primary hover:underline"
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormState({ name: "", email: "", message: "" });
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        Send another message
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Gradient overlay */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Contact;
