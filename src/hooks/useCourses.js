import { useQuery, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/services/courseService';
import { useApiMutation } from '@/hooks/useApiQuery';
import toast from 'react-hot-toast';

export function useCourses(params = {}) {
  const stableKey = JSON.stringify(params);
  return useQuery({
    queryKey: ['courses', stableKey],
    queryFn: async ({ signal }) => {
      const res = await courseService.getAll(params);
      return res?.data ?? res;
    },
  });
}

export function useCourse(id) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async ({ signal }) => {
      const res = await courseService.getById(id);
      return res?.data ?? res;
    },
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (data) => courseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully.');
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => courseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      toast.success('Course updated successfully.');
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (id) => courseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully.');
    },
  });
}
