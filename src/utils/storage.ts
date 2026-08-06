import { Profile, PortfolioItem, ProposalRecord } from "../types";

const PROFILES_KEY = "upwork_pro_profiles";
const PORTFOLIO_KEY = "upwork_pro_portfolio";
const VAULT_KEY = "upwork_pro_vault";

export const DEFAULT_PROFILES: Profile[] = [
  {
    id: "profile-1",
    name: "Alex Morgan",
    title: "Senior Full-Stack Engineer & AI Developer",
    bio: "Full-stack developer with 7+ years of experience building modern React, TypeScript, and AI-powered web applications with high performance and clean UI.",
    skills: ["React", "TypeScript", "Node.js", "Gemini AI", "Tailwind CSS", "Next.js", "Python"],
    experience: "Built scalable SaaS apps serving over 100k users. Delivered 40+ Upwork projects with 100% Job Success Score.",
    hourlyRate: "$65/hr",
    isDefault: true,
  },
  {
    id: "profile-2",
    name: "Alex Morgan",
    title: "UI/UX & Mobile App Specialist",
    bio: "Mobile app craftsman creating sleek React Native & Flutter applications with intuitive UX and pixel-perfect animations.",
    skills: ["React Native", "Flutter", "Figma", "UI/UX Design", "Tailwind", "REST APIs"],
    experience: "Designed and engineered 15+ iOS/Android apps for YC-backed startups and growth SMBs.",
    hourlyRate: "$70/hr",
    isDefault: false,
  }
];

export const DEFAULT_PORTFOLIO: PortfolioItem[] = [
  {
    id: "port-1",
    title: "AI Commerce Assistant & Chatbot",
    description: "Built a real-time AI product recommendation chatbot integrated with Shopify store.",
    technologies: ["React", "TypeScript", "Gemini API", "Node.js"],
    liveUrl: "https://example.com/ai-commerce",
    metrics: "Increased store conversions by 32% within 30 days of release.",
  },
  {
    id: "port-2",
    title: "SaaS Analytics Dashboard & Data Visualizer",
    description: "High-performance React dashboard featuring custom charts, dark mode, and real-time WebSockets.",
    technologies: ["React", "Tailwind CSS", "Recharts", "TypeScript"],
    liveUrl: "https://example.com/saas-dashboard",
    metrics: "Reduced page load speeds from 3.2s to 600ms.",
  },
  {
    id: "port-3",
    title: "Cross-Platform Fitness & Habit Tracker App",
    description: "React Native application with offline sync, custom animated progress rings, and step tracking.",
    technologies: ["React Native", "Expo", "Redux Toolkit", "Node.js"],
    liveUrl: "https://example.com/fitness-app",
    metrics: "Achieved 4.9 star rating across 2,000+ app store reviews.",
  }
];

export const DEFAULT_VAULT: ProposalRecord[] = [
  {
    id: "proposal-sample-1",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    jobTitle: "Senior React & TypeScript Developer for SaaS Revamp",
    jobDescriptionSnippet: "Looking for an expert React dev to refactor existing dashboard and integrate new AI features...",
    proposalText: `Hi there!\n\nI read your job post for refactoring your SaaS dashboard and integrating AI capabilities. This is right in my wheelhouse—I recently rebuilt a SaaS dashboard in React & TypeScript that dropped load times down to 600ms and added Gemini AI features.\n\n### Here is how I would approach your project:\n1. **Code Audit & Cleanup**: Modularize key dashboard components for seamless state management.\n2. **AI Integration**: Implement streaming AI responses with graceful loading UI.\n3. **Polish & Specs**: Ensure crisp dark mode support and mobile responsiveness.\n\nWould you be open to a quick 10-minute chat to discuss your current codebase structure?\n\nBest,\nAlex Morgan`,
    status: "Won",
    tone: "Consultative",
    framework: "Hook & Value",
    profileName: "Alex Morgan",
    matchedPortfolioIds: ["port-1", "port-2"],
    qualityScore: {
      overall: 94,
      hookScore: 95,
      specificityScore: 92,
      valuePropScore: 96,
      ctaScore: 92,
      strengths: ["Strong relevant past result cited", "Clear 3-step execution plan", "Focused CTA"],
      feedback: ["Consider attaching a quick loom video link for even higher conversion."]
    }
  }
];

// Helper functions for LocalStorage
export function loadProfiles(): Profile[] {
  const saved = localStorage.getItem(PROFILES_KEY);
  if (!saved) {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
    return DEFAULT_PROFILES;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_PROFILES;
  }
}

export function saveProfiles(profiles: Profile[]): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function loadPortfolio(): PortfolioItem[] {
  const saved = localStorage.getItem(PORTFOLIO_KEY);
  if (!saved) {
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(DEFAULT_PORTFOLIO));
    return DEFAULT_PORTFOLIO;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_PORTFOLIO;
  }
}

export function savePortfolio(items: PortfolioItem[]): void {
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(items));
}

export function loadVault(): ProposalRecord[] {
  const saved = localStorage.getItem(VAULT_KEY);
  if (!saved) {
    localStorage.setItem(VAULT_KEY, JSON.stringify(DEFAULT_VAULT));
    return DEFAULT_VAULT;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_VAULT;
  }
}

export function saveVault(records: ProposalRecord[]): void {
  localStorage.setItem(VAULT_KEY, JSON.stringify(records));
}

export function exportBackupJSON(): void {
  const data = {
    version: "2.0",
    exportedAt: new Date().toISOString(),
    profiles: loadProfiles(),
    portfolio: loadPortfolio(),
    vault: loadVault(),
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonString);
  downloadAnchor.setAttribute("download", `proposal_pro_backup_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importBackupJSON(fileText: string): { profiles: Profile[]; portfolio: PortfolioItem[]; vault: ProposalRecord[] } {
  const parsed = JSON.parse(fileText);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid JSON file format");
  }

  const profiles = Array.isArray(parsed.profiles) ? parsed.profiles : loadProfiles();
  const portfolio = Array.isArray(parsed.portfolio) ? parsed.portfolio : loadPortfolio();
  const vault = Array.isArray(parsed.vault) ? parsed.vault : loadVault();

  saveProfiles(profiles);
  savePortfolio(portfolio);
  saveVault(vault);

  return { profiles, portfolio, vault };
}
