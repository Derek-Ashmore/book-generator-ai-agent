# Technical Stack Analysis

## Project Understanding

The Book Generator AI Agent takes a FreeMind (.mm) outline file and produces a complete book in Leanpub markdown format. The core workflow is:

1. **Parse** a FreeMind mind map XML file (.mm format)
2. **Extract** chapter titles (level 2), section headers (level 3), and content points (level 4)
3. **Generate** prose for each section using an LLM, guided by the outline points
4. **Output** individual chapter markdown files + a `Book.txt` manifest into a `manuscript/` folder

## Key Technical Requirements

| Requirement | Detail |
|---|---|
| FreeMind parsing | .mm files are XML-based; need reliable XML parsing |
| LLM integration | OpenAI is mentioned explicitly; should support multiple providers |
| File I/O | Read outline, write multiple markdown files and manifest |
| CLI interface | User supplies outline path, destination folder, and API keys |
| Markdown generation | Leanpub-flavored markdown (headings, formatting) |

## Language Decision: TypeScript (Node.js)

**Why TypeScript over Python:**
- The project already uses `claude-flow` (Node.js ecosystem)
- Strong typing helps with the structured outline data model (chapters > sections > points)
- Excellent async support for parallel LLM calls across sections
- npm ecosystem has mature XML parsing and CLI libraries

**Why not Python:**
- Would introduce a second runtime alongside the existing Node.js tooling
- No significant advantage for this use case (not ML-heavy, not data science)

## Recommended Stack

### Core Runtime
- **TypeScript 5.x** with **Node.js 20+** (LTS)
- **tsx** for development (run TS directly without build step during dev)
- **tsup** for production builds (fast, zero-config bundler)

### XML/FreeMind Parsing
- **fast-xml-parser** — fastest pure-JS XML parser, no native dependencies, handles .mm files well since FreeMind uses straightforward XML with `<node>` elements and `TEXT` attributes

### LLM Integration
- **OpenAI SDK** (`openai`) — primary provider, explicitly mentioned in README
- **LiteLLM-compatible abstraction** or a thin adapter layer so users could swap in Anthropic, local models, etc. later. For v1, just OpenAI is sufficient.

### CLI Framework
- **Commander.js** — mature, well-documented, handles subcommands, options, and help text. Lightweight alternative: `meow` or `yargs`, but Commander is the standard.

### File Operations
- **Node.js `fs/promises`** — built-in, async, no extra dependency needed
- **`path`** module for cross-platform path handling

### Testing
- **Vitest** — fast, TypeScript-native, Jest-compatible API, works with the existing Node.js ecosystem. Preferred over Jest for TS projects due to zero-config TS support.

### Code Quality
- **ESLint** with TypeScript plugin
- **Prettier** for formatting

### Configuration
- **dotenv** for API key management via `.env` files
- CLI flags as override (API keys via `--api-key` flag or `OPENAI_API_KEY` env var)

## Architecture Considerations

### Parallel Section Generation
Sections within a chapter are independent—they can be sent to the LLM in parallel. Use `Promise.all` with a concurrency limiter (e.g., `p-limit`) to avoid rate limits while maximizing throughput.

### Structured Data Model
```
Outline
  └── Chapter[]
        ├── title: string
        └── Section[]
              ├── header: string
              └── points: string[]
```

This maps directly to the FreeMind hierarchy: root > level 2 (chapters) > level 3 (sections) > level 4 (points).

### Output Structure
```
<destination>/
  manuscript/
    Book.txt          # Chapter file manifest
    chapter-01.md     # One file per chapter
    chapter-02.md
    ...
```

### Error Handling
- Validate outline structure before LLM calls (fail fast on malformed .mm files)
- Retry logic for LLM API calls (transient failures)
- Progress reporting to stdout (chapter X of Y, section X of Y)

## Alternatives Considered

| Choice | Alternative | Why Not |
|---|---|---|
| TypeScript | Python | Second runtime; no advantage here |
| fast-xml-parser | xml2js | xml2js is slower and callback-based |
| Commander.js | yargs | Commander is simpler for this use case |
| Vitest | Jest | Jest needs extra config for TypeScript |
| tsup | esbuild directly | tsup wraps esbuild with better DX |
| dotenv | node --env-file | node flag is newer, less portable |

## Summary

The stack is deliberately minimal—five production dependencies (fast-xml-parser, openai, commander, dotenv, p-limit) plus TypeScript tooling. This keeps the project lightweight and maintainable while covering all functional requirements.
