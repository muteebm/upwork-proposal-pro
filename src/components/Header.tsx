import React from "react";
import { Profile } from "../types";
import { Sparkles, UserCheck, Layers } from "lucide-react";

interface HeaderProps {
  activeProfile?: Profile;
  profilesCount: number;
  onOpenProfiles: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProfile,
  profilesCount,
  onOpenProfiles,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 shadow-xs px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-[#14A800] to-[#0E7A00] rounded-lg flex items-center justify-center shadow-md shadow-[#14A800]/20">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Proposal Pro
              </h1>
              <span className="bg-[#14A800]/10 text-[#14A800] text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              AI Upwork Cover Letter & Strategy Workbench
            </p>
          </div>
        </div>

        {/* Active Profile Status Badge */}
        <div className="flex items-center gap-3">
          {activeProfile ? (
            <button
              onClick={onOpenProfiles}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-all text-left"
              title="Click to switch or edit profiles"
            >
              <div className="w-6 h-6 rounded-full bg-[#14A800]/20 text-[#14A800] flex items-center justify-center font-bold text-xs">
                {activeProfile.name.charAt(0)}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px] sm:max-w-[180px]">
                  {activeProfile.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[120px] sm:max-w-[180px]">
                  {activeProfile.title}
                </div>
              </div>
              <UserCheck className="w-3.5 h-3.5 text-[#14A800] ml-1 hidden sm:block" />
            </button>
          ) : (
            <button
              onClick={onOpenProfiles}
              className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              Select Profile ({profilesCount})
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
