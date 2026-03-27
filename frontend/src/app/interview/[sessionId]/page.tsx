"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Send, MessageSquare, User, Bot, Sparkles, Trophy } from "lucide-react";
import axios from "axios";
import { useParams, useSearchParams, useRouter } from "next/navigation";


export default function InterviewPage() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { sessionId } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [role, setRole] = useState<string | null>(null);
    const [candidateName, setCandidateName] = useState("Candidate");

    const [coverage, setCoverage] = useState(0);
    const [timer, setTimer] = useState(60); // 60 seconds per question
    const timerRef = useRef<any>(null);


    // --- Inactivity Timer ---
    useEffect(() => {
        // Reset timer only when a new AI message arrives (messages.length changes)
        setTimer(60);
    }, [messages.length]);

    useEffect(() => {
        let interval: any = null;

        // Timer runs as long as:
        // 1. AI is not speaking/loading
        // 2. The last message is from the assistant (it's the candidate's turn)
        // 3. We haven't hit zero yet
        const isAssistantTurn = messages.length > 0 && messages[messages.length - 1].role === "assistant";

        if (!isSpeaking && !loading && isAssistantTurn && timer > 0) {
            interval = setInterval(() => {
                if (isProcessingRef.current) return; // Don't tick if we are already sending something

                setTimer((prev) => {
                    if (prev <= 1) {
                        handleSend("Skip this question due to inactivity.");
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => { if (interval) clearInterval(interval); };
    }, [isSpeaking, loading, messages.length, timer]);

    // --- Web Speech API (TTS) ---
    const speak = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Safety timeout to clear isSpeaking if onend doesn't fire
        const estimatedDuration = (text.length / 15) * 1000 + 2000; // ~15 chars per second plus buffer
        const safetyTimeout = setTimeout(() => {
            if (isSpeaking) {
                console.log("Speech safety timeout triggered.");
                setIsSpeaking(false);
                setIsListening(true);
                recognition?.start();
            }
        }, estimatedDuration);

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            clearTimeout(safetyTimeout);
            setIsSpeaking(false);
            // Auto-start listening after AI finishes speaking
            setTimeout(() => {
                setIsListening(true);
                recognition?.start();
            }, 500);
        };

        utterance.onerror = () => {
            clearTimeout(safetyTimeout);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    };

    // --- Web Speech API (STT) ---
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
            // @ts-ignore
            const rec = new webkitSpeechRecognition();
            rec.continuous = false;
            rec.interimResults = false;
            rec.lang = "en-US";

            rec.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
                // Auto-send after voice recognition
                setTimeout(() => handleSend(transcript), 500);
            };

            rec.onerror = () => setIsListening(false);
            rec.onend = () => setIsListening(false);
            setRecognition(rec);
        }
    }, [sessionId]);

    const toggleListening = () => {
        if (isListening) {
            recognition?.stop();
        } else {
            setIsListening(true);
            recognition?.start();
        }
    };

    const isProcessingRef = useRef(false);

    const handleSend = async (voiceInput?: string) => {
        const textToSend = voiceInput || input;
        if (!textToSend.trim() || loading || isProcessingRef.current) return;

        isProcessingRef.current = true;
        const userMsg = { role: "user", content: textToSend };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/v1/sessions/chat", {
                session_id: sessionId,
                role: "user",
                content: textToSend,
            });

            const { next_question, coverage_percentage } = response.data;
            const aiMsg = { role: "assistant", content: next_question };
            setMessages((prev) => [...prev, aiMsg]);
            setCoverage(coverage_percentage);
            speak(next_question);
        } catch (error) {
            console.error("Chat error:", error);
        } finally {
            setLoading(false);
            isProcessingRef.current = false;
        }
    };

    useEffect(() => {
        // Load existing status and history or start new interview
        if (sessionId) {
            const initSession = async () => {
                try {
                    // 0. Validate Token if present
                    let currentRole = "candidate";
                    if (token) {
                        try {
                            const valRes = await axios.get(`http://127.0.0.1:8000/api/v1/sessions/validate-token?token=${token}`);
                            currentRole = valRes.data.role;
                            setRole(currentRole);
                            setCandidateName(valRes.data.candidate_name);
                        } catch (err) {
                            console.error("Token validation failed:", err);
                            alert("Invalid or expired access token.");
                            // router.push("/login"); // Optional redirect
                            return;
                        }
                    } else {
                        // If no token, we might want to restrict access or assume public for now
                        // For this task, let's assume token is required for private sessions
                        setRole("candidate");
                    }

                    // 1. Check for existing messages
                    const historyRes = await axios.get(`http://127.0.0.1:8000/api/v1/sessions/${sessionId}/messages`);

                    if (historyRes.data.length > 0) {
                        setMessages(historyRes.data.map((m: any) => ({ role: m.role, content: m.content })));
                        // Also fetch session metadata for coverage
                        const sessionRes = await axios.get(`http://127.0.0.1:8000/api/v1/sessions/${sessionId}`);
                        // Calculate coverage from checklist_state
                        const checklist = sessionRes.data.checklist_state;
                        const total = Object.keys(checklist).length;
                        const covered = Object.values(checklist).filter(v => v).length;
                        setCoverage(Math.round((covered / total) * 100));
                    } else if (currentRole === "candidate") {
                        // 2. Start new interview if no history AND is candidate
                        const response = await axios.post("http://127.0.0.1:8000/api/v1/sessions/chat", {
                            session_id: sessionId,
                            role: "user",
                            content: "Hello, let's start the interview.",
                        });
                        const { next_question, coverage_percentage } = response.data;
                        const aiMsg = { role: "assistant", content: next_question };
                        setMessages([aiMsg]);
                        setCoverage(coverage_percentage);
                        speak(next_question);
                    }
                } catch (e) {
                    console.error("Session init error:", e);
                }
            };
            initSession();
        }
    }, [sessionId, token]);


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSkip = () => {
        handleSend("I would like to skip this question and move to the next topic.");
    };

    const handleFinish = async () => {
        if (!window.confirm("Are you sure you want to end the interview and generate your report?")) return;
        setLoading(true);
        try {
            // Trigger evaluation on the backend
            await axios.post(`http://127.0.0.1:8000/api/v1/sessions/${sessionId}/evaluate`);
            // Redirect to results page
            window.location.href = `/interview/${sessionId}/results`;
        } catch (error) {
            console.error("Evaluation error:", error);
            alert("Failed to generate evaluation. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#09090b]">
            <div className="w-full max-w-5xl h-[85vh] glass rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-indigo-500/10">

                {/* Left Side: Progress & Info */}
                <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Bot size={24} className="text-white" />
                            </div>
                            <h1 className="font-bold text-lg tracking-tight">AI Interviewer</h1>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Interview Progress</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-medium">
                                    <span>Coverage</span>
                                    <span className="text-indigo-400">{coverage}%</span>
                                </div>
                                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                                        style={{ width: `${coverage}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                                <Sparkles size={16} className="text-indigo-400" />
                                Timer
                            </h4>
                            <p className="text-2xl font-bold text-indigo-400">
                                {timer}s
                            </p>
                            <p className="text-[10px] text-zinc-500 uppercase mt-1">Remaining to answer</p>
                        </div>

                        <button
                            onClick={handleSkip}
                            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-white/5"
                        >
                            <Send size={14} className="rotate-45" />
                            Next Question
                        </button>

                        <button
                            onClick={handleFinish}
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                            <Trophy size={14} />
                            Finish Interview
                        </button>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-2xl border border-white/5">
                        <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center">
                            <User size={16} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold">{candidateName}</p>
                            <p className="text-[10px] text-zinc-500">{role === 'observer' ? 'Viewing as Observer' : 'Live Interview'}</p>
                        </div>
                    </div>

                </aside>

                {/* Right Side: Chat Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    <header className="p-6 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-sm font-semibold flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-indigo-500 animate-pulse' : 'bg-red-500 animate-pulse'}`} />
                            Audio Status: {isSpeaking ? "AI is speaking..." : isListening ? "Listening..." : "Waiting..."}
                        </h2>
                        <div className="flex gap-2">
                            <div className="px-3 py-1 bg-zinc-800/50 rounded-full text-[10px] font-medium text-zinc-400">EN-US</div>
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                                <MessageSquare size={48} />
                                <div>
                                    <p className="text-lg font-medium">Ready to start?</p>
                                    <p className="text-sm">Say "Hello" or type a greeting to begin your interview.</p>
                                </div>
                            </div>
                        )}
                        {messages.map((ms, i) => (
                            <div key={i} className={`flex ${ms.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${ms.role === "user"
                                    ? "bg-indigo-600 text-white rounded-tr-none"
                                    : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5"
                                    }`}>
                                    {ms.content}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    <footer className="p-6 border-t border-white/5 bg-zinc-900/20">
                        {role === 'observer' ? (
                            <div className="p-4 bg-zinc-800/50 rounded-2xl text-center text-xs text-zinc-400 border border-white/5">
                                You are in read-only observer mode.
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-2 rounded-2xl focus-within:border-indigo-500/50 transition-all">
                                <button
                                    onClick={toggleListening}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "hover:bg-zinc-800 text-zinc-500"
                                        }`}
                                >
                                    {isListening ? <Mic size={20} /> : <MicOff size={20} />}
                                </button>
                                <input
                                    className="flex-1 bg-transparent border-none outline-none text-sm py-2"
                                    placeholder="Type your response here..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || loading}
                                    className="w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white flex items-center justify-center rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        )}
                    </footer>

                </main>
            </div>
        </div>
    );
}
