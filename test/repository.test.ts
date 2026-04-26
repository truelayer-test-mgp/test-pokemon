import test from 'node:test';
import assert from 'node:assert';
import { HttpPokemonRepository } from '../src/repository/http-pokemon-repository.js';
import { HttpTranslationRepository } from '../src/repository/http-translation-repository.js';

type MockResponseShape = {
  status?: number;
  ok?: boolean;
  jsonData?: unknown;
  textData?: string;
  jsonThrows?: boolean;
};

function createMockResponse(shape: MockResponseShape): Response {
  const status = shape.status ?? 200;
  const ok = shape.ok ?? (status >= 200 && status < 300);
  return {
    status,
    ok,
    json: async () => {
      if (shape.jsonThrows) {
        throw new Error('Invalid JSON');
      }
      return shape.jsonData;
    },
    text: async () => shape.textData ?? ''
  } as unknown as Response;
}

test('HttpPokemonRepository', async (t) => {
  const originalFetch = globalThis.fetch;
  const repository = new HttpPokemonRepository();

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  await t.test('returns mapped pokemon for successful response', async () => {
    globalThis.fetch = (async () =>
      createMockResponse({
        status: 200,
        jsonData: {
          name: 'mewtwo',
          is_legendary: true,
          habitat: { name: 'rare' },
          flavor_text_entries: [
            { language: { name: 'ja' }, flavor_text: 'ignored' },
            { language: { name: 'en' }, flavor_text: 'Line one.\nLine two.\f' }
          ]
        }
      })) as typeof fetch;

    const result = await repository.getPokemonByName('mewtwo');
    assert.deepStrictEqual(result, {
      name: 'mewtwo',
      description: 'Line one. Line two. ',
      habitat: 'rare',
      isLegendary: true
    });
  });

  await t.test('returns null for 404', async () => {
    globalThis.fetch = (async () => createMockResponse({ status: 404, ok: false })) as typeof fetch;
    const result = await repository.getPokemonByName('unknown');
    assert.strictEqual(result, null);
  });

  await t.test('throws on non-404 non-ok response', async () => {
    globalThis.fetch = (async () => createMockResponse({ status: 500, ok: false })) as typeof fetch;
    await assert.rejects(() => repository.getPokemonByName('mewtwo'));
  });

  await t.test('uses default description when no english flavor text exists', async () => {
    globalThis.fetch = (async () =>
      createMockResponse({
        status: 200,
        jsonData: {
          name: 'ditto',
          is_legendary: false,
          habitat: null,
          flavor_text_entries: [{ language: { name: 'fr' }, flavor_text: 'Texte.' }]
        }
      })) as typeof fetch;

    const result = await repository.getPokemonByName('ditto');
    assert.deepStrictEqual(result, {
      name: 'ditto',
      description: 'No description available.',
      habitat: 'unknown',
      isLegendary: false
    });
  });

  await t.test('rethrows when fetch/json fails', async () => {
    globalThis.fetch = (async () => {
      throw new Error('Network failure');
    }) as typeof fetch;
    await assert.rejects(() => repository.getPokemonByName('mewtwo'));
  });
});

test('HttpTranslationRepository', async (t) => {
  const originalFetch = globalThis.fetch;
  const repository = new HttpTranslationRepository();

  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  await t.test('returns translated text for Yoda', async () => {
    globalThis.fetch = (async () =>
      createMockResponse({
        status: 200,
        jsonData: { contents: { translated: 'Yoda text' } }
      })) as typeof fetch;
    const result = await repository.translateToYoda('hello');
    assert.strictEqual(result, 'Yoda text');
  });

  await t.test('returns translated text for Shakespeare', async () => {
    globalThis.fetch = (async () =>
      createMockResponse({
        status: 200,
        jsonData: { contents: { translated: 'Shakespeare text' } }
      })) as typeof fetch;
    const result = await repository.translateToShakespeare('hello');
    assert.strictEqual(result, 'Shakespeare text');
  });

  await t.test('returns null when translation api is non-ok', async () => {
    globalThis.fetch = (async () =>
      createMockResponse({
        status: 429,
        ok: false,
        textData: 'Too many requests'
      })) as typeof fetch;
    const result = await repository.translateToYoda('hello');
    assert.strictEqual(result, null);
  });

  await t.test('returns null when payload has no translated value', async () => {
    globalThis.fetch = (async () =>
      createMockResponse({
        status: 200,
        jsonData: { contents: {} }
      })) as typeof fetch;
    const result = await repository.translateToShakespeare('hello');
    assert.strictEqual(result, null);
  });

  await t.test('returns null when fetch throws', async () => {
    globalThis.fetch = (async () => {
      throw new Error('Network failure');
    }) as typeof fetch;
    const result = await repository.translateToYoda('hello');
    assert.strictEqual(result, null);
  });

  await t.test('returns null when json parsing throws', async () => {
    globalThis.fetch = (async () => createMockResponse({ status: 200, jsonThrows: true })) as typeof fetch;
    const result = await repository.translateToShakespeare('hello');
    assert.strictEqual(result, null);
  });
});
