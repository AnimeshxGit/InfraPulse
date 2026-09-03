import { apiClient } from './client';
import { StaffPublic } from '../types/auth';
import {
  ComplaintResponse,
  ComplaintDetailResponse,
  StatusUpdateRequest,
} from '../types/complaint';
import { QueueListResponse } from '../types/queue';

export async function getStaffMe(): Promise<StaffPublic> {
  return apiClient<StaffPublic>('/api/v1/staff/me', {
    method: 'GET',
  });
}

export async function getStaffQueue(): Promise<QueueListResponse> {
  return apiClient<QueueListResponse>('/api/v1/staff/queue', {
    method: 'GET',
  });
}

export async function getStaffQueueByCategory(category: string): Promise<QueueListResponse> {
  return apiClient<QueueListResponse>(`/api/v1/staff/queue/${category}`, {
    method: 'GET',
  });
}

export async function getStaffComplaint(complaintId: string): Promise<ComplaintDetailResponse> {
  return apiClient<ComplaintDetailResponse>(`/api/v1/staff/complaints/${complaintId}`, {
    method: 'GET',
  });
}

export async function updateStaffComplaintStatus(
  complaintId: string,
  payload: StatusUpdateRequest
): Promise<ComplaintResponse> {
  return apiClient<ComplaintResponse>(`/api/v1/staff/complaints/${complaintId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getStaffHistory(): Promise<ComplaintResponse[]> {
  return apiClient<ComplaintResponse[]>('/api/v1/staff/history', {
    method: 'GET',
  });
}
