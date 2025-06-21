window.addEventListener('DOMContentLoaded', () => {
  if (window.Telegram && Telegram.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }
});
