import { apiClient } from './client';
import {
  ComplaintResponse,
  ComplaintDetailResponse,
  StatusHistoryResponse,
  CreateComplaintFormData,
} from '../types/complaint';
import { QueuePositionResponse } from '../types/queue';

export async function createComplaint(formData: CreateComplaintFormData): Promise<ComplaintResponse> {
  const data = new FormData();
  data.append('name', formData.name.trim());
  data.append('address', formData.address.trim());
  data.append('description', formData.description.trim());
  data.append('photo', formData.photo);

  return apiClient<ComplaintResponse>('/api/v1/complaints', {
    method: 'POST',
    body: data,
  });
}

export async function listComplaints(params?: {
  status?: string;
  ai_status?: string;
}): Promise<ComplaintResponse[]> {
  return apiClient<ComplaintResponse[]>('/api/v1/complaints', {
    method: 'GET',
    params,
  });
}

export async function getComplaint(id: string): Promise<ComplaintDetailResponse> {
  return apiClient<ComplaintDetailResponse>(`/api/v1/complaints/${id}`, {
    method: 'GET',
  });
}

export async function getComplaintPosition(id: string): Promise<QueuePositionResponse> {
  return apiClient<QueuePositionResponse>(`/api/v1/complaints/${id}/position`, {
    method: 'GET',
  });
}

export async function getComplaintEvents(id: string): Promise<StatusHistoryResponse[]> {
  return apiClient<StatusHistoryResponse[]>(`/api/v1/complaints/${id}/events`, {
    method: 'GET',
  });
}

export async function reprocessComplaint(id: string): Promise<ComplaintResponse> {
  return apiClient<ComplaintResponse>(`/api/v1/complaints/${id}/reprocess`, {
    method: 'POST',
  });
}
