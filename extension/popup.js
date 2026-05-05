// popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  const domain = url.hostname;

  // In a real app, we would get the token from chrome.storage or a sync storage
  // For this demo, we assume the user is logged into the web app
  chrome.storage.local.get(['token', 'masterPassword'], async (result) => {
    if (!result.token) {
      document.getElementById('items-list').innerHTML = '<p class="status">Please log in to the LDP Web App first.</p>';
      return;
    }

    chrome.runtime.sendMessage(
      { action: 'fetchCredentials', domain: domain, token: result.token },
      (response) => {
        const list = document.getElementById('items-list');
        if (response.error || !response.data || response.data.length === 0) {
          list.innerHTML = '<p class="status">No credentials found for this domain.</p>';
          return;
        }

        list.innerHTML = '';
        response.data.forEach(item => {
          const div = document.createElement('div');
          div.className = 'item';
          div.innerHTML = `
            <div class="name">${item.name}</div>
            <div class="user">${item.username}</div>
          `;
          div.onclick = () => {
             // Decrypt password using masterPassword and autofill
             // For brevity, we assume decryption happens here
             const decryptedPassword = "DECRYPTED_PWD"; // In real: decrypt(item.password, result.masterPassword)
             chrome.tabs.sendMessage(tab.id, { 
               action: 'autofill', 
               username: item.username, 
               password: decryptedPassword 
             });
             chrome.runtime.sendMessage({ action: 'logAction', action: 'AUTOFILL', itemId: item.id, token: result.token });
          };
          list.appendChild(div);
        });
      }
    );
  });
});
