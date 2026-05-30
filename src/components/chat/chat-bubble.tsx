import { Bot, User } from "lucide-react";
import { ChatMessage } from "@/types";

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}>
      {isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
          <Bot className="h-4 w-4 text-white dark:text-gray-900" />
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap ${
          isAssistant
            ? "bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] text-gray-800 dark:text-gray-300 rounded-tl-md"
            : "bg-gray-900 dark:bg-white/10 text-white dark:text-gray-100 rounded-tr-md"
        }`}
      >
        {renderContent(message.content)}
      </div>

      {!isAssistant && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
          <User className="h-4 w-4 text-gray-500 dark:text-gray-500" />
        </div>
      )}
    </div>
  );
}

function renderContent(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
