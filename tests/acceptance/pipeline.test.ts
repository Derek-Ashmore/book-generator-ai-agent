import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFile, rm, readdir, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseOutline } from '../../src/parser.js';
import { generateBook } from '../../src/generator.js';
import { writeBook } from '../../src/writer.js';
import { StubLlmClient } from '../../src/llm/index.js';

describe('acceptance: full pipeline', () => {
  let tempDir: string;
  const fixtureDir = new URL('fixtures/', import.meta.url).pathname;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'book-gen-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('produces expected output from sample.mm', async () => {
    const xml = await readFile(join(fixtureDir, 'sample.mm'), 'utf-8');
    const outline = parseOutline(xml);
    const client = new StubLlmClient({
      defaultResponse: 'Generated prose content.',
    });
    const chapters = await generateBook(outline, client);
    await writeBook(tempDir, chapters);

    const manuscriptDir = join(tempDir, 'manuscript');
    const files = await readdir(manuscriptDir);

    expect(files).toContain('Book.txt');
    expect(files).toContain('chapter-01.md');
    expect(files).toContain('chapter-02.md');

    const bookTxt = await readFile(
      join(manuscriptDir, 'Book.txt'),
      'utf-8',
    );
    expect(bookTxt.trim()).toBe('chapter-01.md\nchapter-02.md');

    const ch1 = await readFile(
      join(manuscriptDir, 'chapter-01.md'),
      'utf-8',
    );
    expect(ch1).toContain('# Getting Started');
    expect(ch1).toContain('## Introduction');
    expect(ch1).toContain('## Setup');
    expect(ch1).toContain('Generated prose content.');

    const ch2 = await readFile(
      join(manuscriptDir, 'chapter-02.md'),
      'utf-8',
    );
    expect(ch2).toContain('# Core Concepts');
    expect(ch2).toContain('## Fundamentals');
    expect(ch2).toContain('## Advanced Topics');
    expect(ch2).toContain('Generated prose content.');
  });

  it('is deterministic across repeated runs', async () => {
    const xml = await readFile(join(fixtureDir, 'sample.mm'), 'utf-8');
    const client = new StubLlmClient({
      defaultResponse: 'Deterministic output.',
    });

    const outline1 = parseOutline(xml);
    const chapters1 = await generateBook(outline1, client);
    await writeBook(tempDir, chapters1);

    const bookTxt1 = await readFile(
      join(tempDir, 'manuscript', 'Book.txt'),
      'utf-8',
    );
    const ch1Run1 = await readFile(
      join(tempDir, 'manuscript', 'chapter-01.md'),
      'utf-8',
    );

    await rm(join(tempDir, 'manuscript'), { recursive: true, force: true });

    const outline2 = parseOutline(xml);
    const chapters2 = await generateBook(outline2, client);
    await writeBook(tempDir, chapters2);

    const bookTxt2 = await readFile(
      join(tempDir, 'manuscript', 'Book.txt'),
      'utf-8',
    );
    const ch1Run2 = await readFile(
      join(tempDir, 'manuscript', 'chapter-01.md'),
      'utf-8',
    );

    expect(bookTxt1).toBe(bookTxt2);
    expect(ch1Run1).toBe(ch1Run2);
  });
});
