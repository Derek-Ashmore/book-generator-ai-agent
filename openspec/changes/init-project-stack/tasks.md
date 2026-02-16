## 1. Project Configuration

- [ ] 1.1 Create `package.json` with name, type "module", engine >=20.0.0, and all npm scripts (build, dev, test, test:accept, lint, format, typecheck)
- [ ] 1.2 Create `tsconfig.json` targeting ES2022 with ESNext modules, bundler resolution, strict mode, and outDir "dist"
- [ ] 1.3 Create `.env.example` with `OPENAI_API_KEY=`

## 2. Dependencies

- [ ] 2.1 Install runtime dependencies: fast-xml-parser, openai, commander, p-limit, dotenv
- [ ] 2.2 Install dev dependencies: typescript, tsup, tsx, vitest, eslint, prettier, typescript-eslint, @types/node, @vitest/coverage-v8

## 3. Code Quality Configuration

- [ ] 3.1 Create `eslint.config.js` with typescript-eslint flat config for src/ TypeScript files
- [ ] 3.2 Create `.prettierrc` with semi, singleQuote, and trailingComma settings

## 4. Source Scaffolding

- [ ] 4.1 Create `src/types.ts` exporting Outline, Chapter, and Section interfaces
- [ ] 4.2 Create `src/parser.ts` with placeholder module stub
- [ ] 4.3 Create `src/generator.ts` stub that accepts an `LlmClient` parameter via dependency injection (not a hardcoded import)
- [ ] 4.4 Create `src/writer.ts` with placeholder module stub
- [ ] 4.5 Create `src/index.ts` CLI entry point with Commander setup — wire `--llm` / `-l` argument (choices: `openai`, `stub`; default: `openai`) to instantiate the corresponding `LlmClient` implementation

## 5. LLM Abstraction Layer

- [ ] 5.1 Create `src/llm/client.ts` defining the `LlmClient` interface with `generateSection(prompt: string): Promise<string>`
- [ ] 5.2 Create `src/llm/openai.ts` implementing `OpenAiClient` class that wraps the `openai` npm package
- [ ] 5.3 Create `src/llm/stub.ts` implementing `StubLlmClient` class that returns preconfigured deterministic responses (supports default response and prompt-keyed response map)
- [ ] 5.4 Create `src/llm/index.ts` barrel export re-exporting `LlmClient`, `OpenAiClient`, and `StubLlmClient`

## 6. Build Configuration

- [ ] 6.1 Create `tsup.config.ts` targeting ESM output from src/index.ts

## 7. Test Setup

- [ ] 7.1 Create `vitest.config.ts` with test directory set to tests/
- [ ] 7.2 Create `tests/types.test.ts` with a basic smoke test for type exports

## 8. Acceptance Tests

- [ ] 8.1 Create `tests/acceptance/fixtures/sample.mm` — a minimal FreeMind outline fixture with at least 2 chapters and 2 sections each
- [ ] 8.2 Create `tests/acceptance/pipeline.test.ts` — full pipeline test that parses the fixture, generates content via `StubLlmClient`, writes output, and asserts on file structure, content, and `Book.txt` ordering
- [ ] 8.3 Verify acceptance tests are deterministic (same input → same output on repeated runs)

## 9. PR Verification Workflow

- [ ] 9.1 Create `.github/workflows/pr-verify.yml` with parallel typecheck, lint, test, and acceptance jobs on Node.js 20 with npm caching (no API keys required)
- [ ] 9.2 Configure the test job to run Vitest with `--coverage` flag using `@vitest/coverage-v8`
- [ ] 9.3 Add a step in the test job that writes the coverage summary to `$GITHUB_STEP_SUMMARY` (markdown table with line, branch, function, and statement percentages)

## 10. Validation

- [ ] 10.1 Verify `npm run typecheck` passes
- [ ] 10.2 Verify `npm run lint` passes
- [ ] 10.3 Verify `npm test` passes
- [ ] 10.4 Verify `npm run test:accept` passes (no API keys needed)
- [ ] 10.5 Verify `npm run build` produces dist/index.js
