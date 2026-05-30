import { Sparkles, Target, Lightbulb, MessageSquare } from "lucide-react";

interface QuickActionsProps {
  onSelect: (text: string) => void;
}

const actions = [
  { icon: <Sparkles className="h-3.5 w-3.5" />, text: "Помоги улучшить резюме" },
  { icon: <Target className="h-3.5 w-3.5" />, text: "Оцени соответствие вакансии" },
  { icon: <Lightbulb className="h-3.5 w-3.5" />, text: "Подскажи, что добавить" },
  { icon: <MessageSquare className="h-3.5 w-3.5" />, text: "Начни интервью" },
];

export function QuickActions({ onSelect }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action) => (
        <button
          key={action.text}
          onClick={() => onSelect(action.text)}
          className="flex items-center gap-2 px-3 py-2.5 text-[13px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/[0.06] rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:border-gray-300 dark:hover:border-white/[0.1] transition-all duration-200 text-left"
        >
          <span className="text-gray-400 dark:text-gray-600">{action.icon}</span>
          {action.text}
        </button>
      ))}
    </div>
  );
}
