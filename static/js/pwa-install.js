let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  // Update UI notify the user they can install the PWA
  if (installBtn) {
      installBtn.style.display = 'block';
  }
  console.log('beforeinstallprompt fired');
});

// Debug: Force show button if ?debug=true is in URL
if (window.location.search.includes('debug=true') && installBtn) {
    installBtn.style.display = 'block';
}

if (installBtn) {
    installBtn.addEventListener('click', async () => {
      // Hide the app provided install promotion
      installBtn.style.display = 'none';
      // Show the install prompt
      if (deferredPrompt) {
          deferredPrompt.prompt();
          // Wait for the user to respond to the prompt
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to the install prompt: ${outcome}`);
          // We've used the prompt, and can't use it again, throw it away
          deferredPrompt = null;
      }
    });
}

window.addEventListener('appinstalled', () => {
  // Hide the app-provided install promotion
  if (installBtn) {
      installBtn.style.display = 'none';
  }
  // Clear the deferredPrompt so it can be garbage collected
  deferredPrompt = null;
  console.log('PWA was installed');
});
