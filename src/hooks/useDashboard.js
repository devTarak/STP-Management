import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

function unwrap(res) {
  return res?.data ?? res;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async ({ signal }) => unwrap(await dashboardService.getSummary({ signal })),
    staleTime: 0,
  });
}

export function useDashboardCourses() {
  return useQuery({
    queryKey: ['dashboard', 'courses'],
    queryFn: async ({ signal }) => unwrap(await dashboardService.getCourses({ signal })),
  });
}

export function useDashboardBatches() {
  return useQuery({
    queryKey: ['dashboard', 'batches'],
    queryFn: async ({ signal }) => unwrap(await dashboardService.getBatches({ signal })),
  });
}

export function useDashboardRecentActivity(params = {}) {
  return useQuery({
    queryKey: ['dashboard', 'recent-activity', params],
    queryFn: async ({ signal }) => {
      const res = await dashboardService.getRecentActivity(params, { signal });
      return { items: res?.data ?? [], total: res?.pagination?.total ?? 0 };
    },
  });
}

export function useDashboardRegistrationTrend() {
  return useQuery({
    queryKey: ['dashboard', 'registration-trend'],
    queryFn: async ({ signal }) => unwrap(await dashboardService.getRegistrationTrend({ signal })),
  });
}
