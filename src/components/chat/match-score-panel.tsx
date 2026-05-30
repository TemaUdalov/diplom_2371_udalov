"use client";

import { TrendingUp, AlertTriangle, FileText, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchScore } from "@/types";

interface MatchScorePanelProps {
  score: MatchScore;
}

export function MatchScorePanel({ score }: MatchScorePanelProps) {
  const getScoreColor = () => {
    if (score.overall >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score.overall >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-500 dark:text-red-400";
  };

  const getBarColor = () => {
    if (score.overall >= 80) return "bg-emerald-500";
    if (score.overall >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      {/* Score */}
      <Card>
        <CardContent className="py-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium text-gray-500 dark:text-gray-500">Оценка соответствия</span>
            <span className={`text-2xl font-bold tabular-nums ${getScoreColor()}`}>{score.overall}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getBarColor()}`}
              style={{ width: `${score.overall}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Strengths */}
      {score.strengths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Сильные стороны
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {score.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-gray-600 dark:text-gray-400">
                  <span className="text-emerald-500 mt-1 flex-shrink-0">·</span>
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Gaps */}
      {score.gaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Что стоит доработать
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {score.gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px] text-gray-600 dark:text-gray-400">
                  <span className="text-amber-500 mt-1 flex-shrink-0">·</span>
                  {g}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Resume tips */}
      {score.resumeTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500 dark:text-gray-500" />
              Советы для резюме
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ol className="space-y-2">
              {score.resumeTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-gray-600 dark:text-gray-400">
                  <span className="text-[12px] font-semibold text-gray-400 dark:text-gray-600 tabular-nums flex-shrink-0 w-4 text-right">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Cover letter tips */}
      {score.coverLetterTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500 dark:text-gray-500" />
              Советы для письма
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ol className="space-y-2">
              {score.coverLetterTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-[13px] text-gray-600 dark:text-gray-400">
                  <span className="text-[12px] font-semibold text-gray-400 dark:text-gray-600 tabular-nums flex-shrink-0 w-4 text-right">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
