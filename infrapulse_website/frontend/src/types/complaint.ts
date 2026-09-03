export type ComplaintStatusType = 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED';
export type AIStatusType = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type CategoryType = 'Structural' | 'Functional' | 'Performance';
export type DefectType = 'Cracked_Tiles' | 'Peeling' | 'Spalling' | 'Stagnant_Water';
export type SeverityType = 'LOW' | 'MEDIUM' | 'HIGH';
export type PriorityLevelType = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface StatusHistoryResponse {
  id: string;
  complaint_id: string;
  from_status: string;
  to_status: string;
  changed_by_id: string;
  changed_by_role: string;
  changed_at: string;
  notes?: string | null;
}

export interface StatusUpdateRequest {
  status: ComplaintStatusType;
  notes?: string | null;
}

export interface ComplaintResponse {
  id: string;
  user_id: string;
  name_snapshot: string;
  address: string;
  description: string;
  image_url: string;
  
  // AI Results
  ai_status: AIStatusType | string;
  detected_defect?: DefectType | string | null;
  category?: CategoryType | string | null;
  confidence?: number | null;
  
  visible_extent_ratio?: number | null;
  visible_extent_percentage?: number | null;
  extent_label?: string | null;
  extent_score?: number | null;
  
  severity_score?: number | null;
  severity?: SeverityType | string | null;
  
  priority_score?: number | null;
  priority_level?: PriorityLevelType | string | null;
  
  classifier_inference_ms?: number | null;
  pipeline_time_ms?: number | null;
  
  // Status & Timestamps
  status: ComplaintStatusType | string;
  assigned_staff_id?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  
  error_code?: string | null;
  error_message?: string | null;
}

export interface ComplaintDetailResponse extends ComplaintResponse {
  queue_position?: number | null;
  queue_size?: number | null;
  status_history: StatusHistoryResponse[];
}

export interface CreateComplaintFormData {
  name: string;
  address: string;
  description: string;
  photo: File;
}
