import express from 'express';
import type { Request, Response } from 'express';
import { fileURLToPath } from 'url';
import type { PokemonRepository } from './repository/pokemon-repository.js';
import { HttpPokemonRepository } from './repository/http-pokemon-repository.js';
import { PokemonParamsSchema } from './types.js';

export function createApp(repository: PokemonRepository) {
  const app = express();

  app.get('/pokemon/translated/:pokemon', async (req: Request, res: Response) => {
    // Validate parameters using Zod
    const resultParams = PokemonParamsSchema.safeParse(req.params);
    
    if (!resultParams.success) {
      return res.status(400).json({
        error: 'Bad Request',
        details: resultParams.error.issues.map(i => i.message)
      });
    }

    const { pokemon } = resultParams.data;
    const normalizedName = pokemon.trim().toLowerCase();

    try {
      const result = await repository.getPokemonByName(normalizedName);
      if (!result) {
        return res.status(404).send('Pokemon not found');
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  });

  return app;
}

// Default instance for normal execution
const defaultApp = createApp(new HttpPokemonRepository());

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const port = process.env.PORT || 3000;
  defaultApp.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default defaultApp;
