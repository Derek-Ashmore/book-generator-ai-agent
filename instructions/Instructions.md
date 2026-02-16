# Instructions Provided to Agents

> OpenSpec Initialize
- Initialize this project for the OpenSpec framework at https://github.com/Fission-AI/OpenSpec.
- The project is missing a openspec/project.md file.  Please populate the file based on information in the README.md along with a recommended technical stack. Please show me your thinking in notes/technical_stack_analysis.md.

> Initial proposal
- Create an OpenSpec change proposal to initialize the project for the tech stack listed in project.md and set up a pull request verification workflow.

> Testing modification and prep for multiple LLMs
- Please enhance the proposal to allow stubbing LLM interactions. As LLM interactions are non-deterministic, it's a requirement to have the ability to provide deterministic acceptance tests for the deterministic portions of the application.  Additionally, Additional LLMs will be added in the near future, so interfacing off LLMs has value.  Please incorporate automated acceptance tests using a stubbed LLM in the pull request check workflow.

- Please enhance the proposal to specify that the interface is CLI. Make the LLM choice, OpenAI or Stub argument driven. Please enhance the PR verification to capture code coverage if possible and put it on the workflow run summary.

> Do the first implementation
- Please approve OpenSpec change init-project-stack and implement all changes.  Please let me know if you have questions.