import { baseApi } from "@/lib/api/baseApi";
import type { Alert, GetAlertsParams, ResolveAlertRequest, AssignAlertRequest } from "../types/alert";

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
    
    addAlertNote: builder.mutation<Alert, { alertId: number; note: string }>({
      query: ({ alertId, note }) => ({
        url: `/alerts/${alertId}/notes`,
        method: "POST",
        body: { note },
      }),
      invalidatesTags: ["Alerts"],
    }),

    resolveAlert: builder.mutation<Alert, ResolveAlertRequest>({
      query: ({ alertId, ...body }) => ({
        url: `/alerts/${alertId}/resolve`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Alerts"],
    }),

    assignAlert: builder.mutation<Alert, AssignAlertRequest>({
      query: ({ alertId, ...body }) => ({
        url: `/alerts/${alertId}/assign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Alerts"],
    }),
  }),
});


export const {
  useGetAlertsQuery,
  useGetAlertByIdQuery,
  useAcknowledgeAlertMutation,
  useResolveAlertMutation,
  useAddAlertNoteMutation,
  useAssignAlertMutation,
} = alertsApi;