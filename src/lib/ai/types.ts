export interface OpenAIClient {
  chat: {
    completions: {
      create: (params: {
        model: string;
        messages: Array<{
          role: "system" | "user" | "assistant";
          content: string | Array<{
            type: "text" | "image_url";
            text?: string;
            image_url?: { url: string; detail?: "low" | "high" | "auto" };
          }>;
        }>;
        response_format?: { type: "json_object" | "json_schema"; json_schema?: unknown };
        max_tokens?: number;
        temperature?: number;
      }) => Promise<{
        choices: Array<{
          message: {
            content: string | null;
          };
        }>;
        usage?: {
          prompt_tokens: number;
          completion_tokens: number;
          total_tokens: number;
        };
      }>;
    };
  };
}

export type Severity = "high" | "medium" | "low";
export type IssueCategory = "layout" | "color" | "typography" | "effects" | "content";

export interface DiffIssue {
  severity: Severity;
  category: IssueCategory;
  location: string;
  description: string;
  original: string;
  reconstructed: string;
  suggestion: string;
}

export interface DiffSummary {
  totalIssues: number;
  high: number;
  medium: number;
  low: number;
}

export interface DiffAnalysis {
  score: number;
  issues: DiffIssue[];
  summary: DiffSummary;
}

export interface CodePatch {
  file: string;
  search: string;
  replace: string;
  reason: string;
}

export interface FixResult {
  patches: CodePatch[];
  applied: number;
  failed: number;
  remainingIssues: DiffIssue[];
}

export interface IterationState {
  score: number;
  iteration: number;
  maxIterations: number;
  targetScore: number;
  currentCode: string;
  lastDiff: DiffAnalysis | null;
}
