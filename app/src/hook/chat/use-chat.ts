import { useState, useRef } from "react";
import { streamChunkSchema } from "@/schemas/stream-chunk";
import type { Message, ToolResult } from "@/schemas/message";

export type { Message, ToolResult } from "@/schemas/message";

interface UseChatOptions {
  systemPrompt?: string;
}

interface UseChatReturn {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  displayMessages: Array<Message & { role: "user" | "assistant" }>;
}

export function useChat({ systemPrompt = "" }: UseChatOptions = {}): UseChatReturn {
  const [displayMessages, setDisplayMessages] = useState<Array<Message & { role: "user" | "assistant" }>>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef<string | null>(null);

  const createAssistantMessage = () => {
    setDisplayMessages((prev) => [...prev, { role: "assistant", content: "", tools: [] }]);
  };

  const appendTextToAssistantMessage = (text: string) => {
    setDisplayMessages((prev) => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
        newMessages[lastIndex] = {
          ...newMessages[lastIndex],
          content: newMessages[lastIndex].content + text,
        };
      }
      return newMessages;
    });
  };

  const addToolToAssistantMessage = (name: string, data: unknown) => {
    setDisplayMessages((prev) => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
        const currentTools = newMessages[lastIndex].tools || [];
        newMessages[lastIndex] = {
          ...newMessages[lastIndex],
          tools: [...currentTools, { name, data }],
        };
      }
      return newMessages;
    });
  };

  const processStreamChunk = (rawMessage: unknown): boolean => {
    const parsed = streamChunkSchema.safeParse(rawMessage);
    if (!parsed.success) {
      console.error("Invalid stream chunk:", parsed.error);
      return false;
    }

    const chunk = parsed.data;

    if (chunk.type === "session") {
      sessionIdRef.current = chunk.sessionId;
      return false;
    }

    if (chunk.type === "text") {
      appendTextToAssistantMessage(chunk.content);
      return true;
    }

    if (chunk.type === "tool") {
      addToolToAssistantMessage(chunk.name, chunk.data);
      return true;
    }

    if (chunk.type === "error") {
      console.error("Stream error:", chunk.content);
    }

    return false;
  };

  const processStream = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantMessageCreated = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const message = JSON.parse(trimmed);
          const isContentChunk = processStreamChunk(message);

          if (isContentChunk && !assistantMessageCreated) {
            createAssistantMessage();
            assistantMessageCreated = true;
            processStreamChunk(message);
          }
        } catch {}
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    setDisplayMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: userMessage,
          systemPrompt: sessionIdRef.current ? undefined : systemPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error("Network error");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader");
      }

      await processStream(reader);
    } catch (error) {
      console.error("Error:", error);
      setDisplayMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erreur lors de la génération de la réponse." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    input,
    setInput,
    isLoading,
    handleSubmit,
    displayMessages,
  };
}
