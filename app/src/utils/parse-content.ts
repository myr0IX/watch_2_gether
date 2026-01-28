import { movieCardToolSchema, type MovieCardTool } from "@/schemas/movie-card";

interface ToolCall {
  type: string;
  data: Record<string, unknown>;
}

export type ContentPart = string | MovieCardTool;

export function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const toolRegex = /\[TOOL:(.*?)\]/gs;

  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = toolRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim();
      if (text) parts.push(text);
    }

    try {
      const rawTool = JSON.parse(match[1]);
      const validatedTool = movieCardToolSchema.parse({
        type: rawTool.type,
        data: rawTool.data,
      });
      parts.push(validatedTool);
    } catch (err) {
      console.error("Erreur parsing ou validation tool:", err);
    }

    lastIndex = match.index + match[0].length;
  }

  const remaining = content.slice(lastIndex).trim();
  if (remaining && !remaining.startsWith("[TOOL:")) {
    parts.push(remaining);
  }

  return parts.length > 0 ? parts : [content];
}
