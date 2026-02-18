import { executeSearchTool } from "../trakt/service";

export const TOOLS_NAMES = {
  MOVIES_SEARCH: "movies_search",
} as const;

export const CHUNK_NAMES = {
  MOVIES_CARD: "movies_card",
} as const;

export type ToolName = typeof TOOLS_NAMES[keyof typeof TOOLS_NAMES];

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolConfigValue {
  func?: unknown;
  requiresAIProcessing: boolean;
}

export const TOOLS_CONFIG: Record<ToolName, ToolConfigValue> = {
  [TOOLS_NAMES.MOVIES_SEARCH]: {
    func: executeSearchTool,
    requiresAIProcessing: true,
  },
};

export function isValidToolName(name: string): name is ToolName {
  return name in TOOLS_CONFIG;
}
