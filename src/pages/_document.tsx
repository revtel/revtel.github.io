import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class SiteDocument extends Document {
  render() {
    const locale = this.props.__NEXT_DATA__.props.pageProps.locale === 'en' ? 'en' : 'zh-Hant';
    return (
      <Html lang={locale}>
        <Head />
        <body><Main /><NextScript /></body>
      </Html>
    );
  }
}
