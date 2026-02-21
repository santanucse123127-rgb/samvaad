import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Zap, Shield, Users, Sparkles, MessageCircle, Lock, Globe, ChevronDown } from "lucide-react";

/* ─────────────────────────────────────────
   FLOATING PARTICLE SYSTEM
───────────────────────────────────────── */
const Particle = ({ x, y, size, duration, delay }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      background: `radial-gradient(circle, rgba(0,230,118,0.6), transparent)`,
    }}
    animate={{
      y: [0, -40, 0],
      opacity: [0, 0.8, 0],
      scale: [0.5, 1.2, 0.5],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const ParticleField = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 4 + 3,
    delay: Math.random() * 5,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => <Particle key={p.id} {...p} />)}
    </div>
  );
};

/* ─────────────────────────────────────────
   LIVE CHAT MOCKUP
───────────────────────────────────────── */
const messages = [
  { id: 1, from: "Aisha", text: "Just sent you the project files 📁", time: "9:41 AM", avatar: "A", right: false },
  { id: 2, from: "You", text: "Got it! Starting review now", time: "9:42 AM", avatar: "Y", right: true },
  { id: 3, from: "Aisha", text: "Let me know if anything needs changes ✨", time: "9:42 AM", avatar: "A", right: false },
  { id: 4, from: "You", text: "Looks perfect! Launching tonight 🚀", time: "9:45 AM", avatar: "Y", right: true },
];

const ChatMockup = () => {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setVisible((v) => (v < messages.length ? v + 1 : v)), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        background: "rgba(10,14,20,0.9)",
        border: "1px solid rgba(0,230,118,0.15)",
        borderRadius: 28,
        padding: "24px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        width: "100%",
        maxWidth: 420,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg, #00e676, #00bcd4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#000", fontSize: 16 }}>A</div>
        <div>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: 15 }}>Aisha Rahman</div>
          <div style={{ fontSize: 12, color: "#00e676", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e676", display: "inline-block" }} />
            Online
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#27c93f" }} />
        </div>
      </div>

      {/* Messages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 180 }}>
        <AnimatePresence>
          {messages.slice(0, visible).map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", justifyContent: msg.right ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}
            >
              {!msg.right && (
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#00e676,#00bcd4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#000", flexShrink: 0 }}>{msg.avatar}</div>
              )}
              <div style={{
                background: msg.right ? "linear-gradient(135deg, #00e676, #00c853)" : "rgba(255,255,255,0.07)",
                color: msg.right ? "#000" : "#e8eaed",
                borderRadius: msg.right ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "10px 14px",
                maxWidth: "72%",
                fontSize: 13.5,
                fontWeight: msg.right ? 600 : 400,
                boxShadow: msg.right ? "0 4px 20px rgba(0,230,118,0.3)" : "none",
              }}>
                {msg.text}
                <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: "right" }}>{msg.time}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div style={{ marginTop: 16, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>Type a message…</span>
        <div style={{ marginLeft: "auto", width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#00e676,#00c853)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ArrowRight size={14} color="#000" />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────
   FEATURE CARD
───────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 24,
      padding: "36px 28px",
      position: "relative",
      overflow: "hidden",
      cursor: "default",
    }}
  >
    <motion.div
      className="absolute inset-0 opacity-0"
      whileHover={{ opacity: 1 }}
      style={{ background: "radial-gradient(circle at 50% 0%, rgba(0,230,118,0.08), transparent 70%)" }}
    />
    <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
      <Icon size={22} color="#00e676" />
    </div>
    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: "-0.02em" }}>{title}</h3>
    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>{desc}</p>
  </motion.div>
);

/* ─────────────────────────────────────────
   STAT COUNTER
───────────────────────────────────────── */
const StatItem = ({ value, label, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 + 0.2 }}
    style={{ textAlign: "center" }}
  >
    <div style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#00e676", letterSpacing: "-0.03em", fontFamily: "'Syne', sans-serif" }}>{value}</div>
    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600, marginTop: 4 }}>{label}</div>
  </motion.div>
);

