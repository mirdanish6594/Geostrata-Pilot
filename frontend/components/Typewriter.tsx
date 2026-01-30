"use client";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

export const Typewriter = ({ text, speed = 10 }: { text: string; speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div className="prose prose-sm max-w-none text-slate-800">
      <ReactMarkdown
        components={{
          a: ({ node, ...props }) => (
            <a {...props} className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {displayedText}
      </ReactMarkdown>
    </div>
  );
};