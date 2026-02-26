import { describe, it, expect, beforeAll } from 'vitest';
import { OpenAiClient } from '../../src/llm/openai.js';
import { generateBook } from '../../src/generator.js';
import type { Outline } from '../../src/types.js';

/**
 * Lower-Middle — Constrained Model Tests
 *
 * Real model calls with temperature=0 and fixed seed to minimize randomness.
 * These tests validate prompt effectiveness, basic capability, output quality,
 * and end-to-end generation under controlled conditions.
 *
 * Requires OPENAI_API_KEY environment variable.
 */

const CONSTRAINED_MODEL = process.env.CONSTRAINED_MODEL ?? 'gpt-4o-mini';
const CONSTRAINED_SEED = 42;

let client: OpenAiClient;

beforeAll(() => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is required for constrained model tests',
    );
  }

  client = new OpenAiClient({
    apiKey,
    model: CONSTRAINED_MODEL,
    temperature: 0,
    seed: CONSTRAINED_SEED,
  });
});

// ---------------------------------------------------------------
// 1. Prompt effectiveness
// ---------------------------------------------------------------
describe('prompt effectiveness', () => {
  it('generates non-trivial prose for a section prompt', async () => {
    const prompt =
      'Write a section titled "The Water Cycle" covering: evaporation, condensation, precipitation';
    const result = await client.generateSection(prompt);

    // Response should be non-trivial prose
    expect(result.length).toBeGreaterThan(100);

    // Should not be raw JSON or an error message
    expect(result).not.toMatch(/^\s*[{[]/);
    expect(result).not.toMatch(/error/i);

    // Should address the topic
    expect(result.toLowerCase()).toContain('water');
  }, 30_000);

  it('references content points from the prompt', async () => {
    const prompt =
      'Write a section titled "Photosynthesis" covering: chlorophyll, sunlight, carbon dioxide, glucose';
    const result = await client.generateSection(prompt);

    // Should touch on the content points (at least most of them)
    const keywords = ['chlorophyll', 'sunlight', 'carbon dioxide', 'glucose'];
    const mentionedCount = keywords.filter((kw) =>
      result.toLowerCase().includes(kw.toLowerCase()),
    ).length;

    expect(mentionedCount).toBeGreaterThanOrEqual(3);
  }, 30_000);
});

// ---------------------------------------------------------------
// 2. Basic capability
// ---------------------------------------------------------------
describe('basic capability', () => {
  it('handles a section with few content points', async () => {
    const prompt =
      'Write a section titled "Gravity" covering: Newton, falling objects';
    const result = await client.generateSection(prompt);

    expect(result.length).toBeGreaterThan(50);
    expect(result.toLowerCase()).toMatch(/newton|gravity|fall/);
  }, 30_000);

  it('handles a section with many content points', async () => {
    const prompt =
      'Write a section titled "Programming Languages" covering: Python, JavaScript, TypeScript, Rust, Go, Java, C++, Ruby';
    const result = await client.generateSection(prompt);

    expect(result.length).toBeGreaterThan(100);

    // Should mention at least half of the languages
    const languages = [
      'python',
      'javascript',
      'typescript',
      'rust',
      'go',
      'java',
      'c++',
      'ruby',
    ];
    const mentioned = languages.filter((lang) =>
      result.toLowerCase().includes(lang),
    ).length;
    expect(mentioned).toBeGreaterThanOrEqual(4);
  }, 30_000);
});

// ---------------------------------------------------------------
// 3. Structured output compliance (markdown validation)
// ---------------------------------------------------------------
describe('structured output compliance', () => {
  it('produces well-formed markdown when assembled into a chapter', async () => {
    const outline: Outline = {
      title: 'Test Book',
      chapters: [
        {
          title: 'Basic Science',
          sections: [
            {
              header: 'The Water Cycle',
              points: ['evaporation', 'condensation', 'precipitation'],
            },
            {
              header: 'The Rock Cycle',
              points: ['igneous', 'sedimentary', 'metamorphic'],
            },
          ],
        },
      ],
    };

    const [chapter] = await generateBook(outline, client);

    // Chapter heading present
    expect(chapter.content).toMatch(/^# Basic Science\n/);

    // Section headings present
    expect(chapter.content).toContain('## The Water Cycle');
    expect(chapter.content).toContain('## The Rock Cycle');

    // Contains actual prose (not empty sections)
    const sections = chapter.content.split(/^## /m);
    for (const section of sections.slice(1)) {
      // Each section after the heading should have substantial content
      const lines = section
        .split('\n')
        .filter((l) => l.trim().length > 0);
      expect(lines.length).toBeGreaterThanOrEqual(2);
    }

    // No broken markdown (unmatched backticks, unclosed tags)
    const backtickCount = (chapter.content.match(/```/g) || []).length;
    expect(backtickCount % 2).toBe(0);
  }, 60_000);
});

// ---------------------------------------------------------------
// 4. Tool selection under controlled conditions (end-to-end)
// ---------------------------------------------------------------
describe('end-to-end generation', () => {
  it('generates a complete chapter with correct structure via generateBook', async () => {
    const outline: Outline = {
      title: 'Science Primer',
      chapters: [
        {
          title: 'Earth Science',
          sections: [
            {
              header: 'Plate Tectonics',
              points: ['continental drift', 'earthquakes', 'volcanoes'],
            },
          ],
        },
      ],
    };

    const chapters = await generateBook(outline, client);

    expect(chapters).toHaveLength(1);
    expect(chapters[0].title).toBe('Earth Science');

    // The content should have the chapter heading and section heading
    expect(chapters[0].content).toContain('# Earth Science');
    expect(chapters[0].content).toContain('## Plate Tectonics');

    // The prose should reference at least some of the points
    const content = chapters[0].content.toLowerCase();
    const pointsMentioned = ['continental', 'earthquake', 'volcano'].filter(
      (p) => content.includes(p),
    ).length;
    expect(pointsMentioned).toBeGreaterThanOrEqual(2);
  }, 60_000);
});
