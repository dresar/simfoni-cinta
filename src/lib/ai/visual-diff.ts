import type { OpenAIClient, DiffAnalysis, DiffIssue, DiffSummary } from "./types";

function bufferToBase64Png(buffer: Buffer): string {
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

function buildComparisonPrompt(): string {
  return `Compare these two invitation screenshots side-by-side:

LEFT: Original invitation
RIGHT: AI-reconstructed version

Analyze pixel-by-pixel and identify ALL differences. Return ONLY valid JSON matching this exact structure:

{
  "score": 85,
  "issues": [
    {
      "severity": "high" | "medium" | "low",
      "category": "layout" | "color" | "typography" | "effects" | "content",
      "location": "Section name or element",
      "description": "Specific difference found",
      "original": "What the original has",
      "reconstructed": "What the reconstruction has",
      "suggestion": "How to fix it"
    }
  ],
  "summary": {
    "totalIssues": 12,
    "high": 3,
    "medium": 5,
    "low": 4
  }
}

Scoring formula: score = max(0, 100 - (high * 5 + medium * 2 + low * 1))
Be brutally honest. Find every difference no matter how small.

Rules:
- severity "high": structural/layout breaks, missing elements, wrong colors, broken typography hierarchy
- severity "medium": spacing issues, alignment drift, shadow/blur differences, font weight mismatches
- severity "low": minor pixel offsets, subtle opacity differences, barely noticeable color shifts
- category "layout": positioning, spacing, alignment, sizing, z-index, flex/grid behavior
- category "color": background colors, text colors, gradients, opacity, tint, hue shifts
- category "typography": font family, font size, font weight, line height, letter spacing, text transform
- category "effects": shadows, borders, border-radius, blur, backdrop-filter, animations, transitions
- category "content": text content mismatches, missing icons, wrong images, incorrect labels`;
}

function parseDiffResponse(content: string): DiffAnalysis {
  const cleaned = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const parsed = JSON.parse(cleaned) as {
    score?: number;
    issues?: Array<{
      severity?: string;
      category?: string;
      location?: string;
      description?: string;
      original?: string;
      reconstructed?: string;
      suggestion?: string;
    }>;
    summary?: {
      totalIssues?: number;
      high?: number;
      medium?: number;
      low?: number;
    };
  };

  const rawIssues = parsed.issues ?? [];
  const validSeverities = new Set<string>(["high", "medium", "low"]);
  const validCategories = new Set<string>(["layout", "color", "typography", "effects", "content"]);

  const issues: DiffIssue[] = rawIssues
    .filter(
      (i) =>
        i.severity &&
        validSeverities.has(i.severity) &&
        i.category &&
        validCategories.has(i.category) &&
        i.location &&
        i.description
    )
    .map((i) => ({
      severity: i.severity as "high" | "medium" | "low",
      category: i.category as "layout" | "color" | "typography" | "effects" | "content",
      location: i.location,
      description: i.description,
      original: i.original ?? "",
      reconstructed: i.reconstructed ?? "",
      suggestion: i.suggestion ?? "",
    }));

  const high = issues.filter((i) => i.severity === "high").length;
  const medium = issues.filter((i) => i.severity === "medium").length;
  const low = issues.filter((i) => i.severity === "low").length;

  const computedScore = Math.max(0, 100 - (high * 5 + medium * 2 + low * 1));
  const declaredScore = typeof parsed.score === "number" ? parsed.score : computedScore;
  const score = Math.min(100, Math.max(0, declaredScore));

  const summary: DiffSummary = {
    totalIssues: issues.length,
    high,
    medium,
    low,
  };

  return {
    score,
    issues,
    summary,
  };
}

export async function compareScreenshots(
  originalScreenshot: Buffer,
  reconstructedScreenshot: Buffer,
  client: OpenAIClient
): Promise<DiffAnalysis> {
  const originalUrl = bufferToBase64Png(originalScreenshot);
  const reconstructedUrl = bufferToBase64Png(reconstructedScreenshot);

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content:
          "You are a meticulous visual QA engineer. Compare two invitation screenshots and identify every visual difference. Return ONLY valid JSON.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: buildComparisonPrompt() },
          {
            type: "image_url",
            image_url: { url: originalUrl, detail: "high" },
          },
          {
            type: "image_url",
            image_url: { url: reconstructedUrl, detail: "high" },
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 4096,
    temperature: 0.2,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from vision model");
  }

  return parseDiffResponse(content);
}

export function calculateFidelityScore(issues: DiffIssue[]): number {
  const high = issues.filter((i) => i.severity === "high").length;
  const medium = issues.filter((i) => i.severity === "medium").length;
  const low = issues.filter((i) => i.severity === "low").length;

  return Math.max(0, 100 - (high * 5 + medium * 2 + low * 1));
}

export function groupIssuesByCategory(issues: DiffIssue[]): Record<string, DiffIssue[]> {
  const groups: Record<string, DiffIssue[]> = {};

  for (const issue of issues) {
    const key = issue.category;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(issue);
  }

  return groups;
}

export function groupIssuesBySeverity(issues: DiffIssue[]): Record<string, DiffIssue[]> {
  const groups: Record<string, DiffIssue[]> = {};

  for (const issue of issues) {
    const key = issue.severity;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(issue);
  }

  return groups;
}

export function filterIssuesBySeverity(
  issues: DiffIssue[],
  minSeverity: "high" | "medium" | "low"
): DiffIssue[] {
  const priority = { high: 3, medium: 2, low: 1 };
  const min = priority[minSeverity];

  return issues.filter((i) => priority[i.severity] >= min);
}

export function sortIssuesBySeverity(issues: DiffIssue[]): DiffIssue[] {
  const priority = { high: 0, medium: 1, low: 2 };
  return [...issues].sort((a, b) => priority[a.severity] - priority[b.severity]);
}
