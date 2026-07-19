import { useQuery } from '@tanstack/react-query';
import { bdAddressService } from '@/services/bdAddressService';

export function useDivisions() {
  return useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const res = await bdAddressService.getDivisions();
      return res?.data ?? res;
    },
    staleTime: Infinity,
  });
}

export function useDistricts(divisionId) {
  return useQuery({
    queryKey: ['districts', divisionId],
    queryFn: async () => {
      const res = await bdAddressService.getDistricts(divisionId);
      return res?.data ?? res;
    },
    enabled: !!divisionId,
    staleTime: Infinity,
  });
}

export function useUpazilas(districtId) {
  return useQuery({
    queryKey: ['upazilas', districtId],
    queryFn: async () => {
      const res = await bdAddressService.getUpazilas(districtId);
      return res?.data ?? res;
    },
    enabled: !!districtId,
    staleTime: Infinity,
  });
}
