import { useQuery, useQueryClient } from '@tanstack/react-query';
import { siteSettingService } from '@/services/siteSettingService';
import { useApiMutation } from '@/hooks/useApiQuery';
import toast from 'react-hot-toast';

export function useSiteSettings() {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async ({ signal }) => {
      const res = await siteSettingService.get();
      return res?.data ?? res;
    },
  });
}

export function useUpdateSiteSettings() {
  const queryClient = useQueryClient();
  return useApiMutation({
    mutationFn: (data) => siteSettingService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
      toast.success('Site settings updated successfully.');
    },
  });
}
