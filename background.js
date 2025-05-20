chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === 'complete' &&
    tab.url &&
    tab.url.includes('courseEvaluate')
  ) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content-script.js']
    });
  }
});

// Set currentFormIndex to 0 when any tab is closed
chrome.tabs.onRemoved.addListener(() => {
  chrome.storage.local.set({ currentFormIndex: 0 });
});

chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    if (tab.url && tab.url.includes('courseEvaluate')) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-script.js']
      });
    }
  });
});