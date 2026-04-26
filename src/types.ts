import { z } from 'zod';

export const PokemonSchema = z.object({
  name: z.string(),
  description: z.string(),
  habitat: z.string(),
  isLegendary: z.boolean(),
});

export type Pokemon = z.infer<typeof PokemonSchema>;

export const PokemonParamsSchema = z.object({
  pokemon: z.string().min(1).refine((val) => isNaN(Number(val)), {
    message: "Pokemon name cannot be a number",
  }),
});
