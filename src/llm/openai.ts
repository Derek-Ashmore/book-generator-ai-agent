import OpenAI from 'openai';
import type { LlmClient } from './client.js';

export interface OpenAiClientOptions {
  apiKey: string;
  model?: string;
  temperature?: number;
  seed?: number;
}

export class OpenAiClient implements LlmClient {
  private client: OpenAI;
  private model: string;
  private temperature: number | undefined;
  private seed: number | undefined;

  constructor(options: OpenAiClientOptions | string) {
    const opts =
      typeof options === 'string' ? { apiKey: options } : options;
    this.client = new OpenAI({ apiKey: opts.apiKey });
    this.model = opts.model ?? 'gpt-4o';
    this.temperature = opts.temperature;
    this.seed = opts.seed;
  }

  async generateSection(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      ...(this.temperature !== undefined && {
        temperature: this.temperature,
      }),
      ...(this.seed !== undefined && { seed: this.seed }),
    });
    return response.choices[0]?.message?.content ?? '';
  }
}
