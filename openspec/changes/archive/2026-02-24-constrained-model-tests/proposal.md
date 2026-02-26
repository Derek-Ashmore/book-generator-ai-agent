## Why

The `constrained_model_tests.yml` workflow is a placeholder that runs `echo` instead of actual tests. The Testing Pyramid defines a "Lower-Middle — Constrained Model Tests" tier that validates basic model capability using real LLM calls under controlled conditions (temperature=0, fixed seeds, structured outputs). The Base tier (deterministic unit tests) stubs the LLM entirely — it cannot detect model capability changes or structured output compliance failures. Constrained model tests fill this gap by making real API calls while minimizing non-determinism.

## What Changes

- Add a constrained model test for **basic capability**: call the real LLM with representative inputs from each core use case (single-section chapter, multi-section chapter, section with many content points) and assert that responses address the topic, reference most content points, and are well-formed prose (non-empty, reasonable length, no raw JSON or error messages)
- Add a constrained model test for **structured output compliance**: validate that the LLM text output, when assembled into chapter markdown by `generateChapter`, produces valid Leanpub markdown (has headings, prose paragraphs, no broken formatting)
- Add a constrained model test for **tool selection under controlled conditions**: run the full pipeline (parse → generate → write) with the real LLM (temperature=0) on a minimal fixture outline and verify that the generator correctly invokes `generateSection` for each section (correct number of calls, prompts contain expected section headers and content points)
- Configure all constrained model tests to use `temperature=0` to minimize randomness
- Configure the LLM client in tests to use a fixed seed where the API supports it (OpenAI's `seed` parameter)
- Add optional `temperature` and `seed` constructor params to `OpenAiClient` so tests can control randomness — these also benefit future production use (configurable temperature)
- Make the model configurable — a user should be able to specify which model to use (e.g., via constructor option or workflow input), enabling cost control and testing against different model capabilities
- Use carefully crafted test inputs that have clear "correct" answers — e.g., a section about "The water cycle" with points "evaporation, condensation, precipitation" where the response can be validated for topical relevance
- Include retry logic in constrained model tests to handle transient LLM API failures (rate limits, timeouts) without failing the workflow run
- Update `constrained_model_tests.yml` to install dependencies, configure the `OPENAI_API_KEY` secret, and run the constrained model test suite via Vitest with a path filter selecting only `tests/constrained/`
- The workflow SHALL remain `workflow_dispatch` only (not triggered on PRs) since it requires API keys and incurs cost

## Capabilities

### New Capabilities
- `constrained-model-tests`: Test suite making real LLM calls under controlled conditions (temperature=0, fixed seeds) to validate basic model capability, structured output compliance, and tool selection — runnable via `workflow_dispatch` with an API key secret

### Modified Capabilities
- `pr-verification`: No change — constrained model tests are intentionally excluded from PR verification due to API key requirements and cost. They run on-demand via `workflow_dispatch`.

## Impact

- New test files under `tests/constrained/` (basic capability, structured output, tool selection tests)
- New or modified source: `src/llm/openai.ts` gains optional `temperature`, `seed`, and `model` constructor params for test control and user configurability
- Modified workflow: `.github/workflows/constrained_model_tests.yml` gains real install + test steps with `OPENAI_API_KEY` from GitHub secrets
- No changes to existing deterministic tests or PR verification workflow
- Requires `OPENAI_API_KEY` GitHub Actions secret to be configured on the repository
- Each workflow run will make a small number of real OpenAI API calls (estimated 3-6 calls, low cost)
- New npm script `test:constrained` to run only the constrained model test suite
