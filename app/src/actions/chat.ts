"use server";

import { getAIClient } from "@/config/mistral-ai-client";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function sendMessage(messages: Message[]): Promise<string> {
  const aiClient = await getAIClient();

  const response = await aiClient.chat.complete({
    model: "mistral-small-latest",
    messages: messages,
  });

  const content = response.choices?.[0]?.message?.content;

  if (!content) {
    return "Pas de réponse";
  }

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((chunk) => {
        if (typeof chunk === "string") return chunk;
        if (chunk && typeof chunk === "object" && "text" in chunk) {
          return (chunk as any).text;
        }
        return "";
      })
      .join("");
  }

  return "Pas de réponse";
}
