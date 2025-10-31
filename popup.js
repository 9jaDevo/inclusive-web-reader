// popup.js
document.addEventListener('DOMContentLoaded', () => {
  const summarizeBtn = document.getElementById('summarizeBtn');
  const translateBtn = document.getElementById('translateBtn');
  const simplifyBtn = document.getElementById('simplifyBtn');
  const proofreadBtn = document.getElementById('proofreadBtn');
  const languageInput = document.getElementById('language');

  // Load saved language
  chrome.storage.sync.get(['preferredLanguage'], (result) => {
    if (result.preferredLanguage) {
      languageInput.value = result.preferredLanguage;
    }
  });

  // Show last summary if available
  chrome.storage.local.get(['lastSummary'], (res) => {
    if (res && res.lastSummary) {
      document.getElementById('summaryOutput').textContent = res.lastSummary;
    }
  });

  languageInput.addEventListener('change', () => {
    chrome.storage.sync.set({ preferredLanguage: languageInput.value });
  });

  // Detect built-in AI availability for popup context
  detectBuiltInAI();

  summarizeBtn.addEventListener('click', () => {
    const aiStatus = document.getElementById('aiStatus');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getPageText' }, (response) => {
        if (chrome.runtime.lastError) {
          document.getElementById('summaryOutput').textContent = 'Error: Content script not loaded. Reload the page or extension.';
          return;
        }
        if (response && response.text) {
          // Inject a page-level authorize button (main world) that the user must click to provide
          // the page user-activation required to create the summarizer and trigger model download.
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            world: 'MAIN',
            func: (text) => {
              // Create a lightweight page-level overlay and attach a click handler that runs in the
              // page's main world (so the click counts as a user activation for Summarizer.create()).
              if (document.getElementById('iwr-page-summarize')) return;
              const wrap = document.createElement('div');
              wrap.id = 'iwr-page-summarize';
              Object.assign(wrap.style, {
                position: 'fixed',
                right: '18px',
                bottom: '18px',
                zIndex: 2147483647,
                background: 'white',
                border: '1px solid #ddd',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                maxWidth: '420px',
                fontFamily: 'Arial, sans-serif'
              });
              const btn = document.createElement('button');
              btn.textContent = 'Click to authorize summarization';
              btn.style.background = '#4285f4';
              btn.style.color = 'white';
              btn.style.border = 'none';
              btn.style.padding = '8px 10px';
              btn.style.borderRadius = '6px';
              btn.style.cursor = 'pointer';
              const status = document.createElement('div');
              status.style.marginTop = '8px';
              status.style.fontSize = '12px';
              status.style.color = '#333';
              const close = document.createElement('button');
              close.textContent = '×';
              close.title = 'Close';
              Object.assign(close.style, { position: 'absolute', right: '6px', top: '4px', border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer' });
              wrap.appendChild(close);
              wrap.appendChild(btn);
              wrap.appendChild(status);
              document.body.appendChild(wrap);

              close.addEventListener('click', () => wrap.remove());

              btn.addEventListener('click', async () => {
                try {
                  status.textContent = 'Checking Summarizer availability...';
                  if (typeof Summarizer === 'undefined') {
                    status.textContent = 'Summarizer API not present in this browser build.';
                    return;
                  }
                  const availability = await Summarizer.availability();
                  if (availability === 'unavailable') {
                    status.textContent = 'Summarizer is unavailable on this device (insufficient resources or unsupported platform).';
                    return;
                  }
                  status.textContent = 'Creating summarizer (this click provides page-level user activation)...';
                  const summarizer = await Summarizer.create({
                    type: 'key-points',
                    monitor(m) {
                      m.addEventListener('downloadprogress', (e) => {
                        try { status.textContent = `Downloading model: ${Math.round(e.loaded * 100)}%`; } catch (_) { }
                      });
                    }
                  });
                  status.textContent = 'Summarizing...';
                  const summary = await summarizer.summarize(text);
                  // Show result inside the injected UI
                  const pre = document.createElement('pre');
                  pre.style.whiteSpace = 'pre-wrap';
                  pre.style.maxHeight = '320px';
                  pre.style.overflow = 'auto';
                  pre.style.marginTop = '8px';
                  pre.textContent = summary;
                  wrap.appendChild(pre);
                  status.textContent = 'Done — summary shown below.';
                  // Notify extension content script / popup by dispatching a document event
                  document.dispatchEvent(new CustomEvent('InclusiveWebReaderSummary', { detail: { summary } }));
                } catch (err) {
                  status.textContent = 'Error: ' + (err && err.message ? err.message : String(err));
                }
              });
            },
            args: [response.text]
          });
          aiStatus.textContent = 'An authorization button was injected into the page. Click it to start the model download and see the summary on the page.';
        }
      });
    });
  });

  // Detect built-in AI presence for user guidance
  function detectBuiltInAI() {
    const aiStatus = document.getElementById('aiStatus');
    try {
      if (chrome && chrome.ai) {
        aiStatus.textContent = 'Built-in AI runtime present in extension context.';
        return;
      }
    } catch (e) { }
    // Fallback: check page main world for Summarizer
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        world: 'MAIN',
        func: () => (typeof Summarizer !== 'undefined') ? 'present' : 'absent'
      }, (results) => {
        const present = results && results[0] && results[0].result === 'present';
        aiStatus.textContent = present ? 'Summarizer available in page context.' : 'Built-in AI not available in page context — check Canary/EPP, hardware, and storage.';
      });
    });
  }

  translateBtn.addEventListener('click', () => {
    const lang = document.getElementById('translateLang').value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelectedText' }, (response) => {
        if (chrome.runtime.lastError) {
          document.getElementById('translateOutput').textContent = 'Error: Content script not loaded. Reload the page or extension.';
          return;
        }
        if (response && response.text) {
          // Inject translation in page context (MAIN world) for API access
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            world: 'MAIN',
            func: async (text, targetLang) => {
              if (document.getElementById('iwr-page-translate')) return;
              const wrap = document.createElement('div');
              wrap.id = 'iwr-page-translate';
              Object.assign(wrap.style, {
                position: 'fixed', right: '18px', bottom: '18px', zIndex: 2147483647,
                background: 'white', border: '1px solid #ddd', padding: '10px',
                borderRadius: '8px', boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                maxWidth: '420px', fontFamily: 'Arial, sans-serif'
              });
              const status = document.createElement('div');
              status.style.fontSize = '12px';
              status.style.color = '#333';
              const close = document.createElement('button');
              close.textContent = '×';
              close.title = 'Close';
              Object.assign(close.style, { position: 'absolute', right: '6px', top: '4px', border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer' });
              wrap.appendChild(close);
              wrap.appendChild(status);
              document.body.appendChild(wrap);
              close.addEventListener('click', () => wrap.remove());

              try {
                status.textContent = 'Checking Translator API availability...';
                if (typeof Translator === 'undefined') {
                  status.textContent = 'Translator API not available. Enable chrome://flags/#enable-experimental-web-platform-features';
                  return;
                }
                status.textContent = 'Creating translator...';
                const translator = await Translator.create({
                  sourceLanguage: 'en',
                  targetLanguage: targetLang,
                  monitor(m) {
                    m.addEventListener('downloadprogress', (e) => {
                      try { status.textContent = `Downloading model: ${Math.round(e.loaded * 100)}%`; } catch (_) { }
                    });
                  }
                });
                status.textContent = 'Translating...';
                const translation = await translator.translate(text);
                const pre = document.createElement('pre');
                pre.style.whiteSpace = 'pre-wrap';
                pre.style.maxHeight = '320px';
                pre.style.overflow = 'auto';
                pre.style.marginTop = '8px';
                pre.textContent = translation;
                wrap.appendChild(pre);
                status.textContent = 'Done — translation shown below.';
                document.dispatchEvent(new CustomEvent('InclusiveWebReaderTranslate', { detail: { translation } }));
              } catch (err) {
                status.textContent = 'Error: ' + (err && err.message ? err.message : String(err));
              }
            },
            args: [response.text, lang]
          });
          document.getElementById('translateOutput').textContent = 'Translation UI injected into page. Check the bottom-right of the webpage.';
        }
      });
    });
  });

  simplifyBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelectedText' }, (response) => {
        if (chrome.runtime.lastError) {
          document.getElementById('simplifyOutput').textContent = 'Error: Content script not loaded. Reload the page or extension.';
          return;
        }
        if (response && response.text) {
          // Inject rewriter in page context (MAIN world) for API access
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            world: 'MAIN',
            func: async (text) => {
              if (document.getElementById('iwr-page-simplify')) return;
              const wrap = document.createElement('div');
              wrap.id = 'iwr-page-simplify';
              Object.assign(wrap.style, {
                position: 'fixed', right: '18px', bottom: '18px', zIndex: 2147483647,
                background: 'white', border: '1px solid #ddd', padding: '10px',
                borderRadius: '8px', boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                maxWidth: '420px', fontFamily: 'Arial, sans-serif'
              });
              const status = document.createElement('div');
              status.style.fontSize = '12px';
              status.style.color = '#333';
              const close = document.createElement('button');
              close.textContent = '×';
              close.title = 'Close';
              Object.assign(close.style, { position: 'absolute', right: '6px', top: '4px', border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer' });
              wrap.appendChild(close);
              wrap.appendChild(status);
              document.body.appendChild(wrap);
              close.addEventListener('click', () => wrap.remove());

              try {
                status.textContent = 'Checking Rewriter API availability...';
                if (typeof Rewriter === 'undefined') {
                  status.textContent = 'Rewriter API not available. Enable chrome://flags/#enable-experimental-web-platform-features';
                  return;
                }
                status.textContent = 'Creating rewriter...';
                const rewriter = await Rewriter.create({
                  tone: 'more-casual',
                  length: 'shorter',
                  monitor(m) {
                    m.addEventListener('downloadprogress', (e) => {
                      try { status.textContent = `Downloading model: ${Math.round(e.loaded * 100)}%`; } catch (_) { }
                    });
                  }
                });
                status.textContent = 'Simplifying text...';
                const simplified = await rewriter.rewrite(text);
                const pre = document.createElement('pre');
                pre.style.whiteSpace = 'pre-wrap';
                pre.style.maxHeight = '320px';
                pre.style.overflow = 'auto';
                pre.style.marginTop = '8px';
                pre.textContent = simplified;
                wrap.appendChild(pre);
                status.textContent = 'Done — simplified text shown below.';
                document.dispatchEvent(new CustomEvent('InclusiveWebReaderSimplify', { detail: { simplified } }));
              } catch (err) {
                status.textContent = 'Error: ' + (err && err.message ? err.message : String(err));
              }
            },
            args: [response.text]
          });
          document.getElementById('simplifyOutput').textContent = 'Simplification UI injected into page. Check the bottom-right of the webpage.';
        }
      });
    });
  });

  proofreadBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelectedText' }, (response) => {
        if (chrome.runtime.lastError) {
          document.getElementById('proofreadOutput').textContent = 'Error: Content script not loaded. Reload the page or extension.';
          return;
        }
        if (response && response.text) {
          // Inject proofreader in page context (MAIN world) for API access
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            world: 'MAIN',
            func: async (text) => {
              if (document.getElementById('iwr-page-proofread')) return;
              const wrap = document.createElement('div');
              wrap.id = 'iwr-page-proofread';
              Object.assign(wrap.style, {
                position: 'fixed', right: '18px', bottom: '18px', zIndex: 2147483647,
                background: 'white', border: '1px solid #ddd', padding: '10px',
                borderRadius: '8px', boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
                maxWidth: '420px', fontFamily: 'Arial, sans-serif'
              });
              const status = document.createElement('div');
              status.style.fontSize = '12px';
              status.style.color = '#333';
              const close = document.createElement('button');
              close.textContent = '×';
              close.title = 'Close';
              Object.assign(close.style, { position: 'absolute', right: '6px', top: '4px', border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer' });
              wrap.appendChild(close);
              wrap.appendChild(status);
              document.body.appendChild(wrap);
              close.addEventListener('click', () => wrap.remove());

              try {
                status.textContent = 'Checking Proofreader API availability...';
                if (typeof Proofreader === 'undefined') {
                  status.textContent = 'Proofreader API not available. Enable chrome://flags/#enable-experimental-web-platform-features';
                  return;
                }
                status.textContent = 'Creating proofreader...';
                const proofreader = await Proofreader.create({
                  outputLanguage: 'en',  // Required: specify output language
                  monitor(m) {
                    m.addEventListener('downloadprogress', (e) => {
                      try { status.textContent = `Downloading model: ${Math.round(e.loaded * 100)}%`; } catch (_) { }
                    });
                  }
                });
                status.textContent = 'Proofreading text...';
                const result = await proofreader.proofread(text);
                // Handle different return types (string or object)
                const corrected = typeof result === 'string' ? result : (result.correctedText || result.text || JSON.stringify(result));
                const pre = document.createElement('pre');
                pre.style.whiteSpace = 'pre-wrap';
                pre.style.maxHeight = '320px';
                pre.style.overflow = 'auto';
                pre.style.marginTop = '8px';
                pre.textContent = corrected;
                wrap.appendChild(pre);
                status.textContent = 'Done — proofread text shown below.';
                document.dispatchEvent(new CustomEvent('InclusiveWebReaderProofread', { detail: { corrected } }));
              } catch (err) {
                status.textContent = 'Error: ' + (err && err.message ? err.message : String(err));
              }
            },
            args: [response.text]
          });
          document.getElementById('proofreadOutput').textContent = 'Proofreading UI injected into page. Check the bottom-right of the webpage.';
        }
      });
    });
  });
});