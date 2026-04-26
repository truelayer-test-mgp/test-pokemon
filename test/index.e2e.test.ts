import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../src/index.js';
import type { PokemonRepository } from '../src/repository/pokemon-repository.js';
import type { TranslationRepository } from '../src/repository/translation-repository.js';
import type { Pokemon } from '../src/types.js';

const app = createApp(
  {
    async getPokemonByName(name: string): Promise<Pokemon | null> {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`PokeAPI responded with status: ${response.status}`);
      const data = await response.json();
      const englishFlavorText =
        data.flavor_text_entries?.find((entry: any) => entry.language.name === 'en')?.flavor_text ||
        'No description available.';
      return {
        name: data.name,
        description: englishFlavorText.replace(/[\n\f]/g, ' '),
        habitat: data.habitat?.name || 'unknown',
        isLegendary: data.is_legendary
      };
    }
  },
  {
    async translateToYoda(text: string): Promise<string | null> {
      const response = await fetch('https://api.funtranslations.mercxry.me/v1/translate/yoda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.contents?.translated ?? null;
    },
    async translateToShakespeare(text: string): Promise<string | null> {
      const response = await fetch('https://api.funtranslations.mercxry.me/v1/translate/shakespeare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.contents?.translated ?? null;
    }
  }
);

test('E2E Standard Pokemon Endpoint (/pokemon/:pokemon)', async (t) => {
  await t.test('GET /pokemon/charizard should return standard data with all expected fields', async () => {
    const response = await request(app).get('/pokemon/charizard');
    assert.strictEqual(response.status, 200);
    
    assert.strictEqual(response.body.name, 'charizard');
    assert.strictEqual(typeof response.body.description, 'string', 'Description should be a string');
    assert.ok(response.body.description.length > 0, 'Description should not be empty');
    assert.strictEqual(typeof response.body.habitat, 'string', 'Habitat should be a string');
    assert.ok(response.body.habitat !== null, 'Habitat should be present');
    assert.strictEqual(typeof response.body.isLegendary, 'boolean', 'isLegendary should be a boolean');
    assert.ok(!response.body.description.startsWith('Yoda:') && !response.body.description.startsWith('Shakespeare:'));
  });

  await t.test('should normalize input (lowercase and trim) for standard endpoint', async () => {
    const response = await request(app).get('/pokemon/%20MewTwo%20'); // Call standard endpoint
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.name, 'mewtwo');
    // For standard endpoint, description should be original, not translated
    assert.ok(response.body.description);
    assert.ok(!response.body.description.startsWith('Yoda:') && !response.body.description.startsWith('Shakespeare:'));
  });

  await t.test('should return 404 for not found pokemon', async () => {
    const response = await request(app).get('/pokemon/super-mario');
    assert.strictEqual(response.status, 404);
  });

  await t.test('should return 400 for numeric input', async () => {
    const response = await request(app).get('/pokemon/123');
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'Bad Request');
  });
});

test('E2E Translated Pokemon Endpoint (/pokemon/translated/:pokemon)', async (t) => {

  await t.test('GET /pokemon/translated/mewtwo (Legendary -> Yoda) should return translated data', async () => {
    const response = await request(app).get('/pokemon/translated/mewtwo');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.name, 'mewtwo');
    assert.strictEqual(response.body.isLegendary, true); 
    assert.ok(response.body.description); 
  });

  await t.test('GET /pokemon/translated/zubat (Cave -> Yoda) should return translated data', async () => {
    const response = await request(app).get('/pokemon/translated/zubat');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.habitat, 'cave'); 
    assert.ok(response.body.description); 
  });

  await t.test('GET /pokemon/translated/pikachu (Standard -> Shakespeare) should return translated data', async () => {
    const response = await request(app).get('/pokemon/translated/pikachu');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.isLegendary, false); 
    assert.notStrictEqual(response.body.habitat, 'cave'); 
    assert.ok(response.body.description); 
  });

  await t.test('should fallback if translation API fails', async () => {
    const fallbackPokemonData: Pokemon = {
      name: 'mewtwo',
      description: 'Fallback description',
      habitat: 'rare',
      isLegendary: true
    };
    const fallbackPokemonRepo: PokemonRepository = {
      getPokemonByName: async () => fallbackPokemonData
    };
    const failingTranslationRepo: TranslationRepository = {
      translateToYoda: async () => null,
      translateToShakespeare: async () => null
    };
    const fallbackApp = createApp(fallbackPokemonRepo, failingTranslationRepo);
    const response = await request(fallbackApp).get('/pokemon/translated/mewtwo');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.description, fallbackPokemonData.description);
  });

  await t.test('should normalize input (lowercase and trim) for translated endpoint', async () => {
    const response = await request(app).get('/pokemon/translated/%20MewTwo%20');
    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.name, 'mewtwo');
    // Live translation providers can change output format or fallback to original text.
    assert.strictEqual(typeof response.body.description, 'string');
    assert.ok(response.body.description.length > 0);
  });

  await t.test('should return 404 Not Found for standard endpoint', async () => {
    const response = await request(app).get('/pokemon/super-mario');
    assert.strictEqual(response.status, 404);
  });

  await t.test('should return 404 Not Found for translated endpoint', async () => {
    const response = await request(app).get('/pokemon/translated/super-mario');
    assert.strictEqual(response.status, 404);
  });

  await t.test('should return 400 Bad Request (Numeric input for translated endpoint)', async () => {
    const response = await request(app).get('/pokemon/translated/123');
    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'Bad Request');
  });
});
