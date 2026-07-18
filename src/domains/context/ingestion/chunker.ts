import { contentHash } from "./hash";
import type { MarkdownSection } from "./markdown-reader";

export interface ChunkOptions {
  minTokens: number;
  maxTokens: number;
  overlapTokens: number;
}

export interface ChunkRecord {
  chunk_index: number;
  heading_path: string;
  content: string;
  content_tokens: number;
  content_hash: string;
}

/**
 * Approximate tokenizer: 1 token ≈ 4 characters for English/Portuguese mix.
 * Cheap, deterministic, and avoids pulling in a full tokenizer dependency
 * for the chunker. Good enough for budgeting at the 800-1200 token window.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

const DEFAULT_OPTIONS: ChunkOptions = {
  minTokens: 800,
  maxTokens: 1200,
  overlapTokens: 80,
};

/**
 * Chunker rules:
 *  1. One chunk per section when the section fits within maxTokens.
 *  2. Otherwise split by paragraphs, accumulating until we hit maxTokens,
 *     emitting a chunk and starting the next with the last `overlapTokens`
 *     worth of context.
 *  3. Headings, code fences and tables are preserved as part of the body;
 *     the chunker never rewrites content.
 */
export function chunkSections(
  sections: MarkdownSection[],
  options: Partial<ChunkOptions> = {},
): ChunkRecord[] {
  const opts: ChunkOptions = { ...DEFAULT_OPTIONS, ...options };
  const chunks: ChunkRecord[] = [];
  let index = 0;

  for (const section of sections) {
    const sectionText = renderSection(section);
    const tokens = estimateTokens(sectionText);

    if (tokens <= opts.maxTokens) {
      chunks.push(makeChunk(index, section.headingPath, sectionText));
      index += 1;
      continue;
    }

    const paragraphs = splitParagraphs(section.body);
    let buffer: string[] = [];
    let bufferTokens = estimateTokens(section.headingPath) + 4; // heading overhead
    let lastOverlap: string[] = [];

    const emitBuffer = (final: boolean) => {
      if (buffer.length === 0 && !final) return;
      const body = buffer.join("\n\n").trim();
      const text = body
        ? `${section.headingPath}\n\n${body}`
        : section.headingPath;
      chunks.push(makeChunk(index, section.headingPath, text));
      index += 1;
      // Carry the tail as overlap for the next chunk.
      const overlapText = buffer.slice(-2).join("\n\n");
      lastOverlap = estimateTokens(overlapText) <= opts.overlapTokens
        ? overlapText.split("\n\n")
        : [];
      buffer = [];
      bufferTokens = estimateTokens(section.headingPath) + 4;
    };

    for (const paragraph of paragraphs) {
      const paragraphTokens = estimateTokens(paragraph);
      if (
        bufferTokens + paragraphTokens > opts.maxTokens &&
        buffer.length > 0
      ) {
        emitBuffer(false);
        if (lastOverlap.length > 0) {
          buffer.push(...lastOverlap);
          bufferTokens += lastOverlap.reduce(
            (acc, p) => acc + estimateTokens(p),
            0,
          );
        }
      }
      buffer.push(paragraph);
      bufferTokens += paragraphTokens;
    }

    emitBuffer(true);
  }

  return chunks;
}

function makeChunk(
  index: number,
  headingPath: string,
  content: string,
): ChunkRecord {
  return {
    chunk_index: index,
    heading_path: headingPath,
    content,
    content_tokens: estimateTokens(content),
    content_hash: contentHash(content),
  };
}

function renderSection(section: MarkdownSection): string {
  if (!section.body) return section.headingPath;
  return `${section.headingPath}\n\n${section.body}`.trim();
}

function splitParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}