import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

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
