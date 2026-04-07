"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { sessionService } from "@/services/api";
import { Trophy, CheckCircle2, AlertCircle, ArrowLeft, Star, Quote } from "lucide-react";

interface EvaluationData {
    scores: Record<string, number>;
    strengths: string[];
    weaknesses: string[];
    overall_recommendation: string;
    feedback_text: string;
}

export default function ResultsPage() {
    const { sessionId } = useParams() as { sessionId: string };
    const router = useRouter();
    const [evaluation, setEvaluation] = useState<EvaluationData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchEvaluation = useCallback(async () => {
        try {
            const response = await sessionService.triggerEvaluation(sessionId);
            setEvaluation(response.data);
        } catch (error) {
            console.error("Error fetching evaluation:", error);
        } finally {
            setLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        if (sessionId) fetchEvaluation();
    }, [sessionId, fetchEvaluation]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-400 animate-pulse">Analyzing your performance...</p>
                </div>
            </div>
        );
    }

    if (!evaluation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-white p-4">
                <div className="glass p-8 rounded-3xl max-w-md text-center space-y-4">
                    <AlertCircle size={48} className="text-red-500 mx-auto" />
                    <h1 className="text-xl font-bold">Report Not Found</h1>
                    <p className="text-zinc-400 text-sm">We couldn't retrieve your evaluation. Please ensure the interview was finished correctly.</p>
                    <button onClick={() => router.back()} className="px-6 py-2 bg-zinc-800 rounded-xl text-sm font-medium">Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-white p-4 md:p-8 flex justify-center overflow-y-auto">
            <div className="w-full max-w-4xl space-y-8 pb-12">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium">
                            <Trophy size={16} />
                            Assessment Complete
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Technical Evaluation Report</h1>
                        <p className="text-zinc-500 text-sm">Session ID: {sessionId}</p>
                    </div>
                    <div className={`px-6 py-3 rounded-2xl border text-lg font-bold flex items-center gap-3 ${evaluation.overall_recommendation === "Hire"
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : evaluation.overall_recommendation === "Maybe"
                            ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}>
                        <Star size={20} fill="currentColor" />
                        Recommendation: {evaluation.overall_recommendation}
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-6">
                        <section className="glass p-6 rounded-3xl space-y-6">
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Skill Mapping</h3>
                            <div className="space-y-4">
                                {Object.entries(evaluation.scores).map(([skill, score]) => (
                                    <div key={skill} className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span>{skill}</span>
                                            <span className="text-indigo-400">{score}/10</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${(score / 10) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="md:col-span-2 space-y-6">
                        <section className="glass p-8 rounded-3xl relative overflow-hidden">
                            <Quote size={80} className="absolute -top-4 -right-4 text-white/5" />
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Summary Feedback</h3>
                            <p className="text-zinc-300 leading-relaxed italic">
                                "{evaluation.feedback_text}"
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <section className="bg-green-500/5 border border-green-500/10 p-6 rounded-3xl space-y-4">
                                <h4 className="text-sm font-bold text-green-400 flex items-center gap-2">
                                    <CheckCircle2 size={18} />
                                    Key Strengths
                                </h4>
                                <ul className="space-y-3">
                                    {evaluation.strengths.map((s, i) => (
                                        <li key={i} className="text-xs text-zinc-400 flex gap-2">
                                            <span className="text-green-500/50 mt-0.5">•</span>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            <section className="bg-red-500/5 border border-red-500/10 p-6 rounded-3xl space-y-4">
                                <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
                                    <AlertCircle size={18} />
                                    Areas for Growth
                                </h4>
                                <ul className="space-y-3">
                                    {evaluation.weaknesses.map((w, i) => (
                                        <li key={i} className="text-xs text-zinc-400 flex gap-2">
                                            <span className="text-red-500/50 mt-0.5">•</span>
                                            {w}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </div>

                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-white/5"
                        >
                            <ArrowLeft size={16} />
                            Exit to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
