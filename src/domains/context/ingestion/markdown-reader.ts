/**
 * Minimal Markdown reader.
 * - Normalizes CRLF.
 * - Splits by H1/H2/H3 boundaries while preserving the heading path.
 * - Returns an ordered list of sections with their heading_path and raw
 *   markdown body. The chunker decides how to subdivide further.
 */

export interface MarkdownSection {
  headingPath: string;
  level: number;
  heading: string;
  body: string;
  startLine: number;
  endLine: number;
}

const HEADING_RE = /^(#{1,6})\s+(.+?)\s*#*\s*$/;

export function readMarkdown(input: string): MarkdownSection[] {
  const normalized = input.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  const sections: MarkdownSection[] = [];
  const stack: { level: number; heading: string }[] = [];
  let currentBody: string[] = [];
  let currentStart = 1;
  let currentLevel = 0;
  let currentHeading = "";

  const flush = (endLine: number) => {
    if (currentBody.length === 0 && !currentHeading) return;
    sections.push({
      headingPath: stack.map((s) => s.heading).join(" > "),
      level: currentLevel,
      heading: currentHeading,
      body: currentBody.join("\n").trim(),
      startLine: currentStart,
      endLine: Math.max(endLine - 1, currentStart),
    });
    currentBody = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    const lineNumber = i + 1;
    const match = line.match(HEADING_RE);

    if (match) {
      const level = match[1]?.length ?? 1;
      const heading = (match[2] ?? "").trim();
      // Close any current section before opening the new one.
      flush(lineNumber);
      while (stack.length > 0 && (stack[stack.length - 1]?.level ?? 0) >= level) {
        stack.pop();
      }
      stack.push({ level, heading });
      currentLevel = level;
      currentHeading = heading;
      currentStart = lineNumber;
      continue;
    }

    currentBody.push(line);
  }

  flush(lines.length + 1);
  return sections;
}