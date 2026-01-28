import { getAIClient } from "@/config/mistral-ai-client";
import { searchTool } from "@/lib/trakt/tool";
import { movieCardTool } from "@/tools/movie-card";
import type { NextRequest } from "next/server";
import {
  processAIStream,
  buildAssistantMessage,
  enqueueTextChunk,
  enqueueToolChunk,
} from "@/lib/chat/stream-processor";
import { processToolCalls } from "@/lib/chat/tool-orchestrator";
import { withRateLimitRetry } from "@/lib/chat/error-handler";
import type { Message } from "@/lib/chat/types";
import { sessionStore } from "@/lib/chat/session-store";

interface ChatRequest {
  sessionId?: string;
  message: string;
  systemPrompt?: string;
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatRequest;
  const { sessionId, message, systemPrompt } = body;

  if (!message || !message.trim()) {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let session = sessionId ? sessionStore.get(sessionId) : undefined;

  if (!session) {
    session = sessionStore.create(systemPrompt || "");
  }

  sessionStore.addMessage(session.id, { role: "user", content: message.trim() });

  const aiClient = await getAIClient();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const sessionChunk = { type: "session", sessionId: session!.id };
      controller.enqueue(encoder.encode(JSON.stringify(sessionChunk) + "\n"));

      console.debug("Session:", session!.id);
      const conversationMessages: Message[] = [...sessionStore.getMessages(session!.id)];
      let toolCallsPending = true;
      const newMessages: Message[] = [];

      while (toolCallsPending) {
        toolCallsPending = false;

        await withRateLimitRetry(async () => {
          console.debug("Appel à l'IA:", conversationMessages);

          const chatStream = await aiClient.chat.stream({
            model: "mistral-small-latest",
            messages: conversationMessages,
            tools: [movieCardTool, searchTool],
          });

          console.debug("Flux de l'IA reçu");

          const result = await processAIStream(chatStream, (content) => {
            enqueueTextChunk(controller, encoder, content);
          });

          const assistantMessage = buildAssistantMessage(result);
          if (assistantMessage) {
            conversationMessages.push(assistantMessage);
            newMessages.push(assistantMessage);
          }

          if (result.toolCalls.length > 0) {
            console.debug("Tools called:", result.toolCalls.length);
            const requiresAIProcessing = await processToolCalls(
              result.toolCalls,
              conversationMessages,
              controller,
              encoder
            );

            const toolMessages = conversationMessages.slice(-result.toolCalls.length);
            newMessages.push(...toolMessages.filter(m => m.role === "tool"));

            if (requiresAIProcessing) {
              toolCallsPending = true;
            }
          }
        });
      }

      sessionStore.addMessages(session!.id, newMessages);
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
