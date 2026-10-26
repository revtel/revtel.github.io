import { test, expect } from '@playwright/test';

for (const [language, expectedPath, expectedLang] of [
  ['zh-TW', '/', 'zh-Hant'],
  ['zh-CN', '/', 'zh-Hant'],
  ['zh-HK', '/', 'zh-Hant'],
  ['en-US', '/en/', 'en'],
  ['ja-JP', '/en/', 'en'],
] as const) {
  test(`${language}: browser preference selects ${expectedLang} from either homepage`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ locale: language, baseURL });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    try {
      for (const entry of ['/', '/en/']) {
        await page.goto(`${entry}?ref=locale-test#projects`);
        await expect(page).toHaveURL(`${expectedPath}?ref=locale-test#projects`);
        await expect(page.locator('html')).toHaveAttribute('lang', expectedLang);
        await expect(page.locator('.language-switch a')).toHaveAttribute('href', `${expectedPath === '/' ? '/en/' : '/'}#projects`);
      }
      expect(errors).toEqual([]);
    } finally { await context.close(); }
  });
}

test('manual selection overrides browser language and survives reloads and new tabs', async ({ page, context }) => {
  await page.goto('/#community');
  await expect(page).toHaveURL('/en/#community');
  await expect(page.locator('.language-switch a')).toHaveAttribute('href', '/#community');
  await page.locator('.language-switch a').click();
  await expect(page).toHaveURL('/#community');
  expect(await page.evaluate(() => localStorage.getItem('revtel.locale'))).toBe('zh-Hant');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
  const newTab = await context.newPage();
  await newTab.goto('/en/');
  await expect(newTab).toHaveURL('/');
  await expect(newTab.locator('html')).toHaveAttribute('lang', 'zh-Hant');
  await newTab.locator('.language-switch a').click();
  await expect(newTab).toHaveURL('/en/');
  await page.goto('/');
  await expect(page).toHaveURL('/en/');
  expect(await page.evaluate(() => localStorage.getItem('revtel.locale'))).toBe('en');
});

test('first preferred browser language takes priority over secondary languages', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'zh-TW'] }));
  await page.goto('/');
  await expect(page).toHaveURL('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('automatic selection and manual switching work when local storage is blocked', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const blocked = () => { throw new DOMException('Storage blocked', 'SecurityError'); };
    Object.defineProperty(Storage.prototype, 'getItem', { value: blocked });
    Object.defineProperty(Storage.prototype, 'setItem', { value: blocked });
  });
  await page.goto('/#projects');
  await expect(page).toHaveURL('/en/#projects');
  await expect(page.locator('.language-switch a')).toHaveAttribute('href', '/#projects');
  await page.locator('.language-switch a').click();
  await expect(page).toHaveURL('/#projects');
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-Hant');
  await expect(page.locator('.language-switch a')).toHaveAttribute('href', '/en/#projects');
  await page.locator('.language-switch a').click();
  await expect(page).toHaveURL('/en/#projects');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(errors).toEqual([]);
});

test('invalid saved preferences fall back to browser detection', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('revtel.locale', 'unsupported'));
  await page.goto('/');
  await expect(page).toHaveURL('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('unknown paths keep their 404 instead of redirecting to a homepage', async ({ page }) => {
  const response = await page.goto('/missing-page/');
  expect(response?.status()).toBe(404);
  await expect(page).toHaveURL('/missing-page/');
  await expect(page.locator('.error-section')).toBeVisible();
});
