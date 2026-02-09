"use client";

import { motion } from "framer-motion";
import {
  Brain,
  FileText,
  GitBranch,
  Lightbulb,
  MessageSquare,
  Network,
  Rocket,
  Sparkles,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

const features = [
  {
    icon: FileText,
    title: "Multimodal Paper Analysis",
    description:
      "Upload PDFs and let Gemini 3 understand text, figures, charts, and equations together — not just text extraction.",
    color: "from-cyan-400 to-blue-500",
  },
  {
    icon: Network,
    title: "Visual Knowledge Graph",
    description:
      "Auto-generated interactive graph showing concept relationships, methodologies, and findings across papers.",
    color: "from-violet-400 to-purple-500",
  },
  {
    icon: MessageSquare,
    title: "Research Q&A",
    description:
      "Ask complex questions grounded in your papers. Get precise answers with citations back to source material.",
    color: "from-emerald-400 to-green-500",
  },
  {
    icon: GitBranch,
    title: "Cross-Paper Synthesis",
    description:
      "Discover connections, contradictions, and gaps across multiple papers automatically.",
    color: "from-amber-400 to-orange-500",
  },
  {
    icon: Lightbulb,
    title: "Hypothesis Generation",
    description:
      "AI suggests novel research directions from identified gaps — your next breakthrough starts here.",
    color: "from-pink-400 to-rose-500",
  },
  {
    icon: Zap,
    title: "Powered by Gemini 3",
    description:
      "Built on Google's most capable model with enhanced reasoning, multimodal understanding, and reduced latency.",
    color: "from-yellow-400 to-amber-500",
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

export default function LandingPage() {
  const setView = useAppStore((s) => s.setView);

  return (
    <div className="min-h-screen bg-dark-950 stars-bg overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orbit-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[200px]" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orbit-500 to-violet-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-orbit-500 to-violet-500 opacity-30 blur-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight">ORBIT</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView("dashboard")}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orbit-600 to-violet-600 text-white font-medium text-sm hover:from-orbit-500 hover:to-violet-500 transition-all shadow-lg shadow-orbit-500/25"
          >
            Launch App
          </motion.button>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <Sparkles className="w-4 h-4 text-orbit-400" />
            <span className="text-sm text-dark-300">
              Powered by Google Gemini 3
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight mb-8"
          >
            <span className="text-white">Research at the</span>
            <br />
            <span className="text-gradient bg-gradient-to-r from-orbit-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Speed of Thought
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl text-dark-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            ORBIT is an AI-powered research intelligence tool that analyzes
            scientific papers, discovers hidden connections, and generates novel
            hypotheses — turning hours of reading into minutes of insight.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setView("dashboard")}
              className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-orbit-600 to-violet-600 text-white font-semibold text-lg hover:from-orbit-500 hover:to-violet-500 transition-all shadow-2xl shadow-orbit-500/30 flex items-center gap-3"
            >
              <Rocket className="w-5 h-5" />
              Start Analyzing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>

        {/* Orbital Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative mt-24 flex items-center justify-center"
        >
          <div className="relative w-64 h-64">
            {/* Center brain */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orbit-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-orbit-500/50">
                <Brain className="w-10 h-10 text-white" />
              </div>
            </div>
            {/* Orbit rings */}
            <div className="absolute inset-0 rounded-full border border-orbit-500/20 animate-spin-slow" />
            <div className="absolute -inset-8 rounded-full border border-violet-500/10" style={{ animationDuration: '12s' }} />
            <div className="absolute -inset-16 rounded-full border border-cyan-500/5" style={{ animationDuration: '16s' }} />
            {/* Orbiting dots */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute inset-0"
                style={{
                  animation: `spin ${8 + i * 4}s linear infinite`,
                  animationDelay: `${i * -2}s`,
                }}
              >
                <div
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    top: "0",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: ["#22d3ee", "#a78bfa", "#34d399", "#fbbf24", "#f87171"][i],
                    boxShadow: `0 0 10px ${["#22d3ee", "#a78bfa", "#34d399", "#fbbf24", "#f87171"][i]}80`,
                  }}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            What ORBIT Can Do
          </h2>
          <p className="text-dark-400 max-w-xl mx-auto">
            A complete research intelligence platform powered by Gemini 3&apos;s
            multimodal capabilities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass rounded-2xl p-6 hover:glow-border transition-all duration-300 group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-dark-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            How It Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Upload Papers",
              desc: "Drag & drop PDF research papers. Gemini 3 analyzes text, figures, equations, and charts multimodally.",
            },
            {
              step: "02",
              title: "Explore & Discover",
              desc: "Navigate the auto-generated knowledge graph, ask questions, and discover hidden connections.",
            },
            {
              step: "03",
              title: "Synthesize & Hypothesize",
              desc: "Get cross-paper synthesis with novel hypothesis generation for your next research direction.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center"
            >
              <div className="text-5xl font-black text-gradient mb-4">
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {item.title}
              </h3>
              <p className="text-dark-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-12 text-center glow-border-strong"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Accelerate Your Research?
          </h2>
          <p className="text-dark-400 mb-8 max-w-xl mx-auto">
            Join the future of scientific discovery. Upload your first paper and
            let Gemini 3 reveal insights you never knew existed.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setView("dashboard")}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orbit-600 to-violet-600 text-white font-semibold text-lg hover:from-orbit-500 hover:to-violet-500 transition-all shadow-2xl shadow-orbit-500/30"
          >
            Get Started — It&apos;s Free
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-orbit-400" />
            <span className="text-sm text-dark-500">ORBIT — Built with Gemini 3</span>
          </div>
          <span className="text-sm text-dark-600">
            Gemini 3 Hackathon 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
