import {
  EmbeddingProvider,
  EmbeddingProviderError,
} from "./provider";

export interface OpenRouterEmbeddingConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  /** Max texts per request. Defaults to 64. */
  batchSize?: number;
}

/**
 * OpenAI-compatible embedding provider used through OpenRouter / MiniMax.
 * Reuses the OPENAI_BASE_URL + OPENAI_API_KEY env contract that already
 * exists in .env.example for graphify.
 */
export class OpenRouterEmbeddingProvider implements EmbeddingProvider {
  readonly name: string;
  readonly dimensions = 1536;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly batchSize: number;

  constructor(config: OpenRouterEmbeddingConfig) {
    if (!config.apiKey) {
      throw new EmbeddingProviderError(
        "OpenRouterEmbeddingProvider requires apiKey",
      );
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? "https://openrouter.ai/api/v1").replace(
      /\/$/,
      "",
    );
    this.model = config.model ?? "openai/text-embedding-3-small";
    this.batchSize = config.batchSize ?? 64;
    this.name = `openrouter:${this.model}`;
  }

  async embed(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    const results: number[][] = [];
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      const vectors = await this.embedBatch(batch);
      results.push(...vectors);
    }
    return results;
  }

  private async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
        encoding_format: "float",
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new EmbeddingProviderError(
        `Embedding request failed (${response.status}): ${body.slice(0, 200)}`,
      );
    }

    const payload = (await response.json()) as {
      data?: Array<{ embedding: number[]; index: number }>;
    };

    if (!payload.data) {
      throw new EmbeddingProviderError(
        "Embedding response missing data field",
      );
    }

    return payload.data
      .sort((a, b) => a.index - b.index)
      .map((row) => row.embedding);
  }
}

export function createEmbeddingProvider(): EmbeddingProvider {
  const apiKey =
    process.env.OPENAI_API_KEY ?? process.env.OPENROUTER_API_KEY ?? "";
  const baseUrl = process.env.OPENAI_BASE_URL;
  const model = process.env.OPENAI_EMBEDDING_MODEL;
  return new OpenRouterEmbeddingProvider({
    apiKey,
    baseUrl,
    model,
  });
}