import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStaffMe,
  getStaffQueue,
  getStaffComplaint,
  updateStaffComplaintStatus,
  getStaffHistory,
} from '../api/staff';
import { QueueListResponse } from '../types/queue';
import { ComplaintResponse, ComplaintDetailResponse, StatusUpdateRequest } from '../types/complaint';
import { StaffPublic } from '../types/auth';

export function useStaffMe() {
  return useQuery<StaffPublic>({
    queryKey: ['staff', 'me'],
    queryFn: getStaffMe,
  });
}

export function useStaffQueue() {
  return useQuery<QueueListResponse>({
    queryKey: ['staff', 'queue'],
    queryFn: getStaffQueue,
    refetchInterval: 15000,
  });
}

export function useStaffComplaint(id: string | undefined) {
  return useQuery<ComplaintDetailResponse>({
    queryKey: ['staff', 'complaint', id],
    queryFn: () => {
      if (!id) throw new Error('Complaint ID required');
      return getStaffComplaint(id);
    },
    enabled: Boolean(id),
  });
}

export function useStaffHistory() {
  return useQuery<ComplaintResponse[]>({
    queryKey: ['staff', 'history'],
    queryFn: getStaffHistory,
  });
}

export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    ComplaintResponse,
    Error,
    { complaintId: string; payload: StatusUpdateRequest }
  >({
    mutationFn: ({ complaintId, payload }) =>
      updateStaffComplaintStatus(complaintId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'complaint', variables.complaintId] });
      queryClient.invalidateQueries({ queryKey: ['staff', 'history'] });
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
