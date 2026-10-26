import { community, projects, type Copy } from '../lib/content';
import { Button, Lines } from './button';

type ProjectKind = keyof typeof projects;

function ProjectArt({ kind }: { kind: ProjectKind }) {
  if (kind === 'manager') {
    return (
      <div className="project-art library-art" aria-hidden="true">
        <span>{'{'}</span><i /><span>{'}'}</span><b className="art-dot" />
      </div>
    );
  }
  return (
    <div className="project-art app-art" aria-hidden="true">
      <svg viewBox="0 0 180 150" fill="none">
        <rect x="34" y="25" width="78" height="104" rx="20" transform="rotate(-12 34 25)" stroke="currentColor" strokeWidth="3" />
        <path d="M74 68C87 76 87 91 77 102M89 55C113 68 117 94 101 116M106 43C142 62 149 99 127 130" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="art-dot" />
    </div>
  );
}

export function ProjectCard({ kind, copy: t }: { kind: ProjectKind; copy: Copy }) {
  const { repo, website } = projects[kind];
  const stars = community[kind].stars;
  return (
    <article className={`project-card ${kind}`} data-project={kind}>
      <div className="card-top">
        <span className="project-role">{t[`${kind}_role`]}</span>
        <a className="star-count" href={`${repo}/stargazers`} aria-label={`${kind} · ${stars} GitHub stars`}>
          <span aria-hidden="true">★</span> {stars.toLocaleString('en-US')}
        </a>
      </div>
      <ProjectArt kind={kind} />
      <span className="project-index">{kind === 'manager' ? '01 / LIBRARY' : '02 / APP'}</span>
      <h3><Lines text={t[`${kind}_title`]} /></h3>
      <p className="project-tagline">{t[`${kind}_tagline`]}</p>
      <p className="project-description">{t[`${kind}_body`]}</p>
      <ul className="feature-tags">{t[`${kind}_features`].map((feature) => <li key={feature}>{feature}</li>)}</ul>
      <div className="project-links">
        <Button href={website} primary>{t[`${kind}_cta`]}</Button>
        <a className="source-link" href={repo}>{t.source} <span aria-hidden="true">↗</span></a>
      </div>
    </article>
  );
}
