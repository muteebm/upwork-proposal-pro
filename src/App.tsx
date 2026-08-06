import React, { useState, useEffect } from "react";
import { 
  Profile, 
  PortfolioItem, 
  JobDetails, 
  ProposalRecord, 
  Tone, 
  Framework, 
  QualityScore, 
  ActiveTab 
} from "./types";
import { 
  loadProfiles, 
  saveProfiles, 
  loadPortfolio, 
  savePortfolio, 
  loadVault, 
  saveVault 
} from "./utils/storage";
import { generateProposal, refineProposal, evaluateProposal } from "./utils/ai";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { JobDetailsForm } from "./components/JobDetailsForm";
import { StrategyControls } from "./components/StrategyControls";
import { MilestoneCalculator } from "./components/MilestoneCalculator";
import { RiskScannerCard } from "./components/RiskScannerCard";
import { ProposalEditor } from "./components/ProposalEditor";
import { QualityScoreCard } from "./components/QualityScoreCard";
import { ProfilesManager } from "./components/ProfilesManager";
import { PortfolioManager } from "./components/PortfolioManager";
import { ProposalVault } from "./components/ProposalVault";
import { motion, AnimatePresence } from "motion/react";

const DEFAULT_JOB: JobDetails = {
  title: "",
  budget: "",
  skills: "",
  description: "",
  screeningQuestions: [],
};

