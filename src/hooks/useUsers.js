import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { useApiMutation } from '@/hooks/useApiQuery';
import toast from 'react-hot-toast';

export function useUsers(params = {}) {
  const stableKey = JSON.stringify(params);
  return useQuery({
    queryKey: ['users', stableKey],
    queryFn: async ({ signal }) => {
      const res = await userService.getAll(params);
      return res?.data ?? res;
    },
  });
}

export function useUser(id) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await userService.getById(id);
      return res?.data ?? res;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (data) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully.');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: ({ id, data }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('User updated successfully.');
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (id) => userService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (id) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully.');
    },
  });
}
