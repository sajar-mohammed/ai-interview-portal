import Link from "next/link";
import { Bot, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white selection:bg-indigo-500/30">
      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
          <Sparkles size={14} />
          <span>Next-Gen Recruitment</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
          Hire Smarter with <br />
          <span className="gradient-text">AI Interviewer</span>
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          The world's first autonomous voice-interactive interview platform.
          Extract skills from JDs and let AI conduct a rigorous technical screening for you.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/admin"
            className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group"
          >
            Go to Admin Dashboard
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/interview/sample-session"
            className="w-full sm:w-auto px-8 py-4 bg-zinc-900 text-zinc-300 font-bold rounded-2xl border border-white/5 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
          >
            Try Demo Interview
          </Link>
        </div>
      </main>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
            <Bot size={24} />
          </div>
          <h3 className="text-xl font-bold">Llama 3.3 Powered</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Fast, intelligent technical questioning that probes deeper based on candidate answers.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-bold">JD Coverage Logic</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Automatically tracks required skills and ensures every topic is covered in the session.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400">
            <Sparkles size={24} />
          </div>
          <h3 className="text-xl font-bold">Gemini Evaluation</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Instant, structured reports with candidate scoring, strengths, and weaknesses.
          </p>
        </div>
      </section>
    </div>
  );
}
