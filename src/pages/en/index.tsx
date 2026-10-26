import type { GetStaticProps } from 'next';
import type { Locale } from '../../lib/content';
export { default } from '../../components/home-page';

export const getStaticProps: GetStaticProps<{ locale: Locale }> = () => ({
  props: { locale: 'en' },
});
