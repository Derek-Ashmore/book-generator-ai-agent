# Book Generator AI Agent

A CLI tool that generates complete books in [Leanpub](https://leanpub.com/read/lfm) markdown format from FreeMind mind map outlines, using an LLM to produce prose for each section.

## How It Works

1. You create a book outline as a FreeMind `.mm` mind map file.
2. The tool parses the outline, extracting chapters, sections, and talking points.
3. An LLM generates prose for each section based on the talking points.
4. The output is written as Leanpub-compatible markdown to a destination folder.

## Outline Format

The FreeMind `.mm` file uses a hierarchical node structure:

| Level | Purpose | Example |
|-------|---------|---------|
| Root node | Book title | "My Book" |
| 2nd level | Chapter titles (in order) | "Getting Started" |
| 3rd level | Section headings within a chapter | "Introduction" |
| 4th level | Talking points used to generate prose | "What this book covers" |

Example `.mm` file:

```xml
<map version="1.0.1">
  <node TEXT="My Book">
    <node TEXT="Getting Started">
      <node TEXT="Introduction">
        <node TEXT="What this book covers"/>
        <node TEXT="Who should read this"/>
      </node>
      <node TEXT="Setup">
        <node TEXT="Installing prerequisites"/>
        <node TEXT="Configuration steps"/>
      </node>
    </node>
    <node TEXT="Advanced Topics">
      <node TEXT="Performance">
        <node TEXT="Caching strategies"/>
      </node>
    </node>
  </node>
</map>
```

## Output Structure

The tool writes all output into a `manuscript/` subdirectory of the destination folder:

```
<dest>/
  manuscript/
    Book.txt          # Chapter manifest listing files in order
    chapter-01.md     # First chapter
    chapter-02.md     # Second chapter
    ...
```

Each chapter markdown file contains an H1 heading with the chapter title, H2 headings for each section, and LLM-generated prose under each section.

## Installation

```bash
npm install
npm run build
```

## CLI Usage

```
book-generator -o <outline> -d <dest> [options]
```

### Required Arguments

| Argument | Description |
|----------|-------------|
| `-o, --outline <path>` | Path to a FreeMind `.mm` outline file |
| `-d, --dest <path>` | Destination folder for book output |

### Optional Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `-l, --llm <provider>` | LLM provider: `openai` or `stub` | `openai` |
| `--api-key <key>` | OpenAI API key (can also be set via `OPENAI_API_KEY` env var) | &mdash; |

### API Key Configuration

The OpenAI API key can be provided in three ways (in order of precedence):

1. `--api-key` command-line flag
2. `OPENAI_API_KEY` environment variable
3. `.env` file in the project root containing `OPENAI_API_KEY=sk-...`

The `stub` provider does not require an API key and returns placeholder text, which is useful for testing.

## Examples

Generate a book using OpenAI:

```bash
book-generator -o outline.mm -d ./output --api-key sk-your-key
```

Generate a book with the API key set via environment variable:

```bash
export OPENAI_API_KEY=sk-your-key
book-generator -o outline.mm -d ./output
```

Use the stub provider for testing without an API key:

```bash
book-generator -o outline.mm -d ./output --llm stub
```

Run directly during development (without building):

```bash
npx tsx src/index.ts -o outline.mm -d ./output --llm stub
```
