import { MessageSquare, Mic, MicOff, Send } from "lucide-react";
import { useRef, useEffect } from "react";

interface Message {
    role: string;
    content: string;
}

interface ChatAreaProps {
    messages: Message[];
    isSpeaking: boolean;
    isListening: boolean;
    input: string;
    loading: boolean;
    role: string | null;
    setInput: (val: string) => void;
    toggleListening: () => void;
    handleSend: (voiceInput?: string) => void;
}

export const ChatArea = ({
    messages,
    isSpeaking,
    isListening,
    input,
    loading,
    role,
    setInput,
    toggleListening,
    handleSend
}: ChatAreaProps) => {
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
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
    );
};
