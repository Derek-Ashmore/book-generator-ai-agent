import { describe, it, expect } from 'vitest';
import { parseOutline } from '../../src/parser.js';

/**
 * Helper to build a FreeMind .mm XML string from a simplified structure.
 */
function buildMmXml(
  title: string,
  chapters: {
    title: string;
    sections?: {
      header: string;
      points?: string[];
    }[];
  }[],
): string {
  const indent = (level: number) => '  '.repeat(level);

  const buildPoints = (points: string[], level: number): string =>
    points.map((p) => `${indent(level)}<node TEXT="${p}"/>`).join('\n');

  const buildSections = (
    sections: { header: string; points?: string[] }[],
    level: number,
  ): string =>
    sections
      .map((s) => {
        if (!s.points || s.points.length === 0) {
          return `${indent(level)}<node TEXT="${s.header}"/>`;
        }
        return [
          `${indent(level)}<node TEXT="${s.header}">`,
          buildPoints(s.points, level + 1),
          `${indent(level)}</node>`,
        ].join('\n');
      })
      .join('\n');

  const buildChapters = (level: number): string =>
    chapters
      .map((ch) => {
        if (!ch.sections || ch.sections.length === 0) {
          return `${indent(level)}<node TEXT="${ch.title}"/>`;
        }
        return [
          `${indent(level)}<node TEXT="${ch.title}">`,
          buildSections(ch.sections, level + 1),
          `${indent(level)}</node>`,
        ].join('\n');
      })
      .join('\n');

  return [
    '<map version="1.0.1">',
    `  <node TEXT="${title}">`,
    buildChapters(2),
    '  </node>',
    '</map>',
  ].join('\n');
}

describe('parseOutline', () => {
  describe('valid input', () => {
    it('should parse a full multi-chapter outline with sections and points', () => {
      const xml = buildMmXml('My Book Title', [
        {
          title: 'Chapter 1: Introduction',
          sections: [
            {
              header: 'Background',
              points: ['Historical context', 'Key definitions'],
            },
            {
              header: 'Motivation',
              points: ['Problem statement', 'Goals', 'Audience'],
            },
          ],
        },
        {
          title: 'Chapter 2: Core Concepts',
          sections: [
            {
              header: 'Fundamentals',
              points: ['Concept A', 'Concept B'],
            },
            {
              header: 'Advanced Topics',
              points: ['Deep dive'],
            },
          ],
        },
        {
          title: 'Chapter 3: Conclusion',
          sections: [
            {
              header: 'Summary',
              points: ['Recap of key ideas'],
            },
          ],
        },
      ]);

      const outline = parseOutline(xml);

      expect(outline.title).toBe('My Book Title');
      expect(outline.chapters).toHaveLength(3);

      // Chapter 1
      const ch1 = outline.chapters[0];
      expect(ch1.title).toBe('Chapter 1: Introduction');
      expect(ch1.sections).toHaveLength(2);
      expect(ch1.sections[0].header).toBe('Background');
      expect(ch1.sections[0].points).toEqual([
        'Historical context',
        'Key definitions',
      ]);
      expect(ch1.sections[1].header).toBe('Motivation');
      expect(ch1.sections[1].points).toEqual([
        'Problem statement',
        'Goals',
        'Audience',
      ]);

      // Chapter 2
      const ch2 = outline.chapters[1];
      expect(ch2.title).toBe('Chapter 2: Core Concepts');
      expect(ch2.sections).toHaveLength(2);
      expect(ch2.sections[0].header).toBe('Fundamentals');
      expect(ch2.sections[0].points).toEqual(['Concept A', 'Concept B']);
      expect(ch2.sections[1].header).toBe('Advanced Topics');
      expect(ch2.sections[1].points).toEqual(['Deep dive']);

      // Chapter 3
      const ch3 = outline.chapters[2];
      expect(ch3.title).toBe('Chapter 3: Conclusion');
      expect(ch3.sections).toHaveLength(1);
      expect(ch3.sections[0].header).toBe('Summary');
      expect(ch3.sections[0].points).toEqual(['Recap of key ideas']);
    });

    it('should parse a single chapter outline', () => {
      const xml = buildMmXml('Solo Chapter Book', [
        {
          title: 'The Only Chapter',
          sections: [
            {
              header: 'Section One',
              points: ['Point A', 'Point B'],
            },
          ],
        },
      ]);

      const outline = parseOutline(xml);

      expect(outline.title).toBe('Solo Chapter Book');
      expect(outline.chapters).toHaveLength(1);
      expect(outline.chapters[0].title).toBe('The Only Chapter');
      expect(outline.chapters[0].sections).toHaveLength(1);
      expect(outline.chapters[0].sections[0].header).toBe('Section One');
      expect(outline.chapters[0].sections[0].points).toEqual([
        'Point A',
        'Point B',
      ]);
    });

    it('should handle a chapter with no sections', () => {
      const xml = buildMmXml('Sparse Book', [
        {
          title: 'Empty Chapter',
          sections: [],
        },
      ]);

      const outline = parseOutline(xml);

      expect(outline.title).toBe('Sparse Book');
      expect(outline.chapters).toHaveLength(1);
      expect(outline.chapters[0].title).toBe('Empty Chapter');
      expect(outline.chapters[0].sections).toEqual([]);
    });

    it('should handle a section with no points', () => {
      const xml = buildMmXml('Pointless Book', [
        {
          title: 'Chapter Without Points',
          sections: [
            {
              header: 'Bare Section',
              points: [],
            },
          ],
        },
      ]);

      const outline = parseOutline(xml);

      expect(outline.title).toBe('Pointless Book');
      expect(outline.chapters).toHaveLength(1);

      const section = outline.chapters[0].sections[0];
      expect(section.header).toBe('Bare Section');
      expect(section.points).toEqual([]);
    });

    it('should handle mixed chapters with and without sections', () => {
      const xml = buildMmXml('Mixed Book', [
        {
          title: 'Full Chapter',
          sections: [
            {
              header: 'Has Points',
              points: ['Point 1'],
            },
          ],
        },
        {
          title: 'Empty Chapter',
          sections: [],
        },
      ]);

      const outline = parseOutline(xml);

      expect(outline.chapters).toHaveLength(2);
      expect(outline.chapters[0].sections).toHaveLength(1);
      expect(outline.chapters[1].sections).toEqual([]);
    });

    it('should handle root node with no chapter children', () => {
      const xml = [
        '<map version="1.0.1">',
        '  <node TEXT="Empty Book"/>',
        '</map>',
      ].join('\n');

      const outline = parseOutline(xml);

      expect(outline.title).toBe('Empty Book');
      expect(outline.chapters).toEqual([]);
    });
  });

  describe('invalid input', () => {
    it('should throw on malformed XML (non-XML string)', () => {
      expect(() => parseOutline('this is not xml at all')).toThrow();
    });

    it('should throw on empty string', () => {
      expect(() => parseOutline('')).toThrow();
    });

    it('should throw on missing root <map><node> structure', () => {
      const xml = '<map></map>';

      expect(() => parseOutline(xml)).toThrow();
    });

    it('should throw on non-FreeMind XML', () => {
      const xml = '<html><body><p>Hello</p></body></html>';

      expect(() => parseOutline(xml)).toThrow();
    });

    it('should throw on XML with map but no node element', () => {
      const xml = '<map version="1.0.1"><other>content</other></map>';

      expect(() => parseOutline(xml)).toThrow();
    });
  });
});
