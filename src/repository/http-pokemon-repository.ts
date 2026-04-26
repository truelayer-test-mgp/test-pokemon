import type { PokemonRepository } from './pokemon-repository.js';
import { PokemonSchema, type Pokemon } from '../types.js';

export class HttpPokemonRepository implements PokemonRepository {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon-species';

  async getPokemonByName(name: string): Promise<Pokemon | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${name}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`PokeAPI responded with status: ${response.status}`);
      }

      const data = await response.json();

      // Find the first English flavor text entry
      const englishFlavorText = data.flavor_text_entries?.find(
        (entry: any) => entry.language.name === 'en'
      )?.flavor_text || 'No description available.';

      // Clean up flavor text (remove special characters like \n and \f)
      const cleanDescription = englishFlavorText.replace(/[\n\f]/g, ' ');

      const pokemonData = {
        name: data.name,
        description: cleanDescription,
        habitat: data.habitat?.name || 'unknown',
        isLegendary: data.is_legendary,
      };

      // Validate the data using Zod to ensure it matches our interface
      return PokemonSchema.parse(pokemonData);
    } catch (error) {
      console.error('Error fetching Pokemon from PokeAPI:', error);
      // Re-throw to be handled by the controller's try/catch
      throw error;
    }
  }
}
