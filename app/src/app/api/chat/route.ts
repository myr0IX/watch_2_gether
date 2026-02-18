import { getAIClient } from "@/config/mistral-ai-client";
import { searchTool } from "@/lib/trakt/tool";
import type { NextRequest } from "next/server";
import {
  processAIStream,
  buildAssistantMessage,
  enqueueTextChunk,
} from "@/lib/chat/stream-processor";
import { processToolCalls, flushPendingCards, clearPendingCards } from "@/lib/chat/tool-orchestrator";
import { withRateLimitRetry } from "@/lib/chat/error-handler";
import type { Message } from "@/lib/chat/types";
import { sessionStore } from "@/lib/chat/session-store";
import { logger } from "@/lib/logger";

interface ChatRequest {
  sessionId?: string;
  message: string;
  systemPrompt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequest;
    const { sessionId, message, systemPrompt } = body;

    if (!message || !message.trim()) {
      logger.error("Message validation failed", { sessionId, messageEmpty: true });
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    logger.debug("Chat request received", {
      sessionId,
      messageLength: message.length,
      hasSystemPrompt: !!systemPrompt
    });

    let session = sessionId ? sessionStore.get(sessionId) : undefined;

    if (!session) {
      session = sessionStore.create(systemPrompt || "");
      logger.debug("New session created", { sessionId: session.id });
    }

    sessionStore.addMessage(session.id, { role: "user", content: message.trim() });

  const aiClient = await getAIClient();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      const sessionChunk = { type: "session", sessionId: session!.id };
      controller.enqueue(encoder.encode(JSON.stringify(sessionChunk) + "\n"));

      logger.debug("Starting AI conversation", {
        sessionId: session!.id,
        messagesCount: sessionStore.getMessages(session!.id).length
      });

      clearPendingCards();

      const conversationMessages: Message[] = [...sessionStore.getMessages(session!.id)];
      let toolCallsPending = true;
      const newMessages: Message[] = [];

      while (toolCallsPending) {
        toolCallsPending = false;

        await withRateLimitRetry(async () => {
          logger.debug("Calling AI API", {
            sessionId: session!.id,
            messagesCount: conversationMessages.length
          });

          const chatStream = await aiClient.chat.stream({
            model: "mistral-small-latest",
            messages: conversationMessages,
            tools: [searchTool],
          });

          logger.debug("AI stream received", { sessionId: session!.id });

          const result = await processAIStream(chatStream, (content) => {
            enqueueTextChunk(controller, encoder, content);
          });

          const assistantMessage = buildAssistantMessage(result);
          if (assistantMessage) {
            conversationMessages.push(assistantMessage);
            newMessages.push(assistantMessage);
          }

          if (result.toolCalls.length > 0) {
            logger.debug("Tools called by AI", {
              sessionId: session!.id,
              toolsCount: result.toolCalls.length,
              tools: result.toolCalls.map(t => t.function.name)
            });
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

      flushPendingCards(controller, encoder);

      sessionStore.addMessages(session!.id, newMessages);
      logger.debug("Chat request completed", {
        sessionId: session!.id,
        newMessagesCount: newMessages.length
      });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
  } catch (error) {
    logger.error("Unhandled error in chat route", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