/* ─────────────────────────────────────────
   MAIN INDEX COMPONENT
───────────────────────────────────────── */
const Index = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const features = [
    { icon: Zap, title: "Instant Delivery", desc: "Messages arrive before you blink. Sub-millisecond latency powered by edge infrastructure across 180+ regions." },
    { icon: Lock, title: "Zero-Knowledge Encryption", desc: "We can't read your messages—even if we wanted to. True end-to-end encryption with forward secrecy." },
    { icon: Globe, title: "Borderless Messaging", desc: "Auto-translate across 90+ languages in real-time. The world speaks Samvaad." },
    { icon: Sparkles, title: "Intelligent Context", desc: "AI that understands your conversations and offers smart replies, summaries, and emotion-aware suggestions." },
  ];

  return (
    <>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green: #00e676;
          --green-dark: #00c853;
          --bg: #070c10;
          --bg2: #0b1015;
          --surface: rgba(255,255,255,0.03);
          --border: rgba(255,255,255,0.07);
          --text: #e8eaed;
          --muted: rgba(255,255,255,0.4);
        }

        body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); overflow-x: hidden; }

        .syne { font-family: 'Syne', sans-serif; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,230,118,0.3); border-radius: 2px; }

        /* Noise overlay */
        .noise::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
          z-index: 9999;
        }

        /* Grid lines */
        .grid-bg {
          background-image:
            linear-gradient(rgba(0,230,118,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,230,118,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .btn-primary {
          background: linear-gradient(135deg, #00e676, #00c853);
          color: #000;
          font-weight: 700;
          font-size: 15px;
          padding: 14px 28px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: -0.01em;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 0 0 rgba(0,230,118,0);
          text-decoration: none;
        }
        .btn-primary:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 32px rgba(0,230,118,0.35);
        }
        .btn-ghost {
          background: transparent;
          color: rgba(255,255,255,0.6);
          font-size: 15px;
          font-weight: 500;
          padding: 14px 24px;
          border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.1);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          text-decoration: none;
        }
        .btn-ghost:hover {
          border-color: rgba(0,230,118,0.4);
          color: #00e676;
          background: rgba(0,230,118,0.05);
        }

        .nav-link {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #fff; }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>

      <div className="noise" ref={containerRef} style={{ minHeight: "100vh", background: "var(--bg)" }}>

        {/* ── NAVBAR ── */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 48px)",
            maxWidth: 1100,
            zIndex: 100,
            background: "rgba(7,12,16,0.7)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 100,
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#00e676,#00c853)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MessageCircle size={16} color="#000" fill="#000" />
            </div>
            <span className="syne" style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em", color: "#fff" }}>samvaad</span>
          </div>

          {/* Links */}
          <div style={{ display: "flex", gap: 28, marginLeft: 16 }}>
            {["Features", "Security", "Pricing"].map((l) => (
              <a key={l} href="#" className="nav-link">{l}</a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <Link to="/login" className="btn-ghost" style={{ padding: "8px 18px", fontSize: 13 }}>Sign In</Link>
            <Link to="/register" className="btn-primary" style={{ padding: "8px 18px", fontSize: 13 }}>Get Started</Link>
          </div>
        </motion.nav>

        {/* ── HERO ── */}
        <section
          className="grid-bg"
          style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", paddingTop: 100 }}
        >
          <ParticleField />

          {/* Glow blobs */}
          <div style={{ position: "absolute", top: "20%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,230,118,0.08), transparent 70%)", animation: "glow-pulse 6s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,188,212,0.06), transparent 70%)", animation: "glow-pulse 8s ease-in-out infinite 2s", pointerEvents: "none" }} />

          <motion.div style={{ y: heroY, opacity: heroOpacity, textAlign: "center", maxWidth: 900, padding: "0 24px", position: "relative", zIndex: 2 }}>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 100, border: "1px solid rgba(0,230,118,0.25)", background: "rgba(0,230,118,0.06)", marginBottom: 32 }}
            >
              <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e676", display: "block" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#00e676", letterSpacing: "0.08em", textTransform: "uppercase" }}>Samvaad 2.0 is Live</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="syne"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: "clamp(52px, 9vw, 110px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.92, marginBottom: 28, color: "#fff" }}
            >
              Talk.<br />
              <span style={{ color: "#00e676", position: "relative" }}>
                Connect.
                <motion.span
                  style={{ position: "absolute", bottom: 4, left: 0, height: 3, background: "linear-gradient(90deg,#00e676,transparent)", borderRadius: 2 }}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                />
              </span>
              {" "}Matter.
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{ fontSize: "clamp(16px, 2vw, 20px)", color: "rgba(255,255,255,0.45)", maxWidth: 560, margin: "0 auto 48px", lineHeight: 1.65, fontWeight: 300 }}
            >
              Samvaad is the messaging platform built for real conversations — encrypted, fast, and beautifully designed.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link to="/register" className="btn-primary" style={{ fontSize: 16, padding: "16px 32px" }}>
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="btn-ghost" style={{ fontSize: 16, padding: "16px 32px" }}>
                Sign In
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              style={{ display: "flex", justifyContent: "center", gap: "clamp(32px, 6vw, 80px)", marginTop: 72, paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {[
                { value: "2M+", label: "Messages Daily" },
                { value: "99.99%", label: "Uptime" },
                { value: "E2E", label: "Encrypted" },
                { value: "<1ms", label: "Latency" },
              ].map((s, i) => <StatItem key={s.label} {...s} index={i} />)}
            </motion.div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.2)", zIndex: 2 }}
          >
            <ChevronDown size={22} />
          </motion.div>
        </section>

        {/* ── CHAT PREVIEW ── */}
        <section style={{ padding: "80px 24px 120px", position: "relative" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>

            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ fontSize: 12, color: "#00e676", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600, marginBottom: 16 }}>Live Preview</div>
              <h2 className="syne" style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 24 }}>
                Messaging that feels <em style={{ fontStyle: "italic", color: "#00e676" }}>alive.</em>
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", lineHeight: 1.75, maxWidth: 400, fontWeight: 300 }}>
                Every interaction is smooth, every message instant. Samvaad's real-time engine ensures your conversations never miss a beat — from one-on-ones to massive group chats.
              </p>

              <div style={{ marginTop: 36, display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  "Read receipts with delivery timestamps",
                  "Emoji reactions & threaded replies",
                  "Voice messages with waveform playback",
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(0,230,118,0.15)", border: "1px solid rgba(0,230,118,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00e676" }} />
                    </div>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", justifyContent: "center" }}
            >
              <ChatMockup />
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{ padding: "80px 24px 120px", background: "rgba(255,255,255,0.01)", position: "relative" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ textAlign: "center", marginBottom: 64 }}
            >
              <div style={{ fontSize: 12, color: "#00e676", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600, marginBottom: 16 }}>Why Samvaad</div>
              <h2 className="syne" style={{ fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Built different.<br />
                <span style={{ color: "rgba(255,255,255,0.3)" }}>Not just better.</span>
              </h2>
            </motion.div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
              {features.map((f, i) => <FeatureCard key={f.title} {...f} desc={f.desc} index={i} />)}
            </div>
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div style={{ overflow: "hidden", padding: "40px 0", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,230,118,0.02)" }}>
          <motion.div
            animate={{ x: [0, -1200] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            style={{ display: "flex", gap: 60, whiteSpace: "nowrap", width: "max-content" }}
          >
            {Array(4).fill(["Encrypted", "Real-Time", "Borderless", "Private", "Fast", "Powerful", "Secure", "Samvaad"]).flat().map((w, i) => (
              <span key={i} className="syne" style={{ fontSize: "clamp(18px, 2.5vw, 28px)", fontWeight: 700, color: i % 8 === 7 ? "#00e676" : "rgba(255,255,255,0.12)", letterSpacing: "-0.02em" }}>
                {w} <span style={{ color: "rgba(0,230,118,0.3)", fontSize: "0.4em", verticalAlign: "middle" }}>✦</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* ── SECURITY STRIP ── */}
        <section style={{ padding: "100px 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                <Shield size={30} color="#00e676" />
              </div>
              <h2 className="syne" style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20 }}>
                Your secrets stay <span style={{ color: "#00e676" }}>yours.</span>
              </h2>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", lineHeight: 1.75, maxWidth: 560, margin: "0 auto", fontWeight: 300 }}>
                Military-grade AES-256 encryption with perfect forward secrecy. Not even Samvaad can read your messages. Zero logs, zero surveillance, zero compromise.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: "40px 24px 100px" }}>
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              maxWidth: 1000,
              margin: "0 auto",
              background: "linear-gradient(135deg, rgba(0,230,118,0.12), rgba(0,188,212,0.06))",
              border: "1px solid rgba(0,230,118,0.2)",
              borderRadius: 40,
              padding: "clamp(48px, 8vw, 96px) clamp(32px, 6vw, 80px)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ position: "absolute", top: "-50%", left: "-20%", width: "60%", height: "200%", background: "radial-gradient(ellipse, rgba(0,230,118,0.08), transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 className="syne" style={{ fontSize: "clamp(36px, 6vw, 80px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.95, marginBottom: 24 }}>
                Join the<br />conversation.
              </h2>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", marginBottom: 40, maxWidth: 400, margin: "0 auto 40px", fontWeight: 300, lineHeight: 1.65 }}>
                Over 500,000 people already use Samvaad. Your next great conversation starts right now.
              </p>
              <Link to="/register" className="btn-primary" style={{ fontSize: 17, padding: "18px 36px" }}>
                Start Free — No credit card <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 24px", background: "rgba(0,0,0,0.3)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#00e676,#00c853)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={14} color="#000" fill="#000" />
              </div>
              <span className="syne" style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>samvaad</span>
            </div>

            <div style={{ display: "flex", gap: 32 }}>
              {["Privacy", "Terms", "Security", "About"].map((l) => (
                <a key={l} href="#" style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#00e676"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.3)"}
                >{l}</a>
              ))}
            </div>

            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>© 2024 Samvaad Cloud. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;