import express from 'express';
import type { Request, Response } from 'express';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import type { PokemonRepository } from './repository/pokemon-repository.js';
import { HttpPokemonRepository } from './repository/http-pokemon-repository.js';
import type { TranslationRepository } from './repository/translation-repository.js';
import { HttpTranslationRepository } from './repository/http-translation-repository.js';
import { openApiDocument } from './openapi.js';
import { PokemonParamsSchema, type Pokemon } from './types.js';

export function createApp(pokemonRepository: PokemonRepository, translationRepository: TranslationRepository) {
  const app = express();

  app.get('/openapi.json', (_req: Request, res: Response) => {
    res.status(200).json(openApiDocument);
  });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

  // Helper to get base pokemon data
  const getBasePokemon = async (pokemonName: string): Promise<Pokemon | null> => {
    const normalizedName = pokemonName.trim().toLowerCase();
    if (!isNaN(Number(normalizedName)) && normalizedName !== '') {
      return null; // Zod will handle this in routes, but for safety
    }
    return await pokemonRepository.getPokemonByName(normalizedName);
  };

  // 1. Standard Endpoint
  app.get('/pokemon/:pokemon', async (req: Request, res: Response) => {
    const resultParams = PokemonParamsSchema.safeParse(req.params);
    if (!resultParams.success) {
      return res.status(400).json({
        error: 'Bad Request',
        details: resultParams.error.issues.map(i => i.message)
      });
    }

    try {
      const pokemonData = await getBasePokemon(resultParams.data.pokemon);
      if (!pokemonData) {
        return res.status(404).send('Pokemon not found');
      }
      res.status(200).json(pokemonData);
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  });

  // 2. Translated Endpoint
  app.get('/pokemon/translated/:pokemon', async (req: Request, res: Response) => {
    const resultParams = PokemonParamsSchema.safeParse(req.params);
    if (!resultParams.success) {
      return res.status(400).json({
        error: 'Bad Request',
        details: resultParams.error.issues.map(i => i.message)
      });
    }

    try {
      const pokemonData = await getBasePokemon(resultParams.data.pokemon);
      if (!pokemonData) {
        return res.status(404).send('Pokemon not found');
      }

      let translatedDescription: string | null = null;

      if (pokemonData.habitat === 'cave' || pokemonData.isLegendary) {
        translatedDescription = await translationRepository.translateToYoda(pokemonData.description);
      } else {
        translatedDescription = await translationRepository.translateToShakespeare(pokemonData.description);
      }

      res.status(200).json({
        ...pokemonData,
        description: translatedDescription || pokemonData.description
      });
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  });

  return app;
}

const defaultApp = createApp(new HttpPokemonRepository(), new HttpTranslationRepository());

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const port = process.env.PORT || 3000;
  defaultApp.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default defaultApp;
