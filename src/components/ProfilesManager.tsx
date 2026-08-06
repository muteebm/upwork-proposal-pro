import React, { useState } from "react";
import { Profile } from "../types";
import { User, Plus, Check, Trash2, Edit2, Star, X } from "lucide-react";
import { cn } from "../utils/cn";

interface ProfilesManagerProps {
  profiles: Profile[];
  setProfiles: React.Dispatch<React.SetStateAction<Profile[]>>;
  activeProfileId: string;
  setActiveProfileId: (id: string) => void;
}

export const ProfilesManager: React.FC<ProfilesManagerProps> = ({
  profiles,
  setProfiles,
  activeProfileId,
  setActiveProfileId,
}) => {
  const [editingProfile, setEditingProfile] = useState<Partial<Profile> | null>(null);
  const [newSkill, setNewSkill] = useState("");

  const handleStartCreate = () => {
    setEditingProfile({
      id: `profile-${Date.now()}`,
      name: "",
      title: "",
      bio: "",
      skills: [],
      experience: "",
      hourlyRate: "$50/hr",
      isDefault: false,
    });
  };

  const handleStartEdit = (p: Profile) => {
    setEditingProfile({ ...p });
  };

  const handleSaveProfile = () => {
    if (!editingProfile || !editingProfile.name?.trim() || !editingProfile.bio?.trim()) {
      alert("Please provide at least a name and bio.");
      return;
    }

    const completeProfile: Profile = {
      id: editingProfile.id || `profile-${Date.now()}`,
      name: editingProfile.name.trim(),
      title: editingProfile.title?.trim() || "Freelancer Specialist",
      bio: editingProfile.bio.trim(),
      skills: editingProfile.skills || [],
      experience: editingProfile.experience?.trim() || "",
      hourlyRate: editingProfile.hourlyRate?.trim() || "$50/hr",
      isDefault: editingProfile.isDefault || false,
    };

    setProfiles((prev) => {
      const exists = prev.some((p) => p.id === completeProfile.id);
      if (exists) {
        return prev.map((p) => (p.id === completeProfile.id ? completeProfile : p));
      }
      return [...prev, completeProfile];
    });

    if (profiles.length === 0 || completeProfile.isDefault) {
      setActiveProfileId(completeProfile.id);
    }

    setEditingProfile(null);
  };

  const handleDeleteProfile = (id: string) => {
    if (profiles.length <= 1) {
      alert("You must keep at least one profile.");
      return;
    }
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (activeProfileId === id) {
      const remaining = profiles.filter((p) => p.id !== id);
      if (remaining.length > 0) setActiveProfileId(remaining[0].id);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && editingProfile) {
      const skills = editingProfile.skills || [];
      if (!skills.includes(newSkill.trim())) {
        setEditingProfile({ ...editingProfile, skills: [...skills, newSkill.trim()] });
      }
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    if (editingProfile) {
      setEditingProfile({
        ...editingProfile,
        skills: (editingProfile.skills || []).filter((s) => s !== skill),
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest flex items-center gap-2">
            <User className="w-4 h-4 text-[#14A800]" />
            Freelancer Personas & Profiles ({profiles.length})
          </h2>
          <p className="text-xs text-slate-500">Create multiple niche profiles tailored for different job categories.</p>
        </div>

        <button
          onClick={handleStartCreate}
          className="bg-[#14A800] hover:bg-[#118F00] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> New Profile
        </button>
      </div>

      {/* Profiles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {profiles.map((p) => {
          const isActive = p.id === activeProfileId;
          return (
            <div
              key={p.id}
              className={cn(
                "p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3",
                isActive
                  ? "bg-white dark:bg-slate-800 border-[#14A800] ring-2 ring-[#14A800]/20 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</span>
                      {isActive && (
                        <span className="bg-[#14A800]/10 text-[#14A800] text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Active Profile
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{p.title}</p>
                  </div>

                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                    {p.hourlyRate || "$50/hr"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{p.bio}</p>

                <div className="flex flex-wrap gap-1">
                  {p.skills.map((s) => (
                    <span
                      key={s}
                      className="bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-2.5">
                {!isActive && (
                  <button
                    onClick={() => setActiveProfileId(p.id)}
                    className="text-xs font-bold text-[#14A800] hover:underline flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" /> Select as Active
                  </button>
                )}
                {isActive && <div />}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartEdit(p)}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(p.id)}
                    className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Profile Modal Dialog */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {editingProfile.id ? "Edit Profile Persona" : "Create Profile Persona"}
              </h3>
              <button
                onClick={() => setEditingProfile(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={editingProfile.name || ""}
                    onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                    placeholder="e.g. Alex Morgan"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#14A800]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Professional Title</label>
                  <input
                    type="text"
                    value={editingProfile.title || ""}
                    onChange={(e) => setEditingProfile({ ...editingProfile, title: e.target.value })}
                    placeholder="e.g. Senior React & AI Developer"
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#14A800]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Hourly Rate</label>
                <input
                  type="text"
                  value={editingProfile.hourlyRate || ""}
                  onChange={(e) => setEditingProfile({ ...editingProfile, hourlyRate: e.target.value })}
                  placeholder="e.g. $65/hr"
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#14A800]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Bio / Summary Overview</label>
                <textarea
                  value={editingProfile.bio || ""}
                  onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                  placeholder="Summarize your key background, value proposition, and track record..."
                  className="w-full h-24 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#14A800] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Experience Highlights</label>
                <textarea
                  value={editingProfile.experience || ""}
                  onChange={(e) => setEditingProfile({ ...editingProfile, experience: e.target.value })}
                  placeholder="Key metrics, major client wins, or YC/Enterprise experience..."
                  className="w-full h-20 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#14A800] resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Skills</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editingProfile.skills || []).map((s) => (
                    <span
                      key={s}
                      className="bg-[#14A800]/10 text-[#14A800] px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 border border-[#14A800]/20"
                    >
                      {s}
                      <button onClick={() => removeSkill(s)} className="hover:text-red-500">
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
                    placeholder="Add a skill (e.g. Next.js)"
                    className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 px-3 py-2 rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="bg-[#14A800] hover:bg-[#118F00] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm"
              >
                Save Profile Persona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
