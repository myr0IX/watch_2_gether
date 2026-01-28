import type { Message, ToolCall } from "./types";
import { executeTool } from "@/tools/executor";
import { TOOLS_CONFIG, isValidToolName } from "@/tools/types";
import {
  enqueueToolChunk,
  enqueueErrorChunk,
} from "./stream-processor";

export interface ToolExecutionResult {
  success: boolean;
  toolMessage: Message;
  requiresAIProcessing: boolean;
  data?: unknown;
  error?: string;
}

function parseToolArguments(argumentsStr: string): Record<string, unknown> {
  try {
    return JSON.parse(argumentsStr);
  } catch (error) {
    throw new Error("Unable to parse tool arguments");
  }
}

export async function executeToolCall(
  tool: ToolCall
): Promise<ToolExecutionResult> {
  try {
    const parsedArguments = parseToolArguments(tool.function.arguments);

    const toolName = tool.function.name;
    if (!isValidToolName(toolName)) {
      console.error("Unhandled tool:", toolName);
      throw new Error(`Unhandled tool: ${toolName}`);
    }

    console.debug("Executing tool:", toolName);
    const result = await executeTool(toolName, parsedArguments);
    const config = TOOLS_CONFIG[toolName];

    const toolMessage: Message = {
      role: "tool",
      content: JSON.stringify(result),
      toolCallId: tool.id,
    };

    return {
      success: true,
      toolMessage,
      requiresAIProcessing: config.requiresAIProcessing,
      data: result,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Tool execution error:", errorMessage);

    const toolMessage: Message = {
      role: "tool",
      content: JSON.stringify({ error: errorMessage }),
      toolCallId: tool.id,
    };

    return {
      success: false,
      toolMessage,
      requiresAIProcessing: false,
      error: errorMessage,
    };
  }
}

export async function processToolCalls(
  toolCalls: ToolCall[],
  messages: Message[],
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): Promise<boolean> {
  let hasToolsRequiringAIProcessing = false;

  for (const tool of toolCalls) {
    const result = await executeToolCall(tool);

    messages.push(result.toolMessage);

    if (result.success) {
      if (result.requiresAIProcessing) {
        console.debug("requiresAIProcessing:", tool.function.name);
        hasToolsRequiringAIProcessing = true;
      } else {
        enqueueToolChunk(controller, encoder, tool.function.name, result.data);
      }
    } else {
      enqueueErrorChunk(
        controller,
        encoder,
        `Tool error: ${result.error}`
      );
    }
  }

  return hasToolsRequiringAIProcessing;
}
