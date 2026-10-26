import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { extname, join } from 'node:path';

test('returning browsers retire the root worker without clearing project caches or reloading project tabs', async ({ browser }) => {
  let upgraded = false;
  let projectRequests = 0;
  const retirementWorker = await readFile('out/sw.js', 'utf8');
  // Reproduce the old root worker's cached documents and lifecycle.
  const oldWorker = `
    const cacheName = 'sw-precache-v3-gatsby-plugin-offline-' + self.registration.scope;
    self.addEventListener('install', event => event.waitUntil((async () => {
      const cache = await caches.open(cacheName);
      for (const path of ['/', '/en/post-one/']) {
        await cache.put(path, new Response('<!doctype html><h1>Legacy cached page</h1>', {
          headers: {'Content-Type': 'text/html'}
        }));
      }
      await self.skipWaiting();
    })()));
    self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
    self.addEventListener('fetch', event => event.respondWith((async () => {
      return await (await caches.open(cacheName)).match(event.request) || fetch(event.request);
    })()));
  `;
  const server = createServer(async (request, response) => {
    const path = new URL(request.url!, 'http://localhost').pathname;
    if (path === '/sw.js') {
      response.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' });
      response.end(upgraded ? retirementWorker : oldWorker);
      return;
    }
    if (path === '/react-native-nfc-manager/') {
      projectRequests += 1;
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('<!doctype html><title>Project site</title><h1>Project site</h1>');
      return;
    }
    const file = join('out', path.endsWith('/') ? `${path}index.html` : path);
    try {
      const body = await readFile(file);
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
      response.writeHead(200, { 'Content-Type': type[extname(file) as keyof typeof type] ?? 'application/octet-stream' });
      response.end(body);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(origin);
    await page.evaluate(async () => {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      await (await caches.open('other-project-cache')).put('/project-data', new Response('preserve me'));
    });
    await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    await page.reload();
    await expect(page.locator('h1')).toHaveText('Legacy cached page');

    const oldEnglishPage = await context.newPage();
    await oldEnglishPage.goto(`${origin}/en/post-one/`);
    await expect(oldEnglishPage.locator('h1')).toHaveText('Legacy cached page');
    const projectPage = await context.newPage();
    await projectPage.goto(`${origin}/react-native-nfc-manager/`);
    await expect(projectPage.locator('h1')).toHaveText('Project site');
    const requestsBeforeUpgrade = projectRequests;

    upgraded = true;
    await page.evaluate(() => { navigator.serviceWorker.getRegistration('/').then((registration) => registration?.update()); });
    await expect(page.locator('h1')).toHaveText('讓技術，連結更多可能。');
    await expect(oldEnglishPage).toHaveURL(`${origin}/en/`);
    await expect(oldEnglishPage.locator('html')).toHaveAttribute('lang', 'en');
    await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length)).toBe(0);
    expect(await page.evaluate(() => caches.keys())).toEqual(['other-project-cache']);
    expect(projectRequests).toBe(requestsBeforeUpgrade);
    await expect(projectPage.locator('h1')).toHaveText('Project site');
  } finally {
    await context.close();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
