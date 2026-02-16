#!/usr/bin/env node
import 'dotenv/config';
import { Command, Option } from 'commander';
import { readFile } from 'node:fs/promises';
import { parseOutline } from './parser.js';
import { generateBook } from './generator.js';
import { writeBook } from './writer.js';
import { OpenAiClient, StubLlmClient } from './llm/index.js';
import type { LlmClient } from './llm/index.js';

const program = new Command();

program
  .name('book-generator')
  .description('Generate books from FreeMind mind map outlines')
  .requiredOption('-o, --outline <path>', 'Path to FreeMind .mm outline file')
  .requiredOption('-d, --dest <path>', 'Destination folder for book output')
  .addOption(
    new Option('-l, --llm <provider>', 'LLM provider to use')
      .choices(['openai', 'stub'])
      .default('openai'),
  )
  .option('--api-key <key>', 'OpenAI API key')
  .action(async (options) => {
    const { outline, dest, llm, apiKey } = options;

    let client: LlmClient;
    if (llm === 'stub') {
      client = new StubLlmClient();
    } else {
      const key = apiKey ?? process.env.OPENAI_API_KEY;
      if (!key) {
        console.error(
          'Error: OpenAI API key required. Set OPENAI_API_KEY or use --api-key.',
        );
        process.exit(1);
      }
      client = new OpenAiClient(key);
    }

    const xml = await readFile(outline, 'utf-8');
    const outlineModel = parseOutline(xml);
    const chapters = await generateBook(outlineModel, client);
    await writeBook(dest, chapters);

    console.log(
      `Book generated: ${chapters.length} chapters written to ${dest}/manuscript/`,
    );
  });

program.parse();
