import React, { useState } from "react";
import { PortfolioItem } from "../types";
import { FolderKanban, Plus, ExternalLink, Trash2, Edit2, X, Code, TrendingUp } from "lucide-react";

interface PortfolioManagerProps {
  portfolio: PortfolioItem[];
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioItem[]>>;
}

export const PortfolioManager: React.FC<PortfolioManagerProps> = ({
  portfolio,
  setPortfolio,
}) => {
  const [editingItem, setEditingItem] = useState<Partial<PortfolioItem> | null>(null);
  const [newTech, setNewTech] = useState("");

  const handleStartCreate = () => {
    setEditingItem({
      id: `port-${Date.now()}`,
      title: "",
      description: "",
      technologies: [],
      liveUrl: "",
      metrics: "",
    });
  };

  const handleStartEdit = (item: PortfolioItem) => {
    setEditingItem({ ...item });
  };

  const handleSaveItem = () => {
    if (!editingItem || !editingItem.title?.trim() || !editingItem.description?.trim()) {
      alert("Please provide at least a project title and description.");
      return;
    }

    const completeItem: PortfolioItem = {
      id: editingItem.id || `port-${Date.now()}`,
      title: editingItem.title.trim(),
      description: editingItem.description.trim(),
      technologies: editingItem.technologies || [],
      liveUrl: editingItem.liveUrl?.trim() || "",
      metrics: editingItem.metrics?.trim() || "",
    };

    setPortfolio((prev) => {
      const exists = prev.some((p) => p.id === completeItem.id);
      if (exists) {
        return prev.map((p) => (p.id === completeItem.id ? completeItem : p));
      }
      return [...prev, completeItem];
    });

    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    setPortfolio((prev) => prev.filter((p) => p.id !== id));
  };

  const addTech = () => {
    if (newTech.trim() && editingItem) {
      const current = editingItem.technologies || [];
      if (!current.includes(newTech.trim())) {
        setEditingItem({ ...editingItem, technologies: [...current, newTech.trim()] });
      }
      setNewTech("");
    }
  };

  const removeTech = (tech: string) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        technologies: (editingItem.technologies || []).filter((t) => t !== tech),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-[#14A800]" />
            Portfolio Case Studies ({portfolio.length})
          </h2>
          <p className="text-xs text-slate-500">Save your best case studies to auto-match against client job requirements.</p>
        </div>

        <button
          onClick={handleStartCreate}
          className="bg-[#14A800] hover:bg-[#118F00] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add Case Study
        </button>
      </div>

      {/* Grid of Portfolio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {portfolio.map((item) => (
          <div
            key={item.id}
            className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{item.title}</h3>
                {item.liveUrl && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-[#14A800] p-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>

              {item.metrics && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-2 rounded-lg text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.metrics}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1 pt-1">
                {item.technologies.map((t) => (
                  <span
                    key={t}
                    className="bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200/60 dark:border-slate-700/60 pt-2.5">
              <button
                onClick={() => handleStartEdit(item)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="text-slate-400 hover:text-red-500 p-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {editingItem.id ? "Edit Case Study" : "Add Case Study"}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Project Title</label>
                <input
                  type="text"
                  value={editingItem.title || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Real-Time AI SaaS Analytics Dashboard"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#14A800]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Summary / Description</label>
                <textarea
                  value={editingItem.description || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="What was built, key challenges overcome, and main outcome..."
                  className="w-full h-24 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#14A800] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Key Impact Metric (Optional)</label>
                <input
                  type="text"
                  value={editingItem.metrics || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, metrics: e.target.value })}
                  placeholder="e.g. Increased store conversion rate by 34%"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#14A800]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Live URL / Demo Link (Optional)</label>
                <input
                  type="text"
                  value={editingItem.liveUrl || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, liveUrl: e.target.value })}
                  placeholder="e.g. https://myprojectdemo.com"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#14A800]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Tech Stack Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editingItem.technologies || []).map((t) => (
                    <span
                      key={t}
                      className="bg-[#14A800]/10 text-[#14A800] px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 border border-[#14A800]/20"
                    >
                      {t}
                      <button onClick={() => removeTech(t)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTech()}
                    placeholder="Add tech tag (e.g. React, Gemini, Stripe)"
                    className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTech}
                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 px-3 py-2 rounded-lg text-xs font-bold"
                  >
                    Add Tag
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItem}
                className="bg-[#14A800] hover:bg-[#118F00] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm"
              >
                Save Case Study
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
