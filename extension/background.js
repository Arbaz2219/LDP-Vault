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
});
