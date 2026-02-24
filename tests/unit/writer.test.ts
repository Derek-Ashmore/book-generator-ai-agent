import { describe, it, expect, afterEach } from 'vitest';
import { writeBook } from '../../src/writer.js';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { GeneratedChapter } from '../../src/generator.js';

describe('writeBook', () => {
  let testDir: string;

  afterEach(async () => {
    if (testDir) {
      await rm(testDir, { recursive: true, force: true });
    }
  });

  async function setup(): Promise<string> {
    testDir = await mkdtemp(join(tmpdir(), 'writer-test-'));
    return testDir;
  }

  it('creates the manuscript directory', async () => {
    const dest = await setup();
    const chapters: GeneratedChapter[] = [
      { title: 'Chapter One', content: 'Hello world' },
    ];

    await writeBook(dest, chapters);

    const entries = await readdir(dest);
    expect(entries).toContain('manuscript');
  });

  it('names chapter files with zero-padded numbers', async () => {
    const dest = await setup();
    const chapters: GeneratedChapter[] = Array.from({ length: 10 }, (_, i) => ({
      title: `Chapter ${i + 1}`,
      content: `Content for chapter ${i + 1}`,
    }));

    await writeBook(dest, chapters);

    const manuscriptDir = join(dest, 'manuscript');
    const files = await readdir(manuscriptDir);

    for (let i = 1; i <= 10; i++) {
      const expected = `chapter-${String(i).padStart(2, '0')}.md`;
      expect(files).toContain(expected);
    }
  });

  it('writes Book.txt manifest with all filenames in order and trailing newline', async () => {
    const dest = await setup();
    const chapters: GeneratedChapter[] = [
      { title: 'First', content: 'Content A' },
      { title: 'Second', content: 'Content B' },
      { title: 'Third', content: 'Content C' },
    ];

    await writeBook(dest, chapters);

    const manifest = await readFile(
      join(dest, 'manuscript', 'Book.txt'),
      'utf-8',
    );

    expect(manifest).toBe(
      'chapter-01.md\nchapter-02.md\nchapter-03.md\n',
    );
  });

  it('writes the exact content from each GeneratedChapter into the corresponding file', async () => {
    const dest = await setup();
    const chapters: GeneratedChapter[] = [
      { title: 'Alpha', content: '# Alpha\n\nFirst chapter content.' },
      { title: 'Beta', content: '# Beta\n\nSecond chapter content with special chars: <>&"' },
    ];

    await writeBook(dest, chapters);

    const manuscriptDir = join(dest, 'manuscript');

    const content1 = await readFile(join(manuscriptDir, 'chapter-01.md'), 'utf-8');
    expect(content1).toBe(chapters[0].content);

    const content2 = await readFile(join(manuscriptDir, 'chapter-02.md'), 'utf-8');
    expect(content2).toBe(chapters[1].content);
  });

  it('handles zero chapters by creating manuscript dir and Book.txt with just a newline', async () => {
    const dest = await setup();
    const chapters: GeneratedChapter[] = [];

    await writeBook(dest, chapters);

    const manuscriptDir = join(dest, 'manuscript');
    const entries = await readdir(manuscriptDir);

    expect(entries).toContain('Book.txt');
    expect(entries).toHaveLength(1);

    const manifest = await readFile(join(manuscriptDir, 'Book.txt'), 'utf-8');
    expect(manifest).toBe('\n');
  });

  it('handles 12 chapters with correct zero-padding', async () => {
    const dest = await setup();
    const chapters: GeneratedChapter[] = Array.from({ length: 12 }, (_, i) => ({
      title: `Chapter ${i + 1}`,
      content: `Content of chapter ${i + 1}`,
    }));

    await writeBook(dest, chapters);

    const manuscriptDir = join(dest, 'manuscript');
    const files = (await readdir(manuscriptDir)).filter((f) => f.endsWith('.md'));

    expect(files).toHaveLength(12);

    const expectedFiles = Array.from({ length: 12 }, (_, i) =>
      `chapter-${String(i + 1).padStart(2, '0')}.md`,
    );

    for (const expected of expectedFiles) {
      expect(files).toContain(expected);
    }

    // Verify manifest lists all 12 in order
    const manifest = await readFile(join(manuscriptDir, 'Book.txt'), 'utf-8');
    expect(manifest).toBe(expectedFiles.join('\n') + '\n');

    // Verify content of a couple of chapters
    const content1 = await readFile(join(manuscriptDir, 'chapter-01.md'), 'utf-8');
    expect(content1).toBe('Content of chapter 1');

    const content12 = await readFile(join(manuscriptDir, 'chapter-12.md'), 'utf-8');
    expect(content12).toBe('Content of chapter 12');
  });
});
