import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from './index.js';
import type { PokemonRepository } from './repository/pokemon-repository.js';
import type { Pokemon } from './types.js';

const pokemonData: Pokemon = {
  name: 'mewtwo',
  description: 'Created by a scientist after years of horrific gene splicing and dna engineering experiments, it was.',
  habitat: 'rare',
  isLegendary: true
};

test('GET /pokemon/translated/:pokemon should return 200 and strict pokemon data when found', async (t) => {
  const mockRepo: PokemonRepository = {
    getPokemonByName: async (name: string) => {
      if (name === 'mewtwo') return pokemonData;
      return null;
    }
  };

  const app = createApp(mockRepo);
  const response = await request(app).get('/pokemon/translated/mewtwo');
  
  assert.strictEqual(response.status, 200);
  assert.deepStrictEqual(response.body, pokemonData);
});

test('GET /pokemon/translated/:pokemon should normalize input (lowercase and trim)', async (t) => {
  let capturedName = '';
  const mockRepo: PokemonRepository = {
    getPokemonByName: async (name: string) => {
      capturedName = name;
      return pokemonData;
    }
  };

  const app = createApp(mockRepo);
  // Send with uppercase and spaces
  await request(app).get('/pokemon/translated/%20MewTwo%20');
  
  assert.strictEqual(capturedName, 'mewtwo', 'The name should be trimmed and lowercased before reaching the repository');
});

test('GET /pokemon/translated/:pokemon should return 404 when pokemon not found', async (t) => {
  const mockRepo: PokemonRepository = {
    getPokemonByName: async () => null
  };

  const app = createApp(mockRepo);
  const response = await request(app).get('/pokemon/translated/unknown-pokemon');
  assert.strictEqual(response.status, 404);
});

test('GET /pokemon/translated/:pokemon should return 400 if input is a number', async (t) => {
  const mockRepo: PokemonRepository = {
    getPokemonByName: async () => null
  };

  const app = createApp(mockRepo);
  const response = await request(app).get('/pokemon/translated/123');
  assert.strictEqual(response.status, 400);
});

test('GET /pokemon/translated/:pokemon should return 500 when repository fails', async (t) => {
  const mockRepo: PokemonRepository = {
    getPokemonByName: async () => {
      throw new Error('Database connection failed');
    }
  };

  const app = createApp(mockRepo);
  const response = await request(app).get('/pokemon/translated/mewtwo');
  
  assert.strictEqual(response.status, 500);
  assert.strictEqual(response.text, 'Internal Server Error');
});
