"use client";

import { useState } from "react";
import { Upload, FileText, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [jdText, setJdText] = useState("");
    const [loading, setLoading] = useState(false);
    const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
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
        } catch (error) {
            console.error("Error uploading JD:", error);
            alert("Failed to process JD. Make sure the backend is running.");
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

                        {extractedSkills.length > 0 && (
                            <div className="glass p-6 rounded-2xl border-primary/20 bg-primary/5">
                                <p className="text-sm text-primary-foreground mb-4">JD analysis complete! You can now send the link to candidates.</p>
                                <div className="flex gap-2">
                                    <input
                                        readOnly
                                        value="http://localhost:3000/interview/sample-session"
                                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono"
                                    />
                                    <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all">
                                        Copy Link
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
