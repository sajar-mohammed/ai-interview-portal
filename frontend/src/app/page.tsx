import Link from "next/link";
import { Bot, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-[#060e20] text-[#dee5ff] font-body">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-xl">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto">
          <div className="text-xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-sm">psychology</span>
            </span>
            Luminescent Logic
          </div>

          <div className="hidden md:flex gap-8 text-sm">
            <a className="text-sky-400 border-b-2 border-sky-400 pb-1">Features</a>
            <Link href="/pricing" className="text-slate-300 hover:text-white">Pricing</Link>
            <a className="text-slate-300 hover:text-white">Resources</a>
          </div>

          <button className="bg-gradient-to-r from-blue-400 to-blue-500 px-6 py-2 rounded-full text-sm font-bold">
            Book Demo
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center pt-20 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Hire Smarter with <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-300 bg-clip-text text-transparent">
                AI Interviewer
              </span>
            </h1>

            <p className="text-lg text-gray-400 mb-8">
              Scale your hiring with autonomous AI interviews and identify top
              talent faster.
            </p>

            <div className="flex gap-4">
              <Link
                href="/login"
                className="px-6 py-3 bg-blue-400 text-black rounded-full font-bold hover:bg-blue-300 transition"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 border border-gray-600 rounded-full hover:bg-white/5 transition inline-block text-center"
              >
                Sign Up Now
              </Link>
            </div>
          </div>

          <div className="flex-1">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzeZFljZrEAMuo8-s0exSzwBscdBhJ3CuleEcR1JhCXZCY8MNiFer1aPdYOd2AmXcpu89hs8Q0ThE86P7-53QBFCsC9-9K_2LJxCO-SNt4MlZGtTOk9XQNHHiweNnAbgOeHZusNYvKqBqFqM80vlop3pfeP_NCNaWMZ299wLkKPWQw-V_BXyZHUp9X9dAr4Egm1y5ReQtFq_f6er9i9SWgynwQpVNF9DoMtFdvogK-7OhjWU9W3pubFy-PPx2rNCtvdWkvXB_-eQ"
              alt="AI UI"
              className="rounded-xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-[#060e20] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-8">

          {/* Heading */}
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-4">
              Precision Logic. Expert Evaluation.
            </h2>
            <p className="text-gray-400 text-lg">
              Harnessing the world's most advanced LLMs to redefine hiring.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* Card 1 - Large */}
            <div className="md:col-span-7 bg-[#0c1934]/80 backdrop-blur-xl rounded-xl p-8 border border-[#1f2a44] flex flex-col justify-between group hover:bg-[#12224a] transition relative overflow-hidden">

              <div>
                <div className="w-12 h-12 rounded-lg bg-blue-400/10 flex items-center justify-center mb-6 text-blue-400">
                  🧠
                </div>

                <h3 className="text-2xl font-bold text-white mb-4">
                  Llama 3.3 Powered
                </h3>

                <p className="text-gray-400 max-w-md">
                  Our core conversation engine enables deep technical discussions
                  that challenge candidates effectively.
                </p>
              </div>

              {/* Glow Effect */}
              <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-blue-400/10 blur-3xl opacity-20 group-hover:opacity-40 transition"></div>
            </div>

            {/* Card 2 */}
            <div className="md:col-span-5 bg-[#0c1934]/80 backdrop-blur-xl rounded-xl p-8 border border-[#1f2a44] flex flex-col hover:bg-[#12224a] transition">

              <div className="w-12 h-12 rounded-lg bg-purple-400/10 flex items-center justify-center mb-6 text-purple-400">
                📊
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                JD Coverage Logic
              </h3>

              <p className="text-gray-400">
                Automatically maps interview questions to your Job Description.
              </p>

              {/* Progress */}
              <div className="mt-auto pt-8">
                <div className="h-2 w-full bg-[#1a2747] rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 w-[85%]"></div>
                </div>
                <span className="text-xs text-purple-400 mt-2 block">
                  Skill alignment: 98.4%
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="md:col-span-5 bg-[#0c1934]/80 backdrop-blur-xl rounded-xl p-8 border border-[#1f2a44] hover:bg-[#12224a] transition">

              <div className="w-12 h-12 rounded-lg bg-indigo-400/10 flex items-center justify-center mb-6 text-indigo-400">
                ✔️
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                Gemini Evaluation
              </h3>

              <p className="text-gray-400">
                Multi-model scoring using Gemini for objective evaluation.
              </p>
            </div>

            {/* Card 4 */}
            <div className="md:col-span-7 bg-[#0c1934]/80 backdrop-blur-xl rounded-xl p-8 border border-[#1f2a44] flex items-center justify-between hover:bg-[#12224a] transition">

              <div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  Low-Latency Voice
                </h3>

                <p className="text-gray-400 max-w-sm">
                  Experience human-like response times under 500ms.
                </p>
              </div>

              {/* Wave Animation */}
              <div className="flex items-end gap-1 h-12">
                <div className="w-1 bg-blue-400 h-4 rounded"></div>
                <div className="w-1 bg-blue-400 h-8 rounded"></div>
                <div className="w-1 bg-blue-400 h-12 rounded"></div>
                <div className="w-1 bg-blue-400 h-6 rounded"></div>
                <div className="w-1 bg-blue-400 h-10 rounded"></div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 px-8 bg-[#081329]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold text-blue-400">95%</h3>
            <p className="text-gray-400">Reduction in Screening Time</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-purple-400">4.8/5</h3>
            <p className="text-gray-400">Candidate Experience</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-indigo-400">120+</h3>
            <p className="text-gray-400">Tech Stacks Covered</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-8 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to evolve your hiring?
        </h2>
        <p className="text-gray-400 mb-8">
          Join companies using AI to build better teams.
        </p>

        <div className="flex justify-center gap-4">
          <button className="px-8 py-4 bg-blue-400 text-black rounded-full font-bold">
            Start Free Trial
          </button>
          <button className="px-8 py-4 border border-gray-500 rounded-full">
            Contact Sales
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 text-center text-gray-500 text-sm">
        © 2024 Luminescent Logic AI. All rights reserved.
      </footer>
    </div>
  );
}
