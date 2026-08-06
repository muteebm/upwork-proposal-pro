import React, { useState } from "react";
import { JobDetails, JobRiskAnalysis } from "../types";
import { analyzeJobRisk } from "../utils/ai";
import { AlertTriangle, CheckCircle, ShieldAlert, Sparkles, RefreshCw, Info } from "lucide-react";
import { cn } from "../utils/cn";

interface RiskScannerCardProps {
  job: JobDetails;
}

export const RiskScannerCard: React.FC<RiskScannerCardProps> = ({ job }) => {
  const [analysis, setAnalysis] = useState<JobRiskAnalysis | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (!job.description.trim()) return;
    setIsScanning(true);
    try {
      const result = await analyzeJobRisk(job);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "HIGH":
        return {
          label: "HIGH RISK / CAUTION",
          color: "bg-rose-500 text-white border-rose-600",
          bg: "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900",
        };
      case "MODERATE":
        return {
          label: "MODERATE RISK",
          color: "bg-amber-500 text-white border-amber-600",
          bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900",
        };
      case "LOW":
      default:
        return {
          label: "SAFE / LOW RISK",
          color: "bg-emerald-500 text-white border-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900",
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
            Client Red-Flag & Risk Scanner
          </h3>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning || !job.description.trim()}
          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scan Job Post</span>
            </>
          )}
        </button>
      </div>

      {!analysis ? (
        <div className="text-center py-4 text-slate-400 text-xs bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-3">
          <p className="font-medium text-slate-600 dark:text-slate-400">Click "Scan Job Post" to analyze risk indicators.</p>
          <p className="text-[11px] mt-0.5 text-slate-400">Scans for scope creep keywords, budget mismatch, and client history red flags.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header Badge */}
          <div className={cn("p-3 rounded-xl border flex items-center justify-between", getRiskBadge(analysis.riskLevel).bg)}>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-bold">
                Contract Risk Score: {analysis.riskScore} / 100
              </span>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                {analysis.advice}
              </span>
            </div>
            <span className={cn("text-[10px] font-extrabold px-2.5 py-1 rounded-full border shrink-0", getRiskBadge(analysis.riskLevel).color)}>
              {getRiskBadge(analysis.riskLevel).label}
            </span>
          </div>

          {/* Red Flags & Green Signals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {analysis.redFlags.length > 0 && (
              <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 p-2.5 rounded-lg space-y-1">
                <div className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5" /> Red Flags ({analysis.redFlags.length})
                </div>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                  {analysis.redFlags.map((flag, idx) => (
                    <li key={idx} className="leading-tight">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.greenFlags.length > 0 && (
              <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 p-2.5 rounded-lg space-y-1">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5" /> Green Flags ({analysis.greenFlags.length})
                </div>
                <ul className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                  {analysis.greenFlags.map((flag, idx) => (
                    <li key={idx} className="leading-tight">• {flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
