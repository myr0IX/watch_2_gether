import { MovieCardToolSchema, type MovieCardTool } from "@/schemas/movie-card";

interface ToolCall {
  type: string;
  data: Record<string, unknown>;
}

export type ContentPart = string | MovieCardTool;

export function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  const toolRegex = /\[TOOL:(.*?)\]/gs;

  let lastIndex = 0;
  let match;

  while ((match = toolRegex.exec(content)) !== null) {
    // Ajouter le texte avant le tool
    if (match.index > lastIndex) {
      const text = content.slice(lastIndex, match.index).trim();
      if (text) parts.push(text);
    }

    // Ajouter le tool (validé avec Zod)
    try {
      const rawTool = JSON.parse(match[1]);
      // Valider avec Zod
      const validatedTool = MovieCardToolSchema.parse({
        type: rawTool.type,
        data: rawTool.data,
      });
      parts.push(validatedTool);
    } catch (err) {
      console.error("Erreur parsing ou validation tool:", err);
    }

    lastIndex = match.index + match[0].length;
  }

  // Ajouter le texte restant, MAIS ignorer les [TOOL:... incomplets
  const remaining = content.slice(lastIndex).trim();
  // Ne pas ajouter si c'est juste un [TOOL: incomplet
  if (remaining && !remaining.startsWith("[TOOL:")) {
    parts.push(remaining);
  }

  return parts.length > 0 ? parts : [content];
}
