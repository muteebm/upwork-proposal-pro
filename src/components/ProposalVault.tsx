import React, { useState, useRef } from "react";
import { ProposalRecord, ProposalStatus } from "../types";
import { exportBackupJSON, importBackupJSON } from "../utils/storage";
import { Archive, Search, Copy, Check, ExternalLink, Trash2, Award, Calendar, Download, Upload } from "lucide-react";
import { cn } from "../utils/cn";

interface ProposalVaultProps {
  vault: ProposalRecord[];
  setVault: React.Dispatch<React.SetStateAction<ProposalRecord[]>>;
  onLoadIntoWorkspace: (record: ProposalRecord) => void;
  onDataImported?: () => void;
}

const STATUS_TAGS: ProposalStatus[] = ["Draft", "Submitted", "Interview", "Won", "Lost"];

const STATUS_STYLES: Record<ProposalStatus, string> = {
  Draft: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  Submitted: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900",
  Interview: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900",
  Won: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900",
  Lost: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900",
};

export const ProposalVault: React.FC<ProposalVaultProps> = ({
  vault,
  setVault,
  onLoadIntoWorkspace,
  onDataImported,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredVault = vault.filter((record) => {
    const matchesSearch =
      record.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.proposalText.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (id: string, newStatus: ProposalStatus) => {
    setVault((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  const handleDeleteRecord = (id: string) => {
    setVault((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importBackupJSON(text);
        setVault(imported.vault);
        if (onDataImported) onDataImported();
        alert("✅ Backup successfully imported! Profiles, Portfolio, and Vault updated.");
      } catch (err: any) {
        alert("⚠️ Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Backup Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <Archive className="w-4 h-4 text-[#14A800]" />
            Proposal Vault ({vault.length})
          </h2>
          <p className="text-xs text-slate-500">Track application status and manage JSON backups.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportBackupJSON()}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            title="Download JSON backup of all profiles, portfolios, and proposal history"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            title="Import JSON backup file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved proposals..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-[#14A800]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold outline-none"
        >
          <option value="All">All Statuses</option>
          {STATUS_TAGS.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Vault Record List */}
      {filteredVault.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
          No proposal records found in vault.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredVault.map((record) => (
            <div
              key={record.id}
              className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 flex-1">
                    {record.jobTitle}
                  </h3>
                  <select
                    value={record.status}
                    onChange={(e) => handleUpdateStatus(record.id, e.target.value as ProposalStatus)}
                    className={cn("text-[10px] font-extrabold px-2 py-0.5 rounded border outline-none", STATUS_STYLES[record.status])}
                  >
                    {STATUS_TAGS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(record.createdAt).toLocaleDateString()}
                  </span>
                  <span>Tone: {record.tone}</span>
                  {record.qualityScore && (
                    <span className="font-bold text-emerald-600 flex items-center gap-0.5">
                      <Award className="w-3 h-3" /> {record.qualityScore.overall}/100
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed font-sans bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                  {record.proposalText}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2.5">
                <button
                  onClick={() => onLoadIntoWorkspace(record)}
                  className="text-xs font-bold text-[#14A800] hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Load in Workspace
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(record.id, record.proposalText)}
                    className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700"
                  >
                    {copiedId === record.id ? <Check className="w-3 h-3 text-[#14A800]" /> : <Copy className="w-3 h-3" />}
                    {copiedId === record.id ? "Copied" : "Copy"}
                  </button>
                  <button
                    onClick={() => handleDeleteRecord(record.id)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
