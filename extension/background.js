// Background script for LDP Logistics Vault Extension

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchCredentials') {
    const { domain, token } = request;
    
    // Call the backend API to get credentials for this domain
    fetch(`http://localhost:5000/api/vault/match?domain=${domain}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(data => sendResponse({ data }))
    .catch(error => sendResponse({ error: error.message }));
    
    return true; // Keep message channel open
  }

  if (request.action === 'logAction') {
    const { action, itemId, token } = request;
    fetch(`http://localhost:5000/api/logs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, itemId })
    });
  }

  if (request.action === 'relayAutofill') {
    const { targetUrl, username, password, autoSubmit } = request;
    
    // Find tabs that match the target URL
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url && tab.url.includes(new URL(targetUrl).hostname)) {
          console.log('LDP Vault: Found matching tab, relaying...', tab.id);
          
          const sendWhenReady = (tabId, msg) => {
            chrome.tabs.get(tabId, (updatedTab) => {
              if (updatedTab.status === 'complete') {
                // Give it another 500ms for content scripts to initialize
                setTimeout(() => {
                  chrome.tabs.sendMessage(tabId, msg, (response) => {
                    if (chrome.runtime.lastError) {
                      console.log('Retrying message delivery...');
                      setTimeout(() => sendWhenReady(tabId, msg), 1000);
                    }
                  });
                }, 500);
              } else {
                setTimeout(() => sendWhenReady(tabId, msg), 500);
              }
            });
          };

          sendWhenReady(tab.id, {
            action: 'autofill',
            username,
            password,
            autoSubmit
          });
        }
      });
    });
  }
});


