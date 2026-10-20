import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const appSource = fs.readFileSync(path.join(root, 'assets', 'app.js'), 'utf8');
const htmlEscape = (value = '') => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function pageFiles(directory = root) {
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'assets') continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...pageFiles(target));
    else if (entry.name === '404.html' || (entry.name === 'index.html' && (target === path.join(root, 'index.html') || ['tr', 'en', 'ru'].some((locale) => target.startsWith(path.join(root, locale) + path.sep))))) found.push(target);
  }
  return found;
}

function routeFor(file) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  if (relative === '404.html') return '/404.html';
  if (relative === 'index.html') return '/';
  return `/${relative.replace(/index\.html$/, '')}`;
}

for (const file of pageFiles()) {
  const route = routeFor(file);
  const page = { innerHTML: '' };
  const description = { content: '' };
  const canonical = { href: '' };
  const alternates = Object.fromEntries(['tr', 'en', 'ru', 'x-default'].map((lang) => [lang, { href: '' }]));
  const skip = { textContent: '' };
  const document = {
    title: '',
    documentElement: { lang: 'tr' },
    head: { append() {} },
    querySelector(selector) {
      if (selector === '#app') return page;
      if (selector === '.skip-link') return skip;
      if (selector === 'meta[name="description"]') return description;
      if (selector === 'link[rel="canonical"]') return canonical;
      const alternate = selector.match(/^link\[hreflang="(tr|en|ru|x-default)"\]$/);
      return alternate ? alternates[alternate[1]] : null;
    },
    createElement() { return { setAttribute() {} }; }
  };
  const location = { pathname: route, origin: 'https://fethiyevillacare.com' };
  vm.runInNewContext(appSource, { document, location }, { filename: 'assets/app.js' });

  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/(<div id="app">)[\s\S]*(<\/div>\s*<\/body>)/, `$1${page.innerHTML}$2`);
  const pageDepth = path.relative(root, path.dirname(file)).split(path.sep).filter(Boolean).length;
  const assetPrefix = `${'../'.repeat(pageDepth)}assets/`;
  // Normalize asset links on every build. Replacing `/assets/` as a plain
  // substring makes `../assets/` turn into `..../assets/` on later builds.
  html = html.replace(/((?:href|src)=")([^\"]*?)assets\//g, `$1${assetPrefix}`);
  if (document.title) html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${htmlEscape(document.title)}</title>`);
  if (description.content) html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${htmlEscape(description.content)}" />`);
  if (canonical.href) html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${htmlEscape(canonical.href)}" />`);
  for (const [lang, node] of Object.entries(alternates)) {
    html = html.replace(new RegExp(`(<link rel="alternate" hreflang="${lang}" href=")[^"]*(" \/>)`), `$1${htmlEscape(node.href)}$2`);
  }
  fs.writeFileSync(file, html, 'utf8');
}

console.log(`Rendered ${pageFiles().length} static HTML pages.`);
