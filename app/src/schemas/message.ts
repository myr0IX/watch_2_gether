import { z } from "zod";

export const toolResultSchema = z.object({
  name: z.string(),
  data: z.unknown(),
});

export const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  tools: z.array(toolResultSchema).optional(),
});

export type ToolResult = z.infer<typeof toolResultSchema>;
export type Message = z.infer<typeof messageSchema>;
