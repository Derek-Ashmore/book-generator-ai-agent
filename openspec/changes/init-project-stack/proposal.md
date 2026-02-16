## Why

The project has a defined tech stack (TypeScript 5.x, Node.js 20+, Vitest, ESLint, Prettier, tsup, tsx) but no initialized codebase. Without project scaffolding, development cannot begin. A PR verification workflow is also needed to maintain code quality from the first commit.

## What Changes

- Initialize a Node.js project with `package.json` configured for TypeScript 5.x and ES modules
- Add all dependencies from the tech stack: `fast-xml-parser`, `openai`, `commander`, `p-limit`, `dotenv`
- Add dev dependencies: `typescript`, `tsup`, `tsx`, `vitest`, `eslint`, `prettier`, and related configs
- Create `tsconfig.json` for TypeScript compilation targeting Node.js 20+
- Create ESLint and Prettier configuration files
- Scaffold the `src/` directory structure with placeholder modules (`index.ts`, `parser.ts`, `generator.ts`, `writer.ts`, `types.ts`)
- Define an `LlmClient` interface in `src/llm/client.ts` that abstracts LLM interactions behind a provider-agnostic contract
- Implement `OpenAiClient` in `src/llm/openai.ts` as the default `LlmClient` implementation using the `openai` npm package
- Implement `StubLlmClient` in `src/llm/stub.ts` for deterministic testing — returns preconfigured responses keyed by prompt content
- Wire `generator.ts` to accept an `LlmClient` via dependency injection rather than importing OpenAI directly
- Add acceptance tests in `tests/acceptance/` that exercise the full pipeline (parse → generate → write) using `StubLlmClient` to verify deterministic behavior
- Add npm scripts for `build`, `dev`, `test`, `test:accept`, `lint`, `format`, and `typecheck`
- Create a GitHub Actions workflow for PR verification (type check, lint, test, acceptance tests)
- Add a `.env.example` file documenting required environment variables

## Capabilities

### New Capabilities
- `project-scaffold`: Package.json, TypeScript config, directory structure, and npm scripts for the book generator CLI
- `code-quality`: ESLint and Prettier configuration for consistent code style enforcement
- `llm-abstraction`: Provider-agnostic `LlmClient` interface with an OpenAI implementation and a stub implementation for deterministic testing
- `acceptance-tests`: End-to-end acceptance tests that exercise the full pipeline using `StubLlmClient`, verifiable without API keys
- `pr-verification`: GitHub Actions workflow that runs type checking, linting, unit tests, and acceptance tests on pull requests

### Modified Capabilities
<!-- No existing capabilities to modify -->

## Impact

- New files at project root: `package.json`, `tsconfig.json`, `.eslintrc.json`, `.prettierrc`, `.env.example`
- New directory: `src/` with TypeScript module stubs
- New directory: `src/llm/` with `LlmClient` interface, `OpenAiClient`, and `StubLlmClient`
- New directory: `tests/acceptance/` with end-to-end pipeline tests using stubbed LLM
- New directory: `.github/workflows/` with CI configuration
- Dependencies: ~15 npm packages (runtime + dev)
- All future PRs will be gated by the verification workflow (including acceptance tests that require no API keys)
