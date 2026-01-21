"use client";

import { useAnimatedText } from "@/hook/chat/use-animated-text";

interface AnimatedTextBlockProps {
  content: string;
  isUser: boolean;
  isAssistant: boolean;
}

export function AnimatedTextBlock({
  content,
  isUser,
  isAssistant,
}: AnimatedTextBlockProps) {
  const displayedText = useAnimatedText(content, isAssistant);

  return (
    <div
      className="rounded-sm px-4 py-3"
      style={{
        backgroundColor: isUser ? "var(--fallout-yellow)" : undefined,
        color: isUser
          ? "var(--fallout-charcoal)"
          : "var(--fallout-brown)",
        border: "3px solid var(--fallout-brass)",
        boxShadow:
          "0 4px 0px var(--fallout-brass), 0 6px 15px var(--fallout-shadow)",
      }}
    >
      <p className="text-sm whitespace-pre-wrap">{displayedText}</p>
    </div>
  );
}
