# Project: Book Generator AI Agent

## Overview

An AI-powered CLI tool that generates complete books from FreeMind mind map outlines. The agent parses a structured outline (.mm file), sends section content points to an LLM for prose generation, and outputs a book in Leanpub markdown format.

## Goals

- Accept a FreeMind (.mm) outline file as input and produce a complete book manuscript
- Generate high-quality prose for each section using LLM APIs
- Output in Leanpub markdown format ready for publishing
- Provide a simple CLI interface requiring minimal configuration

## Technical Stack

| Component | Technology | Purpose |
|---|---|---|
| Language | TypeScript 5.x | Type-safe development, structured data modeling |
| Runtime | Node.js 20+ (LTS) | Async I/O, npm ecosystem |
| XML Parsing | fast-xml-parser | Parse FreeMind .mm files |
| LLM Client | openai (npm) | Text generation via OpenAI API |
| CLI Framework | Commander.js | Command-line argument parsing |
| Concurrency | p-limit | Rate-limited parallel LLM calls |
| Configuration | dotenv | API key management via .env files |
| Build | tsup | TypeScript bundling for production |
| Dev Runner | tsx | Run TypeScript directly during development |
| Testing | Vitest | Unit and integration testing |
| Linting | ESLint + Prettier | Code quality and formatting |

## Input Specification

### FreeMind Outline (.mm file)

- **Level 2 nodes** — Chapter titles (order determines chapter sequence)
- **Level 3 nodes** — Section headers within chapters
- **Level 4 nodes** — Content points used to guide LLM text generation

### CLI Arguments

| Argument | Description |
|---|---|
| `--outline` / `-o` | Path to the FreeMind .mm outline file |
| `--dest` / `-d` | Destination folder for book output |
| `--llm` / `-l` | LLM provider to use: `openai` (default) or `stub` |
| `--api-key` | OpenAI API key (or set via `OPENAI_API_KEY` env var; required when `--llm openai`) |

## Output Specification

### Directory Structure

```
<destination>/
  manuscript/
    Book.txt            # Manifest listing chapter files in order
    chapter-01.md       # One markdown file per chapter
    chapter-02.md
    ...
```

### Book.txt Format

Plain text file with one chapter filename per line, in outline order. Base filenames only (no paths).

```
chapter-01.md
chapter-02.md
chapter-03.md
```

### Chapter File Format (Leanpub Markdown)

```markdown
# Chapter Title

## Section Header

Generated prose based on outline points...

## Next Section Header

More generated prose...
```

- Chapter title as H1 heading
- Section headers as H2 headings
- LLM-generated prose placed under each section heading

## Architecture

```
src/
  index.ts              # CLI entry point
  parser.ts             # FreeMind .mm file parser
  generator.ts          # LLM-based text generation
  writer.ts             # Markdown file and manifest output
  types.ts              # Shared type definitions
```

### Data Flow

```
.mm file → parser → Outline model → generator (LLM) → Chapter content → writer → manuscript/
```

### Core Data Model

```typescript
interface Outline {
  title: string;
  chapters: Chapter[];
}

interface Chapter {
  title: string;
  sections: Section[];
}

interface Section {
  header: string;
  points: string[];
}
```

## Constraints

- FreeMind .mm files are XML-based; parser must handle the `<node TEXT="...">` structure
- LLM calls should be parallelized per section with rate limiting to avoid API throttling
- Output must conform to Leanpub markdown format (see https://leanpub.com/read/lfm)
- API keys must never be hardcoded; use environment variables or CLI flags

## Non-Goals (v1)

- GUI or web interface
- Support for outline formats other than FreeMind
- LLM providers other than OpenAI (extensibility is designed in but not implemented)
- Book cover generation or image handling
- Real-time editing or preview
