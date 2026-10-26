import { copyFile, writeFile } from 'node:fs/promises';

const out = new URL('../out/', import.meta.url);

// Preserve the error-document URLs used by static hosts and language links.
await copyFile(new URL('404/index.html', out), new URL('404.html', out));
await copyFile(new URL('en/404/index.html', out), new URL('en/404.html', out));
// GitHub Pages must serve Next's _next directory without Jekyll filtering it.
await writeFile(new URL('.nojekyll', out), '');
console.log('Static export ready in out/ (including localized 404 and GitHub Pages assets).');
