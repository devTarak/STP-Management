import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/utils/errorHandler';

export function useApiQuery({ queryKey, queryFn, options = {} }) {
  return useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const res = await queryFn({ signal });
      return res?.data ?? res;
    },
    ...options,
  });
}

export function useApiMutation({ mutationFn, onSuccess, onError, options = {} }) {
  return useMutation({
    mutationFn: async (variables) => {
      const res = await mutationFn(variables);
      return res?.data ?? res;
    },
    onSuccess: (data, variables, context) => {
      if (onSuccess) {
        onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      const message = getErrorMessage(error);
      const status = error?.response?.status || error?.status;
      if (status === 403) {
        toast.error(message || 'Access denied. Insufficient permissions.');
      } else if (message !== 'Authentication required.') {
        toast.error(message);
      }
      if (onError) {
        onError(error, variables, context);
      }
    },
    ...options,
  });
}
