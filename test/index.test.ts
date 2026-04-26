import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../src/index.js';
import type { PokemonRepository } from '../src/repository/pokemon-repository.js';
import type { TranslationRepository } from '../src/repository/translation-repository.js';
import type { Pokemon } from '../src/types.js';

const mockPokemonData: Record<string, Pokemon> = {
  mewtwo: {
    name: 'mewtwo',
    description: 'It was created by a scientist.',
    habitat: 'rare',
    isLegendary: true
  },
  charizard: {
    name: 'charizard',
    description: 'A fire-breathing Pokemon.',
    habitat: 'mountain',
    isLegendary: false
  },
  zubat: {
    name: 'zubat',
    description: 'A bat Pokemon.',
    habitat: 'cave',
    isLegendary: false
  },
  pikachu: {
    name: 'pikachu',
    description: 'A mouse Pokemon.',
    habitat: 'forest',
    isLegendary: false
  }
};

const mockPokemonRepo: PokemonRepository = {
  getPokemonByName: async (name: string): Promise<Pokemon | null> => mockPokemonData[name] ?? null
};

const mockSuccessTranslationRepo: TranslationRepository = {
  translateToYoda: async (text: string) => `Yoda: ${text}`,
  translateToShakespeare: async (text: string) => `Shakespeare: ${text}`
};

const mockFailingTranslationRepo: TranslationRepository = {
  translateToYoda: async () => null,
  translateToShakespeare: async () => null
};

test('Pokemon endpoint suite: GET /pokemon/:pokemon', async (t) => {
  const app = createApp(mockPokemonRepo, mockSuccessTranslationRepo);

  await t.test('returns standard pokemon data', async () => {
    const response = await request(app).get('/pokemon/charizard');
    assert.strictEqual(response.status, 200);
    assert.deepStrictEqual(response.body, mockPokemonData.charizard);
  });

  await t.test('normalizes input', async () => {
    const response = await request(app).get('/pokemon/%20MewTwo%20');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.name, 'mewtwo');
  });

  await t.test('returns 404 for unknown pokemon', async () => {
    const response = await request(app).get('/pokemon/super-mario');
    assert.strictEqual(response.status, 404);
  });

  await t.test('returns 400 for numeric input', async () => {
    const response = await request(app).get('/pokemon/123');
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'Bad Request');
  });

  await t.test('returns 500 when repository throws', async () => {
    const failingPokemonRepo: PokemonRepository = {
      getPokemonByName: async () => {
        throw new Error('Pokemon API error');
      }
    };
    const failingApp = createApp(failingPokemonRepo, mockSuccessTranslationRepo);
    const response = await request(failingApp).get('/pokemon/mewtwo');
    assert.strictEqual(response.status, 500);
  });
});

test('Translated endpoint suite: GET /pokemon/translated/:pokemon', async (t) => {
  const app = createApp(mockPokemonRepo, mockSuccessTranslationRepo);

  await t.test('uses Yoda for legendary pokemon', async () => {
    const response = await request(app).get('/pokemon/translated/mewtwo');
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.description.startsWith('Yoda:'));
  });

  await t.test('uses Yoda for cave habitat', async () => {
    const response = await request(app).get('/pokemon/translated/zubat');
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.description.startsWith('Yoda:'));
  });

  await t.test('uses Shakespeare otherwise', async () => {
    const response = await request(app).get('/pokemon/translated/pikachu');
    assert.strictEqual(response.status, 200);
    assert.ok(response.body.description.startsWith('Shakespeare:'));
  });

  await t.test('falls back on translation failure', async () => {
    const fallbackApp = createApp(mockPokemonRepo, mockFailingTranslationRepo);
    const response = await request(fallbackApp).get('/pokemon/translated/pikachu');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.description, mockPokemonData.pikachu.description);
  });

  await t.test('normalizes input', async () => {
    const response = await request(app).get('/pokemon/translated/%20MewTwo%20');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.name, 'mewtwo');
  });

  await t.test('returns 404 for unknown pokemon', async () => {
    const response = await request(app).get('/pokemon/translated/super-mario');
    assert.strictEqual(response.status, 404);
  });

  await t.test('returns 400 for numeric input', async () => {
    const response = await request(app).get('/pokemon/translated/123');
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'Bad Request');
  });

  await t.test('returns 500 when pokemon repository throws', async () => {
    const failingPokemonRepo: PokemonRepository = {
      getPokemonByName: async () => {
        throw new Error('Pokemon API error');
      }
    };
    const failingApp = createApp(failingPokemonRepo, mockSuccessTranslationRepo);
    const response = await request(failingApp).get('/pokemon/translated/mewtwo');
    assert.strictEqual(response.status, 500);
  });

  await t.test('returns 500 when translation repository throws', async () => {
    const throwingTranslationRepo: TranslationRepository = {
      translateToYoda: async () => {
        throw new Error('Translation API error');
      },
      translateToShakespeare: async () => {
        throw new Error('Translation API error');
      }
    };
    const failingApp = createApp(mockPokemonRepo, throwingTranslationRepo);
    const response = await request(failingApp).get('/pokemon/translated/mewtwo');
    assert.strictEqual(response.status, 500);
  });
});

test('OpenAPI docs expose required challenge paths', async () => {
  const app = createApp(mockPokemonRepo, mockSuccessTranslationRepo);
  const response = await request(app).get('/openapi.json');

  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.openapi, '3.0.3');
  assert.ok(response.body.paths['/pokemon/{pokemon}']);
  assert.ok(response.body.paths['/pokemon/translated/{pokemon}']);
});
