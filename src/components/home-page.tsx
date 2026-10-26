import { community, getCopy, github, projects, type Locale } from '../lib/content';
import { Button, Lines } from './button';
import { HeroVisual } from './hero-visual';
import { ProjectCard } from './project-card';
import { SiteShell } from './site-shell';

export default function HomePage({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  const metrics = [
    { number: community.manager.stars.toLocaleString('en-US'), project: 'React Native NFC Manager', label: 'GitHub stars', href: `${projects.manager.repo}/stargazers` },
    { number: community.rewriter.stars.toLocaleString('en-US'), project: 'NFC Rewriter', label: 'GitHub stars', href: `${projects.rewriter.repo}/stargazers` },
    { number: community.manager.npm.downloads.toLocaleString('en-US'), project: 'NFC Manager', label: t.npm_label, href: community.manager.npm.source },
    { number: community.rewriter.android.display, project: 'NFC Rewriter', label: t.android_label, href: community.rewriter.android.source },
  ];

  return (
    <SiteShell locale={locale}>
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow"><span className="small-sun" aria-hidden="true" /> REVTEL / {t.eyebrow}</p>
          <h1>{t.hero_line}<br />{t.hero_lead}<span className="hero-accent">{t.hero_accent}</span></h1>
          <p className="hero-intro">{t.intro}</p>
          <p className="hero-description">{t.hero_body}</p>
          <div className="actions">
            <Button href="#projects" primary>{t.explore}</Button>
            <a className="text-link" href={github}>{t.github} ↗</a>
          </div>
        </div>
        <HeroVisual />
      </section>
      <section id="about" className="about-section">
        <div className="about-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none"><path d="M0 70C300-40 435 120 750 42C1060-36 1210 15 1440 45V80H0Z" fill="currentColor" /></svg>
        </div>
        <div className="wrap about-inner">
          <div><p className="eyebrow">{t.about_kicker}</p><h2><Lines text={t.about_title} /></h2></div>
          <div><p>{t.about_body}</p><div className="values">{t.values.map((value) => <span key={value}>{value}</span>)}</div></div>
        </div>
      </section>
      <section id="projects" className="project-section">
        <div className="wrap">
          <div className="section-heading">
            <div><p className="eyebrow">01 / {t.projects_kicker}</p><h2><Lines text={t.projects_title} /></h2></div>
            <p>{t.projects_body}</p>
          </div>
          <div className="project-grid"><ProjectCard kind="manager" copy={t} /><ProjectCard kind="rewriter" copy={t} /></div>
          <p className="project-relationship"><span className="connection-line" aria-hidden="true" />{t.relationship}</p>
          <p className="support-note">{t.support_note}</p>
        </div>
      </section>
      <section id="community" className="community-section wrap">
        <div className="section-heading">
          <div><p className="eyebrow">02 / OPEN SOURCE, IN GOOD COMPANY</p><h2><Lines text={t.community_title} /></h2></div>
          <p>{t.community_body}</p>
        </div>
        <div className="metrics-grid">
          {metrics.map((metric) => (
            <a className="metric" href={metric.href} key={metric.href}>
              <span className="metric-project">{metric.project}</span><strong>{metric.number}</strong>
              <span>{metric.label} <span aria-hidden="true">↗</span></span>
            </a>
          ))}
        </div>
        <div className="community-context">
          <p>{t.adoption_intro}{' '}<a href={community.adoption[0].source}>ZEUS ↗</a><span aria-hidden="true"> / </span><a href={community.adoption[1].source}>Self ↗</a></p>
          <p className="data-note">{t.data_note}</p>
        </div>
      </section>
      <section className="closing-section">
        <div className="closing-orbit" aria-hidden="true" />
        <div className="wrap closing-inner">
          <p className="eyebrow">{t.closing_kicker}</p><h2><Lines text={t.closing_title} /></h2><p>{t.closing_body}</p>
          <Button href={github} primary>{t.closing_cta}</Button>
        </div>
      </section>
    </SiteShell>
  );
}
