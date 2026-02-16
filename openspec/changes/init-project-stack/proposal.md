## Why

The project has a defined tech stack (TypeScript 5.x, Node.js 20+, Vitest, ESLint, Prettier, tsup, tsx) but no initialized codebase. Without project scaffolding, development cannot begin. A PR verification workflow is also needed to maintain code quality from the first commit.

## What Changes

- Initialize a Node.js project with `package.json` configured for TypeScript 5.x and ES modules
- Add all dependencies from the tech stack: `fast-xml-parser`, `openai`, `commander`, `p-limit`, `dotenv`
- Add dev dependencies: `typescript`, `tsup`, `tsx`, `vitest`, `eslint`, `prettier`, and related configs
- Create `tsconfig.json` for TypeScript compilation targeting Node.js 20+
- Create ESLint and Prettier configuration files
- Scaffold the `src/` directory structure with placeholder modules (`index.ts`, `parser.ts`, `generator.ts`, `writer.ts`, `types.ts`)
- Add npm scripts for `build`, `dev`, `test`, `lint`, `format`, and `typecheck`
- Create a GitHub Actions workflow for PR verification (type check, lint, test)
- Add a `.env.example` file documenting required environment variables

## Capabilities

### New Capabilities
- `project-scaffold`: Package.json, TypeScript config, directory structure, and npm scripts for the book generator CLI
- `code-quality`: ESLint and Prettier configuration for consistent code style enforcement
- `pr-verification`: GitHub Actions workflow that runs type checking, linting, and tests on pull requests

### Modified Capabilities
<!-- No existing capabilities to modify -->

## Impact

- New files at project root: `package.json`, `tsconfig.json`, `.eslintrc.json`, `.prettierrc`, `.env.example`
- New directory: `src/` with TypeScript module stubs
- New directory: `.github/workflows/` with CI configuration
- Dependencies: ~15 npm packages (runtime + dev)
- All future PRs will be gated by the verification workflow
