import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('export serves the exact NFC Rewriter association without a redirect', async ({ request }) => {
  const source = await readFile('public/.well-known/apple-app-site-association', 'utf8');
  expect(await readFile('out/.well-known/apple-app-site-association', 'utf8')).toBe(source);
  const response = await request.get('/.well-known/apple-app-site-association', { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(response.headers().location).toBeUndefined();
  expect(response.headers()['content-type']).toBe('application/json');
  expect(await response.text()).toBe(source);
  expect(await response.json()).toEqual({
    applinks: {
      details: [{
        appIDs: ['HE7MCCDHL4.com.revteltech.nfcopenrewriter'],
        components: [
          { '/': '/react-native-nfc-rewriter/' },
          { '/': '/react-native-nfc-rewriter/index.html' },
          { '/': '/react-native-nfc-rewriter/zh-Hant/' },
          { '/': '/react-native-nfc-rewriter/zh-Hant/index.html' },
          { '/': '/react-native-nfc-rewriter/ja/' },
          { '/': '/react-native-nfc-rewriter/ja/index.html' },
        ],
      }],
    },
  });
});
