import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
        <Bot className="h-4 w-4 text-white dark:text-gray-900" />
      </div>
      <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl rounded-tl-md px-5 py-3.5">
        <div className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
