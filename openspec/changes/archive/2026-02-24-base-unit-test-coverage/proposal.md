## Why

The `base-deterministic-unit-tests.yml` workflow is a placeholder that runs `echo` instead of actual tests. The gap analysis (`notes/base_testing_notes.md`) identified that all six Base tier sub-categories lack unit test coverage: orchestration logic, tool routing, resilience/fault tolerance, state management, error handling, and input validation/output formatting. The only unit test today (`tests/types.test.ts`) checks type construction — it exercises zero application logic. Adding deterministic unit tests to this workflow ensures regressions in core pipeline behavior are caught on every commit without requiring LLM API keys.

## What Changes

- Add deterministic unit tests for `parseOutline` covering valid input, edge cases (single chapter, no sections, empty points), and invalid input (malformed XML, missing root node, non-FreeMind XML, empty string)
- Add deterministic unit tests for `generateBook` verifying sequential chapter processing, correct call ordering on the LLM client, prompt construction per section, and behavior when the outline has zero chapters
- Add deterministic unit tests for `generateBook` error scenarios: LLM client throws mid-generation, LLM returns empty string
- Add deterministic unit tests for `writeBook` verifying directory creation, file naming (zero-padded chapter numbers), Book.txt manifest content/ordering, and behavior with zero chapters
- Add deterministic unit tests for CLI tool routing: `--llm stub` selects `StubLlmClient`, `--llm openai` selects `OpenAiClient`, missing API key produces an error
- Add deterministic unit tests for state integrity: outline model passes through parse → generate → write without mutation, chapter ordering is preserved end-to-end
- Update `base-deterministic-unit-tests.yml` to install dependencies and run the new unit tests via Vitest with a tag/path filter that selects only deterministic unit tests (not acceptance tests)

## Capabilities

### New Capabilities
- `base-unit-tests`: Deterministic unit test suite covering parser input validation, generator orchestration logic, writer output formatting, CLI tool routing, error handling, and state management — all runnable without API keys or network access

### Modified Capabilities
- `pr-verification`: The `base-deterministic-unit-tests.yml` workflow changes from a placeholder to a functional CI job that installs dependencies, runs the deterministic unit test suite, and reports results

## Impact

- New test files under `tests/unit/` (parser, generator, writer, cli, state tests)
- Modified workflow: `.github/workflows/base-deterministic-unit-tests.yml` gains real install + test steps
- No changes to source code — tests exercise existing behavior
- No new runtime dependencies; only uses existing `vitest` dev dependency
- Workflow will run on `workflow_dispatch` (existing trigger) — no change to PR verification flow
