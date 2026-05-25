import { baseApi } from "@/lib/api/baseApi";
import type { Alert, GetAlertsParams } from "../types/alert";

export const alertsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getAlerts: builder.query<Alert[], GetAlertsParams | void>({
      query: (params) => ({
        url: "/alerts",
        params: params ?? {}
      }),
      providesTags: ["Alerts"],
    }),

    getAlertById: builder.query<Alert, number>({
      query: (id) => `/alerts/${id}`,
      providesTags: ["Alerts"],
    }),

    acknowledgeAlert: builder.mutation<Alert, number>({
      query: (id) => ({
        url: `/alerts/${id}/acknowledge`,
        method: "POST",
      }),
      invalidatesTags: ["Alerts"],
    }),
  }),
});

export const {
  useGetAlertsQuery,
  useGetAlertByIdQuery,
  useAcknowledgeAlertMutation,
} = alertsApi;