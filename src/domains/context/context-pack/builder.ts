import type {
  CompressionStrategy,
  ContextPackInput,
  ContextPackOutput,
  HybridSearchResultItem,
  ProductKey,
} from "../types";

const DEFAULT_TOKEN_BUDGET = 8000;
const CHARS_PER_TOKEN = 4;

export interface BuildContextPackOptions {
  results: HybridSearchResultItem[];
  objective: string;
  productKey: ProductKey;
  screenId?: string | null;
  domainKey?: string | null;
  tokenBudget?: number;
  strategy?: CompressionStrategy;
  queryId?: string | null;
}

export function buildContextPack(
  options: BuildContextPackOptions,
): ContextPackOutput {
  const strategy = options.strategy ?? "default";
  const budget = options.tokenBudget ?? DEFAULT_TOKEN_BUDGET;

  const sorted = [...options.results].sort(
    (a, b) => b.combined_score - a.combined_score,
  );
  const deduped = deduplicate(sorted);
  const selected: HybridSearchResultItem[] = [];
  let tokens = 0;

  for (const result of deduped) {
    const chunkTokens = estimateTokens(result.content);
    if (tokens + chunkTokens > budget) {
      if (strategy === "aggressive") continue;
      if (selected.length === 0) {
        // Always include at least the top hit, even if it overflows.
        selected.push(result);
        tokens += chunkTokens;
      }
      break;
    }
    selected.push(result);
    tokens += chunkTokens;
  }

  const sections: string[] = [
    "# Context Pack",
    "",
    "## Task Summary",
    trimToTokens(options.objective, Math.min(120, budget / 20)),
  ];

  sections.push("", "## Relevant Decisions");
  sections.push(...extractBullets(selected, "decisions"));

  sections.push("", "## Relevant UI Rules");
  sections.push(...extractBullets(selected, "ui_rules"));

  sections.push("", "## Relevant Data Model");
  sections.push(...extractBullets(selected, "data_model"));

  sections.push("", "## Relevant RBAC Rules");
  sections.push(...extractBullets(selected, "rbac"));

  sections.push("", "## Files/Docs to Inspect");
  for (const item of selected) {
    sections.push(`- ${item.title} — ${item.heading_path || "(root)"}`);
  }

  sections.push("", "## Open Questions");
  sections.push(
    "- Confirm constraints not explicitly listed in the retrieved chunks.",
  );
  sections.push(
    options.screenId
      ? `- Verify screen-level rules for ${options.screenId} beyond what was retrieved.`
      : "- Verify domain-level rules beyond what was retrieved.",
  );

  sections.push("", "## Source References");
  for (const item of selected) {
    sections.push(
      `- chunk:${item.chunk_id} — ${item.title} — ${item.heading_path || "(root)"}`,
    );
  }

  if (options.domainKey) {
    sections.unshift("", `**Domain:** ${options.domainKey}`);
  }
  if (options.screenId) {
    sections.unshift("", `**Screen ID:** ${options.screenId}`);
  }
  sections.unshift("", `**Product:** ${options.productKey}`);

  const body = sections.join("\n");
  return {
    query_id: options.queryId ?? null,
    context_pack: body,
    selected_chunk_ids: selected.map((item) => item.chunk_id),
    token_estimate: estimateTokens(body),
    compression_strategy: strategy,
  };
}

function deduplicate(
  results: HybridSearchResultItem[],
): HybridSearchResultItem[] {
  const seen = new Set<string>();
  const out: HybridSearchResultItem[] = [];
  for (const result of results) {
    const key = normalize(result.content);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(result);
  }
  return out;
}

function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

function extractBullets(
  results: HybridSearchResultItem[],
  _kind: string,
): string[] {
  const bullets: string[] = [];
  for (const result of results) {
    const lines = result.content
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- ") || line.startsWith("* "));
    for (const line of lines.slice(0, 3)) {
      const cleaned = line.replace(/^[-*]\s+/, "").trim();
      if (cleaned.length === 0) continue;
      bullets.push(`- (${result.heading_path || result.title}) ${cleaned}`);
    }
  }
  return bullets.length > 0 ? bullets : ["- (none captured)"];
}

function trimToTokens(text: string, maxTokens: number): string {
  const cap = Math.max(1, maxTokens) * CHARS_PER_TOKEN;
  if (text.length <= cap) return text;
  return `${text.slice(0, Math.max(0, cap - 1))}…`;
}

export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / CHARS_PER_TOKEN));
}

export function buildContextPackFromInput(
  input: ContextPackInput,
  results: HybridSearchResultItem[],
  queryId?: string | null,
): ContextPackOutput {
  return buildContextPack({
    results,
    objective: input.objective,
    productKey: input.product_key,
    screenId: input.screen_id ?? null,
    domainKey: input.domain_key ?? null,
    tokenBudget: input.token_budget,
    queryId: queryId ?? null,
  });
}