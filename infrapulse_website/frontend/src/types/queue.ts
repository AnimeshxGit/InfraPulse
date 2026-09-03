import { DefectType, CategoryType, SeverityType, PriorityLevelType, ComplaintStatusType } from './complaint';

export interface QueueItemResponse {
  rank: number;
  id: string;
  complaint_id: string;
  user_id: string;
  name_snapshot: string;
  address: string;
  description: string;
  image_url: string;
  detected_defect?: DefectType | string | null;
  category: CategoryType | string;
  confidence?: number | null;
  visible_extent_percentage?: number | null;
  extent_label?: string | null;
  severity_score?: number | null;
  severity?: SeverityType | string | null;
  priority_score?: number | null;
  priority_level?: PriorityLevelType | string | null;
  status: ComplaintStatusType | string;
  created_at: string;
}

export interface QueueListResponse {
  category: CategoryType | string;
  total_items: number;
  items: QueueItemResponse[];
}

export interface QueuePositionResponse {
  complaint_id: string;
  category?: string | null;
  in_queue: boolean;
  rank?: number | null;
  queue_size?: number | null;
  status: string;
  ai_status: string;
}
