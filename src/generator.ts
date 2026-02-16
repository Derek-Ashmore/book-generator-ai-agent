import type { LlmClient } from './llm/client.js';
import type { Outline, Chapter } from './types.js';

export interface GeneratedChapter {
  title: string;
  content: string;
}

export async function generateBook(
  outline: Outline,
  llmClient: LlmClient,
): Promise<GeneratedChapter[]> {
  const chapters: GeneratedChapter[] = [];

  for (const chapter of outline.chapters) {
    const content = await generateChapter(chapter, llmClient);
    chapters.push({ title: chapter.title, content });
  }

  return chapters;
}

async function generateChapter(
  chapter: Chapter,
  llmClient: LlmClient,
): Promise<string> {
  const parts: string[] = [`# ${chapter.title}\n`];

  for (const section of chapter.sections) {
    const prompt = `Write a section titled "${section.header}" covering: ${section.points.join(', ')}`;
    const prose = await llmClient.generateSection(prompt);
    parts.push(`## ${section.header}\n\n${prose}\n`);
  }

  return parts.join('\n');
}
