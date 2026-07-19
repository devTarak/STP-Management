import { useQuery } from '@tanstack/react-query';
import { mediaService } from '@/services/mediaService';

export function useMedia(params = {}) {
  const stableKey = JSON.stringify(params);
  return useQuery({
    queryKey: ['media', stableKey],
    queryFn: async ({ signal }) => {
      const res = await mediaService.getAll(params);
      return res?.data ?? res;
    },
  });
}
