import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const locales = [
  { path: '/', lang: 'zh-Hant', heading: '讓技術，連結更多可能。', other: '/en/', otherLabel: 'English' },
  { path: '/en/', lang: 'en', heading: 'Stay curious.Build what’s next.', other: '/', otherLabel: '繁體中文' },
] as const;

for (const locale of locales) {
  test.describe(locale.lang, () => {
    test.use({ locale: locale.lang === 'en' ? 'en-US' : 'zh-TW' });
    test(`${locale.lang}: full static content and metadata without JavaScript`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
      const page = await context.newPage();
      const response = await page.goto(locale.path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale.lang);
      await expect(page.locator('h1')).toHaveText(locale.heading);
      await expect(page.locator('article[data-project]')).toHaveCount(2);
      await expect(page.locator('.metric strong')).toHaveText(['1,640', '264', '436,474', '10K+']);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://revtel.github.io${locale.path}`);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', 'https://revtel.github.io/en/');
      await expect(page.locator('link[rel="alternate"][hreflang="zh-Hant"]')).toHaveAttribute('href', 'https://revtel.github.io/');
      await expect(page.locator('.language-switch a')).toHaveAttribute('href', locale.other);
      await page.locator('.language-switch a').click();
      await expect(page).toHaveURL(locale.other);
      await context.close();
    });

    test(`${locale.lang}: language switch preserves section and scripts hydrate cleanly`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('requestfailed', (request) => errors.push(request.url()));
      await page.goto(`${locale.path}#projects`);
      const languageLink = page.locator('.language-switch a');
      await expect(languageLink).toHaveAttribute('href', `${locale.other}#projects`);
      await languageLink.click();
      await expect(page).toHaveURL(`${locale.other}#projects`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale.lang === 'en' ? 'zh-Hant' : 'en');
      await page.locator('.main-nav a[href$="#community"]').click();
      await expect(page.locator('.language-switch a')).toHaveAttribute('href', `${locale.path}#community`);
      await page.reload();
      await expect(page.locator('.language-switch a')).toHaveAttribute('href', `${locale.path}#community`);
      expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(0);
      expect(errors).toEqual([]);
    });

    test(`${locale.lang}: desktop and mobile layout and local assets`, async ({ page, request }) => {
      await page.goto(locale.path);
      const assets = await page.locator('script[src], link[rel="stylesheet"], img[src]').evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('src') ?? element.getAttribute('href')).filter((url): url is string => !!url));
      for (const asset of new Set(assets)) {
        const response = await request.get(asset);
        expect(response.status(), asset).toBe(200);
      }
      for (const width of [1440, 390]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await expect(page.locator('.language-switch')).toBeVisible();
        const columns = await page.locator('.project-grid').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
        expect(columns).toBe(width === 390 ? 1 : 2);
        await page.screenshot({ path: `test-results/${locale.lang}-${width}.png`, fullPage: true });
      }
      await expect(page.locator('[data-project="manager"] .project-links .button')).toHaveAttribute('href', 'https://revtel.github.io/react-native-nfc-manager/');
      await expect(page.locator('[data-project="rewriter"] .project-links .button')).toHaveAttribute('href', 'https://revtel.github.io/react-native-nfc-rewriter/');
    });

    test(`${locale.lang}: localized error document and return link`, async ({ page, request }) => {
      const response = await page.goto(`${locale.path}404.html`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale.lang);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://revtel.github.io${locale.path}404.html`);
      await expect(page.locator('.language-switch a')).toHaveAttribute('href', `${locale.other}404.html`);
      await page.locator('.error-section .button').click();
      await expect(page).toHaveURL(locale.path);
      expect((await request.get(`${locale.path}removed-legacy-page/`)).status()).toBe(404);
    });
  });
}

test('static hosting metadata and old service worker are included in the export', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain('<loc>https://revtel.github.io/en/</loc>');
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://revtel.github.io/sitemap.xml');
  const worker = await request.get('/sw.js');
  expect(worker.status()).toBe(200);
  expect(worker.headers()['content-type']).toContain('javascript');
  expect(await worker.text()).toBe(await readFile('public/sw.js', 'utf8'));
  expect(await readFile('out/.nojekyll', 'utf8')).toBe('');
});
