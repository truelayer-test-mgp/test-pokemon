import type { Pokemon } from '../types.js';

export interface PokemonRepository {
  getPokemonByName(name: string): Promise<Pokemon | null>;
}
