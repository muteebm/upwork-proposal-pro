import { JobDetails, ClientMetadata, ScreeningQuestion } from "../types";

export async function scrapeUpworkJobPage(): Promise<Partial<JobDetails>> {
  const extChrome = (window as any).chrome;
  
  if (typeof extChrome === "undefined" || !extChrome.tabs || !extChrome.scripting) {
    throw new Error("Page scraping requires running as a Chrome Extension. Please input details manually or test in Chrome extension popup.");
  }

  const [tab] = await extChrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("No active web browser tab found.");
  }

  const results = await extChrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractPageData,
  });

  if (results && results[0] && results[0].result) {
    return results[0].result;
  }
  
  throw new Error("Could not extract content from the current tab.");
}

function extractPageData(): Partial<JobDetails> {
  // 1. Title
  let title = document.title.replace(' - Upwork', '').trim();
  const titleEl = document.querySelector('h1, h2.job-title, [data-test="job-title"], [data-test="title"]');
  if (titleEl) title = (titleEl as HTMLElement).innerText.trim();

  // 2. Features & Budget
  let budget = "";
  const featuresList = document.querySelector('ul.features, ul.features-list, [data-test="job-features"], .job-features');
  if (featuresList) {
    const features = Array.from(featuresList.querySelectorAll('li, .group')).map(el => (el as HTMLElement).innerText.trim().replace(/\n+/g, ' '));
    if (features.length > 0) budget = features.filter(f => f.length < 100).join(' | ');
  }

  // 3. Full Job Description
  let description = "";
  const descSelectors = [
    '[data-test="Description"]', 
    '[data-test="job-description-text"]', 
    '.text-body-sm.multiline-text', 
    '.job-description', 
    '[data-ev-sublocation="job_description"]'
  ];
  for (const sel of descSelectors) {
    const descEl = document.querySelector(sel);
    if (descEl) {
      description = (descEl as HTMLElement).innerText.trim();
      break;
    }
  }

  // 4. Skills
  let skills = "";
  const skillChips = document.querySelectorAll('.skills-list a.air3-badge, .skills-list span.air3-badge, a.air3-badge, [data-test="skill"], span.up-skill-badge, [data-test="Skill"]');
  if (skillChips.length > 0) {
    const uniqueSkills = new Set<string>();
    skillChips.forEach(el => {
       const text = ((el as HTMLElement).innerText || "").replace(/\n/g, '').trim();
       if (text && text.length < 40 && !text.toLowerCase().includes('jobs')) uniqueSkills.add(text);
    });
    skills = Array.from(uniqueSkills).join(', ');
  }

  // 5. Client Metadata Extraction (Multi-Strategy Robust Parsing)
  const clientInfo: ClientMetadata = {};

  // Strategy A: Locate About the Client container / section
  let clientSectionText = "";
  const allContainers = Array.from(document.querySelectorAll('section, div, aside, [data-test*="client"], [data-test="AboutClient"]'));
  for (const el of allContainers) {
    const text = (el as HTMLElement).innerText || "";
    if (text.includes("About the client") || text.includes("About the Client")) {
      clientSectionText = text;
      break;
    }
  }

  // Fallback to full page text if section container was not distinctly matched
  if (!clientSectionText) {
    clientSectionText = document.body.innerText || "";
  }

  // Extract Rating (e.g. "4.95 of 5 stars", "4.95 rating", "5.0 of 5")
  const ratingMatch = clientSectionText.match(/([3-5]\.\d{1,2})\s*(of\s*5|stars|rating|\/5)/i) ||
                      clientSectionText.match(/Rating\s*is?\s*([3-5]\.\d{1,2})/i) ||
                      clientSectionText.match(/([3-5]\.\d{1,2})/);
  if (ratingMatch && parseFloat(ratingMatch[1]) >= 3.0 && parseFloat(ratingMatch[1]) <= 5.0) {
    clientInfo.rating = `${ratingMatch[1]} ⭐`;
  }

  // Extract Total Spent (e.g. "$50k+ spent", "$10,000 spent", "$10k total spent", "$500+ total spent")
  const spentMatch = clientSectionText.match(/(\$[\d,]+(?:\.\d+)?[kM]?\+?\s*(?:total\s*)?spent)/i) ||
                     clientSectionText.match(/(\$[\d,]+[kM]?\+?\s*spent)/i) ||
                     clientSectionText.match(/(spent\s*\$[\d,]+[kM]?\+?)/i);
  if (spentMatch) {
    clientInfo.totalSpent = spentMatch[1].trim();
  }

  // Extract Location (e.g. "United States", "United Kingdom", "Canada", or text after Location header)
  const locationEl = document.querySelector('[data-test="client-country"], [data-test="client-location"], [data-test="location"]');
  if (locationEl) {
    clientInfo.location = (locationEl as HTMLElement).innerText.trim();
  } else {
    // Extract using regex match for common countries or lines near location
    const locationMatch = clientSectionText.match(/(United States|United Kingdom|Canada|Australia|Germany|France|Netherlands|Israel|Singapore|India|Spain|Italy|Brazil|Switzerland|Sweden)/i);
    if (locationMatch) {
      clientInfo.location = locationMatch[1].trim();
    }
  }

  // Extract Hire Rate (e.g. "85% hire rate", "85% Hire Rate", "50% hire rate, 2 open jobs")
  const hireRateMatch = clientSectionText.match(/(\d{1,3}%\s*hire\s*rate)/i) ||
                        clientSectionText.match(/(\d{1,3}%)\s*hire/i);
  if (hireRateMatch) {
    clientInfo.hireRate = hireRateMatch[1].trim();
  }

  // Direct DOM Element query selectors as final fallback
  if (!clientInfo.rating) {
    const el = document.querySelector('[data-test="client-rating"], .rating-text, .stars-rating, .air3-rating-value');
    if (el) clientInfo.rating = `${(el as HTMLElement).innerText.trim()} ⭐`;
  }
  if (!clientInfo.totalSpent) {
    const el = document.querySelector('[data-test="client-spend"], [data-test="total-spent"]');
    if (el) clientInfo.totalSpent = (el as HTMLElement).innerText.trim();
  }
  if (!clientInfo.hireRate) {
    const el = document.querySelector('[data-test="client-hire-rate"]');
    if (el) clientInfo.hireRate = (el as HTMLElement).innerText.trim();
  }

  // 6. Screening Questions
  const screeningQuestions: ScreeningQuestion[] = [];
  const qElements = document.querySelectorAll('[data-test="question-text"], .screening-question, [data-test="Question"]');
  qElements.forEach((q, idx) => {
    const qText = (q as HTMLElement).innerText.trim();
    if (qText) {
      screeningQuestions.push({
        id: `q-${idx}`,
        question: qText
      });
    }
  });

  // Fallback description if main desc was truncated or missed
  if (!description || description.length < 20) {
     const root = document.querySelector('main') || document.body;
     description = (root as HTMLElement).innerText.substring(0, 6000);
  }

  return { title, budget, description, skills, clientInfo, screeningQuestions };
}
