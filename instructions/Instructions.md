# Instructions Provided to Agents

> OpenSpec Initialize
- Initialize this project for the OpenSpec framework at https://github.com/Fission-AI/OpenSpec.
- The project is missing a openspec/project.md file.  Please populate the file based on information in the README.md along with a recommended technical stack. Please show me your thinking in notes/technical_stack_analysis.md.

## Initial Implementation
### Proposal

> Initial proposal
- Create an OpenSpec change proposal to initialize the project for the tech stack listed in project.md and set up a pull request verification workflow.

> Testing modification and prep for multiple LLMs
- Please enhance the proposal to allow stubbing LLM interactions. As LLM interactions are non-deterministic, it's a requirement to have the ability to provide deterministic acceptance tests for the deterministic portions of the application.  Additionally, Additional LLMs will be added in the near future, so interfacing off LLMs has value.  Please incorporate automated acceptance tests using a stubbed LLM in the pull request check workflow.

- Please enhance the proposal to specify that the interface is CLI. Make the LLM choice, OpenAI or Stub argument driven. Please enhance the PR verification to capture code coverage if possible and put it on the workflow run summary.

### Acceptance and implementation
> Do the first implementation
- Please approve OpenSpec change init-project-stack and implement all changes.  Please let me know if you have questions.

> Testing enhancements
- The PR verification workflow isn't noting the coverage statistics on the Summary of the run as it should.
- Add acceptance test output with detail about what is checked to the summary of the PR verification run.  For example, for the test titled "produces expected output from sample.mm", I would like line items for the items checked within that test, such as the generated book files (e.g. Book.txt and the individual markdown chapters) are present and that content checks on each markdown chapters were made.
- There's a pull request on this git branch. You have the authority to make PR verification workflow changes and push to test the changs you're making. Please let me know if you don't have the ability to test your workflow changes.

> Add User Documentation
- Enhance the main project README.md so that it contains a summary of what the application does and how a user would use the application CLI. Provide information on what arguments are supported and examples of usage.

> OpenSpec approval
- Approve and archive OpenSpec change init-project-stack. This change is still listed as proposed even though it has now been implemented.

## Automated Testing Implementation

### Base — Deterministic Unit Tests

> Investigation
- A testing pyramid is described in file instructions/Testing-Pyramid.md. Are there tests listed in the Base — Deterministic Unit Tests section of the pyramid that workflow pr-verify.yml isn't executing? Please notate these items in file notes/base_testing_notes.md.

- Create an OpenSpec change proposal to modify workflow base-deterministic-unit-tests.yml to include all base testing gaps you identified in file notes/base_testing_notes.md.

> Proposal implementation
- Please approve OpenSpec change base-unit-test-coverage and implement all changes. You have the GitHub CLI available with privileges to commit and test execute the workflow being modified. Please make sure the workflow executes correctly before finishing work. Please let me know if you have questions.

- Please modify workflow base-deterministic-unit-tests.yml so that it also executes for pull requests against the main branch. Please archive OpenSpec change base-unit-test-coverage and prepare a pull request for this change.
