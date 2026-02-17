import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFile, rm, readdir, mkdtemp } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseOutline } from '../../src/parser.js';
import { generateBook } from '../../src/generator.js';
import { writeBook } from '../../src/writer.js';
import { StubLlmClient } from '../../src/llm/index.js';

describe('acceptance: full pipeline', () => {
  const fixtureDir = new URL('fixtures/', import.meta.url).pathname;

  describe('produces expected output from sample.mm', () => {
    let tempDir: string;
    let files: string[];
    let bookTxt: string;
    let ch1: string;
    let ch2: string;

    beforeAll(async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'book-gen-'));
      const xml = await readFile(join(fixtureDir, 'sample.mm'), 'utf-8');
      const outline = parseOutline(xml);
      const client = new StubLlmClient({
        defaultResponse: 'Generated prose content.',
      });
      const chapters = await generateBook(outline, client);
      await writeBook(tempDir, chapters);

      const manuscriptDir = join(tempDir, 'manuscript');
      files = await readdir(manuscriptDir);
      bookTxt = await readFile(join(manuscriptDir, 'Book.txt'), 'utf-8');
      ch1 = await readFile(join(manuscriptDir, 'chapter-01.md'), 'utf-8');
      ch2 = await readFile(join(manuscriptDir, 'chapter-02.md'), 'utf-8');
    });

    afterAll(async () => {
      if (tempDir) {
        await rm(tempDir, { recursive: true, force: true });
      }
    });

    describe('generated book files are present', () => {
      it('Book.txt manifest exists', () => {
        expect(files).toContain('Book.txt');
      });

      it('chapter-01.md exists', () => {
        expect(files).toContain('chapter-01.md');
      });

      it('chapter-02.md exists', () => {
        expect(files).toContain('chapter-02.md');
      });
    });

    describe('Book.txt manifest content', () => {
      it('lists chapters in order', () => {
        expect(bookTxt.trim()).toBe('chapter-01.md\nchapter-02.md');
      });
    });

    describe('chapter-01.md content checks', () => {
      it('contains chapter heading "Getting Started"', () => {
        expect(ch1).toContain('# Getting Started');
      });

      it('contains section "Introduction"', () => {
        expect(ch1).toContain('## Introduction');
      });

      it('contains section "Setup"', () => {
        expect(ch1).toContain('## Setup');
      });

      it('contains generated prose content', () => {
        expect(ch1).toContain('Generated prose content.');
      });
    });

    describe('chapter-02.md content checks', () => {
      it('contains chapter heading "Core Concepts"', () => {
        expect(ch2).toContain('# Core Concepts');
      });

      it('contains section "Fundamentals"', () => {
        expect(ch2).toContain('## Fundamentals');
      });

      it('contains section "Advanced Topics"', () => {
        expect(ch2).toContain('## Advanced Topics');
      });

      it('contains generated prose content', () => {
        expect(ch2).toContain('Generated prose content.');
      });
    });
  });

  describe('is deterministic across repeated runs', () => {
    let tempDir: string;
    let bookTxt1: string;
    let ch1Run1: string;
    let bookTxt2: string;
    let ch1Run2: string;

    beforeAll(async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'book-gen-'));
      const xml = await readFile(join(fixtureDir, 'sample.mm'), 'utf-8');
      const client = new StubLlmClient({
        defaultResponse: 'Deterministic output.',
      });

      const outline1 = parseOutline(xml);
      const chapters1 = await generateBook(outline1, client);
      await writeBook(tempDir, chapters1);

      bookTxt1 = await readFile(
        join(tempDir, 'manuscript', 'Book.txt'),
        'utf-8',
      );
      ch1Run1 = await readFile(
        join(tempDir, 'manuscript', 'chapter-01.md'),
        'utf-8',
      );

      await rm(join(tempDir, 'manuscript'), { recursive: true, force: true });

      const outline2 = parseOutline(xml);
      const chapters2 = await generateBook(outline2, client);
      await writeBook(tempDir, chapters2);

      bookTxt2 = await readFile(
        join(tempDir, 'manuscript', 'Book.txt'),
        'utf-8',
      );
      ch1Run2 = await readFile(
        join(tempDir, 'manuscript', 'chapter-01.md'),
        'utf-8',
      );
    });

    afterAll(async () => {
      if (tempDir) {
        await rm(tempDir, { recursive: true, force: true });
      }
    });

    it('Book.txt is identical across runs', () => {
      expect(bookTxt1).toBe(bookTxt2);
    });

    it('chapter-01.md is identical across runs', () => {
      expect(ch1Run1).toBe(ch1Run2);
    });
  });
});
