export interface CategoryStats {
  category: string;
  total: number;
  submitted: number;
  assigned: number;
  in_progress: number;
  resolved: number;
  avg_priority_score?: number | null;
}

export interface SystemStatsResponse {
  total_complaints: number;
  categories: CategoryStats[];
}
