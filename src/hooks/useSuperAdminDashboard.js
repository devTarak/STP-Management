import { useQuery } from '@tanstack/react-query';
import { superAdminDashboardService } from '@/services/superAdminDashboardService';

function unwrap(res) {
  return res?.data ?? res;
}

export function useSuperAdminDashboardSummary() {
  return useQuery({
    queryKey: ['super-admin', 'dashboard', 'summary'],
    queryFn: async ({ signal }) => unwrap(await superAdminDashboardService.getSummary({ signal })),
    staleTime: 0,
  });
}
