// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageText') {
    const text = document.body.innerText;
    sendResponse({ text: text });
  } else if (request.action === 'getSelectedText') {
    const selectedText = window.getSelection().toString();
    sendResponse({ text: selectedText });
  } else if (request.action === 'analyzeImage') {
    analyzeImage(request.imageSrc);
    sendResponse(); // Acknowledge receipt
  }
});

async function analyzeImage(imageSrc) {
  // For now, alert or something. Later integrate Prompt API.
  alert('Analyzing image: ' + imageSrc);
  // TODO: Use chrome.ai.prompt with image
}

// Listen for page-level summary events and forward to extension storage
document.addEventListener('InclusiveWebReaderSummary', (e) => {
  try {
    const summary = e && e.detail && e.detail.summary;
    if (summary) {
      chrome.storage.local.set({ lastSummary: summary });
    }
  } catch (err) {
    console.error('Failed to persist page summary:', err);
  }
});

// Listen for translation events
document.addEventListener('InclusiveWebReaderTranslate', (e) => {
  try {
    const translation = e && e.detail && e.detail.translation;
    if (translation) {
      chrome.storage.local.set({ lastTranslation: translation });
    }
  } catch (err) {
    console.error('Failed to persist translation:', err);
  }
});

// Listen for simplification events
document.addEventListener('InclusiveWebReaderSimplify', (e) => {
  try {
    const simplified = e && e.detail && e.detail.simplified;
    if (simplified) {
      chrome.storage.local.set({ lastSimplified: simplified });
    }
  } catch (err) {
    console.error('Failed to persist simplified text:', err);
  }
});

// Listen for proofreading events
document.addEventListener('InclusiveWebReaderProofread', (e) => {
  try {
    const corrected = e && e.detail && e.detail.corrected;
    if (corrected) {
      chrome.storage.local.set({ lastProofread: corrected });
    }
  } catch (err) {
    console.error('Failed to persist proofread text:', err);
  }
});

// Inject a script to handle selections or something if needed.