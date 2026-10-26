import Head from 'next/head';
import Script from 'next/script';
import { useEffect, useState, type ReactNode } from 'react';
import { getCopy, homePath, origin, github, type Locale } from '../lib/content';

function LanguageSwitch({ locale, error }: { locale: Locale; error: boolean }) {
  const [hash, setHash] = useState('');
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  const labels = { 'zh-Hant': '繁體中文', en: 'English' };
  return (
    <nav className="language-switch" aria-label={getCopy(locale).language}>
      {(['zh-Hant', 'en'] as const).map((language) => language === locale ? (
        <span key={language} lang={language} aria-current="true">{labels[language]}</span>
      ) : (
        <a key={language} href={`${homePath(language)}${error ? '404.html' : ''}${hash}`}
          hrefLang={language} lang={language} data-language-switch>
          {labels[language]}
        </a>
      ))}
    </nav>
  );
}

export function SiteShell({ locale, children, error = false }: {
  locale: Locale;
  children: ReactNode;
  error?: boolean;
}) {
  const t = getCopy(locale);
  const home = homePath(locale);
  const path = `${home}${error ? '404.html' : ''}`;
  const title = `${error ? t.not_found : t.title} · Revtel`;
  const description = error ? t.not_found_body : t.description;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content="#FFF9F5" />
        {error ? <meta name="robots" content="noindex,follow" /> : null}
        <link rel="icon" href="/logos/logo-48.png" type="image/png" />
        <link rel="canonical" href={`${origin}${path}`} />
        {(['zh-Hant', 'en', 'x-default'] as const).map((language) => (
          <link key={language} rel="alternate" hrefLang={language}
            href={`${origin}${homePath(language === 'en' ? 'en' : 'zh-Hant')}${error ? '404.html' : ''}`} />
        ))}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${origin}${path}`} />
        <meta property="og:image" content={`${origin}/logos/logo-revtel.png`} />
      </Head>
      <Script src="/assets/legacy-upgrade.js" strategy="afterInteractive" />
      <a className="skip-link" href="#main">{t.skip}</a>
      <header className="site-header wrap">
        <a className="brand" href={home} aria-label={t.home}>
          <img src="/logos/logo-revtel.png" alt="" width="42" height="42" />
          <span>revtel<span className="brand-period">.</span></span>
        </a>
        <div className="header-actions">
          <nav className="main-nav" aria-label={t.nav}>
            <a href={`${home}#about`}>{t.about}</a>
            <a href={`${home}#projects`}>{t.projects}</a>
            <a href={`${home}#community`}>{t.community_nav}</a>
          </nav>
          <LanguageSwitch locale={locale} error={error} />
        </div>
      </header>
      <main id="main" tabIndex={-1}>{children}</main>
      <footer className="site-footer wrap">
        <a className="brand footer-brand" href={home}>revtel<span className="brand-period">.</span></a>
        <span>{t.footer}</span>
        <a href={github}>GitHub ↗</a>
        <p>Revtel · {t.footer_team}</p>
      </footer>
    </>
  );
}
