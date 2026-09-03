import { apiClient } from './client';
import { SystemStatsResponse } from '../types/stats';

export async function getSystemSummary(): Promise<SystemStatsResponse> {
  return apiClient<SystemStatsResponse>('/api/v1/stats/summary', {
    method: 'GET',
  });
}
