import { useState, useEffect, useCallback } from "react";

export const useSpeech = (onResult: (transcript: string) => void) => {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
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
                setIsListening(false);
                onResult(transcript);
            };

            rec.onerror = () => setIsListening(false);
            rec.onend = () => setIsListening(false);
            setRecognition(rec);
        }
    }, [onResult]);

    const startListening = useCallback(() => {
        if (recognition && !isListening) {
            try {
                recognition.start();
                setIsListening(true);
            } catch (e) {
                console.error("Speech recognition start error:", e);
            }
        }
    }, [recognition, isListening]);

    const stopListening = useCallback(() => {
        if (recognition && isListening) {
            recognition.stop();
            setIsListening(false);
        }
    }, [recognition, isListening]);

    const speak = useCallback((text: string) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        const estimatedDuration = (text.length / 15) * 1000 + 2000;
        const safetyTimeout = setTimeout(() => {
            if (isSpeaking) {
                setIsSpeaking(false);
                startListening();
            }
        }, estimatedDuration);

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            clearTimeout(safetyTimeout);
            setIsSpeaking(false);
            setTimeout(startListening, 500);
        };

        utterance.onerror = () => {
            clearTimeout(safetyTimeout);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    }, [isSpeaking, startListening]);

    return {
        isListening,
        isSpeaking,
        startListening,
        stopListening,
        speak
    };
};
