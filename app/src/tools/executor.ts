import { executeSearchTool } from "@/lib/trakt/service";
import { movieCardSchema } from "@/schemas/movie-card";
import { TOOLS_NAMES, type ToolName } from "./types";

type ToolHandler = (args: Record<string, unknown>) => Promise<unknown>;

const handlers: Record<ToolName, ToolHandler> = {
  [TOOLS_NAMES.MOVIES_SEARCH]: async (args) => {
    return await executeSearchTool(args);
  },
  [TOOLS_NAMES.MOVIES_CARD]: async (args) => {
    // Valider les données avec le schema Zod
    const validatedData = movieCardSchema.parse(args);
    return validatedData;
  },
};

export async function executeTool(toolName: ToolName, args: Record<string, unknown>): Promise<unknown> {
  const handler = handlers[toolName];

  if (!handler) {
    throw new Error(`Tool not found: ${toolName}`);
  }

  return handler(args);
}
