## ADDED Requirements

### Requirement: PR verification workflow file
The project SHALL have a GitHub Actions workflow at `.github/workflows/pr-verify.yml` that triggers on `pull_request` events targeting the `main` branch.

#### Scenario: Workflow triggers on PR to main
- **WHEN** a pull request is opened or updated against `main`
- **THEN** the PR verification workflow runs

### Requirement: Type check job
The PR verification workflow SHALL include a job that runs `npm run typecheck` using Node.js 20.

#### Scenario: Type errors fail the workflow
- **WHEN** the typecheck job runs and TypeScript reports errors
- **THEN** the job fails and the PR check is marked as failed

#### Scenario: Clean types pass the workflow
- **WHEN** the typecheck job runs and TypeScript reports no errors
- **THEN** the job succeeds

### Requirement: Lint job
The PR verification workflow SHALL include a job that runs `npm run lint` using Node.js 20.

#### Scenario: Lint errors fail the workflow
- **WHEN** the lint job runs and ESLint reports errors
- **THEN** the job fails and the PR check is marked as failed

#### Scenario: Clean lint passes the workflow
- **WHEN** the lint job runs and ESLint reports no errors
- **THEN** the job succeeds

### Requirement: Test job
The PR verification workflow SHALL include a job that runs `npm test` using Node.js 20.

#### Scenario: Test failures fail the workflow
- **WHEN** the test job runs and Vitest reports failures
- **THEN** the job fails and the PR check is marked as failed

#### Scenario: All tests pass the workflow
- **WHEN** the test job runs and all tests pass
- **THEN** the job succeeds

### Requirement: Parallel job execution
The typecheck, lint, test, and acceptance jobs SHALL run in parallel (no dependencies between them) for faster feedback.

#### Scenario: Jobs run concurrently
- **WHEN** the workflow is triggered
- **THEN** the typecheck, lint, test, and acceptance jobs start simultaneously without waiting for each other

### Requirement: Acceptance test job
The PR verification workflow SHALL include a job that runs `npm run test:accept` using Node.js 20. This job exercises the full pipeline with a stubbed LLM and requires no API keys or network access.

#### Scenario: Acceptance test failures fail the workflow
- **WHEN** the acceptance test job runs and any acceptance test fails
- **THEN** the job fails and the PR check is marked as failed

#### Scenario: Acceptance tests pass the workflow
- **WHEN** the acceptance test job runs and all acceptance tests pass
- **THEN** the job succeeds

### Requirement: No API keys required in CI
The PR verification workflow SHALL NOT require any LLM API keys or secrets. All test jobs (unit and acceptance) SHALL pass using only stubbed/mocked dependencies.

#### Scenario: Workflow runs without secrets
- **WHEN** the workflow runs in a fresh CI environment with no configured secrets
- **THEN** all jobs (typecheck, lint, test, acceptance) complete successfully

### Requirement: npm dependency caching
Each job in the workflow SHALL cache npm dependencies to speed up repeated runs.

#### Scenario: Cache is used on repeat runs
- **WHEN** the workflow runs and dependencies have not changed
- **THEN** npm dependencies are restored from cache instead of re-downloaded
