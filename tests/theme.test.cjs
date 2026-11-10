const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');
const path = require('node:path');

const script = readFileSync(path.join(__dirname, '../docs/assets/js/theme.js'), 'utf8');

test('defaults to night and remembers day mode across pages', () => {
  const preferences = new Map();
  const loadPage = () => {
    const page = { dataset: { theme: 'night' } };
    const button = {
      hidden: true,
      setAttribute(_name, value) { this.pressed = value; },
      addEventListener(_event, listener) { this.click = listener; },
    };
    runInNewContext(script, {
      document: {
        documentElement: page,
        querySelector: () => button,
        addEventListener: (_event, listener) => listener(),
      },
      localStorage: {
        getItem: key => preferences.get(key),
        setItem: (key, value) => preferences.set(key, value),
      },
    });
    return { page, button };
  };

  const home = loadPage();
  assert.equal(home.page.dataset.theme, 'night');
  assert.equal(home.button.hidden, false);
  home.button.click();
  assert.equal(home.page.dataset.theme, 'day');
  assert.equal(home.button.pressed, 'true');

  const project = loadPage();
  assert.equal(project.page.dataset.theme, 'day');
  assert.equal(project.button.pressed, 'true');
  project.button.click();
  assert.equal(project.button.pressed, 'false');
  assert.equal(loadPage().page.dataset.theme, 'night');
});
