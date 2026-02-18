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

export interface UserMessage {
  role: "user";
  content: string;
}

export interface SystemMessage {
  role: "system";
  content: string;
}

export interface AssistantMessage {
  role: "assistant";
  content?: string | null;
  toolCalls?: ToolCall[];
}

export interface ToolMessage {
  role: "tool";
  content: string;
  toolCallId: string;
}

export type Message = UserMessage | SystemMessage | AssistantMessage | ToolMessage;

export interface ToolBuffer {
  name: string;
  arguments: string;
}

export interface StreamProcessingResult {
  textContent: string;
  toolCalls: ToolCall[];
}
