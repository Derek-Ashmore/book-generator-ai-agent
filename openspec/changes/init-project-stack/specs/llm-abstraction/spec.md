## ADDED Requirements

### Requirement: LlmClient interface
The project SHALL define an `LlmClient` interface in `src/llm/client.ts` with a `generateSection(prompt: string): Promise<string>` method that abstracts LLM text generation behind a provider-agnostic contract.

#### Scenario: Interface is importable
- **WHEN** a module imports from `./llm/client.js`
- **THEN** the `LlmClient` interface is available as a named export

### Requirement: OpenAI implementation
The project SHALL provide an `OpenAiClient` class in `src/llm/openai.ts` that implements `LlmClient` using the `openai` npm package.

#### Scenario: OpenAiClient implements LlmClient
- **WHEN** `OpenAiClient` is instantiated with an API key
- **THEN** it satisfies the `LlmClient` interface and delegates to the OpenAI chat completions API

### Requirement: Stub implementation for testing
The project SHALL provide a `StubLlmClient` class in `src/llm/stub.ts` that implements `LlmClient` and returns preconfigured deterministic responses without making network calls.

#### Scenario: StubLlmClient returns configured response
- **WHEN** `StubLlmClient` is constructed with a default response string
- **AND** `generateSection` is called with any prompt
- **THEN** it returns the configured default response

#### Scenario: StubLlmClient returns prompt-keyed responses
- **WHEN** `StubLlmClient` is constructed with a response map keyed by prompt substrings
- **AND** `generateSection` is called with a prompt matching a key
- **THEN** it returns the corresponding mapped response

### Requirement: Generator uses dependency injection
The `generator.ts` module SHALL accept an `LlmClient` instance as a parameter rather than importing or instantiating a concrete LLM client internally.

#### Scenario: Generator works with any LlmClient
- **WHEN** `generator.ts` is called with a `StubLlmClient`
- **THEN** it produces chapter content using the stub responses
- **AND** the output is deterministic across repeated runs

### Requirement: LLM barrel export
The project SHALL provide `src/llm/index.ts` that re-exports `LlmClient`, `OpenAiClient`, and `StubLlmClient` for convenient importing.

#### Scenario: Barrel export works
- **WHEN** a module imports from `./llm/index.js`
- **THEN** `LlmClient`, `OpenAiClient`, and `StubLlmClient` are available as named exports

### Requirement: Acceptance test with stubbed LLM
The project SHALL include acceptance tests in `tests/acceptance/` that exercise the full pipeline (parse outline → generate content → write manuscript) using `StubLlmClient`.

#### Scenario: Full pipeline produces expected output
- **WHEN** the acceptance test runs with a fixture `.mm` file and `StubLlmClient`
- **THEN** the output directory contains `manuscript/Book.txt` and chapter markdown files
- **AND** chapter files contain the stub-generated prose under the correct headings
- **AND** `Book.txt` lists chapter files in the correct order

#### Scenario: Acceptance tests are deterministic
- **WHEN** the acceptance test suite runs twice with identical inputs
- **THEN** the outputs are byte-identical

### Requirement: Acceptance test npm script
The project SHALL define a `test:accept` npm script that runs only the acceptance tests in `tests/acceptance/`.

#### Scenario: Acceptance script runs independently
- **WHEN** `npm run test:accept` is run
- **THEN** Vitest executes only tests in `tests/acceptance/` and reports results
- **AND** no API keys or network access are required
