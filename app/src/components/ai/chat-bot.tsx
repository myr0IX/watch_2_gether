"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChatMessage } from "./chat-message";
import { SYSTEM_PROMPT } from "@/config/system-prompt";
import useAiIntro from "@/hook/ai/use-ai-intra";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatBotProps {
  initialMessages?: Message[];
  systemPrompt?: string;
}

export function ChatBot({
  initialMessages = [],
  systemPrompt = SYSTEM_PROMPT,
}: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: systemPrompt },
    ...initialMessages,
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const defaultMsg = useAiIntro();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessageIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error("Erreur réseau");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Pas de reader");
      }

      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[assistantMessageIndex] = {
            role: "assistant",
            content: accumulatedContent,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Erreur:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[assistantMessageIndex] = {
          role: "assistant",
          content: "Erreur lors de la génération de la réponse.",
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const displayMessages = messages.filter((m) => m.role !== "system") as Array<
    Message & { role: "user" | "assistant" }
  >;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: "var(--fallout-beige)",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col h-[80vh] max-w-4xl w-full rounded-sm overflow-hidden"
        style={{
          backgroundColor: "var(--fallout-cream)",
          border: "3px solid",
          borderColor: "var(--fallout-brass)",
          boxShadow:
            "0 4px 0px var(--fallout-brass), 0 8px 20px var(--fallout-shadow)",
        }}
      >
        {/* Header */}
        <div
          className="p-4 border-b"
          style={{
            borderColor: "var(--fallout-border)",
            backgroundColor: "var(--fallout-tan)",
          }}
        >
          <h2
            className="text-2xl font-bold"
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              color: "var(--fallout-charcoal)",
              letterSpacing: "0.1em",
              textShadow: "1px 1px 0px var(--fallout-yellow)",
            }}
          >
            Film Recommandations
          </h2>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{ backgroundColor: "var(--fallout-cream)" }}
        >
          <ChatMessage role={"assistant"} content={defaultMsg} />
          {displayMessages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          {isLoading && (
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "var(--fallout-brown)" }}
            >
              <div className="flex gap-1">
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "var(--fallout-green)",
                    animationDelay: "0s",
                  }}
                />
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "var(--fallout-green)",
                    animationDelay: "0.2s",
                  }}
                />
                <div
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: "var(--fallout-green)",
                    animationDelay: "0.4s",
                  }}
                />
              </div>
              <span>L'IA écrit...</span>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t"
          style={{
            borderColor: "var(--fallout-border)",
            backgroundColor: "var(--fallout-tan)",
          }}
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écris ton message..."
              className="flex-1 px-4 py-2 rounded-sm text-sm disabled:opacity-50"
              style={{
                backgroundColor: "var(--fallout-cream)",
                color: "var(--fallout-charcoal)",
                border: "2px solid var(--fallout-border)",
              }}
              disabled={isLoading}
            />
            <motion.button
              type="submit"
              disabled={isLoading || !input.trim()}
              whileHover={{
                scale: 1.02,
                backgroundColor: "var(--fallout-orange)",
                y: -2,
              }}
              whileTap={{ scale: 0.98, y: 1 }}
              className="px-6 py-2 font-bold rounded-sm text-sm disabled:opacity-50"
              style={{
                fontFamily: "Bebas Neue, sans-serif",
                backgroundColor: "var(--fallout-yellow)",
                color: "var(--fallout-charcoal)",
                border: "2px solid var(--fallout-brass)",
                boxShadow: "0 4px 0px var(--fallout-brass)",
              }}
            >
              Envoyer
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
