import React from "react";
import { ActiveTab } from "../types";
import { Briefcase, FileText, User, FolderKanban, Archive } from "lucide-react";
import { cn } from "../utils/cn";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  proposalCount?: number;
  hasGeneratedProposal?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  proposalCount = 0,
  hasGeneratedProposal = false,
}) => {
  const tabs = [
    {
      id: "job" as ActiveTab,
      label: "Job & Strategy",
      icon: Briefcase,
      badge: null,
    },
    {
      id: "proposal" as ActiveTab,
      label: "Proposal Draft",
      icon: FileText,
      badge: hasGeneratedProposal ? "Ready" : null,
      highlight: hasGeneratedProposal,
    },
    {
      id: "profiles" as ActiveTab,
      label: "Profiles",
      icon: User,
      badge: null,
    },
    {
      id: "portfolio" as ActiveTab,
      label: "Portfolio",
      icon: FolderKanban,
      badge: null,
    },
    {
      id: "vault" as ActiveTab,
      label: "Proposal Vault",
      icon: Archive,
      badge: proposalCount > 0 ? `${proposalCount}` : null,
    },
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 shrink-0 w-full md:w-60 p-2 md:p-3 flex md:flex-col justify-between">
      <div className="flex md:flex-col gap-1 w-full overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-medium text-xs transition-all whitespace-nowrap md:w-full",
                isActive
                  ? "bg-[#14A800] text-white shadow-md shadow-[#14A800]/20 font-bold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-500 dark:text-slate-400")} />
              <span className="flex-1 text-left">{tab.label}</span>

              {tab.badge && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-extrabold",
                    isActive
                      ? "bg-white/20 text-white"
                      : tab.highlight
                      ? "bg-[#14A800] text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
