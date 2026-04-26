import type { PokemonRepository } from './pokemon-repository.js';
import type { Pokemon } from '../types.js';

export class HttpPokemonRepository implements PokemonRepository {
  async getPokemonByName(name: string): Promise<Pokemon | null> {
    // Implementation will follow later
    return null;
  }
}
