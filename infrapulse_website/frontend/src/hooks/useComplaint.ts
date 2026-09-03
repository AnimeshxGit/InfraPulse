import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createComplaint,
  listComplaints,
  getComplaint,
  getComplaintPosition,
  getComplaintEvents,
  reprocessComplaint,
} from '../api/complaints';
import { CreateComplaintFormData, ComplaintResponse, ComplaintDetailResponse, StatusHistoryResponse } from '../types/complaint';
import { QueuePositionResponse } from '../types/queue';

export function useUserComplaints(filters?: { status?: string; ai_status?: string }) {
  return useQuery<ComplaintResponse[]>({
    queryKey: ['complaints', 'user', filters],
    queryFn: () => listComplaints(filters),
  });
}

export function useComplaintDetail(id: string | undefined) {
  return useQuery<ComplaintDetailResponse>({
    queryKey: ['complaints', 'detail', id],
    queryFn: () => {
      if (!id) throw new Error('Complaint ID required');
      return getComplaint(id);
    },
    enabled: Boolean(id),
    // Polling fallback: if AI is PENDING or PROCESSING, poll every 2.5 seconds
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.ai_status === 'PENDING' || data.ai_status === 'PROCESSING')) {
        return 2500;
      }
      return false;
    },
  });
}

export function useComplaintPosition(id: string | undefined, enabled = true) {
  return useQuery<QueuePositionResponse>({
    queryKey: ['complaints', 'position', id],
    queryFn: () => {
      if (!id) throw new Error('Complaint ID required');
      return getComplaintPosition(id);
    },
    enabled: Boolean(id) && enabled,
    refetchInterval: 10000,
  });
}

export function useComplaintEvents(id: string | undefined) {
  return useQuery<StatusHistoryResponse[]>({
    queryKey: ['complaints', 'events', id],
    queryFn: () => {
      if (!id) throw new Error('Complaint ID required');
      return getComplaintEvents(id);
    },
    enabled: Boolean(id),
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation<ComplaintResponse, Error, CreateComplaintFormData>({
    mutationFn: (formData) => createComplaint(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
    },
  });
}

export function useReprocessComplaint() {
  const queryClient = useQueryClient();

  return useMutation<ComplaintResponse, Error, string>({
    mutationFn: (id) => reprocessComplaint(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['complaints', 'detail', data.id] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'queue'] });
    },
  });
}
