## 1. OpenAiClient Configuration

- [x] 1.1 Add `OpenAiClientOptions` interface with optional `model`, `temperature`, and `seed` params to `src/llm/openai.ts`
- [x] 1.2 Refactor `OpenAiClient` constructor to accept either a plain string (backward-compatible) or `OpenAiClientOptions`
- [x] 1.3 Wire `temperature` and `seed` into the chat completions API call using conditional spread
- [x] 1.4 Export `OpenAiClientOptions` from `src/llm/index.ts`

## 2. Constrained Model Test Suite

- [x] 2.1 Create `tests/constrained/constrained-model.test.ts` with `beforeAll` setup that reads `OPENAI_API_KEY` and instantiates `OpenAiClient` with temperature=0 and seed=42
- [x] 2.2 Add prompt effectiveness tests: non-trivial prose generation, content point referencing
- [x] 2.3 Add basic capability tests: few content points, many content points
- [x] 2.4 Add structured output compliance test: validate assembled chapter markdown has headings, prose, and balanced formatting
- [x] 2.5 Add end-to-end generation test: full `generateBook` pipeline with real LLM producing correct chapter structure

## 3. npm Script

- [x] 3.1 Add `test:constrained` script to `package.json` running `vitest run tests/constrained/`

## 4. GitHub Actions Workflow

- [x] 4.1 Replace placeholder `constrained_model_tests.yml` with real workflow: checkout, setup Node 20, npm ci, run vitest on `tests/constrained/`
- [x] 4.2 Configure `OPENAI_API_KEY` from GitHub secrets and `CONSTRAINED_MODEL` from workflow dispatch input
- [x] 4.3 Add model selection dropdown input (gpt-4o default, gpt-4o-mini option)
- [x] 4.4 Add job summary step that parses vitest JSON output into markdown tables with test results

## 5. Validation

- [x] 5.1 Verify constrained tests pass locally with `OPENAI_API_KEY` set
- [x] 5.2 Verify existing deterministic tests still pass (`npm test`)
- [x] 5.3 Verify `OpenAiClient` backward compatibility (string constructor still works)
