import { getAIClient } from "@/config/mistral-ai-client";
import { searchTool } from "@/lib/trakt/tool";
import { movieCardTool } from "@/tools/movie-card";
import type { NextRequest } from "next/server";
import { validateMessages } from "@/lib/chat/message-validator";
import {
  processAIStream,
  buildAssistantMessage,
  enqueueTextChunk,
} from "@/lib/chat/stream-processor";
import { processToolCalls } from "@/lib/chat/tool-orchestrator";
import { withRateLimitRetry } from "@/lib/chat/error-handler";
import type { Message } from "@/lib/chat/types";
import { assistantMessageFromJSON, assistantMessageToJSON } from "@mistralai/mistralai/models/components";

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: Message[] };

  // Valider les messages
  const validation = validateMessages(messages);
  if (!validation.isValid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const aiClient = await getAIClient();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller: ReadableStreamDefaultController) {
      console.debug("Début du flux...");
      const conversationMessages: Message[] = [...validation.validMessages];
      let toolCallsPending = true;

      while (toolCallsPending) {
        toolCallsPending = false;

        // Exécution avec retry automatique sur rate limit
        await withRateLimitRetry(async () => {
          console.debug("Appel à l'IA:", conversationMessages);

          // Appel au streaming de l'IA Mistral
          const chatStream = await aiClient.chat.stream({
            model: "mistral-small-latest",
            messages: conversationMessages,
            tools: [movieCardTool, searchTool],
          });

          console.debug("Flux de l'IA reçu");

          // Traitement du stream avec envoi en temps réel du texte
          const result = await processAIStream(chatStream, (content) => {
            enqueueTextChunk(controller, encoder, content);
          });

          // // // Construction du message assistant
          // const assistantMessage = buildAssistantMessage(result);
          // if (assistantMessage) {
          //   conversationMessages.push(assistantMessage);
          // }

          // Orchestration de l'exécution des tool calls
          if (result.toolCalls.length > 0) {
            console.debug("Tools called number:", result.toolCalls.length);
            console.debug("Tools called:", result.toolCalls);
            const requiresAIProcessing = await processToolCalls(
              result.toolCalls,
              conversationMessages,
              controller,
              encoder
            );

            if (requiresAIProcessing) {
              toolCallsPending = true;
            }
          }
        });
      }

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
