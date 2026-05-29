// Content script to detect and fill login forms

function findLoginForm() {
  const passwordFields = document.querySelectorAll('input[type="password"]');
  if (passwordFields.length === 0) return null;

  const passwordField = passwordFields[0];
  const form = passwordField.form || passwordField.closest('form');
  
  // Find username field in the same form or nearby
  let usernameField = null;
  if (form) {
    usernameField = form.querySelector('input[type="text"], input[type="email"], input:not([type]), input[name*="user" i], input[id*="user" i]');
  }

  // If no form, search globally for fields
  if (!usernameField) {
    usernameField = document.querySelector('input[type="text"], input[type="email"]');
  }

  return { form, usernameField, passwordField };
}

function fillAndSubmit(username, password, submit = true) {
  const attemptFill = () => {
    const fields = findLoginForm();
    if (fields && fields.usernameField && fields.passwordField) {
      console.log('LDP Vault: Found fields, filling...');
      fields.usernameField.value = username;
      fields.usernameField.dispatchEvent(new Event('input', { bubbles: true }));
      fields.usernameField.dispatchEvent(new Event('change', { bubbles: true }));
      
      fields.passwordField.value = password;
      fields.passwordField.dispatchEvent(new Event('input', { bubbles: true }));
      fields.passwordField.dispatchEvent(new Event('change', { bubbles: true }));

      if (submit) {
        setTimeout(() => {
          const submitButton = fields.form?.querySelector('button[type="submit"], input[type="submit"], button.blueButton, .login-btn, #login-btn') || 
                               document.querySelector('button[type="submit"], .blueButton, button:contains("Login")');
          
          if (submitButton) {
            console.log('LDP Vault: Clicking submit button');
            submitButton.click();
          } else if (fields.form) {
            console.log('LDP Vault: Submitting form directly');
            fields.form.submit();
          }
        }, 800);
      }
      return true;
    }
    return false;
  };

  if (!attemptFill()) {
    console.log('LDP Vault: Fields not found, setting up observer...');
    const observer = new MutationObserver((mutations, obs) => {
      if (attemptFill()) {
        obs.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Stop after 10 seconds if not found
    setTimeout(() => observer.disconnect(), 10000);
  }
  return true;
}


// Auto-login if triggered by vault
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('ldp_autologin') === 'true') {
  // Hide UI immediately using a style tag
  const injectStyle = () => {
    const style = document.createElement('style');
    style.id = 'ldp-autologin-style';
    style.textContent = `
      html, body { 
        overflow: hidden !important;
        background: #0d43af !important;
      }
      body > *:not(#ldp-vault-overlay) {
        display: none !important;
        visibility: hidden !important;
      }
      #ldp-vault-overlay {
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background: radial-gradient(circle at center, #1a56cc 0%, #0d43af 100%);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        z-index: 2147483647; color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      .ldp-spinner {
        width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.1);
        border-top: 4px solid white; border-radius: 50%; animation: spin 1s linear infinite;
        margin-bottom: 20px;
      }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `;
    (document.head || document.documentElement).appendChild(style);
  };

  const showOverlay = () => {
    if (document.getElementById('ldp-vault-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'ldp-vault-overlay';
    overlay.innerHTML = `
      <div class="ldp-spinner"></div>
      <h2 style="font-weight: 700; margin: 0; letter-spacing: -0.02em;">LDP VAULT</h2>
      <p style="opacity: 0.7; font-size: 14px; margin-top: 8px;">Securely logging you in to ${window.location.hostname}...</p>
    `;
    document.documentElement.appendChild(overlay);
  };

  injectStyle();
  if (document.body) showOverlay();
  else window.addEventListener('DOMContentLoaded', showOverlay);
}

// Listen for messages from the vault web app
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'LDP_VAULT_AUTOFILL') {
    chrome.runtime.sendMessage({
      action: 'relayAutofill',
      targetUrl: event.data.targetUrl,
      username: event.data.username,
      password: event.data.password,
      autoSubmit: event.data.autoSubmit
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autofill') {
    const { username, password, autoSubmit } = request;
    const success = fillAndSubmit(username, password, autoSubmit !== false);
    sendResponse({ success });
  }
});


