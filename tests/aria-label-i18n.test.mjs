import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const i18nScript = readFileSync(
  new URL('../js/i18n.js', import.meta.url),
  'utf8'
);

function parseAttributes(tag) {
  const attributes = {};
  const attrPattern = /([\w:-]+)(?:="([^"]*)")?/g;

  for (const [, name, value = ''] of tag.matchAll(attrPattern)) {
    if (name !== 'a') {
      attributes[name] = value;
    }
  }

  return attributes;
}

function getExternalLinks() {
  return [...html.matchAll(/<a\b[^>]*>/g)]
    .map(([tag]) => ({ tag, attributes: parseAttributes(tag) }))
    .filter(({ attributes }) => attributes.target === '_blank');
}

function createI18nManager({ search = '', language = 'zh-CN', languages } = {}) {
  const context = {
    window: {
      location: { search },
      history: { replaceState() {} },
    },
    document: {
      addEventListener() {},
      getElementById() {
        return null;
      },
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
      dispatchEvent() {},
      documentElement: { lang: 'zh-CN' },
    },
    navigator: {
      language,
      languages: languages ?? [language],
    },
    URL,
    URLSearchParams,
    CustomEvent: class {
      constructor(type, init) {
        this.type = type;
        this.detail = init?.detail;
      }
    },
  };

  vm.createContext(context);

  const i18nScriptWithoutInit = i18nScript.replace(
    /\n?\s*new I18nManager\(\);\s*$/,
    ''
  );
  vm.runInContext(
    `${i18nScriptWithoutInit}\nglobalThis.I18nManager = I18nManager;`,
    context
  );

  return new context.I18nManager();
}

test('external links provide localized aria-label values', () => {
  const externalLinks = getExternalLinks();

  assert.ok(externalLinks.length > 0, 'expected external links in index.html');

  for (const { tag, attributes } of externalLinks) {
    assert.ok(attributes['aria-label'], `missing aria-label: ${tag}`);
    assert.ok(attributes['data-aria-zh'], `missing data-aria-zh: ${tag}`);
    assert.ok(attributes['data-aria-en'], `missing data-aria-en: ${tag}`);
    assert.equal(attributes['aria-label'], attributes['data-aria-zh']);
    assert.doesNotMatch(
      attributes['data-aria-en'],
      /[\u4e00-\u9fff]/,
      `English aria-label contains Chinese text: ${tag}`
    );

    if (
      attributes['data-zh'] &&
      attributes['data-en'] &&
      attributes['data-aria-en'] ===
        `${attributes['data-en']} - Open in new window`
    ) {
      assert.equal(
        attributes['data-aria-zh'],
        `${attributes['data-zh']} - 在新窗口打开`,
        `localized title aria-label does not match data-zh: ${tag}`
      );
    }
  }
});

test('language switch updates localized aria-label values', () => {
  assert.match(i18nScript, /\[data-aria-zh\]\[data-aria-en\]/);
  assert.match(i18nScript, /setAttribute\(\s*['"]aria-label['"]/);
});

test('defaults to browser English when no lang query is provided', () => {
  const manager = createI18nManager({ language: 'en-US' });

  assert.equal(manager.currentLang, 'en');
});

test('defaults to browser Chinese when no lang query is provided', () => {
  const manager = createI18nManager({ language: 'zh-TW' });

  assert.equal(manager.currentLang, 'zh');
});

test('valid lang query takes precedence over browser language detection', () => {
  const manager = createI18nManager({
    search: '?lang=en',
    language: 'zh-CN',
  });

  assert.equal(manager.currentLang, 'en');
});

test('invalid lang query ignores browser locale and falls back to English', () => {
  const manager = createI18nManager({
    search: '?lang=fr',
    language: 'zh-CN',
  });

  assert.equal(manager.currentLang, 'en');
});

test('unrecognized browser language falls back to English', () => {
  const manager = createI18nManager({ language: 'fr-FR', languages: ['fr-FR'] });

  assert.equal(manager.currentLang, 'en');
});
