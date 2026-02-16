## Context

The project is a greenfield TypeScript CLI tool for generating books from FreeMind mind maps. The tech stack is defined in `openspec/project.md` but no code, configuration, or CI exists yet. The repository currently contains only project documentation and tooling configuration (Claude Flow, OpenSpec).

## Goals / Non-Goals

**Goals:**
- Establish a working Node.js/TypeScript project that can be built, tested, and linted from day one
- Configure all dependencies listed in the project tech stack
- Scaffold source directory structure matching the architecture in `project.md`
- Create a GitHub Actions PR verification workflow that gates merges on passing checks
- Ensure the project uses ES modules throughout

**Non-Goals:**
- Implementing any application logic (parser, generator, writer) — stubs only
- Setting up deployment or release pipelines
- Configuring non-PR CI workflows (e.g., nightly builds, release publishing)
- Adding pre-commit hooks (can be added later)

## Decisions

### 1. ES Module Configuration
Use `"type": "module"` in `package.json` and `"module": "ESNext"` in `tsconfig.json`. The entire stack (Node 20+, tsup, tsx, vitest) supports ESM natively. This avoids CommonJS/ESM interop issues.

**Alternative**: CommonJS — rejected because modern Node.js tooling favors ESM, and the project has no legacy constraints.

### 2. tsup for Bundling
Use `tsup` as specified in the tech stack. Configure it to output ESM format with a single entry point at `src/index.ts`. This produces a clean `dist/` output.

**Alternative**: `tsc` alone — rejected because tsup provides faster builds and simpler output configuration.

### 3. Flat ESLint Config
Use ESLint v9+ flat config format (`eslint.config.js`) with `typescript-eslint`. This is the modern standard and avoids deprecated `.eslintrc` patterns.

**Alternative**: Legacy `.eslintrc.json` — rejected because ESLint is migrating away from it.

### 4. Vitest Configuration
Use Vitest with inline config in `vitest.config.ts`. Tests live in `tests/` directory (not colocated) to match the project convention in `CLAUDE.md`.

**Alternative**: Jest — rejected because Vitest is specified in the tech stack and has native TypeScript/ESM support.

### 5. PR Verification Workflow
A single GitHub Actions workflow triggered on `pull_request` to `main`. Runs three jobs in parallel: `typecheck`, `lint`, `test`. Uses Node.js 20 with npm caching.

**Alternative**: Single sequential job — rejected because parallel jobs provide faster feedback and clearer failure isolation.

## Risks / Trade-offs

- **[ESLint flat config ecosystem support]** → Some ESLint plugins may not support flat config yet. Mitigation: Use `typescript-eslint` which has full flat config support.
- **[Dependency version drift]** → Pinning exact versions in `package.json` prevents drift but requires manual updates. Mitigation: Use `^` ranges for minor version flexibility; rely on lockfile for reproducibility.
- **[Empty stubs may confuse linting]** → Placeholder files with unused exports will trigger lint warnings. Mitigation: Add minimal type exports that satisfy the linter without implementing logic.
