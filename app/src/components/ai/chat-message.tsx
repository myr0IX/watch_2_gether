"use client";

import { motion } from "motion/react";
import { parseContent } from "@/utils/parse-content";
import { AnimatedTextBlock } from "./animated-text-block";
import { MovieCardList } from "./movie-card-list";
import type { MovieCardData } from "@/schemas/movie-card";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";
  const parts = parseContent(content);

  // Extraire les cartes de film
  const movieCards: MovieCardData[] = parts
    .filter((p) => typeof p !== "string" && p.type === "movie_card")
    .map((p) => (typeof p !== "string" ? p.data : null))
    .filter((p): p is MovieCardData => p !== null);

  // Extraire les textes
  const textParts = parts.filter((p) => typeof p === "string");

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
          color: isUser
            ? "var(--fallout-charcoal)"
            : "var(--fallout-brown)",
        }}
      >
        {/* Afficher les textes */}
        {textParts.map((text, index) => (
          <AnimatedTextBlock
            key={index}
            content={text}
            isUser={isUser}
            isAssistant={isAssistant}
          />
        ))}

        {/* Afficher les cartes de film */}
        {movieCards.length > 0 && (
          <MovieCardList cards={movieCards} />
        )}
      </div>
    </motion.div>
  );
}
