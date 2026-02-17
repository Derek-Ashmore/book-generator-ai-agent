import type { LlmClient } from './client.js';

export class StubLlmClient implements LlmClient {
  private defaultResponse: string;
  private responseMap: Map<string, string>;

  constructor(options?: {
    defaultResponse?: string;
    responseMap?: Record<string, string>;
  }) {
    this.defaultResponse =
      options?.defaultResponse ?? 'Stub-generated content.';
    this.responseMap = new Map(
      Object.entries(options?.responseMap ?? {}),
    );
  }

  async generateSection(prompt: string): Promise<string> {
    for (const [key, value] of this.responseMap) {
      if (prompt.includes(key)) {
        return value;
      }
    }
    return this.defaultResponse;
  }
}
