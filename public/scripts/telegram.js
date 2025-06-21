window.addEventListener('DOMContentLoaded', () => {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    if (Telegram.WebApp.requestFullscreen) {
      Telegram.WebApp.requestFullscreen();
    }
  }
});
