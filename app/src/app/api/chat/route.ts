import { getAIClient } from "@/config/mistral-ai-client";
import { ContentChunk$ } from "@mistralai/mistralai/models/components";
import { NextRequest } from "next/server";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface Type = ContentChunk

export async function POST(req: NextRequest) {
  const data = await req.json()
  const { messages } = (await req.json()) as { messages: Message[] };

  const aiClient = await getAIClient();
  
  const encoder = new TextEncoder();

  // Créer un stream de réponse
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const chatStream = await aiClient.chat.stream({
          model: "mistral-small-latest",
          messages: messages,
        });

        // Itérer sur les chunks
        for await (const chunk of chatStream) {
          const content = chunk.data.choices?.[0]?.delta?.content;

          if (content) {
            // Envoyer le chunk au client
            controller.enqueue(encoder.encode(content));
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
