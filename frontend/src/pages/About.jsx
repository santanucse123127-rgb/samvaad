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
      <div className="min-h-screen relative overflow-hidden pt-20 bg-background text-foreground">
        {/* Background */}
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <MorphingBlob className="top-40 -left-48 opacity-40" color="primary" size="xl" />
        <MorphingBlob className="top-1/2 -right-48 opacity-30" color="accent" size="lg" />

        {/* Hero Section */}
        <section className="py-24 px-6 relative">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              {/* Content */}
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
                  <Sparkles className="w-4 h-4 text-wa-accent" />
                  <span className="text-sm font-bold text-wa-text-secondary uppercase tracking-widest">Our Story</span>
                </motion.div>

                <AnimatedText
                  text="Redefining Real-Time Connection."
                  className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-8 bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent"
                  delay={0.2}
                />

                <motion.p
                  className="text-xl text-wa-text-secondary mb-10 font-medium leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  Samvaad was founded on a singular vision: to create a communication platform that feels personal, private, and exceptionally fluid. We believe that technology should fade into the background, leaving only the human connection.
                </motion.p>

                <motion.div
                  className="grid grid-cols-3 gap-6 md:gap-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  {[
                    { val: "5M+", label: "Users" },
                    { val: "180+", label: "Cities" },
                    { val: "99.9%", label: "Uptime" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-card border border-border/50 p-6 rounded-[32px] text-center shadow-lg">
                      <div className="text-2xl md:text-3xl font-extrabold text-wa-accent mb-1">{stat.val}</div>
                      <div className="text-[11px] uppercase tracking-widest text-wa-text-secondary font-bold">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Visual */}
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className="bg-card border border-border/50 p-4 rounded-[48px] shadow-2xl relative z-10 overflow-hidden">
                  <div className="aspect-square rounded-[40px] bg-gradient-to-br from-wa-accent/20 to-wa-accent/5 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                    <motion.div
                      className="w-40 h-40 rounded-3xl bg-wa-accent flex items-center justify-center shadow-2xl shadow-wa-accent/40 relative z-10"
                      animate={{
                        rotateY: [0, 180, 360],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <span className="text-7xl font-black text-white italic tracking-tighter">S</span>
                    </motion.div>

                    {/* Floating elements */}
                    <motion.div
                      className="absolute top-1/4 right-1/4 w-12 h-12 bg-white/10 rounded-xl backdrop-blur-md"
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute bottom-1/4 left-1/4 w-8 h-8 bg-wa-accent/20 rounded-lg backdrop-blur-md"
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    />
                  </div>
                </div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-wa-accent/20 blur-3xl rounded-full" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-32 px-6 relative bg-card/20 border-y border-border/50">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              className="text-center mb-24"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">The <span className="text-wa-accent italic">Evo</span>lution</h2>
              <p className="text-wa-text-secondary text-lg font-medium">How we built the world's most intuitive chat.</p>
            </motion.div>

            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-wa-accent/30 -translate-x-1/2" />

              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  className={`relative flex items-center gap-12 mb-20 ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                    }`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "text-right" : "text-left"}`}>
                    <div className="bg-card border border-border/50 p-8 rounded-[40px] inline-block shadow-xl hover:border-wa-accent/50 transition-colors">
                      <span className="text-wa-accent font-black text-2xl tracking-tighter">{item.year}</span>
                      <h3 className="text-xl font-bold mt-2 uppercase tracking-wide">{item.title === 'NEXUS Launch' ? 'Samvaad Launch' : item.title}</h3>
                      <p className="text-wa-text-secondary font-medium text-[15px] mt-4 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-wa-accent flex items-center justify-center shadow-xl shadow-wa-accent/20 relative z-10 border-4 border-background">
                    <Zap size={18} className="text-white fill-white" />
                  </div>
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Orbit Section */}
        <section className="py-32 px-6 relative">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              className="mb-20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Built with <span className="text-wa-accent underline decoration-wa-accent/30">Precision</span></h2>
              <p className="text-wa-text-secondary text-lg font-medium">Our technology stack is chosen for speed and safety.</p>
            </motion.div>

            <div className="relative h-[600px] flex items-center justify-center">
              {/* Center */}
              <motion.div
                className="w-24 h-24 rounded-3xl bg-wa-accent flex items-center justify-center shadow-2xl shadow-wa-accent/30 z-10"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <span className="text-3xl font-black text-white italic tracking-tighter">S</span>
              </motion.div>

              {/* Orbiting skills */}
              {skills.map((skill, index) => {
                const angle = (index / skills.length) * 360;
                const radius = 220;
                const xPos = Math.cos((angle * Math.PI) / 180) * radius;
                const yPos = Math.sin((angle * Math.PI) / 180) * radius;
                return (
                  <motion.div
                    key={skill.name}
                    className="absolute"
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                    whileInView={{ opacity: 1, scale: 1, x: xPos, y: yPos }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05, duration: 0.8, type: "spring" }}
                    whileHover={{ scale: 1.2, zIndex: 50 }}
                  >
                    <div className="bg-card border border-border/50 p-6 rounded-[32px] flex flex-col items-center gap-3 shadow-xl hover:shadow-2xl transition-all cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-wa-accent/10 flex items-center justify-center">
                        <skill.icon className="w-5 h-5 text-wa-accent" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-wa-text-primary">{skill.name}</span>
                    </div>
                  </motion.div>
                );
              })}

              {/* Decorative Orbits */}
              <div className="absolute w-[440px] h-[440px] border border-border/20 rounded-full pointer-events-none" />
              <div className="absolute w-[300px] h-[300px] border border-border/20 rounded-full pointer-events-none" />
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default About;
