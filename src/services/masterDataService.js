import { sharedGet } from './sharedGet';

export const masterDataService = {
  subjects: async () => (await sharedGet('/subjects')).data,
  levels: async () => (await sharedGet('/education-levels')).data,
  banners: async () => (await sharedGet('/banners')).data,
  provinces: async () => (await sharedGet('/administrative-areas/provinces')).data,
  districts: async (id) => (await sharedGet(`/administrative-areas/districts/${id}`)).data,
  wards: async (id) => (await sharedGet(`/administrative-areas/wards/${id}`)).data,
  provider: async (id) => (await sharedGet(`/providers/${id}`)).data,
};
