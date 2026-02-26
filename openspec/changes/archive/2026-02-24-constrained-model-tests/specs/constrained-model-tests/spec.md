## ADDED Requirements

### Requirement: Configurable OpenAiClient
The `OpenAiClient` SHALL accept an `OpenAiClientOptions` object with optional `model`, `temperature`, and `seed` parameters, while remaining backward-compatible with a plain API key string.

#### Scenario: Options-based construction
- **WHEN** `OpenAiClient` is constructed with `{ apiKey, model: "gpt-4o", temperature: 0, seed: 42 }`
- **THEN** API calls use the specified model, temperature, and seed

#### Scenario: Backward-compatible string construction
- **WHEN** `OpenAiClient` is constructed with a plain string API key
- **THEN** it uses the default model (`gpt-4o`) with no temperature or seed override

#### Scenario: Optional parameters omitted
- **WHEN** `OpenAiClient` is constructed with `{ apiKey }` only
- **THEN** temperature and seed are not sent in the API request

### Requirement: Prompt effectiveness tests
The test suite SHALL validate that the generator's prompt template reliably produces relevant prose from the LLM.

#### Scenario: Non-trivial prose generation
- **WHEN** a constrained model test sends a section prompt to the real LLM with temperature=0
- **THEN** the response is longer than 100 characters, is not raw JSON or an error message, and addresses the topic

#### Scenario: Content point coverage
- **WHEN** a constrained model test sends a prompt with multiple content points
- **THEN** the response references at least 75% of the specified content points

### Requirement: Basic capability tests
The test suite SHALL verify the model handles the range of inputs the application produces.

#### Scenario: Few content points
- **WHEN** a section prompt contains 2 content points
- **THEN** the model produces relevant prose of reasonable length

#### Scenario: Many content points
- **WHEN** a section prompt contains 8 content points
- **THEN** the model produces relevant prose mentioning at least half of them

### Requirement: Structured output compliance
The test suite SHALL validate that LLM output, when assembled into a chapter by `generateBook`, produces well-formed Leanpub markdown.

#### Scenario: Chapter markdown structure
- **WHEN** `generateBook` is called with a multi-section outline and a real LLM client (temperature=0)
- **THEN** the chapter content starts with a level-1 heading, contains level-2 section headings, each section has substantial prose, and backtick fences are balanced

### Requirement: End-to-end generation
The test suite SHALL exercise the full `generateBook` pipeline with a real LLM under controlled conditions.

#### Scenario: Complete chapter generation
- **WHEN** `generateBook` is called with a single-chapter outline containing one section
- **THEN** it returns one chapter with the correct title, chapter heading, section heading, and prose referencing the content points

### Requirement: Constrained model test npm script
The project SHALL provide a `test:constrained` npm script that runs only the constrained model tests.

#### Scenario: Script runs constrained tests only
- **WHEN** `npm run test:constrained` is executed
- **THEN** Vitest runs only tests in `tests/constrained/` and reports results
- **AND** `OPENAI_API_KEY` environment variable is required

### Requirement: Constrained model test workflow
The project SHALL provide a GitHub Actions workflow that runs constrained model tests on demand via `workflow_dispatch`.

#### Scenario: Manual workflow dispatch
- **WHEN** the workflow is triggered via `workflow_dispatch`
- **THEN** it installs dependencies, runs the constrained test suite with the `OPENAI_API_KEY` secret, and writes a job summary with test results

#### Scenario: Model selection input
- **WHEN** the workflow is triggered with a model input of `gpt-4o-mini`
- **THEN** the `CONSTRAINED_MODEL` environment variable is set to `gpt-4o-mini` and tests use that model

#### Scenario: Workflow is not triggered by PRs
- **WHEN** a pull request is opened or updated
- **THEN** the constrained model test workflow does NOT run (it is `workflow_dispatch` only)
