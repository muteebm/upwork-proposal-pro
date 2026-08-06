// Upwork Proposal Pro - Content Script for upwork.com

console.log("[Proposal Pro] Upwork Content Script loaded.");

// Helper to set textarea value and trigger React synthetic events
function fillUpworkCoverLetter(text) {
  const selectors = [
    'textarea[data-test="cover-letter"]',
    'textarea[name="coverLetter"]',
    'textarea.up-textarea',
    'textarea[aria-label*="Cover Letter"]',
    'textarea[aria-label*="cover letter"]',
    'textarea'
  ];

  let targetTextarea = null;
  for (const selector of selectors) {
    const els = document.querySelectorAll(selector);
    for (const el of els) {
      // Find visible textarea that is likely the cover letter field
      if (el.offsetWidth > 0 && el.offsetHeight > 0 && el.rows >= 3) {
        targetTextarea = el;
        break;
      }
    }
    if (targetTextarea) break;
  }

  if (!targetTextarea) {
    showToast("⚠️ Could not locate cover letter field on this page.", "amber");
    return false;
  }

  // Use native setter to trigger React state updates
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(targetTextarea, text);
  } else {
    targetTextarea.value = text;
  }

  // Dispatch events for React / Vue state listeners
  targetTextarea.dispatchEvent(new Event("input", { bubbles: true }));
  targetTextarea.dispatchEvent(new Event("change", { bubbles: true }));

  // Scroll into view & add highlight effect
  targetTextarea.scrollIntoView({ behavior: "smooth", block: "center" });
  targetTextarea.focus();
  targetTextarea.style.transition = "border-color 0.3s ease, box-shadow 0.3s ease";
  targetTextarea.style.borderColor = "#14A800";
  targetTextarea.style.boxShadow = "0 0 0 4px rgba(20, 168, 0, 0.25)";

  setTimeout(() => {
    targetTextarea.style.borderColor = "";
    targetTextarea.style.boxShadow = "";
  }, 2500);

  showToast("✅ AI Proposal successfully pasted into Upwork!", "green");
  return true;
}

// Toast notification helper
function showToast(message, type = "green") {
  const existing = document.getElementById("proposal-pro-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "proposal-pro-toast";
  toast.style.position = "fixed";
  toast.style.bottom = "24px";
  toast.style.right = "24px";
  toast.style.zIndex = "999999";
  toast.style.padding = "12px 18px";
  toast.style.borderRadius = "10px";
  toast.style.backgroundColor = type === "green" ? "#14A800" : "#D97706";
  toast.style.color = "#FFFFFF";
  toast.style.fontFamily = "sans-serif";
  toast.style.fontSize = "13px";
  toast.style.fontWeight = "bold";
  toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.style.gap = "8px";
  toast.style.transition = "all 0.3s ease";

  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Listen for messages from Proposal Pro Popup/App
if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "PASTE_COVER_LETTER") {
      const success = fillUpworkCoverLetter(request.text);
      sendResponse({ success });
    }
  });
}
