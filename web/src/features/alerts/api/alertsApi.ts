import { baseApi } from '@/lib/api/baseApi';

export const alertsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAlerts: builder.query<any[], void>({
      query: () => '/alerts',
    }),
  }),
});

export const { useGetAlertsQuery } = alertsApi;