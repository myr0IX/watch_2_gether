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
  
  // Utiliser une ref pour garder une référence à jour des messages
  const messagesRef = useRef<Message[]>(initialMessagesState);
  
  // Mettre à jour la ref quand messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Créer le message assistant au premier chunk
  const createAssistantMessage = () => {
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
  };

  // Mettre à jour le dernier message assistant avec un nouveau contenu
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

  // Traiter un message reçu du stream (text_chunk ou tool)
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

  // Parser et traiter les lignes du buffer (format NDJSON)
  const processBufferLines = (
    buffer: string,
    assistantMessageCreated: boolean
  ): { newBuffer: string; messageCreated: boolean } => {
    const lines = buffer.split("\n");
    const newBuffer = lines[lines.length - 1]; // Garder la dernière ligne incomplète
    let messageCreated = assistantMessageCreated;

    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const message = JSON.parse(line);

        // Créer le message assistant au premier message valide
        if (!messageCreated) {
          createAssistantMessage();
          messageCreated = true;
        }

        processStreamMessage(message);
      } catch (err) {
        // Ligne invalide, ignorer
      }
    }

    return { newBuffer, messageCreated };
  };

  // Lire et traiter le stream de réponse
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

  // Gérer les erreurs en créant ou mettant à jour un message d'erreur
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

  // Fonction principale de soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const userInput = input.trim();
    setInput("");
    setIsLoading(true);
    
    // Construire les messages à envoyer en utilisant la ref pour avoir l'état le plus récent
    // S'assurer qu'on a au moins le message système si systemPrompt n'est pas vide
    let messagesToSend: Message[] = [...messagesRef.current];
    
    // Si messages est vide ou ne contient pas de message système, l'ajouter
    if (systemPrompt && !messagesToSend.some(m => m.role === "system")) {
      messagesToSend = [{ role: "system", content: systemPrompt }, ...messagesToSend];
    }
    
    // Ajouter le message utilisateur
    messagesToSend = [...messagesToSend, userMessage];
    
    // Mettre à jour l'état immédiatement
    setMessages(messagesToSend);
    
    // S'assurer qu'il y a au moins un message utilisateur avec du contenu
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
