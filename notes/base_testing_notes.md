# Base Tier Testing Gap Analysis

## What pr-verify.yml executes

The `test` job runs `npx vitest run --coverage` which picks up all tests under `tests/` (configured via `vitest.config.ts` with `dir: 'tests'`). The `acceptance` job separately runs `npx vitest run tests/acceptance/`.

Existing unit-level tests:
- `tests/types.test.ts` — verifies that `Outline`, `Chapter`, and `Section` types can be constructed. This is a basic type-shape sanity check.

The acceptance test (`tests/acceptance/pipeline.test.ts`) exercises the full parse-generate-write pipeline with a stub LLM, but it is an integration/acceptance test, not a deterministic unit test.

## Base tier items from the Testing Pyramid NOT covered by pr-verify.yml

### 1. Orchestration logic — "Does the agent correctly sequence tool calls?"

No unit tests verify that `generateBook` processes chapters in order, or that the overall pipeline (parse -> generate -> write) is sequenced correctly. The acceptance test covers this implicitly but there are no isolated unit tests with a stubbed LLM that assert call ordering on the LLM client (e.g., verifying `generateSection` is called once per section in the correct order).

### 2. Tool routing — "Does it invoke the right function for a given intent?"

No unit tests verify that the CLI (`src/index.ts`) routes to the correct LLM client based on the `--llm` flag, or that it selects `OpenAiClient` vs `StubLlmClient` appropriately. No unit tests verify that `parseOutline` is called for the outline input, or that `writeBook` receives the generator output.

### 3. Resilience and fault tolerance — "How does the agent recover from tool failures, timeouts, and malformed responses?"

No tests exist for any failure scenarios:
- What happens when the LLM client throws an error mid-generation?
- What happens when `generateSection` times out?
- What happens when the LLM returns an empty or malformed response?
- No retry or fallback logic is tested (or appears to exist in the code).

### 4. State management — "Does the conversation context persist correctly?"

No tests verify state management across the generation pipeline. For example:
- Does chapter ordering state persist correctly when passed from generator to writer?
- Is the outline model preserved faithfully through the pipeline?

### 5. Error handling and resilience — "How does the system behave when tools fail, APIs timeout, or responses are malformed? Does it retry, fall back, or degrade gracefully?"

No tests exist for:
- Invalid or malformed XML input to `parseOutline` (missing root node, missing TEXT attributes, empty file)
- File system errors during `writeBook` (permission denied, disk full, invalid path)
- Missing or invalid API key handling in the CLI
- Graceful degradation when individual chapter generation fails

### 6. Input validation and output formatting

No unit tests for:
- `parseOutline` with edge-case inputs (single chapter, no sections, empty points, deeply nested nodes, non-FreeMind XML)
- Output formatting of generated chapters (heading structure, markdown correctness)
- `writeBook` filename formatting (chapter numbering, zero-padding beyond 99 chapters)
- Book.txt manifest format validation

## Summary

The only unit test running in pr-verify.yml is the type construction check in `tests/types.test.ts`. All six sub-categories of the Base tier have gaps. The most critical missing test areas are **orchestration logic**, **error handling/resilience**, and **input validation**, as these are the areas most likely to catch regressions on every commit — which is the stated purpose of the Base tier.
