import { useState, useRef, useEffect } from "react";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface UseChatOptions {
  initialMessages?: Message[];
  systemPrompt?: string;
}

interface UseChatReturn {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  displayMessages: Array<Message & { role: "user" | "assistant" }>;
}

export function useChat({
  initialMessages = [],
  systemPrompt = "",
}: UseChatOptions = {}): UseChatReturn {
  const initialMessagesState: Message[] = [
    { role: "system", content: systemPrompt },
    ...initialMessages,
  ];
  
  const [messages, setMessages] = useState<Message[]>(initialMessagesState);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesRef = useRef<Message[]>(initialMessagesState);
  
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const createAssistantMessage = () => {
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
  };

  const updateAssistantMessage = (content: string) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      newMessages[lastIndex] = {
        role: "assistant",
        content: (newMessages[lastIndex].content || "") + content,
      };
      return newMessages;
    });
  };

  const processStreamMessage = (message: any) => {
    if (message.type === "text_chunk") {
      updateAssistantMessage(message.content);
    } else if (message.type === "tool") {
      const toolStr = JSON.stringify({
        type: message.name,
        data: message.data,
      });
      updateAssistantMessage(`\n[TOOL:${toolStr}]\n`);
    }
  };

  const processBufferLines = (
    buffer: string,
    assistantMessageCreated: boolean
  ): { newBuffer: string; messageCreated: boolean } => {
    const lines = buffer.split("\n");
    const newBuffer = lines[lines.length - 1];
    let messageCreated = assistantMessageCreated;

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const message = JSON.parse(line);

        if (!messageCreated) {
          createAssistantMessage();
          messageCreated = true;
        }

        processStreamMessage(message);
      } catch (err) {}
    }

    return { newBuffer, messageCreated };
  };

  const processStream = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantMessageCreated = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const result = processBufferLines(buffer, assistantMessageCreated);
      buffer = result.newBuffer;
      assistantMessageCreated = result.messageCreated;
    }
  };

  const handleError = (error: unknown) => {
    console.error("Erreur:", error);
    setMessages((prev) => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];

      if (lastMessage?.role !== "assistant") {
        return [
          ...newMessages,
          {
            role: "assistant",
            content: "Erreur lors de la génération de la réponse.",
          },
        ];
      }

      newMessages[newMessages.length - 1] = {
        role: "assistant",
        content: "Erreur lors de la génération de la réponse.",
      };
      return newMessages;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setInput("");
    setIsLoading(true);
    
    let messagesToSend: Message[] = [...messagesRef.current];
    
    if (systemPrompt && !messagesToSend.some(m => m.role === "system")) {
      messagesToSend = [{ role: "system", content: systemPrompt }, ...messagesToSend];
    }
    
    messagesToSend = [...messagesToSend, userMessage];
    
    setMessages(messagesToSend);
    
    const hasValidUserMessage = messagesToSend.some(
      m => m.role === "user" && m.content && m.content.trim().length > 0
    );
    
    if (messagesToSend.length === 0 || !hasValidUserMessage) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesToSend }),
      });

      if (!response.ok) {
        throw new Error("Erreur réseau");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Pas de reader");
      }

      await processStream(reader);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayMessages = messages.filter((m) => m.role !== "system") as Array<
    Message & { role: "user" | "assistant" }
  >;

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSubmit,
    displayMessages,
  };
}
