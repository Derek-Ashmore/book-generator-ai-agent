import { XMLParser } from 'fast-xml-parser';
import type { Outline, Chapter, Section } from './types.js';

interface MmNode {
  '@_TEXT': string;
  node?: MmNode | MmNode[];
}

function toArray(value: MmNode | MmNode[] | undefined): MmNode[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseOutline(xml: string): Outline {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });
  const parsed = parser.parse(xml);
  const root: MmNode = parsed.map.node;

  const chapters: Chapter[] = toArray(root.node).map((chapterNode) => {
    const sections: Section[] = toArray(chapterNode.node).map(
      (sectionNode) => ({
        header: sectionNode['@_TEXT'],
        points: toArray(sectionNode.node).map((p) => p['@_TEXT']),
      }),
    );
    return {
      title: chapterNode['@_TEXT'],
      sections,
    };
  });

  return {
    title: root['@_TEXT'],
    chapters,
  };
}
