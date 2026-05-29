/* LDP Antigravity - Background Service Worker (MV3) */

// Listen for tab updates to detect our specific launch parameter
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    if (url.searchParams.get('ldp_autologin') === 'true') {
      console.log("LDP: Auto-login detected for", tab.url);
      
      // We wait for the dashboard to send the credentials via message
      // OR we could fetch them here if we have a session token.
      // For this build, we use the message relay system for maximum security.
    }
  }
});

// Relay credentials from Dashboard to the target Terminal Tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LDP_VAULT_RELAY_CREDENTIALS') {
    const { targetUrl, username, password } = message;
    
    // Find the tab that matches this URL
    chrome.tabs.query({}, (tabs) => {
      const targetTab = tabs.find(t => t.url && t.url.includes(targetUrl));
      if (targetTab) {
        chrome.scripting.executeScript({
          target: { tabId: targetTab.id },
          func: performStealthLogin,
          args: [username, password]
        });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Target tab not found' });
      }
    });
    return true; // Keep channel open
  }
});

// The actual injection logic executed in the target tab's context
function performStealthLogin(user, pass) {
  const selectors = {
    user: ['input[id*="user"]', 'input[id*="login"]', 'input[id^="mat-input-"]', 'input[type="text"]', 'input[type="email"]'],
    pass: ['input[id*="pass"]', 'input[type="password"]', 'input[id^="mat-input-"]'],
    btn: ['button[type="submit"]', '.blueButton', '.loginButton', '.btn-primary']
  };

  const find = (arr) => {
    for (let s of arr) {
      const elements = document.querySelectorAll(s);
      for (let el of elements) {
         if (el.offsetParent !== null) return el;
      }
    }
    return null;
  };

  const execute = () => {
    const uField = find(selectors.user);
    const pField = find(selectors.pass);
    
    if (uField && pField) {
      console.log("LDP: Injecting credentials...");
      
      // Fill values
      uField.value = user;
      pField.value = pass;
      
      // Trigger events
      const event = new Event('input', { bubbles: true });
      uField.dispatchEvent(event);
      pField.dispatchEvent(event);
      
      // Auto Submit after small delay
      setTimeout(() => {
        const btn = find(selectors.btn) || pField.closest('form')?.querySelector('button, input[type="submit"]');
        if (btn) {
          btn.click();
        } else {
          pField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
        }
        
        // SECURITY: Wipe from DOM after submission
        setTimeout(() => {
          uField.value = "";
          pField.value = "";
        }, 200);
      }, 300);
      
      return true;
    }
    return false;
  };

  // Run immediately and monitor for dynamic fields
  if (!execute()) {
    const observer = new MutationObserver(() => {
       if (execute()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }
}
