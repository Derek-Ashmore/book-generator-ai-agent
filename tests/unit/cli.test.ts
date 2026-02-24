import { describe, it, expect } from 'vitest';
import { StubLlmClient, OpenAiClient } from '../../src/llm/index.js';
import type { LlmClient } from '../../src/llm/index.js';

describe('StubLlmClient', () => {
  it('creates an instance with a generateSection method', () => {
    const client = new StubLlmClient();
    expect(client).toBeInstanceOf(StubLlmClient);
    expect(typeof client.generateSection).toBe('function');
  });

  it('returns default response when no options provided', async () => {
    const client = new StubLlmClient();
    const result = await client.generateSection('any prompt');
    expect(result).toBe('Stub-generated content.');
  });

  it('returns mapped response when prompt matches a key in responseMap', async () => {
    const client = new StubLlmClient({
      defaultResponse: 'fallback',
      responseMap: {
        'chapter one': 'Response for chapter one',
        'chapter two': 'Response for chapter two',
      },
    });

    const result = await client.generateSection('Write about chapter one');
    expect(result).toBe('Response for chapter one');
  });

  it('returns default response when prompt does not match any key', async () => {
    const client = new StubLlmClient({
      defaultResponse: 'custom fallback',
      responseMap: {
        'specific-key': 'specific value',
      },
    });

    const result = await client.generateSection('unrelated prompt');
    expect(result).toBe('custom fallback');
  });
});

describe('OpenAiClient', () => {
  it('constructs without error given an API key', () => {
    const client = new OpenAiClient('test-key');
    expect(client).toBeInstanceOf(OpenAiClient);
  });

  it('has a generateSection method (implements LlmClient)', () => {
    const client = new OpenAiClient('test-key');
    expect(typeof client.generateSection).toBe('function');
    // Verify it satisfies the LlmClient interface at the type level
    const asLlmClient: LlmClient = client;
    expect(asLlmClient).toBeDefined();
  });
});
