## ADDED Requirements

### Requirement: Package configuration
The project SHALL have a `package.json` with `"type": "module"`, `"name": "book-generator-ai-agent"`, and engine requirement of `"node": ">=20.0.0"`.

#### Scenario: Valid package.json exists
- **WHEN** the project is initialized
- **THEN** `package.json` exists at the project root with `"type": "module"` and `"engines": { "node": ">=20.0.0" }`

### Requirement: Runtime dependencies
The project SHALL declare `fast-xml-parser`, `openai`, `commander`, `p-limit`, and `dotenv` as production dependencies in `package.json`.

#### Scenario: All runtime dependencies listed
- **WHEN** `package.json` is inspected
- **THEN** the `dependencies` field includes `fast-xml-parser`, `openai`, `commander`, `p-limit`, and `dotenv`

### Requirement: Dev dependencies
The project SHALL declare `typescript`, `tsup`, `tsx`, `vitest`, `eslint`, `prettier`, and `typescript-eslint` as dev dependencies.

#### Scenario: All dev dependencies listed
- **WHEN** `package.json` is inspected
- **THEN** the `devDependencies` field includes `typescript`, `tsup`, `tsx`, `vitest`, `eslint`, `prettier`, and `typescript-eslint`

### Requirement: TypeScript configuration
The project SHALL have a `tsconfig.json` targeting ES2022, with `module` set to `"ESNext"`, `moduleResolution` set to `"bundler"`, `strict` mode enabled, and `outDir` set to `"dist"`.

#### Scenario: TypeScript compiles successfully
- **WHEN** `npx tsc --noEmit` is run
- **THEN** the command exits with code 0

### Requirement: Build script
The project SHALL define a `build` npm script that uses `tsup` to bundle `src/index.ts` into `dist/`.

#### Scenario: Build produces output
- **WHEN** `npm run build` is run
- **THEN** `dist/index.js` is created

### Requirement: Dev script
The project SHALL define a `dev` npm script that uses `tsx` to run `src/index.ts` directly.

#### Scenario: Dev script is defined
- **WHEN** `package.json` scripts are inspected
- **THEN** a `dev` script exists that invokes `tsx src/index.ts`

### Requirement: Test script
The project SHALL define a `test` npm script that runs `vitest run`.

#### Scenario: Test script executes
- **WHEN** `npm test` is run
- **THEN** Vitest executes and reports results

### Requirement: Source directory structure
The project SHALL contain `src/index.ts`, `src/parser.ts`, `src/generator.ts`, `src/writer.ts`, and `src/types.ts` as defined in the project architecture.

#### Scenario: All source files exist
- **WHEN** the `src/` directory is listed
- **THEN** it contains `index.ts`, `parser.ts`, `generator.ts`, `writer.ts`, and `types.ts`

### Requirement: Type definitions stub
The file `src/types.ts` SHALL export the `Outline`, `Chapter`, and `Section` interfaces as defined in the project data model.

#### Scenario: Types are importable
- **WHEN** another module imports from `./types.js`
- **THEN** `Outline`, `Chapter`, and `Section` are available as named exports

### Requirement: CLI interface
The application SHALL be a command-line interface (CLI) tool built with Commander.js. All user interaction SHALL occur through command-line arguments and stdout/stderr output. There SHALL be no GUI, web interface, or interactive prompts.

#### Scenario: CLI entry point is executable
- **WHEN** the built application is invoked via `node dist/index.js --help`
- **THEN** it prints usage information listing all available arguments and exits

### Requirement: Environment variable documentation
The project SHALL include a `.env.example` file documenting the `OPENAI_API_KEY` variable.

#### Scenario: .env.example exists
- **WHEN** the project root is inspected
- **THEN** `.env.example` exists and contains `OPENAI_API_KEY=`
