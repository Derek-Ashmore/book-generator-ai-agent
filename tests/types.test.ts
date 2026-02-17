import { describe, it, expect } from 'vitest';
import type { Outline, Chapter, Section } from '../src/types.js';

describe('types', () => {
  it('should allow creating an Outline', () => {
    const section: Section = { header: 'Intro', points: ['point 1'] };
    const chapter: Chapter = { title: 'Chapter 1', sections: [section] };
    const outline: Outline = { title: 'My Book', chapters: [chapter] };

    expect(outline.title).toBe('My Book');
    expect(outline.chapters).toHaveLength(1);
    expect(outline.chapters[0].sections[0].points).toEqual(['point 1']);
  });
});
