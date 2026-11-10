const assert = require('node:assert/strict');
const { readdirSync, readFileSync, statSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const root = path.join(__dirname, '../docs');
const pagesRoot = new URL('https://3s-design-io.github.io/3s-design-homepage/');

test('every page uses the static layout and gallery indexes match their images', () => {
  const entries = readdirSync(root, { withFileTypes: true, recursive: true });
  for (const entry of entries.filter(item => item.isFile() && item.name.endsWith('.html'))) {
    const file = path.join(entry.parentPath, entry.name);
    const markup = readFileSync(file, 'utf8');
    assert.match(markup, /class="studio-header"/, file);
    assert.doesNotMatch(markup, /semplice6|rocketlazyloadscript/, file);
    if (!path.relative(root, file).startsWith('project' + path.sep)) continue;

    const plates = [...markup.matchAll(/id="(plate-\d+)"/g)].map(match => match[1]);
    const index = [...markup.matchAll(/href="#(plate-\d+)" data-photo/g)].map(match => match[1]);
    assert.ok(plates.length > 0, file);
    assert.deepEqual(index, plates, file);
  }
});

test('the catalogue links to every project exactly once', () => {
  const catalogue = readFileSync(path.join(root, 'projects/index.html'), 'utf8');
  const links = [...catalogue.matchAll(/<a href="\.\.\/project\/([^"/]+)\/"/g)]
    .map(match => decodeURIComponent(match[1])).sort();
  const projects = readdirSync(path.join(root, 'project'), { withFileTypes: true })
    .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  assert.deepEqual(links, projects);
});

test('pages and assets resolve under the GitHub Pages project path', () => {
  const entries = readdirSync(root, { withFileTypes: true, recursive: true });
  for (const entry of entries.filter(item => item.isFile() && /\.(html|css)$/.test(item.name))) {
    const file = path.join(entry.parentPath, entry.name);
    const relative = path.relative(root, file).split(path.sep).map(encodeURIComponent).join('/');
    const content = readFileSync(file, 'utf8');
    const base = content.match(/<base href="([^"]+)"/)?.[1];
    const page = new URL(base ?? relative, pagesRoot);
    const references = [...content.matchAll(/\b(?:href|src|poster)="([^"]*)"|url\("([^"]+)"\)/g)]
      .map(match => match[1] ?? match[2]);
    for (const [, srcset] of content.matchAll(/\bsrcset="([^"]+)"/g)) {
      references.push(...srcset.split(',').map(item => item.trim().split(/\s+/)[0]));
    }
    for (const reference of references) {
      if (!reference || reference.startsWith('#') || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(reference)) continue;
      const url = new URL(reference, page);
      assert.ok(url.pathname.startsWith(pagesRoot.pathname), `${relative}: ${reference}`);
      const target = path.join(root, decodeURIComponent(url.pathname.slice(pagesRoot.pathname.length)));
      const filePath = statSync(target).isDirectory() ? path.join(target, 'index.html') : target;
      assert.ok(statSync(filePath).isFile(), `${relative}: ${reference}`);
    }
  }
});
