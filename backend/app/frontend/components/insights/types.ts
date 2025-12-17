export type QueryType = 'summary' | 'tweets' | 'review' | 'blog' | 'update' | 'ideas' | 'custom';

export type InsightStatus = 'pending' | 'generating' | 'completed' | 'failed';

export type ReviewPerspective = 'manager' | 'self';

export interface InsightRequest {
  id: string;
  name: string;
  queryType: QueryType;
  customQuery?: string;
  perspective?: ReviewPerspective;
  dateRangeStart: string;
  dateRangeEnd: string;
  projectIds: string[];
  personIds: string[];
  status: InsightStatus;
  resultPayload?: {
    sections: Array<{
      title: string;
      bullets: string[];
    }>;
    stats: {
      total_entries: number;
      date_range_days: number;
      current_streak: number;
      project_breakdown?: Record<string, number>;
    };
    raw_text?: string;
  };
  content?: string;
  resultModel?: string;
  promptTokens?: number;
  completionTokens?: number;
  errorMessage?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ProjectOption {
  value: string;
  label: string;
  color: string;
}

export interface PersonOption {
  value: string;
  label: string;
}

export interface QueryTypeOption {
  value: QueryType;
  label: string;
  description: string;
}

export interface DatePresetOption {
  value: string;
  label: string;
}

export interface InsightsMeta {
  projects: ProjectOption[];
  persons: PersonOption[];
  queryTypes: QueryTypeOption[];
  datePresets: DatePresetOption[];
  monthlyGenerationLimit?: number;
  monthlyGenerationUsage?: number;
}

export interface PreviewData {
  totalNotes: number;
  breakdown: Record<string, number>;
  topCollaborators: Array<{
    name: string;
    count: number;
  }>;
}

export interface PaginationData {
  currentPage: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
}
