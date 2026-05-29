/* LDP Antigravity - Content Security Layer */

// Check if we are in an autologin session
if (window.location.href.includes('ldp_autologin=true')) {
  // Create Stealth Overlay
  const overlay = document.createElement('div');
  overlay.id = 'ldp-stealth-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    top: 0, left: 0, width: '100vw', height: '100vh',
    background: '#ffffff',
    zIndex: 2147483647,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  });

  overlay.innerHTML = `
    <div style="text-align:center; padding: 40px; background: #fff; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.1); border: 1px solid #f0f0f0;">
      <div style="width: 60px; height: 60px; background: #175ddc; border-radius: 15px; margin: 0 auto 24px; display: flex; alignItems: center; justify-content: center;">
         <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <h2 style="margin:0 0 8px; color:#1d2736; font-size:20px;">LDP Secure Session</h2>
      <p style="margin:0 0 20px; color:#5e6b7e; font-size:14px;">Performing encrypted login handshake...</p>
      <div style="width: 140px; height: 4px; background: #f0f0f0; border-radius: 10px; margin: 0 auto; overflow: hidden;">
        <div id="ldp-progress" style="width: 30%; height: 100%; background: #175ddc; border-radius: 10px; transition: width 2s ease-in-out;"></div>
      </div>
    </div>
    <style>
      #ldp-progress { animation: ldp-shimmer 1.5s infinite linear; }
      @keyframes ldp-shimmer { from { transform: translateX(-100%); } to { transform: translateX(200%); } }
    </style>
  `;
  document.documentElement.appendChild(overlay);

  // Failsafe: Remove after 10s if login fails
  setTimeout(() => { if (overlay) overlay.remove(); }, 10000);
}

// Block Copying on potential password fields during session
document.addEventListener('copy', (e) => {
  if (window.location.href.includes('ldp_autologin=true')) {
    e.preventDefault();
  }
});
