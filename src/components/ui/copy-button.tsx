"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./button";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className={className}>
      {copied ? (
        <span className="flex items-center text-emerald-600 dark:text-emerald-400">
          <Check className="h-3.5 w-3.5 mr-1" /> Скопировано
        </span>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5 mr-1" /> Копировать
        </>
      )}
    </Button>
  );
}
