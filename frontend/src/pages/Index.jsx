import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, Shield, Users, Sparkles } from "lucide-react";
import MorphingBlob from "@/components/MorphingBlob";
import AnimatedText from "@/components/AnimatedText";
import GlitchText from "@/components/GlitchText";
import MagneticButton from "@/components/MagneticButton";
import ScrollIndicator from "@/components/ScrollIndicator";
import PageTransition from "@/components/PageTransition";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Real-time messaging with zero latency. Your messages arrive instantly.",
  },
  {
    icon: Shield,
    title: "End-to-End Encrypted",
    description: "Your conversations are private. Military-grade encryption by default.",
  },
  {
    icon: Users,
    title: "Group Chats",
    description: "Create groups with unlimited members. Share ideas seamlessly.",
  },
  {
    icon: Sparkles,
    title: "AI Powered",
    description: "Smart suggestions, auto-translations, and intelligent search.",
  },
];

const Index = () => {
  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <MorphingBlob className="top-20 -left-32" color="primary" size="xl" delay={0} />
        <MorphingBlob className="top-1/3 -right-48" color="accent" size="lg" delay={0.5} />
        <MorphingBlob className="bottom-20 left-1/4" color="primary" size="md" delay={1} />

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center relative px-6 pt-20">
          {/* Glow effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-glow-gradient opacity-50 pointer-events-none" />

          <motion.div
            className="text-center max-w-5xl mx-auto relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
              <span className="text-sm text-muted-foreground">Now in Public Beta</span>
            </motion.div>

            {/* Main Headline */}
            <AnimatedText
              text="Connect Beyond Boundaries"
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight justify-center mb-6"
              delay={0.3}
            />

            {/* Subheadline */}
            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              Experience the future of communication with{" "}
              <GlitchText text="NEXUS" className="text-primary font-semibold" />
              . Real-time chat, reinvented for the modern era.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Link to="/register">
                <MagneticButton variant="primary" size="lg">
                  <span className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </MagneticButton>
              </Link>
              <Link to="/about">
                <MagneticButton variant="outline" size="lg">
                  Learn More
                </MagneticButton>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              {[
                { value: "10M+", label: "Active Users" },
                { value: "99.9%", label: "Uptime" },
                { value: "150+", label: "Countries" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <ScrollIndicator />
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 relative">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Why Choose <span className="gradient-text">NEXUS</span>?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Built with cutting-edge technology to deliver the ultimate chat experience.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="glass-card p-6 group hover:glow-primary transition-all duration-500"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 relative">
          <motion.div
            className="container mx-auto max-w-4xl glass-card p-12 md:p-16 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <MorphingBlob className="-top-20 -right-20" color="primary" size="md" />
            <MorphingBlob className="-bottom-20 -left-20" color="accent" size="sm" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Join millions of users who have already discovered a better way to communicate.
              </p>
              <Link to="/register">
                <MagneticButton variant="primary" size="lg">
                  <span className="flex items-center gap-2">
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </MagneticButton>
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-border">
          <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">N</span>
              </div>
              <span className="font-semibold gradient-text">NEXUS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 NEXUS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default Index;
