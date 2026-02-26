## Context

The project has deterministic unit tests (Base tier) that stub the LLM entirely and acceptance tests that use `StubLlmClient` to exercise the full pipeline. These tests cannot detect model capability changes, prompt regressions, or structured output compliance failures because they never call a real LLM. The Testing Pyramid defines a "Lower-Middle — Constrained Model Tests" tier to fill this gap: real API calls under controlled conditions (temperature=0, fixed seeds) to validate that prompts work and outputs are usable.

The `constrained_model_tests.yml` GitHub Actions workflow existed as a placeholder running `echo`. The `OpenAiClient` had no mechanism to control temperature or seed, making deterministic-ish testing impossible.

## Goals / Non-Goals

**Goals:**
- Add constrained model tests that make real OpenAI API calls under controlled conditions
- Validate prompt effectiveness, basic capability, structured output compliance, and end-to-end generation
- Make `OpenAiClient` configurable for temperature, seed, and model selection
- Replace the placeholder workflow with real test execution
- Keep constrained tests separate from deterministic tests (own directory, own npm script)

**Non-Goals:**
- Adding retry logic for transient API failures (failures simply fail the workflow)
- Achieving deterministic exact-match assertions (medium strictness: topic relevance, keyword presence)
- Supporting structured output modes (JSON schema, function calling) — the application produces free-form prose only
- Running constrained tests on PR verification (they require API keys and cost money)

## Decisions

### 1. OpenAiClient Options Interface
Add an `OpenAiClientOptions` interface with optional `model`, `temperature`, and `seed` params. The constructor accepts either a plain string (backward-compatible) or the options object. This is useful beyond testing — configurable model/temperature is good production design.

**Alternative**: Test-only subclass or wrapper — rejected because the options are genuinely useful in production and the change is minimal and backward-compatible.

### 2. Structured Output Validation via Markdown Assembly
Validate that LLM text output produces well-formed markdown when assembled by `generateBook` — headings present, prose non-empty, no broken formatting (e.g., unmatched backtick fences). This adapts the "structured output compliance" pyramid category to an application that produces prose, not JSON.

**Alternative**: Add a JSON-returning capability solely for testing — rejected as unnecessary complexity with no production value.

### 3. Medium Assertion Strictness
Assertions check that responses address the topic, reference most content points, are of reasonable length, and are well-formed prose. Not brittle on exact phrasing, but not just "non-empty" either.

**Alternative**: Strict (exact phrases) — rejected as too brittle for LLM output. Loose (just non-empty) — rejected as insufficient signal.

### 4. Default Model: gpt-4o
Default to `gpt-4o` (same as production). The workflow dispatch input allows selecting `gpt-4o-mini` for cheaper runs. The `CONSTRAINED_MODEL` environment variable makes this configurable at runtime.

**Alternative**: Default to `gpt-4o-mini` — rejected because production uses `gpt-4o` and the project API key's access is confirmed for `gpt-4o`.

### 5. No Retry Logic
Transient failures (rate limits, timeouts) fail the workflow run. This is appropriate for `workflow_dispatch`-only tests triggered intentionally by a human. Retries add complexity and mask intermittent issues.

**Alternative**: Automatic retry with backoff — rejected to keep tests simple and failures visible.

### 6. Carefully Crafted Test Inputs
Use factual topics with objectively verifiable keywords: "The Water Cycle" (evaporation, condensation, precipitation), "Photosynthesis" (chlorophyll, sunlight, carbon dioxide, glucose), "Plate Tectonics" (continental drift, earthquakes, volcanoes). These have clear correct answers that allow keyword-based validation without brittleness.

## Risks / Trade-offs

- **[API cost per run]** Each workflow run makes 4-8 real API calls with `gpt-4o`. Cost is low per run but accumulates. Mitigation: workflow_dispatch-only trigger prevents accidental runs; model is configurable to use cheaper options.
- **[Non-determinism despite controls]** Even with temperature=0 and fixed seed, LLM outputs can vary across API versions. Mitigation: Medium-strictness assertions that check topic/keyword relevance rather than exact output.
- **[Secret requirement]** Tests require `OPENAI_API_KEY` as a GitHub Actions secret. Mitigation: Tests are isolated to their own workflow and npm script; failure to configure the secret is immediately visible.
- **[Production code changed for testing]** `OpenAiClient` gains constructor options. Mitigation: The change is backward-compatible and the options have genuine production utility (configurable model and temperature).
