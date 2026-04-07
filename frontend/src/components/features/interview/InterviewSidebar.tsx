import { Bot, Sparkles, Send, Trophy, User } from "lucide-react";

interface InterviewSidebarProps {
    coverage: number;
    timer: number;
    candidateName: string;
    role: string | null;
    loading: boolean;
    onSkip: () => void;
    onFinish: () => void;
}

export const InterviewSidebar = ({
    coverage,
    timer,
    candidateName,
    role,
    loading,
    onSkip,
    onFinish
}: InterviewSidebarProps) => {
    return (
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
                    onClick={onSkip}
                    className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-white/5"
                >
                    <Send size={14} className="rotate-45" />
                    Next Question
                </button>

                <button
                    onClick={onFinish}
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
    );
};
