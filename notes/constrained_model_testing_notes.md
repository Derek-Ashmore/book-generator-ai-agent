# Constrained Model Testing — Analysis and Design Notes

## Mapping Pyramid Items to This Codebase

The Testing Pyramid's Lower-Middle tier lists four test categories and four control techniques. Here's how each maps to the book-generator-ai-agent:

### Test Categories

**1. Prompt effectiveness — "Does your system prompt reliably elicit the right behavior?"**

The generator builds prompts in `src/generator.ts:30`:
```
Write a section titled "${section.header}" covering: ${section.points.join(', ')}
```
This is the only prompt template in the codebase. A constrained model test should call the real LLM with this exact prompt format and assert:
- The response is non-trivial prose (not empty, not an error, not raw JSON)
- The response references or addresses the topic from the section header
- The response touches on the content points provided

Since there is no system prompt today (only a user message), the test validates the user-prompt template. If a system prompt is added later, the test should be extended.

**2. Basic capability — "Can the model handle your core use cases?"**

Core use cases for this application:
- Generate prose for a section with a few content points (the standard case)
- Generate prose for a section with many content points (stress test)
- Generate prose for a single-section chapter vs. a multi-section chapter (the generator handles both)

These tests verify the model can produce reasonable output for the range of inputs the application sends.

**3. Structured output compliance — "Does it return valid JSON/follow your schema?"**

The current `LlmClient.generateSection()` returns free-form text, not JSON. The application doesn't use structured output modes. This creates a question about how literally to apply this pyramid item — see Questions section below.

Options:
- **Option A**: Validate that the text output, when assembled into chapter markdown by `generateChapter`, produces valid Leanpub markdown (has headings, prose paragraphs, no broken formatting). This is a "structured output" in the loose sense.
- **Option B**: Add a new structured output capability (e.g., `generateSectionMetadata` returning JSON with `{title, summary, wordCount}`) specifically to test JSON schema compliance. This adds test-only complexity.
- **Option C**: Skip this category for now and revisit when the application adds structured output support (e.g., for table of contents generation, metadata extraction).

My recommendation: **Option A** for now — validate that LLM output produces well-formed markdown when assembled. Note this in the proposal but flag for your input.

**4. Tool selection under controlled conditions**

In this codebase, "tool selection" maps to: does the generator call `generateSection` with the correct prompts for each section? The Base tier tests this with stubs. The constrained model test does it with a real LLM to verify the full chain works end-to-end under controlled conditions. This is essentially a mini integration test with temperature=0.

### Control Techniques

**temperature=0**: The `OpenAiClient` currently hardcodes no temperature (uses API default). Tests need a way to set `temperature: 0`. Options:
- Add a `temperature` constructor param to `OpenAiClient`
- Create a test subclass/wrapper
- Pass options through `generateSection`

I recommend adding optional constructor params to `OpenAiClient` for `temperature` and `seed`. This is a small, useful change that also benefits future production use (configurable temperature).

**Fixed random seeds**: OpenAI supports a `seed` parameter on chat completions. Same approach — add to constructor options.

**Structured output modes**: Not currently used. See Option A/B/C above.

**Carefully crafted test inputs**: Use topic/points combinations with objectively clear content. Example: section header "The Water Cycle" with points ["evaporation", "condensation", "precipitation"]. The response can be validated for keyword presence without being brittle.

## Workflow Design

The `constrained_model_tests.yml` workflow should:
1. Trigger on `workflow_dispatch` only (requires API key, costs money)
2. Install dependencies (`npm ci`)
3. Run `npx vitest run tests/constrained/` with `OPENAI_API_KEY` from secrets
4. Report results in workflow summary

Tests should be in `tests/constrained/` to keep them separate from deterministic unit tests and acceptance tests.

A new npm script `test:constrained` would run just these tests.

## Source Changes Needed

1. **`src/llm/openai.ts`**: Add optional `temperature` and `seed` constructor params so tests can control randomness
2. **`tests/constrained/`**: New test directory with constrained model test files
3. **`.github/workflows/constrained_model_tests.yml`**: Replace placeholder with real test execution
4. **`package.json`**: Add `test:constrained` script

## Questions for Review

1. **Structured output compliance**: The application currently only produces free-form text, not JSON/structured output. Should we:
   - (A) Validate that LLM text output produces well-formed markdown when assembled? (my recommendation)
   - (B) Add a structured output capability specifically for testing?
   - (C) Skip this category until the app adds structured output features?

