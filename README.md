# TrueLayer Pokemon API

A Node.js REST API built with TypeScript that provides information about Pokemon, designed with clean architecture and Dependency Injection.

## 🚀 Features

- **Endpoints**:
  - `GET /pokemon/:pokemon`
  - `GET /pokemon/translated/:pokemon`
- **Swagger UI**: Interactive API docs at `GET /docs` (OpenAPI JSON at `GET /openapi.json`).
- **TypeScript**: Full type safety across the project.
- **Dependency Injection**: Decoupled logic using interfaces for repositories.
- **Input Normalization**: Automatically handles case-insensitivity and whitespace in Pokemon names.
- **Native Testing**: Uses the built-in Node.js test runner for maximum performance and zero overhead.

## 🛠 Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v22+)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Testing**: Native `node:test` + [Supertest](https://github.com/ladjs/supertest)
- **Module System**: ES Modules (ESM)

## 📁 Project Structure

```text
├── src/
│   ├── repository/
│   │   ├── pokemon-repository.ts       # Interface definition
│   │   └── http-pokemon-repository.ts  # HTTP implementation
│   ├── index.ts                        # Express App & Factory
│   └── types.ts                        # Shared TypeScript interfaces & Zod schemas
├── test/
│   ├── index.test.ts                   # Unit & Integration tests
│   └── index.e2e.test.ts                 # End-to-End tests
├── package.json
├── tsconfig.json
└── README.md
```

## 🚥 Getting Started

### Prerequisites

- Node.js (v22 or newer)
- `npm` (comes with Node.js)

Verify your local versions:
```bash
node -v
npm -v
```

### Installation

Clone the repository and install dependencies:
```bash
git clone https://github.com/truelayer-test-mgp/test-pokemon or git clone git@github.com:truelayer-test-mgp/test-pokemon.git
cd truelayer
npm install
```

If you already have the repository locally:
```bash
npm install
```

### Running Tests

#### Local
```bash
npm test
```

#### Coverage
```bash
npm run test:coverage
```

#### Docker
```bash
npm run test:docker
```

### Running with Docker

Build the image:
```bash
docker build -t truelayer-api .
```

Run the API container:
```bash
docker run --rm -p 3000:3000 truelayer-api
```

Test a sample endpoint:
```bash
curl http://localhost:3000/pokemon/mewtwo
```

### Starting the Server

```bash
# Development mode (using tsx)
npx tsx src/index.ts
```

By default the API runs on `http://localhost:3000`.

## 🔍 API Usage

### Get Pokemon (Success)
`GET /pokemon/translated/mewtwo`
**Response (200 OK)**:
```json
{
  "name": "mewtwo",
  "description": "Created by a scientist after years of horrific gene splicing and dna engineering experiments, it was.",
  "habitat": "rare",
  "isLegendary": true
}
```

### Invalid Input
`GET /pokemon/translated/123`
**Response (400 Bad Request)**

### Not Found
`GET /pokemon/translated/unknown`
**Response (404 Not Found)**

## 📘 Swagger / OpenAPI

- OpenAPI schema: `GET /openapi.json`
- Swagger UI: `GET /docs`

## 🛡 Design Decisions

1.  **Interface-based DI**: The `createApp` function takes a `PokemonRepository` interface. This allows for easy swapping between a real HTTP repository and a Mock/File repository without changing the core business logic.
2.  **No Heavy Mocking Libraries**: Leveraged the native `node:test` context for manual mocking in tests, keeping dependencies lightweight.
3.  **Strict Normalization**: Input is normalized (trimmed and lowercased) early in the request lifecycle to prevent duplicate logic in repositories.

## 🚀 What I'd change for production

- Add request timeouts, retry policies with backoff, and circuit breakers for external APIs.
- Introduce structured logging and metrics (latency, error rates, translation fallback rate) with centralized monitoring.
- Add caching for Pokemon species responses to reduce external API calls and improve response times.
- Enforce API rate limiting and stronger validation/abuse protection at the edge.
- Standardize error responses as JSON and add request correlation IDs for easier debugging across services.
