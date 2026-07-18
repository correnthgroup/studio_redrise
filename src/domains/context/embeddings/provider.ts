/**
 * Pluggable embedding provider. The Context Memory Layer never talks to
 * OpenAI / OpenRouter / Ollama directly — it goes through this interface
 * so we can swap providers (and later migrate to Qdrant/Weaviate) without
 * touching the rest of the domain.
 */
export interface EmbeddingProvider {
  /** Stable identifier; persisted in metadata for provenance. */
  readonly name: string;
  /** Output dimensionality. 1536 for text-embedding-3-small. */
  readonly dimensions: number;
  /** Batch-embed an array of strings. Implementations may chunk large inputs. */
  embed(texts: string[]): Promise<number[][]>;
}

export class EmbeddingProviderError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "EmbeddingProviderError";
  }
}