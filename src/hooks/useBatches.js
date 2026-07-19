import { useQuery, useQueryClient } from '@tanstack/react-query';
import { batchService } from '@/services/batchService';
import { useApiMutation } from '@/hooks/useApiQuery';
import toast from 'react-hot-toast';

export function useBatches(params = {}) {
  const stableKey = JSON.stringify(params);
  return useQuery({
    queryKey: ['batches', stableKey],
    queryFn: async ({ signal }) => {
      const res = await batchService.getAll(params);
      return res?.data ?? res;
    },
  });
}

export function useBatch(id) {
  return useQuery({
    queryKey: ['batch', id],
    queryFn: async ({ signal }) => {
      const res = await batchService.getById(id);
      return res?.data ?? res;
    },
    enabled: !!id,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (data) => batchService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch created successfully.');
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => batchService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batch'] });
      toast.success('Batch updated successfully.');
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (id) => batchService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch deleted successfully.');
    },
  });
}
