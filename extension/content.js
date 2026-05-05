// Content script to detect and fill login forms

function findLoginForm() {
  const passwordFields = document.querySelectorAll('input[type="password"]');
  if (passwordFields.length === 0) return null;

  const passwordField = passwordFields[0];
  const form = passwordField.form || passwordField.closest('form');
  
  // Find username field in the same form or nearby
  let usernameField = null;
  if (form) {
    usernameField = form.querySelector('input[type="text"], input[type="email"], input:not([type])');
  }

  return { form, usernameField, passwordField };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autofill') {
    const { username, password } = request;
    const fields = findLoginForm();

    if (fields) {
      if (fields.usernameField) {
        fields.usernameField.value = username;
        fields.usernameField.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (fields.passwordField) {
        fields.passwordField.value = password;
        fields.passwordField.dispatchEvent(new Event('input', { bubbles: true }));
      }
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'No login form found' });
    }
  }
});
