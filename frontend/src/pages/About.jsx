import { motion } from "framer-motion";
import { Code, Palette, Zap, Database, Cloud, Lock, Globe, Sparkles } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import MorphingBlob from "@/components/MorphingBlob";
import AnimatedText from "@/components/AnimatedText";

const skills = [
  { icon: Code, name: "React", category: "Frontend" },
  { icon: Palette, name: "Tailwind", category: "Frontend" },
  { icon: Zap, name: "Framer", category: "Frontend" },
  { icon: Database, name: "MongoDB", category: "Backend" },
  { icon: Cloud, name: "Node.js", category: "Backend" },
  { icon: Lock, name: "Auth", category: "Backend" },
  { icon: Globe, name: "WebSocket", category: "Tools" },
  { icon: Sparkles, name: "AI", category: "Tools" },
];

const timeline = [
  { year: "2024", title: "NEXUS Launch", description: "Launched with 1M+ users in first month" },
  { year: "2023", title: "Beta Release", description: "Private beta with 10K testers" },
  { year: "2022", title: "Development", description: "Core team formed, development started" },
  { year: "2021", title: "Concept", description: "Idea conceived, research & planning" },
];

const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen relative overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <MorphingBlob className="top-40 -left-48" color="primary" size="xl" />
        <MorphingBlob className="top-1/2 -right-48" color="accent" size="lg" />

        {/* Hero Section */}
        <section className="py-24 px-6 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <AnimatedText
                  text="Building the Future of Communication"
                  className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
                  delay={0.2}
                />
                <motion.p
                  className="text-lg text-muted-foreground mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  NEXUS was born from a simple idea: communication should be instant, secure, and
                  beautiful. We're a team of passionate developers and designers creating the
                  next generation of real-time chat experiences.
                </motion.p>
                <motion.div
                  className="flex flex-wrap gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="glass-card px-6 py-4">
                    <div className="text-3xl font-bold gradient-text">10M+</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                  <div className="glass-card px-6 py-4">
                    <div className="text-3xl font-bold gradient-text">150+</div>
                    <div className="text-sm text-muted-foreground">Countries</div>
                  </div>
                  <div className="glass-card px-6 py-4">
                    <div className="text-3xl font-bold gradient-text">1B+</div>
                    <div className="text-sm text-muted-foreground">Messages/Day</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Visual */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="glass-card p-8 relative z-10">
                  <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <motion.div
                      className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <span className="text-5xl font-bold text-primary-foreground">N</span>
                    </motion.div>
                  </div>
                </div>
                <MorphingBlob className="-bottom-10 -right-10 opacity-50" color="accent" size="sm" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-24 px-6 relative">
          <div className="container mx-auto max-w-4xl">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Our <span className="gradient-text">Journey</span>
            </motion.h2>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  className={`relative flex items-center gap-8 mb-12 ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                    <div className="glass-card p-6 inline-block">
                      <span className="text-sm text-primary font-semibold">{item.year}</span>
                      <h3 className="text-xl font-bold mt-1">{item.title}</h3>
                      <p className="text-muted-foreground text-sm mt-2">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-primary glow-primary relative z-10" />
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Orbit Section */}
        <section className="py-24 px-6 relative">
          <div className="container mx-auto max-w-4xl">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Powered By <span className="gradient-text">Technology</span>
            </motion.h2>

            <div className="relative h-[400px] flex items-center justify-center">
              {/* Center */}
              <motion.div
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary z-10"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-2xl font-bold text-primary-foreground">N</span>
              </motion.div>

              {/* Orbiting skills */}
              {skills.map((skill, index) => {
                const angle = (index / skills.length) * 360;
                const radius = 150;
                const xPos = Math.cos((angle * Math.PI) / 180) * radius;
                const yPos = Math.sin((angle * Math.PI) / 180) * radius;
                return (
                  <motion.div
                    key={skill.name}
                    className="absolute"
                    initial={{ opacity: 0, scale: 0, x: xPos, y: yPos }}
                    whileInView={{ opacity: 1, scale: 1, x: xPos, y: yPos }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="glass-card p-4 flex flex-col items-center gap-2">
                      <skill.icon className="w-6 h-6 text-primary" />
                      <span className="text-xs font-medium">{skill.name}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default About;
