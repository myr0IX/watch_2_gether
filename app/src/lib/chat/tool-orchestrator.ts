import type { Message, ToolCall } from "./types";
import { executeTool } from "@/lib/tools/executor";
import { TOOLS_CONFIG, isValidToolName } from "@/lib/tools/types";
import {
  enqueueToolChunk,
  enqueueErrorChunk,
} from "./stream-processor";
import { logger } from "@/lib/logger";

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
    logger.error("[parseToolArguments] Failed to parse tool arguments", {
      argumentsStr,
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error("Unable to parse tool arguments");
  }
}

export async function executeToolCall(
  tool: ToolCall
): Promise<ToolExecutionResult> {
  const startTime = Date.now();
  try {
    const parsedArguments = parseToolArguments(tool.function.arguments);

    const toolName = tool.function.name;
    if (!isValidToolName(toolName)) {
      logger.error("[executeToolCall] Invalid tool called", { toolName, availableTools: Object.keys(TOOLS_CONFIG) });
      throw new Error(`Unhandled tool: ${toolName}`);
    }

    logger.debug("[executeToolCall] Executing tool", { toolName, toolId: tool.id, args: parsedArguments });
    const result = await executeTool(toolName, parsedArguments);
    const duration = Date.now() - startTime;
    const config = TOOLS_CONFIG[toolName];

    const toolMessage: Message = {
      role: "tool",
      content: JSON.stringify(result),
      toolCallId: tool.id,
    };

    logger.debug("[executeToolCall] Tool executed successfully", {
      toolName,
      toolId: tool.id,
      duration,
      requiresAIProcessing: config.requiresAIProcessing
    });

    return {
      success: true,
      toolMessage,
      requiresAIProcessing: config.requiresAIProcessing,
      data: result,
    };
  } catch (err) {
    const duration = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : String(err);
    logger.error("[executeToolCall] Tool execution failed", {
      toolName: tool.function.name,
      toolId: tool.id,
      duration,
      error: errorMessage,
      stack: err instanceof Error ? err.stack : undefined
    });

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
        logger.debug("Tool requires AI processing", { toolName: tool.function.name });
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
