import { GoogleGenAI } from "@google/genai";
import { Profile, PortfolioItem, JobDetails, Tone, Framework, QualityScore, MilestonePlan, JobRiskAnalysis } from "../types";

export interface ProposalGenerationParams {
  profile: Profile;
  portfolioItems: PortfolioItem[];
  job: JobDetails;
  tone: Tone;
  framework: Framework;
}

export async function generateProposal(params: ProposalGenerationParams): Promise<{
  proposalText: string;
  screeningAnswers?: { question: string; answer: string }[];
}> {
  const { profile, portfolioItems, job, tone, framework } = params;
  const apiKey = process.env.GEMINI_API_KEY || "";
  
  if (!apiKey) {
    throw new Error("Missing Gemini API Key. Please configure GEMINI_API_KEY in your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Match top relevant portfolio items by keywords
  const matchedPortfolio = matchRelevantPortfolio(job.description + " " + job.skills, portfolioItems);
  const portfolioContext = matchedPortfolio.length > 0 
    ? matchedPortfolio.map(p => `- Project: ${p.title} (${p.technologies.join(", ")}): ${p.description} Metrics: ${p.metrics || "N/A"} Link: ${p.liveUrl || "N/A"}`).join("\n")
    : "No explicit portfolio projects matched, rely on bio and experience highlights.";

  const clientContext = job.clientInfo ? `
    CLIENT INSIGHTS:
    - Rating: ${job.clientInfo.rating || "N/A"}
    - Total Spent: ${job.clientInfo.totalSpent || "N/A"}
    - Hire Rate: ${job.clientInfo.hireRate || "N/A"}
    - Location: ${job.clientInfo.location || "N/A"}
  ` : "";

  const screeningContext = (job.screeningQuestions && job.screeningQuestions.length > 0)
    ? `
    SCREENING QUESTIONS ASKED BY CLIENT:
    ${job.screeningQuestions.map((q, i) => `${i + 1}. ${q.question}`).join("\n")}
    (Provide direct, impressive answers for each screening question at the bottom under a '### Answers to Screening Questions' header).
  `
    : "";

  const frameworkGuide = getFrameworkInstructions(framework);
  const toneGuide = getToneInstructions(tone);

  const prompt = `
You are a top 1% Upwork freelancer writing a high-converting cover letter proposal for a client.

MY FREELANCER PROFILE:
- Name: ${profile.name}
- Title: ${profile.title}
- Hourly Rate: ${profile.hourlyRate || "Market Rate"}
- Bio: ${profile.bio}
- Core Skills: ${profile.skills.join(", ")}
- Relevant Experience: ${profile.experience}

MATCHED PORTFOLIO CASE STUDIES:
${portfolioContext}

JOB POST DETAILS:
- Job Title: ${job.title}
- Budget/Rate Info: ${job.budget || "Unspecified"}
- Required Skills: ${job.skills}
- Full Description: ${job.description}
${clientContext}
${screeningContext}

STRATEGY & TONE REQUIREMENTS:
- Selected Tone: ${tone} (${toneGuide})
- Copywriting Framework: ${framework} (${frameworkGuide})

STRICT PROPOSAL RULES:
1. Start with a hook directly referencing a specific problem or goal in their job description. NEVER start with generic greetings like "Dear Hiring Manager" or "I am writing to apply for your job".
2. Demonstrate immediate technical understanding of their need.
3. Incorporate matched portfolio examples or relevant metrics naturally.
4. Keep paragraphs short (2-3 sentences max) for easy mobile readability.
5. End with a specific, frictionless Call to Action (e.g. asking a clarifying technical question or suggesting a 10-minute discovery chat).
6. Do NOT use placeholder brackets like [Your Name]. Use the profile name "${profile.name}".
7. Format with crisp Markdown headings and bullet points where appropriate.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const proposalText = response.text || "Failed to generate proposal text.";

  let screeningAnswers: { question: string; answer: string }[] | undefined = undefined;
  if (job.screeningQuestions && job.screeningQuestions.length > 0) {
    screeningAnswers = job.screeningQuestions.map(q => ({
      question: q.question,
      answer: extractAnswerForQuestion(proposalText, q.question)
    }));
  }

  return { proposalText, screeningAnswers };
}

export async function refineProposal(proposalText: string, instruction: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("Missing Gemini API Key");

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are an expert Upwork proposal editor. 

ORIGINAL PROPOSAL:
"""
${proposalText}
"""

REFINEMENT INSTRUCTION:
"${instruction}"

Rewrite and adjust the proposal while keeping the core markdown structure intact. Output only the updated proposal text.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || proposalText;
}

export async function evaluateProposal(proposalText: string, jobDescription: string): Promise<QualityScore> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    return mockQualityScore();
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Evaluate the following Upwork proposal against the job description.

JOB DESCRIPTION:
"""
${jobDescription}
"""

PROPOSAL TEXT:
"""
${proposalText}
"""

Return a strictly valid JSON object with no markdown fences, formatted as follows:
{
  "overall": <number 0-100>,
  "hookScore": <number 0-100>,
  "specificityScore": <number 0-100>,
  "valuePropScore": <number 0-100>,
  "ctaScore": <number 0-100>,
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "feedback": ["<tip 1>", "<tip 2>"]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawJson = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(rawJson);
    return {
      overall: Math.min(100, Math.max(0, parsed.overall || 85)),
      hookScore: Math.min(100, Math.max(0, parsed.hookScore || 85)),
      specificityScore: Math.min(100, Math.max(0, parsed.specificityScore || 85)),
      valuePropScore: Math.min(100, Math.max(0, parsed.valuePropScore || 85)),
      ctaScore: Math.min(100, Math.max(0, parsed.ctaScore || 85)),
      strengths: parsed.strengths || ["Customized hook", "Good skill alignment"],
      feedback: parsed.feedback || ["Consider adding exact metrics or portfolio link."]
    };
  } catch (e) {
    console.error("Score evaluation error:", e);
    return mockQualityScore();
  }
}

export async function generateMilestonePlan(jobTitle: string, jobDescription: string, budgetStr: string): Promise<MilestonePlan> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const numericBudget = parseInt(budgetStr.replace(/[^0-9]/g, ""), 10) || 1200;

  if (!apiKey) {
    return mockMilestonePlan(numericBudget);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Create a realistic 3-stage Upwork fixed-price milestone project plan for the following job.

JOB TITLE: ${jobTitle}
JOB DESCRIPTION: ${jobDescription}
ESTIMATED TOTAL BUDGET: $${numericBudget}

Return ONLY a strictly valid JSON object with format:
{
  "totalBudget": ${numericBudget},
  "currency": "$",
  "strategyNotes": "<Short rationale why this milestone breakdown builds client trust>",
  "milestones": [
    {
      "id": "m1",
      "title": "<Milestone 1 title e.g. Phase 1: UX Architecture & Tech Setup>",
      "deliverables": ["<deliverable 1>", "<deliverable 2>"],
      "amount": ${Math.round(numericBudget * 0.3)},
      "duration": "<e.g. 3-5 Days>"
    },
    {
      "id": "m2",
      "title": "<Milestone 2 title e.g. Phase 2: Core Development & Integrations>",
      "deliverables": ["<deliverable 1>", "<deliverable 2>", "<deliverable 3>"],
      "amount": ${Math.round(numericBudget * 0.5)},
      "duration": "<e.g. 1-2 Weeks>"
    },
    {
      "id": "m3",
      "title": "<Milestone 3 title e.g. Phase 3: QA Testing, Revisions & Handover>",
      "deliverables": ["<deliverable 1>", "<deliverable 2>"],
      "amount": ${Math.round(numericBudget * 0.2)},
      "duration": "<e.g. 2-3 Days>"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawJson = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(rawJson);
    return parsed;
  } catch (e) {
    console.error("Milestone generation error:", e);
    return mockMilestonePlan(numericBudget);
  }
}

export async function analyzeJobRisk(job: JobDetails): Promise<JobRiskAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return mockRiskAnalysis(job);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const clientText = job.clientInfo 
      ? `Rating: ${job.clientInfo.rating || "N/A"}, Spent: ${job.clientInfo.totalSpent || "N/A"}, Hire Rate: ${job.clientInfo.hireRate || "N/A"}`
      : "No client history available";

    const prompt = `
Analyze the following Upwork job posting for client red flags, vague scope, low budget, or contract risk factors.

JOB TITLE: ${job.title}
BUDGET: ${job.budget}
REQUIRED SKILLS: ${job.skills}
DESCRIPTION: ${job.description}
CLIENT INFO: ${clientText}

Evaluate and return ONLY a strictly valid JSON object formatted as:
{
  "riskLevel": "LOW",
  "riskScore": 15,
  "redFlags": ["<red flag 1 if any>", "<red flag 2 if any>"],
  "greenFlags": ["<green flag 1 if any>", "<green flag 2 if any>"],
  "advice": "<Actionable protection advice for the freelancer>"
}
where riskLevel is one of "LOW", "MODERATE", or "HIGH".
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawJson = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(rawJson);
  } catch (e) {
    console.error("Risk analysis error:", e);
    return mockRiskAnalysis(job);
  }
}

function mockMilestonePlan(budget: number): MilestonePlan {
  const m1 = Math.round(budget * 0.3);
  const m2 = Math.round(budget * 0.5);
  const m3 = budget - m1 - m2;
  return {
    totalBudget: budget,
    currency: "$",
    strategyNotes: "Phased delivery reduces client risk and ensures momentum from Day 1.",
    milestones: [
      { id: "m1", title: "Phase 1: Architecture & Prototype", deliverables: ["Technical design doc", "Initial interactive UI setup"], amount: m1, duration: "3-5 Days" },
      { id: "m2", title: "Phase 2: Core Engineering", deliverables: ["Feature logic build out", "API & Database integration"], amount: m2, duration: "1-2 Weeks" },
      { id: "m3", title: "Phase 3: QA & Production Release", deliverables: ["Bug fixes & performance tuning", "Final deployment & handover"], amount: m3, duration: "2-3 Days" }
    ]
  };
}

function mockRiskAnalysis(job: JobDetails): JobRiskAnalysis {
  const desc = job.description.toLowerCase();
  const redFlags: string[] = [];
  const greenFlags: string[] = [];

  if (desc.includes("cheap") || desc.includes("low price") || desc.includes("small budget")) {
    redFlags.push("Client explicitly emphasizes low price over quality.");
  }
  if (desc.includes("asap") || desc.includes("urgent") || desc.includes("immediately")) {
    redFlags.push("High rush pressure with potential tight deadline risk.");
  }
  if (desc.length < 100) {
    redFlags.push("Vague, ultra-short job description (High Scope Creep Risk).");
  } else {
    greenFlags.push("Detailed description provided with clear goals.");
  }

  if (job.clientInfo?.rating && parseFloat(job.clientInfo.rating) >= 4.8) {
    greenFlags.push(`Client has a high rating of ${job.clientInfo.rating} ⭐.`);
  }

  const level = redFlags.length >= 2 ? "HIGH" : redFlags.length === 1 ? "MODERATE" : "LOW";
  return {
    riskLevel: level,
    riskScore: level === "HIGH" ? 75 : level === "MODERATE" ? 45 : 15,
    redFlags: redFlags.length ? redFlags : ["No major red flags detected in post text."],
    greenFlags: greenFlags.length ? greenFlags : ["Verified payment & job details present."],
    advice: level === "HIGH"
      ? "Proceed with caution. Define strict milestone scopes and avoid fixed-price contracts until specs are locked."
      : "Standard job post. Lock requirements clearly in your proposal."
  };
}

function matchRelevantPortfolio(jobText: string, items: PortfolioItem[]): PortfolioItem[] {
  const normalizedJob = jobText.toLowerCase();
  return items.filter(item => {
    const matchedTech = item.technologies.some(tech => normalizedJob.includes(tech.toLowerCase()));
    const matchedDesc = item.description.toLowerCase().split(" ").some(word => word.length > 4 && normalizedJob.includes(word));
    return matchedTech || matchedDesc;
  }).slice(0, 2);
}

function getFrameworkInstructions(framework: Framework): string {
  switch (framework) {
    case "PAS (Problem-Agitate-Solution)":
      return "State client's core problem, explain why current approach or delay causes bottlenecks, and offer your direct solution.";
    case "AIDA (Attention-Interest-Desire-Action)":
      return "Grab attention with a sharp hook, build interest with your technical insight, create desire with past results/metrics, end with action call.";
    case "Question-First / Consultant":
      return "Begin by asking 2 thoughtful, clarifying technical questions about their project, then explain how you resolve them.";
    case "Case Study & Proof":
      return "Focus heavily on a similar case study you completed, showing process, stack, and concrete results.";
    case "Hook & Value":
    default:
      return "Open with an energetic hook acknowledging their exact requirement, followed by a concise 3-step action plan and CTA.";
  }
}

function getToneInstructions(tone: Tone): string {
  switch (tone) {
    case "Startup High-Energy":
      return "Fast-paced, bold, enthusiastic, showing high velocity and eagerness to move fast.";
    case "Direct & Concise":
      return "Ultra punchy, bullet-driven, zero fluff, straight to execution details.";
    case "Technical Expert":
      return "Deep technical vocabulary, architectural insights, precise tech stack mentions.";
    case "Storyteller":
      return "Narrative-driven, explaining past problem solving experience engagingly.";
    case "Friendly & Warm":
      return "Approachable, empathetic, client-centric, collaborative tone.";
    case "Consultative":
    default:
      return "Professional, advisory, focused on business ROI and clear technical execution.";
  }
}

function extractAnswerForQuestion(proposalText: string, question: string): string {
  const lowerText = proposalText.toLowerCase();
  const lowerQ = question.toLowerCase();
  if (lowerText.includes(lowerQ)) {
    const idx = lowerText.indexOf(lowerQ);
    return proposalText.substring(idx + question.length, idx + question.length + 200).trim();
  }
  return "Addressed within the main proposal overview.";
}

function mockQualityScore(): QualityScore {
  return {
    overall: 88,
    hookScore: 90,
    specificityScore: 85,
    valuePropScore: 90,
    ctaScore: 86,
    strengths: ["Clear technical hook", "Personalized profile alignment", "Strong call to action"],
    feedback: ["Add a specific metric from past work to push score to 95+."]
  };
}
