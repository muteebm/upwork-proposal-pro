import React, { useState } from "react";
import { JobDetails, ScreeningQuestion } from "../types";
import { Briefcase, Wand2, DollarSign, Code, FileText, Plus, Trash2, HelpCircle, ShieldCheck } from "lucide-react";
import { scrapeUpworkJobPage } from "../utils/scraper";

interface JobDetailsFormProps {
  job: JobDetails;
  setJob: React.Dispatch<React.SetStateAction<JobDetails>>;
}

export const JobDetailsForm: React.FC<JobDetailsFormProps> = ({ job, setJob }) => {
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [newQuestionText, setNewQuestionText] = useState("");

  const updateField = (field: keyof JobDetails, value: any) => {
    setJob((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutoScrape = async () => {
    setIsScraping(true);
    setScrapeError(null);
    try {
      const scraped = await scrapeUpworkJobPage();
      setJob((prev) => ({
        ...prev,
        title: scraped.title || prev.title,
        budget: scraped.budget || prev.budget,
        skills: scraped.skills || prev.skills,
        description: scraped.description || prev.description,
        clientInfo: scraped.clientInfo || prev.clientInfo,
        screeningQuestions: scraped.screeningQuestions?.length ? scraped.screeningQuestions : prev.screeningQuestions,
      }));
    } catch (err: any) {
      console.warn("Scrape error:", err);
      setScrapeError(err.message || "Failed to auto-read webpage.");
    } finally {
      setIsScraping(false);
    }
  };

  const addScreeningQuestion = () => {
    if (!newQuestionText.trim()) return;
    const q: ScreeningQuestion = {
      id: `q-${Date.now()}`,
      question: newQuestionText.trim(),
    };
    const current = job.screeningQuestions || [];
    updateField("screeningQuestions", [...current, q]);
    setNewQuestionText("");
  };

  const removeScreeningQuestion = (id: string) => {
    const current = job.screeningQuestions || [];
    updateField(
      "screeningQuestions",
      current.filter((q) => q.id !== id)
    );
  };

  return (
    <div className="space-y-4">
      {/* Header & Scrape Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#14A800]" />
            Job Post Details
          </h2>
          <p className="text-xs text-slate-500">Paste the job description or auto-scrape from active Upwork tab.</p>
        </div>

        <button
          type="button"
          onClick={handleAutoScrape}
          disabled={isScraping}
          className="self-start sm:self-auto bg-[#14A800]/10 hover:bg-[#14A800]/20 text-[#14A800] border border-[#14A800]/30 px-3.5 py-1.5 rounded-lg transition-colors text-xs font-bold flex items-center gap-1.5"
        >
          <Wand2 className={`w-3.5 h-3.5 ${isScraping ? "animate-spin" : ""}`} />
          {isScraping ? "Reading Page..." : "Auto-Read Upwork Page"}
        </button>
      </div>

      {scrapeError && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg p-2.5 text-xs text-amber-800 dark:text-amber-300">
          ⚠️ {scrapeError}
        </div>
      )}

      {/* Basic Inputs */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Job Title</label>
          <input
            type="text"
            value={job.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g. Need Senior Full-Stack Developer for Next.js App"
            className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#14A800]" /> Budget / Payment Terms
            </label>
            <input
              type="text"
              value={job.budget}
              onChange={(e) => updateField("budget", e.target.value)}
              placeholder="e.g. $1,500 Fixed or $50-$75/hr"
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-[#14A800]" /> Required Skills
            </label>
            <input
              type="text"
              value={job.skills}
              onChange={(e) => updateField("skills", e.target.value)}
              placeholder="e.g. React, TypeScript, Tailwind, Gemini"
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-[#14A800]" /> Full Job Description
          </label>
          <textarea
            value={job.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Paste the full job post details here..."
            className="w-full h-32 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs leading-relaxed focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none resize-none"
          />
        </div>
      </div>

      {/* Client Metadata Insights */}
      {job.clientInfo && (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#14A800]" />
            Scraped Client Insights
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Rating</span>
              <span className="font-bold text-amber-500">{job.clientInfo.rating || "N/A"}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Total Spent</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{job.clientInfo.totalSpent || "N/A"}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Location</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{job.clientInfo.location || "N/A"}</span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block">Hire Rate</span>
              <span className="font-bold text-emerald-600">{job.clientInfo.hireRate || "N/A"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Custom Screening Questions */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[#14A800]" /> Client Screening Questions ({job.screeningQuestions?.length || 0})
          </label>
        </div>

        {job.screeningQuestions && job.screeningQuestions.length > 0 && (
          <div className="space-y-1.5 mb-2">
            {job.screeningQuestions.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between bg-slate-100 dark:bg-slate-800/80 p-2 rounded-lg text-xs text-slate-800 dark:text-slate-200"
              >
                <span className="truncate pr-2">• {q.question}</span>
                <button
                  onClick={() => removeScreeningQuestion(q.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addScreeningQuestion()}
            placeholder="Add Upwork screening question (e.g. 'Do you have experience with Stripe?')"
            className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#14A800]"
          />
          <button
            type="button"
            onClick={addScreeningQuestion}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>
    </div>
  );
};
