import { describe, it, expect } from 'vitest';
import { parseOutline } from '../../src/parser.js';
import { generateBook } from '../../src/generator.js';
import { StubLlmClient } from '../../src/llm/index.js';
import type { Outline } from '../../src/types.js';

const TEST_XML = `<?xml version="1.0" encoding="UTF-8"?>
<map version="1.0.1">
  <node TEXT="My Test Book">
    <node TEXT="Chapter One">
      <node TEXT="Section A">
        <node TEXT="Point A1"/>
        <node TEXT="Point A2"/>
      </node>
      <node TEXT="Section B">
        <node TEXT="Point B1"/>
      </node>
    </node>
    <node TEXT="Chapter Two">
      <node TEXT="Section C">
        <node TEXT="Point C1"/>
        <node TEXT="Point C2"/>
        <node TEXT="Point C3"/>
      </node>
    </node>
    <node TEXT="Chapter Three">
      <node TEXT="Section D">
        <node TEXT="Point D1"/>
      </node>
      <node TEXT="Section E">
        <node TEXT="Point E1"/>
        <node TEXT="Point E2"/>
      </node>
    </node>
  </node>
</map>`;

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

describe('State integrity through the pipeline', () => {
  it('outline model is not mutated by generateBook', async () => {
    const outline = parseOutline(TEST_XML);
    const originalSnapshot = deepClone(outline);

    const client = new StubLlmClient();
    await generateBook(outline, client);

    expect(outline).toEqual(originalSnapshot);
  });

  it('chapter ordering is preserved from outline to generated output', async () => {
    const outline = parseOutline(TEST_XML);
    const client = new StubLlmClient();

    const chapters = await generateBook(outline, client);

    expect(chapters).toHaveLength(outline.chapters.length);
    expect(chapters).toHaveLength(3);

    for (let i = 0; i < outline.chapters.length; i++) {
      expect(chapters[i].title).toBe(outline.chapters[i].title);
    }

    expect(chapters.map((c) => c.title)).toEqual([
      'Chapter One',
      'Chapter Two',
      'Chapter Three',
    ]);
  });

  it('section ordering within chapters is preserved in generated content', async () => {
    const outline = parseOutline(TEST_XML);
    const client = new StubLlmClient();

    const chapters = await generateBook(outline, client);

    // Chapter One has sections A and B - verify they appear in order
    const chapterOneContent = chapters[0].content;
    const sectionAIndex = chapterOneContent.indexOf('## Section A');
    const sectionBIndex = chapterOneContent.indexOf('## Section B');
    expect(sectionAIndex).toBeGreaterThan(-1);
    expect(sectionBIndex).toBeGreaterThan(-1);
    expect(sectionAIndex).toBeLessThan(sectionBIndex);

    // Chapter Three has sections D and E - verify they appear in order
    const chapterThreeContent = chapters[2].content;
    const sectionDIndex = chapterThreeContent.indexOf('## Section D');
    const sectionEIndex = chapterThreeContent.indexOf('## Section E');
    expect(sectionDIndex).toBeGreaterThan(-1);
    expect(sectionEIndex).toBeGreaterThan(-1);
    expect(sectionDIndex).toBeLessThan(sectionEIndex);
  });
});
