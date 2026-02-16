import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { GeneratedChapter } from './generator.js';

export async function writeBook(
  dest: string,
  chapters: GeneratedChapter[],
): Promise<void> {
  const manuscriptDir = join(dest, 'manuscript');
  await mkdir(manuscriptDir, { recursive: true });

  const filenames: string[] = [];

  for (let i = 0; i < chapters.length; i++) {
    const filename = `chapter-${String(i + 1).padStart(2, '0')}.md`;
    filenames.push(filename);
    await writeFile(
      join(manuscriptDir, filename),
      chapters[i].content,
      'utf-8',
    );
  }

  await writeFile(
    join(manuscriptDir, 'Book.txt'),
    filenames.join('\n') + '\n',
    'utf-8',
  );
}
