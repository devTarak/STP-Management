import { useQuery } from '@tanstack/react-query';
import { activityLogService } from '@/services/activityLogService';

export function useActivityLogs(params = {}) {
  const stableKey = JSON.stringify(params);
  return useQuery({
    queryKey: ['activityLogs', stableKey],
    queryFn: async ({ signal }) => {
      const res = await activityLogService.getAll(params);
      return res?.data ?? res;
    },
  });
}

export function useActivityLog(id) {
  return useQuery({
    queryKey: ['activityLog', id],
    queryFn: async () => {
      const res = await activityLogService.getById(id);
      return res?.data ?? res;
    },
    enabled: !!id,
  });
}
