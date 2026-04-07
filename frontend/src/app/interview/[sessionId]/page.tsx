"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { sessionService } from "@/services/api";
import { useSpeech } from "@/hooks/useSpeech";
import { useTimer } from "@/hooks/useTimer";
import { InterviewSidebar } from "@/components/features/interview/InterviewSidebar";
import { ChatArea } from "@/components/features/interview/ChatArea";

export default function InterviewPage() {
    const { sessionId } = useParams() as { sessionId: string };
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");

    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [candidateName, setCandidateName] = useState("Candidate");
    const [coverage, setCoverage] = useState(0);

    const isProcessingRef = useRef(false);

    const handleSend = useCallback(async (voiceInput?: string) => {
        const textToSend = voiceInput || input;
        if (!textToSend.trim() || loading || isProcessingRef.current) return;

        isProcessingRef.current = true;
        const userMsg = { role: "user", content: textToSend };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await sessionService.sendMessage({
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
    }, [input, loading, sessionId]);

    const { isListening, isSpeaking, startListening, stopListening, speak } = useSpeech(handleSend);

    const { seconds: timer, reset: resetTimer, start: startTimer, stop: stopTimer } = useTimer(60, () => {
        handleSend("Skip this question due to inactivity.");
    });

    const toggleListening = () => {
        if (isListening) stopListening();
        else startListening();
    };

    // --- Inactivity Timer control ---
    useEffect(() => {
        const isAssistantTurn = messages.length > 0 && messages[messages.length - 1].role === "assistant";
        if (!isSpeaking && !loading && isAssistantTurn && timer > 0) {
            startTimer();
        } else {
            stopTimer();
        }
    }, [isSpeaking, loading, messages, timer, startTimer, stopTimer]);

    useEffect(() => {
        resetTimer();
    }, [messages.length, resetTimer]);

    useEffect(() => {
        if (sessionId) {
            const initSession = async () => {
                try {
                    let currentRole = "candidate";
                    if (token) {
                        try {
                            const valRes = await sessionService.validateToken(token);
                            currentRole = valRes.data.role;
                            setRole(currentRole);
                            setCandidateName(valRes.data.candidate_name);
                        } catch (err) {
                            console.error("Token validation failed:", err);
                            alert("Invalid or expired access token.");
                            return;
                        }
                    } else {
                        setRole("candidate");
                    }

                    const historyRes = await sessionService.getMessages(sessionId);

                    if (historyRes.data.length > 0) {
                        setMessages(historyRes.data.map((m: any) => ({ role: m.role, content: m.content })));
                        const sessionRes = await sessionService.getDetails(sessionId);
                        const checklist = sessionRes.data.checklist_state;
                        const total = Object.keys(checklist).length;
                        const covered = Object.values(checklist).filter(v => v).length;
                        setCoverage(Math.round((covered / total) * 100));
                    } else if (currentRole === "candidate") {
                        const response = await sessionService.sendMessage({
                            session_id: sessionId,
                            role: "user",
                            content: "Hello, let's start the interview.",
                        });
                        const { next_question, coverage_percentage } = response.data;
                        const aiMsg = { role: "assistant", content: next_question };
                        setMessages([aiMsg]);
                        setCoverage(coverage_percentage);
                        speak(aiMsg.content);
                    }
                } catch (e) {
                    console.error("Session init error:", e);
                }
            };
            initSession();
        }
    }, [sessionId, token, speak]);

    const handleSkip = () => {
        handleSend("I would like to skip this question and move to the next topic.");
    };

    const handleFinish = async () => {
        if (!window.confirm("Are you sure you want to end the interview and generate your report?")) return;
        setLoading(true);
        try {
            await sessionService.triggerEvaluation(sessionId);
            router.push(`/interview/${sessionId}/results`);
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
                <InterviewSidebar
                    coverage={coverage}
                    timer={timer}
                    candidateName={candidateName}
                    role={role}
                    loading={loading}
                    onSkip={handleSkip}
                    onFinish={handleFinish}
                />
                <ChatArea
                    messages={messages}
                    isSpeaking={isSpeaking}
                    isListening={isListening}
                    input={input}
                    loading={loading}
                    role={role}
                    setInput={setInput}
                    toggleListening={toggleListening}
                    handleSend={handleSend}
                />
            </div>
        </div>
    );
}
