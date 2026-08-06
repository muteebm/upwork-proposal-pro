import React from "react";
import { Tone, Framework } from "../types";
import { Sliders, Sparkles, Target, Zap } from "lucide-react";
import { cn } from "../utils/cn";

interface StrategyControlsProps {
  selectedTone: Tone;
  setSelectedTone: (tone: Tone) => void;
  selectedFramework: Framework;
  setSelectedFramework: (framework: Framework) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isGenerating: boolean;
}

const TONES: { id: Tone; label: string; desc: string }[] = [
  { id: "Consultative", label: "Consultative", desc: "Advisory, strategic, business ROI focus" },
  { id: "Startup High-Energy", label: "Startup High-Energy", desc: "Fast-paced, high velocity, enthusiastic" },
  { id: "Direct & Concise", label: "Direct & Concise", desc: "Ultra-punchy, zero fluff, straight to execution" },
  { id: "Technical Expert", label: "Technical Expert", desc: "Deep architectural vocabulary & stack precision" },
  { id: "Storyteller", label: "Storyteller", desc: "Engaging problem-solving narrative" },
  { id: "Friendly & Warm", label: "Friendly & Warm", desc: "Approachable, empathetic, client-centric" },
];

const FRAMEWORKS: { id: Framework; label: string; desc: string }[] = [
  { id: "Hook & Value", label: "Hook & Value", desc: "Classic Upwork: Strong hook + 3-step value plan + CTA" },
  { id: "PAS (Problem-Agitate-Solution)", label: "PAS (Problem - Agitate - Solution)", desc: "Highlight pain point, consequences of delay, direct fix" },
  { id: "AIDA (Attention-Interest-Desire-Action)", label: "AIDA (Attention - Interest - Desire - Action)", desc: "Attention hook -> Interest -> Proof metrics -> Frictionless CTA" },
  { id: "Question-First / Consultant", label: "Question-First / Consultant", desc: "Ask 2 clarifying technical questions before offering solution" },
  { id: "Case Study & Proof", label: "Case Study & Proof", desc: "Anchor proposal on a similar past project case study" },
];

export const StrategyControls: React.FC<StrategyControlsProps> = ({
  selectedTone,
  setSelectedTone,
  selectedFramework,
  setSelectedFramework,
  onGenerate,
  canGenerate,
  isGenerating,
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700 pb-2.5">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sliders className="w-4 h-4 text-[#14A800]" />
          Strategy & Persona Configuration
        </h3>
        <span className="text-[11px] text-slate-500 font-medium">Powered by Gemini AI</span>
      </div>

      {/* Copywriting Framework Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <Target className="w-3.5 h-3.5 text-[#14A800]" /> Proposal Framework
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FRAMEWORKS.map((fw) => {
            const isSelected = selectedFramework === fw.id;
            return (
              <button
                key={fw.id}
                type="button"
                onClick={() => setSelectedFramework(fw.id)}
                className={cn(
                  "p-2.5 rounded-lg border text-left transition-all",
                  isSelected
                    ? "border-[#14A800] bg-white dark:bg-slate-800 ring-2 ring-[#14A800]/20 shadow-sm"
                    : "border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800"
                )}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={cn("text-xs font-bold", isSelected ? "text-[#14A800]" : "text-slate-800 dark:text-slate-200")}>
                    {fw.label}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#14A800]" />}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{fw.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tone Pills */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-[#14A800]" /> Delivery Tone
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map((t) => {
            const isSelected = selectedTone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTone(t.id)}
                title={t.desc}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                  isSelected
                    ? "bg-[#14A800] text-white border-[#14A800] shadow-sm shadow-[#14A800]/30"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action CTA Button */}
      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate || isGenerating}
        className={cn(
          "w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2 shadow-md",
          canGenerate && !isGenerating
            ? "bg-[#14A800] hover:bg-[#118F00] shadow-[#14A800]/25 hover:shadow-lg hover:-translate-y-0.5"
            : "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed shadow-none"
        )}
      >
        <Sparkles className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
        {isGenerating ? "Crafting Strategy & Drafting Proposal..." : "Generate AI Proposal"}
      </button>
    </div>
  );
};
