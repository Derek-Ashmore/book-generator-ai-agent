## ADDED Requirements

### Requirement: ESLint configuration
The project SHALL have an ESLint flat config (`eslint.config.js`) that extends `typescript-eslint` recommended rules and applies to all TypeScript files in `src/`.

#### Scenario: ESLint runs without config errors
- **WHEN** `npx eslint src/` is run
- **THEN** ESLint processes all `.ts` files in `src/` using the flat config

### Requirement: Prettier configuration
The project SHALL have a `.prettierrc` file with consistent formatting rules including double quotes and a trailing comma setting.

#### Scenario: Prettier config exists
- **WHEN** `.prettierrc` is inspected
- **THEN** it defines `semi`, `singleQuote`, and `trailingComma` settings

### Requirement: Lint npm script
The project SHALL define a `lint` npm script that runs ESLint on the `src/` directory.

#### Scenario: Lint script runs
- **WHEN** `npm run lint` is run
- **THEN** ESLint checks all TypeScript files in `src/`

### Requirement: Format npm script
The project SHALL define a `format` npm script that runs Prettier with `--write` on `src/` files.

#### Scenario: Format script is defined
- **WHEN** `package.json` scripts are inspected
- **THEN** a `format` script exists that invokes Prettier

### Requirement: Typecheck npm script
The project SHALL define a `typecheck` npm script that runs `tsc --noEmit`.

#### Scenario: Typecheck script runs
- **WHEN** `npm run typecheck` is run
- **THEN** TypeScript checks all source files without emitting output
