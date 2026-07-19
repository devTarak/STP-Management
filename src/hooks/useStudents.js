import { useQuery, useQueryClient } from '@tanstack/react-query';
import { studentService } from '@/services/studentService';
import { useApiMutation } from '@/hooks/useApiQuery';
import toast from 'react-hot-toast';

export function useStudents(params = {}) {
  const stableKey = JSON.stringify(params);
  return useQuery({
    queryKey: ['students', stableKey],
    queryFn: async ({ signal }) => {
      const res = await studentService.getAll(params, { signal });
      return res?.data ?? res;
    },
  });
}

export function useStudent(id) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: async ({ signal }) => {
      const res = await studentService.getById(id, { signal });
      return res?.data ?? res;
    },
    enabled: !!id,
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => studentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student'] });
      toast.success('Student updated successfully.');
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (id) => studentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully.');
    },
  });
}

export function useUpdateStudentStatus() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => studentService.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student'] });
    },
  });
}
