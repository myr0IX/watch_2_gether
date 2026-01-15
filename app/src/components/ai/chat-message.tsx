"use client";

import { motion } from "motion/react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        width: "100%",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        className="max-w-[80%] rounded-sm px-4 py-3"
        style={{
          backgroundColor: isUser ? "var(--fallout-yellow)" : undefined,
          color: isUser ? "var(--fallout-charcoal)" : "var(--fallout-brown)",
          border: "3px solid var(--fallout-brass)",
          boxShadow:
            "0 4px 0px var(--fallout-brass), 0 6px 15px var(--fallout-shadow)",
        }}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </motion.div>
  );
}
