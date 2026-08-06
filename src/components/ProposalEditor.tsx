import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Wand2, Sparkles, Save, Edit3, Eye, Send } from "lucide-react";
import { cn } from "../utils/cn";

interface ProposalEditorProps {
  proposalText: string;
  setProposalText: (text: string) => void;
  isGenerating: boolean;
  onRefine: (instruction: string) => void;
  onSaveToVault: () => void;
  savedInVault?: boolean;
}

const REFINEMENTS = [
  { label: "⚡ Make Shorter & Punchier", prompt: "Make the proposal 30% shorter, punchier, and remove any non-essential fluff." },
  { label: "🎯 Stronger Call to Action", prompt: "Add a crisp, high-converting low-friction Call to Action at the end asking a sharp technical question." },
  { label: "🛠️ Emphasize Tech Architecture", prompt: "Inject deeper technical architecture details and stack specific terms into the approach section." },
  { label: "⏱️ Highlight Speed & Timeline", prompt: "Emphasize fast delivery speed, immediate availability, and rapid milestones." },
  { label: "🛡️ Add Risk Guarantee", prompt: "Include a clear risk-reversal line guaranteeing quality or free revision iterations." },
];

export const ProposalEditor: React.FC<ProposalEditorProps> = ({
  proposalText,
  setProposalText,
  isGenerating,
  onRefine,
  onSaveToVault,
  savedInVault = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [pastedStatus, setPastedStatus] = useState<string | null>(null);
  const [isRawEdit, setIsRawEdit] = useState(false);
  const [customRefineInput, setCustomRefineInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(proposalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasteIntoUpwork = async () => {
    const extChrome = (window as any).chrome;
    if (typeof extChrome !== "undefined" && extChrome.tabs) {
      try {
        const [tab] = await extChrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          extChrome.tabs.sendMessage(tab.id, { action: "PASTE_COVER_LETTER", text: proposalText }, (res: any) => {
            if (extChrome.runtime.lastError || !res?.success) {
              handleCopy();
              alert("Copied to clipboard! (Ensure you are on the Upwork proposal submission tab).");
            } else {
              setPastedStatus("Pasted!");
              setTimeout(() => setPastedStatus(null), 2500);
            }
          });
        }
      } catch (e) {
        handleCopy();
      }
    } else {
      handleCopy();
      alert("Copied proposal to clipboard! Paste directly into Upwork form.");
    }
  };

  const handleApplyRefine = async (instruction: string) => {
    setIsRefining(true);
    try {
      await onRefine(instruction);
    } finally {
      setIsRefining(false);
    }
  };

  const handleCustomRefineSubmit = () => {
    if (!customRefineInput.trim()) return;
    handleApplyRefine(customRefineInput.trim());
    setCustomRefineInput("");
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Bar Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
            Generated Proposal Draft
          </h2>
          {proposalText && (
            <button
              onClick={() => setIsRawEdit(!isRawEdit)}
              className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded"
            >
              {isRawEdit ? <Eye className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
              {isRawEdit ? "Preview Markdown" : "Edit Raw Text"}
            </button>
          )}
        </div>

        {proposalText && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onSaveToVault}
              disabled={savedInVault}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border",
                savedInVault
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                  : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
              )}
            >
              <Save className="w-3.5 h-3.5" />
              {savedInVault ? "Saved" : "Save Vault"}
            </button>

            <button
              onClick={handleCopy}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#14A800]" />
                  <span className="text-[#14A800]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handlePasteIntoUpwork}
              className="bg-[#14A800] hover:bg-[#118F00] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-[#14A800]/20"
              title="Auto-fills proposal text directly into Upwork's application textarea on active tab"
            >
              {pastedStatus ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{pastedStatus}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Auto-Fill Upwork Form</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Editor / Markdown Body */}
      <div className="flex-1 min-h-[350px] relative bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 p-4 overflow-y-auto">
        {isGenerating || isRefining ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-16">
            <div className="w-9 h-9 border-4 border-[#14A800]/20 border-t-[#14A800] rounded-full animate-spin" />
            <p className="text-xs font-semibold animate-pulse text-slate-600 dark:text-slate-400">
              {isRefining ? "Refining proposal text with Gemini..." : "Writing customized cover letter..."}
            </p>
          </div>
        ) : proposalText ? (
          isRawEdit ? (
            <textarea
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              className="w-full h-full min-h-[300px] bg-transparent text-slate-900 dark:text-white font-mono text-xs outline-none leading-relaxed resize-none"
            />
          ) : (
            <div className="prose prose-sm dark:prose-invert prose-emerald max-w-none text-xs leading-relaxed">
              <ReactMarkdown>{proposalText}</ReactMarkdown>
            </div>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-16 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-medium">No proposal draft generated yet.</p>
            <p className="text-[11px] text-slate-400 max-w-xs">Fill in your job post details on the left and click "Generate AI Proposal".</p>
          </div>
        )}
      </div>

      {/* AI Refiner Controls Toolbar */}
      {proposalText && !isGenerating && (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Wand2 className="w-3.5 h-3.5 text-[#14A800]" />
            Quick AI Touch-ups & Refinements
          </div>

          <div className="flex flex-wrap gap-1.5">
            {REFINEMENTS.map((ref, idx) => (
              <button
                key={idx}
                disabled={isRefining}
                onClick={() => handleApplyRefine(ref.prompt)}
                className="bg-slate-100 dark:bg-slate-700/70 hover:bg-[#14A800]/10 hover:text-[#14A800] dark:hover:bg-[#14A800]/20 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all"
              >
                {ref.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <input
              type="text"
              value={customRefineInput}
              onChange={(e) => setCustomRefineInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCustomRefineSubmit()}
              placeholder="Custom AI instruction (e.g. 'Add a line about my experience with AWS deployment')"
              className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs outline-none focus:ring-1 focus:ring-[#14A800]"
            />
            <button
              onClick={handleCustomRefineSubmit}
              disabled={isRefining || !customRefineInput.trim()}
              className="bg-[#14A800] text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#118F00] transition-colors disabled:opacity-50"
            >
              Refine
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
