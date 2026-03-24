/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import { 
  Briefcase, 
  User, 
  Wand2, 
  Copy, 
  Check, 
  Save, 
  Trash2, 
  Plus,
  X,
  Sparkles,
  LayoutDashboard,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface Profile {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  experience: string;
}

const DEFAULT_PROFILE: Profile = {
  name: "",
  title: "",
  bio: "",
  skills: [],
  experience: "",
};

export default function App() {
  const [profile, setProfile] = useState<Profile>(() => {
    const saved = localStorage.getItem("upwork_profile");
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [jobDescription, setJobDescription] = useState("");
  const [proposal, setProposal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"generator" | "profile">("generator");
  const [copied, setCopied] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    localStorage.setItem("upwork_profile", JSON.stringify(profile));
  }, [profile]);

  const isProfileValid = profile.bio.trim().length > 0;
  const isJobValid = jobDescription.trim().length > 0;
  const canGenerate = isProfileValid && isJobValid && !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
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

          JOB DESCRIPTION:
          ${jobDescription}

          INSTRUCTIONS:
          - Start with a strong hook that shows you've read the job description.
          - Address the client's specific pain points.
          - Highlight relevant experience from my profile.
          - Keep it concise but impactful.
          - Include a clear call to action.
          - Use a professional yet conversational tone.
          - Do not use generic placeholders like [Your Name] if the name is provided in the profile.
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

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-[#14A800]/20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#14A800] rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Upwork Proposal Pro</h1>
          </div>
          
          <nav className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("generator")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === "generator" 
                  ? "bg-white text-[#14A800] shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Generator
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                activeTab === "profile" 
                  ? "bg-white text-[#14A800] shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Settings className="w-4 h-4" />
              Profile
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "generator" ? (
            <motion.div
              key="generator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Input Section */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5 text-[#14A800]" />
                    <h2 className="font-semibold">Job Description</h2>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the Upwork job description here..."
                    className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all resize-none text-sm leading-relaxed"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={!canGenerate}
                    className={cn(
                      "w-full mt-4 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg",
                      canGenerate 
                        ? "bg-[#14A800] hover:bg-[#118F00] shadow-[#14A800]/20" 
                        : "bg-gray-300 cursor-not-allowed shadow-none"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Generate Proposal
                      </>
                    )}
                  </button>
                </div>

                {!isProfileValid && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                    <div className="text-amber-500 mt-0.5">⚠️</div>
                    <p className="text-sm text-amber-800">
                      Your <strong>Profile Bio</strong> is missing. Go to the <strong>Profile</strong> tab and fill it in to enable the generator.
                    </p>
                  </div>
                )}
                {isProfileValid && !isJobValid && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
                    <div className="text-blue-500 mt-0.5">ℹ️</div>
                    <p className="text-sm text-blue-800">
                      Paste a <strong>Job Description</strong> above to start generating your proposal.
                    </p>
                  </div>
                )}
              </div>

              {/* Output Section */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 min-h-[400px] flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#14A800]" />
                      <h2 className="font-semibold">Generated Proposal</h2>
                    </div>
                    {proposal && (
                      <button
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-500 flex items-center gap-2 text-sm"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4 text-[#14A800]" />
                            <span className="text-[#14A800]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex-1 prose prose-sm max-w-none overflow-y-auto max-h-[500px] p-4 bg-gray-50 rounded-xl border border-gray-100">
                    {proposal ? (
                      <ReactMarkdown>{proposal}</ReactMarkdown>
                    ) : (
                      <div className="h-full flex flex-col items-start text-gray-500 space-y-4 p-2">
                        <div className="flex items-center gap-2 text-[#14A800]">
                          <Sparkles className="w-5 h-5" />
                          <h3 className="font-semibold">How to use</h3>
                        </div>
                        <ol className="list-decimal list-inside space-y-3 text-sm leading-relaxed">
                          <li>
                            Go to the <span className="font-semibold text-[#14A800]">Profile</span> tab and fill in your professional details. This only needs to be done once.
                          </li>
                          <li>
                            Find a job on Upwork and <span className="font-semibold">copy the full description</span>.
                          </li>
                          <li>
                            Paste it into the <span className="font-semibold">Job Description</span> box on the left.
                          </li>
                          <li>
                            Click <span className="font-semibold text-[#14A800]">Generate Proposal</span>.
                          </li>
                          <li>
                            Review, copy, and paste it into your Upwork application!
                          </li>
                        </ol>
                        <div className="pt-4 p-4 bg-[#14A800]/5 rounded-xl border border-[#14A800]/10 w-full">
                          <p className="text-xs italic text-[#14A800]">
                            Tip: The more detailed your profile bio is, the better and more personalized the AI-generated proposal will be.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl mx-auto"
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 space-y-8">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <User className="w-6 h-6 text-[#14A800]" />
                  <h2 className="text-xl font-semibold">Your Freelancer Profile</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Professional Title</label>
                    <input
                      type="text"
                      value={profile.title}
                      onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      placeholder="e.g. Full Stack Developer"
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Professional Bio / Overview</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Describe your expertise, achievements, and unique value proposition..."
                    className="w-full h-40 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Experience Highlights</label>
                  <textarea
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    placeholder="List key projects, years of experience, or notable clients..."
                    className="w-full h-32 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all resize-none text-sm leading-relaxed"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Skills</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-[#14A800]/10 text-[#14A800] px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border border-[#14A800]/20"
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
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      placeholder="Add a skill (e.g. React, Python)"
                      className="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#14A800]/20 focus:border-[#14A800] outline-none transition-all text-sm"
                    />
                    <button
                      onClick={addSkill}
                      className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-all"
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setActiveTab("generator")}
                    className="bg-[#14A800] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#118F00] transition-all flex items-center gap-2 shadow-lg shadow-[#14A800]/20"
                  >
                    <Save className="w-4 h-4" />
                    Save & Go to Generator
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 text-center text-gray-400 text-xs">
        <p>© 2026 Upwork Proposal Pro. Powered by Gemini AI.</p>
        <p className="mt-1 italic">Built for personal use and open-source potential.</p>
      </footer>
    </div>
  );
}
