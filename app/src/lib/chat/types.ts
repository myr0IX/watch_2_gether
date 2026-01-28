import { AssistantMessage$inboundSchema } from "@mistralai/mistralai/models/components";
import z from "zod";

export type {
  TextChunk,
  ToolChunk,
  ErrorChunk,
  StreamChunk,
} from "@/schemas/stream-chunk";

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export type Message = any;

export interface ValidationResult {
  isValid: boolean;
  validMessages: Message[];
  error?: string;
}

export interface ToolBuffer {
  name: string;
  arguments: string;
}

export interface StreamProcessingResult {
  textContent: string;
  toolCalls: ToolCall[];
}

export type AssistantMessage = z.infer<typeof AssistantMessage$inboundSchema._getType>;
