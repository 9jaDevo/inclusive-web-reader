// background.js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'analyzeImage',
    title: 'Analyze Image with AI',
    contexts: ['image']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'analyzeImage') {
    chrome.tabs.sendMessage(tab.id, {action: 'analyzeImage', imageSrc: info.srcUrl}, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message to content script:', chrome.runtime.lastError.message || chrome.runtime.lastError);
      }
    });
  }
});