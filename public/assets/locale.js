(function () {
  const storageKey = 'revtel.locale';
  const valid = (value) => value === 'zh-Hant' || value === 'en';

  // Persist explicit choices before a normal link navigation, including keyboard clicks.
  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[data-language-switch]') : null;
    if (!link || !valid(link.hreflang)) return;
    try {
      localStorage.setItem(storageKey, link.hreflang);
    } catch {
      // A one-navigation override lets the switch work even when storage is blocked.
      const target = new URL(link.href);
      target.searchParams.set('lang', link.hreflang);
      link.href = target.href;
    }
  }, true);

  const current = location.pathname;
  const chineseHome = current === '/' || current === '/index.html';
  const englishHome = current === '/en' || current === '/en/' || current === '/en/index.html';
  if (!chineseHome && !englishHome) return;

  const target = new URL(location.href);
  const override = target.searchParams.get('lang');
  let preferred = valid(override) ? override : null;
  try {
    if (preferred) localStorage.setItem(storageKey, preferred);
    else {
      const saved = localStorage.getItem(storageKey);
      if (valid(saved)) preferred = saved;
    }
  } catch { /* Browser language remains available without storage. */ }

  if (!preferred) {
    const language = navigator.languages?.[0] || navigator.language || '';
    preferred = /^zh(?:-|$)/i.test(language) ? 'zh-Hant' : 'en';
  }

  if (valid(override)) target.searchParams.delete('lang');
  target.pathname = preferred === 'zh-Hant' ? '/' : '/en/';
  if ((preferred === 'zh-Hant' && !chineseHome) || (preferred === 'en' && !englishHome)) {
    location.replace(target.href);
  } else if (valid(override)) {
    history.replaceState(history.state, '', target.href);
  }
})();
