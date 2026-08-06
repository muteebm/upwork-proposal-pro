export interface Profile {
  id: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  experience: string;
  hourlyRate?: string;
  isDefault?: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  metrics?: string; // e.g. "Increased conversions by 40%"
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  answer?: string;
}

export interface ClientMetadata {
  rating?: string; // e.g. "4.95"
  totalSpent?: string; // e.g. "$50k+"
  location?: string; // e.g. "United States"
  hireRate?: string; // e.g. "85%"
}

export interface JobDetails {
  title: string;
  budget: string;
  skills: string;
  description: string;
  clientInfo?: ClientMetadata;
  screeningQuestions?: ScreeningQuestion[];
}

export type Tone = 
  | "Consultative"
  | "Startup High-Energy"
  | "Direct & Concise"
  | "Technical Expert"
  | "Storyteller"
  | "Friendly & Warm";

export type Framework = 
  | "Hook & Value" 
  | "PAS (Problem-Agitate-Solution)" 
  | "AIDA (Attention-Interest-Desire-Action)" 
  | "Question-First / Consultant" 
  | "Case Study & Proof";

export type ProposalStatus = "Draft" | "Submitted" | "Interview" | "Won" | "Lost";

export interface QualityScore {
  overall: number; // 0 to 100
  hookScore: number; // 0 to 100
  specificityScore: number; // 0 to 100
  valuePropScore: number; // 0 to 100
  ctaScore: number; // 0 to 100
  feedback: string[];
  strengths: string[];
}

export interface JobMilestone {
  id: string;
  title: string;
  deliverables: string[];
  amount: number;
  duration: string;
}

export interface MilestonePlan {
  totalBudget: number;
  currency: string;
  milestones: JobMilestone[];
  strategyNotes: string;
}

export type RiskLevel = "LOW" | "MODERATE" | "HIGH";

export interface JobRiskAnalysis {
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100 (0 = safe, 100 = dangerous)
  redFlags: string[];
  greenFlags: string[];
  advice: string;
}

export interface ProposalRecord {
  id: string;
  createdAt: string;
  jobTitle: string;
  jobDescriptionSnippet: string;
  proposalText: string;
  status: ProposalStatus;
  tone: Tone;
  framework: Framework;
  qualityScore?: QualityScore;
  profileName: string;
  matchedPortfolioIds?: string[];
  screeningAnswers?: { question: string; answer: string }[];
}

export type ActiveTab = "job" | "proposal" | "profiles" | "portfolio" | "vault";
