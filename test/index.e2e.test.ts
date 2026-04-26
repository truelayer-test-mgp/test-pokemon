import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/index.js';

test('E2E: GET /pokemon/translated/charizard should return 200 and Charizard data', async (t) => {
  const response = await request(app).get('/pokemon/translated/charizard');
  
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.name, 'charizard');
  assert.strictEqual(typeof response.body.description, 'string');
  assert.ok(response.body.description.length > 0);
});

test('E2E: GET /pokemon/translated/%20MewTwo%20 (normalization) should return 200 and Mewtwo data', async (t) => {
  // Testing space normalization and case-insensitivity
  const response = await request(app).get('/pokemon/translated/%20MewTwo%20');
  
  assert.strictEqual(response.status, 200);
  assert.strictEqual(response.body.name, 'mewtwo');
});

test('E2E: GET /pokemon/translated/super-mario should return 404', async (t) => {
  const response = await request(app).get('/pokemon/translated/super-mario');
  assert.strictEqual(response.status, 404);
});

test('E2E: GET /pokemon/translated/123 should return 400 (Zod validation)', async (t) => {
  const response = await request(app).get('/pokemon/translated/123');
  
  assert.strictEqual(response.status, 400);
  assert.strictEqual(response.body.error, 'Bad Request');
  assert.ok(Array.isArray(response.body.details));
  assert.strictEqual(response.body.details[0], 'Pokemon name cannot be a number');
});
