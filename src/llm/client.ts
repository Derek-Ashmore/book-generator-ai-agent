export interface LlmClient {
  generateSection(prompt: string): Promise<string>;
}
