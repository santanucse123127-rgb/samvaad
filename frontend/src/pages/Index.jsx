import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, Zap, Shield, Users, Sparkles, MessageCircle, Lock, Globe, ChevronDown, Check } from "lucide-react";

/* ─────────────────────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      background: #060a0d;
      font-family: 'DM Sans', sans-serif;
      color: #e2e8f0;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(0,230,118,0.25); border-radius: 2px; }

    .syne { font-family: 'Syne', sans-serif !important; }

    #noise-layer {
      position: fixed; inset: 0; z-index: 9998;
      pointer-events: none; opacity: 0.022;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
      background-repeat: repeat;
    }

    .dot-grid {
      background-image: radial-gradient(rgba(0,230,118,0.055) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    @keyframes glow-float {
      0%, 100% { opacity: 0.35; transform: scale(1) translateY(0px); }
      50%       { opacity: 0.6;  transform: scale(1.08) translateY(-20px); }
    }

    @keyframes marquee {
      from { transform: translateX(0); }
      to   { transform: translateX(-50%); }
    }
    .marquee-inner { animation: marquee 22s linear infinite; display: flex; width: max-content; }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
      color: #061209; font-weight: 700; font-size: 15px;
      padding: 13px 26px; border-radius: 100px; border: none;
      cursor: pointer; font-family: 'DM Sans', sans-serif;
      letter-spacing: -0.01em; text-decoration: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      white-space: nowrap;
    }
    .btn-primary:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 28px rgba(0,230,118,0.35);
    }
    .btn-primary:active { transform: scale(0.98); }

    .btn-ghost {
      display: inline-flex; align-items: center; gap: 8px;
      background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.65);
      font-size: 15px; font-weight: 500;
      padding: 13px 24px; border-radius: 100px;
      border: 1px solid rgba(255,255,255,0.1);
      cursor: pointer; font-family: 'DM Sans', sans-serif;
      transition: all 0.2s ease; text-decoration: none; white-space: nowrap;
    }
    .btn-ghost:hover {
      border-color: rgba(0,230,118,0.35);
      color: #00e676; background: rgba(0,230,118,0.06);
    }

    .nav-link {
      color: rgba(255,255,255,0.45); text-decoration: none;
      font-size: 14px; font-weight: 500;
      transition: color 0.2s; white-space: nowrap;
    }
    .nav-link:hover { color: #fff; }

    .feat-card {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 24px; padding: 32px 28px;
      position: relative; overflow: hidden; cursor: default;
      transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    }
    .feat-card:hover {
      border-color: rgba(0,230,118,0.3); transform: translateY(-8px);
      box-shadow: 0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,230,118,0.08);
    }
    .feat-card::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(circle at 50% -20%, rgba(0,230,118,0.07), transparent 70%);
      opacity: 0; transition: opacity 0.4s;
    }
    .feat-card:hover::before { opacity: 1; }

    .price-card {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 28px; padding: 40px 32px;
      position: relative; overflow: hidden;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .price-card.featured {
      background: linear-gradient(135deg, rgba(0,230,118,0.12), rgba(0,200,100,0.06));
      border-color: rgba(0,230,118,0.35);
      box-shadow: 0 0 60px rgba(0,230,118,0.1);
    }
    .price-card:hover { transform: translateY(-6px); box-shadow: 0 40px 80px rgba(0,0,0,0.4); }

    .testi-card {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 20px; padding: 28px;
    }

    .footer-link {
      font-size: 13.5px; color: rgba(255,255,255,0.3);
      text-decoration: none; transition: color 0.2s;
    }
    .footer-link:hover { color: #00e676; }
  `}</style>
);

/* ─────────────────────────────────────────────────────────
   FLOATING PARTICLES
───────────────────────────────────────────────────────── */
const ParticleField = () => {
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      dur: Math.random() * 5 + 4,
      delay: Math.random() * 6,
    }))
  );
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,230,118,0.7), transparent)",
          }}
          animate={{ y: [0, -50, 0], opacity: [0, 0.7, 0], scale: [0.5, 1.3, 0.5] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   LIVE CHAT MOCKUP
───────────────────────────────────────────────────────── */
const MESSAGES = [
  { id: 1, text: "Hey! Just dropped the new designs in the folder 📁", right: false, avatar: "A", time: "9:41 AM" },
  { id: 2, text: "Perfect timing! Reviewing now ✨", right: true, avatar: "Y", time: "9:42 AM" },
  { id: 3, text: "The animations look incredible btw 🔥", right: false, avatar: "A", time: "9:43 AM" },
  { id: 4, text: "Agreed — shipping tonight! 🚀", right: true, avatar: "Y", time: "9:45 AM" },
];

const ChatMockup = () => {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    setVisible(0);
    const t = setInterval(() => {
      setVisible((v) => { if (v >= MESSAGES.length) { clearInterval(t); return v; } return v + 1; });
    }, 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      background: "rgba(8,12,16,0.92)", border: "1px solid rgba(0,230,118,0.12)",
      borderRadius: 28, padding: 24, backdropFilter: "blur(24px)",
      boxShadow: "0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
      width: "100%", maxWidth: 400,
    }}>
      {/* Window chrome */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {["#ff5f56", "#ffbd2e", "#27c93f"].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />)}
      </div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 16, marginBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#00e676,#00bcd4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#050e07", fontSize: 15, flexShrink: 0 }}>A</div>
        <div>
          <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>Aisha Rahman</div>
          <div style={{ fontSize: 11, color: "#00e676", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00e676", display: "inline-block" }} /> Online now
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 10.5, color: "#00e676", background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.15)", padding: "3px 10px", borderRadius: 100 }}>🔒 Encrypted</div>
      </div>
      {/* Messages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 190 }}>
        <AnimatePresence>
          {MESSAGES.slice(0, visible).map((msg) => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", justifyContent: msg.right ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}
            >
              {!msg.right && (
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#00e676,#00bcd4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#050e07", flexShrink: 0 }}>{msg.avatar}</div>
              )}
              <div style={{
                background: msg.right ? "linear-gradient(135deg,#00e676,#00c853)" : "rgba(255,255,255,0.07)",
                color: msg.right ? "#050e07" : "#e2e8f0",
                borderRadius: msg.right ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                padding: "10px 14px", maxWidth: "76%", fontSize: 13,
                fontWeight: msg.right ? 600 : 400, lineHeight: 1.45,
                boxShadow: msg.right ? "0 4px 20px rgba(0,230,118,0.25)" : "none",
              }}>
                {msg.text}
                <div style={{ fontSize: 9.5, opacity: 0.55, marginTop: 3, textAlign: "right" }}>{msg.time}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Input */}
      <div style={{ marginTop: 16, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "11px 16px", display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, flex: 1 }}>Type a message…</span>
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#00e676,#00c853)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ArrowRight size={13} color="#050e07" />
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────── */
const features = [
  { icon: Zap, title: "Sub-Millisecond Delivery", desc: "Edge infrastructure in 180+ regions ensures your messages arrive before you blink. Zero buffering." },
  { icon: Lock, title: "Zero-Knowledge Encryption", desc: "AES-256 with perfect forward secrecy. We mathematically cannot read your messages — ever." },
  { icon: Globe, title: "Borderless by Default", desc: "Real-time translation across 90+ languages. Your conversations break every barrier." },
  { icon: Sparkles, title: "Context-Aware AI", desc: "Smart replies, intelligent search, and sentiment-aware summaries that feel like a superpower." },
];

const pricingPlans = [
  { name: "Free", price: "₹0", period: "forever", desc: "Everything you need to get started.", featured: false, cta: "Start Free", features: ["Unlimited messages", "Up to 10 group chats", "Standard encryption", "7-day message history"] },
  { name: "Pro", price: "₹199", period: "per month", desc: "For power users who need more.", featured: true, cta: "Get Pro", features: ["Everything in Free", "Unlimited groups", "Advanced encryption", "Unlimited history", "Priority support", "AI smart replies"] },
  { name: "Team", price: "₹499", period: "per month", desc: "Built for organizations.", featured: false, cta: "Contact Sales", features: ["Everything in Pro", "Admin dashboard", "Custom branding", "API access", "SSO / SAML", "Dedicated support"] },
];

const testimonials = [
  { name: "Priya S.", role: "Product Designer", text: "Samvaad replaced Slack for our whole team. The UI is stunning and it's just… faster." },
  { name: "Rahul M.", role: "Startup Founder", text: "End-to-end encryption + AI summaries? This is exactly what I needed for client calls." },
  { name: "Divya K.", role: "Freelancer", text: "I love how the messages animate in. It genuinely doesn't feel like any other chat app." },
];

/* ─────────────────────────────────────────────────────────
   MAIN
───────────────────────────────────────────────────────── */
export default function Index() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);

  return (
    <>
      <GlobalStyles />
      <div id="noise-layer" aria-hidden="true" />

      <div ref={containerRef} style={{ minHeight: "100vh", background: "#060a0d", position: "relative" }}>

        {/* ══ NAVBAR ══ */}
        <motion.header
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed", top: 14, left: "50%", transform: "translateX(-50%)",
            width: "min(calc(100% - 32px), 1100px)", zIndex: 500,
            background: "rgba(6,10,13,0.75)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 100,
            padding: "10px 16px 10px 20px",
            display: "flex", alignItems: "center", gap: 24,
          }}
        >
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#00e676,#00c853)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <img src="/logo.png" alt="S" style={{ width: 20, height: 20, objectFit: "contain" }} />
            </div>
            <span className="syne" style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em", color: "#fff" }}>samvaad</span>
          </Link>

          <nav style={{ display: "flex", gap: 28, marginLeft: 8, flex: 1 }}>
            {["Features", "Security", "Pricing"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">{l}</a>
            ))}
          </nav>

          <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
            <Link to="/login" className="btn-ghost" style={{ padding: "9px 18px", fontSize: 13.5 }}>Sign In</Link>
            <Link to="/register" className="btn-primary" style={{ padding: "9px 18px", fontSize: 13.5 }}>Get Started</Link>
          </div>
        </motion.header>

        {/* ══ HERO ══ */}
        <section className="dot-grid" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", paddingTop: 80 }}>
          <ParticleField />

          {/* Glow blobs */}
          <div style={{ position: "absolute", top: "15%", left: "8%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,230,118,0.07),transparent 65%)", animation: "glow-float 7s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "5%", right: "5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(0,188,212,0.05),transparent 65%)", animation: "glow-float 9s ease-in-out infinite 3s", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 800, height: 600, transform: "translate(-50%,-50%)", background: "radial-gradient(ellipse,rgba(0,230,118,0.04),transparent 60%)", pointerEvents: "none" }} />

          <motion.div style={{ y: heroY, opacity: heroOpacity, textAlign: "center", maxWidth: 920, padding: "0 20px", position: "relative", zIndex: 2, width: "100%" }}>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px 6px 10px", borderRadius: 100, border: "1px solid rgba(0,230,118,0.25)", background: "rgba(0,230,118,0.07)", marginBottom: 36 }}
            >
              <motion.span animate={{ scale: [1, 1.5, 1], opacity: [1, 0.7, 1] }} transition={{ repeat: Infinity, duration: 2.5 }} style={{ width: 7, height: 7, borderRadius: "50%", background: "#00e676", display: "block", boxShadow: "0 0 8px rgba(0,230,118,0.8)" }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#00e676", letterSpacing: "0.1em", textTransform: "uppercase" }}>Samvaad 2.0 is Live</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="syne"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              style={{ fontSize: "clamp(58px,10vw,118px)", fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 0.9, marginBottom: 28, color: "#fff" }}
            >
              Talk.<br />
              <span style={{ color: "#00e676", position: "relative", display: "inline-block" }}>
                Connect.
                <motion.span
                  style={{ position: "absolute", bottom: 2, left: 0, height: 3, background: "linear-gradient(90deg,#00e676,rgba(0,230,118,0))", borderRadius: 2, display: "block" }}
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1.1, duration: 0.9, ease: "easeOut" }}
                />
              </span>
              <br />Matter.
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{ fontSize: "clamp(15px,2vw,19px)", color: "rgba(255,255,255,0.42)", maxWidth: 520, margin: "0 auto 44px", lineHeight: 1.7, fontWeight: 300 }}
            >
              The messaging platform built for real conversations — encrypted by default, blindingly fast, and beautifully crafted.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.78 }}
              style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link to="/register" className="btn-primary" style={{ fontSize: 16, padding: "16px 32px" }}>
                Start Chatting Free <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="btn-ghost" style={{ fontSize: 16, padding: "16px 32px" }}>Sign In</Link>
            </motion.div>

            {/* Trust note */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
              style={{ marginTop: 18, fontSize: 12, color: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap" }}
            >
              {["No credit card needed", "Free forever plan", "Cancel anytime"].map((t, i) => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {i > 0 && <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "inline-block" }} />}
                  {t}
                </span>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              style={{ display: "flex", justifyContent: "center", gap: "clamp(28px,6vw,72px)", marginTop: 64, paddingTop: 36, borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              {[{ value: "2M+", label: "Messages Daily" }, { value: "99.99%", label: "Uptime SLA" }, { value: "E2E", label: "Encrypted" }, { value: "<1ms", label: "Latency" }].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 + i * 0.1 }} style={{ textAlign: "center" }}>
                  <div className="syne" style={{ fontSize: "clamp(22px,3.5vw,40px)", fontWeight: 800, color: "#00e676", letterSpacing: "-0.03em", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600, marginTop: 6 }}>{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.2 }}
            style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,0.18)", zIndex: 2 }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </section>

        {/* ══ MARQUEE ══ */}
        <div style={{ overflow: "hidden", borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(0,230,118,0.015)", padding: "22px 0" }}>
          <div className="marquee-inner">
            {Array(6).fill(["Encrypted", "Real-Time", "Borderless", "Private", "Fast", "Beautiful", "Secure", "Samvaad ✦"]).flat().map((w, i) => (
              <span key={i} className="syne" style={{ fontSize: "clamp(14px,1.8vw,22px)", fontWeight: 700, color: w.includes("Samvaad") ? "#00e676" : "rgba(255,255,255,0.1)", letterSpacing: "-0.01em", marginRight: "clamp(32px,5vw,60px)" }}>
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* ══ LIVE PREVIEW ══ */}
        <section style={{ padding: "100px 24px", position: "relative" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 60, alignItems: "center" }}>
            <motion.div initial={{ opacity: 0, x: -32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              <div style={{ fontSize: 11, color: "#00e676", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginBottom: 14 }}>Live Preview</div>
              <h2 className="syne" style={{ fontSize: "clamp(30px,4vw,52px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 22 }}>
                Messaging that feels <em style={{ fontStyle: "italic", color: "#00e676" }}>alive.</em>
              </h2>
              <p style={{ fontSize: 15.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, maxWidth: 400, fontWeight: 300, marginBottom: 36 }}>
                Every interaction is smooth, every message instant. Samvaad's real-time engine ensures nothing is ever lost.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {["Read receipts with delivery timestamps", "Emoji reactions & threaded replies", "Voice messages with waveform playback", "File sharing up to 2 GB"].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 + 0.3 }} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(0,230,118,0.12)", border: "1px solid rgba(0,230,118,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Check size={11} color="#00e676" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 32 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ display: "flex", justifyContent: "center" }}>
              <ChatMockup />
            </motion.div>
          </div>
        </section>

        {/* ══ FEATURES ══ */}
        <section id="features" style={{ padding: "80px 24px 110px", background: "rgba(255,255,255,0.012)" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 60 }}>
              <div style={{ fontSize: 11, color: "#00e676", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginBottom: 14 }}>Why Samvaad</div>
              <h2 className="syne" style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.1 }}>
                Built different.<br /><span style={{ color: "rgba(255,255,255,0.28)" }}>Not just better.</span>
              </h2>
            </motion.div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18 }}>
              {features.map(({ icon: Icon, title, desc }, i) => (
                <motion.div key={title} className="feat-card" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 15, background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <Icon size={21} color="#00e676" />
                  </div>
                  <h3 style={{ fontSize: 16.5, fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: "-0.02em" }}>{title}</h3>
                  <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.38)", lineHeight: 1.72 }}>{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SECURITY ══ */}
        <section id="security" style={{ padding: "100px 24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", width: 700, height: 700, transform: "translate(-50%,-50%)", background: "radial-gradient(circle,rgba(0,230,118,0.04),transparent 60%)", pointerEvents: "none" }} />
          <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div style={{ width: 72, height: 72, borderRadius: 22, background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.22)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                <Shield size={30} color="#00e676" />
              </div>
              <h2 className="syne" style={{ fontSize: "clamp(28px,4.5vw,56px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 20 }}>
                Your secrets stay <span style={{ color: "#00e676" }}>yours.</span>
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.38)", lineHeight: 1.8, maxWidth: 520, margin: "0 auto 48px", fontWeight: 300 }}>
                Military-grade AES-256 encryption with perfect forward secrecy. Not even Samvaad can read your messages. Zero logs, zero surveillance.
              </p>
              <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
                {["AES-256 Encryption", "Perfect Forward Secrecy", "Zero Logs Policy", "Open Source Audited"].map((tag) => (
                  <div key={tag} style={{ padding: "8px 18px", borderRadius: 100, border: "1px solid rgba(0,230,118,0.2)", background: "rgba(0,230,118,0.06)", fontSize: 12.5, color: "#00e676", fontWeight: 600 }}>{tag}</div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ══ */}
        <section style={{ padding: "80px 24px 100px", background: "rgba(255,255,255,0.01)" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 52 }}>
              <div style={{ fontSize: 11, color: "#00e676", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginBottom: 14 }}>Loved by Users</div>
              <h2 className="syne" style={{ fontSize: "clamp(26px,3.5vw,46px)", fontWeight: 800, letterSpacing: "-0.03em" }}>Real people. Real conversations.</h2>
            </motion.div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 18 }}>
              {testimonials.map((t, i) => (
                <motion.div key={t.name} className="testi-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                    {Array(5).fill(0).map((_, j) => <span key={j} style={{ color: "#00e676", fontSize: 13 }}>★</span>)}
                  </div>
                  <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>"{t.text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#00e676,#00bcd4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, color: "#050e07" }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5, color: "#fff" }}>{t.name}</div>
                      <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)" }}>{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PRICING ══ */}
        <section id="pricing" style={{ padding: "80px 24px 110px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{ fontSize: 11, color: "#00e676", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, marginBottom: 14 }}>Simple Pricing</div>
              <h2 className="syne" style={{ fontSize: "clamp(28px,4vw,52px)", fontWeight: 800, letterSpacing: "-0.035em" }}>No surprises. No hidden fees.</h2>
            </motion.div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, alignItems: "start" }}>
              {pricingPlans.map((plan, i) => (
                <motion.div key={plan.name} className={`price-card${plan.featured ? " featured" : ""}`} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  {plan.featured && (
                    <div style={{ position: "absolute", top: 18, right: 20, background: "linear-gradient(135deg,#00e676,#00c853)", color: "#050e07", fontSize: 10.5, fontWeight: 800, padding: "4px 12px", borderRadius: 100, letterSpacing: "0.06em", textTransform: "uppercase" }}>Most Popular</div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, color: plan.featured ? "#00e676" : "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>{plan.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                    <span className="syne" style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em", color: "#fff" }}>{plan.price}</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>/{plan.period}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.38)", marginBottom: 28, lineHeight: 1.6 }}>{plan.desc}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Check size={13} color="#00e676" strokeWidth={3} />
                        <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)" }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/register" className={plan.featured ? "btn-primary" : "btn-ghost"} style={{ width: "100%", justifyContent: "center", padding: "13px" }}>{plan.cta}</Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA BANNER ══ */}
        <section style={{ padding: "40px 24px 100px" }}>
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{ maxWidth: 1000, margin: "0 auto", background: "linear-gradient(135deg,rgba(0,230,118,0.11),rgba(0,180,90,0.06))", border: "1px solid rgba(0,230,118,0.22)", borderRadius: 40, padding: "clamp(48px,7vw,90px) clamp(28px,6vw,80px)", textAlign: "center", position: "relative", overflow: "hidden" }}
          >
            <div style={{ position: "absolute", top: "-40%", left: "-15%", width: "55%", height: "200%", background: "radial-gradient(ellipse,rgba(0,230,118,0.07),transparent 60%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 className="syne" style={{ fontSize: "clamp(34px,6vw,78px)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.93, marginBottom: 22 }}>
                Join the<br />conversation.
              </h2>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.42)", margin: "0 auto 38px", maxWidth: 380, fontWeight: 300, lineHeight: 1.7 }}>
                500,000+ people already use Samvaad. Your next great conversation starts right now.
              </p>
              <Link to="/register" className="btn-primary" style={{ fontSize: 16, padding: "17px 34px" }}>
                Start Free — No card needed <ArrowRight size={17} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ══ FOOTER ══ */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.055)", padding: "48px 24px", background: "rgba(0,0,0,0.25)" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40, marginBottom: 48 }}>
              <div>
                <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none", marginBottom: 16 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#00e676,#00c853)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <img src="/logo.png" alt="S" style={{ width: 18, height: 18, objectFit: "contain" }} />
                  </div>
                  <span className="syne" style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.03em" }}>samvaad</span>
                </Link>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.28)", lineHeight: 1.75, maxWidth: 280, fontWeight: 300 }}>
                  Redefining how the world connects, shares, and builds communities in the digital age.
                </p>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 18 }}>Platform</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["Features", "Security", "Desktop App", "Mobile"].map((l) => <a key={l} href="#" className="footer-link">{l}</a>)}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 18 }}>Company</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {["About Us", "Privacy", "Terms", "Blog"].map((l) => <a key={l} href="#" className="footer-link">{l}</a>)}
                </div>
              </div>
            </div>
            <div style={{ paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.18)" }}>© 2024 Samvaad Cloud Pvt. Ltd. All rights reserved.</p>
              <div style={{ display: "flex", gap: 20 }}>
                {["Privacy", "Terms", "Cookies"].map((l) => <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", textDecoration: "none" }}>{l}</a>)}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}