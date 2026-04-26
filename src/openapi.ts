export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'TrueLayer Pokemon API',
    version: '1.0.0',
    description: 'REST API for standard and translated Pokemon information.'
  },
  servers: [
    {
      url: 'http://localhost:3000'
    }
  ],
  tags: [
    { name: 'Pokemon' }
  ],
  components: {
    schemas: {
      PokemonResponse: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'mewtwo' },
          description: {
            type: 'string',
            example: 'It was created by a scientist after years of experiments.'
          },
          habitat: { type: 'string', example: 'rare' },
          isLegendary: { type: 'boolean', example: true }
        },
        required: ['name', 'description', 'habitat', 'isLegendary']
      },
      BadRequestResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Bad Request' },
          details: {
            type: 'array',
            items: { type: 'string' },
            example: ['Pokemon name cannot be a number']
          }
        },
        required: ['error', 'details']
      },
      NotFoundResponse: {
        type: 'string',
        example: 'Pokemon not found'
      },
      InternalServerErrorResponse: {
        type: 'string',
        example: 'Internal Server Error'
      }
    }
  },
  paths: {
    '/pokemon/{pokemon}': {
      get: {
        tags: ['Pokemon'],
        summary: 'Get standard pokemon information',
        parameters: [
          {
            name: 'pokemon',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Pokemon name'
          }
        ],
        responses: {
          '200': {
            description: 'Pokemon details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PokemonResponse' }
              }
            }
          },
          '400': {
            description: 'Invalid pokemon name',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BadRequestResponse' }
              }
            }
          },
          '404': {
            description: 'Pokemon not found',
            content: {
              'text/plain': {
                schema: { $ref: '#/components/schemas/NotFoundResponse' }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'text/plain': {
                schema: { $ref: '#/components/schemas/InternalServerErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/pokemon/translated/{pokemon}': {
      get: {
        tags: ['Pokemon'],
        summary: 'Get translated pokemon information',
        description: 'Uses Yoda for cave/legendary pokemon, Shakespeare otherwise.',
        parameters: [
          {
            name: 'pokemon',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Pokemon name'
          }
        ],
        responses: {
          '200': {
            description: 'Pokemon details with translated description',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PokemonResponse' }
              }
            }
          },
          '400': {
            description: 'Invalid pokemon name',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BadRequestResponse' }
              }
            }
          },
          '404': {
            description: 'Pokemon not found',
            content: {
              'text/plain': {
                schema: { $ref: '#/components/schemas/NotFoundResponse' }
              }
            }
          },
          '500': {
            description: 'Internal server error',
            content: {
              'text/plain': {
                schema: { $ref: '#/components/schemas/InternalServerErrorResponse' }
              }
            }
          }
        }
      }
    }
  }
} as const;
