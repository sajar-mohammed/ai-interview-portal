"use client";

import { useState } from "react";
import { Upload, FileText, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Login } from "./_components/login";
import { Signup } from "./_components/signup";
import { Dashboard } from "./_components/dashboard";

export default function AdminDashboard() {
    const [jdText, setJdText] = useState("");
    const [loading, setLoading] = useState(false);
    const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
    const [interviewId, setInterviewId] = useState<string | null>(null);
    const [candidateName, setCandidateName] = useState("");
    const [links, setLinks] = useState<{ candidate: string, observer: string } | null>(null);
    const router = useRouter();


    const handleUpload = async () => {
        if (!jdText) return;
        setLoading(true);
        try {
            // Calling our FastAPI backend
            const response = await axios.post("http://127.0.0.1:8000/api/v1/interviews/", {
                jd_text: jdText,
            });
            setExtractedSkills(response.data.jd_skills);
            setInterviewId(response.data.id);

        } catch (error) {
            console.error("Error uploading JD:", error);
            alert("Failed to process JD. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSession = async () => {
        if (!interviewId || !candidateName) return;
        setLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:8000/api/v1/sessions/", {
                interview_id: interviewId,
                candidate_name: candidateName,
            });
            setLinks({
                candidate: response.data.candidate_link,
                observer: response.data.observer_link
            });
        } catch (error) {
            console.error("Error generating session:", error);
            alert("Failed to create session.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen p-8 bg-[#09090b] text-[#fafafa]">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight gradient-text">Recruiter Dashboard</h1>
                        <p className="text-muted-foreground mt-2">Upload a Job Description to start a new AI interview session.</p>
                    </div>
                </header>
                <Login />
                <Signup />
                <Dashboard />

                <main className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Input */}
                    <section className="glass p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-2 text-primary font-medium">
                            <FileText size={20} />
                            <span>Job Description</span>
                        </div>
                        <textarea
                            className="w-full h-64 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Paste the full job description here..."
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                        />
                        <button
                            onClick={handleUpload}
                            disabled={loading || !jdText}
                            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Processing with AI...
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    Extract Skills & Start
                                </>
                            )}
                        </button>
                    </section>

                    {/* Right: Preview & Actions */}
                    <section className="space-y-6">
                        <div className="glass p-6 rounded-2xl min-h-[300px] flex flex-col">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle size={20} className="text-secondary" />
                                JD Coverage Checklist
                            </h3>
                            {extractedSkills.length > 0 ? (
                                <div className="flex-1 space-y-2">
                                    {extractedSkills.map((skill, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/50">
                                            <div className="w-2 h-2 rounded-full bg-secondary" />
                                            <span className="text-sm font-medium">{skill}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 italic text-sm">
                                    <p>Skills will appear here after analysis.</p>
                                </div>
                            )}
                        </div>

                        {interviewId && !links && (
                            <div className="glass p-6 rounded-2xl border-indigo-500/20 bg-indigo-500/5 space-y-4">
                                <h4 className="text-sm font-semibold">Generate Private Session</h4>
                                <input
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Enter Candidate Name..."
                                    value={candidateName}
                                    onChange={(e) => setCandidateName(e.target.value)}
                                />
                                <button
                                    onClick={handleGenerateSession}
                                    disabled={loading || !candidateName}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-xl text-sm transition-all"
                                >
                                    Create Session & Get Links
                                </button>
                            </div>
                        )}

                        {links && (
                            <div className="glass p-6 rounded-2xl border-indigo-500/20 bg-indigo-500/5 space-y-6">
                                <div className="space-y-3">
                                    <p className="text-xs font-bold uppercase text-indigo-400">Candidate Link (Single Use)</p>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            value={links.candidate}
                                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono"
                                        />
                                        <button
                                            onClick={() => navigator.clipboard.writeText(links.candidate)}
                                            className="bg-white text-black px-3 py-1 rounded-lg text-xs font-bold hover:bg-white/90"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-bold uppercase text-indigo-400">Observer Link (Read Only)</p>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            value={links.observer}
                                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono"
                                        />
                                        <button
                                            onClick={() => navigator.clipboard.writeText(links.observer)}
                                            className="bg-white text-black px-3 py-1 rounded-lg text-xs font-bold hover:bg-white/90"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </section>
                </main>
            </div>
        </div>
    );
}