2. **API cost management**: Each workflow run makes ~4-8 real API calls. Should we:
   - Add a test budget/limit mechanism?
   - Use a cheaper model (e.g., `gpt-4o-mini`) for constrained tests instead of `gpt-4o`?
   - Make the model configurable via workflow input?

3. **Assertion strictness**: Constrained model tests inherently have more variability than deterministic tests. How strict should assertions be?
   - **Loose**: Response is non-empty, reasonable length, contains at least one keyword from the input
   - **Medium**: Response addresses the topic, references most content points, is well-formed prose (my recommendation)
   - **Strict**: Response matches a specific structure or contains exact phrases (likely too brittle)

4. **OpenAiClient modification**: Adding `temperature` and `seed` params to the constructor changes production code for testing purposes. Are you comfortable with this, or should we use a test-only subclass instead?

5. **Model selection**: Should constrained tests use `gpt-4o` (same as production) or `gpt-4o-mini` (cheaper, faster, but different capability profile)? Using the production model gives higher signal but costs more.

6. **Retry handling**: LLM API calls can fail transiently (rate limits, timeouts). Should constrained tests include retry logic, or should transient failures simply fail the workflow run?

## Implementation Decisions Made

Based on the analysis above, these decisions were made during implementation:

1. **Structured output compliance**: Chose **Option A** — validate that LLM output produces well-formed markdown when assembled via `generateBook`. This tests the real integration path without adding test-only production code.

2. **API cost management**: Default model is `gpt-4o-mini` (cheaper/faster), configurable to `gpt-4o` via workflow dispatch input. This keeps CI costs low while allowing full-signal runs on demand.

3. **Assertion strictness**: Chose **Medium** — assertions check that responses address the topic, reference most content points, are of reasonable length, and are well-formed prose. Not brittle on exact phrasing.

4. **OpenAiClient modification**: Added `OpenAiClientOptions` interface with optional `model`, `temperature`, and `seed` params. Constructor remains backward-compatible (accepts a plain `string` for just the API key). This is useful beyond testing — configurable model/temperature is good production design.

5. **Model selection**: Defaults to `gpt-4o` (same as production). The OpenAI project API key only has access to `gpt-4o`, not `gpt-4o-mini`, so `gpt-4o` is the only viable default. If project access is expanded, the workflow dispatch input allows selecting `gpt-4o-mini`.

6. **Retry handling**: No retry logic added. Transient failures fail the run, which is appropriate for `workflow_dispatch`-only tests that a human triggers intentionally.

## Differences from the Testing Pyramid (Lower-Middle Section)

The Testing Pyramid's Lower-Middle tier describes constrained model tests for a generic AI agent. Several aspects differ when applied to this specific codebase:

### Applicable and Implemented

- **Prompt effectiveness**: Directly applicable. The generator has a single prompt template; we test it with real LLM calls and validate the output is relevant prose.
- **Basic capability**: Directly applicable. We test with varying input sizes (few vs many content points).
- **temperature=0**: Directly applicable. Added as a constructor option to `OpenAiClient`.
- **Fixed random seeds**: Directly applicable. OpenAI supports the `seed` parameter; added to constructor options.
- **Carefully crafted test inputs**: Directly applicable. Tests use factual topics (water cycle, photosynthesis, plate tectonics) with objectively verifiable keywords.

### Adapted / Partially Applicable

- **Structured output compliance**: The pyramid assumes the agent produces structured output (JSON, function calls). This agent produces free-form prose only. Adapted to validate markdown structure of the assembled chapter output instead. This is a meaningful structural validation even though it's not JSON schema compliance.
- **Tool selection under controlled conditions**: The pyramid assumes the agent selects between multiple tools. This agent has no tool selection — it always calls `generateSection` with the same prompt template. Adapted to test the end-to-end generation pipeline (`generateBook`) with a real LLM, which validates the full chain including prompt construction and content assembly.

### Not Applicable Currently

- **Structured output modes (JSON schema, function calling)**: The application does not use OpenAI structured output modes or function calling. There is no JSON schema to validate against. If structured outputs are added in the future (e.g., for metadata extraction or table of contents generation), this test category should be revisited.
- **Complex tool routing under controlled conditions**: The agent does not route between different tools or capabilities. Every section uses the same `generateSection` call. The Base tier's deterministic tests already validate call ordering and prompt construction. The constrained test adds value by verifying the real LLM produces usable output, but there is no tool-selection logic to test.
