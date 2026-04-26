# TrueLayer Pokemon API

A Node.js REST API built with TypeScript that provides information about Pokemon, designed with clean architecture and Dependency Injection.

## 🚀 Features

- **Endpoint**: `GET /pokemon/translated/:pokemon`
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

- Node.js installed on your machine.
- `npm` (comes with Node.js).

### Installation

```bash
npm install
```

### Running Tests

#### Local
```bash
npm test
```

#### Docker
```bash
npm run test:docker
```

### Starting the Server

```bash
# Development mode (using tsx)
npx tsx src/index.ts
```

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

## 🛡 Design Decisions

1.  **Interface-based DI**: The `createApp` function takes a `PokemonRepository` interface. This allows for easy swapping between a real HTTP repository and a Mock/File repository without changing the core business logic.
2.  **No Heavy Mocking Libraries**: Leveraged the native `node:test` context for manual mocking in tests, keeping dependencies lightweight.
3.  **Strict Normalization**: Input is normalized (trimmed and lowercased) early in the request lifecycle to prevent duplicate logic in repositories.
