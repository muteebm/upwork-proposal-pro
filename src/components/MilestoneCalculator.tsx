import React, { useState } from "react";
import { MilestonePlan, JobMilestone, JobDetails } from "../types";
import { generateMilestonePlan } from "../utils/ai";
import { DollarSign, Clock, Layers, Sparkles, Plus, Trash2, Check, ArrowRight } from "lucide-react";
import { cn } from "../utils/cn";

interface MilestoneCalculatorProps {
  job: JobDetails;
  onAppendToProposal: (milestonesMarkdown: string) => void;
}

export const MilestoneCalculator: React.FC<MilestoneCalculatorProps> = ({
  job,
  onAppendToProposal,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<MilestonePlan | null>(null);
  const [appended, setAppended] = useState(false);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setAppended(false);
    try {
      const generated = await generateMilestonePlan(
        job.title || "Custom Upwork Project",
        job.description || "Web App Development",
        job.budget || "$1500"
      );
      setPlan(generated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateMilestone = (id: string, field: keyof JobMilestone, value: any) => {
    if (!plan) return;
    setPlan({
      ...plan,
      milestones: plan.milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    });
  };

  const handleAddMilestone = () => {
    if (!plan) return;
    const newM: JobMilestone = {
      id: `m-${Date.now()}`,
      title: "New Milestone Phase",
      deliverables: ["Deliverable 1"],
      amount: 300,
      duration: "3-5 Days",
    };
    setPlan({ ...plan, milestones: [...plan.milestones, newM] });
  };

  const handleDeleteMilestone = (id: string) => {
    if (!plan) return;
    setPlan({ ...plan, milestones: plan.milestones.filter((m) => m.id !== id) });
  };

  const calculateTotal = () => {
    if (!plan) return 0;
    return plan.milestones.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
  };

  const handleAppendMarkdown = () => {
    if (!plan) return;
    const total = calculateTotal();
    let md = `\n\n### 💰 Proposed Fixed-Price Milestone Breakdown (Total: $${total})\n\n`;
    md += `| Phase | Deliverables & Focus | Estimated Timeline | Budget |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    plan.milestones.forEach((m) => {
      const delivs = m.deliverables.join(", ");
      md += `| **${m.title}** | ${delivs} | ${m.duration} | **$${m.amount}** |\n`;
    });
    if (plan.strategyNotes) {
      md += `\n*Note: ${plan.strategyNotes}*\n`;
    }

    onAppendToProposal(md);
    setAppended(true);
    setTimeout(() => setAppended(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-[#14A800]" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
            Milestone & Pricing Calculator
          </h3>
        </div>

        <button
          onClick={handleGeneratePlan}
          disabled={isGenerating}
          className="bg-[#14A800]/10 hover:bg-[#14A800]/20 text-[#14A800] border border-[#14A800]/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
          {isGenerating ? "Calculating Plan..." : "AI Auto-Generate Plan"}
        </button>
      </div>

      {!plan ? (
        <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-4">
          <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
          <p className="font-semibold text-slate-600 dark:text-slate-400">No milestone plan calculated yet.</p>
          <p className="text-[11px] mt-1">Click "AI Auto-Generate Plan" to structure job requirements into 3 fixed-bid milestones.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plan.strategyNotes && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-2.5 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              💡 {plan.strategyNotes}
            </div>
          )}

          {/* Milestones List */}
          <div className="space-y-2">
            {plan.milestones.map((m, idx) => (
              <div
                key={m.id}
                className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Phase {idx + 1}
                  </span>
                  <button
                    onClick={() => handleDeleteMilestone(m.id)}
                    className="text-slate-400 hover:text-red-500 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => handleUpdateMilestone(m.id, "title", e.target.value)}
                    placeholder="Milestone Title"
                    className="sm:col-span-6 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  />
                  <div className="sm:col-span-3 flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={m.duration}
                      onChange={(e) => handleUpdateMilestone(m.id, "duration", e.target.value)}
                      placeholder="Timeline"
                      className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-200 outline-none"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2">
                    <span className="text-xs font-bold text-emerald-600">$</span>
                    <input
                      type="number"
                      value={m.amount}
                      onChange={(e) => handleUpdateMilestone(m.id, "amount", Number(e.target.value))}
                      placeholder="Amount"
                      className="w-full bg-transparent text-xs font-bold text-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={m.deliverables.join(", ")}
                  onChange={(e) =>
                    handleUpdateMilestone(
                      m.id,
                      "deliverables",
                      e.target.value.split(",").map((s) => s.trim())
                    )
                  }
                  placeholder="Deliverables (comma separated)"
                  className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 outline-none"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleAddMilestone}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2.5 py-1.5 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" /> Add Phase
            </button>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Total Bid</span>
              <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                ${calculateTotal()} USD
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAppendMarkdown}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#14A800] hover:bg-[#118F00] text-white transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {appended ? (
              <>
                <Check className="w-4 h-4" />
                <span>Appended to Cover Letter Draft!</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" />
                <span>Append Milestone Table to Proposal Draft</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
