import { getAIClient } from "@/config/mistral-ai-client";
import { movieCardTool } from "@/tools/movie-card";
import { NextRequest } from "next/server";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: NextRequest) {
  const { messages } = (await req.json()) as { messages: Message[] };

  if (!messages || messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "Aucun message fourni" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const validMessages = messages.filter(
    (msg) => {
      if (msg.role === "system") {
        return true;
      }
      return msg.content && msg.content.trim().length > 0;
    }
  );

  const hasUserOrAssistantMessage = validMessages.some(
    (msg) => (msg.role === "user" || msg.role === "assistant") && msg.content && msg.content.trim().length > 0
  );

  if (!hasUserOrAssistantMessage) {
    return new Response(
      JSON.stringify({ error: "Au moins un message utilisateur ou assistant avec du contenu est requis" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const aiClient = await getAIClient();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const chatStream = await aiClient.chat.stream({
          model: "mistral-small-latest",
          messages: validMessages,
          tools: [movieCardTool],
        });

        const toolBuffers: Record<string, string> = {};

        for await (const chunk of chatStream) {
          const delta = chunk.data.choices?.[0]?.delta;

          if (typeof delta?.content === "string") {
            const textMessage = JSON.stringify({
              type: "text_chunk",
              content: delta.content,
            }) + "\n";
            controller.enqueue(encoder.encode(textMessage));
          }

          if (delta?.toolCalls) {
            for (const call of delta.toolCalls) {
              const callId = call.id || `index_${call.index ?? 0}`;
              toolBuffers[callId] = (toolBuffers[callId] || "") + call.function.arguments;
            }
          }
        }

        for (const [callId, buf] of Object.entries(toolBuffers)) {
          try {
            const toolData = JSON.parse(buf);
            const toolMessage =
              JSON.stringify({
                type: "tool",
                name: "movie_card",
                data: toolData,
              }) + "\n";
            controller.enqueue(encoder.encode(toolMessage));
          } catch (err) {
            console.error("Erreur parsing tool:", callId, err);
          }
        }

        controller.close();
      } catch (error) {
        console.error("Erreur streaming:", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
