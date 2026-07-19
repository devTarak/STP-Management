import { useQuery, useQueryClient } from '@tanstack/react-query';
import { instituteService } from '@/services/instituteService';
import { useApiMutation } from '@/hooks/useApiQuery';
import toast from 'react-hot-toast';

export function useInstitutes(params = {}) {
  const stableKey = JSON.stringify(params);
  return useQuery({
    queryKey: ['institutes', stableKey],
    queryFn: async () => {
      const res = await instituteService.getAll(params);
      return res?.data ?? res;
    },
    staleTime: 0,
  });
}

export function useInstitute(id) {
  return useQuery({
    queryKey: ['institute', id],
    queryFn: async () => {
      const res = await instituteService.getById(id);
      return res?.data ?? res;
    },
    enabled: !!id,
    staleTime: 0,
  });
}

export function useInstituteStats(id) {
  return useQuery({
    queryKey: ['institute', id, 'stats'],
    queryFn: async () => {
      const res = await instituteService.getStats(id);
      return res?.data ?? res;
    },
    enabled: !!id,
  });
}

export function useCreateInstitute() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (data) => instituteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutes'] });
      toast.success('Institute created successfully.');
    },
  });
}

export function useUpdateInstitute() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => instituteService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutes'] });
      queryClient.invalidateQueries({ queryKey: ['institute'] });
      toast.success('Institute updated successfully.');
    },
  });
}

export function useToggleInstituteStatus() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (id) => instituteService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutes'] });
    },
  });
}

export function useDeleteInstitute() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (id) => instituteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutes'] });
      toast.success('Institute deleted successfully.');
    },
  });
}
