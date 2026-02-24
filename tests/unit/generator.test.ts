import { describe, it, expect, vi } from 'vitest';
import { generateBook } from '../../src/generator.js';
import type { LlmClient } from '../../src/llm/client.js';
import type { Outline } from '../../src/types.js';

function createMockLlmClient(
  impl?: (prompt: string) => Promise<string>,
): LlmClient {
  return {
    generateSection: vi.fn(impl ?? (async () => 'Generated prose.')),
  };
}

function createOutline(overrides?: Partial<Outline>): Outline {
  return {
    title: 'Test Book',
    chapters: [],
    ...overrides,
  };
}

describe('generateBook', () => {
  // ---------------------------------------------------------------
  // 1. Sequential chapter processing
  // ---------------------------------------------------------------
  it('returns one GeneratedChapter per outline chapter with correct titles', async () => {
    const outline = createOutline({
      chapters: [
        {
          title: 'Chapter One',
          sections: [{ header: 'Intro', points: ['point A'] }],
        },
        {
          title: 'Chapter Two',
          sections: [{ header: 'Overview', points: ['point B'] }],
        },
      ],
    });

    const client = createMockLlmClient();
    const result = await generateBook(outline, client);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Chapter One');
    expect(result[1].title).toBe('Chapter Two');
  });

  // ---------------------------------------------------------------
  // 2. Correct call ordering — one call per section, in order
  // ---------------------------------------------------------------
  it('calls generateSection once per section in order', async () => {
    const outline = createOutline({
      chapters: [
        {
          title: 'Ch1',
          sections: [
            { header: 'S1', points: ['a'] },
            { header: 'S2', points: ['b'] },
          ],
        },
        {
          title: 'Ch2',
          sections: [{ header: 'S3', points: ['c'] }],
        },
      ],
    });

    const client = createMockLlmClient();
    await generateBook(outline, client);

    const calls = (client.generateSection as ReturnType<typeof vi.fn>).mock
      .calls;

    expect(calls).toHaveLength(3);
    // Verify ordering by checking that each prompt contains the expected header
    expect(calls[0][0]).toContain('S1');
    expect(calls[1][0]).toContain('S2');
    expect(calls[2][0]).toContain('S3');
  });

  // ---------------------------------------------------------------
  // 3. Prompt construction
  // ---------------------------------------------------------------
  it('builds the prompt with the section header and comma-joined points', async () => {
    const outline = createOutline({
      chapters: [
        {
          title: 'Ch',
          sections: [
            { header: 'My Section', points: ['alpha', 'beta', 'gamma'] },
          ],
        },
      ],
    });

    const client = createMockLlmClient();
    await generateBook(outline, client);

    const prompt = (client.generateSection as ReturnType<typeof vi.fn>).mock
      .calls[0][0] as string;

    expect(prompt).toContain('"My Section"');
    expect(prompt).toContain('alpha, beta, gamma');
  });

  // ---------------------------------------------------------------
  // 4. Zero chapters
  // ---------------------------------------------------------------
  it('returns an empty array and never calls generateSection when there are no chapters', async () => {
    const outline = createOutline({ chapters: [] });
    const client = createMockLlmClient();

    const result = await generateBook(outline, client);

    expect(result).toEqual([]);
    expect(client.generateSection).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------
  // 5. Content format
  // ---------------------------------------------------------------
  it('formats chapter content with markdown heading, section heading, and LLM prose', async () => {
    const outline = createOutline({
      chapters: [
        {
          title: 'Deep Dive',
          sections: [
            { header: 'Background', points: ['history'] },
            { header: 'Details', points: ['specifics'] },
          ],
        },
      ],
    });

    let callIndex = 0;
    const responses = ['First section prose.', 'Second section prose.'];
    const client = createMockLlmClient(async () => responses[callIndex++]);

    const [chapter] = await generateBook(outline, client);

    // Starts with the chapter-level heading
    expect(chapter.content).toMatch(/^# Deep Dive\n/);
    // Contains section headings
    expect(chapter.content).toContain('## Background');
    expect(chapter.content).toContain('## Details');
    // Contains LLM responses
    expect(chapter.content).toContain('First section prose.');
    expect(chapter.content).toContain('Second section prose.');
  });

  // ---------------------------------------------------------------
  // 6. Error — LLM throws mid-generation
  // ---------------------------------------------------------------
  it('rejects when the LLM client throws on a subsequent call', async () => {
    const outline = createOutline({
      chapters: [
        {
          title: 'Ch1',
          sections: [
            { header: 'S1', points: ['a'] },
            { header: 'S2', points: ['b'] },
          ],
        },
      ],
    });

    let callCount = 0;
    const client = createMockLlmClient(async () => {
      callCount++;
      if (callCount === 2) {
        throw new Error('LLM service unavailable');
      }
      return 'ok';
    });

    await expect(generateBook(outline, client)).rejects.toThrow(
      'LLM service unavailable',
    );
  });

  // ---------------------------------------------------------------
  // 7. Error — LLM returns empty string
  // ---------------------------------------------------------------
  it('produces valid output even when the LLM returns empty strings', async () => {
    const outline = createOutline({
      chapters: [
        {
          title: 'Sparse Chapter',
          sections: [{ header: 'Empty', points: ['nothing'] }],
        },
      ],
    });

    const client = createMockLlmClient(async () => '');
    const [chapter] = await generateBook(outline, client);

    expect(chapter.title).toBe('Sparse Chapter');
    expect(chapter.content).toContain('# Sparse Chapter');
    expect(chapter.content).toContain('## Empty');
    // The content should still be structurally valid even with empty prose
    expect(typeof chapter.content).toBe('string');
    expect(chapter.content.length).toBeGreaterThan(0);
  });
});
