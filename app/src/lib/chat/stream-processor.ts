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

type TextChunkCallback = (content: string) => void;

export async function processAIStream(
  chatStream: EventStream<CompletionEvent>,
  onTextChunk?: TextChunkCallback,
): Promise<StreamProcessingResult> {
  const toolBuffers: Record<string, ToolBuffer> = {};
  let textContent = "";

  for await (const chunk of chatStream) {
    const delta = chunk?.data?.choices?.[0]?.delta;

    if (delta && typeof delta === "object" && "content" in delta) {
      const content = delta.content;
      if (typeof content === "string") {
        textContent += content;
        if (onTextChunk) {
          onTextChunk(content);
        }
      }
    }

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

export function buildAssistantMessage(
  result: StreamProcessingResult,
): Message | null {
  const { textContent, toolCalls } = result;

  if (!textContent && toolCalls.length === 0) {
    return null;
  }
  console.debug("toolsCall", toolCalls)
  return {
    role: "assistant",
    content: textContent || null,
    ...(toolCalls.length > 0 && { toolCalls }),
  };
}

export function enqueueTextChunk(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  content: string,
): void {
  const chunk: TextChunk = {
    type: "text",
    content,
  };
  controller.enqueue(encoder.encode(JSON.stringify(chunk) + "\n"));
}

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
