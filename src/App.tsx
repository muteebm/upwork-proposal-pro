import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { 
  Briefcase, 
  User, 
  Wand2, 
  Copy, 
  Check, 
  Plus,
  X,
  Sparkles,
  FileText,
  DollarSign,
  Code
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Profile {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  experience: string;
}

interface JobDetails {
  title: string;
  budget: string;
  skills: string;
  description: string;
}

const DEFAULT_PROFILE: Profile = {
  name: "",
  title: "",
  bio: "",
  skills: [],
  experience: "",
};

const DEFAULT_JOB: JobDetails = {
  title: "",
  budget: "",
  skills: "",
  description: "",
};

type Tab = "job" | "proposal" | "profile";

export default function App() {
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem("upwork_profile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [job, setJob] = useState<JobDetails>(DEFAULT_JOB);
  const [proposal, setProposal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("job");
  const [copied, setCopied] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    localStorage.setItem("upwork_profile", JSON.stringify(profile));
  }, [profile]);

  const isProfileValid = profile.bio.trim().length > 0;
  const isJobValid = job.description.trim().length > 0;
  const canGenerate = isProfileValid && isJobValid && !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    // switch to proposal tab immediately to show loading state
    setActiveTab("proposal");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
          You are an expert Upwork freelancer. Write a highly personalized, professional, and persuasive proposal for the following job description.
          
          MY PROFILE:
          Name: ${profile.name}
          Title: ${profile.title}
          Bio: ${profile.bio}
          Skills: ${profile.skills.join(", ")}
          Experience: ${profile.experience}

          JOB DETAILS:
          Title: ${job.title}
          Budget/Requirements: ${job.budget}
          Required Skills: ${job.skills}
          Description: ${job.description}

          INSTRUCTIONS:
          - Start with a strong hook that shows you've read the specific job details.
          - Address the client's specific pain points mentioned in the description.
          - Highlight relevant experience from my profile matching their required skills.
          - If they mentioned a budget/timeline, acknowledge it confidently.
          - Keep it concise but impactful.
          - Include a clear call to action.
          - Use a professional yet conversational tone.
          - Do not use generic placeholders like [Your Name] if the name is provided.
          - Format with markdown for readability.
        `,
      });

      setProposal(response.text || "Failed to generate proposal.");
    } catch (error) {
      console.error("Generation error:", error);
      setProposal("Error generating proposal. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addSkill = () => {
    if (newSkill && !profile.skills.includes(newSkill)) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill] });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleScrapePage = async () => {
    try {
      const extChrome = (window as any).chrome;
      if (typeof extChrome !== "undefined" && extChrome.tabs && extChrome.scripting) {
        const [tab] = await extChrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          const results = await extChrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
              let title = document.title.replace(' - Upwork', '').trim();
              const titleEl = document.querySelector('h1, h2, h3, h4');
              if (titleEl) title = (titleEl as HTMLElement).innerText.trim();
              
              let budget = "";
              const featuresList = document.querySelector('ul.features, ul.features-list, [data-test="job-features"]');
              if (featuresList) {
                const features = Array.from(featuresList.querySelectorAll('li, .group')).map(el => (el as HTMLElement).innerText.trim().replace(/\n+/g, ' '));
                if (features.length > 0) budget = features.filter(f => f.length < 100).join(' | ');
              }

              let description = "";
              const descSelectors = ['[data-test="Description"]', '.text-body-sm.multiline-text', '[data-test="job-description-text"]', '.job-description', '[data-ev-sublocation="job_description"]'];
              for (const sel of descSelectors) {
                const descEl = document.querySelector(sel);
                if (descEl) {
                  description = (descEl as HTMLElement).innerText.trim();
                  break;
                }
              }

              let skills = "";
              const skillChips = document.querySelectorAll('.skills-list a.air3-badge, .skills-list span.air3-badge, a.air3-badge, [data-test="skill"], span.up-skill-badge');
              if (skillChips.length > 0) {
                const uniqueSkills = new Set<string>();
                skillChips.forEach(el => {
                   const text = ((el as HTMLElement).innerText || "").replace(/\n/g, '').trim();
                   if (text && text.length < 40 && !text.includes('jobs')) uniqueSkills.add(text);
                });
                skills = Array.from(uniqueSkills).join(', ');
              }

              // Fallback
              if (!description || description.length < 20) {
                 const root = document.querySelector('main') || document.body;
                 description = (root as HTMLElement).innerText.substring(0, 8000);
              }

              return { title, budget, description, skills };
            },
          });
          
          if (results && results[0] && results[0].result) {
            setJob(results[0].result);
          }
        }
      } else {
        alert("This feature only works when running as a browser extension. For testing, fill fields manually.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to read the page. Make sure you are on a valid webpage and the extension has permissions.");
    }
  };

  const updateJobField = (field: keyof JobDetails, value: string) => {
    setJob(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full min-w-[450px] h-full min-h-[550px] bg-[#F9F9F9] text-[#1A1A1A] font-sans selection:bg-[#14A800]/20 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm shrink-0">
        <div className="w-full px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#14A800] rounded flex items-center justify-center shadow-sm">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <h1 className="text-base font-bold tracking-tight text-gray-800">Proposal Pro</h1>
          </div>
        </div>
        
        {/* Mobile-friendly Tabs */}
        <div className="flex border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab("job")}
            className={cn(
              "flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2",
              activeTab === "job" ? "border-[#14A800] text-[#14A800] bg-white" : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            Job Details
          </button>
          <button
            onClick={() => setActiveTab("proposal")}
            className={cn(
              "flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2",
              activeTab === "proposal" ? "border-[#14A800] text-[#14A800] bg-white" : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            Proposal
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2",
              activeTab === "profile" ? "border-[#14A800] text-[#14A800] bg-white" : "border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
          >
            Profile
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full mx-auto md:p-4 pb-12">
        <div className="h-full md:bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-200">
          <AnimatePresence mode="popLayout">
            {activeTab === "job" && (
              <motion.div
                key="job"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4 p-4 md:p-6"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#14A800]" />
                    Job Scope
                  </h2>
                  <button
                    onClick={handleScrapePage}
                    className="text-xs bg-[#14A800]/10 hover:bg-[#14A800]/20 text-[#14A800] px-3 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    Auto-Read
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Job Title</label>
                    <input
                      type="text"
                      value={job.title}
                      onChange={(e) => updateJobField("title", e.target.value)}
                      placeholder="e.g. Need a React Native Expert"
                      className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><DollarSign className="w-3 h-3"/> Budget / Info</label>
                      <input
                        type="text"
                        value={job.budget}
                        onChange={(e) => updateJobField("budget", e.target.value)}
                        placeholder="e.g. $50/hr"
                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Code className="w-3 h-3"/> Key Skills</label>
                      <input
                        type="text"
                        value={job.skills}
                        onChange={(e) => updateJobField("skills", e.target.value)}
                        placeholder="e.g. React"
                        className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><FileText className="w-3 h-3"/> Full Description</label>
                    <textarea
                      value={job.description}
                      onChange={(e) => updateJobField("description", e.target.value)}
                      placeholder="Paste the full job description here..."
                      className="w-full h-32 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all resize-none text-sm leading-relaxed bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                {!isProfileValid && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start mt-4 text-amber-800 text-xs shadow-sm">
                    <span className="text-amber-500 text-sm">⚠️</span>
                    <p>Go to your <strong>Profile</strong> tab to add your details first.</p>
                  </div>
                )}
                {isProfileValid && !isJobValid && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2 items-start mt-4 text-blue-800 text-xs shadow-sm">
                    <span className="text-blue-500 text-sm">ℹ️</span>
                    <p>Hit Auto-Read or paste a description to generate proposal.</p>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className={cn(
                    "w-full mt-2 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm text-sm uppercase tracking-wide",
                    canGenerate 
                      ? "bg-[#14A800] hover:bg-[#118F00] shadow-[#14A800]/20 hover:shadow-md hover:-translate-y-0.5" 
                      : "bg-gray-300 cursor-not-allowed text-gray-500"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Proposal
                </button>
              </motion.div>
            )}

            {activeTab === "proposal" && (
              <motion.div
                key="proposal"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col h-full min-h-[400px] p-4 md:p-6"
              >
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#14A800]" />
                    AI Proposal
                  </h2>
                  {proposal && !isGenerating && (
                    <button
                      onClick={copyToClipboard}
                      className="text-xs font-bold uppercase tracking-wider text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#14A800]" />
                          <span className="text-[#14A800]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 p-4 prose prose-sm prose-green max-w-none shadow-inner">
                  {isGenerating ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 py-12">
                      <div className="w-8 h-8 border-4 border-[#14A800]/20 border-t-[#14A800] rounded-full animate-spin" />
                      <p className="text-sm font-medium animate-pulse">Drafting the perfect proposal...</p>
                    </div>
                  ) : proposal ? (
                    <ReactMarkdown>{proposal}</ReactMarkdown>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 py-10 text-center px-4">
                      <Sparkles className="w-8 h-8 text-gray-300" />
                      <p className="text-[13px]">No proposal yet.</p>
                      <button 
                        onClick={() => setActiveTab("job")}
                        className="text-[#14A800] text-sm font-semibold hover:underline"
                      >
                        Go back to Job Details
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-5 p-4 md:p-6"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#14A800]" />
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Your Identity</h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500">Title</label>
                    <input
                      type="text"
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      placeholder="e.g. UI/UX Designer"
                      className="w-full p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Bio / Overview</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Your elevator pitch..."
                    className="w-full h-24 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all resize-none text-sm leading-relaxed bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Experience Highlights</label>
                  <textarea
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    placeholder="Key achievements..."
                    className="w-full h-24 p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all resize-none text-sm leading-relaxed bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500">Skills</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-[#14A800]/10 text-[#14A800] px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide flex items-center gap-1 border border-[#14A800]/20"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSkill()}
                      placeholder="Add a skill"
                      className="flex-1 p-2.5 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                    />
                    <button
                      onClick={addSkill}
                      className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-lg transition-all"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="text-center py-2 text-[10px] text-gray-400 bg-gray-50 border-t border-gray-100 shrink-0">
        Powered by Gemini AI • Auto-Reader enabled
      </div>
    </div>
  );
}