export default function App() {
  const [profiles, setProfiles] = useState<Profile[]>(() => loadProfiles());
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    const list = loadProfiles();
    const def = list.find((p) => p.isDefault) || list[0];
    return def ? def.id : "";
  });

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => loadPortfolio());
  const [vault, setVault] = useState<ProposalRecord[]>(() => loadVault());

  const [job, setJob] = useState<JobDetails>(DEFAULT_JOB);
  const [tone, setTone] = useState<Tone>("Consultative");
  const [framework, setFramework] = useState<Framework>("Hook & Value");
  const [proposalText, setProposalText] = useState("");
  const [qualityScore, setQualityScore] = useState<QualityScore | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<ActiveTab>("job");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [savedInVault, setSavedInVault] = useState(false);

  // Sync LocalStorage
  useEffect(() => {
    saveProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    savePortfolio(portfolio);
  }, [portfolio]);

  useEffect(() => {
    saveVault(vault);
  }, [vault]);

  const refreshStateFromStorage = () => {
    setProfiles(loadProfiles());
    setPortfolio(loadPortfolio());
    setVault(loadVault());
  };

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0];
  const canGenerate = Boolean(activeProfile && job.description.trim().length > 10 && !isGenerating);

  const handleGenerate = async () => {
    if (!canGenerate || !activeProfile) return;

    setIsGenerating(true);
    setSavedInVault(false);
    setActiveTab("proposal");

    try {
      const result = await generateProposal({
        profile: activeProfile,
        portfolioItems: portfolio,
        job,
        tone,
        framework,
      });

      setProposalText(result.proposalText);

      // Evaluate score asynchronously
      setIsEvaluating(true);
      const score = await evaluateProposal(result.proposalText, job.description);
      setQualityScore(score);
      setIsEvaluating(false);
    } catch (err: any) {
      console.error("Proposal generation error:", err);
      alert(err.message || "Failed to generate proposal.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async (instruction: string) => {
    if (!proposalText) return;
    setIsGenerating(true);
    try {
      const updated = await refineProposal(proposalText, instruction);
      setProposalText(updated);
      setSavedInVault(false);

      // Re-evaluate score
      setIsEvaluating(true);
      const score = await evaluateProposal(updated, job.description);
      setQualityScore(score);
      setIsEvaluating(false);
    } catch (err: any) {
      console.error("Refine error:", err);
      alert(err.message || "Failed to refine proposal.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAppendMilestones = (milestonesMarkdown: string) => {
    setProposalText((prev) => prev + milestonesMarkdown);
    setSavedInVault(false);
  };

  const handleSaveToVault = () => {
    if (!proposalText || savedInVault) return;

    const newRecord: ProposalRecord = {
      id: `proposal-${Date.now()}`,
      createdAt: new Date().toISOString(),
      jobTitle: job.title || "Custom Job Post",
      jobDescriptionSnippet: job.description.substring(0, 120) + "...",
      proposalText,
      status: "Submitted",
      tone,
      framework,
      qualityScore,
      profileName: activeProfile ? activeProfile.name : "Freelancer",
    };

    setVault((prev) => [newRecord, ...prev]);
    setSavedInVault(true);
  };

  const handleLoadRecordIntoWorkspace = (record: ProposalRecord) => {
    setJob((prev) => ({
      ...prev,
      title: record.jobTitle,
      description: record.jobDescriptionSnippet,
    }));
    setProposalText(record.proposalText);
    setTone(record.tone);
    setFramework(record.framework);
    setQualityScore(record.qualityScore);
    setSavedInVault(true);
    setActiveTab("proposal");
  };

  return (
    <div className="w-full min-h-[580px] h-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#14A800]/20 flex flex-col">
      <Header
        activeProfile={activeProfile}
        profilesCount={profiles.length}
        onOpenProfiles={() => setActiveTab("profiles")}
      />

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row overflow-hidden p-2 sm:p-4 gap-3">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          proposalCount={vault.length}
          hasGeneratedProposal={Boolean(proposalText)}
        />

        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-5 shadow-xs">
          <AnimatePresence mode="popLayout">
            {activeTab === "job" && (
              <motion.div
                key="job"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4"
              >
                <div className="md:col-span-7 space-y-4">
                  <JobDetailsForm job={job} setJob={setJob} />
                  <RiskScannerCard job={job} />
                </div>
                <div className="md:col-span-5 space-y-4">
                  <StrategyControls
                    selectedTone={tone}
                    setSelectedTone={setTone}
                    selectedFramework={framework}
                    setSelectedFramework={setFramework}
                    onGenerate={handleGenerate}
                    canGenerate={canGenerate}
                    isGenerating={isGenerating}
                  />
                  <MilestoneCalculator job={job} onAppendToProposal={handleAppendMilestones} />
                </div>
              </motion.div>
            )}

            {activeTab === "proposal" && (
              <motion.div
                key="proposal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full"
              >
                <div className="md:col-span-7 space-y-4 flex flex-col h-full">
                  <ProposalEditor
                    proposalText={proposalText}
                    setProposalText={setProposalText}
                    isGenerating={isGenerating}
                    onRefine={handleRefine}
                    onSaveToVault={handleSaveToVault}
                    savedInVault={savedInVault}
                  />
                </div>

                <div className="md:col-span-5 space-y-4">
                  <QualityScoreCard
                    score={qualityScore}
                    isEvaluating={isEvaluating}
                    onReEvaluate={async () => {
                      if (!proposalText) return;
                      setIsEvaluating(true);
                      const sc = await evaluateProposal(proposalText, job.description);
                      setQualityScore(sc);
                      setIsEvaluating(false);
                    }}
                  />
                  <MilestoneCalculator job={job} onAppendToProposal={handleAppendMilestones} />
                </div>
              </motion.div>
            )}

            {activeTab === "profiles" && (
              <motion.div
                key="profiles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ProfilesManager
                  profiles={profiles}
                  setProfiles={setProfiles}
                  activeProfileId={activeProfileId}
                  setActiveProfileId={setActiveProfileId}
                />
              </motion.div>
            )}

            {activeTab === "portfolio" && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PortfolioManager portfolio={portfolio} setPortfolio={setPortfolio} />
              </motion.div>
            )}

            {activeTab === "vault" && (
              <motion.div
                key="vault"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ProposalVault
                  vault={vault}
                  setVault={setVault}
                  onLoadIntoWorkspace={handleLoadRecordIntoWorkspace}
                  onDataImported={refreshStateFromStorage}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <footer className="text-center py-2.5 text-[11px] text-slate-400 dark:text-slate-600 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        Upwork Proposal Pro v2.0 • Gemini 2.5 Flash • Smart Strategy Engine
      </footer>
    </div>
  );
}
