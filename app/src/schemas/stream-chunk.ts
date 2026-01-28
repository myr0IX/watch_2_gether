import { z } from "zod";

export const sessionChunkSchema = z.object({
  type: z.literal("session"),
  sessionId: z.string(),
});

export const textChunkSchema = z.object({
  type: z.literal("text"),
  content: z.string(),
});

export const toolChunkSchema = z.object({
  type: z.literal("tool"),
  name: z.string(),
  data: z.unknown(),
});

export const errorChunkSchema = z.object({
  type: z.literal("error"),
  content: z.string(),
});

export const streamChunkSchema = z.discriminatedUnion("type", [
  sessionChunkSchema,
  textChunkSchema,
  toolChunkSchema,
  errorChunkSchema,
]);

export type SessionChunk = z.infer<typeof sessionChunkSchema>;
export type TextChunk = z.infer<typeof textChunkSchema>;
export type ToolChunk = z.infer<typeof toolChunkSchema>;
export type ErrorChunk = z.infer<typeof errorChunkSchema>;
export type StreamChunk = z.infer<typeof streamChunkSchema>;
