import React from "react";
import { QualityScore } from "../types";
import { Award, CheckCircle, Lightbulb, TrendingUp, RefreshCw } from "lucide-react";
import { cn } from "../utils/cn";

interface QualityScoreCardProps {
  score?: QualityScore;
  isEvaluating?: boolean;
  onReEvaluate?: () => void;
}

export const QualityScoreCard: React.FC<QualityScoreCardProps> = ({
  score,
  isEvaluating = false,
  onReEvaluate,
}) => {
  if (isEvaluating) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-center space-x-3">
        <RefreshCw className="w-4 h-4 text-[#14A800] animate-spin" />
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Evaluating proposal conversion strength...</span>
      </div>
    );
  }

  if (!score) return null;

  const getScoreColor = (val: number) => {
    if (val >= 90) return "text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900";
    if (val >= 75) return "text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900";
    return "text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900";
  };

  const getBarColor = (val: number) => {
    if (val >= 90) return "bg-emerald-500";
    if (val >= 75) return "bg-blue-500";
    return "bg-amber-500";
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-[#14A800]" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
            AI Conversion Strength Rating
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-black px-2.5 py-0.5 rounded-full border", getScoreColor(score.overall))}>
            {score.overall} / 100
          </span>
          {onReEvaluate && (
            <button
              onClick={onReEvaluate}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
              title="Re-evaluate score"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Breakdown Progress Bars */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
            <span>Hook Impact</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{score.hookScore}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className={cn("h-full transition-all duration-500", getBarColor(score.hookScore))} style={{ width: `${score.hookScore}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
            <span>Job Specificity</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{score.specificityScore}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className={cn("h-full transition-all duration-500", getBarColor(score.specificityScore))} style={{ width: `${score.specificityScore}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
            <span>Value Proposition</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{score.valuePropScore}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className={cn("h-full transition-all duration-500", getBarColor(score.valuePropScore))} style={{ width: `${score.valuePropScore}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
            <span>Call to Action</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{score.ctaScore}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className={cn("h-full transition-all duration-500", getBarColor(score.ctaScore))} style={{ width: `${score.ctaScore}%` }} />
          </div>
        </div>
      </div>

      {/* Strengths & Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-700/60">
        {score.strengths && score.strengths.length > 0 && (
          <div className="space-y-1">
            <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
              <CheckCircle className="w-3 h-3" /> Key Strengths
            </div>
            <ul className="space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
              {score.strengths.map((str, i) => (
                <li key={i} className="truncate">• {str}</li>
              ))}
            </ul>
          </div>
        )}

        {score.feedback && score.feedback.length > 0 && (
          <div className="space-y-1">
            <div className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px]">
              <Lightbulb className="w-3 h-3" /> Optimization Tip
            </div>
            <ul className="space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
              {score.feedback.map((fb, i) => (
                <li key={i} className="leading-snug">• {fb}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
