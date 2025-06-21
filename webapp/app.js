const tg = window.Telegram.WebApp;
function applyTheme(){
  const p = tg.themeParams || {};
  for(const k in p){
    document.documentElement.style.setProperty(`--tg-${k.replace('_','-')}`, p[k]);
  }
}
document.addEventListener('DOMContentLoaded',()=>{
  tg.expand();
  applyTheme();
  console.log('Mini App loaded');
});
tg.onEvent('themeChanged', applyTheme);
