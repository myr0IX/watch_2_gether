import { ChatBot } from "@/components/ai/chat-bot";

export const metadata = {
  title: "ChatBot - Mistral AI",
  description: "Chat avec l'IA Mistral",
};

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-black">
      <div className="flex-1 flex flex-col">
        <ChatBot />
      </div>
    </div>
  );
}
