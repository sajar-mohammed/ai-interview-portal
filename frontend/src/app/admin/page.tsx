"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, ChevronRight, CheckCircle, Loader2, Plus, Users, BarChart3, Link as LinkIcon, Copy } from "lucide-react";
import { interviewService, sessionService } from "@/services/api";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const [interviews, setInterviews] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [view, setView] = useState<"list" | "create">("list");

    // Create form state
    const [jdText, setJdText] = useState("");
    const [roleTitle, setRoleTitle] = useState("");
    const [createStep, setCreateStep] = useState<"form" | "skills">("form");
    const [editableSkills, setEditableSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState("");

    // Selected JD state
    const [selectedInterview, setSelectedInterview] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);

    // Session creation state
    const [candidateName, setCandidateName] = useState("");
    const [newLinks, setNewLinks] = useState<{ candidate: string, observer: string } | null>(null);

    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchInterviews();
    }, []);

    useEffect(() => {
        if (selectedId) {
            fetchInterviewDetails(selectedId);
        }
    }, [selectedId]);

    const fetchInterviews = async () => {
        setLoading(true);
        try {
            const res = await interviewService.list();
            setInterviews(res.data);
            if (res.data.length > 0 && !selectedId) {
                setSelectedId(res.data[0].id);
            }
        } catch (error) {
            console.error("Error fetching interviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInterviewDetails = async (id: string) => {
        setLoading(true);
        try {
            const [intRes, sesRes] = await Promise.all([
                interviewService.get(id),
                sessionService.listByInterview(id)
            ]);
            setSelectedInterview(intRes.data);
            setSessions(sesRes.data);
            setNewLinks(null);
            setCandidateName("");
        } catch (error) {
            console.error("Error fetching details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeJD = async () => {
        if (!jdText || !roleTitle) return;
        setAnalyzing(true);
        try {
            const res = await interviewService.extractSkills(jdText);
            setEditableSkills(res.data.skills);
            setCreateStep("skills");
        } catch (error) {
            console.error("Error analyzing JD:", error);
            alert("Failed to analyze JD. Please try again.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleFinalizeJD = async () => {
        setLoading(true);
        try {
            const res = await interviewService.create({
                jd_text: jdText,
                role_title: roleTitle,
                jd_skills: editableSkills
            });
            setInterviews([res.data, ...interviews]);
            setSelectedId(res.data.id);
            setView("list");
            setCreateStep("form");
            setJdText("");
            setRoleTitle("");
            setEditableSkills([]);
        } catch (error) {
            console.error("Error creating JD:", error);
            alert("Failed to create JD.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddSkill = () => {
        if (!newSkill.trim()) return;
        if (!editableSkills.includes(newSkill.trim())) {
            setEditableSkills([...editableSkills, newSkill.trim()]);
        }
        setNewSkill("");
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setEditableSkills(editableSkills.filter(s => s !== skillToRemove));
    };

    const handleGenerateSession = async () => {
        if (!selectedId || !candidateName) return;
        setLoading(true);
        try {
            const res = await sessionService.start({
                interview_id: selectedId,
                candidate_name: candidateName,
            });
            setNewLinks({
                candidate: res.data.candidate_link,
                observer: res.data.observer_link
            });
            fetchInterviewDetails(selectedId); // Refresh list
        } catch (error) {
            console.error("Error generating session:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex">
            {/* Sidebar: Positions */}
            <aside className="w-80 border-r border-zinc-800 flex flex-col bg-[#0c0c0e]">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-bold gradient-text">Recruiter Portal</h2>
                </div>

                <div className="p-4">
                    <button
                        onClick={() => setView("create")}
                        className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 py-2 rounded-lg text-sm transition-all"
                    >
                        <Plus size={16} />
                        New Position
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 px-2 mb-2">Active Positions</p>
                    {interviews.map((int) => (
                        <button
                            key={int.id}
                            onClick={() => { setSelectedId(int.id); setView("list"); }}
                            className={`w-full text-left p-3 rounded-xl text-sm transition-all flex items-center gap-3 ${selectedId === int.id && view === "list"
                                ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-400"
                                : "hover:bg-zinc-900 border border-transparent text-zinc-400"
                                }`}
                        >
                            <FileText size={16} />
                            <span className="truncate italic font-medium">{int.role_title}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto p-8">
                    {view === "create" ? (
                        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header>
                                <h1 className="text-3xl font-bold">Launch New Position</h1>
                                <p className="text-zinc-400 mt-2">
                                    {createStep === "form"
                                        ? "Upload a job description and let AI prepare the interview."
                                        : "Review and refine the core technical skills extracted from the JD."}
                                </p>
                            </header>

                            {createStep === "form" ? (
                                <div className="glass p-8 rounded-3xl space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Position Name</label>
                                        <input
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="e.g. Senior Frontend Engineer"
                                            value={roleTitle}
                                            onChange={(e) => setRoleTitle(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-zinc-300">Job Description</label>
                                        <textarea
                                            className="w-full h-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                            placeholder="Paste the full job requirements here..."
                                            value={jdText}
                                            onChange={(e) => setJdText(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        onClick={handleAnalyzeJD}
                                        disabled={analyzing || !jdText || !roleTitle}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20"
                                    >
                                        {analyzing ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                                        Analyze Job Description
                                    </button>
                                </div>
                            ) : (
                                <div className="glass p-8 rounded-3xl space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-medium text-zinc-300">Extracted Skills ({editableSkills.length})</label>
                                            <p className="text-[10px] text-zinc-500 italic">Recruiters can add or remove skills below</p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 p-4 bg-black/40 rounded-2xl border border-white/5 min-h-[100px] align-start content-start">
                                            {editableSkills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/30 text-indigo-300 rounded-lg text-xs font-medium flex items-center gap-2 group animate-in zoom-in-95"
                                                >
                                                    {skill}
                                                    <button
                                                        onClick={() => handleRemoveSkill(skill)}
                                                        className="hover:text-white transition-colors"
                                                    >
                                                        <Plus size={14} className="rotate-45" />
                                                    </button>
                                                </span>
                                            ))}
                                            {editableSkills.length === 0 && (
                                                <p className="text-zinc-600 text-xs italic mx-auto self-center">No skills added. Add some below.</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                                placeholder="Add a missing skill (e.g. Redis)..."
                                                value={newSkill}
                                                onChange={(e) => setNewSkill(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                            />
                                            <button
                                                onClick={handleAddSkill}
                                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all border border-white/5"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setCreateStep("form")}
                                            className="flex-1 bg-zinc-900 hover:bg-zinc-800 py-4 rounded-2xl font-bold text-zinc-400 transition-all border border-zinc-800"
                                        >
                                            Back to JD
                                        </button>
                                        <button
                                            onClick={handleFinalizeJD}
                                            disabled={loading || editableSkills.length === 0}
                                            className="flex-[2] bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xl shadow-indigo-600/20"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                                            Launch Position
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : selectedInterview ? (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <header className="flex justify-between items-end border-b border-zinc-800 pb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-indigo-600/10 text-indigo-400 text-[10px] font-bold rounded uppercase tracking-wider border border-indigo-500/20">Active Position</span>
                                        <span className="text-zinc-600 text-sm">• {new Date(selectedInterview.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <h1 className="text-4xl font-bold">{selectedInterview.role_title}</h1>
                                </div>
                                <div className="flex gap-4">
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-500 uppercase font-bold">Total Candidates</p>
                                        <p className="text-2xl font-bold">{sessions.length}</p>
                                    </div>
                                </div>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Col: Candidate Links & JD Info */}
                                <div className="lg:col-span-1 space-y-6">
                                    <section className="glass p-6 rounded-2xl space-y-4">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <LinkIcon size={18} className="text-indigo-400" />
                                            Generate Invite
                                        </h3>
                                        <input
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm outline-none"
                                            placeholder="Candidate Full Name..."
                                            value={candidateName}
                                            onChange={(e) => setCandidateName(e.target.value)}
                                        />
                                        <button
                                            onClick={handleGenerateSession}
                                            disabled={loading || !candidateName}
                                            className="w-full bg-white text-black py-2 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all"
                                        >
                                            Generate Single-Use Link
                                        </button>

                                        {newLinks && (
                                            <div className="mt-4 p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl space-y-4 animate-in zoom-in-95">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-indigo-400 uppercase">Candidate URL</p>
                                                    <div className="flex gap-1">
                                                        <input readOnly value={newLinks.candidate} className="flex-1 bg-black/40 border border-white/5 rounded p-1 text-[8px] font-mono" />
                                                        <button onClick={() => navigator.clipboard.writeText(newLinks.candidate)} className="p-1 hover:bg-white/10 rounded"><Copy size={12} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    <section className="glass p-6 rounded-2xl">
                                        <h3 className="font-bold mb-4 flex items-center gap-2">
                                            <BarChart3 size={18} className="text-indigo-400" />
                                            Key JD Skills
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedInterview.jd_skills.map((skill: string, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-zinc-400">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                {/* Right Col: Candidate Results Table */}
                                <div className="lg:col-span-2">
                                    <section className="glass rounded-2xl overflow-hidden min-h-[500px]">
                                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                                            <h3 className="font-bold flex items-center gap-2">
                                                <Users size={18} className="text-indigo-400" />
                                                Candidate Pool
                                            </h3>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="text-xs uppercase text-zinc-500 border-b border-zinc-800">
                                                        <th className="px-6 py-4 font-bold">Candidate</th>
                                                        <th className="px-6 py-4 font-bold">Status</th>
                                                        <th className="px-6 py-4 font-bold">Score</th>
                                                        <th className="px-6 py-4 font-bold">Recommendation</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-800/50">
                                                    {sessions.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="px-6 py-20 text-center text-zinc-600 italic">
                                                                No candidates have applied or were invited yet.
                                                            </td>
                                                        </tr>
                                                    ) : sessions.map((s) => (
                                                        <tr key={s.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => s.evaluation && router.push(`/interview/${s.id}/results`)}>
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-white group-hover:text-indigo-400 transition-colors uppercase italic">{s.candidate_name}</p>
                                                                <p className="text-[10px] text-zinc-500 font-mono mt-1">{s.id.split('-')[0]}...</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {s.ended_at ? (
                                                                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] rounded uppercase font-bold border border-emerald-500/20 italic">Completed</span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] rounded uppercase font-bold border border-amber-500/20 italic">In progress</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {s.evaluation ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-xs">
                                                                            {Object.values(s.evaluation.scores as Record<string, number>).reduce((a, b) => a + b, 0) / Object.keys(s.evaluation.scores).length || 0}
                                                                        </div>
                                                                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Avg Score</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-zinc-600 italic text-xs">N/A</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {s.evaluation?.overall_recommendation ? (
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase italic ${s.evaluation.overall_recommendation === 'Hire' ? 'bg-emerald-500 text-black' :
                                                                        s.evaluation.overall_recommendation === 'Maybe' ? 'bg-amber-400 text-black' :
                                                                            'bg-rose-500 text-white'
                                                                        }`}>
                                                                        {s.evaluation.overall_recommendation}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-zinc-600 italic text-xs">Awaiting...</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
                                <Users size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Welcome to Recruiter Portal</h2>
                                <p className="text-zinc-500 text-sm max-w-sm mt-1">Select an active position from the sidebar to view candidate results or create a new job role.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
