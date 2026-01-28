/**
 * Orchestration de l'exécution des outils
 */

import type { Message, ToolCall } from "./types";
import { executeTool } from "@/tools/executor";
import { TOOLS_CONFIG, isValidToolName } from "@/tools/types";
import {
  enqueueToolChunk,
  enqueueErrorChunk,
} from "./stream-processor";

/**
 * Résultat de l'exécution d'un tool call
 */
export interface ToolExecutionResult {
  success: boolean;
  toolMessage: Message;
  requiresAIProcessing: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Parse les arguments JSON d'un tool call
 */
function parseToolArguments(argumentsStr: string): Record<string, unknown> {
  try {
    return JSON.parse(argumentsStr);
  } catch (error) {
    throw new Error("Impossible de parser les arguments du tool");
  }
}

/**
 * Exécute un tool call individuel et retourne le résultat
 */
export async function executeToolCall(
  tool: ToolCall
): Promise<ToolExecutionResult> {
  try {
    // Parse des arguments
    const parsedArguments = parseToolArguments(tool.function.arguments);

    // Validation du nom du tool
    const toolName = tool.function.name;
    if (!isValidToolName(toolName)) {
      console.error("Outil non géré:", toolName);
      throw new Error(`Outil non géré: ${toolName}`);
    }

    // Exécution du tool
    console.debug("Exécution de l'outil:", toolName);
    const result = await executeTool(toolName, parsedArguments);
    const config = TOOLS_CONFIG[toolName];

    // Message tool pour l'historique conversationnel
    const toolMessage: Message = {
      role: "tool",
      content: JSON.stringify(result),
      tool_call_id: tool.id,
    };

    return {
      success: true,
      toolMessage,
      requiresAIProcessing: config.requiresAIProcessing,
      data: result,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Erreur lors de l'exécution de l'outil:", errorMessage);

    // Message tool avec erreur pour l'historique
    const toolMessage: Message = {
      role: "tool",
      content: JSON.stringify({ error: errorMessage }),
      tool_call_id: tool.id,
    };

    return {
      success: false,
      toolMessage,
      requiresAIProcessing: false,
      error: errorMessage,
    };
  }
}

/**
 * Orchestre l'exécution de tous les tool calls
 * - Exécute chaque tool
 * - Ajoute les messages tool à l'historique
 * - Envoie les résultats dans le stream si le tool ne requiert pas de traitement AI
 * - Retourne true s'il y a des tools qui nécessitent un traitement AI supplémentaire
 */
export async function processToolCalls(
  toolCalls: ToolCall[],
  messages: Message[],
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
): Promise<boolean> {
  let hasToolsRequiringAIProcessing = false;

  for (const tool of toolCalls) {
    const result = await executeToolCall(tool);

    // Ajouter le message tool à l'historique conversationnel
    messages.push(result.toolMessage);

    if (result.success) {
      // Si le tool nécessite un traitement AI, marquer pour continuer la boucle
      if (result.requiresAIProcessing) {
        console.debug("requiresAIProcessing:", tool.function.name);
        hasToolsRequiringAIProcessing = true;
      } else {
        // Sinon, envoyer le résultat dans le stream HTTP
        enqueueToolChunk(
          controller,
          encoder,
          tool.function.name,
          result.data
        );
      }
    } else {
      // Envoyer l'erreur dans le stream
      enqueueErrorChunk(
        controller,
        encoder,
        `Erreur outil: ${result.error}`
      );
    }
  }

  return hasToolsRequiringAIProcessing;
}
