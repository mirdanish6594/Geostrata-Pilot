"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Globe, Loader2, Sparkles, User } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { Typewriter } from "@/components/Typewriter";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Welcome to **Geostrata AI**. \n\nI have access to the latest research on global affairs, national security, and foreign policy. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // DYNAMIC URL: Uses standard variable for cloud, falls back to localhost for dev
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      
      const response = await axios.post(`${apiUrl}/chat`, {
        question: userMessage,
      });

      setMessages((prev) => [
        ...prev,
        { role: "bot", text: response.data.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "I encountered an error connecting to the Geostrata archives. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* 1. Header (Frosted Glass Effect) */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
            <div className="bg-blue-900 p-2 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-900">THE GEOSTRATA</h1>
                <p className="text-xs text-slate-500 font-medium tracking-wider">INTELLIGENCE PILOT</p>
            </div>
        </div>
      </header>

      {/* 2. Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
                {messages.map((msg, idx) => {
                    const isBot = msg.role === "bot";
                    const isLast = idx === messages.length - 1;

                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={cn(
                                "flex gap-4",
                                isBot ? "justify-start" : "justify-end"
                            )}
                        >
                            {/* Bot Icon */}
                            {isBot && (
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center border border-red-200 shrink-0">
                                    <Sparkles className="w-4 h-4 text-red-600" />
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div className={cn(
                                "max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm text-sm leading-7",
                                isBot 
                                    ? "bg-white border border-slate-200 text-slate-800" 
                                    : "bg-blue-600 text-white"
                            )}>
                                {isBot ? (
                                    isLast ? (
                                        <Typewriter text={msg.text} speed={8} />
                                    ) : (
                                        <div className="prose prose-sm max-w-none text-slate-800">
                                            <ReactMarkdown
                                                components={{
                                                    a: ({ node, ...props }) => (
                                                        <a {...props} className="text-blue-600 font-medium hover:underline" target="_blank" rel="noopener noreferrer" />
                                                    ),
                                                    p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
                                                    ul: ({ node, ...props }) => <ul {...props} className="list-disc ml-4 mb-2" />,
                                                    li: ({ node, ...props }) => <li {...props} className="mb-1" />,
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    )
                                ) : (
                                    <div className="whitespace-pre-wrap">{msg.text}</div>
                                )}
                            </div>

                            {/* User Icon */}
                            {!isBot && (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200 shrink-0">
                                    <User className="w-4 h-4 text-blue-600" />
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Loading Indicator */}
            {isLoading && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-full text-xs text-slate-400">
                        Analyzing archives...
                    </div>
                </motion.div>
            )}
        </div>
      </div>

      {/* 3. Input Area (Floating Style) */}
      <div className="p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200">
        <div className="max-w-3xl mx-auto relative">
          <input
            type="text"
            className="w-full p-4 pr-16 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-sm"
            placeholder="Ask about Indian Foreign Policy, The Arctic, etc..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-3 uppercase tracking-widest opacity-60">
            Powered by The Geostrata Intelligence
        </p>
      </div>
    </div>
  );
}