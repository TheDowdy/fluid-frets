// Applies a saved light/dark choice before the first paint so the page doesn't flash.
// (A separate file rather than inline, so the site can forbid inline scripts.)
try {
  var t = JSON.parse(localStorage.getItem('fretscape-settings')).state.theme;
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
} catch (e) {}
