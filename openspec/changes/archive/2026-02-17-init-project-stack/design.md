## Context

The project is a greenfield TypeScript CLI tool for generating books from FreeMind mind maps. The tech stack is defined in `openspec/project.md` but no code, configuration, or CI exists yet. The repository currently contains only project documentation and tooling configuration (Claude Flow, OpenSpec).

LLM interactions are inherently non-deterministic, making it impossible to write reliable acceptance tests against live LLM APIs. Additionally, the project anticipates supporting multiple LLM providers beyond OpenAI. Both concerns are addressed by abstracting LLM access behind an interface and providing a stub implementation for testing.

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

### 6. LLM Client Interface and Dependency Injection
Define an `LlmClient` interface in `src/llm/client.ts` with a single method `generateSection(prompt: string): Promise<string>`. The `generator.ts` module accepts an `LlmClient` via its function signature rather than importing a concrete implementation. This enables swapping providers (OpenAI, Anthropic, local models) and injecting a stub for testing.

**Alternative**: Pass a configuration flag to switch providers inside `generator.ts` — rejected because it couples the generator to all providers and makes testing harder.

### 7. Stub LLM Client for Deterministic Testing
Implement `StubLlmClient` in `src/llm/stub.ts` that returns preconfigured responses. The stub can be initialized with a response map (keyed by prompt substring or index) or a single default response. This allows acceptance tests to exercise the full parse → generate → write pipeline with predictable output, verifying all deterministic logic without LLM variability.

**Alternative**: Mock the `openai` package at the module level in tests — rejected because it is brittle (tied to OpenAI SDK internals) and would not survive a provider switch.

### 8. CLI-Driven LLM Provider Selection
The CLI entry point uses Commander.js to expose a `--llm` / `-l` option with choices `openai` and `stub`. The value defaults to `openai`. Based on the argument, `index.ts` instantiates the corresponding `LlmClient` implementation before passing it to the generator. When `--llm stub` is used, no API key is required, making it easy to run the tool locally without credentials or in CI acceptance tests.

**Alternative**: Environment variable (e.g., `LLM_PROVIDER=stub`) — rejected because a CLI argument is more explicit, discoverable via `--help`, and aligns with the existing Commander.js argument pattern.

### 9. Code Coverage in PR Verification
Configure Vitest with `--coverage` using the `@vitest/coverage-v8` provider. The test job in the GitHub Actions workflow runs coverage collection and writes a coverage summary to `$GITHUB_STEP_SUMMARY` so it appears on the workflow run summary page. This gives reviewers immediate visibility into test coverage without leaving the PR checks view.

**Alternative**: Upload coverage as an artifact and rely on external services (Codecov, Coveralls) — rejected for initial setup because it adds external dependencies. `$GITHUB_STEP_SUMMARY` is zero-cost and built into GitHub Actions.

### 10. Acceptance Tests in PR Verification
Add a `test:accept` npm script that runs acceptance tests in `tests/acceptance/`. These tests use `StubLlmClient` and a fixture `.mm` file to exercise the full pipeline and assert on the output file structure and content. The GitHub Actions workflow adds an `acceptance` job alongside typecheck, lint, and test.

**Alternative**: Run acceptance tests as part of the unit test suite — rejected because acceptance tests are conceptually different (full pipeline, file I/O) and should be independently runnable and reportable.

## Risks / Trade-offs

- **[ESLint flat config ecosystem support]** → Some ESLint plugins may not support flat config yet. Mitigation: Use `typescript-eslint` which has full flat config support.
- **[Dependency version drift]** → Pinning exact versions in `package.json` prevents drift but requires manual updates. Mitigation: Use `^` ranges for minor version flexibility; rely on lockfile for reproducibility.
- **[Empty stubs may confuse linting]** → Placeholder files with unused exports will trigger lint warnings. Mitigation: Add minimal type exports that satisfy the linter without implementing logic.
- **[LLM interface granularity]** → A single `generateSection` method may not cover all future LLM use cases (e.g., streaming, multi-turn). Mitigation: Start minimal; the interface can be extended with additional methods as new capabilities are needed. The abstraction boundary is the important part.
- **[Stub fidelity]** → Stub responses do not validate prompt quality or LLM-specific formatting. Mitigation: Acceptance tests verify the deterministic pipeline logic (parsing, assembly, file writing); LLM output quality is a separate concern tested via integration tests with real API keys (out of scope for PR checks).
- **[Coverage threshold enforcement]** → Not adding a minimum coverage threshold initially. Coverage is reported for visibility only. Mitigation: A threshold can be added once a baseline is established after initial implementation.
