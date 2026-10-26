import { getCopy, homePath, type Locale } from '../lib/content';
import { Button } from './button';
import { SiteShell } from './site-shell';

export default function ErrorPage({ locale }: { locale: Locale }) {
  const t = getCopy(locale);
  return (
    <SiteShell locale={locale} error>
      <section className="error-section wrap">
        <p className="eyebrow">REVTEL / 404</p><h1>{t.not_found}</h1><p>{t.not_found_body}</p>
        <Button href={homePath(locale)} primary>{t.back}</Button>
      </section>
    </SiteShell>
  );
}
