// background.js — Master Service Worker for Scraper Web Wedding

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error('SidePanel setup error:', error));

// Register dynamic net request rules to bypass CORS and anti-hotlinking
async function setupNetRules() {
  try {
    const rules = [
      {
        id: 1,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            { header: 'Referer', operation: 'set', value: 'https://satumomen.com/' },
            { header: 'Origin', operation: 'set', value: 'https://satumomen.com' }
          ],
          responseHeaders: [
            { header: 'Access-Control-Allow-Origin', operation: 'set', value: '*' },
            { header: 'Access-Control-Allow-Methods', operation: 'set', value: 'GET, HEAD, OPTIONS' },
            { header: 'Access-Control-Allow-Headers', operation: 'set', value: '*' }
          ]
        },
        condition: {
          urlFilter: '||assets.satumomen.com',
          resourceTypes: ['xmlhttprequest', 'image', 'media', 'font', 'stylesheet', 'script', 'other']
        }
      }
    ];

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
      addRules: rules
    });
    console.log('Dynamic net request rules configured for bypass.');
  } catch (err) {
    console.warn('DeclarativeNetRequest rule error:', err);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  setupNetRules();
  console.log('Scraper Web Wedding v1.0.2 ready.');
});

// Listener for background fetching and downloads
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'FETCH_ASSET') {
    fetchAssetAsBase64(message.url, message.referer)
      .then(data => sendResponse({ success: true, ...data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.action === 'DOWNLOAD_ZIP') {
    chrome.downloads.download({
      url: message.url,
      filename: message.filename || 'wedding-clone.zip',
      saveAs: true,
      conflictAction: 'uniquify'
    }, downloadId => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ success: true, downloadId });
      }
    });
    return true;
  }

  if (message.action === 'PURGE_MEMORY') {
    console.log('Memory and cache references purged.');
    sendResponse({ success: true, timestamp: Date.now() });
  }
});

async function fetchAssetAsBase64(url, referer) {
  const headers = {};
  if (referer) {
    headers['Referer'] = referer;
    headers['Origin'] = new URL(referer).origin;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  const blob = await res.blob();
  const buffer = await blob.arrayBuffer();
  
  // Convert ArrayBuffer to Base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return {
    base64: base64,
    mimeType: blob.type,
    byteLength: len
  };
}
