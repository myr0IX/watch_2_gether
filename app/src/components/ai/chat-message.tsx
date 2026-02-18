"use client";

import { motion } from "motion/react";
import { AnimatedTextBlock } from "./animated-text-block";
import { MovieCardList } from "./movie-card-list";
import { movieCardSchema } from "@/schemas/movie-card";
import type { ToolResult } from "@/schemas/message";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  tools?: ToolResult[];
}

export function ChatMessage({ role, content, tools }: ChatMessageProps) {
  const isUser = role === "user";

  const movieCards =
    tools
      ?.filter((t) => t.name === "movies_card")
      .map((t) => {
        return movieCardSchema.parse(t.data);
      }) || [];

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
        className="max-w-[80%] space-y-3"
        style={{
          color: isUser ? "var(--fallout-charcoal)" : "var(--fallout-brown)",
        }}
      >
        {content && (
          <AnimatedTextBlock
            content={content}
            isUser={isUser}
            isAssistant={!isUser}
          />
        )}

        {movieCards.length > 0 && <MovieCardList cards={movieCards} />}
      </div>
    </motion.div>
  );
}
