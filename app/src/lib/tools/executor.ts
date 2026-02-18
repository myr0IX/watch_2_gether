import { executeSearchTool } from "@/lib/trakt/service";
import { movieCardSchema } from "@/schemas/movie-card";
import { TOOLS_NAMES, type ToolName } from "./types";
import { logger } from "@/lib/logger";

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

const handlers: Record<ToolName, ToolHandler> = {
  [TOOLS_NAMES.MOVIES_SEARCH]: async (args) => {
    logger.debug("Executing movies search handler", { args });
    return await executeSearchTool(args);
  },
  [TOOLS_NAMES.MOVIES_CARD]: async (args) => {
    logger.debug("Executing movie card handler", { args });
    try {
      const validatedData = movieCardSchema.parse(args);
      logger.debug("Movie card data validated", { validatedData });
      return validatedData;
    } catch (error) {
      logger.error("Movie card validation failed", {
        args,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
};

export async function executeTool(
  toolName: ToolName,
  args: Record<string, unknown>,
): Promise<unknown> {
  const handler = handlers[toolName];

  if (!handler) {
    logger.error("Tool handler not found", {
      toolName,
      availableHandlers: Object.keys(handlers),
    });
    throw new Error(`Tool not found: ${toolName}`);
  }

  try {
    return await handler(args);
  } catch (error) {
    logger.error("Tool handler execution failed", {
      toolName,
      args,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
