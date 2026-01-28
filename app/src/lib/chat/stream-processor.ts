/**
 * Traitement du streaming de l'IA et gestion des chunks
 */

import {
  assistantMessageToJSON,
  CompletionEvent,
} from "@mistralai/mistralai/models/components";
import type {
  Message,
  ToolCall,
  ToolBuffer,
  StreamProcessingResult,
  TextChunk,
  ToolChunk,
  ErrorChunk,
} from "./types";
import { EventStream } from "@mistralai/mistralai/lib/event-streams";

/**
 * Type pour la fonction de callback d'envoi de chunks texte en temps réel
 */
type TextChunkCallback = (content: string) => void;

/**
 * Traite un stream de chunks provenant de l'IA Mistral
 * Accumule le texte et les tool calls en attendant la fin du stream
 * Optionnellement, envoie les chunks texte en temps réel via le callback
 */
export async function processAIStream(
  chatStream: EventStream<CompletionEvent>,
  onTextChunk?: TextChunkCallback,
): Promise<StreamProcessingResult> {
  const toolBuffers: Record<string, ToolBuffer> = {};
  let textContent = "";

  // Parcourir tous les chunks du stream
  for await (const chunk of chatStream) {
    const delta = chunk?.data?.choices?.[0]?.delta;

    // Traiter le contenu texte
    if (delta && typeof delta === "object" && "content" in delta) {
      const content = delta.content;
      if (typeof content === "string") {
        textContent += content;
        // Envoyer en temps réel si un callback est fourni
        if (onTextChunk) {
          onTextChunk(content);
        }
      }
    }

    // Accumuler les tool calls
    if (
      delta &&
      typeof delta === "object" &&
      "toolCalls" in delta &&
      Array.isArray(delta.toolCalls)
    ) {
      const toolCalls = delta.toolCalls;
      for (const call of toolCalls) {
        if (!call || typeof call !== "object") continue;

        const callObj = call;
        const callId = callObj.id || `index_${callObj.index ?? 0}`;

        if (!toolBuffers[callId]) {
          const func = callObj.function;
          toolBuffers[callId] = {
            name: func.name || "",
            arguments: "",
          };
        }

        const func = callObj.function;
        const args = func.arguments || "";
        toolBuffers[callId].arguments += args;
      }
    }
  }

  // Convertir les buffers en tool calls structurés
  const toolCalls: ToolCall[] = Object.entries(toolBuffers).map(
    ([callId, toolCall]) => ({
      id: callId,
      type: "function" as const,
      function: {
        name: toolCall.name,
        arguments: toolCall.arguments,
      },
    }),
  );

  return { textContent, toolCalls };
}

/**
 * Crée un message assistant à partir du résultat du traitement du stream
 * Retourne null si aucun contenu ni tool calls
 */
export function buildAssistantMessage(
  result: StreamProcessingResult,
): Message | null {
  const { textContent, toolCalls } = result;

  // Ne créer un message que s'il y a du contenu ou des tool calls
  if (!textContent && toolCalls.length === 0) {
    return null;
  }
  assistantMessageToJSON;
  return {
    role: "assistant",
    content: textContent || (toolCalls.length > 0 ? "" : ""),
    ...(toolCalls.length > 0 && { tool_calls: toolCalls }),
  };
}

/**
 * Envoie un chunk de texte dans le stream de réponse HTTP
 */
export function enqueueTextChunk(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  content: string,
): void {
  const chunk: TextChunk = {
    type: "text_chunk",
    content,
  };
  controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
}

/**
 * Envoie un chunk de résultat d'outil dans le stream de réponse HTTP
 */
export function enqueueToolChunk(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  toolName: string,
  data: unknown,
): void {
  const chunk: ToolChunk = {
    type: "tool",
    name: toolName,
    data,
  };
  controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
}

/**
 * Envoie un chunk d'erreur dans le stream de réponse HTTP
 */
export function enqueueErrorChunk(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  errorMessage: string,
): void {
  const chunk: ErrorChunk = {
    type: "error",
    content: errorMessage,
  };
  controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
}
